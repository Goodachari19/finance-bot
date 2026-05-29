#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════╗
║  Finance BOT — Daily Data Fetcher                           ║
║  Pulls latest prices from Yahoo Finance → SQLite DB         ║
║                                                              ║
║  Usage:                                                      ║
║    python3 db/fetch_stocks.py           # fetch today       ║
║    python3 db/fetch_stocks.py --history # + 90d history     ║
║    python3 db/fetch_stocks.py --show    # print DB summary   ║
╚══════════════════════════════════════════════════════════════╝
"""

import sqlite3
import os
import sys
import json
import argparse
import time
from datetime import datetime, timezone, timedelta

# ── Try importing yfinance; give a clear error if missing ──
try:
    import yfinance as yf
except ImportError:
    print("❌  yfinance not installed. Run: pip3 install yfinance")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────
DB_DIR    = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(DB_DIR)
DB_PATH   = os.path.join(PROJECT_DIR, "data", "marketpulse.db")
SCHEMA    = os.path.join(DB_DIR, "schema.sql")

IST       = timezone(timedelta(hours=5, minutes=30))
TODAY_IST = datetime.now(IST).strftime("%Y-%m-%d")

# 20 major Indian stocks (NSE)
# Ticker overrides: some NSE tickers have different Yahoo Finance symbols
# Key = app ticker, Value = Yahoo Finance symbol (without .NS suffix)
YF_SYMBOL_MAP = {
    "TATAMOTORS": "TATAMOTORS",   # works with -EQ suffix
    "ZOMATO":     "ZOMATO",
}

STOCKS = [
    {"ticker": "RELIANCE",   "yf": "RELIANCE",   "name": "Reliance Industries Ltd.",        "sector": "Conglomerate / Energy",        "emoji": "⚡"},
    {"ticker": "TCS",        "yf": "TCS",        "name": "Tata Consultancy Services Ltd.",  "sector": "Information Technology",        "emoji": "💻"},
    {"ticker": "HDFCBANK",   "yf": "HDFCBANK",   "name": "HDFC Bank Ltd.",                  "sector": "Banking & Finance",             "emoji": "🏦"},
    {"ticker": "INFY",       "yf": "INFY",       "name": "Infosys Ltd.",                    "sector": "Information Technology",        "emoji": "🌐"},
    {"ticker": "ICICIBANK",  "yf": "ICICIBANK",  "name": "ICICI Bank Ltd.",                 "sector": "Banking & Finance",             "emoji": "🏛️"},
    {"ticker": "HINDUNILVR", "yf": "HINDUNILVR", "name": "Hindustan Unilever Ltd.",         "sector": "FMCG",                          "emoji": "🛒"},
    {"ticker": "TATAMOTORS", "yf": "TATAMOTORS", "name": "Tata Motors Ltd.",                "sector": "Automobile",                    "emoji": "🚗"},
    {"ticker": "SUNPHARMA",  "yf": "SUNPHARMA",  "name": "Sun Pharmaceutical Industries",   "sector": "Pharmaceuticals",               "emoji": "💊"},
    {"ticker": "BAJFINANCE", "yf": "BAJFINANCE", "name": "Bajaj Finance Ltd.",              "sector": "NBFC",                          "emoji": "📈"},
    {"ticker": "WIPRO",      "yf": "WIPRO",      "name": "Wipro Ltd.",                      "sector": "Information Technology",        "emoji": "🔧"},
    {"ticker": "ADANIENT",   "yf": "ADANIENT",   "name": "Adani Enterprises Ltd.",          "sector": "Infrastructure / Conglomerate", "emoji": "🏗️"},
    {"ticker": "ZOMATO",     "yf": "ZOMATO",     "name": "Zomato Ltd.",                     "sector": "Consumer Tech / Food Delivery", "emoji": "🍔"},
    {"ticker": "ITC",        "yf": "ITC",        "name": "ITC Ltd.",                        "sector": "FMCG / Conglomerate",           "emoji": "🌿"},
    {"ticker": "AXISBANK",   "yf": "AXISBANK",   "name": "Axis Bank Ltd.",                  "sector": "Banking & Finance",             "emoji": "🔵"},
    {"ticker": "KOTAKBANK",  "yf": "KOTAKBANK",  "name": "Kotak Mahindra Bank Ltd.",        "sector": "Banking & Finance",             "emoji": "🟡"},
    {"ticker": "LT",         "yf": "LT",         "name": "Larsen & Toubro Ltd.",            "sector": "Engineering & Infrastructure",  "emoji": "🏛️"},
    {"ticker": "NTPC",       "yf": "NTPC",       "name": "NTPC Ltd.",                       "sector": "Power / Energy",                "emoji": "⚙️"},
    {"ticker": "ONGC",       "yf": "ONGC",       "name": "Oil & Natural Gas Corporation",   "sector": "Oil & Gas",                     "emoji": "🛢️"},
    {"ticker": "SBIN",       "yf": "SBIN",       "name": "State Bank of India",             "sector": "Banking & Finance",             "emoji": "🇮🇳"},
    {"ticker": "MARUTI",     "yf": "MARUTI",     "name": "Maruti Suzuki India Ltd.",        "sector": "Automobile",                    "emoji": "🚙"},
]

INDICES = [
    {"symbol": "^NSEI",     "name": "Nifty 50"},
    {"symbol": "^BSESN",    "name": "Sensex"},
    {"symbol": "^NSEBANK",  "name": "Bank Nifty"},
    {"symbol": "^INDIAVIX", "name": "India VIX"},
]

# ─────────────────────────────────────────────────────────────
# DB SETUP
# ─────────────────────────────────────────────────────────────
def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    """Create tables from schema and seed stock metadata."""
    conn = get_db()
    with open(SCHEMA, "r") as f:
        conn.executescript(f.read())

    # Seed stock metadata (upsert — won't overwrite existing rows)
    for s in STOCKS:
        conn.execute("""
            INSERT OR IGNORE INTO stocks (ticker, name, exchange, sector, emoji)
            VALUES (?, ?, 'NSE', ?, ?)
        """, (s["ticker"], s["name"], s["sector"], s["emoji"]))
    conn.commit()
    conn.close()
    print(f"✅  Database ready: {DB_PATH}")

# ─────────────────────────────────────────────────────────────
# FETCH HELPERS
# ─────────────────────────────────────────────────────────────
def calc_sentiment(price, low52, high52):
    rng = high52 - low52
    if rng <= 0 or not price:
        return 60
    return min(100, max(0, int(30 + ((price - low52) / rng) * 60)))

def fetch_one_stock(ticker_meta, history_days=3):
    """Fetch 1 stock from Yahoo Finance.
    Tries .NS suffix first, then -EQ.NS as fallback.
    Returns dict or None.
    """
    yf_base  = ticker_meta.get("yf", ticker_meta["ticker"])
    suffixes = [f"{yf_base}.NS", f"{yf_base}-EQ.NS", f"{yf_base}.BO"]
    tk = hist = None
    for sym in suffixes:
        try:
            _tk   = yf.Ticker(sym)
            _hist = _tk.history(period=f"{history_days}mo")
            if not _hist.empty:
                tk, hist = _tk, _hist
                break
        except Exception:
            continue
    if tk is None or hist is None or hist.empty:
        return None
    try:
        info = tk.fast_info

        price      = float(info.last_price             or 0)
        prev_close = float(info.previous_close          or price)
        change     = round(price - prev_close, 2)
        change_pct = round((change / prev_close) * 100, 2) if prev_close else 0
        high52     = float(getattr(info, 'year_high',  0) or 0)
        low52      = float(getattr(info, 'year_low',   0) or 0)
        mkt_cap    = int(getattr(info, 'market_cap',   0) or 0)
        volume     = int(getattr(info, 'last_volume',  0) or 0)
        avg_vol    = int(getattr(info, 'three_month_average_volume', 0) or 0)

        # OHLC for today
        today_row = hist.iloc[-1] if not hist.empty else None
        open_p    = float(today_row["Open"])  if today_row is not None else None
        high_p    = float(today_row["High"])  if today_row is not None else None
        low_p     = float(today_row["Low"])   if today_row is not None else None

        # Fetch deep fundamentals from full info
        pe = div_yield = eps = roe = debt_eq = pb = None
        try:
            full_info = tk.info

            pe = full_info.get("trailingPE") or full_info.get("forwardPE")
            if pe:
                pe = round(float(pe), 2)

            # Yahoo Finance: dividendYield is already % (e.g. 1.48 means 1.48%)
            # trailingAnnualDividendYield is the raw decimal (e.g. 0.0148)
            dy = full_info.get("dividendYield")
            tady = full_info.get("trailingAnnualDividendYield")
            if dy is not None:
                div_yield = round(float(dy), 2)          # already percentage
            elif tady is not None:
                div_yield = round(float(tady) * 100, 2)  # convert decimal → %

            eps = full_info.get("trailingEps") or full_info.get("forwardEps")
            if eps:
                eps = round(float(eps), 2)

            # returnOnEquity is also a decimal (0.15 = 15%)
            raw_roe = full_info.get("returnOnEquity")
            if raw_roe is not None:
                roe = round(float(raw_roe) * 100, 2)

            # debtToEquity is already a percentage-scaled ratio (e.g. 35.65)
            raw_de = full_info.get("debtToEquity")
            if raw_de is not None:
                debt_eq = round(float(raw_de), 2)

            pb = full_info.get("priceToBook")
            if pb:
                pb = round(float(pb), 2)

        except Exception as e:
            pass

        sentiment = calc_sentiment(price, low52, high52)

        return {
            "ticker":     ticker_meta["ticker"],
            "date":       TODAY_IST,
            "open":       open_p,
            "high":       high_p,
            "low":        low_p,
            "close":      price,
            "volume":     volume,
            "prev_close": prev_close,
            "change":     change,
            "change_pct": change_pct,
            "market_cap": mkt_cap,
            "pe_ratio":   pe,
            "high_52w":   high52,
            "low_52w":    low52,
            "avg_volume": avg_vol,
            "sentiment":  sentiment,
            "div_yield":  div_yield,
            "eps":        eps,
            "roe":        roe,
            "debt_equity":debt_eq,
            "pb_ratio":   pb,
            "history":    [(str(d.date()), float(c))
                           for d, c in zip(hist.index, hist["Close"])
                           if c == c],   # filter NaN
        }
    except Exception as e:
        print(f"   ⚠️  {ticker_meta['ticker']}: {e}")
        return None


def fetch_one_index(idx):
    """Fetch single market index from Yahoo Finance."""
    try:
        tk   = yf.Ticker(idx["symbol"])
        info = tk.fast_info
        price      = float(info.last_price      or 0)
        prev_close = float(info.previous_close   or price)
        return {
            "symbol":     idx["symbol"],
            "name":       idx["name"],
            "date":       TODAY_IST,
            "price":      price,
            "prev_close": prev_close,
            "change":     round(price - prev_close, 2),
            "change_pct": round((price - prev_close) / prev_close * 100, 2) if prev_close else 0,
        }
    except Exception as e:
        print(f"   ⚠️  {idx['symbol']}: {e}")
        return None

# ─────────────────────────────────────────────────────────────
# WRITE TO DB
# ─────────────────────────────────────────────────────────────
def upsert_daily_price(conn, row):
    conn.execute("""
        INSERT INTO daily_prices
            (ticker, date, open, high, low, close, volume,
             prev_close, change, change_pct,
             market_cap, pe_ratio, high_52w, low_52w, avg_volume, sentiment,
             div_yield, eps, roe, debt_equity, pb_ratio)
        VALUES
            (:ticker,:date,:open,:high,:low,:close,:volume,
             :prev_close,:change,:change_pct,
             :market_cap,:pe_ratio,:high_52w,:low_52w,:avg_volume,:sentiment,
             :div_yield,:eps,:roe,:debt_equity,:pb_ratio)
        ON CONFLICT(ticker, date) DO UPDATE SET
            open        = excluded.open,
            high        = excluded.high,
            low         = excluded.low,
            close       = excluded.close,
            volume      = excluded.volume,
            prev_close  = excluded.prev_close,
            change      = excluded.change,
            change_pct  = excluded.change_pct,
            market_cap  = excluded.market_cap,
            pe_ratio    = excluded.pe_ratio,
            high_52w    = excluded.high_52w,
            low_52w     = excluded.low_52w,
            avg_volume  = excluded.avg_volume,
            sentiment   = excluded.sentiment,
            div_yield   = excluded.div_yield,
            eps         = excluded.eps,
            roe         = excluded.roe,
            debt_equity = excluded.debt_equity,
            pb_ratio    = excluded.pb_ratio,
            fetched_at  = datetime('now')
    """, row)


def upsert_history(conn, ticker, history_rows):
    conn.executemany("""
        INSERT OR REPLACE INTO price_history (ticker, date, close)
        VALUES (?, ?, ?)
    """, [(ticker, d, c) for d, c in history_rows])


def upsert_index(conn, row):
    conn.execute("""
        INSERT INTO market_indices
            (symbol, name, date, price, prev_close, change, change_pct)
        VALUES
            (:symbol,:name,:date,:price,:prev_close,:change,:change_pct)
        ON CONFLICT(symbol, date) DO UPDATE SET
            price       = excluded.price,
            prev_close  = excluded.prev_close,
            change      = excluded.change,
            change_pct  = excluded.change_pct,
            fetched_at  = datetime('now')
    """, row)

# ─────────────────────────────────────────────────────────────
# MAIN FETCH FLOW
# ─────────────────────────────────────────────────────────────
def run_fetch(include_history=False):
    init_db()
    conn = get_db()

    # ── Purge ALL old data before fetching fresh ───────────────
    print(f"\n  🗑️   Clearing old data from database…")
    conn.execute("DELETE FROM daily_prices")
    conn.execute("DELETE FROM price_history")
    conn.execute("DELETE FROM market_indices")
    conn.commit()
    print(f"  ✅  Old data cleared. Fetching fresh data…")

    started_at = datetime.now(IST).isoformat()
    log_id = conn.execute("""
        INSERT INTO fetch_log (run_date, started_at, status)
        VALUES (?, ?, 'running')
    """, (TODAY_IST, started_at)).lastrowid
    conn.commit()

    print(f"\n{'═'*60}")
    print(f"  📊  Finance BOT — Daily Fetch   [{TODAY_IST}]")
    print(f"{'═'*60}")

    # ── Fetch Stocks ──────────────────────────────────────────
    fetched = 0
    failed  = 0
    history_days = 3 if include_history else 1  # yfinance period in months

    for i, meta in enumerate(STOCKS, 1):
        print(f"  [{i:02d}/20]  {meta['emoji']}  {meta['ticker']:<12}", end=" ", flush=True)
        data = fetch_one_stock(meta, history_days=history_days)

        if data:
            history = data.pop("history", [])
            upsert_daily_price(conn, data)
            if include_history or len(history) > 0:
                upsert_history(conn, meta["ticker"], history)
            conn.commit()
            sign = "+" if data["change"] >= 0 else ""
            print(f"  ₹{data['close']:>10,.2f}   {sign}{data['change_pct']:+.2f}%  ✅")
            fetched += 1
        else:
            print(f"  {'—':>10}             ❌")
            failed += 1

        time.sleep(0.3)   # polite rate-limiting

    # ── Fetch Indices ─────────────────────────────────────────
    print(f"\n  📈  Fetching Market Indices…")
    idx_fetched = 0

    for idx in INDICES:
        data = fetch_one_index(idx)
        if data:
            upsert_index(conn, data)
            conn.commit()
            sign = "+" if data["change"] >= 0 else ""
            print(f"       {idx['name']:<15}  {data['price']:>10,.2f}   {sign}{data['change_pct']:+.2f}%  ✅")
            idx_fetched += 1
        else:
            print(f"       {idx['name']:<15}  {'—':>10}             ❌")

    # ── Update log ────────────────────────────────────────────
    status = "success" if failed == 0 else ("partial" if fetched > 0 else "failed")
    conn.execute("""
        UPDATE fetch_log
        SET finished_at=?, stocks_fetched=?, stocks_failed=?,
            indices_fetched=?, status=?
        WHERE id=?
    """, (datetime.now(IST).isoformat(), fetched, failed, idx_fetched, status, log_id))
    conn.commit()
    conn.close()

    print(f"\n{'═'*60}")
    print(f"  ✅  Done — Stocks: {fetched}/20   Indices: {idx_fetched}/{len(INDICES)}")
    print(f"  💾  DB: {DB_PATH}")
    print(f"{'═'*60}\n")


# ─────────────────────────────────────────────────────────────
# SHOW SUMMARY (--show flag)
# ─────────────────────────────────────────────────────────────
def show_summary():
    if not os.path.exists(DB_PATH):
        print("❌  Database not found. Run: python3 db/fetch_stocks.py")
        return

    conn = get_db()

    print(f"\n{'═'*65}")
    print(f"  📊  Finance BOT Database Summary")
    print(f"{'═'*65}")

    # Latest data date
    row = conn.execute("SELECT MAX(date) as latest FROM daily_prices").fetchone()
    print(f"  Latest data:  {row['latest'] or 'No data yet'}")

    # Stock prices — latest
    print(f"\n  {'TICKER':<12} {'CLOSE':>10}  {'CHG':>8}  {'CHG%':>8}  {'P/E':>6}  {'SENT':>5}")
    print(f"  {'─'*12} {'─'*10}  {'─'*8}  {'─'*8}  {'─'*6}  {'─'*5}")

    rows = conn.execute("""
        SELECT ticker, close, change, change_pct, pe_ratio, sentiment
        FROM daily_prices
        WHERE date = (SELECT MAX(date) FROM daily_prices)
        ORDER BY ticker
    """).fetchall()

    for r in rows:
        sign = "+" if (r["change"] or 0) >= 0 else ""
        pe   = f"{r['pe_ratio']:.1f}" if r["pe_ratio"] else "—"
        print(f"  {r['ticker']:<12} ₹{r['close']:>9,.2f}  {sign}{r['change']:>+8.2f}  {sign}{r['change_pct']:>+7.2f}%  {pe:>6}  {r['sentiment']:>5}")

    # Indices
    print(f"\n  Market Indices (latest):")
    idx_rows = conn.execute("""
        SELECT name, price, change, change_pct
        FROM market_indices
        WHERE date = (SELECT MAX(date) FROM market_indices)
        ORDER BY name
    """).fetchall()

    for r in idx_rows:
        sign = "+" if (r["change"] or 0) >= 0 else ""
        print(f"    {r['name']:<18} {r['price']:>12,.2f}  {sign}{r['change_pct']:>+.2f}%")

    # Fetch log
    print(f"\n  Recent Fetch Log:")
    log_rows = conn.execute("""
        SELECT run_date, status, stocks_fetched, stocks_failed, indices_fetched, finished_at
        FROM fetch_log ORDER BY id DESC LIMIT 5
    """).fetchall()

    for r in log_rows:
        print(f"    {r['run_date']}  [{r['status']:<8}]  "
              f"Stocks: {r['stocks_fetched']}/20  Indices: {r['indices_fetched']}/4  "
              f"Finished: {r['finished_at'] or 'running...'}")

    # Row counts
    total_daily = conn.execute("SELECT COUNT(*) FROM daily_prices").fetchone()[0]
    total_hist  = conn.execute("SELECT COUNT(*) FROM price_history").fetchone()[0]
    print(f"\n  Total rows — daily_prices: {total_daily}   price_history: {total_hist}")
    print(f"  DB file size: {os.path.getsize(DB_PATH) / 1024:.1f} KB")
    print(f"{'═'*65}\n")

    conn.close()


# ─────────────────────────────────────────────────────────────
# ENTRYPOINT
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Finance BOT — Yahoo Finance → SQLite fetcher")
    parser.add_argument("--history", action="store_true",
                        help="Also pull 90-day price history (first run recommended)")
    parser.add_argument("--show", action="store_true",
                        help="Print a summary of what's in the database")
    args = parser.parse_args()

    if args.show:
        show_summary()
    else:
        run_fetch(include_history=args.history)
        show_summary()
