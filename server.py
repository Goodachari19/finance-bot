#!/usr/bin/env python3
"""
Finance BOT — Python Dev Proxy Server
Run with: python3 server.py
Serves app at http://localhost:4000, DB API, and proxies Yahoo Finance.
"""

# Override sqlite3 with pysqlite3 for ChromaDB compatibility on Render
try:
    __import__('pysqlite3')
    import sys
    sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
except ImportError:
    pass

import http.server
import urllib.request
import urllib.error
import os
import json
import sys
import mimetypes
import sqlite3
import subprocess
import threading
import xml.etree.ElementTree as ET
import time
import re
import html
import math

PORT = int(os.environ.get('PORT', 4000))
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH    = os.path.join(PROJECT_DIR, 'data', 'marketpulse.db')
SCHEMA_PATH = os.path.join(PROJECT_DIR, 'db', 'schema.sql')
FETCH_SCRIPT = os.path.join(PROJECT_DIR, 'db', 'fetch_stocks.py')
KNOWLEDGE_DOCS_PATH = os.path.join(PROJECT_DIR, 'knowledge_docs.json')

def init_db():
    """Bootstrap the marketpulse.db from schema.sql idempotently."""
    try:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        if os.path.exists(SCHEMA_PATH):
            with open(SCHEMA_PATH, 'r') as f:
                conn.executescript(f.read())
        
        # Seed InvestCircle Experts if empty
        count = conn.execute('SELECT COUNT(*) FROM ic_experts').fetchone()[0]
        if count == 0:
            experts = [
                ('Rakesh Mehta', 'RM', '#7c8cf8', 'Senior Investment Advisor', 'Mehta Capital Advisory', '📍 Mumbai, Maharashtra', 1, 'INA000012345', 15, 'value,sebi', 'Value Investing,Large Cap Equity,Equity Research,Fundamental Analysis', '[{"label":"CFA","cls":"blue"},{"label":"SEBI RIA","cls":"sebi"},{"label":"MBA Finance","cls":""}]', '23.4%', '12.4K', 234, '68%', '15+ years of deep experience in equity research and value investing across BSE & NSE. Former lead analyst at HDFC Securities.'),
                ('Priya Sharma', 'PS', '#00d68f', 'Certified Financial Planner', 'WealthWise India', '📍 Bengaluru, Karnataka', 1, 'INA000067890', 10, 'mutual,sebi', 'Mutual Funds,Goal-Based Planning,SIP Strategy,Retirement Planning', '[{"label":"CFP","cls":""},{"label":"SEBI RIA","cls":"sebi"},{"label":"AMFI ARN","cls":"blue"}]', '18.2%', '8.7K', 156, '74%', 'Helping individuals and families build long-term wealth through disciplined, goal-based financial planning.'),
                ('Arjun Kapoor', 'AK', '#f0c040', 'Technical Analyst & Swing Trader', 'IndependentTrader.in', '📍 Delhi NCR', 1, 'INA000034521', 8, 'technical,sebi', 'Technical Analysis,Swing Trading,Price Action,Breakout Trading', '[{"label":"CMT Lvl 2","cls":"blue"},{"label":"SEBI RIA","cls":"sebi"},{"label":"NISM TA","cls":""}]', '31.5%', '24.1K', 412, '62%', 'Full-time swing trader with 8 years on Dalal Street. CMT Level 2 certified.'),
                ('Ananya Singh', 'AS', '#ff8c42', 'Derivatives & Options Strategist', 'OptionsEdge Advisory', '📍 Pune, Maharashtra', 0, None, 6, 'options', 'F&O Strategies,Iron Condor,Options Selling,Hedging', '[{"label":"NISM Derivatives","cls":""},{"label":"CMT Level 1","cls":"blue"},{"label":"CA Inter","cls":""}]', '42.1%', '16.3K', 287, '71%', 'Options trader specializing in income-generating derivatives strategies — iron condors, strangles, and credit spreads.'),
                ('Dr. Vikram Nair', 'VN', '#38bdf8', 'Quantitative Analyst & Algo Trader', 'QuantAlpha Research', '📍 Hyderabad, Telangana', 1, 'INA000089123', 12, 'quant,sebi', 'Algorithmic Trading,Quant Strategies,Machine Learning in Finance,Factor Investing', '[{"label":"PhD Finance IIT-B","cls":"blue"},{"label":"CFA","cls":"blue"},{"label":"SEBI RIA","cls":"sebi"},{"label":"FRM","cls":""}]', '38.7%', '31.2K', 89, '79%', 'PhD in Finance from IIT Bombay. Built and deployed 15+ live algorithmic trading strategies.')
            ]
            conn.executemany(
                'INSERT INTO ic_experts (name, initials, color, title, firm, location, verified, sebiReg, experience, filterTags, specializations, certifications, returns, followers, recommendations, winRate, bio) '
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                experts
            )
        
        # Seed Initial Posts if empty
        post_count = conn.execute('SELECT COUNT(*) FROM ic_posts').fetchone()[0]
        if post_count == 0:
            posts = [
                ('Arjun Kapoor', 'Technical Analyst', '📈 Nifty forming a symmetrical triangle on the daily. Breakout above 22,450 targets 23,100. #TechnicalAnalysis', 'Technical'),
                ('Rakesh Mehta', 'Investment Advisor', '🎯 HDFC Bank at current levels looks very attractive. P/E at 5-year lows. #ValueInvesting', 'Fundamental'),
                ('Ananya Singh', 'Options Strategist', '⚡ Sold BankNifty strangle for ₹320 premium. Target 50% collection. #Options', 'Derivatives'),
                ('Priya Sharma', 'Financial Planner', '💡 Reminder: Time in market beats timing the market. #SIPLife #Compounding', 'Education')
            ]
            conn.executemany(
                'INSERT INTO ic_posts (author_name, author_role, content, category) VALUES (?, ?, ?, ?)',
                posts
            )
        
        conn.commit()
        conn.close()
        print(f'[DB] ✅ marketpulse.db schema verified/updated at {DB_PATH}')
    except Exception as e:
        print(f'[DB] ⚠️ Failed to verify schema: {e}')

# ════════════════════════════════════════════════════════════════
# RAG ENGINE — True Retrieval-Augmented Generation
# Uses Google text-embedding-004 for embeddings + cosine similarity
# vector search + Gemini Flash for generation. No extra packages.
# ════════════════════════════════════════════════════════════════

class RAGEngine:
    """
    ChromaDB-backed vector-search RAG engine.
    - Loads all knowledge articles from knowledge_docs.json
    - Fetches live stock data from SQLite DB
    - Embeds documents using LOCAL sentence-transformers (all-MiniLM-L6-v2) 
    - Upserts embeddings into local ChromaDB
    - On query: embed query locally → ChromaDB retrieve top-K → Gemini generation
    """

    def __init__(self):
        self._docs = []  # Fallback for original API interface
        self._chroma_client = None
        self._collection = None
        self._cache = None
        self._embedder = None
        self._ready   = False
        self._lock    = threading.Lock()

    # ── public ────────────────────────────────────────────────────
    def initialise(self, api_key: str = ""):
        """Load docs and build the vector index. Uses ChromaDB upsert."""
        with self._lock:
            if self._ready:
                return

            if os.environ.get('RENDER') == 'true':
                print("[RAG] ℹ️ Running on Render. Local embedding model disabled to save memory.", file=sys.stderr, flush=True)
                self._ready = False
                return

            print("[RAG] Lazy loading chromadb and sentence-transformers...")
            try:
                import chromadb
                from sentence_transformers import SentenceTransformer
            except Exception as e:
                print(f"[RAG] ⚠️ RAG libraries could not be loaded: {e}", file=sys.stderr, flush=True)
                self._ready = False
                return

            try:
                chroma_path = os.path.join(PROJECT_DIR, 'db', 'chroma_store')
                self._chroma_client = chromadb.PersistentClient(path=chroma_path)
                self._collection = self._chroma_client.get_or_create_collection(name="finbot_rag_collection")
                self._cache = self._chroma_client.get_or_create_collection(name="finbot_semantic_cache")
            except Exception as e:
                print(f"[RAG] ⚠️ ChromaDB initialization failed: {e}", file=sys.stderr, flush=True)
                self._ready = False
                return

            # Load local embedding model (free, no API keys needed)
            try:
                print("[RAG] Loading local embedding model (sentence-transformers)...")
                self._embedder = SentenceTransformer('all-MiniLM-L6-v2')
            except Exception as e:
                print(f"[RAG] Failed to load local embedder: {e}", file=sys.stderr, flush=True)
                self._embedder = None
                self._ready = False
                return
                
            if not self._embedder:
                print('[RAG] ⚠️ Local Embedder not loaded — RAG engine inactive', file=sys.stderr, flush=True)
                self._ready = False
                return
                
            print('[RAG] Building/Updating ChromaDB vector index…')
            docs = self._load_docs()
            self._docs = docs
            print(f'[RAG] Loaded {len(docs)} documents')
            
            # Embed all documents locally
            texts_to_embed = [doc['content'] for doc in docs]
            try:
                print(f'[RAG] Embedding {len(texts_to_embed)} documents locally...')
                vectors = self._embedder.encode(texts_to_embed).tolist()
                
                # Format for ChromaDB
                ids = [doc['id'] for doc in docs]
                texts = [doc['content'] for doc in docs]
                metadatas = [{"title": doc['title'], "source": doc['source']} for doc in docs]
                
                # Upsert into ChromaDB
                self._collection.upsert(
                    ids=ids,
                    embeddings=vectors,
                    documents=texts,
                    metadatas=metadatas
                )
                self._ready = True
                print(f'[RAG] ✅ ChromaDB Index ready — {self._collection.count()} docs in collection')
            except Exception as e:
                print(f'[RAG] ⚠️ Embedding failed: {e}', file=sys.stderr, flush=True)
                self._ready = False

    def is_ready(self):
        return self._ready

    def answer(self, query: str, api_key: str, model: str, stock_context: str = '', mode: str = 'education') -> dict:
        """Full RAG pipeline: retrieve via Chroma → augment → generate."""
        if not self._ready:
            self.initialise(api_key)

        # Fallback if RAG is NOT ready
        if not self._ready or not self._embedder:
            print("[RAG] ⚠️ RAG engine is inactive/uninitialized. Falling back to direct model generation.", file=sys.stderr, flush=True)
            context_parts = []
            if stock_context:
                context_parts.append(f"[Live Stock Data]\n{stock_context}")
            context_str = '\n\n---\n\n'.join(context_parts)

            if mode == 'prediction':
                system_prompt = (
                    "You are an elite quantitative AI stock market analyst for the Indian Market. "
                    "The user is asking for price predictions, technical breakdowns, or analytical forecasts. "
                    "HEAVILY prioritize analyzing the LIVE DATA provided over standard textbook definitions. "
                    "Give a definitive bullish, bearish, or neutral thesis based on P/E ratios, 52-week trends, and fundamentals. "
                    "Always include a disclaimer that you are not a licensed financial advisor."
                )
            else:
                system_prompt = (
                    "You are a knowledgeable, friendly stock market educator and analyst specializing in the Indian stock market (NSE/BSE). "
                    "Your role is to answer investor questions clearly and honestly — from absolute beginners to advanced traders. "
                    "Focus on teaching rules, policies, indicators, and market vocabulary. "
                    "Format your response in clean markdown with bold for key terms, bullet points for lists, and plain language. "
                    "Always end with a practical educational tip."
                )

            prompt = f"""CONTEXT DOCUMENTS:
(No offline reference documents are available. Answer using your financial knowledge.)
{context_str}

---

USER QUESTION: {query}

Provide a comprehensive, accurate answer. Be helpful, educational, and India-market-specific."""

            try:
                answer_text = self._generate(prompt, system_prompt, api_key, model)
                return {
                    'answer': answer_text,
                    'sources': ['Direct AI Generation (No local vector DB reference)'],
                    'total_docs_searched': 0,
                    'top_k_retrieved': 0
                }
            except Exception as e:
                return {'error': f'Generation failed: {e}'}

        # 1. Embed the query locally using loaded model
        try:
            q_vec = self._embedder.encode([query]).tolist()[0]
        except Exception as e:
             return {'error': f'Local embedding failed: {e}'}

        # 🚀 [SEMANTIC CACHING] Check if this query was asked before!
        try:
            cache_hit = self._cache.query(query_embeddings=[q_vec], n_results=1)
            # Distance near 0 means almost identical query (e.g. "What is PE" vs "whats pe")
            if cache_hit['distances'] and len(cache_hit['distances'][0]) > 0:
                dist = cache_hit['distances'][0][0]
                if dist < 0.12:  # Threshold for semantic equivalence
                    cached_answer = cache_hit['metadatas'][0][0]['answer']
                    print(f"[RAG] ⚡ SEMANTIC CACHE HIT (Distance {dist:.3f})! Bypassed API Quota.")
                    return {
                        'answer':  cached_answer,
                        'sources': ['⚡ Semantic Cache Hit (Bypassed API Generation)'],
                        'total_docs_searched': self._collection.count(),
                        'top_k_retrieved': 0
                    }
        except Exception as e:
            print(f"[RAG] Cache lookup ignored: {e}")

        # 2. Retrieve top-2 similar docs from ChromaDB, filtered by Mode
        search_filter = None
        if mode == 'education':
            search_filter = {"source": "Finance Knowledge Base"}
        elif mode == 'prediction':
            search_filter = {"source": "Live Stock Database"}
            
        results = self._collection.query(
            query_embeddings=[q_vec],
            n_results=2,
            where=search_filter
        )

        top_docs_info = []
        context_parts = []
        
        if results['documents'] and len(results['documents'][0]) > 0:
            for rank in range(len(results['documents'][0])):
                content = results['documents'][0][rank]
                metadata = results['metadatas'][0][rank]
                distance = results['distances'][0][rank] if 'distances' in results and results['distances'] else 0.0
                
                title = metadata.get('title', 'Unknown')
                source = metadata.get('source', 'Unknown')
                top_docs_info.append(title)
                
                context_parts.append(
                    f"[Doc {rank+1} — {title} | Source: {source} | Distance: {distance:.4f}]\n{content}"
                )

        if stock_context:
            context_parts.insert(0, f"[Live Stock Data]\n{stock_context}")

        context_str = '\n\n---\n\n'.join(context_parts)

        # 4. Generate with API provider based on Mode
        if mode == 'prediction':
            system_prompt = (
                "You are an elite quantitative AI stock market analyst for the Indian Market. "
                "The user is asking for price predictions, technical breakdowns, or analytical forecasts. "
                "HEAVILY prioritize analyzing the LIVE DATA provided over standard textbook definitions. "
                "Give a definitive bullish, bearish, or neutral thesis based on P/E ratios, 52-week trends, and fundamentals. "
                "Always include a disclaimer that you are not a licensed financial advisor."
            )
        else:
            system_prompt = (
                "You are a knowledgeable, friendly stock market educator and analyst specializing in the Indian stock market (NSE/BSE). "
                "Your role is to answer investor questions clearly and honestly — from absolute beginners to advanced traders. "
                "Focus on teaching rules, policies, indicators, and market vocabulary. "
                "Format your response in clean markdown with bold for key terms, bullet points for lists, and plain language. "
                "Always end with a practical educational tip."
            )

        prompt = f"""CONTEXT DOCUMENTS (use these as your primary knowledge source):
{context_str}

---

USER QUESTION: {query}

Provide a comprehensive, accurate answer based on the context above. Be helpful, educational, and India-market-specific."""

        answer_text = self._generate(prompt, system_prompt, api_key, model)

        # 🚀 [RAW DATABASE EXTRACTION FALLBACK] 
        # If Google Gemini blocks the request (e.g. 429 Quota Error limit), we intercept the crash.
        # Instead of hallucinating with a weak offline LLM, we brutally extract and print the highest-confidence raw chunk!
        if "RATE_LIMIT_EXCEEDED" in answer_text:
            print("[RAG] API Quota Reached! Triggering Native Raw Database Fallback.")
            if results and 'documents' in results and len(results['documents'][0]) > 0:
                raw_chunk = results['documents'][0][0]
                chunk_title = results['metadatas'][0][0].get('title', 'Knowledge Base')
                answer_text = (
                    f"⚡ **Generated Locally (Bypassed Cloud API Quotas):**\n\n"
                    f"**{chunk_title}**\n\n> {raw_chunk.replace(chr(10), chr(10)+'> ')}"
                )
            else:
                answer_text = "⚡ **Generated Locally (Bypassed Cloud API Quotas):**\n\nNo relevant data found in offline memory to answer this question."

        # 🚀 [SEMANTIC CACHING] Store successful generation
        if not answer_text.startswith("⚠️") and not answer_text.startswith("Generation error"):
            try:
                import uuid
                self._cache.add(
                    ids=[str(uuid.uuid4())],
                    embeddings=[q_vec],
                    documents=[query],
                    metadatas=[{'answer': answer_text}]
                )
            except Exception:
                pass

        return {
            'answer':  answer_text,
            'sources': top_docs_info,
            'total_docs_searched': self._collection.count(),
            'top_k_retrieved': len(top_docs_info)
        }

    # ── private helpers ───────────────────────────────────────────
    def _chunk_text(self, text: str, chunk_size=300, chunk_overlap=50) -> list:
        """
        Advanced recursive character text splitter.
        Attempts to split by double newline, then single newline, then space.
        """
        if len(text) <= chunk_size:
            return [text]
            
        separators = ["\n\n", "\n", ". ", " "]
        
        for sep in separators:
            if sep in text:
                splits = text.split(sep)
                chunks = []
                current_chunk = ""
                for s in splits:
                    if len(current_chunk) + len(s) + len(sep) > chunk_size:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                        # If a single split is larger than chunk_size, we might need to split it further
                        # In this simple implementation, we just start a new chunk
                        if len(s) > chunk_size:
                            # Force split large blocks
                            s_chunks = [s[i:i+chunk_size] for i in range(0, len(s), chunk_size - chunk_overlap)]
                            chunks.extend(s_chunks[:-1])
                            current_chunk = s_chunks[-1] if s_chunks else ""
                        else:
                            current_chunk = s
                    else:
                        current_chunk += (sep + s) if current_chunk else s
                if current_chunk:
                    chunks.append(current_chunk.strip())
                
                # Apply overlap handling
                final_chunks = []
                for i in range(len(chunks)):
                    if i == 0:
                        final_chunks.append(chunks[i])
                    else:
                        # Prepend overlap from previous chunk
                        overlap_text = chunks[i-1][-chunk_overlap:] if len(chunks[i-1]) > chunk_overlap else chunks[i-1]
                        # Only add overlap if it doesn't break sentences awkwardly
                        overlap_idx = overlap_text.rfind(". ")
                        if overlap_idx != -1:
                             overlap_text = overlap_text[overlap_idx+2:]
                        final_chunks.append(overlap_text + " " + chunks[i])
                        
                return final_chunks
                
        # Fallback to absolute strict character slicing
        return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size - chunk_overlap)]

    def _load_docs(self) -> list:
        raw_docs = []

        # Load from knowledge_docs.json
        try:
            with open(KNOWLEDGE_DOCS_PATH, encoding='utf-8') as f:
                articles = json.load(f)
            for a in articles:
                raw_docs.append({
                    'id':      a.get('id', ''),
                    'title':   a.get('title', ''),
                    'content': f"{a.get('title','')}\n\nCategory: {a.get('category','')} | Level: {a.get('level','')}\nTags: {', '.join(a.get('tags', []))}\n\n{a.get('content', '')}",
                    'source':  'Finance Knowledge Base'
                })
        except Exception as e:
            print(f'[RAG] knowledge_docs.json load error: {e}')

        # Load stock fundamentals from SQLite
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            rows = conn.execute('SELECT * FROM stocks').fetchall()
            conn.close()
            for row in rows:
                r = dict(row)
                content = (
                    f"Stock: {r['name']} ({r['ticker']}) — {r['sector']} sector on {r['exchange']}.\n"
                    f"Current Price: ₹{r.get('price', 'N/A')} | Market Cap: {r.get('market_cap', 'N/A')}\n"
                    f"P/E Ratio: {r.get('pe_ratio', 'N/A')} | P/B Ratio: {r.get('pb_ratio', 'N/A')}\n"
                    f"52-Week High: ₹{r.get('high_52w', 'N/A')} | 52-Week Low: ₹{r.get('low_52w', 'N/A')}\n"
                    f"EPS: {r.get('eps', 'N/A')} | ROE: {r.get('roe', 'N/A')} | Debt/Equity: {r.get('debt_equity', 'N/A')}\n"
                    f"Dividend Yield: {r.get('div_yield', 'N/A')}\n"
                    f"About: {r.get('about', 'N/A')}"
                )
                raw_docs.append({
                    'id':      f"stock_{r['ticker']}",
                    'title':   f"{r['name']} ({r['ticker']}) Stock Data",
                    'content': content,
                    'source':  'Live Stock Database'
                })
        except Exception as e:
            print(f'[RAG] SQLite load error: {e}')

        # Apply Chunking
        chunked_docs = []
        for doc in raw_docs:
            chunks = self._chunk_text(doc['content'], chunk_size=1500, chunk_overlap=150)
            if len(chunks) == 1:
                chunked_docs.append(doc)
            else:
                for i, chunk_text in enumerate(chunks):
                    chunked_docs.append({
                        'id': f"{doc['id']}_chunk_{i+1}",
                        'title': doc['title'] + f" (Part {i+1})",
                        'content': chunk_text,
                        'source': doc['source']
                    })

        return chunked_docs

    def _generate(self, prompt: str, system_prompt: str, api_key: str, model: str) -> str:
        """Call Gemini API for the final answer generation."""
        # Support Gemini, Claude, and OpenAI — detect by model name
        model_lower = model.lower()

        if 'claude' in model_lower:
            return self._generate_anthropic(prompt, system_prompt, api_key, model)
        elif 'gpt' in model_lower or 'openai' in model_lower:
            return self._generate_openai(prompt, system_prompt, api_key, model)
        else:
            return self._generate_gemini(prompt, system_prompt, api_key, model)

    def _generate_gemini(self, prompt, system_prompt, api_key, model):
        import time
        model_id = model if '/' in model else f'models/{model}'
        url = f'https://generativelanguage.googleapis.com/v1beta/{model_id}:generateContent?key={api_key}'
        body = json.dumps({
            'system_instruction': {'parts': [{'text': system_prompt}]},
            'contents': [{'role': 'user', 'parts': [{'text': prompt}]}],
            'generationConfig': {'temperature': 0.3, 'maxOutputTokens': 1024}
        }).encode()
        
        # Exponential backoff parameters
        max_retries = 3
        base_delay = 2 # seconds
        
        for attempt in range(max_retries):
            try:
                req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'}, method='POST')
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = json.loads(resp.read())
                return data['candidates'][0]['content']['parts'][0]['text']
            except urllib.error.HTTPError as e:
                if e.code == 429 and attempt < max_retries - 1:
                    sleep_time = base_delay * (2 ** attempt)
                    print(f"[RAG] ⚠️ Gemini 429 Rate Limit Hit. Retrying in {sleep_time}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(sleep_time)
                    continue
                elif e.code == 429:
                    return "⚠️ RATE_LIMIT_EXCEEDED ⚠️"
                return f"Generation error: HTTP {e.code} - {e.reason}"
            except Exception as e:
                return f'Generation error: {e}'

    def _generate_anthropic(self, prompt, system_prompt, api_key, model):
        url = 'https://api.anthropic.com/v1/messages'
        body = json.dumps({
            'model': model,
            'max_tokens': 1024,
            'system': system_prompt,
            'messages': [{'role': 'user', 'content': prompt}]
        }).encode()
        try:
            req = urllib.request.Request(url, data=body, headers={
                'Content-Type': 'application/json',
                'x-api-key': api_key,
                'anthropic-version': '2023-06-01'
            }, method='POST')
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                return "⚠️ **API Rate Limit Exceeded (429)**\n\nYour Claude API key has reached its rate limit or balance limit. Please try again later or check your Anthropic console."
            return f"Generation error: HTTP {e.code} - {e.reason}"
        except Exception as e:
            return f'Generation error: {e}'

    def _generate_openai(self, prompt, system_prompt, api_key, model):
        url = 'https://api.openai.com/v1/chat/completions'
        body = json.dumps({
            'model': model,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': prompt}
            ],
            'max_tokens': 1024,
            'temperature': 0.3
        }).encode()
        try:
            req = urllib.request.Request(url, data=body, headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            }, method='POST')
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                return "⚠️ **API Rate Limit Exceeded (429)**\n\nYour OpenAI API key has reached its quota/rate limit. Please verify your billing status in the OpenAI dashboard."
            return f"Generation error: HTTP {e.code} - {e.reason}"
        except Exception as e:
            return f'Generation error: {e}'


# Global singleton
_rag_engine = RAGEngine()

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
}

# Track ongoing refresh so we don't double-run
_refresh_lock = threading.Lock()
_refresh_running = False

# ── News cache (5-minute TTL) ──────────────────────────
_news_cache = None
_news_cache_time = 0
NEWS_CACHE_TTL = 300  # 5 minutes

NEWS_FEEDS = [
    {'url': 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', 'source': 'Economic Times'},
    {'url': 'https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms', 'source': 'Economic Times'},
    {'url': 'https://www.moneycontrol.com/rss/MCrecentnews.xml', 'source': 'Moneycontrol'},
    {'url': 'https://www.business-standard.com/rss/markets-106.rss', 'source': 'Business Standard'},
    {'url': 'https://feeds.feedburner.com/ndtvprofit-latest', 'source': 'NDTV Profit'},
]

CAT_RULES = [
    ('ipo',     ['ipo', 'initial public', 'listing', 'nse listing', 'bse listing', 'grey market']),
    ('crypto',  ['crypto', 'bitcoin', 'btc', 'ethereum', 'web3', 'blockchain', 'defi', 'nft', 'virtual digital']),
    ('tech',    ['it sector', 'infosys', 'tcs', 'wipro', 'hcl', 'tech mahindra', 'zomato', 'startup', 'ai ', 'artificial intelligence', 'software', 'saas']),
    ('economy', ['rbi', 'repo rate', 'gdp', 'inflation', 'cpi', 'wpi', 'fiscal', 'budget', 'sebi', 'government', 'ministry', 'trade deficit', 'fdi', 'export']),
    ('markets', ['sensex', 'nifty', 'bse', 'nse', 'fii', 'dii', 'rally', 'crash', 'stock', 'share price', 'market cap', 'earnings', 'results', 'q4', 'q3', 'ipo']),
]

BULLISH_WORDS = ['surge', 'rally', 'jump', 'gain', 'rise', 'soar', 'bull', 'profit', 'buy', 'upgrade', 'outperform', 'record', 'high', 'growth', 'positive', 'beat', 'strong', 'boom']
BEARISH_WORDS = ['crash', 'fall', 'drop', 'loss', 'bear', 'sell', 'downgrade', 'underperform', 'low', 'negative', 'miss', 'weak', 'decline', 'slump', 'concern', 'risk', 'cut']

def _categorise(text):
    t = text.lower()
    for cat, kw in CAT_RULES:
        for k in kw:
            if k in t:
                return cat
    return 'markets'

def _sentiment(text):
    t = text.lower()
    b = sum(1 for w in BULLISH_WORDS if w in t)
    bear = sum(1 for w in BEARISH_WORDS if w in t)
    if b > bear:
        return 'bullish'
    elif bear > b:
        return 'bearish'
    return 'neutral'

def _parse_rss(feed_url, source_name):
    try:
        req = urllib.request.Request(feed_url, headers={
            'User-Agent': 'Mozilla/5.0 (compatible; FinanceBOT/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml'
        })
        with urllib.request.urlopen(req, timeout=8) as r:
            raw = r.read()
        root = ET.fromstring(raw)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        items = root.findall('.//item') or root.findall('.//atom:entry', ns)
        articles = []
        for item in items[:8]:  # max 8 per feed
            def _t(tag):
                el = item.find(tag)
                return html.unescape(el.text or '') if el is not None and el.text else ''
            title = _t('title') or _t('atom:title')
            link  = _t('link')  or _t('atom:link')
            desc  = re.sub(r'<[^>]+>', '', _t('description') or _t('atom:summary') or '')
            pub   = _t('pubDate') or _t('atom:published') or _t('atom:updated')
            if not title:
                continue
            # Convert pubDate to relative time
            rel = ''
            try:
                from email.utils import parsedate_to_datetime
                dt = parsedate_to_datetime(pub)
                diff = time.time() - dt.timestamp()
                if diff < 3600:
                    rel = f'{int(diff//60)} min ago'
                elif diff < 86400:
                    rel = f'{int(diff//3600)} hr ago'
                else:
                    rel = f'{int(diff//86400)}d ago'
            except Exception:
                try:
                    from datetime import datetime, timezone
                    dt = datetime.fromisoformat(pub.replace('Z', '+00:00'))
                    diff = time.time() - dt.timestamp()
                    if diff < 3600:
                        rel = f'{int(diff//60)} min ago'
                    elif diff < 86400:
                        rel = f'{int(diff//3600)} hr ago'
                    else:
                        rel = f'{int(diff//86400)}d ago'
                except Exception:
                    rel = 'Recently'
            articles.append({
                'title': title[:140],
                'summary': desc[:220].strip() + ('…' if len(desc) > 220 else ''),
                'link': link,
                'source': source_name,
                'time': rel,
                'pub_ts': pub,
                'category': _categorise(title + ' ' + desc),
                'sentiment': _sentiment(title + ' ' + desc),
            })
        return articles
    except Exception as e:
        return []

def _fetch_all_news(force=False):
    global _news_cache, _news_cache_time
    now = time.time()
    if not force and _news_cache is not None and (now - _news_cache_time) < NEWS_CACHE_TTL:
        return _news_cache
    all_articles = []
    for feed in NEWS_FEEDS:
        all_articles.extend(_parse_rss(feed['url'], feed['source']))
    # De-duplicate by title similarity
    seen = set()
    unique = []
    for a in all_articles:
        key = re.sub(r'[^a-z0-9]', '', a['title'].lower())[:60]
        if key not in seen:
            seen.add(key)
            unique.append(a)
    # Return up to 25 newest
    _news_cache = unique[:25]
    _news_cache_time = now
    return _news_cache

# ────────────────────────────────────────────────────────
# MICRO-RAG: Stock-Specific Context Retrieval
# GET /api/rag?ticker=RELIANCE&name=Reliance+Industries
# Returns filtered article chunks relevant to the queried stock
# ────────────────────────────────────────────────────────
STOCK_ALIASES = {
    'RELIANCE':   ['reliance', 'ril', 'jio', 'jiomart'],
    'TCS':        ['tcs', 'tata consultancy'],
    'HDFCBANK':   ['hdfc bank', 'hdfcbank'],
    'INFY':       ['infosys', 'infy'],
    'ICICIBANK':  ['icici bank', 'icici'],
    'HINDUNILVR': ['hul', 'hindustan unilever', 'lever'],
    'TATAMOTORS': ['tata motors', 'jlr', 'jaguar'],
    'SUNPHARMA':  ['sun pharma', 'sun pharmaceutical'],
    'BAJFINANCE': ['bajaj finance', 'bajfinance'],
    'WIPRO':      ['wipro'],
    'ADANIENT':   ['adani enterprises', 'adani'],
    'ZOMATO':     ['zomato', 'blinkit'],
    'ITC':        ['itc', 'itc ltd'],
    'AXISBANK':   ['axis bank', 'axisbank'],
    'KOTAKBANK':  ['kotak', 'kotak bank'],
    'LT':         ['l&t', 'larsen', 'toubro'],
    'NTPC':       ['ntpc'],
    'ONGC':       ['ongc', 'oil and natural gas'],
    'SBIN':       ['sbi', 'state bank'],
    'MARUTI':     ['maruti', 'suzuki'],
}
GENERAL_FINANCE_KEYWORDS = ['rbi', 'sebi', 'nifty', 'sensex', 'market', 'inflation', 'gdp', 'repo rate', 'fii', 'dii']

def _fetch_rag_chunks(ticker, company_name):
    """Retrieves and filters news articles relevant to the given stock.
    Returns a list of text chunks suitable for use as RAG grounding context."""
    all_articles = _fetch_all_news()  # use cached corpus

    # Build keyword matching list for this stock
    ticker_upper = ticker.upper()
    aliases = STOCK_ALIASES.get(ticker_upper, [])
    # Also use lowercase words from company name
    name_words = [w.lower() for w in company_name.split() if len(w) > 3]
    keywords = list(set(aliases + name_words + [ticker.lower()]))

    relevant = []
    general = []

    for a in all_articles:
        text = (a.get('title', '') + ' ' + a.get('summary', '')).lower()
        if any(kw in text for kw in keywords):
            relevant.append(a)
        elif any(kw in text for kw in GENERAL_FINANCE_KEYWORDS):
            general.append(a)

    # Prefer stock-specific articles; pad with macro context if needed
    combined = relevant[:6] + general[:max(0, 4 - len(relevant))]

    # Format as readable text chunks for the AI
    chunks = []
    for i, a in enumerate(combined):
        chunk = f"[Source {i+1}: {a.get('source','Unknown')} | {a.get('time','Recently')}]\n"
        chunk += f"Headline: {a.get('title','')}\n"
        if a.get('summary'):
            chunk += f"Summary: {a.get('summary','')}\n"
        chunk += f"URL: {a.get('link','')}\n"
        chunks.append(chunk)

    return {
        'chunks': chunks,
        'stock_specific': len(relevant),
        'macro_context': len(combined) - len(relevant),
        'total': len(chunks)
    }


class FinanceBotHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress noisy access logs

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/api/rag'):
            self._serve_rag()
        elif self.path.startswith('/api/news'):
            self._serve_news()
        elif self.path.startswith('/api/db/'):
            self._serve_db_api()
        elif self.path.startswith('/api/trade'):
            self._serve_trade_api()
        elif self.path.startswith('/api/profile'):
            self._get_profile()
        elif self.path.startswith('/api/ic/'):
            self._serve_ic_api()
        elif self.path.startswith('/api/yf/'):
            self._proxy_yahoo_finance()
        else:
            self._serve_static()

    def do_POST(self):
        if self.path == '/api/db/refresh':
            self._refresh_db()
        elif self.path == '/api/chat':
            self._serve_chat()
        elif self.path == '/api/trade':
            self._record_trade()
        elif self.path == '/api/profile':
            self._save_profile()
        elif self.path.startswith('/api/ic/'):
            self._serve_ic_api()
        else:
            self._json_response(404, {'error': 'Not found'})

    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Cache-Control', 'no-cache')

    def _json_response(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self._cors_headers()
        self.end_headers()
        self.wfile.write(body)

    # ────────────────────────────────────────────────────────
    # Profile API (GET /api/profile | POST /api/profile)
    # ────────────────────────────────────────────────────────
    def _get_profile(self):
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            row = conn.execute('SELECT * FROM tl_users ORDER BY id DESC LIMIT 1').fetchone()
            conn.close()
            if row:
                self._json_response(200, {'profile': dict(row)})
            else:
                self._json_response(404, {'error': 'No profile found'})
        except Exception as e:
            self._json_response(500, {'error': str(e)})

    def _save_profile(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length).decode('utf-8'))
            
            name = body.get('name', 'User')
            user_type = body.get('user_type', 'investor')
            experience = body.get('experience', '')
            style = body.get('style', '')
            risk_tolerance = body.get('risk_tolerance', '')

            conn = sqlite3.connect(DB_PATH)
            # Just keep one profile for local app by deleting previous ones
            conn.execute('DELETE FROM tl_users')
            conn.execute(
                'INSERT INTO tl_users (name, user_type, experience, style, risk_tolerance) VALUES (?, ?, ?, ?, ?)',
                (name, user_type, experience, style, risk_tolerance)
            )
            conn.commit()
            conn.close()
            self._json_response(200, {'success': True})
        except Exception as e:
            self._json_response(500, {'error': str(e)})

    # ────────────────────────────────────────────────────────
    # InvestCircle API (GET /api/ic/experts | GET /api/ic/posts | POST /api/ic/posts)
    # ────────────────────────────────────────────────────────
    def _serve_ic_api(self):
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            path = self.path.split('?')[0]

            if self.command == 'GET':
                if path == '/api/ic/experts':
                    rows = conn.execute('SELECT * FROM ic_experts ORDER BY id ASC').fetchall()
                    self._json_response(200, {'experts': [dict(r) for r in rows]})
                elif path == '/api/ic/posts':
                    rows = conn.execute('SELECT * FROM ic_posts ORDER BY timestamp DESC').fetchall()
                    self._json_response(200, {'posts': [dict(r) for r in rows]})
                else:
                    self._json_response(404, {'error': 'Unknown IC endpoint'})
            
            elif self.command == 'POST':
                if path == '/api/ic/posts':
                    length = int(self.headers.get('Content-Length', 0))
                    body = json.loads(self.rfile.read(length).decode('utf-8'))
                    
                    author_name = body.get('author_name', 'Anonymous')
                    author_role = body.get('author_role', 'Community Member')
                    content = body.get('content', '').strip()
                    category = body.get('category', 'Market Analysis')

                    if not content:
                        self._json_response(400, {'error': 'Content is required'})
                        return

                    conn.execute(
                        'INSERT INTO ic_posts (author_name, author_role, content, category) VALUES (?, ?, ?, ?)',
                        (author_name, author_role, content, category)
                    )
                    conn.commit()
                    self._json_response(200, {'success': True})
                else:
                    self._json_response(404, {'error': 'Unknown IC endpoint'})

            conn.close()
        except Exception as e:
            self._json_response(500, {'error': str(e)})

    # ────────────────────────────────────────────────────────
    # Trading Lab DB  (POST /api/trade | GET /api/trade/*)
    # Persists paper trades & snapshots in trading_lab.db
    # ────────────────────────────────────────────────────────
    def _record_trade(self):
        """POST /api/trade — store a paper trade in trading_lab.db."""
        try:
            length = int(self.headers.get('Content-Length', 0))
            body   = json.loads(self.rfile.read(length).decode('utf-8'))
        except Exception:
            self._json_response(400, {'error': 'Invalid JSON'})
            return

        ticker     = str(body.get('ticker', '')).upper().strip()
        action     = str(body.get('action', '')).upper().strip()
        qty        = int(body.get('qty', 0))
        price      = float(body.get('price', 0))
        total      = float(body.get('total', qty * price))
        cash_after = float(body.get('cashAfter', 0))
        trade_date = str(body.get('date', ''))
        trade_time = str(body.get('time', ''))

        if not ticker or action not in ('BUY', 'SELL') or qty <= 0 or price <= 0:
            self._json_response(400, {'error': 'Invalid trade payload'})
            return

        try:
            conn = sqlite3.connect(DB_PATH)
            conn.execute(
                'INSERT INTO tl_trades (trade_date, trade_time, ticker, action, qty, price, total, cash_after) '
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                (trade_date, trade_time, ticker, action, qty, price, total, cash_after)
            )
            # Update ticker-level P&L summary
            conn.execute('''
                INSERT INTO tl_ticker_pnl (ticker, total_bought, total_sold, avg_buy_price, realised_pnl, trades_count)
                VALUES (?, ?, ?, ?, ?, 1)
                ON CONFLICT(ticker) DO UPDATE SET
                    total_bought  = total_bought  + CASE WHEN ? = 'BUY'  THEN ? ELSE 0 END,
                    total_sold    = total_sold    + CASE WHEN ? = 'SELL' THEN ? ELSE 0 END,
                    realised_pnl  = realised_pnl  + CASE WHEN ? = 'SELL' THEN (? - COALESCE(avg_buy_price, ?)) * ? ELSE 0 END,
                    trades_count  = trades_count  + 1,
                    last_updated  = datetime('now')
            ''', (
                ticker,
                qty if action == 'BUY' else 0,
                qty if action == 'SELL' else 0,
                price,
                0,
                action, qty,
                action, qty,
                action, price, price, qty
            ))
            conn.commit()
            conn.close()
            self._json_response(201, {'ok': True, 'ticker': ticker, 'action': action})
        except Exception as e:
            self._json_response(500, {'error': str(e)})

    def _serve_trade_api(self):
        """GET /api/trade/history | /api/trade/summary | /api/trade/tickers"""
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(self.path)
        path   = parsed.path

        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row

            if path == '/api/trade/history':
                rows = conn.execute(
                    'SELECT * FROM tl_trades ORDER BY id DESC LIMIT 100'
                ).fetchall()
                self._json_response(200, {'trades': [dict(r) for r in rows], 'count': len(rows)})

            elif path == '/api/trade/summary':
                row = conn.execute('''
                    SELECT
                        COUNT(*)             AS total_trades,
                        SUM(CASE WHEN action='BUY'  THEN qty ELSE 0 END) AS shares_bought,
                        SUM(CASE WHEN action='SELL' THEN qty ELSE 0 END) AS shares_sold,
                        SUM(CASE WHEN action='BUY'  THEN total ELSE 0 END) AS capital_deployed,
                        SUM(CASE WHEN action='SELL' THEN total ELSE 0 END) AS capital_realised,
                        COUNT(DISTINCT ticker) AS unique_stocks,
                        MIN(trade_date)      AS first_trade,
                        MAX(trade_date)      AS last_trade
                    FROM tl_trades
                ''').fetchone()
                self._json_response(200, {'summary': dict(row) if row else {}})

            elif path == '/api/trade/tickers':
                rows = conn.execute(
                    'SELECT * FROM tl_ticker_pnl ORDER BY trades_count DESC'
                ).fetchall()
                self._json_response(200, {'tickers': [dict(r) for r in rows]})

            else:
                self._json_response(404, {'error': 'Unknown trade endpoint'})

            conn.close()
        except Exception as e:
            self._json_response(500, {'error': str(e)})

    # ────────────────────────────────────────────────────────
    # CHAT RAG ENDPOINT  (POST /api/chat)
    # Body: { query, api_key, model, stock_context? }
    # Returns: { answer, sources, total_docs_searched }
    # ────────────────────────────────────────────────────────
    def _serve_chat(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body   = json.loads(self.rfile.read(length).decode('utf-8'))
        except Exception:
            self._json_response(400, {'error': 'Invalid JSON body'})
            return

        query        = body.get('query', '').strip()
        api_key      = body.get('api_key', '').strip()
        model        = body.get('model', 'gemini-1.5-flash').strip()
        stock_context = body.get('stock_context', '')
        mode         = body.get('mode', 'education').strip()

        if not query:
            self._json_response(400, {'error': 'query is required'})
            return
        if not api_key:
            self._json_response(400, {'error': 'api_key is required. Add your Gemini/Claude/OpenAI API key in the Profile panel.'})
            return

        result = _rag_engine.answer(query, api_key, model, stock_context, mode)
        self._json_response(200, result)


    # ────────────────────────────────────────────────────────
    # DB Refresh  (POST /api/db/refresh)
    # Runs fetch_stocks.py and streams progress line by line
    # ────────────────────────────────────────────────────────
    def _refresh_db(self):
        global _refresh_running
        with _refresh_lock:
            if _refresh_running:
                self._json_response(409, {'error': 'Refresh already in progress'})
                return
            _refresh_running = True

        try:
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Transfer-Encoding', 'chunked')
            self._cors_headers()
            self.end_headers()

            proc = subprocess.Popen(
                [sys.executable, FETCH_SCRIPT],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            for line in proc.stdout:
                clean = line.rstrip('\n')
                if clean:
                    msg = json.dumps({'line': clean}) + '\n'
                    try:
                        self.wfile.write(msg.encode())
                        self.wfile.flush()
                    except Exception:
                        break

            proc.wait()
            done_msg = json.dumps({'done': True, 'code': proc.returncode}) + '\n'
            try:
                self.wfile.write(done_msg.encode())
                self.wfile.flush()
            except Exception:
                pass

        except Exception as e:
            pass
        finally:
            _refresh_running = False

    # ────────────────────────────────────────────────────────
    # DB API  (/api/db/*)
    # ────────────────────────────────────────────────────────
    def _serve_db_api(self):
        if not os.path.exists(DB_PATH):
            self._json_response(404, {
                'error': 'Database not found. Run: python3 db/fetch_stocks.py'
            })
            return

        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            path = self.path.split('?')[0]

            # GET /api/db/stocks
            # Returns latest prices for all stocks plus up-to-90d price history
            if path == '/api/db/stocks':
                latest_date = conn.execute(
                    "SELECT MAX(date) FROM daily_prices"
                ).fetchone()[0]

                if not latest_date:
                    self._json_response(200, {'stocks': [], 'date': None})
                    conn.close()
                    return

                rows = conn.execute("""
                    SELECT dp.ticker, dp.date,
                           dp.open, dp.high, dp.low, dp.close,
                           dp.volume, dp.prev_close,
                           dp.change, dp.change_pct,
                           dp.market_cap, dp.pe_ratio,
                           dp.high_52w, dp.low_52w,
                           dp.avg_volume, dp.sentiment,
                           dp.div_yield, dp.eps, dp.roe, dp.debt_equity, dp.pb_ratio,
                           s.name, s.sector, s.emoji, s.exchange
                    FROM daily_prices dp
                    JOIN stocks s USING(ticker)
                    WHERE dp.date = ?
                    ORDER BY dp.ticker
                """, (latest_date,)).fetchall()

                stocks = []
                for r in rows:
                    stock = dict(r)
                    # Attach price history for chart rendering
                    hist = conn.execute("""
                        SELECT close FROM price_history
                        WHERE ticker = ?
                        ORDER BY date ASC
                        LIMIT 90
                    """, (stock['ticker'],)).fetchall()
                    stock['history'] = [row['close'] for row in hist]
                    stocks.append(stock)

                self._json_response(200, {'stocks': stocks, 'date': latest_date})

            # GET /api/db/indices
            # Returns latest values for Nifty 50, Sensex, Bank Nifty, India VIX
            elif path == '/api/db/indices':
                latest_date = conn.execute(
                    "SELECT MAX(date) FROM market_indices"
                ).fetchone()[0]

                if not latest_date:
                    self._json_response(200, {'indices': [], 'date': None})
                    conn.close()
                    return

                rows = conn.execute("""
                    SELECT symbol, name, price, prev_close, change, change_pct, date
                    FROM market_indices
                    WHERE date = ?
                    ORDER BY name
                """, (latest_date,)).fetchall()

                self._json_response(200, {
                    'indices': [dict(r) for r in rows],
                    'date': latest_date
                })

            # GET /api/db/status
            # Quick health-check — is the DB populated and up-to-date?
            elif path == '/api/db/status':
                latest = conn.execute(
                    "SELECT MAX(date) as d, COUNT(*) as n FROM daily_prices"
                ).fetchone()
                last_run = conn.execute(
                    "SELECT run_date, status, stocks_fetched, finished_at "
                    "FROM fetch_log ORDER BY id DESC LIMIT 1"
                ).fetchone()
                self._json_response(200, {
                    'latest_date': latest['d'],
                    'stock_count': latest['n'],
                    'last_run':    dict(last_run) if last_run else None,
                })

            else:
                self._json_response(404, {'error': f'Unknown DB endpoint: {path}'})

            conn.close()

        except Exception as e:
            self._json_response(500, {'error': str(e)})

    # ────────────────────────────────────────────────────────
    # Micro-RAG  (/api/rag?ticker=RELIANCE&name=Reliance+Industries)
    # ────────────────────────────────────────────────────────
    def _serve_rag(self):
        from urllib.parse import urlparse, parse_qs, unquote_plus
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        ticker = unquote_plus(params.get('ticker', [''])[0]).upper()
        name   = unquote_plus(params.get('name',   [''])[0])
        if not ticker:
            self._json_response(400, {'error': 'ticker param required'})
            return
        try:
            result = _fetch_rag_chunks(ticker, name)
            self._json_response(200, result)
        except Exception as e:
            self._json_response(500, {'error': str(e), 'chunks': []})

    # ────────────────────────────────────────────────────────
    # News  (/api/news)
    # ────────────────────────────────────────────────────────
    def _serve_news(self):
        force = 'force=1' in self.path
        try:
            articles = _fetch_all_news(force=force)
            self._json_response(200, {'articles': articles, 'count': len(articles)})
        except Exception as e:
            self._json_response(500, {'error': str(e), 'articles': []})

    # ────────────────────────────────────────────────────────
    # Yahoo Finance Proxy  (/api/yf/*)
    # ────────────────────────────────────────────────────────
    def _proxy_yahoo_finance(self):
        yf_path = self.path.replace('/api/yf', '', 1)
        yf_url = f'https://query1.finance.yahoo.com{yf_path}'

        try:
            req = urllib.request.Request(yf_url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self._cors_headers()
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self._cors_headers()
            self.end_headers()
            self.wfile.write(b'{}')
        except Exception as e:
            self.send_response(502)
            self._cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    # ────────────────────────────────────────────────────────
    # Static file server
    # ────────────────────────────────────────────────────────
    def _serve_static(self):
        path = self.path.split('?')[0]
        if path == '/':
            path = '/index.html'
        file_path = os.path.join(PROJECT_DIR, path.lstrip('/'))

        try:
            with open(file_path, 'rb') as f:
                data = f.read()
            mime_type, _ = mimetypes.guess_type(file_path)
            self.send_response(200)
            self.send_header('Content-Type', mime_type or 'text/plain')
            self.end_headers()
            self.wfile.write(data)
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')


if __name__ == '__main__':
    os.chdir(PROJECT_DIR)

    # Initialise Database on startup
    init_db()

    # Pre-train / index RAG documents asynchronously
    t = threading.Thread(target=_rag_engine.initialise, daemon=True)
    t.start()
    
    server = http.server.HTTPServer(('', PORT), FinanceBotHandler)
    print(f'\n✅  Finance BOT running at: http://localhost:{PORT}')
    print(f'   DB stocks API:   http://localhost:{PORT}/api/db/stocks')
    print(f'   DB indices API:  http://localhost:{PORT}/api/db/indices')
    print(f'   DB status API:   http://localhost:{PORT}/api/db/status')
    print(f'   YF proxy:        http://localhost:{PORT}/api/yf/v8/finance/chart/RELIANCE.NS')
    print(f'   News API:        http://localhost:{PORT}/api/news')
    print(f'   ❤️  Trade record:  POST http://localhost:{PORT}/api/trade')
    print(f'   📊 Trade history: GET  http://localhost:{PORT}/api/trade/history')
    print(f'   📈 Trade summary: GET  http://localhost:{PORT}/api/trade/summary')
    print(f'\n   Press Ctrl+C to stop.\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')
        sys.exit(0)
