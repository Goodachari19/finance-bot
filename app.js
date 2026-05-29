/* ══ Finance BOT — Indian Market Edition (NSE/BSE) ══ */

'use strict';

// ═══════════════════════════════════════
// DATA: Indian Stocks — Static Metadata
// (live prices fetched from Yahoo Finance)
// ═══════════════════════════════════════
// ─── Nifty 50 + Sensex constituent stocks ───────────────────
const STOCK_METADATA = [
    // ── FINANCIALS (Banking, NBFC, Insurance) ──
    { ticker: 'HDFCBANK',    name: 'HDFC Bank Ltd.',                   exchange: 'NSE', emoji: '🏦', sector: 'Banking',             about: 'India\'s largest private sector bank by assets.' },
    { ticker: 'ICICIBANK',   name: 'ICICI Bank Ltd.',                  exchange: 'NSE', emoji: '🏛️', sector: 'Banking',             about: 'Leading private sector bank in India.' },
    { ticker: 'SBIN',        name: 'State Bank of India',              exchange: 'NSE', emoji: '🇮🇳', sector: 'Banking',            about: 'India\'s largest public sector bank.' },
    { ticker: 'AXISBANK',    name: 'Axis Bank Ltd.',                   exchange: 'NSE', emoji: '🔵', sector: 'Banking',             about: 'Third largest private sector bank in India.' },
    { ticker: 'KOTAKBANK',   name: 'Kotak Mahindra Bank Ltd.',         exchange: 'NSE', emoji: '🟡', sector: 'Banking',             about: 'Major private sector bank known for retail leadership.' },
    { ticker: 'BAJFINANCE',  name: 'Bajaj Finance Ltd.',               exchange: 'NSE', emoji: '📈', sector: 'NBFC',               about: 'Leading NBFC with massive consumer lending presence.' },
    { ticker: 'BAJAJFINSV',  name: 'Bajaj Finserv Ltd.',               exchange: 'NSE', emoji: '🔶', sector: 'NBFC',               about: 'Financial services conglomerate.' },
    { ticker: 'SHRIRAMFIN',  name: 'Shriram Finance Ltd.',             exchange: 'NSE', emoji: '🚛', sector: 'NBFC',               about: 'India\'s largest retail NBFC.' },
    { ticker: 'JIOFIN',      name: 'Jio Financial Services Ltd.',       exchange: 'NSE', emoji: '💎', sector: 'Fintech',            about: 'Demerged financial arm of Reliance Industries.' },
    { ticker: 'SBILIFE',     name: 'SBI Life Insurance Co.',           exchange: 'NSE', emoji: '🛡️', sector: 'Insurance',         about: 'Leading private life insurer.' },
    { ticker: 'HDFCLIFE',    name: 'HDFC Life Insurance Co.',          exchange: 'NSE', emoji: '💛', sector: 'Insurance',         about: 'Major private life insurance player.' },
    { ticker: 'LICI',        name: 'Life Insurance Corp. of India',    exchange: 'NSE', emoji: '🏥', sector: 'Insurance',         about: 'The insurance giant of India.' },

    // ── IT & TECHNOLOGY ──
    { ticker: 'TCS',         name: 'Tata Consultancy Services Ltd.',   exchange: 'NSE', emoji: '💻', sector: 'IT',                 about: 'India\'s largest IT services exporter.' },
    { ticker: 'INFY',        name: 'Infosys Ltd.',                     exchange: 'NSE', emoji: '🌐', sector: 'IT',                 about: 'Global leader in digital services.' },
    { ticker: 'HCLTECH',     name: 'HCL Technologies Ltd.',            exchange: 'NSE', emoji: '🖥️', sector: 'IT',                 about: 'Top-tier global IT services firm.' },
    { ticker: 'WIPRO',       name: 'Wipro Ltd.',                       exchange: 'NSE', emoji: '🔧', sector: 'IT',                 about: 'Major global IT & consulting provider.' },
    { ticker: 'TECHM',       name: 'Tech Mahindra Ltd.',               exchange: 'NSE', emoji: '📡', sector: 'IT',                 about: 'IT arm of Mahindra group.' },
    { ticker: 'LTIM',        name: 'LTIMindtree Ltd.',                 exchange: 'NSE', emoji: '🌳', sector: 'IT',                 about: 'Global technology consulting and digital solutions.' },

    // ── ENERGY, OIL & GAS ──
    { ticker: 'RELIANCE',    name: 'Reliance Industries Ltd.',         exchange: 'NSE', emoji: '⚡', sector: 'Conglomerate',       about: 'India\'s largest company (Energy, Retail, Jio).' },
    { ticker: 'ONGC',        name: 'Oil & Natural Gas Corp.',          exchange: 'NSE', emoji: '🛢️', sector: 'Oil & Gas',           about: 'Largest crude oil and natural gas company in India.' },
    { ticker: 'BPCL',        name: 'Bharat Petroleum Corp.',           exchange: 'NSE', emoji: '⛽', sector: 'Oil & Gas',           about: 'Maharatna PSU in oil refining.' },
    { ticker: 'NTPC',        name: 'NTPC Ltd.',                        exchange: 'NSE', emoji: '⚙️', sector: 'Power',              about: 'India\'s largest power utility.' },
    { ticker: 'POWERGRID',   name: 'Power Grid Corp. of India',        exchange: 'NSE', emoji: '🔌', sector: 'Power',              about: 'Central transmission utility.' },
    { ticker: 'COALINDIA',   name: 'Coal India Ltd.',                  exchange: 'NSE', emoji: '⛏️', sector: 'Mining',             about: 'World\'s largest coal producer.' },

    // ── FMCG & CONSUMER ──
    { ticker: 'HINDUNILVR',  name: 'Hindustan Unilever Ltd.',          exchange: 'NSE', emoji: '🛒', sector: 'FMCG',              about: 'India\'s leading FMCG company.' },
    { ticker: 'ITC',         name: 'ITC Ltd.',                         exchange: 'NSE', emoji: '🌿', sector: 'Diversified',       about: 'Conglomerate in FMCG, Hotels, and Agri.' },
    { ticker: 'NESTLEIND',   name: 'Nestle India Ltd.',                exchange: 'NSE', emoji: '🍫', sector: 'FMCG',              about: 'Giant behind Maggi and Nescafe.' },
    { ticker: 'BRITANNIA',   name: 'Britannia Industries Ltd.',        exchange: 'NSE', emoji: '🍞', sector: 'FMCG',              about: 'Leading food & biscuits company.' },
    { ticker: 'TATACONSUM',  name: 'Tata Consumer Products Ltd.',      exchange: 'NSE', emoji: '☕', sector: 'FMCG',              about: 'Tata Group\'s consumer goods arm.' },
    { ticker: 'ASIANPAINT',  name: 'Asian Paints Ltd.',                exchange: 'NSE', emoji: '🎨', sector: 'Consumer Goods',     about: 'India\'s leading paint company.' },
    { ticker: 'TITAN',       name: 'Titan Company Ltd.',               exchange: 'NSE', emoji: '⌚', sector: 'Consumer Goods',     about: 'Tata brand for watches, jewellery (Tanishq).' },
    { ticker: 'TRENT',       name: 'Trent Ltd.',                       exchange: 'NSE', emoji: '👗', sector: 'Retail',            about: 'Retail arm (Westside, Zudio).' },

    // ── AUTOMOBILES ──
    { ticker: 'TATAMOTORS',  name: 'Tata Motors Ltd.',                 exchange: 'NSE', emoji: '🚗', sector: 'Automobile',        about: 'Major auto manufacturer and JLR owner.' },
    { ticker: 'MARUTI',      name: 'Maruti Suzuki India Ltd.',         exchange: 'NSE', emoji: '🚙', sector: 'Automobile',        about: 'India\'s passenger vehicle leader.' },
    { ticker: 'M&M',         name: 'Mahindra & Mahindra Ltd.',         exchange: 'NSE', emoji: '🚜', sector: 'Automobile',        about: 'Leader in SUVs and tractors.' },
    { ticker: 'BAJAJ-AUTO',  name: 'Bajaj Auto Ltd.',                  exchange: 'NSE', emoji: '🛵', sector: 'Automobile',        about: 'Leading two and three-wheeler maker.' },
    { ticker: 'EICHERMOT',   name: 'Eicher Motors Ltd.',               exchange: 'NSE', emoji: '🏍️', sector: 'Automobile',        about: 'Owner of Royal Enfield.' },

    // ── PHARMA & HEALTHCARE ──
    { ticker: 'SUNPHARMA',   name: 'Sun Pharmaceutical Industries',    exchange: 'NSE', emoji: '💊', sector: 'Pharma',            about: 'Leading Indian pharma multinational.' },
    { ticker: 'DRREDDY',     name: 'Dr. Reddy\'s Laboratories',        exchange: 'NSE', emoji: '🧬', sector: 'Pharma',            about: 'Global generics pharma leader.' },
    { ticker: 'CIPLA',       name: 'Cipla Ltd.',                       exchange: 'NSE', emoji: '🏥', sector: 'Pharma',            about: 'Leading global pharmaceutical company.' },
    { ticker: 'DIVISLAB',    name: 'Divi\'s Laboratories Ltd.',        exchange: 'NSE', emoji: '⚗️', sector: 'Pharma',            about: 'Major API manufacturer.' },
    { ticker: 'APOLLOHOSP',  name: 'Apollo Hospitals Enterprise',      exchange: 'NSE', emoji: '🏨', sector: 'Healthcare',        about: 'Integrated healthcare services giant.' },
    { ticker: 'MAXHEALTH',   name: 'Max Healthcare Institute',         exchange: 'NSE', emoji: '🏩', sector: 'Healthcare',        about: 'Major private hospital chain.' },

    // ── INFRA, METALS & OTHERS ──
    { ticker: 'LT',          name: 'Larsen & Toubro Ltd.',             exchange: 'NSE', emoji: '🏗️', sector: 'Engineering',       about: 'Engineering & construction conglomerate.' },
    { ticker: 'ADANIENT',    name: 'Adani Enterprises Ltd.',           exchange: 'NSE', emoji: '🌆', sector: 'Conglomerate',      about: 'Adani Group\'s flagship incubator.' },
    { ticker: 'ADANIPORTS',  name: 'Adani Ports & SEZ Ltd.',           exchange: 'NSE', emoji: '🚢', sector: 'Infrastructure',    about: 'India\'s largest port operator.' },
    { ticker: 'ULTRACEMCO',  name: 'UltraTech Cement Ltd.',            exchange: 'NSE', emoji: '🧱', sector: 'Cement',            about: 'India\'s largest cement producer.' },
    { ticker: 'GRASIM',      name: 'Grasim Industries Ltd.',           exchange: 'NSE', emoji: '🧵', sector: 'Diversified',       about: 'Global leader in VSF.' },
    { ticker: 'TATASTEEL',   name: 'Tata Steel Ltd.',                  exchange: 'NSE', emoji: '🔩', sector: 'Metals',            about: 'Leading global steel company.' },
    { ticker: 'JSWSTEEL',    name: 'JSW Steel Ltd.',                   exchange: 'NSE', emoji: '⚒️', sector: 'Metals',            about: 'India\'s leading private steel maker.' },
    { ticker: 'HINDALCO',    name: 'Hindalco Industries Ltd.',         exchange: 'NSE', emoji: '🪙', sector: 'Metals',            about: 'Aluminium and copper leader.' },
    { ticker: 'BHARTIARTL',  name: 'Bharti Airtel Ltd.',               exchange: 'NSE', emoji: '📶', sector: 'Telecom',           about: 'Leading global telecom company.' },
    { ticker: 'INDIGO',      name: 'InterGlobe Aviation (IndiGo)',     exchange: 'NSE', emoji: '✈️', sector: 'Aviation',          about: 'India\'s largest airline by market share.' },
    { ticker: 'BEL',         name: 'Bharat Electronics Ltd.',          exchange: 'NSE', emoji: '📡', sector: 'Defence',           about: 'Leading electronics PSU.' },
    { ticker: 'HAL',         name: 'Hindustan Aeronautics Ltd.',       exchange: 'NSE', emoji: '🛩️', sector: 'Defence',           about: 'Premier aerospace manufacturer.' },
    
    // ── GROWTH & TECH LEADERS (Extra) ──
    { ticker: 'ZOMATO',      name: 'Zomato Ltd.',                      exchange: 'NSE', emoji: '🍔', sector: 'Consumer Tech',     about: 'Food delivery & quick commerce leader.' },
    { ticker: 'DMART',       name: 'Avenue Supermarts Ltd. (DMart)',   exchange: 'NSE', emoji: '🏪', sector: 'Retail',            about: 'Leading value retail chain.' },
];

// Live stock data cache (populated from Yahoo Finance)
let STOCKS = STOCK_METADATA.map(m => ({
    ...m,
    price: 0, change: 0, changePct: 0,
    marketCap: '—', pe: '—', high52: '—', low52: '—',
    volume: '—', avgVol: '—',
    sentiment: 65,
    priceHistory: { '7d': [], '1m': [], '3m': [] },
    _loaded: false
}));

// ═══════════════════════════════════════
// DATA SOURCE: DB-first, YF fallback
// ═══════════════════════════════════════
const YF_PROXY = 'https://query1.finance.yahoo.com/v8/finance/chart/';
const DB_API   = '/api/db';

function formatMarketCap(val) {
    if (!val || isNaN(val)) return '—';
    const cr = val / 1e7;
    if (cr >= 1e5) return `₹${(cr / 1e5).toFixed(1)}L Cr`;
    if (cr >= 1e3) return `₹${(cr / 1e3).toFixed(1)}K Cr`;
    return `₹${cr.toFixed(0)} Cr`;
}

function formatVol(vol) {
    if (!vol || isNaN(vol)) return '—';
    if (vol >= 1e7) return `${(vol / 1e7).toFixed(1)} Cr`;
    if (vol >= 1e5) return `${(vol / 1e5).toFixed(1)} L`;
    return vol.toLocaleString('en-IN');
}

// ── Toast banner ─────────────────────────────────────────────
function showDataSourceToast(source, date) {
    let toast = document.getElementById('dataSourceToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'dataSourceToast';
        toast.style.cssText = `
            position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%);
            background:rgba(20,24,40,0.95); border:1px solid rgba(255,255,255,0.10);
            color:#aab; padding:.6rem 1.2rem; border-radius:2rem; font-size:.8rem;
            backdrop-filter:blur(12px); z-index:9999; transition:opacity .4s;
            display:flex; align-items:center; gap:.5rem; white-space:nowrap;
        `;
        document.body.appendChild(toast);
    }
    const icon   = source === 'db' ? '💾' : '🌐';
    const label  = source === 'db'
        ? `Loaded from local database · Data for <b>${date}</b>`
        : `Loaded live from Yahoo Finance`;
    toast.innerHTML = `${icon} <span>${label}</span>`;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 5000);
}

// ── DB-first loader ──────────────────────────────────────────
async function loadFromDB() {
    try {
        const res = await fetch(`${DB_API}/stocks`, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) return false;
        const { stocks, date } = await res.json();
        if (!stocks || stocks.length === 0) return false;

        stocks.forEach(s => {
            const idx = STOCKS.findIndex(st => st.ticker === s.ticker);
            if (idx === -1) return;
            const hist = s.history || [];
            STOCKS[idx] = {
                ...STOCKS[idx],                       // keep metadata (emoji, about, etc.)
                price:      s.close ?? 0,
                change:     s.change ?? 0,
                changePct:  s.change_pct ?? 0,
                marketCap:  formatMarketCap(s.market_cap),
                pe:         s.pe_ratio ? parseFloat(s.pe_ratio).toFixed(1) : '—',
                high52:     s.high_52w ? parseFloat(s.high_52w).toFixed(2) : '—',
                low52:      s.low_52w  ? parseFloat(s.low_52w).toFixed(2)  : '—',
                volume:     formatVol(s.volume),
                avgVol:     formatVol(s.avg_volume),
                sentiment:  s.sentiment ?? 60,
                // Deep Fundamentals — formatted for display
                divYield:   s.div_yield != null  ? parseFloat(s.div_yield).toFixed(2)  + '%' : 'N/A',
                eps:        s.eps       != null  ? '\u20b9' + parseFloat(s.eps).toFixed(2)   : 'N/A',
                roe:        s.roe       != null  ? parseFloat(s.roe).toFixed(2)         + '%' : 'N/A',
                debtEquity: s.debt_equity != null ? parseFloat(s.debt_equity).toFixed(2) + 'x' : 'N/A',
                pbRatio:    s.pb_ratio   != null ? parseFloat(s.pb_ratio).toFixed(2)    + 'x' : 'N/A',
                // Store raw numbers too for colour-coding
                _divYieldRaw: s.div_yield,
                _roeRaw:      s.roe,
                _deRaw:       s.debt_equity,
                priceHistory: {
                    '7d': hist.slice(-7),
                    '1m': hist.slice(-22),
                    '3m': hist,
                },
                _loaded: true,
                _source: 'db',
            };
        });

        console.log(`[FinanceBOT] ✅ Loaded ${stocks.length} stocks from local DB (${date})`);
        return { ok: true, date };
    } catch (e) {
        console.warn('[FinanceBOT] DB load failed, will try Yahoo Finance:', e.message);
        return false;
    }
}

async function loadIndicesFromDB() {
    try {
        const res = await fetch(`${DB_API}/indices`, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) return false;
        const { indices } = await res.json();
        if (!indices || indices.length === 0) return false;

        // Map YF symbol → dashboard element id
        const symbolMap = {
            '^NSEI':     'nifty',
            '^BSESN':    'sensex',
            '^NSEBANK':  'banknifty',
            '^INDIAVIX': 'indiavix',
        };

        indices.forEach(idx => {
            const id = symbolMap[idx.symbol];
            if (!id) return;
            const price     = idx.price ?? 0;
            const change    = idx.change ?? 0;
            const changePct = idx.change_pct ?? 0;
            const isUp      = change >= 0;
            const sign      = isUp ? '▲' : '▼';

            const priceEl  = document.getElementById(`idx-${id}-price`);
            const changeEl = document.getElementById(`idx-${id}-change`);
            const badgeEl  = document.getElementById(`idx-${id}-badge`);

            if (priceEl && changeEl && badgeEl) {
                badgeEl.className   = `dash-badge ${isUp ? 'up' : 'down'}`;
                priceEl.textContent = id === 'indiavix'
                    ? price.toFixed(4)
                    : price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                changeEl.className  = `dash-change ${isUp ? 'text-green' : 'text-red'}`;
                changeEl.textContent = `${sign} ${Math.abs(change).toFixed(2)} (${Math.abs(changePct).toFixed(2)}%)`;
            }
        });

        return true;
    } catch (e) {
        return false;
    }
}

// ── Yahoo Finance fallback ───────────────────────────────────
const CORS_PROXIES = [
    url => {
        const yfPath = url.replace('https://query1.finance.yahoo.com', '');
        return `/api/yf${yfPath}`;
    },
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

async function fetchWithProxy(targetUrl) {
    for (const buildProxy of CORS_PROXIES) {
        try {
            const proxyUrl = buildProxy(targetUrl);
            const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) continue;
            const text = await res.text();
            if (!text || !text.startsWith('{')) continue;
            const json = JSON.parse(text);
            if (json?.chart?.error) continue;
            return json;
        } catch (e) { /* try next */ }
    }
    throw new Error('All proxies failed');
}

async function fetchYahooChart(ticker, range, interval) {
    const suffixes = ['.NS', '-EQ.NS', '.BO'];
    for (const suffix of suffixes) {
        try {
            const symbol = `${ticker}${suffix}`;
            const yfUrl  = `${YF_PROXY}${symbol}?interval=${interval}&range=${range}`;
            const json   = await fetchWithProxy(yfUrl);
            const result = json?.chart?.result?.[0];
            if (result) return result;
        } catch(e) { /* try next suffix */ }
    }
    throw new Error('No data found for ' + ticker);
}

async function fetchLiveStockData(tickerIndex) {
    const meta = STOCK_METADATA[tickerIndex];
    try {
        const result  = await fetchYahooChart(meta.ticker, '3mo', '1d');
        const m       = result.meta;
        const closes  = result.indicators?.quote?.[0]?.close || [];
        const timestamps = result.timestamp || [];
        const validData  = closes.map((c, i) => ({ c, t: timestamps[i] })).filter(d => d.c != null);

        const price     = m.regularMarketPrice ?? validData[validData.length - 1]?.c ?? 0;
        const prevClose = m.chartPreviousClose ?? m.previousClose ?? price;
        const change    = parseFloat((price - prevClose).toFixed(2));
        const changePct = prevClose ? parseFloat(((change / prevClose) * 100).toFixed(2)) : 0;
        const all       = validData.map(d => d.c);
        const high52    = m.fiftyTwoWeekHigh ?? 0;
        const low52     = m.fiftyTwoWeekLow  ?? 0;
        const range52   = high52 - low52;
        const sentiment = range52 > 0 ? Math.round(30 + ((price - low52) / range52) * 60) : 60;

        STOCKS[tickerIndex] = {
            ...meta,
            price, change, changePct,
            marketCap: formatMarketCap(m.marketCap),
            pe:        m.trailingPE ? m.trailingPE.toFixed(1) : '—',
            high52:    high52 ? high52.toFixed(2) : '—',
            low52:     low52  ? low52.toFixed(2)  : '—',
            volume:    formatVol(m.regularMarketVolume),
            avgVol:    '—',
            sentiment,
            priceHistory: { '7d': all.slice(-7), '1m': all.slice(-22), '3m': all },
            _loaded: true,
            _source: 'yf',
        };
        return true;
    } catch (e) {
        console.warn(`[YF] Failed to fetch ${meta.ticker}:`, e.message);
        STOCKS[tickerIndex]._loaded = false;
        return false;
    }
}

async function fetchLiveIndices() {
    const indices = [
        { id: 'nifty',     symbol: '^NSEI' },
        { id: 'sensex',    symbol: '^BSESN' },
        { id: 'banknifty', symbol: '^NSEBANK' },
        { id: 'indiavix',  symbol: '^INDIAVIX' },
    ];
    for (const idx of indices) {
        try {
            const url  = `${YF_PROXY}${idx.symbol}?interval=1d&range=1d`;
            const json = await fetchWithProxy(url);
            const r    = json?.chart?.result?.[0];
            if (!r) continue;
            const m         = r.meta;
            const price     = m.regularMarketPrice;
            const prevClose = m.chartPreviousClose ?? m.previousClose ?? price;
            const change    = price - prevClose;
            const changePct = (change / prevClose) * 100;
            const isUp      = change >= 0;

            const priceEl  = document.getElementById(`idx-${idx.id}-price`);
            const changeEl = document.getElementById(`idx-${idx.id}-change`);
            const badgeEl  = document.getElementById(`idx-${idx.id}-badge`);
            if (priceEl && changeEl && badgeEl) {
                badgeEl.className   = `dash-badge ${isUp ? 'up' : 'down'}`;
                priceEl.textContent = idx.id === 'indiavix'
                    ? price.toFixed(4)
                    : price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                changeEl.className  = `dash-change ${isUp ? 'text-green' : 'text-red'}`;
                changeEl.textContent = `${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(2)} (${Math.abs(changePct).toFixed(2)}%)`;
            }
        } catch (e) {
            console.warn(`[YF] Failed to fetch index ${idx.symbol}:`, e.message);
        }
    }
}

// ── Master loader: DB first, YF fallback ────────────────────
async function loadAllLiveData() {
    const quickChipsEl = document.getElementById('quickChips');
    if (quickChipsEl) quickChipsEl.style.opacity = '0.5';

    // 1️⃣  Try local SQLite database (instant, no network needed)
    const dbResult = await loadFromDB();

    if (dbResult && dbResult.ok) {
        // DB had data — load indices from DB too
        const idxOk = await loadIndicesFromDB();
        if (!idxOk) await fetchLiveIndices();   // index fallback to YF
        showDataSourceToast('db', dbResult.date);
    } else {
        // 2️⃣  Fall back to Yahoo Finance (live, slower)
        console.log('[FinanceBOT] DB empty/unavailable — fetching from Yahoo Finance…');
        const BATCH_SIZE = 5;
        for (let i = 0; i < STOCK_METADATA.length; i += BATCH_SIZE) {
            const batch = [];
            for (let j = i; j < Math.min(i + BATCH_SIZE, STOCK_METADATA.length); j++) {
                batch.push(fetchLiveStockData(j));
            }
            await Promise.all(batch);
            if (i + BATCH_SIZE < STOCK_METADATA.length) {
                await new Promise(r => setTimeout(r, 300));
            }
        }
        await fetchLiveIndices();
        showDataSourceToast('yf', null);
    }

    buildTicker();
    if (quickChipsEl) quickChipsEl.style.opacity = '1';

    // Refresh stock card if one is open
    const tickerBadge = document.getElementById('stockTickerBadge');
    if (tickerBadge?.textContent) {
        const stock = STOCKS.find(s => s.ticker === tickerBadge.textContent.trim());
        if (stock?._loaded) displayStock(stock);
    } else {
        renderMarketDashboard();
    }

    console.log('[FinanceBOT] Data ready for', STOCKS.filter(s => s._loaded).length, '/', STOCKS.length, 'stocks');
}


// ═══════════════════════════════════════
// DATA: Indian News
// ═══════════════════════════════════════
// ═══════════════════════════════════════
// LIVE NEWS ENGINE — fetches from /api/news
// ═══════════════════════════════════════
const CAT_STYLES = {
    markets: { tag: 'MARKETS',  tagColor: '#4f8ef7', tagBg: 'rgba(79,142,247,0.12)',  accent: '#4f8ef7' },
    economy: { tag: 'ECONOMY',  tagColor: '#00d68f', tagBg: 'rgba(0,214,143,0.12)',   accent: '#00d68f' },
    tech:    { tag: 'TECH',     tagColor: '#8b5cf6', tagBg: 'rgba(139,92,246,0.12)',  accent: '#8b5cf6' },
    crypto:  { tag: 'CRYPTO',   tagColor: '#f0b429', tagBg: 'rgba(240,180,41,0.12)', accent: '#f0b429' },
    ipo:     { tag: 'IPO 🔥',    tagColor: '#f43f5e', tagBg: 'rgba(244,63,94,0.12)',  accent: '#f43f5e' },
};

const SENTIMENT_BADGE = {
    bullish: { icon: '🚀', label: 'Bullish Vibes', color: '#00d68f' },
    bearish: { icon: '🐻', label: 'Bearish Watch', color: '#ff4d6a' },
    neutral: { icon: '😐', label: 'Neutral',       color: '#8b949e' },
};

let _liveNews = [];          // current filtered list in view
let _allNews  = [];          // full fetched list
let _newsFilter = 'all';
let _newsRefreshTimer = null;

async function fetchLiveNews(forceFilter, bypassCache = false) {
    const feed = document.getElementById('newsFeed');
    const refreshBtn = document.getElementById('newsRefreshBtn');

    if (bypassCache && refreshBtn) refreshBtn.classList.add('spinning');

    if (!_allNews.length && !bypassCache) {
        // Show skeleton while loading initially
        feed.innerHTML = `
          <div class="news-loading-state">
            <div class="nl-spinner"></div>
            <p>Fetching latest stories…</p>
          </div>
        `;
    }

    try {
        const url = bypassCache ? '/api/news?force=1' : '/api/news';
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        const data = await res.json();
        if (!data.articles || data.articles.length === 0) throw new Error('No articles');
        _allNews = data.articles;
        buildNews(forceFilter || _newsFilter);
        updateMarketMood();
    } catch (err) {
        if (!_allNews.length) {
            // Full failure fallback
            feed.innerHTML = `
              <div class="news-error-state">
                <div style="font-size:2.5rem; margin-bottom:0.8rem">📡</div>
                <h3>Can't reach news feeds</h3>
                <p>Make sure you're connected to the internet. The server is fetching live RSS from Indian financial outlets.</p>
                <button onclick="fetchLiveNews(null, true)" class="retry-btn">↻ Retry</button>
              </div>
            `;
        }
    } finally {
        if (refreshBtn) refreshBtn.classList.remove('spinning');
    }
}

function buildNews(filter = 'all') {
    _newsFilter = filter;
    const feed = document.getElementById('newsFeed');

    // Apply category filter first
    let items = filter === 'all' ? _allNews : _allNews.filter(n => n.category === filter);

    if (!items.length) {
        feed.innerHTML = `<div class="news-empty">No ${filter} stories right now. Check back soon!</div>`;
        return;
    }

    // Group by sentiment
    const groups = {
        bullish: { label: '📈 Positive News',  color: '#00d68f', bg: 'rgba(0,214,143,0.08)',  border: 'rgba(0,214,143,0.25)',  items: [] },
        bearish: { label: '📉 Negative News',  color: '#ff4d6a', bg: 'rgba(255,77,106,0.08)', border: 'rgba(255,77,106,0.25)', items: [] },
        neutral: { label: '⚖️ Neutral / Info', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)',  items: [] },
    };

    items.forEach(n => {
        const key = groups[n.sentiment] ? n.sentiment : 'neutral';
        groups[key].items.push(n);
    });

    // Render each section
    let html = '';
    Object.entries(groups).forEach(([key, group]) => {
        if (!group.items.length) return;

        html += `
        <div class="news-section">
          <div class="news-section-header" style="--sec-color:${group.color}; --sec-bg:${group.bg}; --sec-border:${group.border}">
            <span class="news-section-title">${group.label}</span>
            <span class="news-section-count">${group.items.length} stor${group.items.length === 1 ? 'y' : 'ies'}</span>
          </div>
          <div class="news-section-grid">
            ${group.items.map((n, idx) => renderNewsCard(n, idx, key, group.color)).join('')}
          </div>
        </div>`;
    });

    feed.innerHTML = html;
}

function renderNewsCard(n, idx, sentiment, accentColor) {
    const cat = CAT_STYLES[n.category] || CAT_STYLES.markets;
    const isHot = idx === 0 && sentiment === 'bullish';
    const quickTake = buildQuickTake(n);

    return `
    <article class="news-card news-card--v2${isHot ? ' news-card--hot' : ''}"
             style="--card-accent:${accentColor};" tabindex="0" role="article">
      ${isHot ? '<div class="hot-banner">🔥 Top Story</div>' : ''}
      <div class="nc2-left-bar" style="background:${accentColor}"></div>
      <div class="nc2-body">
        <div class="nc2-meta">
          <span class="news-tag" style="color:${cat.tagColor}; background:${cat.tagBg}">${cat.tag}</span>
          <span class="news-time">${n.time}</span>
        </div>
        <h3 class="news-headline">${n.title}</h3>
        ${n.summary ? `<p class="news-summary">${n.summary}</p>` : ''}
        ${quickTake ? `<div class="news-quick-take">⚡ ${quickTake}</div>` : ''}
        <div class="news-footer">
          <span class="news-source">
            <span class="source-dot" style="background:${cat.accent}"></span>
            ${n.source}
          </span>
          ${n.link ? `<a class="news-read-btn" href="${n.link}" target="_blank" rel="noopener noreferrer">Read →</a>` : ''}
        </div>
      </div>
    </article>`;
}

function buildQuickTake(n) {
    const parts = [];
    const t = (n.title + ' ' + (n.summary || '')).toLowerCase();
    if (/sensex|nifty/.test(t))          parts.push('📊 Index move');
    if (/rbi|repo|rate/.test(t))          parts.push('🏦 RBI watch');
    if (/fii|fdi/.test(t))               parts.push('🌍 Foreign flows');
    if (/profit|earnings|result/.test(t)) parts.push('💰 Earnings');
    if (/crash|fall|drop|sell/.test(t))   parts.push('📉 Selling pressure');
    if (/rally|surge|jump|rise/.test(t))  parts.push('📈 Upside momentum');
    if (/ipo|listing/.test(t))            parts.push('🆕 IPO action');
    if (/crypto|bitcoin/.test(t))         parts.push('₿ Crypto move');
    return parts.slice(0, 3).join(' · ');
}

// ═══════════════════════════════════════

// MARKET MOOD WIDGET
// ═══════════════════════════════════════
function updateMarketMood() {
    const el = document.getElementById('marketMoodWidget');
    if (!el) return;
    const up = STOCKS.filter(s => s._loaded && s.change >= 0).length;
    const total = STOCKS.filter(s => s._loaded).length || 1;
    const pct = up / total;
    let mood, moodColor, sub;
    if (pct > 0.65) {
        mood = 'RISK-ON 📈'; moodColor = '#00d68f';
        sub = `Broad advance — ${Math.round(pct * 100)}% constituents bid up`;
    } else if (pct > 0.45) {
        mood = 'CONSOLIDATING ⚖️'; moodColor = '#8b5cf6';
        sub = `Mixed breadth — ${Math.round(pct * 100)}% advancing`;
    } else {
        mood = 'RISK-OFF 🔻'; moodColor = '#ff4d6a';
        sub = `Selling pressure — only ${Math.round(pct * 100)}% holding gains`;
    }
    el.innerHTML = `
      <div class="mood-label">Dalal Street Sentiment</div>
      <div class="mood-value" style="color:${moodColor}">${mood}</div>
      <div class="mood-sub">${sub}</div>
    `;
}

// ═══════════════════════════════════════
// NEWS FILTER CHIPS
// ═══════════════════════════════════════
function initNewsFilters() {
    const chips = document.querySelectorAll('#newsFilters .chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            buildNews(chip.dataset.filter);
        });
    });
}

// Auto-refresh every 5 minutes
function startNewsAutoRefresh() {
    if (_newsRefreshTimer) clearInterval(_newsRefreshTimer);
    _newsRefreshTimer = setInterval(() => fetchLiveNews(), 5 * 60 * 1000);
}




// ═══════════════════════════════════════
// TICKER DATA: Indian Indices & Stocks
// ═══════════════════════════════════════
const TICKER_DATA = [
    { symbol: 'SENSEX', price: '77,414', chg: '+1.04%', up: true },
    { symbol: 'NIFTY 50', price: '23,518', chg: '+0.98%', up: true },
    { symbol: 'NIFTY BANK', price: '50,412', chg: '+0.72%', up: true },
    { symbol: 'NIFTY IT', price: '38,220', chg: '+1.56%', up: true },
    { symbol: 'NIFTY PHARMA', price: '20,845', chg: '+0.65%', up: true },
    { symbol: 'INDIA VIX', price: '14.82', chg: '-3.20%', up: false },
    { symbol: 'RELIANCE', price: '₹2,891', chg: '+1.20%', up: true },
    { symbol: 'TCS', price: '₹4,125', chg: '+1.28%', up: true },
    { symbol: 'HDFCBANK', price: '₹1,748', chg: '-0.71%', up: false },
    { symbol: 'INFY', price: '₹1,892', chg: '+1.51%', up: true },
    { symbol: 'ICICIBANK', price: '₹1,268', chg: '+1.49%', up: true },
    { symbol: 'TATAMOTORS', price: '₹982', chg: '+2.23%', up: true },
    { symbol: 'BAJFINANCE', price: '₹7,842', chg: '+1.85%', up: true },
    { symbol: 'USD/INR', price: '83.42', chg: '+0.08%', up: false },
    { symbol: 'GOLD (MCX)', price: '₹72,450', chg: '+0.42%', up: true },
    { symbol: 'CRUDE (MCX)', price: '₹6,742', chg: '-0.35%', up: false },
];

// ═══════════════════════════════════════
// CHART RENDERING (Canvas-based sparkline)
// ═══════════════════════════════════════
function drawChart(data, isUp) {
    const canvas = document.getElementById('stockChart');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const pad = { top: 10, bottom: 10, left: 5, right: 5 };
    const iW = W - pad.left - pad.right;
    const iH = H - pad.top - pad.bottom;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const pts = data.map((v, i) => ({
        x: pad.left + (i / (data.length - 1)) * iW,
        y: pad.top + iH - ((v - min) / range) * iH
    }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    if (isUp) {
        grad.addColorStop(0, 'rgba(0,214,143,0.25)');
        grad.addColorStop(1, 'rgba(0,214,143,0.0)');
    } else {
        grad.addColorStop(0, 'rgba(255,77,106,0.25)');
        grad.addColorStop(1, 'rgba(255,77,106,0.0)');
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, iH + pad.top);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, iH + pad.top);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = isUp ? '#00d68f' : '#ff4d6a';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Dot at last point
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = isUp ? '#00d68f' : '#ff4d6a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(last.x, last.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = isUp ? 'rgba(0,214,143,0.15)' : 'rgba(255,77,106,0.15)';
    ctx.fill();
}

// ═══════════════════════════════════════
// TICKER BAR
// ═══════════════════════════════════════
function buildTicker() {
    const track = document.getElementById('tickerTrack');
    
    // Combine static indices + live stock data for live tickers
    const liveStocks = STOCKS.filter(s => s._loaded && s.price > 0);
    const dynamicItems = TICKER_DATA.filter(t => !liveStocks.find(s => s.ticker === t.symbol));
    const stockItems = liveStocks.map(s => ({
        symbol: s.ticker,
        price: `₹${s.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
        chg: `${s.changePct > 0 ? '+' : ''}${s.changePct}%`,
        up: s.change >= 0
    }));
    const allItems = [...dynamicItems, ...stockItems];
    const doubled = [...allItems, ...allItems]; // duplicate for infinite scroll
    
    track.innerHTML = doubled.map(t => `
    <div class="ticker-item">
      <span class="ticker-symbol">${t.symbol}</span>
      <span class="ticker-price">${t.price}</span>
      <span class="ticker-chg ${t.up ? 'up' : 'down'}">${t.up ? '▲' : '▼'} ${t.chg}</span>
    </div>
  `).join('');
}

// ═══════════════════════════════════════
// CLOCK (IST)
// ═══════════════════════════════════════
function updateClock() {
    const el = document.getElementById('marketTime');
    const now = new Date();
    
    // Format clock
    const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'Asia/Kolkata', hour12: true
    });
    el.textContent = `${timeStr} IST`;

    // ── NSE Market Status Logic ──
    const banner = document.getElementById('marketStatusBanner');
    if (!banner) return;

    // Get time in Kolkata
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = istTime.getDay(); // 0 is Sunday, 6 is Saturday
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentTimeObj = new Date(0, 0, 0, hours, minutes, 0);

    // NSE Timings
    const openTime = new Date(0, 0, 0, 9, 15, 0); // 9:15 AM
    const closeTime = new Date(0, 0, 0, 15, 30, 0); // 3:30 PM

    let status = 'closed';
    let title = '';
    let desc = '';
    let rightText = '';

    if (day === 0 || day === 6) {
        status = 'closed';
        title = 'Market Closed (Weekend)';
        desc = 'The National Stock Exchange is closed for the weekend. Check back on Monday morning.';
        rightText = 'TRADING PAUSED';
    } else if (currentTimeObj >= openTime && currentTimeObj < closeTime) {
        status = 'open';
        title = 'Live Trading Session Active';
        desc = 'The NSE is currently open. Prices, index levels, and sentiment are updating.';
        rightText = 'MARKETS OPEN 🟢';
    } else {
        status = 'closed';
        title = 'Market Closed';
        if (currentTimeObj < openTime) {
            desc = 'Pre-market starts at 9:00 AM IST. Normal trading resumes at 9:15 AM IST.';
             rightText = 'AWAITING OPEN';
        } else {
            desc = 'The trading session has ended for today. Data is locked at closing prices.';
            rightText = 'SESSION ENDED';
        }
    }

    // Update UI if changed to avoid unnecessary DOM paints
    // Update UI if changed to avoid unnecessary DOM paints
    if (banner.dataset.status !== status || banner.dataset.right !== rightText) {
        banner.className = `mkt-status-banner ${status}`;
        banner.dataset.status = status;
        banner.dataset.right = rightText;
        banner.innerHTML = `
            <div class="mkt-status-left">
                <div class="mkt-status-title">
                    ${status === 'open' ? '📊' : '⏸️'} ${title}
                </div>
                <div class="mkt-status-desc">${desc}</div>
            </div>
            <div class="mkt-status-right">
                ${rightText}
            </div>
        `;
    }

    // Update the top-navbar LIVE badge dynamically
    const liveBadge = document.getElementById('globalLiveBadge');
    const liveDot = document.getElementById('globalLiveDot');
    const liveText = document.getElementById('globalLiveText');
    
    if (liveBadge && liveText && liveDot) {
        if (status === 'open') {
            liveText.textContent = 'LIVE FEED';
            liveDot.style.display = 'inline-block';
            liveBadge.style.opacity = '1';
            liveBadge.style.background = 'rgba(239, 68, 68, 0.2)';
            liveBadge.style.color = '#ef4444';
        } else {
            liveText.textContent = 'MARKET CLOSED';
            liveDot.style.display = 'none';
            liveBadge.style.opacity = '0.7';
            liveBadge.style.background = 'rgba(110, 118, 129, 0.2)';
            liveBadge.style.color = '#a3aed2';
        }
    }
}




// ═══════════════════════════════════════
// STOCK DISPLAY
// ═══════════════════════════════════════
let activeRange = '7d';
// ═══════════════════════════════════════
// TECHNICAL INDICATORS MATH
// ═══════════════════════════════════════
function calcEMA(data, period) {
    if (data.length < period) return null;
    let k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
        ema = (data[i] - ema) * k + ema;
    }
    return ema;
}

function calcRSI(data, period = 14) {
    if (data.length <= period) return null;
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
        const change = data[i] - data[i-1];
        if (change > 0) gains += change;
        else losses -= change;
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < data.length; i++) {
        const change = data[i] - data[i-1];
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? -change : 0;
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

function updateTechnicalIndicators(stock) {
    // Need at least priceHistory['3m'] (up to 90 days of history from db)
    const history = stock.priceHistory?.['3m'] || [];
    
    const rsiEl = document.getElementById('techRSI');
    const rsiSt = document.getElementById('techRSIStatus');
    const e20El = document.getElementById('techEMA20');
    const e20St = document.getElementById('techEMA20Status');
    const e50El = document.getElementById('techEMA50');
    const e50St = document.getElementById('techEMA50Status');

    if (history.length < 15) {
        rsiEl.textContent = '—';
        rsiSt.textContent = 'Need Data';
        e20El.textContent = '—';
        e50El.textContent = '—';
        return;
    }

    // 1. RSI
    const rsi = calcRSI(history, 14);
    if (rsi !== null) {
        rsiEl.textContent = rsi.toFixed(1);
        if (rsi > 70) {
            rsiSt.textContent = '😎 Overbought';
            rsiSt.style.color = '#ff4d4d';
        } else if (rsi < 30) {
            rsiSt.textContent = '🔥 Oversold';
            rsiSt.style.color = '#00d68f';
        } else {
            rsiSt.textContent = '😐 Neutral';
            rsiSt.style.color = '#8b949e';
        }
    }

    const currentPrice = history[history.length - 1];

    // 2. EMA 20
    const ema20 = calcEMA(history, 20);
    if (ema20 !== null) {
        e20El.textContent = '₹' + ema20.toFixed(1);
        const diff = ((currentPrice - ema20) / ema20 * 100).toFixed(1);
        e20St.textContent = `${diff >= 0 ? '▲ +' : '▼ '}${diff}% vs Spot`;
        e20St.style.color = diff >= 0 ? '#00d68f' : '#ff4d4d';
    } else {
        e20El.textContent = '—';
        e20St.textContent = 'Not enough data';
    }

    // 3. EMA 50
    const ema50 = calcEMA(history, 50);
    if (ema50 !== null) {
        e50El.textContent = '₹' + ema50.toFixed(1);
        const diff = ((currentPrice - ema50) / ema50 * 100).toFixed(1);
        e50St.textContent = `${diff >= 0 ? '▲ +' : '▼ '}${diff}% vs Spot`;
        e50St.style.color = diff >= 0 ? '#00d68f' : '#ff4d4d';
    } else {
        e50El.textContent = '—';
        e50St.textContent = 'Not enough data';
    }
}

function formatINR(price) {
    if (typeof price !== 'number') return `₹${price}`;
    return '₹' + price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ═══════════════════════════════════════
// MARKET DASHBOARD (EMPTY STATE) RENDERER
// ═══════════════════════════════════════
function renderMarketDashboard() {
    const loadedStocks = STOCKS.filter(s => s._loaded && s.changePct !== undefined);
    if (!loadedStocks.length) return;

    // Sort by performance
    const sorted = [...loadedStocks].sort((a, b) => b.changePct - a.changePct);
    const topGainers = sorted.slice(0, 3);
    const topLosers = sorted.slice(-3).reverse(); // worst first

    const createMoverCard = (s) => {
        const isUp = s.change >= 0;
        const sign = isUp ? '▲' : '▼';
        const cls = isUp ? 'up' : 'down';
        return `
            <div class="mover-card" onclick="openMover('${s.ticker}')">
                <div class="mover-left">
                    <span class="mover-ticker">${s.emoji} ${s.ticker}</span>
                    <span class="mover-name">${s.name}</span>
                </div>
                <div class="mover-right">
                    <span class="mover-price">₹${s.price.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                    <span class="mover-change ${cls}">${sign} ${Math.abs(s.changePct).toFixed(2)}%</span>
                </div>
            </div>
        `;
    };

    const gainersEl = document.getElementById('topGainersList');
    const losersEl = document.getElementById('topLosersList');
    
    if (gainersEl) gainersEl.innerHTML = topGainers.map(createMoverCard).join('');
    if (losersEl) losersEl.innerHTML = topLosers.map(createMoverCard).join('');

    // Sector Heatmap
    const sectors = {};
    loadedStocks.forEach(s => {
        // Simplify long sector names
        const name = s.sector.split(' / ')[0].trim();
        if(!sectors[name]) sectors[name] = { totalPct: 0, count: 0 };
        sectors[name].totalPct += s.changePct;
        sectors[name].count += 1;
    });

    const sectorAvgs = Object.keys(sectors).map(k => ({
        name: k,
        avgPct: sectors[k].totalPct / sectors[k].count
    })).sort((a, b) => b.avgPct - a.avgPct);

    // Get max absolute value for scaling the bars
    const maxVal = Math.max(0.1, ...sectorAvgs.map(s => Math.abs(s.avgPct)));

    const sectorEl = document.getElementById('sectorHeatmapList');
    if (sectorEl) {
        sectorEl.innerHTML = sectorAvgs.slice(0, 7).map(s => {
            const isUp = s.avgPct >= 0;
            const sign = isUp ? '+' : '';
            const color = isUp ? 'var(--accent-green)' : 'var(--accent-red)';
            const width = Math.min(100, Math.abs(s.avgPct) / maxVal * 100);
            return `
                <div class="sector-pill">
                    <span class="sector-name">${s.name}</span>
                    <div style="display:flex; align-items:center; gap:0.5rem">
                        <span style="font-family:var(--font-mono); font-size:0.7rem; font-weight:700; color:${color}">${sign}${s.avgPct.toFixed(2)}%</span>
                        <div class="sector-bar-container">
                            <div class="sector-bar-fill" style="width:${width}%; background:${color}; ${isUp ? 'left:0;' : 'right:0;'}"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Global accessor for the inline onclick handler
window.openMover = function(ticker) {
    const s = STOCKS.find(x => x.ticker === ticker);
    if(s && s._loaded) displayStock(s);
};

function displayStock(stock) {
    if (!stock) return;
    
    // Switch to analyzer view automatically when viewing a stock
    if (typeof switchView === 'function') switchView('analyzer');

    document.getElementById('emptyState').style.display = 'none';
    const card = document.getElementById('stockCard');
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '1rem';

    const isUp = stock.change >= 0;
    const sign = isUp ? '+' : '';

    // Header
    document.getElementById('stockLogo').textContent = stock.emoji;
    document.getElementById('stockTickerBadge').textContent = stock.ticker;
    document.getElementById('stockFullName').textContent = stock.name;
    document.getElementById('stockExchange').textContent = `${stock.exchange} · ${stock.sector}`;
    document.getElementById('stockPrice').textContent = formatINR(stock.price);
    const chgEl = document.getElementById('stockChange');
    chgEl.textContent = `${sign}₹${Math.abs(stock.change).toFixed(2)} (${sign}${stock.changePct}%)`;
    chgEl.className = `stock-change ${isUp ? 'up' : 'down'}`;

    // Stats
    document.getElementById('statMarketCap').textContent = stock.marketCap;
    document.getElementById('statPE').textContent = stock.pe;
    document.getElementById('stat52H').textContent = `₹${stock.high52}`;
    document.getElementById('stat52L').textContent = `₹${stock.low52}`;
    document.getElementById('statVol').textContent = stock.volume;
    document.getElementById('statAvgVol').textContent = stock.avgVol;

    // About
    document.getElementById('stockAbout').textContent = stock.about;

    // Sentiment
    const pct = stock.sentiment;
    const fill = document.getElementById('sentimentFill');
    const thumb = document.getElementById('sentimentThumb');
    const label = document.getElementById('sentimentValue');
    fill.style.width = `${pct}%`;
    thumb.style.left = `${pct}%`;
    label.textContent = pct >= 70 ? '😊 Bullish' : pct >= 45 ? '😐 Neutral' : '😟 Bearish';

    // Deep Fundamentals UI — with colour-coding
    const fundasEl = document.getElementById('statDivYield');
    if (fundasEl) {
        // Helper: set text + colour based on a value and thresholds
        const setFunda = (id, text, raw, { greenAbove, redAbove, greenBelow, redBelow } = {}) => {
            const el = document.getElementById(id);
            el.textContent = text;
            el.style.color = '#fff'; // reset
            if (raw == null) { el.style.color = '#888'; return; }
            const n = parseFloat(raw);
            if (greenAbove !== undefined && n >= greenAbove) el.style.color = '#00d68f';
            else if (redAbove  !== undefined && n >= redAbove)  el.style.color = '#ff6b6b';
            else if (greenBelow !== undefined && n <= greenBelow) el.style.color = '#00d68f';
            else if (redBelow   !== undefined && n <= redBelow)   el.style.color = '#ff6b6b';
            else el.style.color = '#f0c040'; // amber = neutral/average
        };

        // Div Yield: >1% green, <0.5% red
        setFunda('statDivYield', stock.divYield, stock._divYieldRaw,
            { greenAbove: 1, redBelow: 0.5 });

        // EPS: just display, no colour threshold (varies by sector)
        document.getElementById('statEPS').textContent = stock.eps || 'N/A';
        document.getElementById('statEPS').style.color = stock._totalEps > 0 ? '#00d68f' : '#fff';

        // ROE: >15% green, <8% red
        setFunda('statROE', stock.roe, stock._roeRaw,
            { greenAbove: 15, redBelow: 8 });

        // Debt/Equity: <1x green, >2x red (lower is safer)
        setFunda('statDebt', stock.debtEquity, stock._deRaw,
            { greenBelow: 100, redAbove: 200 });

        // P/B: <3x green, >6x red (lower = cheaper vs book value)
        const pbRaw = stock.pbRatio ? parseFloat(stock.pbRatio) : null;
        setFunda('statPB', stock.pbRatio, pbRaw,
            { greenBelow: 3, redAbove: 6 });
    }

    // Chart
    activeRange = '7d';
    document.querySelectorAll('.chart-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.range === '7d');
    });

    requestAnimationFrame(() => {
        drawChart(stock.priceHistory['7d'], isUp);
    });

    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeRange = tab.dataset.range;
            requestAnimationFrame(() => drawChart(stock.priceHistory[activeRange], isUp));
        };
    });

    // Technical Indicators
    updateTechnicalIndicators(stock);
}

// ═══════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════
function initSearch() {
    const input = document.getElementById('stockSearch');
    const dropdown = document.getElementById('searchDropdown');
    const clearBtn = document.getElementById('searchClear');

    function showDropdown(items) {
        if (!items.length) { dropdown.classList.remove('open'); return; }
        dropdown.innerHTML = items.map(s => {
            const isUp = s.change >= 0;
            const sign = isUp ? '+' : '';
            return `
        <div class="dropdown-item" data-ticker="${s.ticker}" tabindex="0" role="option">
          <div class="dropdown-left">
            <span class="dropdown-ticker">${s.emoji} ${s.ticker}</span>
            <span class="dropdown-name">${s.name}</span>
          </div>
          <div class="dropdown-right">
            <span class="dropdown-price">${formatINR(s.price)}</span>
            <span class="dropdown-change ${isUp ? 'up' : 'down'}">${sign}${s.changePct}%</span>
          </div>
        </div>
      `;
        }).join('');
        dropdown.classList.add('open');

        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                const stock = STOCKS.find(s => s.ticker === item.dataset.ticker);
                if (stock) {
                    input.value = `${stock.ticker} — ${stock.name}`;
                    dropdown.classList.remove('open');
                    clearBtn.style.display = 'flex';
                    displayStock(stock);
                }
            });
        });
    }

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        clearBtn.style.display = q ? 'flex' : 'none';
        if (!q) { dropdown.classList.remove('open'); return; }
        const results = STOCKS.filter(s =>
            s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
        ).slice(0, 6);
        showDropdown(results);
    });

    input.addEventListener('focus', () => {
        if (input.value.trim()) {
            const q = input.value.trim().toLowerCase();
            const results = STOCKS.filter(s =>
                s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
            ).slice(0, 6);
            showDropdown(results);
        }
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.style.display = 'none';
        dropdown.classList.remove('open');
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('stockCard').style.display = 'none';
        input.focus();
    });

    document.addEventListener('click', e => {
        if (!e.target.closest('#searchBox') && !e.target.closest('#searchDropdown')) {
            dropdown.classList.remove('open');
        }
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Escape') { dropdown.classList.remove('open'); input.blur(); }
    });
}

// ═══════════════════════════════════════
// QUICK PICKS
// ═══════════════════════════════════════
function initQuickPicks() {
    document.querySelectorAll('#quickChips .quick-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            const stock = STOCKS.find(s => s.ticker === btn.dataset.ticker);
            if (stock) {
                const input = document.getElementById('stockSearch');
                const clearBtn = document.getElementById('searchClear');
                input.value = `${stock.ticker} — ${stock.name}`;
                clearBtn.style.display = 'flex';
                document.getElementById('searchDropdown').classList.remove('open');
                displayStock(stock);
            }
        });
    });
}

function closeDeepDive() {
    document.getElementById('stockCard').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    
    const input = document.getElementById('stockSearch');
    const clearBtn = document.getElementById('searchClear');
    if (input) input.value = '';
    if (clearBtn) clearBtn.style.display = 'none';

    // Clear active stock styling badge if needed
    const tickerBadge = document.getElementById('stockTickerBadge');
    if(tickerBadge) tickerBadge.textContent = '';
    
    // Switch back to Market dashboard logic
    renderMarketDashboard();
}

// ═══════════════════════════════════════
// SIMULATE LIVE PRICE FLUCTUATION
// ═══════════════════════════════════════
function simulateLivePrices() {
    setInterval(() => {
        const idx = Math.floor(Math.random() * TICKER_DATA.length);
        const items = document.querySelectorAll(`.ticker-item:nth-child(${idx + 1}), .ticker-item:nth-child(${idx + 1 + TICKER_DATA.length})`);
        items.forEach(el => {
            el.style.opacity = '0.6';
            setTimeout(() => { el.style.opacity = '1'; el.style.transition = 'opacity 0.3s'; }, 300);
        });
    }, 2000);
}

// ═══════════════════════════════════════
// PROFILE & MULTI-PROVIDER API KEY MANAGEMENT
// ═══════════════════════════════════════
const PROFILE_STORAGE = 'financebot_profile';
const API_KEYS_STORAGE = 'financebot_api_keys';
const MODEL_STORAGE = 'financebot_selected_model';
let pendingAnalysisStock = null;
let pendingAction = null; // 'analyze' or 'research'

const PROVIDERS = {
    gemini: {
        name: 'Google Gemini',
        keyLink: 'https://aistudio.google.com/apikey',
        buildUrl: (model, key) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        buildBody: (prompt, extras = {}) => ({
            contents: [{ parts: [{ text: prompt }] }],
            ...extras,
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096, ...(extras.generationConfig || {}) }
        }),
        extractText: (data) => data?.candidates?.[0]?.content?.parts?.[0]?.text,
        headers: (key) => ({ 'Content-Type': 'application/json' }),
    },
    openai: {
        name: 'OpenAI',
        keyLink: 'https://platform.openai.com/api-keys',
        buildUrl: (model, key) => 'https://api.openai.com/v1/chat/completions',
        buildBody: (prompt, extras = {}) => ({
            model: extras.model || 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4096,
        }),
        extractText: (data) => data?.choices?.[0]?.message?.content,
        headers: (key) => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` }),
    },
    claude: {
        name: 'Anthropic (Claude)',
        keyLink: 'https://console.anthropic.com/settings/keys',
        buildUrl: (model, key) => 'https://api.anthropic.com/v1/messages',
        buildBody: (prompt, extras = {}) => ({
            model: extras.model || 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
        }),
        extractText: (data) => data?.content?.[0]?.text,
        headers: (key) => ({
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        }),
    },
    deepseek: {
        name: 'DeepSeek',
        keyLink: 'https://platform.deepseek.com/api_keys',
        buildUrl: (model, key) => 'https://api.deepseek.com/chat/completions',
        buildBody: (prompt, extras = {}) => ({
            model: extras.model || 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4096,
        }),
        extractText: (data) => data?.choices?.[0]?.message?.content,
        headers: (key) => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` }),
    },
};

// ── Profile Data ──
function getProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_STORAGE)) || {}; } catch { return {}; }
}
function saveProfileData(data) {
    localStorage.setItem(PROFILE_STORAGE, JSON.stringify(data));
}

// ── API Keys ──
function getAllApiKeys() {
    try { return JSON.parse(localStorage.getItem(API_KEYS_STORAGE)) || {}; } catch { return {}; }
}
function saveAllApiKeys(keys) {
    localStorage.setItem(API_KEYS_STORAGE, JSON.stringify(keys));
}
function getApiKeyFor(provider) {
    return getAllApiKeys()[provider] || '';
}

// ── Selected Model ──
function getSelectedModel() {
    return localStorage.getItem(MODEL_STORAGE) || 'gemini-2.0-flash';
}
function setSelectedModel(model) {
    localStorage.setItem(MODEL_STORAGE, model);
}
function getSelectedProvider() {
    const sel = document.getElementById('modelSelect');
    if (!sel) return 'gemini';
    const opt = sel.options[sel.selectedIndex];
    return opt?.dataset?.provider || 'gemini';
}

// ── Backward compat: getApiKey returns key for current provider ──
function getApiKey() {
    return getApiKeyFor(getSelectedProvider());
}

// ── Profile Panel Toggle ──
function toggleProfile() {
    const panel = document.getElementById('profilePanel');
    const overlay = document.getElementById('profileOverlay');
    const isOpen = panel.classList.contains('open');

    if (isOpen) {
        closeProfile();
    } else {
        // Populate fields
        const profile = getProfile();
        document.getElementById('profileName').value = profile.name || '';
        if (profile.user_type) document.getElementById('profileUserType').value = profile.user_type;
        if (profile.experience) document.getElementById('profileExperience').value = profile.experience;
        if (profile.style) document.getElementById('profileStyle').value = profile.style;
        if (profile.risk_tolerance) document.getElementById('profileRisk').value = profile.risk_tolerance;

        const keys = getAllApiKeys();
        ['gemini', 'openai', 'claude', 'deepseek'].forEach(p => {
            const el = document.getElementById(`key-${p}`);
            if (el) el.value = keys[p] || '';
        });
        updateKeyBadges();

        panel.classList.add('open');
        overlay.classList.add('open');
    }
}

function closeProfile() {
    document.getElementById('profilePanel').classList.remove('open');
    document.getElementById('profileOverlay').classList.remove('open');
}

function saveProfile() {
    // Save basic details
    const name = document.getElementById('profileName').value.trim();
    const user_type = document.getElementById('profileUserType').value;
    const experience = document.getElementById('profileExperience').value;
    const style = document.getElementById('profileStyle').value;
    const risk_tolerance = document.getElementById('profileRisk').value;
    
    const profileData = { name, user_type, experience, style, risk_tolerance };
    saveProfileData(profileData);

    // Sync to backend asynchronously
    fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
    }).catch(err => console.error('Failed to sync profile to backend:', err));

    // Save API keys
    const keys = {};
    ['gemini', 'openai', 'claude', 'deepseek'].forEach(p => {
        const val = document.getElementById(`key-${p}`).value.trim();
        if (val) keys[p] = val;
    });
    saveAllApiKeys(keys);

    // Update UI
    updateProfileAvatar();
    updateKeyBadges();
    updateModelKeyStatus();

    // Migrate old key if it exists
    const oldKey = localStorage.getItem('financebot_gemini_api_key');
    if (oldKey && !keys.gemini) {
        keys.gemini = oldKey;
        saveAllApiKeys(keys);
        localStorage.removeItem('financebot_gemini_api_key');
    }

    // Show saved message
    const msg = document.getElementById('profileSavedMsg');
    msg.textContent = '✓ Profile saved successfully!';
    setTimeout(() => { msg.textContent = ''; }, 2500);

    // If there was a pending action, trigger it
    if (pendingAnalysisStock && pendingAction) {
        const stock = pendingAnalysisStock;
        const action = pendingAction;
        pendingAnalysisStock = null;
        pendingAction = null;
        closeProfile();
        if (action === 'analyze') analyzeStock(stock);
        else if (action === 'research') researchStock(stock);
    }
}

function updateProfileAvatar() {
    const profile = getProfile();
    const initials = document.getElementById('profileInitials');
    if (profile.name) {
        const parts = profile.name.split(' ');
        initials.textContent = parts.length > 1
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : parts[0][0].toUpperCase();
    } else {
        initials.textContent = '?';
    }
}

function updateKeyBadges() {
    const keys = getAllApiKeys();
    ['gemini', 'openai', 'claude', 'deepseek'].forEach(p => {
        const badge = document.getElementById(`badge-${p}`);
        if (keys[p]) {
            badge.textContent = '✓ Connected';
            badge.className = 'api-key-badge connected';
        } else {
            badge.textContent = 'Missing';
            badge.className = 'api-key-badge missing';
        }
    });
}

function updateModelKeyStatus() {
    const provider = getSelectedProvider();
    const hasKey = !!getApiKeyFor(provider);
    const statusEl = document.getElementById('modelKeyStatus');
    if (hasKey) {
        statusEl.textContent = '✓ Key Set';
        statusEl.className = 'model-key-status has-key';
    } else {
        statusEl.textContent = '✗ No Key';
        statusEl.className = 'model-key-status no-key';
    }
}

function onModelChange() {
    const model = document.getElementById('modelSelect').value;
    setSelectedModel(model);
    updateModelKeyStatus();
}

// ── API Key Modal (fallback for quick entry) ──
function showApiKeyModal() {
    const provider = getSelectedProvider();
    const providerInfo = PROVIDERS[provider];

    document.getElementById('apiKeyModalTitle').textContent = `Connect ${providerInfo.name}`;
    document.getElementById('apiKeyModalDesc').textContent = `Enter your ${providerInfo.name} API key to enable AI-powered stock analysis.`;
    document.getElementById('apiKeyModalLink').href = providerInfo.keyLink;
    document.getElementById('apiKeyInput').value = getApiKeyFor(provider);
    document.getElementById('apiKeyInput').placeholder = `Paste your ${providerInfo.name} API key`;

    document.getElementById('apiKeyModal').style.display = 'flex';
    document.getElementById('apiKeyInput').focus();
}

function closeApiKeyModal() {
    document.getElementById('apiKeyModal').style.display = 'none';
    pendingAnalysisStock = null;
    pendingAction = null;
}

function saveApiKeyFromModal() {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (!key) {
        document.getElementById('apiKeyInput').style.borderColor = '#ff4d6a';
        return;
    }
    const provider = getSelectedProvider();
    const keys = getAllApiKeys();
    keys[provider] = key;
    saveAllApiKeys(keys);
    updateKeyBadges();
    updateModelKeyStatus();
    closeApiKeyModal();

    // If there was a pending action, trigger it now
    if (pendingAnalysisStock && pendingAction) {
        const stock = pendingAnalysisStock;
        const action = pendingAction;
        pendingAnalysisStock = null;
        pendingAction = null;
        if (action === 'analyze') analyzeStock(stock);
        else if (action === 'research') researchStock(stock);
    }
}

// ═══════════════════════════════════════
// MULTI-PROVIDER API CALL HELPER
// ═══════════════════════════════════════
async function callAI(prompt, extras = {}) {
    const model = getSelectedModel();
    const provider = getSelectedProvider();
    const apiKey = getApiKeyFor(provider);
    const providerConfig = PROVIDERS[provider];

    if (!apiKey) throw new Error(`No API key for ${providerConfig.name}. Please add it in your Profile.`);

    const url = providerConfig.buildUrl(model, apiKey);
    const body = providerConfig.buildBody(prompt, { model, ...extras });
    const headers = providerConfig.headers(apiKey);

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || errData?.error?.type || `API Error (${response.status})`;
        if (response.status === 401 || response.status === 403) {
            throw new Error(`Invalid API key for ${providerConfig.name}. Please update it in your Profile. (${errMsg})`);
        }
        throw new Error(errMsg);
    }

    const data = await response.json();
    const text = providerConfig.extractText(data);

    if (!text) throw new Error(`Empty response from ${providerConfig.name}. Please try again.`);

    return text;
}

// ═══════════════════════════════════════
// GEMINI AI ANALYSIS — CORE
// ═══════════════════════════════════════
let currentAnalysisStock = null;

function handleAnalyze() {
    const tickerEl = document.getElementById('stockTickerBadge');
    if (!tickerEl || !tickerEl.textContent) return;

    const stock = STOCKS.find(s => s.ticker === tickerEl.textContent.trim());
    if (!stock) return;

    const apiKey = getApiKey();
    if (!apiKey) {
        pendingAnalysisStock = stock;
        pendingAction = 'analyze';
        showApiKeyModal();
        return;
    }

    analyzeStock(stock);
}

function buildAnalysisPrompt(stock) {
    const isUp = stock.change >= 0;
    const sign = isUp ? '+' : '';

    return `You are a senior equity research analyst specializing in the Indian stock market (NSE/BSE). Provide a comprehensive analysis of the following stock. Be specific, data-driven, and actionable.

STOCK DATA:
- Ticker: ${stock.ticker}
- Company: ${stock.name}
- Exchange: ${stock.exchange}
- Sector: ${stock.sector}
- Current Price: ₹${stock.price}
- Change: ${sign}₹${stock.change} (${sign}${stock.changePct}%)
- Market Cap: ${stock.marketCap}
- P/E Ratio: ${stock.pe}
- 52-Week High: ₹${stock.high52}
- 52-Week Low: ₹${stock.low52}
- Volume: ${stock.volume}
- Avg Volume: ${stock.avgVol}
- About: ${stock.about}

Provide your analysis in EXACTLY 4 sections using these EXACT headings:

## FUNDAMENTAL ANALYSIS
Analyze the company's fundamentals. Cover:
- Earnings quality and revenue growth trajectory
- Valuation multiples (P/E, P/B, EV/EBITDA) vs sector peers
- Debt-to-equity and financial health
- Return on Equity (ROE) and Return on Capital Employed (ROCE)
- Perceived risk factors (regulatory, competitive, macro)
- Give a FUNDAMENTAL SCORE out of 10

## TECHNICAL ANALYSIS
Analyze technical and macroeconomic factors. Cover:
- Current price vs 52-week range and what it implies
- Volume trends and what they signal
- Support and resistance levels
- Impact of Indian economic trends (GDP growth, monsoon, RBI policy) on this stock
- Impact of inflation (CPI) on the sector
- RSI/momentum indicators direction
- Give a TECHNICAL SCORE out of 10

## MARKET SENTIMENT
Analyze investor psychology and sentiment. Cover:
- FII (Foreign Institutional Investor) and DII (Domestic Institutional Investor) activity in this stock/sector
- Retail investor sentiment and crowd behavior
- Recent news sentiment (positive/negative catalysts)
- Behavioral finance concepts applicable (herding, anchoring, FOMO, etc.)
- Social media and analyst consensus sentiment
- Give a SENTIMENT SCORE out of 10

## INVESTMENT HORIZON
Provide separate outlook for different investor types:
- **Short-term (1-3 months):** Trading outlook, catalysts, risk/reward
- **Mid-term (6-12 months):** Expected trajectory, key events ahead
- **Long-term (2-5 years):** Structural growth story, compounding potential, biggest risks
- Recommend which horizon suits this stock best and why

IMPORTANT: Be specific to ${stock.name} and the Indian market context. Use real financial reasoning. Each section should have 4-6 bullet points. Use **bold** for key terms. Keep each section concise but insightful.`;
}

async function analyzeStock(stock) {
    currentAnalysisStock = stock;

    // UI state: show loading, hide others
    document.getElementById('analyzeBtn').disabled = true;
    document.getElementById('analysisPanel').style.display = 'none';
    document.getElementById('analysisError').style.display = 'none';
    document.getElementById('analysisLoading').style.display = 'flex';

    const prompt = buildAnalysisPrompt(stock);

    try {
        const text = await callAI(prompt);
        renderAnalysis(text);

    } catch (err) {
        console.error('Analysis error:', err);
        document.getElementById('analysisLoading').style.display = 'none';
        document.getElementById('analysisError').style.display = 'flex';
        document.getElementById('analysisErrorMsg').textContent = err.message || 'Something went wrong. Please try again.';

        if (err.message?.toLowerCase().includes('api key') || err.message?.toLowerCase().includes('profile')) {
            document.getElementById('analysisErrorMsg').innerHTML =
                err.message + '<br><a href="#" onclick="toggleProfile(); return false;" style="color:#8b5cf6; font-weight:600;">Open Profile</a>';
        }
    } finally {
        document.getElementById('analyzeBtn').disabled = false;
    }
}

// ═══════════════════════════════════════
// RESPONSE RENDERING
// ═══════════════════════════════════════
function renderAnalysis(rawText) {
    document.getElementById('analysisLoading').style.display = 'none';
    document.getElementById('analysisError').style.display = 'none';

    // Parse the 4 sections
    const sections = parseGeminiSections(rawText);

    const tabMap = {
        fundamental: sections.fundamental || 'Analysis not available.',
        technical: sections.technical || 'Analysis not available.',
        sentiment: sections.sentiment || 'Analysis not available.',
        horizon: sections.horizon || 'Analysis not available.',
    };

    const contentEl = document.getElementById('analysisContent');
    contentEl.innerHTML = Object.entries(tabMap).map(([key, html]) =>
        `<div class="analysis-tab-body ${key === 'fundamental' ? 'active' : ''}" data-tab-content="${key}">${html}</div>`
    ).join('');

    // Show panel, set active tab
    document.getElementById('analysisPanel').style.display = 'block';
    document.querySelectorAll('#analysisTabs .atab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === 'fundamental');
    });

    // Scroll to analysis
    document.getElementById('analysisPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function parseGeminiSections(text) {
    const result = { fundamental: '', technical: '', sentiment: '', horizon: '' };

    // Split by ## headings
    const sectionRegex = /## ?(FUNDAMENTAL ANALYSIS|TECHNICAL ANALYSIS|MARKET SENTIMENT|INVESTMENT HORIZON)/gi;
    const parts = text.split(sectionRegex);

    for (let i = 1; i < parts.length; i += 2) {
        const heading = parts[i].toLowerCase();
        const content = parts[i + 1] || '';

        let key = '';
        if (heading.includes('fundamental')) key = 'fundamental';
        else if (heading.includes('technical')) key = 'technical';
        else if (heading.includes('sentiment')) key = 'sentiment';
        else if (heading.includes('horizon') || heading.includes('investment')) key = 'horizon';

        if (key) {
            result[key] = markdownToHTML(content.trim());
        }
    }

    return result;
}

function markdownToHTML(md) {
    let html = md;

    // Extract and convert score lines (e.g. "FUNDAMENTAL SCORE: 7/10")
    html = html.replace(/\*?\*?(\w+)\s*SCORE\s*:?\s*(\d+)\s*\/\s*10\*?\*?/gi, (_, label, score) => {
        const num = parseInt(score);
        const cls = num >= 7 ? 'bullish' : num >= 5 ? 'neutral' : 'bearish';
        return `<span class="score-badge ${cls}">${label} Score: ${score}/10</span>`;
    });

    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    const lines = html.split('\n');
    const processed = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('<h3>') || trimmed.startsWith('<ul>') || trimmed.startsWith('<li>') || trimmed.startsWith('<span')) {
            processed.push(trimmed);
        } else {
            processed.push(`<p>${trimmed}</p>`);
        }
    }

    return processed.join('\n');
}

// ═══════════════════════════════════════
// ANALYSIS TAB SWITCHING
// ═══════════════════════════════════════
function initAnalysisTabs() {
    document.querySelectorAll('#analysisTabs .atab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            document.querySelectorAll('#analysisTabs .atab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('#analysisContent .analysis-tab-body').forEach(body => {
                body.classList.toggle('active', body.dataset.tabContent === target);
            });
        });
    });
}

// ═══════════════════════════════════════
// GEMINI WEB RESEARCH — CORE
// ═══════════════════════════════════════
const RESEARCH_FACTORS = [
    { key: 'inflation', emoji: '📉', name: 'Inflation Impact' },
    { key: 'economic', emoji: '🏛️', name: 'Economic Strength & Peers' },
    { key: 'substitutes', emoji: '🔄', name: 'Substitutes & Alternatives' },
    { key: 'incidental', emoji: '📋', name: 'Incidental Transactions' },
    { key: 'demographics', emoji: '👥', name: 'Demographics' },
    { key: 'trends', emoji: '📊', name: 'Trends & Momentum' },
    { key: 'liquidity', emoji: '💧', name: 'Liquidity' },
];

function handleResearch() {
    const tickerEl = document.getElementById('stockTickerBadge');
    if (!tickerEl || !tickerEl.textContent) return;
    const stock = STOCKS.find(s => s.ticker === tickerEl.textContent.trim());
    if (!stock) return;
    researchStock(stock);
}

function buildResearchPrompt(stock) {
    const horizon = document.getElementById('researchHorizon')?.value || 'medium term';
    const risk    = document.getElementById('researchRisk')?.value    || 'medium';

    return `Act as a cautious, experienced long-term investor specializing in Indian stock markets (NSE/BSE).
I am thinking of investing in ${stock.name} (${stock.ticker}).
My investment horizon is ${horizon} and my risk level is ${risk}.

Please analyze this stock based on the following 7 factors:
1. Business model clarity — is the business easy to understand and durable?
2. Revenue growth trend — is the company growing its topline consistently?
3. Profit consistency — are net profits stable or erratic?
4. Debt level — is the debt manageable relative to earnings?
5. Promoter holding trend — are insiders buying or selling?
6. Valuation — is the stock overvalued, undervalued, or fairly priced vs. peers?
7. Key risks — what are the top 2-3 risks that could hurt this investment?

End your analysis with a clear one-line verdict: **BUY / AVOID / WATCH** — and explain your reasoning in plain, simple language that any investor can understand.

Here is the current financial data for this stock (treat as ground truth):
---
Ticker: ${stock.ticker} | Name: ${stock.name}
Sector: ${stock.sector} | Exchange: ${stock.exchange}
Current Price: ₹${stock.price} | Market Cap: ${stock.marketCap}
P/E Ratio: ${stock.pe} | P/B Ratio: ${stock.pbRatio || 'N/A'}
52W High: ₹${stock.high52} | 52W Low: ₹${stock.low52}
Volume: ${stock.volume} | Avg Volume: ${stock.avgVol}
Dividend Yield: ${stock.divYield || 'N/A'} | Trailing EPS: ${stock.eps || 'N/A'}
ROE: ${stock.roe || 'N/A'} | Debt/Equity: ${stock.debtEquity || 'N/A'}
About: ${stock.about}
---

IMPORTANT: Use the data above as your foundation. Write in plain English. Be direct and honest — if it's a risky stock, say so clearly. Format the response in 7 numbered sections followed by the verdict.`;
}

async function researchStock(stock) {
    document.getElementById('researchBtn').disabled = true;
    document.getElementById('researchPanel').style.display = 'none';
    document.getElementById('researchError').style.display = 'none';
    document.getElementById('researchLoading').style.display = 'flex';

    const prompt = buildResearchPrompt(stock);

    try {
        const text = await callAI(prompt);
        renderResearch(text);
    } catch (err) {
        console.error('Research error:', err);
        document.getElementById('researchLoading').style.display = 'none';
        document.getElementById('researchError').style.display = 'flex';
        document.getElementById('researchErrorMsg').textContent = err.message || 'Something went wrong. Please try again.';

        if (err.message?.toLowerCase().includes('api key') || err.message?.toLowerCase().includes('profile')) {
            document.getElementById('researchErrorMsg').innerHTML =
                err.message + '<br><a href="#" onclick="toggleProfile(); return false;" style="color:#00d68f; font-weight:600;">Open Profile</a>';
        }
    } finally {
        document.getElementById('researchBtn').disabled = false;
    }
}

// ═══════════════════════════════════════
// RESEARCH RENDERING — Accordion Cards
// ═══════════════════════════════════════
function renderResearch(rawText, ragContext) {
    document.getElementById('researchLoading').style.display = 'none';
    document.getElementById('researchError').style.display = 'none';

    const sections = parseResearchSections(rawText);
    const factorsEl = document.getElementById('researchFactors');

    // ── RAG Citation Badge ──
    let ragBadge = '';
    if (ragContext && ragContext.total > 0) {
        const specific = ragContext.stock_specific;
        const macro = ragContext.macro_context;
        ragBadge = `
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem;
                        padding:0.5rem 0.9rem; border-radius:8px;
                        background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.2);">
                <span style="font-size:0.75rem;">📡</span>
                <span style="font-size:0.72rem; color:var(--text-secondary);">
                    <strong style="color:var(--accent-primary);">Micro-RAG Grounded</strong> —
                    ${specific} stock-specific article${specific !== 1 ? 's' : ''} +
                    ${macro} macro context article${macro !== 1 ? 's' : ''} retrieved live.
                    Analysis grounded on real-time sources.
                </span>
            </div>
        `;
    }

    factorsEl.innerHTML = ragBadge + RESEARCH_FACTORS.map((factor, idx) => {
        const content = sections[factor.key] || '<p>Data not available.</p>';
        const expandedClass = idx === 0 ? 'expanded' : '';
        return `
        <div class="factor-card ${expandedClass}" data-factor="${factor.key}">
            <div class="factor-header" onclick="toggleFactor(this)">
                <span class="factor-emoji">${factor.emoji}</span>
                <span class="factor-name">${factor.name}</span>
                <svg class="factor-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </div>
            <div class="factor-body">${content}</div>
        </div>`;
    }).join('');

    document.getElementById('researchPanel').style.display = 'block';
    document.getElementById('researchPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function parseResearchSections(text) {
    const result = {};
    const sectionRegex = /## ?(INFLATION|ECONOMIC STRENGTH AND PEERS|SUBSTITUTES|INCIDENTAL TRANSACTIONS|DEMOGRAPHICS|TRENDS|LIQUIDITY)/gi;
    const parts = text.split(sectionRegex);

    for (let i = 1; i < parts.length; i += 2) {
        const heading = parts[i].toLowerCase();
        const content = parts[i + 1] || '';

        let key = '';
        if (heading.includes('inflation')) key = 'inflation';
        else if (heading.includes('economic') || heading.includes('peers')) key = 'economic';
        else if (heading.includes('substitut')) key = 'substitutes';
        else if (heading.includes('incidental')) key = 'incidental';
        else if (heading.includes('demograph')) key = 'demographics';
        else if (heading.includes('trend')) key = 'trends';
        else if (heading.includes('liquidi')) key = 'liquidity';

        if (key) {
            result[key] = markdownToHTML(content.trim());
        }
    }

    return result;
}

function toggleFactor(headerEl) {
    const card = headerEl.closest('.factor-card');
    card.classList.toggle('expanded');
}

// ═══════════════════════════════════════
// RESET ALL ON STOCK SWITCH
// ═══════════════════════════════════════
function resetAnalysis() {
    document.getElementById('analysisPanel').style.display = 'none';
    document.getElementById('analysisLoading').style.display = 'none';
    document.getElementById('analysisError').style.display = 'none';
    document.getElementById('researchPanel').style.display = 'none';
    document.getElementById('researchLoading').style.display = 'none';
    document.getElementById('researchError').style.display = 'none';
    currentAnalysisStock = null;
}

// Override displayStock to reset analysis when switching stocks
const _originalDisplayStock = displayStock;
displayStock = function (stock) {
    resetAnalysis();
    _originalDisplayStock(stock);
};

// ═══════════════════════════════════════
// VIEW SWITCHING
// ═══════════════════════════════════════
function switchView(view) {
    const tabMarkets       = document.getElementById('tabMarkets');
    const tabTradingLab    = document.getElementById('tabTradingLab');
    const tabInvestCircle  = document.getElementById('tabInvestCircle');
    const panelStock       = document.getElementById('panelStock');
    const panelNews        = document.getElementById('panelNews');
    const panelTradingLab  = document.getElementById('panelTradingLab');
    const panelIC          = document.getElementById('panelInvestCircle');
    const mainLayout       = document.getElementById('mainLayout');

    // Reset ALL tabs and panels
    [tabMarkets, tabTradingLab, tabInvestCircle]
        .forEach(t => t && t.classList.remove('active'));
    [panelNews, panelStock, panelTradingLab]
        .forEach(p => p && p.classList.remove('active'));
    if (panelIC) panelIC.style.display = 'none';
    if (mainLayout) mainLayout.classList.remove('split-view');

    if (view === 'tradinglab') {
        tabTradingLab.classList.add('active');
        panelTradingLab.classList.add('active');
        tlRender();
    } else if (view === 'investcircle') {
        tabInvestCircle && tabInvestCircle.classList.add('active');
        if (panelIC) {
            panelIC.style.display = 'flex';
            if (typeof icRenderAll === 'function') icRenderAll();
        }
    } else { // 'markets'
        tabMarkets && tabMarkets.classList.add('active');
        panelNews.classList.add('active');
        panelStock.classList.add('active');
        if (mainLayout) mainLayout.classList.add('split-view');
    }
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
function init() {
    switchView('markets'); // Set default view

    buildTicker();
    updateClock();
    setInterval(updateClock, 1000);

    fetchLiveNews();
        initNewsFilters();
        startNewsAutoRefresh();

    initSearch();
    initQuickPicks();
    simulateLivePrices();
    initAnalysisTabs();

    // ── Load Live Data from Yahoo Finance ──
    loadAllLiveData();
    setInterval(loadAllLiveData, 1000);

    // ── Profile & Model Init ──
    // Fetch profile from backend
    fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
            if (data.profile) {
                saveProfileData(data.profile);
                updateProfileAvatar();
            } else {
                // First time user: Prompt to create profile
                setTimeout(() => toggleProfile(), 1000);
            }
        }).catch(() => {
            // Fallback to local
            updateProfileAvatar();
        });

    // Restore saved model selection
    const savedModel = getSelectedModel();
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
        modelSelect.value = savedModel;
        if (modelSelect.value !== savedModel) modelSelect.value = 'gemini-2.0-flash';
    }
    updateModelKeyStatus();

    // Migrate old single Gemini key to new system
    const oldKey = localStorage.getItem('financebot_gemini_api_key');
    if (oldKey) {
        const keys = getAllApiKeys();
        if (!keys.gemini) {
            keys.gemini = oldKey;
            saveAllApiKeys(keys);
        }
        localStorage.removeItem('financebot_gemini_api_key');
    }

    // Close modal on overlay click
    document.getElementById('apiKeyModal').addEventListener('click', (e) => {
        if (e.target.id === 'apiKeyModal') closeApiKeyModal();
    });

    // Enter key to submit API key
    document.getElementById('apiKeyInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveApiKeyFromModal();
    });
}

document.addEventListener('DOMContentLoaded', init);

// ═══════════════════════════════════════
// UPDATE BUTTON — DB Refresh Flow
// ═══════════════════════════════════════
async function triggerDBRefresh() {
    const btn       = document.getElementById('updateDbBtn');
    const icon      = document.getElementById('updateDbIcon');
    const label     = document.getElementById('updateDbLabel');
    const overlay   = document.getElementById('refreshModalOverlay');
    const logEl     = document.getElementById('refreshLog');
    const statusEl  = document.getElementById('refreshModalStatus');
    const fillEl    = document.getElementById('refreshProgressFill');
    const footerEl  = document.getElementById('refreshModalFooter');

    // Disable button & start spinning
    btn.disabled = true;
    btn.classList.add('spinning');
    label.textContent = 'Updating…';

    // Open modal
    logEl.innerHTML = '';
    statusEl.textContent = 'Starting fetch…';
    fillEl.style.width = '0%';
    footerEl.style.display = 'none';
    overlay.style.display = 'flex';

    const addLine = (text, cls = '') => {
        const span = document.createElement('span');
        span.className = `refresh-log-line ${cls}`;
        span.textContent = text;
        logEl.appendChild(span);
        logEl.scrollTop = logEl.scrollHeight;
    };

    // Track progress for the fill bar (20 stocks + 4 indices = 24 items)
    let doneItems = 0;
    const TOTAL_ITEMS = 24;

    addLine('⏳ Connecting to Yahoo Finance…', 'dim');

    try {
        const res = await fetch('/api/db/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            addLine(`❌ Error: ${err.error || res.statusText}`, 'fail');
            statusEl.textContent = 'Failed';
            footerEl.style.display = 'flex';
            return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop(); // keep incomplete last line

            for (const raw of lines) {
                if (!raw.trim()) continue;
                let parsed;
                try { parsed = JSON.parse(raw); } catch { continue; }

                if (parsed.done) {
                    // Fetch script finished
                    fillEl.style.width = '100%';
                    statusEl.textContent = parsed.code === 0 ? '✅ Complete' : '⚠️ Partial';
                    addLine('', '');
                    addLine(parsed.code === 0
                        ? '✅ All stocks updated successfully!'
                        : '⚠️ Update complete with some errors.', parsed.code === 0 ? 'ok' : 'fail');
                    footerEl.style.display = 'flex';
                    break;
                }

                if (parsed.line !== undefined) {
                    const line = parsed.line;
                    // Color-code by content
                    let cls = '';
                    if (line.includes('✅') || line.includes('+'))   cls = 'ok';
                    else if (line.includes('❌') || line.includes('⚠️')) cls = 'fail';
                    else if (line.includes('═') || line.includes('📊') || line.includes('📈')) cls = 'header';
                    else if (line.trim() === '')                      cls = 'dim';

                    addLine(line, cls);
                    statusEl.textContent = line.includes('[') ? line.trim() : statusEl.textContent;

                    // Advance progress bar when a stock line finishes
                    if (/\[(\d+)\/20\]/.test(line) && (line.includes('✅') || line.includes('❌'))) {
                        doneItems++;
                        fillEl.style.width = `${Math.min(95, (doneItems / TOTAL_ITEMS) * 100)}%`;
                    }
                }
            }
        }
    } catch (e) {
        addLine(`❌ Network error: ${e.message}`, 'fail');
        statusEl.textContent = 'Error';
        footerEl.style.display = 'flex';
    } finally {
        btn.disabled = false;
        btn.classList.remove('spinning');
        label.textContent = 'Update';
    }
}

function closeRefreshModal() {
    document.getElementById('refreshModalOverlay').style.display = 'none';
    // Reload all data from the freshly updated DB
    showDataSourceToast('db', new Date().toISOString().slice(0, 10));
    loadAllLiveData();
}

// ═══════════════════════════════════════════════════════════
// MARKET ASSISTANT CHATBOT — ChromaDB-backed RAG (requires API key in Profile)
// Uses knowledge-base.js for retrieval + STOCKS for live data
// ═══════════════════════════════════════════════════════════

let chatHistories = {
    'education': [],
    'prediction': []
};
let currentChatMode = 'education';

const EDU_SUGGESTIONS = [
    'What is P/E Ratio?',
    'What is a Bull Market?',
    'Explain NSE vs BSE',
    'Tax on Short Term vs Long Term'
];
const PRED_SUGGESTIONS = [
    'Analyze Reliance Industries future trends',
    'Is HDFC Bank undervalued based on P/B?',
    'Give a bearish thesis on TCS',
    'Forecast technical resistance for Infosys'
];

function toggleChatbot() {
    const panel = document.getElementById('chatbotPanel');
    const isOpen = panel.classList.contains('open');
    panel.classList.toggle('open');
    if (!isOpen && chatHistories[currentChatMode].length === 0) {
        renderChatWelcome();
    }
}

function setChatMode(mode) {
    currentChatMode = mode;
    document.querySelectorAll('.chat-mode-pill').forEach(btn => btn.classList.remove('active'));
    if (mode === 'education') {
        document.getElementById('btnModeEdu').classList.add('active');
        document.getElementById('chatInput').placeholder = "Ask rule or policy doubts...";
    } else {
        document.getElementById('btnModePred').classList.add('active');
        document.getElementById('chatInput').placeholder = "Ask prediction/analysis questions...";
    }
    
    const suggestEl = document.getElementById('chatSuggestions');
    const messages = document.getElementById('chatMessages');
    messages.innerHTML = '';
    
    if (chatHistories[mode].length === 0) {
        renderChatWelcome();
    } else {
        if (suggestEl) suggestEl.style.display = 'none';
        chatHistories[mode].forEach(msg => {
            if (msg.role === 'user') appendUserMessage(msg.text);
            if (msg.role === 'bot') appendBotMessage(msg.text, false);
        });
    }
}

function renderChatWelcome() {
    const messages = document.getElementById('chatMessages');
    messages.innerHTML = '';
    appendBotMessage(`👋 Hi! I'm your **Market Assistant**.

I can answer your stock market questions — from beginner basics to advanced investing concepts. I also have live data for all 20 stocks tracked on MarketPulse.

Try asking me anything, or pick a suggestion below:`, true);

    const suggestEl = document.getElementById('chatSuggestions');
    if (suggestEl) {
        const activeSuggestions = currentChatMode === 'education' ? EDU_SUGGESTIONS : PRED_SUGGESTIONS;
        suggestEl.innerHTML = activeSuggestions.slice(0, 4).map(s =>
            `<button class="chat-suggestion" onclick="sendSuggestion('${s.replace(/'/g,"\\'")}')">${s}</button>`
        ).join('');
        suggestEl.style.display = 'flex';
    }
}

function sendSuggestion(text) {
    document.getElementById('chatInput').value = text;
    sendChatMessage();
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const query = input.value.trim();
    if (!query) return;
    input.value = '';

    // Hide suggestions after first message
    const suggestEl = document.getElementById('chatSuggestions');
    if (suggestEl) suggestEl.style.display = 'none';

    appendUserMessage(query);
    chatHistories[currentChatMode].push({ role: 'user', text: query });

    // Show typing indicator
    const typingId = appendTypingIndicator();

    // Await the async RAG response
    const response = await generateChatResponse(query);
    removeTypingIndicator(typingId);
    appendBotMessage(response, false);
    chatHistories[currentChatMode].push({ role: 'bot', text: response });
}

async function generateChatResponse(query) {
    // 1. Get API key — scan ALL saved provider keys, use the first valid one.
    // This is robust: works regardless of which model is selected in the dropdown.
    const allKeys = (typeof getAllApiKeys === 'function') ? getAllApiKeys() : {};
    const savedKey = allKeys['gemini'] || allKeys['claude'] || allKeys['openai'] || '';
    const savedModel = (typeof getSelectedModel === 'function') ? getSelectedModel() : 'gemini-1.5-flash';

    console.log('[RAG Chat] Provider keys found:', Object.keys(allKeys), '| Using key?', !!savedKey, '| Model:', savedModel);

    if (!savedKey) {
        return `⚠️ **API Key Required for Market Assistant**\n\nTo get AI-powered answers, please add your **Gemini API key** in the Profile panel (top-right corner).\n\nYour key is used to:\n- Embed your question and search through 60+ knowledge articles\n- Generate a personalised, grounded answer\n\n_The same key you use for Deep Research works here too!_`;
    }

    // 2. Detect if query mentions a stock — inject live data as context
    let stockContext = '';
    const stockMatch = typeof detectStockMention === 'function' ? detectStockMention(query) : null;
    if (stockMatch && stockMatch._loaded !== false) {
        const s = stockMatch;
        stockContext = `Stock: ${s.name} (${s.ticker}) — ${s.sector} on ${s.exchange}\n` +
            `Price: ₹${s.price?.toFixed(2)} | Change: ${s.changePct >= 0 ? '+' : ''}${s.changePct?.toFixed(2)}%\n` +
            `Market Cap: ${s.marketCap} | P/E: ${s.pe} | P/B: ${s.pbRatio || 'N/A'}\n` +
            `52W High: ₹${s.high52} | 52W Low: ₹${s.low52}\n` +
            `EPS: ${s.eps || 'N/A'} | ROE: ${s.roe || 'N/A'} | Debt/Equity: ${s.debtEquity || 'N/A'}\n` +
            `Dividend Yield: ${s.divYield || 'N/A'}\nAbout: ${s.about}`;
    }

    // 3. Call the RAG backend
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query,
                api_key: savedKey,
                model: savedModel,
                stock_context: stockContext,
                mode: currentChatMode
            }),
            signal: AbortSignal.timeout(45000)
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            const msg = data.error || 'Something went wrong.';
            if (msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('api_key')) {
                return `⚠️ **API Key Issue**\n\n${msg}\n\n<a href="#" onclick="toggleProfile(); return false;" style="color:#8b5cf6; font-weight:600;">Open Profile →</a>`;
            }
            return `❌ **Error:** ${msg}`;
        }

        // 4. Build the final response with sources
        let response = data.answer || 'No answer returned.';

        if (data.sources && data.sources.length > 0) {
            response += `\n\n---\n📚 **Sources searched (${data.total_docs_searched} docs):** ${data.sources.map(s => `_${s}_`).join(', ')}`;
        }

        return response;

    } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            return `⏱ **Request timed out.** The RAG engine may still be building its index (first request takes ~30s to embed all documents). Please try again!`;
        }
        return `❌ **Network Error:** ${err.message}`;
    }
}

function appendUserMessage(text) {
    const messages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg-user';
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function appendBotMessage(text, isWelcome = false) {
    const messages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg-bot';
    div.innerHTML = chatMarkdown(text);
    if (isWelcome) div.classList.add('chat-welcome');
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}
function appendTypingIndicator() {
    const messages = document.getElementById('chatMessages');
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg-bot chat-typing';
    div.id = id;
    div.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    document.getElementById(id)?.remove();
}

function chatMarkdown(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/^---$/gm, '<hr>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#8b5cf6">$1</a>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^(.+)$/, '<p>$1</p>');
}


function initChatbot() {
    const input = document.getElementById('chatInput');
    if (input) {
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }

    // Voice Input Setup
    const voiceBtn = document.getElementById('voiceInputBtn');
    if (voiceBtn && ('webkitSpeechRecognition' in window)) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            voiceBtn.classList.add('recording');
            input.placeholder = "Listening...";
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            input.value = transcript;
            sendChatMessage(); // Auto send after speaking
        };

        recognition.onerror = function(event) {
            console.error("Speech recognition error", event.error);
            voiceBtn.classList.remove('recording');
            input.placeholder = "Ask anything about stocks, ratios, investing…";
        };

        recognition.onend = function() {
            voiceBtn.classList.remove('recording');
            input.placeholder = "Ask anything about stocks, ratios, investing…";
        };

        voiceBtn.onclick = function() {
            if (voiceBtn.classList.contains('recording')) {
                recognition.stop();
            } else {
                recognition.start();
            }
        };
    } else if (voiceBtn) {
        voiceBtn.style.display = 'none'; // Hide if unsupported
    }
}

// Initialize chatbot on DOM ready
document.addEventListener('DOMContentLoaded', initChatbot);

// ═══════════════════════════════════════════════════════════
// TRADING LAB ENGINE
// Virtual paper trading simulator with ₹1,00,000 virtual capital
// ═══════════════════════════════════════════════════════════

const TL_INITIAL_CASH = 100000;
const TL_KEY = 'tradinglab_v1';

let tlState = null;
let tlModalMode = 'buy'; // 'buy' or 'sell'
let tlModalTicker = null;

function tlLoadState() {
    try {
        const raw = localStorage.getItem(TL_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
        cash: TL_INITIAL_CASH,
        holdings: {},   // { TICKER: { qty, avgBuy } }
        history: []     // [ { time, ticker, action, qty, price } ]
    };
}

function tlSaveState() {
    localStorage.setItem(TL_KEY, JSON.stringify(tlState));
}

function tlInit() {
    if (!tlState) tlState = tlLoadState();
}

function tlGetStockPrice(ticker) {
    const s = STOCKS.find(s => s.ticker === ticker);
    return s && s.price > 0 ? s.price : null;
}

function tlCalcPortfolioValue() {
    let total = 0;
    for (const [ticker, h] of Object.entries(tlState.holdings)) {
        const price = tlGetStockPrice(ticker);
        if (price) total += price * h.qty;
    }
    return total;
}

function tlFmt(n) {
    return '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function tlUpdateStats() {
    if (!tlState) return;
    const portVal = tlCalcPortfolioValue();
    const totalVal = tlState.cash + portVal;
    const pnl = totalVal - TL_INITIAL_CASH;
    const ret = ((pnl / TL_INITIAL_CASH) * 100).toFixed(2);

    const cashEl = document.getElementById('tlCash');
    const portEl = document.getElementById('tlPortfolioValue');
    const pnlEl = document.getElementById('tlPnL');
    const retEl = document.getElementById('tlReturn');

    if (cashEl) cashEl.textContent = tlFmt(tlState.cash);
    if (portEl) portEl.textContent = tlFmt(portVal);
    if (pnlEl) {
        pnlEl.textContent = (pnl >= 0 ? '+' : '-') + tlFmt(pnl);
        pnlEl.className = 'tl-stat-value ' + (pnl >= 0 ? 'positive' : 'negative');
    }
    if (retEl) {
        retEl.textContent = (ret >= 0 ? '+' : '') + ret + '%';
        retEl.className = 'tl-stat-value ' + (ret >= 0 ? 'positive' : 'negative');
    }
}

function tlGetBestPrice(ticker) {
    // Primary: live STOCKS price
    const s = STOCKS.find(s => s.ticker === ticker);
    if (s && s.price > 0) return s.price;
    // Fallback: saved avgBuy from existing holdings
    if (tlState && tlState.holdings[ticker]) return tlState.holdings[ticker].avgBuy;
    return null;
}

function tlRenderWatchlist() {
    const body = document.getElementById('tlWatchlistBody');
    if (!body) return;
    body.innerHTML = STOCKS.map(s => {
        const price = s.price > 0 ? s.price : null;
        const priceStr = price ? '₹' + price.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '<span style="color:var(--text-muted)">Loading...</span>';
        const chgCls = s.change >= 0 ? 'up' : 'down';
        const chgStr = s.changePct !== undefined && s.price > 0
            ? (s.change >= 0 ? '▲ ' : '▼ ') + Math.abs(s.changePct).toFixed(2) + '%' : '—';
        const held = tlState && tlState.holdings[s.ticker];
        const high52 = s.high52 && s.high52 !== '—' ? s.high52 : '—';
        const low52 = s.low52 && s.low52 !== '—' ? s.low52 : '—';
        const vol = s.volume || '—';
        const hasHolding = held && held.qty > 0;
        return `
        <div class="tl-wl-row">
            <div class="tl-wl-instrument">
                <span class="tl-wl-emoji">${s.emoji}</span>
                <div>
                    <div class="tl-wl-name">${s.ticker}${hasHolding ? ' <span style="font-size:0.65rem;color:var(--accent-primary);font-weight:600;">[${held.qty}]</span>' : ''}</div>
                    <div class="tl-wl-fullname">${s.name}</div>
                </div>
            </div>
            <div class="tl-wl-price">${priceStr}</div>
            <div class="tl-wl-chg ${chgCls}">${chgStr}</div>
            <div class="tl-wl-52w"><div>H: ₹${high52}</div><div>L: ₹${low52}</div></div>
            <div class="tl-wl-num">${vol}</div>
            <div class="tl-wl-actions">
                <button class="tl-wl-buy" onclick="tlOpenModal('${s.ticker}', 'buy')">B</button>
                <button class="tl-wl-sell" onclick="tlOpenModal('${s.ticker}', 'sell')" ${!hasHolding ? 'disabled' : ''}>S</button>
            </div>
        </div>`;
    }).join('');
}

function tlRenderHoldings() {
    const list = document.getElementById('tlHoldingsList');
    const table = document.getElementById('tlPortfolioTable');
    const empty = document.getElementById('tlHoldingsEmpty');
    if (!list) return;

    const entries = Object.entries(tlState.holdings).filter(([, h]) => h.qty > 0);
    if (entries.length === 0) {
        if (table) table.style.display = 'none';
        if (empty) empty.style.display = 'flex';
        return;
    }
    if (empty) empty.style.display = 'none';
    if (table) table.style.display = 'block';

    list.innerHTML = entries.map(([ticker, h]) => {
        const s = STOCKS.find(s => s.ticker === ticker);
        const ltp = tlGetStockPrice(ticker) || h.avgBuy;
        const pnl = (ltp - h.avgBuy) * h.qty;
        const pnlCls = pnl >= 0 ? 'tl-pt-pnl-pos' : 'tl-pt-pnl-neg';
        return `
        <div class="tl-pt-row">
            <div><div class="tl-pt-ticker">${s ? s.emoji : ''} ${ticker}</div><div class="tl-pt-name">${h.qty} shares</div></div>
            <div>${h.qty}</div>
            <div>₹${h.avgBuy.toLocaleString('en-IN', {maximumFractionDigits:2})}</div>
            <div>₹${ltp.toLocaleString('en-IN', {maximumFractionDigits:2})}</div>
            <div class="${pnlCls}">${pnl >= 0 ? '+' : ''}₹${Math.abs(pnl).toLocaleString('en-IN', {maximumFractionDigits:2})}</div>
            <button class="tl-pt-sell-btn" onclick="tlOpenModal('${ticker}', 'sell')">Sell</button>
        </div>`;
    }).join('');
}

function tlRenderHistory() {
    const list = document.getElementById('tlHistoryList');
    const table = document.getElementById('tlHistoryTable');
    const empty = document.getElementById('tlHistoryEmpty');
    if (!list) return;

    if (!tlState.history.length) {
        if (table) table.style.display = 'none';
        if (empty) empty.style.display = 'flex';
        return;
    }
    if (empty) empty.style.display = 'none';
    if (table) table.style.display = 'block';

    list.innerHTML = [...tlState.history].reverse().slice(0, 30).map(t => {
        const s = STOCKS.find(s => s.ticker === t.ticker);
        return `
        <div class="tl-ht-row">
            <div>${t.time}</div>
            <div>${s ? s.emoji + ' ' : ''}${t.ticker}</div>
            <div class="${t.action === 'BUY' ? 'tl-badge-buy' : 'tl-badge-sell'}">${t.action}</div>
            <div>${t.qty}</div>
            <div>₹${t.price.toLocaleString('en-IN', {maximumFractionDigits:2})}</div>
        </div>`;
    }).join('');
}

function tlRender() {
    tlInit();
    tlUpdateStats();
    tlRenderWatchlist();
    tlRenderHoldings();
    tlRenderHistory();
}


// Modal
function tlOpenModal(ticker, mode) {
    tlInit();
    const s = STOCKS.find(s => s.ticker === ticker);
    if (!s) return;

    // Use best available price — DB price, live Yahoo price, or existing avg buy
    const price = tlGetBestPrice(ticker) || (tlState.holdings[ticker] ? tlState.holdings[ticker].avgBuy : null);
    if (!price) { alert(`Price for ${ticker} is not available yet. Please wait a moment for data to load.`); return; }

    tlModalMode = mode;
    tlModalTicker = ticker;

    // Header
    const badge = document.getElementById('tlModalAction');
    const titleEl = document.getElementById('tlModalTitle');
    if (badge) { badge.textContent = mode.toUpperCase(); badge.className = mode === 'sell' ? 'tl-modal-action-badge sell-badge' : 'tl-modal-action-badge'; }
    if (titleEl) titleEl.textContent = ticker;

    document.getElementById('tlModalStock').textContent = `${s.emoji} ${s.name}`;
    document.getElementById('tlModalPrice').textContent = '₹' + price.toLocaleString('en-IN', {maximumFractionDigits:2});
    document.getElementById('tlQtyInput').value = 1;

    const confirmBtn = document.getElementById('tlConfirmBtn');
    if (mode === 'buy') {
        document.getElementById('tlModalBalanceLabel').textContent = 'Available Cash';
        document.getElementById('tlModalBalance').textContent = tlFmt(tlState.cash);
        confirmBtn.textContent = 'Confirm Buy';
        confirmBtn.className = 'tl-confirm-btn';
    } else {
        const held = tlState.holdings[ticker];
        document.getElementById('tlModalBalanceLabel').textContent = 'Shares Held';
        document.getElementById('tlModalBalance').textContent = held ? held.qty : 0;
        confirmBtn.textContent = 'Confirm Sell';
        confirmBtn.className = 'tl-confirm-btn sell-mode';
    }

    tlUpdateModalCost();
    document.getElementById('tlModalOverlay').classList.add('open');
    document.getElementById('tlModal').classList.add('open');
}

function tlCloseModal() {
    document.getElementById('tlModalOverlay').classList.remove('open');
    document.getElementById('tlModal').classList.remove('open');
    tlModalTicker = null;
}

function tlChangeQty(delta) {
    const input = document.getElementById('tlQtyInput');
    const cur = parseInt(input.value) || 1;
    input.value = Math.max(1, cur + delta);
    tlUpdateModalCost();
}

function tlUpdateModalCost() {
    if (!tlModalTicker) return;
    // Use best available price — never silently fail
    const price = tlGetBestPrice(tlModalTicker);
    const qty = parseInt(document.getElementById('tlQtyInput').value) || 1;
    const total = price ? price * qty : 0;
    // #tlModalTotal IS the <strong> element itself — no querySelector needed
    const el = document.getElementById('tlModalTotal');
    if (el) el.textContent = '₹' + total.toLocaleString('en-IN', {maximumFractionDigits:2});
}

async function tlExecuteTrade() {
    if (!tlModalTicker) return;
    // Use best available price with fallback chain
    const price = tlGetBestPrice(tlModalTicker);
    const qty = parseInt(document.getElementById('tlQtyInput').value) || 1;
    if (!price) {
        alert('⚠️ Price unavailable. Please wait for data to load and try again.');
        return;
    }
    if (qty < 1) return;

    const total = price * qty;
    const now = new Date().toLocaleTimeString('en-IN', {
        hour:'2-digit', minute:'2-digit', timeZone:'Asia/Kolkata', hour12:true
    });
    const dateKey = new Date().toLocaleDateString('en-CA', {timeZone:'Asia/Kolkata'}); // YYYY-MM-DD

    if (tlModalMode === 'buy') {
        if (total > tlState.cash) {
            alert(`❌ Insufficient balance!\nNeed ₹${total.toLocaleString('en-IN',{maximumFractionDigits:2})} · Have ₹${tlState.cash.toLocaleString('en-IN',{maximumFractionDigits:2})}`);
            return;
        }
        const existing = tlState.holdings[tlModalTicker];
        if (existing) {
            const newAvg = ((existing.avgBuy * existing.qty) + total) / (existing.qty + qty);
            tlState.holdings[tlModalTicker] = { qty: existing.qty + qty, avgBuy: parseFloat(newAvg.toFixed(2)) };
        } else {
            tlState.holdings[tlModalTicker] = { qty, avgBuy: parseFloat(price.toFixed(2)) };
        }
        tlState.cash -= total;

    } else {
        const existing = tlState.holdings[tlModalTicker];
        if (!existing || existing.qty < qty) {
            alert(`❌ You only hold ${existing ? existing.qty : 0} shares of ${tlModalTicker}.`);
            return;
        }
        existing.qty -= qty;
        if (existing.qty === 0) delete tlState.holdings[tlModalTicker];
        tlState.cash += total;
    }

    const trade = {
        time: now,
        date: dateKey,
        ticker: tlModalTicker,
        action: tlModalMode.toUpperCase(),
        qty,
        price: parseFloat(price.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        cashAfter: parseFloat(tlState.cash.toFixed(2))
    };

    tlState.history.push(trade);
    tlSaveState();

    // Persist to server-side trading DB
    tlPersistTrade(trade).catch(() => {}); // non-blocking

    tlCloseModal();
    tlRender();

    // Flash success toast
    tlShowToast(`✅ ${trade.action} ${qty} × ${tlModalTicker} @ ₹${price.toLocaleString('en-IN',{maximumFractionDigits:2})}`, trade.action === 'BUY' ? 'green' : 'red');
}

async function tlPersistTrade(trade) {
    try {
        await fetch('/api/trade', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(trade)
        });
    } catch(e) { /* server-side DB is optional — localStorage is source of truth */ }
}

function tlShowToast(msg, color = 'green') {
    let t = document.getElementById('tlToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'tlToast';
        t.style.cssText = `position:fixed;bottom:5rem;left:50%;transform:translateX(-50%);
            padding:.65rem 1.4rem;border-radius:999px;font-size:.85rem;font-weight:600;
            backdrop-filter:blur(12px);z-index:9999;transition:opacity .35s;
            border:1px solid rgba(255,255,255,0.15);color:#fff;white-space:nowrap;`;
        document.body.appendChild(t);
    }
    t.style.background = color === 'green' ? 'rgba(5,150,105,0.95)' : 'rgba(220,38,38,0.95)';
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

function tlConfirmReset() {
    if (confirm('Reset your entire Trading Lab portfolio back to ₹1,00,000? All trades and history will be erased.')) {
        localStorage.removeItem(TL_KEY);
        tlState = tlLoadState();
        tlRender();
    }
}

async function tlGenerateSummary() {
    tlInit();
    const summaryEl = document.getElementById('tlAiSummary');
    const contentEl = document.getElementById('tlAiContent');
    summaryEl.style.display = 'block';

    // ── Loading state ──────────────────────────────────────────
    contentEl.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.8rem;padding:1.5rem 0;">
            <div style="width:40px;height:40px;border:3px solid rgba(124,140,248,0.2);border-top-color:#7c8cf8;border-radius:50%;animation:spin 0.9s linear infinite;"></div>
            <div style="font-size:0.85rem;color:#8b949e;font-weight:600;">AI Coach is analysing your portfolio…</div>
            <div style="font-size:0.75rem;color:#4e5a6e;">Running deep trade analysis · Risk scoring · Strategy review</div>
        </div>`;

    // ── Fix key lookup: use the same multi-provider key system ─
    const allKeys = (typeof getAllApiKeys === 'function') ? getAllApiKeys() : {};
    const apiKey  = allKeys['gemini'] || allKeys['openai'] || allKeys['claude'] || '';
    const model   = (typeof getSelectedModel === 'function') ? getSelectedModel() : 'gemini-2.0-flash';

    if (!apiKey) {
        contentEl.innerHTML = `
            <div style="text-align:center;padding:1.2rem 0;color:#6e7681;">
                <div style="font-size:1.8rem;margin-bottom:0.5rem;">🔑</div>
                <div style="font-weight:700;color:#c9d1d9;margin-bottom:0.4rem;">API Key Required</div>
                <div style="font-size:0.78rem;line-height:1.5;">Add your Gemini / OpenAI / Claude key in the<br>
                <a href="#" onclick="toggleProfile();return false;" style="color:#7c8cf8;font-weight:700;">Profile Panel →</a></div>
            </div>`;
        return;
    }

    // ── Collect full portfolio data ────────────────────────────
    const portVal       = tlCalcPortfolioValue();
    const totalVal      = tlState.cash + portVal;
    const pnl           = totalVal - TL_INITIAL_CASH;
    const pnlPct        = ((pnl / TL_INITIAL_CASH) * 100).toFixed(2);
    const holdings      = Object.entries(tlState.holdings).filter(([, h]) => h.qty > 0);
    const allTrades     = tlState.history;
    const buyTrades     = allTrades.filter(t => t.action === 'BUY');
    const sellTrades    = allTrades.filter(t => t.action === 'SELL');
    const cashDeployed  = (TL_INITIAL_CASH - tlState.cash).toFixed(2);
    const cashPct       = ((tlState.cash / TL_INITIAL_CASH) * 100).toFixed(1);
    const portPct       = ((portVal / TL_INITIAL_CASH) * 100).toFixed(1);

    // Holdings detail with full P&L per stock
    const holdingsDetail = holdings.map(([ticker, h]) => {
        const s       = STOCKS.find(x => x.ticker === ticker);
        const ltp     = (s && s.price > 0) ? s.price : h.avgBuy;
        const curVal  = ltp * h.qty;
        const pnlH    = (ltp - h.avgBuy) * h.qty;
        const pnlPctH = ((ltp - h.avgBuy) / h.avgBuy * 100).toFixed(2);
        const weight  = portVal > 0 ? ((curVal / portVal) * 100).toFixed(1) : '0.0';
        return `  • ${ticker} (${s ? s.sector : 'Unknown'} — ${s ? s.name : ticker}): ${h.qty} shares | Avg Buy ₹${h.avgBuy} | LTP ₹${ltp.toFixed(2)} | Current Value ₹${curVal.toFixed(2)} | P&L ₹${pnlH.toFixed(2)} (${pnlPctH}%) | Portfolio Weight ${weight}%`;
    }).join('\n') || '  No open positions.';

    // Sector breakdown
    const sectorMap = {};
    holdings.forEach(([ticker, h]) => {
        const s = STOCKS.find(x => x.ticker === ticker);
        const sec = s ? s.sector : 'Unknown';
        const ltp = (s && s.price > 0) ? s.price : h.avgBuy;
        sectorMap[sec] = (sectorMap[sec] || 0) + ltp * h.qty;
    });
    const sectorDetail = Object.entries(sectorMap)
        .sort((a, b) => b[1] - a[1])
        .map(([sec, val]) => `  • ${sec}: ₹${val.toFixed(2)} (${portVal > 0 ? ((val / portVal) * 100).toFixed(1) : 0}% of holdings)`)
        .join('\n') || '  No sector data.';

    // Trade history
    const recentTrades = allTrades.slice(-30).map(t =>
        `  ${t.action} ${t.qty}x ${t.ticker} @ ₹${t.price} | Total ₹${t.total} | Cash After ₹${t.cashAfter} | ${t.time}`
    ).join('\n') || '  No trades yet.';

    // Largest single position
    const largestPos = holdings.length > 0
        ? holdings.reduce((max, [tk, h]) => {
            const s = STOCKS.find(x => x.ticker === tk);
            const ltp = (s && s.price > 0) ? s.price : h.avgBuy;
            const val = ltp * h.qty;
            return val > max.val ? { ticker: tk, val } : max;
          }, { ticker: '', val: 0 })
        : null;
    const concentrationRisk = largestPos && portVal > 0
        ? ((largestPos.val / portVal) * 100).toFixed(1) : '0';

    // ── THE PROMPT ─────────────────────────────────────────────
    const SYSTEM_PROMPT = `You are an elite Indian stock market portfolio coach and analyst — like a SEBI-registered advisor who trains retail investors on NSE/BSE. You are reviewing a paper trading session and must deliver a structured, professional, and actionable performance report. Be honest, specific, and data-driven. Avoid generic advice. Reference the actual stocks, sectors, and numbers provided.`;

    const USER_PROMPT = `
=== PAPER TRADING PORTFOLIO REPORT ===

CAPITAL SUMMARY:
  Starting Capital:   ₹1,00,000
  Current Cash:       ₹${tlState.cash.toFixed(2)} (${cashPct}% idle)
  Portfolio Value:    ₹${portVal.toFixed(2)} (${portPct}% deployed)
  Total Value:        ₹${totalVal.toFixed(2)}
  Unrealised P&L:     ₹${pnl.toFixed(2)} (${pnlPct}%)
  Capital Deployed:   ₹${cashDeployed}

OPEN HOLDINGS (${holdings.length} positions):
${holdingsDetail}

SECTOR BREAKDOWN:
${sectorDetail}

CONCENTRATION RISK:
  Largest position: ${largestPos ? largestPos.ticker : 'None'} at ${concentrationRisk}% of portfolio

TRADE STATISTICS:
  Total Trades:  ${allTrades.length}
  Buys:          ${buyTrades.length}
  Sells:         ${sellTrades.length}
  Unique Stocks: ${[...new Set(allTrades.map(t => t.ticker))].join(', ') || 'None'}

FULL TRADE LOG (last 30):
${recentTrades}

=== YOUR TASK ===

Deliver a structured JSON response with exactly this format:

{
  "overall_grade": "A/B/C/D/F",
  "grade_reason": "One crisp sentence why",
  "score": 72,
  "sections": [
    {
      "emoji": "📊",
      "title": "Portfolio Performance",
      "body": "Detailed analysis of P&L, returns vs Nifty50 baseline (assume 0% for paper trading), and whether capital is being used efficiently."
    },
    {
      "emoji": "🏗️",
      "title": "Portfolio Construction",
      "body": "Analyse diversification across sectors, concentration risk, position sizing discipline. Call out specific stocks by name."
    },
    {
      "emoji": "⚠️",
      "title": "Risk Flags",
      "body": "Identify specific risks: overexposure to one sector, single-stock concentration, too much cash drag, or panic selling patterns. Be direct."
    },
    {
      "emoji": "🎯",
      "title": "Trade Behaviour Analysis",
      "body": "Analyse the sequence of buys and sells. Look for FOMO buying, panic selling, averaging down patterns, or smart accumulation. Be specific about which trades were smart and which were mistakes."
    },
    {
      "emoji": "💡",
      "title": "3 Actionable Improvements",
      "body": "Give exactly 3 numbered, specific action items the trader should implement this week. Reference actual stocks from their portfolio."
    },
    {
      "emoji": "🏆",
      "title": "Coach's Verdict",
      "body": "A 2–3 sentence direct, honest, encouraging summary. Acknowledge what's working. End with one motivational line."
    }
  ]
}

IMPORTANT:
- Be specific — name actual stocks from the portfolio
- If no trades: acknowledge it and give advice on how to start
- If losing money: be honest but constructive
- If doing well: highlight what's working and warn about complacency
- Always reference Indian market context (NSE/BSE, Nifty 50, sector cycles)
- Return ONLY valid JSON, no markdown, no extra text outside the JSON`;

    // ── Call backend ───────────────────────────────────────────
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query:         USER_PROMPT,
                api_key:       apiKey,
                model:         model,
                stock_context: '',
                mode:          'education'
            }),
            signal: AbortSignal.timeout(60000)
        });

        const data = await res.json();
        let raw    = data.answer || '';

        // ── Try to parse JSON from response ───────────────────
        let report = null;
        try {
            // Strip markdown code fences if present
            const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            report = JSON.parse(jsonStr);
        } catch (_) {
            // If AI didn't return JSON, render raw text gracefully
            contentEl.innerHTML = _tlCoachFallbackHTML(raw);
            return;
        }

        // ── Render the structured report ───────────────────────
        contentEl.innerHTML = _tlCoachRenderReport(report);

    } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            contentEl.innerHTML = `<div style="color:#ff6b6b;padding:1rem;text-align:center;">⏱ Request timed out. The AI is busy — try again in a moment.</div>`;
        } else {
            contentEl.innerHTML = `<div style="color:#ff6b6b;padding:1rem;text-align:center;">❌ ${err.message}</div>`;
        }
    }
}

// ─── Render structured coach report ──────────────────────────
function _tlCoachRenderReport(r) {
    const gradeColors = { A: '#00d68f', B: '#5bc8f5', C: '#f0c040', D: '#ff9944', F: '#ff4d6a' };
    const gradeColor  = gradeColors[r.overall_grade] || '#8b949e';
    const score       = Math.min(100, Math.max(0, r.score || 50));

    let html = `
    <div style="font-family:inherit;">
      <!-- Grade Header -->
      <div style="display:flex;align-items:center;gap:1rem;padding:1rem 1.2rem;background:rgba(15,18,35,0.9);border:1px solid rgba(255,255,255,0.07);border-radius:14px;margin-bottom:1rem;">
        <div style="width:56px;height:56px;border-radius:14px;background:${gradeColor}22;border:2px solid ${gradeColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="font-size:1.6rem;font-weight:900;color:${gradeColor};">${r.overall_grade || '?'}</span>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.72rem;color:#6e7681;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;">Overall Grade</div>
          <div style="font-size:0.85rem;color:#c9d1d9;line-height:1.4;">${r.grade_reason || ''}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-size:0.65rem;color:#6e7681;margin-bottom:4px;">COACH SCORE</div>
          <div style="font-size:1.4rem;font-weight:800;color:${gradeColor};">${score}<span style="font-size:0.8rem;color:#6e7681;">/100</span></div>
        </div>
      </div>

      <!-- Score bar -->
      <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;margin-bottom:1.2rem;overflow:hidden;">
        <div style="height:100%;width:${score}%;background:linear-gradient(90deg,${gradeColor},${gradeColor}88);border-radius:2px;transition:width 1s ease;"></div>
      </div>

      <!-- Sections -->
      <div style="display:flex;flex-direction:column;gap:0.8rem;">`;

    (r.sections || []).forEach(sec => {
        html += `
        <div style="background:rgba(22,27,42,0.7);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:0.9rem 1rem;transition:border-color 0.2s;">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.55rem;">
            <span style="font-size:1rem;">${sec.emoji || '•'}</span>
            <span style="font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#7c8cf8;">${sec.title || ''}</span>
          </div>
          <div style="font-size:0.80rem;color:#a0aec0;line-height:1.65;">${(sec.body || '').replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e6edf3;">$1</strong>')}</div>
        </div>`;
    });

    html += `
      </div>

      <!-- Footer -->
      <div style="margin-top:1rem;padding:0.7rem 1rem;background:rgba(124,140,248,0.06);border:1px solid rgba(124,140,248,0.15);border-radius:10px;font-size:0.68rem;color:#6e7681;text-align:center;">
        🤖 Analysis by AI Coach · based on your actual trade history · Paper Trading Only
      </div>
    </div>`;

    return html;
}

// ─── Fallback if JSON parse fails ────────────────────────────
function _tlCoachFallbackHTML(raw) {
    return `
    <div style="padding:0.5rem 0;">
      <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#7c8cf8;margin-bottom:0.6rem;">🤖 AI Coach Review</div>
      <div style="font-size:0.82rem;color:#a0aec0;line-height:1.7;">
        ${raw.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e6edf3;">$1</strong>')
             .replace(/\n\n/g, '<br><br>')
             .replace(/\n/g, '<br>')}
      </div>
    </div>`;
}

// Auto-refresh Trading Lab stats when prices update
setInterval(() => {
    if (document.getElementById('panelTradingLab')?.classList.contains('active')) {
        tlUpdateStats();
        tlRenderHoldings();
        tlRenderWatchlist();
    }
}, 1000);
