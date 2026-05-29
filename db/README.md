# Finance BOT — SQLite Database

A local SQLite database that stores live Yahoo Finance data for **20 major Indian NSE stocks** and **4 market indices**. Run one command daily to keep it fresh.

---

## 📁 Files

```
db/
├── finance_bot.db       ← SQLite database (auto-created on first run)
├── fetch_stocks.py      ← Daily data fetcher (run this every day!)
├── query.py             ← CLI query helper
├── schema.sql           ← Database schema (auto-applied)
└── README.md            ← This file
```

---

## 🚀 Quick Start

### First-time setup (pulls 90 days of history)
```bash
python3 db/fetch_stocks.py --history
```

### Daily refresh (run every morning before markets open)
```bash
python3 db/fetch_stocks.py
```

### View what's in the DB
```bash
python3 db/fetch_stocks.py --show
```

---

## 📊 Query Commands

```bash
# Show latest prices for all 20 stocks
python3 db/query.py

# Show 30-day history for a specific stock
python3 db/query.py --ticker RELIANCE

# Top 5 gainers today
python3 db/query.py --top-gainers

# Top 5 losers today
python3 db/query.py --top-losers

# Export today's data to JSON
python3 db/query.py --export
```

---

## 🗄️ Database Schema

### `stocks` — Static metadata
| Column | Type | Description |
|--------|------|-------------|
| ticker | TEXT | NSE ticker (e.g. RELIANCE) |
| name | TEXT | Full company name |
| exchange | TEXT | NSE/BSE |
| sector | TEXT | Sector category |
| emoji | TEXT | Display emoji |

### `daily_prices` — Daily OHLCV + metrics (one row per stock per day)
| Column | Type | Description |
|--------|------|-------------|
| ticker | TEXT | FK → stocks |
| date | TEXT | YYYY-MM-DD |
| open/high/low/close | REAL | Price candle |
| volume | INT | Day volume |
| change / change_pct | REAL | Day change |
| market_cap | INT | Market cap (INR) |
| pe_ratio | REAL | Trailing P/E |
| high_52w / low_52w | REAL | 52-week range |
| sentiment | INT | 0–100 sentiment score |

### `price_history` — Historical closing prices
| Column | Type | Description |
|--------|------|-------------|
| ticker | TEXT | FK → stocks |
| date | TEXT | YYYY-MM-DD |
| close | REAL | Closing price |

### `market_indices` — Nifty 50, Sensex, Bank Nifty, India VIX
| Column | Type | Description |
|--------|------|-------------|
| symbol | TEXT | Yahoo Finance symbol (^NSEI etc.) |
| name | TEXT | Human-readable name |
| date | TEXT | YYYY-MM-DD |
| price / change / change_pct | REAL | Data |

### `fetch_log` — Audit trail of every daily run
| Column | Type | Description |
|--------|------|-------------|
| run_date | TEXT | Date of run |
| started_at / finished_at | TEXT | Timestamps |
| stocks_fetched | INT | Successful fetches |
| stocks_failed | INT | Failed fetches |
| status | TEXT | running / success / partial / failed |

---

## ⏰ Automate with Cron (Optional)

To run automatically every day at 9:00 AM IST:

```bash
# Open crontab
crontab -e

# Add this line (adjust path to your project):
0 9 * * 1-5 cd /Users/tanish/Projects/finance-bot && python3 db/fetch_stocks.py >> db/fetch.log 2>&1
```

---

## 📦 Dependencies

```bash
pip3 install yfinance
```

---

## 🔑 Covered Stocks

| Ticker | Company | Sector |
|--------|---------|--------|
| RELIANCE | Reliance Industries | Conglomerate |
| TCS | Tata Consultancy Services | IT |
| HDFCBANK | HDFC Bank | Banking |
| INFY | Infosys | IT |
| ICICIBANK | ICICI Bank | Banking |
| HINDUNILVR | Hindustan Unilever | FMCG |
| TATAMOTORS | Tata Motors | Automobile |
| SUNPHARMA | Sun Pharma | Pharma |
| BAJFINANCE | Bajaj Finance | NBFC |
| WIPRO | Wipro | IT |
| ADANIENT | Adani Enterprises | Infrastructure |
| ZOMATO | Zomato | Consumer Tech |
| ITC | ITC Ltd | FMCG |
| AXISBANK | Axis Bank | Banking |
| KOTAKBANK | Kotak Mahindra Bank | Banking |
| LT | Larsen & Toubro | Engineering |
| NTPC | NTPC | Power |
| ONGC | ONGC | Oil & Gas |
| SBIN | State Bank of India | Banking |
| MARUTI | Maruti Suzuki | Automobile |
