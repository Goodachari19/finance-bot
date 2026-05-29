-- ══════════════════════════════════════════════════════════
--  Finance BOT — SQLite Database Schema
--  Tables: stocks, daily_prices, indices, fetch_log
-- ══════════════════════════════════════════════════════════

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ── Static stock metadata ──────────────────────────────────
CREATE TABLE IF NOT EXISTS stocks (
    ticker      TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    exchange    TEXT NOT NULL DEFAULT 'NSE',
    sector      TEXT,
    emoji       TEXT,
    about       TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
);

-- ── Daily OHLCV + key metrics per stock ───────────────────
CREATE TABLE IF NOT EXISTS daily_prices (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker          TEXT NOT NULL REFERENCES stocks(ticker),
    date            TEXT NOT NULL,          -- YYYY-MM-DD (IST)
    open            REAL,
    high            REAL,
    low             REAL,
    close           REAL NOT NULL,
    volume          INTEGER,
    -- Derived metrics (from Yahoo Finance summary)
    prev_close      REAL,
    change          REAL,
    change_pct      REAL,
    market_cap      INTEGER,
    pe_ratio        REAL,
    high_52w        REAL,
    low_52w         REAL,
    avg_volume      INTEGER,
    -- Deep Fundamentals
    div_yield       REAL,
    eps             REAL,
    roe             REAL,
    debt_equity     REAL,
    pb_ratio        REAL,
    -- Sentiment score (0-100, derived)
    sentiment       INTEGER,
    fetched_at      TEXT DEFAULT (datetime('now')),
    UNIQUE(ticker, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_ticker_date ON daily_prices(ticker, date DESC);

-- ── Index / Market data (Nifty, Sensex, etc.) ─────────────
CREATE TABLE IF NOT EXISTS market_indices (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol      TEXT NOT NULL,              -- e.g. ^NSEI
    name        TEXT NOT NULL,              -- e.g. Nifty 50
    date        TEXT NOT NULL,
    price       REAL NOT NULL,
    prev_close  REAL,
    change      REAL,
    change_pct  REAL,
    fetched_at  TEXT DEFAULT (datetime('now')),
    UNIQUE(symbol, date)
);

-- ── Price history (weekly snapshots for chart rendering) ───
CREATE TABLE IF NOT EXISTS price_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker      TEXT NOT NULL REFERENCES stocks(ticker),
    date        TEXT NOT NULL,
    close       REAL NOT NULL,
    UNIQUE(ticker, date)
);

CREATE INDEX IF NOT EXISTS idx_ph_ticker_date ON price_history(ticker, date DESC);

-- ── Fetch log (audit trail of each daily run) ─────────────
CREATE TABLE IF NOT EXISTS fetch_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    run_date        TEXT NOT NULL,
    started_at      TEXT NOT NULL,
    finished_at     TEXT,
    stocks_fetched  INTEGER DEFAULT 0,
    stocks_failed   INTEGER DEFAULT 0,
    indices_fetched INTEGER DEFAULT 0,
    status          TEXT DEFAULT 'running',  -- running | success | partial | failed
    notes           TEXT
);

-- ════════════════════════════════════════════════════════════════
--  Trading Lab & Profiles
-- ════════════════════════════════════════════════════════════════

-- ── Every executed paper trade ────────────────────────────────
CREATE TABLE IF NOT EXISTS tl_trades (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_date  TEXT NOT NULL,          -- YYYY-MM-DD (IST)
    trade_time  TEXT NOT NULL,          -- HH:MM AM/PM (IST)
    ticker      TEXT NOT NULL,
    action      TEXT NOT NULL CHECK(action IN ('BUY','SELL')),
    qty         INTEGER NOT NULL,
    price       REAL NOT NULL,          -- execution price
    total       REAL NOT NULL,          -- qty × price
    cash_after  REAL NOT NULL,          -- cash balance after this trade
    created_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tl_trades_date   ON tl_trades(trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_tl_trades_ticker ON tl_trades(ticker);

-- ── Daily portfolio snapshot (end-of-session) ─────────────────
CREATE TABLE IF NOT EXISTS tl_snapshots (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    snap_date       TEXT NOT NULL UNIQUE,
    cash            REAL NOT NULL,
    portfolio_value REAL NOT NULL,
    total_value     REAL NOT NULL,          -- cash + portfolio_value
    pnl             REAL NOT NULL,          -- vs 1,00,000 baseline
    pnl_pct         REAL NOT NULL,
    holdings_json   TEXT,                   -- JSON blob of current holdings
    created_at      TEXT DEFAULT (datetime('now'))
);

-- ── Ticker-level P&L summary (refreshed on each trade) ────────
CREATE TABLE IF NOT EXISTS tl_ticker_pnl (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker          TEXT NOT NULL UNIQUE,
    total_bought    INTEGER DEFAULT 0,      -- cumulative shares bought
    total_sold      INTEGER DEFAULT 0,      -- cumulative shares sold
    avg_buy_price   REAL,
    realised_pnl    REAL DEFAULT 0.0,       -- from completed sell trades
    trades_count    INTEGER DEFAULT 0,
    last_updated    TEXT DEFAULT (datetime('now'))
);

-- ── User Profile ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tl_users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    user_type       TEXT NOT NULL CHECK(user_type IN ('investor', 'trader')),
    experience      TEXT,                   -- e.g., 'beginner', 'intermediate', 'expert'
    style           TEXT,                   -- e.g., 'value', 'day_trading'
    risk_tolerance  TEXT,                   -- e.g., 'low', 'high'
    created_at      TEXT DEFAULT (datetime('now'))
);

-- ── InvestCircle Experts ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ic_experts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    initials        TEXT,
    color           TEXT,                   -- Hex code
    title           TEXT,                   -- e.g., 'Senior Investment Advisor'
    firm            TEXT,
    location        TEXT,
    verified        INTEGER DEFAULT 0,      -- boolean
    sebiReg         TEXT,
    experience      INTEGER,
    filterTags      TEXT,                   -- comma-separated (e.g. 'value,sebi')
    specializations TEXT,                   -- comma-separated
    certifications  TEXT,                   -- JSON string of {label, cls}
    returns         TEXT,                   -- string e.g. '23.4%'
    followers       TEXT,                   -- string e.g. '12.4K'
    recommendations INTEGER DEFAULT 0,
    winRate         TEXT,                   -- string e.g. '68%'
    bio             TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
);

-- ── InvestCircle Community Feed ──────────────────────────────────
CREATE TABLE IF NOT EXISTS ic_posts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    author_name     TEXT NOT NULL,
    author_role     TEXT,
    content         TEXT NOT NULL,
    timestamp       TEXT DEFAULT (datetime('now')),
    likes           INTEGER DEFAULT 0,
    comments_count  INTEGER DEFAULT 0,
    category        TEXT DEFAULT 'Market Analysis'
);
