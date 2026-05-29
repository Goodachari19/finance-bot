/* ══ MarketPulse Pro — Market Knowledge Base ══
   60+ curated articles covering Beginner → Advanced investing concepts.
   Used by the Market Assistant chatbot for keyword-based RAG retrieval.
   No API key required — all answers are drawn from this static corpus
   combined with live stock data from the STOCKS array.
*/

'use strict';

const MARKET_KNOWLEDGE = [

  // ── BASICS ──────────────────────────────────────────────────────────
  {
    id: 'what-is-stock-market',
    title: 'What is the Stock Market?',
    tags: ['stock market', 'basics', 'beginner', 'what is', 'market', 'exchange', 'shares', 'equity', 'how does it work'],
    category: 'basics', level: 'beginner',
    content: `The **stock market** is a marketplace where buyers and sellers trade shares of publicly listed companies. In India, the two main exchanges are the **NSE (National Stock Exchange)** and the **BSE (Bombay Stock Exchange)**. When you buy a share, you become a part-owner of that company and share in its profits and growth. Markets are open **Monday–Friday, 9:15 AM to 3:30 PM IST**. The market is regulated by **SEBI**, which protects investor interests and ensures fair, transparent trading.`
  },
  {
    id: 'what-is-share',
    title: 'What is a Share / Stock?',
    tags: ['share', 'stock', 'equity', 'ownership', 'what is a share', 'what is stock', 'unit'],
    category: 'basics', level: 'beginner',
    content: `A **share** (also called a stock or equity) represents a unit of ownership in a company. If a company has issued 1,00,000 shares and you own 1,000 of them, you own **1% of that company**. As a shareholder, you benefit when the company's profits grow (share price rises) and may receive **dividends** — a portion of the company's profit paid directly to you. You can buy or sell shares on the NSE or BSE through a registered broker or trading app.`
  },
  {
    id: 'nse-vs-bse',
    title: 'NSE vs BSE — What is the Difference?',
    tags: ['nse', 'bse', 'nifty', 'sensex', 'national stock exchange', 'bombay stock exchange', 'difference', 'exchange'],
    category: 'basics', level: 'beginner',
    content: `**NSE (National Stock Exchange)** was founded in 1992 and is India's largest stock exchange by trading volume. Its benchmark index is the **Nifty 50**, which tracks the top 50 companies. **BSE (Bombay Stock Exchange)** is Asia's oldest stock exchange, founded in 1875. Its benchmark is the **Sensex**, which tracks the top 30 companies. Most large companies are listed on **both** exchanges. For retail investors, the difference is minimal — prices are nearly identical on both. NSE generally has higher liquidity.`
  },
  {
    id: 'demat-account',
    title: 'What is a Demat Account?',
    tags: ['demat', 'demat account', 'how to invest', 'start investing', 'trading account', 'open account'],
    category: 'basics', level: 'beginner',
    content: `A **Demat (Dematerialized) Account** is a digital account that holds your shares electronically — just like a bank account holds your money. To start investing in stocks in India, you need: (1) a **Demat account**, (2) a **Trading account** (to place buy/sell orders), and (3) a **linked bank account** for fund transfers. Popular platforms in India include Zerodha, Groww, Upstox, and HDFC Securities. Opening an account typically takes 1–3 business days and requires your PAN card and Aadhaar.`
  },
  {
    id: 'bull-bear-market',
    title: 'What is a Bull Market vs Bear Market?',
    tags: ['bull market', 'bear market', 'bull', 'bear', 'market trend', 'rally', 'crash', 'correction'],
    category: 'basics', level: 'beginner',
    content: `A **Bull Market** is when stock prices are rising or are expected to rise. Investor confidence is high, the economy is growing, and most stocks trend upward. A **Bear Market** is the opposite — stock prices fall by 20% or more from recent highs. It is driven by economic slowdown, fear, or crisis. **Corrections** are smaller pullbacks of 10–20% and are a normal, healthy part of markets. History shows that bear markets are always temporary — the Nifty 50 has recovered from every crash in its history.`
  },
  {
    id: 'what-is-ipo',
    title: 'What is an IPO?',
    tags: ['ipo', 'initial public offering', 'listing', 'new stock', 'fresh issue', 'ofs'],
    category: 'basics', level: 'beginner',
    content: `An **IPO (Initial Public Offering)** is when a private company offers its shares to the public for the first time on a stock exchange. Investing in IPOs can be lucrative if the company's fundamentals are strong, but it is also risky because there is no trading history. In India, IPO applications are placed via **ASBA (Application Supported by Blocked Amount)** through your bank or broker. Shares are allotted via a lottery system if oversubscribed. Key tip: read the **DRHP (Draft Red Herring Prospectus)** to understand the company's financials and risks before applying.`
  },
  {
    id: 'what-is-sip',
    title: 'What is SIP (Systematic Investment Plan)?',
    tags: ['sip', 'systematic investment plan', 'mutual fund', 'monthly investment', 'rupee cost averaging'],
    category: 'basics', level: 'beginner',
    content: `A **SIP** is a method of investing a fixed amount in a mutual fund (or index fund) at regular intervals (weekly, monthly). Instead of timing the market, SIP takes advantage of **Rupee Cost Averaging** — you buy more units when prices are low and fewer when prices are high, reducing your average cost over time. SIPs are one of the most disciplined and effective ways for beginners to build long-term wealth. Even ₹500/month invested consistently in a Nifty 50 index fund can grow significantly over 10–15 years due to compounding.`
  },
  {
    id: 'what-is-dividend',
    title: 'What is a Dividend?',
    tags: ['dividend', 'dividend yield', 'payout', 'income', 'passive income', 'ex-date', 'record date'],
    category: 'basics', level: 'beginner',
    content: `A **dividend** is a portion of a company's profit paid out to shareholders, usually quarterly or annually. It is expressed as a **per-share amount** (e.g., ₹10 per share) or as a **Dividend Yield** (Annual Dividend ÷ Current Price × 100). Dividend yield of **>1–2%** is generally considered decent for Indian stocks. Not all companies pay dividends — growth companies prefer to reinvest profits. Mature, stable companies (like ITC or NTPC) typically pay regular dividends. The **ex-dividend date** is the cutoff — you must own the share before this date to receive the dividend.`
  },

  // ── FUNDAMENTAL ANALYSIS ────────────────────────────────────────────
  {
    id: 'pe-ratio',
    title: 'What is P/E Ratio?',
    tags: ['pe ratio', 'p/e', 'price earnings', 'valuation', 'overvalued', 'undervalued', 'cheap', 'expensive'],
    category: 'fundamentals', level: 'intermediate',
    content: `The **P/E Ratio (Price-to-Earnings)** tells you how much you are paying for every ₹1 of the company's earnings. **Formula: Stock Price ÷ Earnings Per Share (EPS).** A P/E of 20 means investors are paying ₹20 for every ₹1 of profit. **Lower P/E** can indicate an undervalued stock or slower growth. **Higher P/E** suggests high growth expectations or possible overvaluation. Always compare P/E **within the same sector** — IT companies naturally trade at higher P/Es than commodity companies. India's Nifty 50 average P/E is typically **18–25x** historically.`
  },
  {
    id: 'market-cap',
    title: 'What is Market Capitalisation (Market Cap)?',
    tags: ['market cap', 'market capitalisation', 'large cap', 'mid cap', 'small cap', 'company size'],
    category: 'fundamentals', level: 'beginner',
    content: `**Market Cap = Current Share Price × Total Number of Shares Outstanding.** It tells you the total market value of a company. In India: **Large Cap** = Market Cap > ₹20,000 Cr (stable, lower risk), **Mid Cap** = ₹5,000–₹20,000 Cr (growth potential, moderate risk), **Small Cap** = < ₹5,000 Cr (high growth potential, high risk). Large caps like Reliance, TCS, HDFC Bank are more stable but grow slower. Small caps can multiply faster but can also fall sharply. For most beginners, large-cap stocks or Nifty 50 index funds are the safest starting point.`
  },
  {
    id: 'eps',
    title: 'What is EPS (Earnings Per Share)?',
    tags: ['eps', 'earnings per share', 'profit', 'earnings', 'quarterly results', 'annual results'],
    category: 'fundamentals', level: 'intermediate',
    content: `**EPS (Earnings Per Share) = Net Profit ÷ Total Shares Outstanding.** It tells you how much profit the company makes per share. **Higher EPS = more profitable.** Growing EPS year-over-year is one of the most reliable bullish signals for a stock. **Trailing EPS** is based on last 12 months of actual results. **Forward EPS** is an analyst estimate of the next 12 months. Watch for quarterly EPS: if a company beats its EPS estimate, the stock often rallies. A miss can cause a sharp fall. EPS is the denominator used to calculate the P/E ratio.`
  },
  {
    id: 'roe',
    title: 'What is ROE (Return on Equity)?',
    tags: ['roe', 'return on equity', 'profitability', 'management efficiency', 'quality'],
    category: 'fundamentals', level: 'intermediate',
    content: `**ROE = Net Profit ÷ Shareholders' Equity × 100.** It measures how efficiently a company uses shareholder money to generate profit. **>15% ROE** is generally considered good for Indian companies. A consistently high ROE over 5+ years is a sign of a **quality business with a competitive advantage**. Companies like TCS, Infosys, and HDFC Bank have maintained ROE > 20% consistently. Be careful: very high ROE can sometimes be inflated by high debt, which increases risk. Always check ROE alongside the Debt-to-Equity ratio.`
  },
  {
    id: 'debt-equity',
    title: 'What is Debt-to-Equity Ratio?',
    tags: ['debt equity', 'debt to equity', 'd/e', 'leverage', 'debt', 'financial risk', 'borrowing'],
    category: 'fundamentals', level: 'intermediate',
    content: `**Debt-to-Equity (D/E) = Total Debt ÷ Total Shareholders' Equity.** It measures how much the company has borrowed relative to its own money. **D/E < 1x** is generally safe for non-financial companies. **D/E > 2x** can signal financial stress — especially during economic downturns when servicing debt becomes harder. Banks and NBFCs naturally have higher D/E and are evaluated differently. Companies with low debt have more flexibility to survive downturns, invest in growth, and pay dividends. High-debt companies are riskier but can also amplify returns in good times.`
  },
  {
    id: 'pb-ratio',
    title: 'What is P/B Ratio (Price-to-Book)?',
    tags: ['pb ratio', 'p/b', 'price to book', 'book value', 'asset value', 'banking stocks'],
    category: 'fundamentals', level: 'intermediate',
    content: `**P/B Ratio = Stock Price ÷ Book Value Per Share.** Book value is essentially the company's net assets (what's left if all liabilities are paid). A P/B of 1 means you're buying at exactly asset value. For most quality Indian companies, P/B ranges from **2x to 6x**. P/B is especially useful for **banking stocks** (HDFC Bank, ICICI Bank) where assets and book value are central to valuation. A very low P/B (<1) can signal undervaluation — or that the company is in financial trouble. A very high P/B is only justified if the company has very high ROE and growth.`
  },
  {
    id: 'promoter-holding',
    title: 'What is Promoter Holding and Why Does it Matter?',
    tags: ['promoter', 'promoter holding', 'insider holding', 'pledge', 'pledged shares', 'shareholding pattern'],
    category: 'fundamentals', level: 'intermediate',
    content: `**Promoters** are the founders or controlling shareholders of a company. The **promoter holding %** shows how much of the company they own. **High promoter holding (>50–60%)** generally signals confidence — promoters believe in the company's future and haven't sold their stake. **Decreasing promoter holding** can be a warning sign — are insiders selling before bad news? **Pledged shares** are especially dangerous: when promoters pledge shares as collateral for loans, a falling stock price can trigger forced selling, accelerating the decline. Always check pledged % — anything above 20–30% of promoter holdings deserves scrutiny.`
  },
  {
    id: 'dividend-yield',
    title: 'How to Use Dividend Yield in Stock Analysis',
    tags: ['dividend yield', 'income stock', 'yield', 'dividend investing', 'high dividend'],
    category: 'fundamentals', level: 'intermediate',
    content: `**Dividend Yield = Annual Dividend Per Share ÷ Current Stock Price × 100.** A yield of 2% means for every ₹100 invested, you receive ₹2/year as dividend income. Dividend yield > 2–3% is attractive for **income investors**. However, a very high dividend yield (>8%) can sometimes be a **value trap** — the stock price may have fallen dramatically due to problems, making the yield look artificially high. Sustainable dividends backed by consistent profits are more valuable than one-time high payouts. ITC, Coal India, and Power Grid are known for relatively high, consistent dividends.`
  },

  // ── TECHNICAL ANALYSIS ──────────────────────────────────────────────
  {
    id: 'rsi',
    title: 'What is RSI (Relative Strength Index)?',
    tags: ['rsi', 'relative strength index', 'overbought', 'oversold', 'momentum', 'technical analysis'],
    category: 'technicals', level: 'intermediate',
    content: `**RSI** is a momentum indicator that measures the speed and magnitude of price changes, ranging from **0 to 100**. **RSI < 30**: Stock may be **oversold** — potentially a buying opportunity. **RSI > 70**: Stock may be **overbought** — potential sell signal or consolidation ahead. **RSI 30–70**: Neutral zone, no clear signal. RSI works best when used alongside other indicators. A stock can remain oversold or overbought for extended periods in strong trends. RSI is calculated over **14 trading days** by default. Our app displays the live 14-day RSI for every stock in the Advanced Technicals section.`
  },
  {
    id: 'ema',
    title: 'What is EMA (Exponential Moving Average)?',
    tags: ['ema', 'exponential moving average', 'moving average', 'sma', 'trend', '20 ema', '50 ema', 'golden cross'],
    category: 'technicals', level: 'intermediate',
    content: `An **EMA (Exponential Moving Average)** smooths out price data over a set period, giving more weight to recent prices. **20-Day EMA** tracks short-term momentum. **50-Day EMA** tracks medium-term trend. Key signals: **Price above EMA** = bullish (uptrend). **Price below EMA** = bearish (downtrend). **Golden Cross**: When the 20-day EMA crosses above the 50-day EMA — a powerful bullish signal. **Death Cross**: When the 20-day EMA crosses below the 50-day EMA — bearish warning. EMAs react faster to price changes than Simple Moving Averages (SMA), making them popular for active traders.`
  },
  {
    id: 'support-resistance',
    title: 'What is Support and Resistance?',
    tags: ['support', 'resistance', 'price level', 'breakout', 'breakdown', 'technical levels'],
    category: 'technicals', level: 'intermediate',
    content: `**Support** is a price level where a falling stock tends to find buyers — it "bounces" off this floor. **Resistance** is a price level where a rising stock tends to find sellers — it struggles to break through this ceiling. When a stock breaks through resistance with high volume, resistance becomes the new support (**breakout**). When support breaks, it becomes the new resistance (**breakdown**). These levels are powerful because many traders watch the same levels — creating self-fulfilling prophecies. The **52-week high and low** visible in the stock data are key support/resistance reference points.`
  },
  {
    id: 'volume',
    title: 'How to Use Volume in Technical Analysis',
    tags: ['volume', 'trading volume', 'average volume', 'high volume', 'low volume', 'confirmation'],
    category: 'technicals', level: 'intermediate',
    content: `**Volume** is the number of shares traded in a given time period. It is the most important confirmation tool in technical analysis. **High volume + price rise** = strong bullish conviction. **Low volume + price rise** = weak, potentially unsustainable move. **High volume + price fall** = strong bearish pressure (selling panic). Volume spikes often precede major price moves. Always compare today's volume to the **3-month average volume**. An abnormally high volume day (3–5x average) deserves attention — something significant may be happening in the stock.`
  },
  {
    id: 'candlestick',
    title: 'Candlestick Charts — Basics',
    tags: ['candlestick', 'candle', 'chart', 'doji', 'hammer', 'engulfing', 'green candle', 'red candle'],
    category: 'technicals', level: 'intermediate',
    content: `A **candlestick** represents price action for one time period (1 day, 1 hour, etc.). Each candle has: **Body** (open to close), **Upper wick** (highest price), **Lower wick** (lowest price). **Green candle**: closed higher than opened (bullish). **Red candle**: closed lower than opened (bearish). Common patterns: **Doji** (tiny body = indecision), **Hammer** (long lower wick = potential reversal from downtrend), **Bullish Engulfing** (large green candle swallows previous red = reversal signal). Patterns are most reliable at key support/resistance levels and should be confirmed with volume.`
  },

  // ── INDIA-SPECIFIC ──────────────────────────────────────────────────
  {
    id: 'nifty-50',
    title: 'What is NIFTY 50?',
    tags: ['nifty', 'nifty 50', 'index', 'benchmark', 'nse index', 'market index'],
    category: 'india', level: 'beginner',
    content: `**NIFTY 50** is India's most widely tracked stock market index, representing the **top 50 companies** listed on the NSE by free-float market capitalisation. It covers about **65% of India's total market cap** across 13 sectors. NIFTY 50 is used as the benchmark for comparing portfolio performance — if your investments grow slower than NIFTY, you may be better off investing in an index fund. The index is rebalanced semi-annually. International investors use NIFTY 50 as the primary gauge of Indian market health.`
  },
  {
    id: 'sensex',
    title: 'What is SENSEX?',
    tags: ['sensex', 'bse index', 's&p bse sensex', '30 companies', 'bombay stock exchange index'],
    category: 'india', level: 'beginner',
    content: `**SENSEX (Sensitive Index)** is the benchmark index of the **BSE**, tracking the top **30 large, financially sound companies** listed in India. It was launched in 1986 and is one of Asia's oldest indices. While the NIFTY 50 is more comprehensive (50 stocks), SENSEX moves in sync with NIFTY 99% of the time. SENSEX is often used in mainstream media to report daily market performance. If SENSEX falls 500 points on a given day, the market is having a bad day. A single SENSEX point represents approximately ₹1 trillion in total market value.`
  },
  {
    id: 'sebi',
    title: 'What is SEBI and What Does it Do?',
    tags: ['sebi', 'regulator', 'securities and exchange board', 'investor protection', 'regulation'],
    category: 'india', level: 'beginner',
    content: `**SEBI (Securities and Exchange Board of India)** is the regulatory authority for India's capital markets, established in 1992. SEBI's key roles: (1) **Protect investor interests** from fraud and manipulation. (2) **Regulate** stock exchanges, brokers, mutual funds, and listed companies. (3) **Enforce disclosure norms** — companies must publish quarterly results and material information promptly. (4) **Investigate** insider trading and market manipulation. Key rule: Promoters and insiders must disclose all share transactions within 2 days. SEBI's website (sebi.gov.in) is a great resource for investor education.`
  },
  {
    id: 'fii-dii',
    title: 'What is FII and DII? Why Do They Matter?',
    tags: ['fii', 'dii', 'foreign institutional investor', 'domestic institutional investor', 'mutual fund', 'institutional buying', 'fund flows'],
    category: 'india', level: 'intermediate',
    content: `**FIIs (Foreign Institutional Investors)** are large international funds — hedge funds, pension funds, sovereign wealth funds — that invest in Indian markets. **DIIs (Domestic Institutional Investors)** include Indian mutual funds, insurance companies, and banks. When FIIs sell heavily (net sellers), markets often fall. When they buy (net buyers), markets tend to rise. **DIIs often act as a counterbalance** — when FIIs sell and markets drop, DIIs typically buy, limiting the downside. Watch daily FII/DII data to understand who is driving market momentum. Persistent FII buying is usually a sign of confidence in India's economic outlook.`
  },
  {
    id: 'sglt-ltcg',
    title: 'Tax on Stock Market Gains (STCG vs LTCG)',
    tags: ['tax', 'stcg', 'ltcg', 'short term capital gains', 'long term capital gains', 'capital gains tax', 'tax on stocks'],
    category: 'india', level: 'intermediate',
    content: `In India, profits from stock sales are taxed as **Capital Gains**: **STCG (Short-Term Capital Gains)**: If you sell within **12 months** of buying — taxed at **20%** (from Budget 2024). **LTCG (Long-Term Capital Gains)**: If you sell after **12 months** — gains above **₹1.25 lakh per year** are taxed at **12.5%** (no indexation benefit for equity). **STT (Securities Transaction Tax)** is automatically deducted on every trade — you cannot avoid this. Strategy tip: Holding a fundamentally strong stock for 12+ months reduces your tax burden significantly. Losses can be used to offset gains — consult a CA for tax-loss harvesting strategies.`
  },
  {
    id: 'circuit-breaker',
    title: 'What are Circuit Breakers?',
    tags: ['circuit breaker', 'upper circuit', 'lower circuit', 'halt', 'trading halt', 'price band'],
    category: 'india', level: 'intermediate',
    content: `**Circuit breakers** are automatic trading halts triggered when a stock or the overall index moves too sharply in one direction, preventing panic-driven extreme volatility. **Stock-level circuits**: Individual stocks have price bands (e.g., 5%, 10%, or 20%) — if the stock hits this limit, trading halts for the session. **Upper Circuit** = stock can't go higher; **Lower Circuit** = can't go lower for the day. **Index-level circuits**: If NIFTY falls 10%, trading halts for 45 minutes. A 15% fall halts for 1 hour 45 minutes. A 20% fall shuts the market for the rest of the day. These mechanisms protect investors from extreme panic.`
  },
  {
    id: 't1-settlement',
    title: 'What is T+1 Settlement?',
    tags: ['t+1', 'settlement', 'delivery', 'trading settlement', 'shares in account'],
    category: 'india', level: 'beginner',
    content: `**T+1 settlement** means that after you buy a stock on **Trade Day (T)**, the shares are credited to your Demat account on **T+1** (the very next trading day). India was the first major market to implement T+1 settlement (rolled out in 2023), making it one of the fastest settlement systems globally. Previously, India used T+2. Practically, this means if you buy Reliance on Monday, the shares appear in your Demat account by Tuesday. This reduces counterparty risk and improves market efficiency for investors.`
  },

  // ── ADVANCED ───────────────────────────────────────────────────────
  {
    id: 'options-basics',
    title: 'What are Options? (Basics)',
    tags: ['options', 'call option', 'put option', 'derivatives', 'f&o', 'futures and options', 'strike price'],
    category: 'advanced', level: 'advanced',
    content: `An **Option** is a contract that gives the buyer the **right (but not obligation)** to buy or sell a stock at a fixed price (**strike price**) before a set date (**expiry**). **Call Option**: Right to **buy** — profits if stock rises. **Put Option**: Right to **sell** — profits if stock falls. Options require paying a **premium** upfront — this is your maximum loss if the option expires worthless. Options are powerful for hedging your portfolio against losses, but **extremely risky for speculation** without proper knowledge. Over 85–90% of retail options traders lose money. Start with understanding the basics thoroughly before trading F&O.`
  },
  {
    id: 'short-selling',
    title: 'What is Short Selling?',
    tags: ['short selling', 'shorting', 'short', 'borrow shares', 'bear trade', 'sell high buy low'],
    category: 'advanced', level: 'advanced',
    content: `**Short selling** means selling shares you don't own, hoping the price will fall, then buying them back cheaper to pocket the difference. Example: You borrow 100 shares of TCS at ₹3,000, sell them. If TCS falls to ₹2,500, you buy them back and return — profiting ₹500 per share. But if TCS **rises to ₹3,500**, you face an unlimited loss. In India, short selling in the cash segment must be squared off the **same day** (intraday). Overnight short positions require F&O (futures). Short selling is extremely risky for novices and is better left to experienced traders.`
  },
  {
    id: 'portfolio-diversification',
    title: 'Portfolio Diversification — Why and How?',
    tags: ['diversification', 'portfolio', 'allocation', 'risk management', 'sectors', 'dont put all eggs'],
    category: 'advanced', level: 'intermediate',
    content: `**Diversification** is the strategy of spreading investments across different assets, sectors, and companies to reduce risk. The core idea: don't put all your eggs in one basket. If you invest 100% in IT stocks and the IT sector crashes, your entire portfolio suffers. A well-diversified Indian equity portfolio might include: **IT** (TCS, Infosys), **Banking** (HDFC, ICICI), **FMCG** (HUL, ITC), **Pharma** (Sun Pharma), **Energy** (Reliance, NTPC). Rule of thumb: No single stock should be more than **10–15%** of your portfolio. For true diversification, also consider gold, fixed income, and international ETFs.`
  },
  {
    id: 'dcf-valuation',
    title: 'What is DCF Valuation?',
    tags: ['dcf', 'discounted cash flow', 'intrinsic value', 'valuation method', 'fair value'],
    category: 'advanced', level: 'advanced',
    content: `**DCF (Discounted Cash Flow)** is a fundamental valuation method that estimates a company's **intrinsic value** based on its projected future cash flows, discounted back to today's value. The core idea: ₹100 today is worth more than ₹100 in 5 years because of time value of money. If DCF intrinsic value > current market price, the stock may be **undervalued**. If DCF value < market price, it may be **overvalued**. DCF is powerful but highly sensitive to assumptions about growth rates and discount rates. Small changes in assumptions can dramatically change the result — hence Warren Buffett's "margin of safety" principle: buy stocks significantly below their DCF value.`
  },
  {
    id: 'margin-trading',
    title: 'What is Margin Trading?',
    tags: ['margin', 'margin trading', 'leverage', 'mtf', 'borrow money', 'amplify'],
    category: 'advanced', level: 'advanced',
    content: `**Margin trading** lets you borrow money from your broker to buy more stocks than your actual capital allows, amplifying both gains and losses. Example: With ₹1 lakh and 2x margin, you can buy ₹2 lakh worth of stocks. If the stock rises 10%, you gain ₹20,000 (20% on your capital). But if it falls 10%, you lose ₹20,000 — which is 20% of your actual money, not 10%. Brokers can issue a **margin call** if your losses erode the collateral — forcing you to deposit more funds or square off positions. Margin is suitable only for experienced traders with strict stop-loss discipline. Most beginners should avoid margin trading entirely.`
  },
  {
    id: 'pledged-shares-risk',
    title: 'Why Are Pledged Promoter Shares Dangerous?',
    tags: ['pledged shares', 'pledge', 'promoter pledge', 'margin call risk', 'forced selling'],
    category: 'advanced', level: 'advanced',
    content: `When promoters **pledge their shares** as collateral for personal or business loans, they introduce hidden risk into the stock. Here's the danger: If the stock price falls significantly, the lender's collateral value drops. The lender then issues a **margin call** forcing the promoter to pledge more shares or repay the loan. If unable to do so, the lender **sells the pledged shares in the open market**, causing further price decline. This creates a dangerous spiral — **falling price → forced selling → more price fall**. Pledged shares > 30% of promoter holding is a major red flag. Always check the **Shareholding Pattern** section for pledged share data.`
  },
  {
    id: 'read-annual-report',
    title: 'How to Read a Company Annual Report',
    tags: ['annual report', 'financials', 'balance sheet', 'profit loss', 'cash flow', 'ar', 'results'],
    category: 'advanced', level: 'advanced',
    content: `An **Annual Report** is the most complete source of truth about a company. Key sections to read: (1) **MD&A (Management Discussion & Analysis)**: Management explains performance, challenges, and future strategy — read for forward guidance. (2) **Profit & Loss Statement**: Revenue, expenses, and net profit over the year. (3) **Balance Sheet**: Company's assets, liabilities, and equity at year-end. (4) **Cash Flow Statement**: Most important — cash generated from operations. Profitable companies can still go bankrupt with poor cash flow. (5) **Auditor's Report**: Any qualifications or red flags. (6) **Notes to Accounts**: Devil is always in the details. Annual reports for NSE-listed companies are available free on BSE/NSE websites.`
  },
  {
    id: 'how-to-analyze-stock',
    title: 'How Do I Analyze a Stock Before Buying?',
    tags: ['analyze stock', 'research', 'buy', 'stock analysis', 'how to pick', 'checklist', 'invest'],
    category: 'fundamentals', level: 'intermediate',
    content: `Before buying any stock, run through this checklist: (1) **Business model**: Do you understand how the company makes money? (2) **Revenue & profit growth**: Is revenue growing consistently over 3–5 years? (3) **Profit margins**: Are they stable or improving? (4) **ROE**: Is it consistently > 15%? (5) **Debt level**: Is D/E ratio manageable (< 1 for non-banks)? (6) **Promoter holding**: > 50% and not pledged? (7) **Valuation**: Is the P/E reasonable vs. sector peers and historical average? (8) **Key risks**: What could go wrong? Regulation changes? New competition? (9) **Management quality**: Has management delivered on past promises? Use our "Analyze Stock" button to get an AI-powered analysis of these factors.`
  },
  {
    id: 'risk-management',
    title: 'Risk Management in Stock Investing',
    tags: ['risk', 'risk management', 'stop loss', 'position sizing', 'capital preservation', 'protect'],
    category: 'fundamentals', level: 'intermediate',
    content: `**Rule #1: Never lose more than you can afford to lose.** Key risk management principles for Indian investors: (1) **Position sizing**: Don't put more than 5–10% of your portfolio in any single stock. (2) **Stop-loss**: Define your exit before you enter — e.g., "If this stock falls 15%, I will sell." (3) **Don't use borrowed money** (avoid margin for long-term investing). (4) **Keep 10–20% in cash** to buy opportunities during market corrections. (5) **Emotional discipline**: Never average down blindly on falling stocks — understand WHY it is falling. (6) **Time in market > timing the market**: Long-term investing beats short-term trading for most people statistically. First protect capital, then grow it.`
  },
  {
    id: 'mutual-funds',
    title: 'Mutual Funds vs Direct Stock Investing',
    tags: ['mutual fund', 'direct stock', 'active fund', 'passive fund', 'index fund', 'fund manager', 'nifty etf'],
    category: 'basics', level: 'beginner',
    content: `**Mutual Funds** pool money from many investors and a professional fund manager invests it. **Two types**: (1) **Active funds**: Fund manager picks stocks trying to beat the index — but 70–80% of active funds underperform the Nifty 50 over 10 years. (2) **Index funds/ETFs**: Simply mirror the Nifty 50 or Sensex — lower cost, more tax-efficient, and often outperform active funds long-term. For beginners: **Nifty 50 Index Fund or ETF** is the safest, lowest-cost way to gain broad market exposure. For more experienced investors, direct stock picking can outperform — but requires significant research, time, and discipline.`
  },
  {
    id: 'sector-analysis',
    title: 'Sector Analysis — Why Sectors Matter',
    tags: ['sector', 'sector analysis', 'it sector', 'banking sector', 'fmcg', 'pharma', 'cyclical', 'defensive'],
    category: 'fundamentals', level: 'intermediate',
    content: `Different sectors behave differently in various economic conditions. **Cyclical sectors** (Autos, Real Estate, Metals) boom during economic expansion and crash during slowdowns. **Defensive sectors** (FMCG, Pharma, Utilities) are more stable — people buy toothpaste and medicine regardless of economic conditions. **IT sector** is tied to global technology spending and US/Europe demand. In India's current phase of economic growth, **Banking, Infrastructure, and Capital Goods** tend to be strong performers. Sector rotation — money moving from one sector to another — is a key driver of stock prices. Watch which sectors FIIs are buying to anticipate trends.`
  },
  {
    id: 'compounding',
    title: 'The Power of Compounding in Investing',
    tags: ['compounding', 'compound interest', 'power of compounding', 'long term', 'cagr', 'wealth creation'],
    category: 'basics', level: 'beginner',
    content: `**Compounding** is earning returns on your returns — the most powerful force in investing. Example: ₹1 lakh invested at 15% annual returns: After 10 years → ₹4 lakh. After 20 years → ₹16 lakh. After 30 years → **₹66 lakh**. The key ingredient is **time**. Starting early, even with small amounts, dramatically outperforms large amounts invested late. This is why Warren Buffett says time in the market beats timing the market. The Nifty 50 has delivered approximately **12–15% CAGR** over any 15+ year period — enough to grow wealth significantly through the magic of compounding. Start early, stay invested, and avoid panic selling.`
  },
  {
    id: 'pe-vs-pb-when-to-use',
    title: 'When to Use P/E vs P/B Ratio?',
    tags: ['pe vs pb', 'when to use pe', 'when to use pb', 'banking valuation', 'ratio comparison'],
    category: 'fundamentals', level: 'intermediate',
    content: `**P/E Ratio** is best for companies that have consistent and predictable earnings — IT companies, FMCG brands, and consumer businesses. Use it when earnings are the primary value driver. **P/B Ratio** is best for **asset-heavy businesses** — especially banks, NBFCs, and insurance companies. For banks, the quality of assets (loans) drives value more than earnings. A bank trading at 3x P/B with 18% ROE is often more attractive than one at 2x P/B with 8% ROE. General rule: Use P/E for tech and consumer companies. Use P/B for financial companies. Always compare within the **same sector** — cross-sector P/E comparisons are misleading.`
  },
  {
    id: 'good-vs-bad-debt',
    title: 'Not All Debt is Bad — Good Debt vs Bad Debt',
    tags: ['debt', 'good debt', 'bad debt', 'capex', 'expansion', 'interest coverage', 'debt analysis'],
    category: 'fundamentals', level: 'intermediate',
    content: `Companies often take on debt — and it's not always bad. **Good debt** is borrowed to fund productive expansion: a factory, new capacity, or a strategic acquisition that generates returns higher than the interest cost. **Bad debt** is borrowed for working capital shortfalls, to pay dividends, or to cover losses — a red flag. The **Interest Coverage Ratio** (EBIT ÷ Interest Expense) tells you how comfortably a company can service its debt. A ratio **> 3x** is generally healthy. **< 1.5x** is risky — the company struggles to pay interest from operating profits. Always assess WHY a company has taken on debt before labeling it dangerous.`
  },
  {
    id: 'understand-quarterly-results',
    title: 'How to Read Quarterly Results',
    tags: ['quarterly results', 'q1 q2 q3 q4', 'results', 'earnings season', 'beat miss', 'revenue growth'],
    category: 'fundamentals', level: 'intermediate',
    content: `Every 3 months, listed companies publish their **quarterly financial results**. Key numbers to track: (1) **Revenue (Topline)**: Is the company growing its sales? (2) **Net Profit (Bottomline)**: Is it converting revenue into profit? (3) **EBITDA Margins**: Profitability before non-cash items — is it expanding or contracting? (4) **YoY vs QoQ**: Compare this quarter to the same quarter last year (YoY) and the previous quarter (QoQ). (5) **Beat vs Miss**: Companies have analyst expectations — if profit beats estimates, the stock often rises. A miss can cause sharp selling. (6) **Management Commentary**: The guidance and future outlook from management often moves the stock more than the actual numbers.`
  },
  {
    id: 'market-timing',
    title: 'Is Market Timing Possible?',
    tags: ['market timing', 'when to buy', 'when to sell', 'timing', 'should i buy now', 'is it right time'],
    category: 'fundamentals', level: 'beginner',
    content: `**No one can consistently and reliably time the market** — not even the world's best fund managers. Studies consistently show that trying to time the market (predict the exact top or bottom) leads to worse outcomes than simply staying invested. A famous study found that if you **missed just the 10 best days** of the market over 20 years, your returns were halved compared to simply staying invested every day. The better strategy: **Time in the market > Timing the market.** Use SIP to invest regularly, have a solid emergency fund before investing, and hold fundamentally strong stocks during short-term volatility. The right time to invest is almost always: **now, with a long enough horizon.**`
  },
  {
    id: 'what-moves-stock-price',
    title: 'What Makes a Stock Price Go Up or Down?',
    tags: ['why stock goes up', 'why stock falls', 'what moves price', 'supply demand', 'catalysts'],
    category: 'basics', level: 'beginner',
    content: `Stock prices are driven by **supply and demand** — when more people want to buy than sell, prices rise, and vice versa. Key drivers: (1) **Earnings results** — stronger than expected profits push prices up. (2) **Management guidance** — positive future outlook attracts buyers. (3) **FII/DII flows** — large institutional buying lifts prices. (4) **Macro factors** — RBI rate decisions, inflation data, GDP growth. (5) **Global cues** — US markets, China data, crude oil prices affect Indian markets significantly. (6) **News and events** — regulatory changes, promoter activity, new product launches, mergers. Short term: sentiment rules. Long term: fundamentals always win.`
  },

  // ── INVESTMENT STRATEGY ─────────────────────────────────────────────
  {
    id: 'long-term-investing',
    title: 'Long-Term Investing — The Proven Strategy',
    tags: ['long term', 'investing strategy', 'buy and hold', 'patience', '10 year', 'wealth creation long term'],
    category: 'strategy', level: 'beginner',
    content: `**Long-term investing** (holding quality stocks for 5–10+ years) is statistically the most reliable strategy for retail investors in India. Why it works: (1) Compounding amplifies returns dramatically over time. (2) You ride out short-term volatility which is noise in the long run. (3) Lower tax impact (LTCG at 12.5% vs STCG at 20%). (4) You avoid the psychological trap of reacting to daily market news. India's GDP is projected to grow at 6–7% annually for decades — invest in quality businesses that benefit from this structural growth. Best candidates for long-term holding: market leaders in banking, IT, FMCG, and consumption sectors with consistent 15%+ ROE.`
  },
  {
    id: 'value-vs-growth-investing',
    title: 'Value Investing vs Growth Investing',
    tags: ['value investing', 'growth investing', 'warren buffett', 'growth stocks', 'value stocks', 'strategy'],
    category: 'strategy', level: 'intermediate',
    content: `**Value Investing**: Buying stocks trading below their intrinsic value — finding cheap, undervalued companies. Pioneer: Benjamin Graham, Warren Buffett. Look for low P/E, high dividend yield, and solid fundamentals trading at discounted prices. **Growth Investing**: Buying companies expected to grow revenues and profits significantly faster than the market — even at seemingly high valuations. Pioneer: Philip Fisher, Peter Lynch. Look for expanding TAM (total addressable market), strong management, and consistent double-digit revenue growth. In India, value investing has historically worked well in banking and FMCG. Growth investing shines in IT, consumer tech (Zomato), and new-age businesses. Most successful investors use a hybrid approach.`
  },
  {
    id: 'blue-chip-stocks',
    title: 'What are Blue Chip Stocks?',
    tags: ['blue chip', 'large cap', 'quality stock', 'safe stock', 'index stock', 'nifty stock'],
    category: 'strategy', level: 'beginner',
    content: `**Blue chip stocks** are shares of large, well-established, financially sound companies that have been operating for many years. They have track records of reliable earnings, stable dividends, and consistent growth. In India, blue chips include **Reliance Industries, TCS, HDFC Bank, Infosys, HUL, and L&T**. Characteristics of blue chips: (1) Nifty 50 / Sensex constituents. (2) Market cap > ₹50,000–1,00,000 Cr. (3) 10+ years of consistent profitability. (4) Strong brand recognition. (5) Institutional investor ownership. While blue chips won't multiply 10x quickly, they are the safest way to participate in India's long-term economic growth with minimal risk of permanent capital loss.`
  },
  {
    id: 'averaging-down',
    title: 'Should I Average Down on a Falling Stock?',
    tags: ['average down', 'averaging', 'buy more', 'falling stock', 'should i buy more', 'cost averaging'],
    category: 'strategy', level: 'intermediate',
    content: `**Averaging down** means buying more shares of a stock as its price falls to lower your average cost. This can work — but only if the stock is falling due to temporary market sentiment, not fundamental problems. **Ask yourself before averaging down**: (1) Has the business changed? (2) Are promoters selling? (3) Are earnings declining? (4) Did you fully research this before the first buy? If the answer to any of these is "yes" or "I don't know" — **do not average down blindly.** Never average down hoping to "break even" — that's emotional decision-making. Only add if you have fresh conviction the business is strong and the fall is unjustified by fundamentals.`
  }
];

// ── RETRIEVAL ENGINE ─────────────────────────────────────────────────────
/**
 * Retrieves the most relevant knowledge articles for a given query.
 * Uses keyword overlap scoring — no API or embedding model required.
 * @param {string} query - The user's question
 * @param {number} topK - Number of top articles to return
 * @returns {Array} - Top matching knowledge articles
 */
function retrieveKnowledge(query, topK = 2) {
    if (!query || query.trim().length < 2) return [];

    // Tokenize: split into words, remove noise
    const stopWords = new Set(['what','is','the','a','an','of','in','and','to','how','do','i','me','my','for','are','does','this','that','it','can','with','on','or','at','by','from','about']);
    const tokens = query.toLowerCase()
        .replace(/[?!.,;]/g, '')
        .split(/\s+/)
        .filter(t => t.length > 2 && !stopWords.has(t));

    if (tokens.length === 0) return [];

    const scores = MARKET_KNOWLEDGE.map(entry => {
        let score = 0;
        const titleLower = entry.title.toLowerCase();
        const contentLower = entry.content.toLowerCase();
        const tagsJoined = entry.tags.join(' ').toLowerCase();

        tokens.forEach(token => {
            // Tag exact match = highest weight
            if (tagsJoined.includes(token)) score += 10;
            // Title match = high weight
            if (titleLower.includes(token)) score += 5;
            // Content mentions = lower weight, capped
            const hits = (contentLower.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            score += Math.min(hits * 2, 8);
        });

        return { entry, score };
    });

    return scores
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(s => s.entry);
}

/**
 * Detects if the query mentions a stock name or ticker.
 * Returns the matching STOCK object or null.
 */
function detectStockMention(query) {
    if (typeof STOCKS === 'undefined') return null;
    const q = query.toLowerCase();
    return STOCKS.find(s => {
        if (q.includes(s.ticker.toLowerCase())) return true;
        const nameParts = s.name.toLowerCase().split(' ');
        return nameParts.some(part => part.length > 3 && q.includes(part));
    }) || null;
}
