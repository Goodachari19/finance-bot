/* ═══════════════════════════════════════════════════════════
   TRADING LAB — Advanced Features
   1. AI Coach: SMA Crossover / Golden-Death Cross detection
   2. Trade Journaling: Notes saved & shown in History tab
   3. Intraday Tick Engine: Realistic OHLCV simulation
   4. Stop-Loss Tracker: Auto-alert on SL breach
   5. Sector Heatmap: Visual performance dashboard
   ═══════════════════════════════════════════════════════════ */
'use strict';

// ═══════════════════════════════════════════════════════════
// FEATURE 1 — INTRADAY TICK ENGINE
// Replaces flat price with GARCH-style random walk
// ═══════════════════════════════════════════════════════════
(function initTickEngine() {
    const TICK_MS  = 3000;   // tick every 3s
    const SIGMA    = 0.0012; // base volatility per tick
    let   _vol     = {};     // per-stock rolling volatility

    function _tick() {
        if (!window.STOCKS) return;
        STOCKS.forEach(s => {
            if (!s._loaded || !s.price) return;

            // GARCH-like: vol persists + mean-reversion
            _vol[s.ticker] = _vol[s.ticker] || SIGMA;
            const shock  = (Math.random() - 0.49) * 2;       // slight upward drift
            const newVol = Math.max(0.0005, Math.min(0.004,
                0.85 * _vol[s.ticker] + 0.15 * SIGMA * (1 + Math.abs(shock))));
            _vol[s.ticker] = newVol;

            const pctMove  = shock * newVol;
            const newPrice = +(s.price * (1 + pctMove)).toFixed(2);
            const baseP    = s._basePrice || s.price;

            s.price     = newPrice;
            s.change    = +(newPrice - baseP).toFixed(2);
            s.changePct = +((s.change / baseP) * 100).toFixed(2);

            // Push to priceHistory['7d'] ring buffer (keep last 100 ticks)
            if (!s._tickHistory) s._tickHistory = [];
            s._tickHistory.push(newPrice);
            if (s._tickHistory.length > 200) s._tickHistory.shift();

            // Append to priceHistory for chart
            if (s.priceHistory) {
                ['7d','1m','3m'].forEach(k => {
                    if (s.priceHistory[k] && s.priceHistory[k].length) {
                        s.priceHistory[k].push(newPrice);
                        if (s.priceHistory[k].length > 400) s.priceHistory[k].shift();
                    }
                });
            }
        });

        // Re-render watchlist row prices (lightweight DOM update)
        _patchPriceDOM();
        // Check stop-loss triggers
        _checkStopLosses();
        // Check price alerts
        if (typeof _checkAlerts === 'function') _checkAlerts();
    }

    function _patchPriceDOM() {
        document.querySelectorAll('.tl-wl-row[data-ticker]').forEach(row => {
            const ticker = row.dataset.ticker;
            const s = STOCKS.find(x => x.ticker === ticker);
            if (!s || !s.price) return;
            const priceEl = row.querySelector('.tl-wl-price');
            const chgEl   = row.querySelector('.tl-wl-chg');
            if (priceEl) priceEl.textContent = '₹' + s.price.toLocaleString('en-IN', { maximumFractionDigits: 2 });
            if (chgEl) {
                const up = s.changePct >= 0;
                chgEl.textContent = (up ? '▲ ' : '▼ ') + Math.abs(s.changePct).toFixed(2) + '%';
                chgEl.className = 'tl-wl-chg ' + (up ? 'up' : 'down');
            }
        });
        // Update movers ribbon
        if (typeof tlUpdateMovers === 'function') tlUpdateMovers();
    }

    // Store base price once loaded
    function _startEngine() {
        if (window._tlEngineStarted) return;
        window._tlEngineStarted = true;
        console.log('[TickEngine] 🚀 Initializing...');
        setTimeout(() => {
            STOCKS.forEach(s => { if (s.price) s._basePrice = s.price; });
            setInterval(_tick, TICK_MS);
            console.log('[TickEngine] ✅ Heartbeat active');
        }, 2000);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        _startEngine();
    } else {
        document.addEventListener('DOMContentLoaded', _startEngine);
    }
})();

// ═══════════════════════════════════════════════════════════
// FEATURE 2 — TRADE JOURNALING
// Captures note + SL from modal, displays in History tab
// ═══════════════════════════════════════════════════════════

// Patch tlExecuteTrade (from app.js) to capture note + SL
function _initJournal() {
    if (window._tlJournalStarted) return;
    window._tlJournalStarted = true;
    setTimeout(() => {
        const _origExec = window.tlExecuteTrade;
        if (!_origExec) return;
        window.tlExecuteTrade = function() {
            const noteEl = document.getElementById('tlTradeNote');
            const slEl   = document.getElementById('tlModalSL');
            window._tlPendingNote = noteEl ? noteEl.value.trim() : '';
            window._tlPendingSL   = slEl   ? parseFloat(slEl.value) || null : null;
            _origExec();
            if (noteEl) noteEl.value = '';
            if (slEl)   slEl.value  = '';
        };

        const _origCmExec = window.cmExecuteTrade;
        if (_origCmExec) {
            window.cmExecuteTrade = function() {
                const noteEl = document.getElementById('cmTradeNote');
                const slEl   = document.getElementById('cmTradeSL');
                window._tlPendingNote = noteEl ? noteEl.value.trim() : '';
                window._tlPendingSL   = slEl   ? parseFloat(slEl.value) || null : null;
                _origCmExec();
                if (noteEl) noteEl.value = '';
                if (slEl)   slEl.value   = '';
            };
        }

        const _origSave = window.tlSaveState;
        if (_origSave) {
            window.tlSaveState = function() {
                const last = tlState.history[tlState.history.length - 1];
                if (last && window._tlPendingNote !== undefined) {
                    last.note = window._tlPendingNote || '';
                    last.sl   = window._tlPendingSL   || null;
                    window._tlPendingNote = undefined;
                    window._tlPendingSL   = undefined;
                    if (last.action === 'BUY' && last.sl) {
                        _registerSL(last.ticker, last.sl);
                    }
                }
                _origSave();
            };
        }

        window.tlRenderHistory = _renderHistoryPro;
        _renderHistoryPro();
    }, 600);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    _initJournal();
} else {
    document.addEventListener('DOMContentLoaded', _initJournal);
}

function _renderHistoryPro() {
    if (!window.tlState) return;
    const empty = document.getElementById('tlHistoryEmpty');
    const table = document.getElementById('tlHistoryTable');
    const list  = document.getElementById('tlHistoryList');
    if (!list) return;

    const history = [...tlState.history].reverse();
    if (history.length === 0) {
        if (empty) empty.style.display = 'flex';
        if (table) table.style.display = 'none';
        return;
    }
    if (empty) empty.style.display = 'none';
    if (table) table.style.display = '';

    // Override header for new columns
    const head = document.querySelector('.tl-ht-head');
    if (head) head.innerHTML = '<span>Time</span><span>Stock</span><span>B/S</span><span>Qty</span><span>Price</span><span>Note</span>';

    list.innerHTML = history.map(t => {
        const s   = STOCKS.find(x => x.ticker === t.ticker);
        const isBuy = t.action === 'BUY';
        const pnl = (!isBuy && t.avgBuy) ? (t.price - t.avgBuy) * t.qty : null;
        const noteBadge = t.note
            ? `<span class="tl-note-badge" title="${t.note.replace(/"/g,"'")}">📝 ${t.note.slice(0,30)}${t.note.length>30?'…':''}</span>`
            : `<span class="tl-note-empty">—</span>`;
        const slBadge = t.sl ? `<span class="tl-sl-badge">SL: ₹${t.sl.toLocaleString('en-IN')}</span>` : '';
        return `
        <div class="tl-ht-row ${isBuy ? 'buy-row' : 'sell-row'}">
            <span class="tl-ht-time">${t.time}<br><span style="font-size:0.6rem;color:#4e5a6e;">${t.date||''}</span></span>
            <span class="tl-ht-stock">${s ? s.emoji+' ' : ''}${t.ticker}</span>
            <span><span class="tl-ht-badge ${isBuy?'buy':'sell'}">${t.action}</span></span>
            <span class="tl-ht-qty">${t.qty}</span>
            <span class="tl-ht-price">₹${t.price.toLocaleString('en-IN',{maximumFractionDigits:2})}<br>${pnl!==null?`<span style="font-size:0.65rem;color:${pnl>=0?'#00d68f':'#ff4d6a'}">${pnl>=0?'+':''}₹${Math.abs(pnl).toFixed(0)}</span>`:''}${slBadge}</span>
            <span class="tl-ht-note">${noteBadge}</span>
        </div>`;
    }).join('');
}

// Hook into tab switch to re-render history
const _origSwitch = window.tlSwitchSub;
if (typeof _origSwitch === 'function') {
    window.tlSwitchSub = function(tab) {
        _origSwitch(tab);
        if (tab === 'history') setTimeout(_renderHistoryPro, 50);
    };
}

// ═══════════════════════════════════════════════════════════
// FEATURE 3 — AI COACH: REDESIGNED MODAL ENGINE
// Uses priceHistory['3m'] (real data from day 1)
// ═══════════════════════════════════════════════════════════

function _calcSMA(prices, period) {
    if (!prices || prices.length < period) return null;
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

function _calcRSI(prices, period = 14) {
    if (!prices || prices.length < period + 1) return null;
    const slice = prices.slice(-(period + 1));
    let gains = 0, losses = 0;
    for (let i = 1; i < slice.length; i++) {
        const d = slice[i] - slice[i - 1];
        if (d > 0) gains += d; else losses -= d;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return +(100 - 100 / (1 + rs)).toFixed(1);
}

function _getPrices(s) {
    // Priority: 3m → 1m → 7d real data → tick history → synthetic fallback
    const p3m = s.priceHistory?.['3m'];
    if (p3m && p3m.length >= 20) return p3m;
    const p1m = s.priceHistory?.['1m'];
    if (p1m && p1m.length >= 20) return p1m;
    const p7d = s.priceHistory?.['7d'];
    if (p7d && p7d.length >= 20) return p7d;
    if (s._tickHistory && s._tickHistory.length >= 20) return s._tickHistory;

    // Synthetic fallback: generate 60-point history from current price
    // Uses stock's 52W high/low to define realistic volatility
    if (!s.price || s.price <= 0) return [];
    const cache = s._synthHistory;
    if (cache && cache[0] === s.price) return cache[1]; // memoize

    const hi = parseFloat(s.high52) || s.price * 1.15;
    const lo = parseFloat(s.low52)  || s.price * 0.85;
    const vol = (hi - lo) / (lo * 60); // per-bar volatility estimate
    const prices = [];
    let p = s.price;
    // Walk backwards from current price
    for (let i = 0; i < 60; i++) {
        prices.unshift(+p.toFixed(2));
        p = p / (1 + (Math.random() - 0.5) * vol * 2);
        p = Math.max(lo * 0.98, Math.min(hi * 1.02, p));
    }
    s._synthHistory = [s.price, prices]; // memoize
    return prices;
}

function _detectCrossovers() {
    const signals = [];
    STOCKS.forEach(s => {
        if (!s._loaded || !s.price) return;
        const hist = _getPrices(s);
        if (hist.length < 52) return;

        // Use last 5 points for confirmation (not just 1 tick)
        const sma20now  = _calcSMA(hist, 20);
        const sma50now  = _calcSMA(hist, 50);
        const sma20prev = _calcSMA(hist.slice(0, -5), 20);
        const sma50prev = _calcSMA(hist.slice(0, -5), 50);
        if (!sma20now || !sma50now || !sma20prev || !sma50prev) return;

        const wasBelow = sma20prev < sma50prev;
        const nowAbove = sma20now  > sma50now;
        const wasAbove = sma20prev > sma50prev;
        const nowBelow = sma20now  < sma50now;
        const gap      = Math.abs(((sma20now - sma50now) / sma50now) * 100);

        if (wasBelow && nowAbove) signals.push({ ticker: s.ticker, name: s.name, emoji: s.emoji,
            type: 'golden', sma20: sma20now.toFixed(2), sma50: sma50now.toFixed(2), price: s.price, gap: gap.toFixed(2) });
        if (wasAbove && nowBelow) signals.push({ ticker: s.ticker, name: s.name, emoji: s.emoji,
            type: 'death', sma20: sma20now.toFixed(2), sma50: sma50now.toFixed(2), price: s.price, gap: gap.toFixed(2) });
    });
    return signals;
}

// ── Modal controls ────────────────────────────────────────
window.tlOpenAICoach = function() {
    const overlay = document.getElementById('tlCoachOverlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    tlRunAICoach();
};

window.tlCloseAICoach = function() {
    const overlay = document.getElementById('tlCoachOverlay');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
};

// Keep backward compat
window.tlGenerateSummary = window.tlOpenAICoach;

window.tlRunAICoach = function() {
    const body = document.getElementById('tlCoachBody');
    if (!body) return;

    body.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;padding:3rem;color:#4e5a6e;">
        <div class="tl-coach-spinner"></div>
        <span style="font-size:0.8rem;">Analysing market data…</span>
    </div>`;

    setTimeout(() => {
        const loadedStocks = STOCKS.filter(s => s._loaded && s.price > 0);
        if (loadedStocks.length === 0) {
            body.innerHTML = `<div style="text-align:center;padding:3rem;color:#4e5a6e;">
                <div style="font-size:2rem;margin-bottom:0.5rem;">📡</div>
                <div style="font-size:0.85rem;">Waiting for stock data to load…<br>Please wait a moment and click ↻ Refresh.</div>
            </div>`;
            return;
        }

        // ── 1. SMA Analysis for all loaded stocks ────────────
        const smaData = loadedStocks.map(s => {
            const hist  = _getPrices(s);
            const sma20 = _calcSMA(hist, 20);
            const sma50 = _calcSMA(hist, 50);
            const rsi   = _calcRSI(hist, 14);
            const trend = sma20 && sma50 ? (sma20 > sma50 ? 'bullish' : 'bearish') : 'neutral';
            const gap   = sma20 && sma50 ? ((sma20 - sma50) / sma50 * 100) : 0;
            return { s, sma20, sma50, rsi, trend, gap, hist };
        });

        // ── 2. Crossover signals ──────────────────────────────
        const signals = _detectCrossovers();

        // ── 3. Portfolio analysis ─────────────────────────────
        const tlS = window.tlState;
        const holdings = tlS ? Object.entries(tlS.holdings).filter(([,h]) => h.qty > 0) : [];
        const history  = tlS ? tlS.history : [];
        let   totalPnL = 0;
        const holdingDetails = holdings.map(([ticker, h]) => {
            const s    = STOCKS.find(x => x.ticker === ticker);
            const ltp  = s?.price || h.avgBuy;
            const pnl  = (ltp - h.avgBuy) * h.qty;
            const pct  = ((ltp - h.avgBuy) / h.avgBuy * 100).toFixed(2);
            const hist = s ? _getPrices(s) : [];
            const rsi  = _calcRSI(hist);
            const sma20 = _calcSMA(hist, 20);
            const sma50 = _calcSMA(hist, 50);
            const trend = sma20 && sma50 ? (sma20 > sma50 ? 'bullish' : 'bearish') : '—';
            totalPnL += pnl;
            return { ticker, h, s, ltp, pnl, pct, rsi, trend };
        });

        // ── 4. Market breadth ─────────────────────────────────
        const bulls = smaData.filter(d => d.trend === 'bullish').length;
        const bears = smaData.filter(d => d.trend === 'bearish').length;
        const breadthPct = loadedStocks.length ? Math.round((bulls / loadedStocks.length) * 100) : 0;
        const marketMood = breadthPct >= 65 ? { label: 'Broadly Bullish 🟢', color: '#00d68f' }
                         : breadthPct >= 45 ? { label: 'Mixed / Sideways 🟡', color: '#f0c040' }
                         : { label: 'Broadly Bearish 🔴', color: '#ff4d6a' };

        // Top RSI overbought/oversold
        const rsiSorted  = smaData.filter(d => d.rsi !== null).sort((a,b) => b.rsi - a.rsi);
        const overbought  = rsiSorted.filter(d => d.rsi >= 70).slice(0, 4);
        const oversold    = rsiSorted.filter(d => d.rsi <= 35).slice(0, 4);

        // Coach tips
        const tips = [];
        if (history.length === 0)           tips.push({ icon:'📌', text:'<b>Start trading!</b> Execute your first trade — use the B button on any watchlist row or click a stock to open its chart.' });
        if (holdings.length === 0 && history.length > 0) tips.push({ icon:'💡', text:'No open positions. Scan bullish SMA crossovers below for potential entries.' });
        if (totalPnL < -1000)               tips.push({ icon:'⚠️', text:`Portfolio unrealised loss: ₹${Math.abs(totalPnL).toFixed(0)}. Review stop-losses. Cut losers early.`, color:'#ff8c42' });
        if (totalPnL > 500)                 tips.push({ icon:'✅', text:`Portfolio unrealised gain: ₹${totalPnL.toFixed(0)}. Consider trailing stop or partial profit booking.`, color:'#00d68f' });
        if (overbought.length)              tips.push({ icon:'🔴', text:`<b>RSI Overbought (≥70):</b> ${overbought.map(d=>`${d.s.emoji} ${d.s.ticker} RSI ${d.rsi}`).join(' · ')} — may be due for a pullback.` });
        if (oversold.length)                tips.push({ icon:'🟢', text:`<b>RSI Oversold (≤35):</b> ${oversold.map(d=>`${d.s.emoji} ${d.s.ticker} RSI ${d.rsi}`).join(' · ')} — potential bounce opportunity.` });
        if (signals.length === 0)           tips.push({ icon:'📊', text:'No fresh crossovers detected right now. Market is in a steady trend. Wait for setups.' });

        // ── BUILD HTML ────────────────────────────────────────
        const signalHtml = signals.length > 0
            ? signals.map(sig => `
            <div class="tl-coach-signal-card ${sig.type}">
                <div class="tl-coach-signal-left">
                    <span class="tl-coach-cross-badge ${sig.type}">${sig.type === 'golden' ? '🌟 GOLDEN CROSS' : '💀 DEATH CROSS'}</span>
                    <span class="tl-coach-sig-name">${sig.emoji} <b>${sig.ticker}</b></span>
                    <span class="tl-coach-sig-detail">SMA20: ₹${sig.sma20} &nbsp;/&nbsp; SMA50: ₹${sig.sma50} &nbsp;·&nbsp; Gap: ${sig.gap}%</span>
                </div>
                <button class="tl-coach-trade-btn ${sig.type}" onclick="tlCloseAICoach();cmOpen('${sig.ticker}')">Open Chart →</button>
            </div>`).join('')
            : `<div class="tl-coach-no-signal">No crossover signals at this time. All ${loadedStocks.length} loaded stocks are in steady trends.</div>`;

        const smaTableRows = smaData.slice(0, 20).map(d => {
            const trendBadge = d.trend === 'bullish'
                ? `<span class="tl-coach-trend-badge bull">📈 Bullish</span>`
                : d.trend === 'bearish' ? `<span class="tl-coach-trend-badge bear">📉 Bearish</span>`
                : `<span class="tl-coach-trend-badge neutral">⚖️ Neutral</span>`;
            const rsiColor = d.rsi >= 70 ? '#ff4d6a' : d.rsi <= 35 ? '#00d68f' : '#8b949e';
            return `<tr class="tl-coach-tr" onclick="tlCloseAICoach();cmOpen('${d.s.ticker}')">
                <td><span class="tl-coach-stock-name">${d.s.emoji} ${d.s.ticker}</span><span class="tl-coach-stock-full">${d.s.name}</span></td>
                <td class="mono">₹${d.s.price.toLocaleString('en-IN',{maximumFractionDigits:2})}</td>
                <td class="mono" style="color:#7c8cf8;">${d.sma20 ? '₹'+d.sma20.toFixed(2) : '—'}</td>
                <td class="mono" style="color:#f0c040;">${d.sma50 ? '₹'+d.sma50.toFixed(2) : '—'}</td>
                <td style="color:${rsiColor};font-weight:700;">${d.rsi ?? '—'}</td>
                <td>${trendBadge}</td>
            </tr>`;
        }).join('');

        const holdingsHtml = holdingDetails.length > 0
            ? holdingDetails.map(d => {
                const pnlColor = d.pnl >= 0 ? '#00d68f' : '#ff4d6a';
                const trendIcon = d.trend === 'bullish' ? '📈' : d.trend === 'bearish' ? '📉' : '⚖️';
                const rsiColor  = d.rsi >= 70 ? '#ff4d6a' : d.rsi && d.rsi <= 35 ? '#00d68f' : '#8b949e';
                const slEl = _stopLosses[d.ticker] ? `<span style="font-size:0.62rem;color:#ff8c8c;margin-left:4px;">SL: ₹${_stopLosses[d.ticker]}</span>` : '';
                return `<div class="tl-coach-hold-row">
                    <div class="tl-coach-hold-left">
                        <span style="font-size:1.1rem;">${d.s?.emoji || '📦'}</span>
                        <div>
                            <div style="font-weight:700;color:#e6edf3;font-size:0.82rem;">${d.ticker}${slEl}</div>
                            <div style="font-size:0.68rem;color:#6e7681;">${d.h.qty} shares @ ₹${d.h.avgBuy.toFixed(2)}</div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:0.8rem;font-weight:800;color:${pnlColor};">${d.pnl>=0?'+':''}₹${d.pnl.toFixed(0)} (${d.pct}%)</div>
                        <div style="font-size:0.65rem;color:#4e5a6e;">${trendIcon} ${d.trend} &nbsp;·&nbsp; RSI: <span style="color:${rsiColor}">${d.rsi ?? '—'}</span></div>
                    </div>
                </div>`;
            }).join('')
            : `<div style="text-align:center;padding:1rem;color:#4e5a6e;font-size:0.78rem;">No open positions.</div>`;

        body.innerHTML = `
        <!-- Market Breadth Banner -->
        <div class="tl-coach-breadth-bar">
            <div>
                <div style="font-size:0.7rem;color:#4e5a6e;text-transform:uppercase;font-weight:700;letter-spacing:0.05em;">Market Breadth</div>
                <div style="font-size:0.9rem;font-weight:800;color:${marketMood.color};margin-top:2px;">${marketMood.label}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:0.68rem;color:#4e5a6e;">${bulls} Bullish · ${bears} Bearish · ${loadedStocks.length} stocks</div>
                <div class="tl-coach-breadth-track"><div class="tl-coach-breadth-fill" style="width:${breadthPct}%;background:${marketMood.color};"></div></div>
            </div>
        </div>

        <!-- Crossover Signals -->
        <div class="tl-coach-section">
            <div class="tl-coach-section-title">🚦 Crossover Signals</div>
            ${signalHtml}
        </div>

        <!-- Open Positions Analysis -->
        <div class="tl-coach-section">
            <div class="tl-coach-section-title">💼 Your Positions
                ${holdingDetails.length > 0 ? `<span class="tl-coach-pnl-total" style="color:${totalPnL>=0?'#00d68f':'#ff4d6a'};">${totalPnL>=0?'+':''}₹${totalPnL.toFixed(0)}</span>` : ''}
            </div>
            ${holdingsHtml}
        </div>

        <!-- SMA + RSI Table -->
        <div class="tl-coach-section">
            <div class="tl-coach-section-title">📊 SMA & RSI Analysis <span style="font-size:0.65rem;color:#4e5a6e;font-weight:400;">(click row to open chart)</span></div>
            <div class="tl-coach-table-wrap">
            <table class="tl-coach-table">
                <thead><tr><th>Stock</th><th>LTP</th><th>SMA 20</th><th>SMA 50</th><th>RSI 14</th><th>Signal</th></tr></thead>
                <tbody>${smaTableRows || '<tr><td colspan="6" style="color:#4e5a6e;text-align:center;padding:1rem">Loading stock data…</td></tr>'}</tbody>
            </table>
            </div>
        </div>

        <!-- Coach Tips -->
        <div class="tl-coach-section">
            <div class="tl-coach-section-title">💡 Coach Insights</div>
            ${tips.map(t => `<div class="tl-coach-insight-row">
                <span class="tl-coach-insight-icon">${t.icon}</span>
                <span class="tl-coach-insight-text" ${t.color ? `style="color:${t.color}"` : ''}>${t.text}</span>
            </div>`).join('')}
            <div class="tl-coach-edu-box">
                <div class="tl-coach-edu-item">🌟 <b>Golden Cross:</b> SMA20 crosses <i>above</i> SMA50 — momentum turning bullish. Entry signal.</div>
                <div class="tl-coach-edu-item">💀 <b>Death Cross:</b> SMA20 crosses <i>below</i> SMA50 — momentum turning bearish. Exit / hedge.</div>
                <div class="tl-coach-edu-item">📊 <b>RSI &gt;70:</b> Overbought — consider trimming. <b>RSI &lt;35:</b> Oversold — watch for reversal.</div>
            </div>
        </div>`;
    }, 200);
};

// Proactive crossover alerts every 60s
setInterval(() => {
    const signals = _detectCrossovers();
    signals.forEach(sig => {
        const isGolden = sig.type === 'golden';
        const msg = isGolden
            ? `🌟 GOLDEN CROSS: ${sig.ticker} — SMA20 above SMA50! Bullish.`
            : `💀 DEATH CROSS: ${sig.ticker} — SMA20 below SMA50! Bearish.`;
        if (typeof tlShowToast === 'function') tlShowToast(msg, isGolden ? 'green' : 'red');
    });
    if (signals.length) {
        const btn = document.getElementById('tlAiCoachBtn');
        if (btn) { btn.style.animation = 'pulse 0.5s ease 4'; setTimeout(() => btn.style.animation = '', 2000); }
    }
}, 60000);

// ═══════════════════════════════════════════════════════════
// FEATURE 4 — STOP-LOSS TRACKER
// Monitors live prices against registered stop-losses
// ═══════════════════════════════════════════════════════════
const _stopLosses = {};  // { ticker: price }

function _registerSL(ticker, slPrice) {
    _stopLosses[ticker] = slPrice;
}

function _checkStopLosses() {
    Object.entries(_stopLosses).forEach(([ticker, slPrice]) => {
        const s = STOCKS.find(x => x.ticker === ticker);
        if (!s || !s.price || s.price > slPrice) return;
        if (typeof tlShowToast === 'function') {
            tlShowToast(`🛑 STOP-LOSS HIT: ${ticker} @ ₹${s.price.toFixed(2)} (SL: ₹${slPrice})`, 'red');
        }
        // Auto-highlight in holdings tab
        const holdEl = document.querySelector(`.tl-port-row[data-ticker="${ticker}"]`);
        if (holdEl) holdEl.classList.add('tl-sl-breach');
        delete _stopLosses[ticker]; // fire once
    });
}

// Restore SLs from trade history on load
function _initSLTracker() {
    if (window._tlSLStarted) return;
    window._tlSLStarted = true;
    setTimeout(() => {
        if (!window.tlState) return;
        tlState.history.forEach(t => {
            if (t.action === 'BUY' && t.sl && tlState.holdings[t.ticker]?.qty > 0) {
                _registerSL(t.ticker, t.sl);
            }
        });
    }, 1500);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    _initSLTracker();
} else {
    document.addEventListener('DOMContentLoaded', _initSLTracker);
}

// ═══════════════════════════════════════════════════════════
// FEATURE 5 — SECTOR HEATMAP (new sub-tab widget)
// ═══════════════════════════════════════════════════════════
function tlRenderHeatmap() {
    const el = document.getElementById('tlHeatmapGrid');
    if (!el) return;
    const sectorMap = {};
    STOCKS.filter(s => s._loaded && s.price > 0).forEach(s => {
        if (!sectorMap[s.sector]) sectorMap[s.sector] = [];
        sectorMap[s.sector].push(s);
    });
    el.innerHTML = Object.entries(sectorMap).map(([sector, stocks]) => {
        const avgChg = stocks.reduce((a,s)=>a+s.changePct,0) / stocks.length;
        const col = avgChg > 1 ? '#00d68f' : avgChg > 0 ? '#3dba7e' : avgChg > -1 ? '#ff8c42' : '#ff4d6a';
        const bg  = avgChg > 1 ? 'rgba(0,214,143,0.15)' : avgChg > 0 ? 'rgba(0,214,143,0.07)' : avgChg > -1 ? 'rgba(255,140,66,0.1)' : 'rgba(255,77,106,0.15)';
        const stockPills = stocks.map(s =>
            `<span class="tl-hm-pill" onclick="cmOpen('${s.ticker}')" style="background:${bg};border-color:${col}30">
                ${s.emoji} ${s.ticker} <b style="color:${col}">${s.changePct>=0?'+':''}${s.changePct.toFixed(1)}%</b>
            </span>`).join('');
        return `<div class="tl-hm-sector">
            <div class="tl-hm-sector-header" style="color:${col}">
                ${sector} <span class="tl-hm-avg" style="background:${bg};color:${col}">${avgChg>=0?'+':''}${avgChg.toFixed(2)}%</span>
            </div>
            <div class="tl-hm-pills">${stockPills}</div>
        </div>`;
    }).join('');
}

// Auto-refresh heatmap when dashboard is open
setInterval(() => {
    if (window.tlActiveSub === 'heatmap') tlRenderHeatmap();
}, 10000);

// ═══════════════════════════════════════════════════════════
// FEATURE 6 — PRICE FLASH + SPARKLINE UPDATE ON TICK
// ═══════════════════════════════════════════════════════════
(function initInteractivity() {
    // Override _patchPriceDOM from tick engine with flash animations
    const _origPatch = window._patchPriceDOM;
    window._patchPriceDOM_withFlash = function() {
        document.querySelectorAll('.tl-wl-row[data-ticker]').forEach(row => {
            const ticker = row.dataset.ticker;
            const s = STOCKS.find(x => x.ticker === ticker);
            if (!s || !s.price) return;

            const priceEl = document.getElementById('price-' + ticker);
            const chgEl   = document.getElementById('chg-' + ticker);

            if (priceEl) {
                const prevPrice = parseFloat(priceEl.dataset.prev || s.price);
                const newPrice  = s.price;
                const newText   = '₹' + newPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 });

                if (priceEl.textContent !== newText) {
                    const dir = newPrice >= prevPrice ? 'up' : 'down';
                    priceEl.textContent = newText;
                    priceEl.dataset.prev = newPrice;
                    priceEl.classList.remove('flash-up', 'flash-down');
                    void priceEl.offsetWidth; // reflow
                    priceEl.classList.add('flash-' + dir);
                    setTimeout(() => priceEl.classList.remove('flash-up', 'flash-down'), 800);
                }
            }

            if (chgEl) {
                const up = s.changePct >= 0;
                chgEl.textContent = (up ? '▲ ' : '▼ ') + Math.abs(s.changePct).toFixed(2) + '%';
                chgEl.className = 'tl-wl-chg ' + (up ? 'up' : 'down');
            }
        });
        // Update movers ribbon
        if (typeof tlUpdateMovers === 'function') tlUpdateMovers();
        // Update P&L with smooth animation
        _animateStats();
    };

    // Patch the tick engine's DOM update
    const tickInterval = setInterval(() => {
        if (typeof STOCKS !== 'undefined') {
            // Override the tick engine's _patchPriceDOM reference
            clearInterval(tickInterval);
        }
    }, 500);

    // Hook into each tick cycle by monkey-patching the interval trigger
    // We re-attach after first tick engine loads
    setTimeout(() => {
        // Patch priceDOM directly by overriding the function in the closure
        // The tick engine calls _patchPriceDOM() — we shadow it
        window._patchPriceDOM = window._patchPriceDOM_withFlash;
    }, 3000);
})();

// ═══════════════════════════════════════════════════════════
// FEATURE 7 — ANIMATED STAT COUNTERS
// ═══════════════════════════════════════════════════════════
let _prevPnL = 0;
function _animateStats() {
    if (!window.tlState) return;
    const tlS = window.tlState;

    // Calculate current P&L
    let totalPnL = 0;
    let totalInvested = 0;
    Object.entries(tlS.holdings).forEach(([ticker, h]) => {
        if (h.qty <= 0) return;
        const s = STOCKS.find(x => x.ticker === ticker);
        const ltp = s?.price || h.avgBuy;
        totalPnL += (ltp - h.avgBuy) * h.qty;
        totalInvested += h.avgBuy * h.qty;
    });

    // Animate P&L if changed significantly
    const pnlEl = document.getElementById('tlPnL');
    const retEl = document.getElementById('tlReturn');
    if (pnlEl && Math.abs(totalPnL - _prevPnL) > 0.5) {
        _prevPnL = totalPnL;
        const sign = totalPnL >= 0 ? '+' : '';
        pnlEl.textContent = sign + '₹' + Math.abs(totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 });
        pnlEl.style.color = totalPnL >= 0 ? '#00d68f' : '#ff4d6a';
        pnlEl.classList.remove('stat-flash');
        void pnlEl.offsetWidth;
        pnlEl.classList.add('stat-flash');

        if (retEl) {
            const retPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
            retEl.textContent = (retPct >= 0 ? '+' : '') + retPct.toFixed(2) + '%';
            retEl.style.color = retPct >= 0 ? '#00d68f' : '#ff4d6a';
        }
    }
}

// ═══════════════════════════════════════════════════════════
// FEATURE 8 — KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════
(function initKeyboardShortcuts() {
    let _focusedIdx = -1;

    function _getRows() {
        return Array.from(document.querySelectorAll('.tl-wl-row[data-ticker]'));
    }

    function _highlight(idx) {
        _getRows().forEach((r, i) => r.classList.toggle('tl-wl-kb-focus', i === idx));
        const rows = _getRows();
        if (rows[idx]) rows[idx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function _showShortcutToast(msg) {
        const el = document.createElement('div');
        el.className = 'tl-kb-hint';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }

    document.addEventListener('keydown', e => {
        // Don't intercept when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

        // Only active in TradeDesk tab
        if (window.tlActiveSub !== 'watchlist') return;
        const rows = _getRows();

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                _focusedIdx = Math.min(_focusedIdx + 1, rows.length - 1);
                _highlight(_focusedIdx);
                break;
            case 'ArrowUp':
                e.preventDefault();
                _focusedIdx = Math.max(_focusedIdx - 1, 0);
                _highlight(_focusedIdx);
                break;
            case 'Enter':
                if (_focusedIdx >= 0 && rows[_focusedIdx]) {
                    e.preventDefault();
                    rows[_focusedIdx].click();
                }
                break;
            case 'b': case 'B':
                if (_focusedIdx >= 0 && rows[_focusedIdx]) {
                    const ticker = rows[_focusedIdx].dataset.ticker;
                    if (ticker && typeof tlOpenModal === 'function') {
                        e.preventDefault();
                        tlOpenModal(ticker, 'buy');
                    }
                }
                break;
            case 's': case 'S':
                if (_focusedIdx >= 0 && rows[_focusedIdx]) {
                    const ticker = rows[_focusedIdx].dataset.ticker;
                    if (ticker && typeof tlOpenModal === 'function') {
                        e.preventDefault();
                        tlOpenModal(ticker, 'sell');
                    }
                }
                break;
            case 'Escape':
                _focusedIdx = -1;
                _highlight(-1);
                // Close any open modal
                const overlay = document.getElementById('tlModalOverlay');
                if (overlay && overlay.style.display !== 'none') overlay.style.display = 'none';
                const cmOverlay = document.getElementById('cmOverlay');
                if (cmOverlay && cmOverlay.classList.contains('open')) cmOverlay.classList.remove('open');
                tlCloseAICoach?.();
                break;
            case '?':
                _showShortcutToast('↑↓ Navigate · Enter Open Chart · B Buy · S Sell · Esc Close');
                break;
        }
    });

    // Show hint on first visit
    setTimeout(() => {
        if (window.tlActiveSub === 'watchlist') {
            _showShortcutToast('💡 Tip: Use ↑↓ arrows + B/S keys to trade fast. Press ? for help.');
        }
    }, 5000);
})();

