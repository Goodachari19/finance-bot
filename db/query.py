#!/usr/bin/env python3
"""
Finance BOT — DB Query Helper
Usage examples:
  python3 db/query.py --latest              # Today's prices for all stocks
  python3 db/query.py --ticker RELIANCE     # Full history for one stock
  python3 db/query.py --top-gainers         # Top 5 gainers today
  python3 db/query.py --top-losers          # Top 5 losers today
  python3 db/query.py --export              # Export latest data as JSON
"""

import sqlite3, os, json, argparse
from datetime import datetime, timezone, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "marketpulse.db")
IST = timezone(timedelta(hours=5, minutes=30))

def get_db():
    if not os.path.exists(DB_PATH):
        print(f"❌  DB not found at {DB_PATH}\n"
              f"   Run first:  python3 db/fetch_stocks.py")
        raise SystemExit(1)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def latest_date(conn):
    return conn.execute("SELECT MAX(date) FROM daily_prices").fetchone()[0]

# ── Queries ──────────────────────────────────────────────────

def cmd_latest(conn):
    d = latest_date(conn)
    rows = conn.execute("""
        SELECT s.emoji, dp.ticker, dp.close, dp.change, dp.change_pct,
               dp.market_cap, dp.pe_ratio, dp.sentiment, dp.volume
        FROM daily_prices dp JOIN stocks s USING(ticker)
        WHERE dp.date = ?
        ORDER BY dp.ticker
    """, (d,)).fetchall()

    print(f"\n📊  Latest Prices  [{d}]\n")
    print(f"  {'':2} {'TICKER':<12} {'CLOSE':>10}  {'CHG%':>8}  {'MKT CAP':>14}  {'PE':>6}  {'SENT':>5}")
    print(f"  {'─'*2} {'─'*12} {'─'*10}  {'─'*8}  {'─'*14}  {'─'*6}  {'─'*5}")
    for r in rows:
        sign = "+" if (r["change"] or 0) >= 0 else ""
        mc   = f"₹{r['market_cap']/1e12:.2f}T" if r["market_cap"] and r["market_cap"] > 1e12 else \
               f"₹{r['market_cap']/1e9:.1f}B"  if r["market_cap"] else "—"
        pe   = f"{r['pe_ratio']:.1f}" if r["pe_ratio"] else "—"
        print(f"  {r['emoji']:2} {r['ticker']:<12} ₹{r['close']:>9,.2f}  {sign}{r['change_pct']:>+7.2f}%  "
              f"{mc:>14}  {pe:>6}  {r['sentiment']:>5}")
    print()


def cmd_ticker(conn, ticker):
    ticker = ticker.upper()
    rows = conn.execute("""
        SELECT date, open, high, low, close, volume, change, change_pct, pe_ratio, sentiment
        FROM daily_prices
        WHERE ticker = ?
        ORDER BY date DESC
        LIMIT 30
    """, (ticker,)).fetchall()

    if not rows:
        print(f"❌  No data found for {ticker}")
        return

    print(f"\n📈  {ticker} — Last {len(rows)} days\n")
    print(f"  {'DATE':>12}  {'OPEN':>10}  {'HIGH':>10}  {'LOW':>10}  {'CLOSE':>10}  {'VOL':>10}  {'CHG%':>8}")
    print(f"  {'─'*12}  {'─'*10}  {'─'*10}  {'─'*10}  {'─'*10}  {'─'*10}  {'─'*8}")
    for r in rows:
        sign = "+" if (r["change"] or 0) >= 0 else ""
        vol  = f"{r['volume']/1e5:.1f}L" if r["volume"] and r["volume"] >= 1e5 else str(r["volume"] or "—")
        open_p = f"₹{r['open']:,.2f}" if r["open"] else "—"
        high_p = f"₹{r['high']:,.2f}" if r["high"] else "—"
        low_p  = f"₹{r['low']:,.2f}"  if r["low"]  else "—"
        print(f"  {r['date']:>12}  {open_p:>10}  {high_p:>10}  {low_p:>10}  "
              f"₹{r['close']:>9,.2f}  {vol:>10}  {sign}{r['change_pct']:>+7.2f}%")
    print()


def cmd_top_gainers(conn):
    d = latest_date(conn)
    rows = conn.execute("""
        SELECT s.emoji, dp.ticker, s.name, dp.close, dp.change, dp.change_pct
        FROM daily_prices dp JOIN stocks s USING(ticker)
        WHERE dp.date = ? AND dp.change IS NOT NULL
        ORDER BY dp.change_pct DESC LIMIT 5
    """, (d,)).fetchall()
    print(f"\n🚀  Top 5 Gainers  [{d}]\n")
    for i, r in enumerate(rows, 1):
        print(f"  {i}. {r['emoji']} {r['ticker']:<12}  ₹{r['close']:>10,.2f}  +{r['change_pct']:.2f}%  ({r['name']})")
    print()


def cmd_top_losers(conn):
    d = latest_date(conn)
    rows = conn.execute("""
        SELECT s.emoji, dp.ticker, s.name, dp.close, dp.change, dp.change_pct
        FROM daily_prices dp JOIN stocks s USING(ticker)
        WHERE dp.date = ? AND dp.change IS NOT NULL
        ORDER BY dp.change_pct ASC LIMIT 5
    """, (d,)).fetchall()
    print(f"\n📉  Top 5 Losers  [{d}]\n")
    for i, r in enumerate(rows, 1):
        print(f"  {i}. {r['emoji']} {r['ticker']:<12}  ₹{r['close']:>10,.2f}  {r['change_pct']:.2f}%  ({r['name']})")
    print()


def cmd_export(conn):
    d = latest_date(conn)
    rows = conn.execute("""
        SELECT s.ticker, s.name, s.sector, s.emoji,
               dp.date, dp.open, dp.high, dp.low, dp.close,
               dp.volume, dp.change, dp.change_pct,
               dp.market_cap, dp.pe_ratio, dp.high_52w, dp.low_52w,
               dp.avg_volume, dp.sentiment
        FROM daily_prices dp JOIN stocks s USING(ticker)
        WHERE dp.date = ?
        ORDER BY s.ticker
    """, (d,)).fetchall()

    out = [dict(r) for r in rows]
    filename = os.path.join(os.path.dirname(DB_PATH), f"export_{d}.json")
    with open(filename, "w") as f:
        json.dump(out, f, indent=2)
    print(f"\n✅  Exported {len(out)} stocks to: {filename}\n")


# ─────────────────────────────────────────────────────────────
# ENTRYPOINT
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Finance BOT — Query helper")
    parser.add_argument("--latest",      action="store_true", help="Show latest prices for all stocks")
    parser.add_argument("--ticker",      type=str,            help="Show history for a specific ticker")
    parser.add_argument("--top-gainers", action="store_true", help="Top 5 gainers today")
    parser.add_argument("--top-losers",  action="store_true", help="Top 5 losers today")
    parser.add_argument("--export",      action="store_true", help="Export latest data to JSON")
    args = parser.parse_args()

    conn = get_db()

    if args.ticker:
        cmd_ticker(conn, args.ticker)
    elif args.top_gainers:
        cmd_top_gainers(conn)
    elif args.top_losers:
        cmd_top_losers(conn)
    elif args.export:
        cmd_export(conn)
    else:
        cmd_latest(conn)   # default

    conn.close()
