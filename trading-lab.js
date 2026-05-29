/* ═══════════════════════════════════════════════════════════
   TRADING LAB PRO — Chart Modal + Dashboard Engine
   Zerodha/Kite-inspired professional trading interface
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ─── Active state ────────────────────────────────────────────
let cmActiveTicker   = null;
let cmActiveRange    = '3m';
let cmChartType      = 'area';   // 'area' | 'candle' | 'line'
let cmTradeMode      = null;     // 'buy' | 'sell' | null
let cmCrossX         = -1;
let cmAnimFrame      = null;
let cmChart          = null;     // canvas element
let cmCtx            = null;
let cmVChart         = null;
let cmVCtx           = null;
let cmChartData      = [];       // [{open,high,low,close,vol,date}]
let cmHoverIdx       = -1;
let tlActiveSub      = 'watchlist'; // 'watchlist' | 'dashboard'

// ─── Generate synthetic OHLCV from price history ─────────────
function buildOHLCV(prices) {
    if (!prices || prices.length === 0) return [];
    return prices.map((close, i) => {
        const prev  = prices[i - 1] || close;
        const delta = close - prev;
        const hi    = close + Math.abs(delta) * (0.4 + Math.random() * 0.6);
        const lo    = close - Math.abs(delta) * (0.4 + Math.random() * 0.6);
        const open  = prev + (close - prev) * (0.2 + Math.random() * 0.6);
        const vol   = Math.floor(100000 + Math.random() * 900000);
        return { open: +open.toFixed(2), high: +hi.toFixed(2), low: +lo.toFixed(2), close: +close.toFixed(2), vol, idx: i };
    });
}

// ─── Open Chart Modal ────────────────────────────────────────
function cmOpen(ticker) {
    const stock = STOCKS.find(s => s.ticker === ticker);
    if (!stock) return;

    cmActiveTicker = ticker;
    cmActiveRange  = '3m';
    cmChartType    = 'area';
    cmTradeMode    = null;
    cmHoverIdx     = -1;

    const overlay = document.getElementById('cmOverlay');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    _cmPopulateHeader(stock);
    _cmSetRange('3m');
    _cmRenderSidebar(stock);

    // Keyboard ESC to close
    document.onkeydown = e => { if (e.key === 'Escape') cmClose(); };
}

function cmClose() {
    document.getElementById('cmOverlay').classList.remove('open');
    document.body.style.overflow = '';
    cmActiveTicker = null;
    document.onkeydown = null;
    if (cmAnimFrame) { cancelAnimationFrame(cmAnimFrame); cmAnimFrame = null; }
}

// ─── Populate header ─────────────────────────────────────────
function _cmPopulateHeader(stock) {
    const isUp = stock.change >= 0;
    document.getElementById('cmLogo').textContent  = stock.emoji;
    document.getElementById('cmTicker').textContent = stock.ticker;
    document.getElementById('cmFullName').textContent = stock.name;
    document.getElementById('cmPrice').textContent  = '₹' + (stock.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const chgEl = document.getElementById('cmChange');
    const sign  = isUp ? '+' : '';
    chgEl.textContent = `${sign}₹${Math.abs(stock.change || 0).toFixed(2)}  (${sign}${stock.changePct || 0}%)`;
    chgEl.className = 'cm-change ' + (isUp ? 'up' : 'down');
}

// ─── Range switching ─────────────────────────────────────────
function _cmSetRange(range) {
    cmActiveRange = range;
    document.querySelectorAll('.cm-range-tab').forEach(t => t.classList.toggle('active', t.dataset.range === range));

    const stock = STOCKS.find(s => s.ticker === cmActiveTicker);
    if (!stock) return;

    let prices = [];
    if (range === '7d')  prices = stock.priceHistory?.['7d']  || [];
    if (range === '1m')  prices = stock.priceHistory?.['1m']  || [];
    if (range === '3m')  prices = stock.priceHistory?.['3m']  || [];

    cmChartData = buildOHLCV(prices);
    _cmDraw();
    _cmUpdateMiniStats(stock, cmChartData);
}

window.cmSetRange = _cmSetRange;

// ─── Chart type switching ────────────────────────────────────
window.cmSetType = function(type) {
    cmChartType = type;
    document.querySelectorAll('.cm-type-tab').forEach(t => t.classList.toggle('active', t.dataset.type === type));
    _cmDraw();
};

// ─── Draw chart ──────────────────────────────────────────────
function _cmDraw() {
    cmChart = document.getElementById('cmChart');
    cmCtx   = cmChart?.getContext('2d');
    cmVChart = document.getElementById('cmVolumeChart');
    cmVCtx  = cmVChart?.getContext('2d');
    if (!cmCtx || cmChartData.length === 0) {
        _cmShowNoData();
        return;
    }
    document.getElementById('cmNoData').style.display = 'none';

    const dpr  = window.devicePixelRatio || 1;
    const W    = cmChart.parentElement.clientWidth;
    const H    = cmChart.parentElement.clientHeight || 300;
    cmChart.width  = W * dpr; cmChart.height = H * dpr;
    cmChart.style.width  = W + 'px'; cmChart.style.height = H + 'px';
    cmCtx.scale(dpr, dpr);

    const pad = { top: 18, bottom: 28, left: 8, right: 54 };
    const iW  = W - pad.left - pad.right;
    const iH  = H - pad.top  - pad.bottom;

    cmCtx.clearRect(0, 0, W, H);

    const closes = cmChartData.map(d => d.close);
    const highs  = cmChartData.map(d => d.high);
    const lows   = cmChartData.map(d => d.low);
    const minP   = Math.min(...lows);
    const maxP   = Math.max(...highs);
    const rangeP = maxP - minP || 1;

    const toX = i => pad.left + (i / (cmChartData.length - 1)) * iW;
    const toY = v => pad.top  + iH - ((v - minP) / rangeP) * iH;

    const isUp = closes[closes.length - 1] >= closes[0];
    const lineColor = isUp ? '#00d68f' : '#ff4d6a';

    // ── Grid lines ──
    cmCtx.strokeStyle = 'rgba(255,255,255,0.04)';
    cmCtx.lineWidth = 1;
    for (let gi = 0; gi <= 4; gi++) {
        const y = pad.top + (iH / 4) * gi;
        cmCtx.beginPath(); cmCtx.moveTo(pad.left, y); cmCtx.lineTo(W - pad.right, y); cmCtx.stroke();
        const val = maxP - (rangeP / 4) * gi;
        cmCtx.fillStyle = 'rgba(110,118,129,0.7)';
        cmCtx.font = '10px Inter, sans-serif';
        cmCtx.textAlign = 'left';
        cmCtx.fillText('₹' + val.toFixed(1), W - pad.right + 4, y + 4);
    }

    if (cmChartType === 'candle') {
        _cmDrawCandles(pad, iW, iH, toX, toY, minP, rangeP);
    } else {
        _cmDrawArea(pad, iW, iH, toX, toY, closes, lineColor);
    }

    // ── Moving Averages (Indicators) ──
    if (cmChartData.length > 20) {
        const ma20 = _cmCalcSMA(cmChartData.map(d => d.close), 20);
        _cmDrawMALine(ma20, toX, toY, '#5bc8f5'); // Blue-ish
    }
    if (cmChartData.length > 50) {
        const ma50 = _cmCalcSMA(cmChartData.map(d => d.close), 50);
        _cmDrawMALine(ma50, toX, toY, '#f0c040'); // Yellow-ish
    }

    // ── Crosshair hover ──
    if (cmHoverIdx >= 0 && cmHoverIdx < cmChartData.length) {
        const x = toX(cmHoverIdx);
        cmCtx.strokeStyle = 'rgba(255,255,255,0.25)';
        cmCtx.setLineDash([4, 4]); cmCtx.lineWidth = 1;
        cmCtx.beginPath(); cmCtx.moveTo(x, pad.top); cmCtx.lineTo(x, H - pad.bottom); cmCtx.stroke();
        cmCtx.setLineDash([]);

        const d = cmChartData[cmHoverIdx];
        const py = toY(d.close);
        cmCtx.beginPath(); cmCtx.arc(x, py, 4, 0, Math.PI * 2);
        cmCtx.fillStyle = lineColor; cmCtx.fill();
        cmCtx.strokeStyle = '#0d1117'; cmCtx.lineWidth = 2; cmCtx.stroke();

        _cmUpdateTooltip(x, py, d, W);
    }

    _cmDrawVolume(dpr);
}

function _cmCalcSMA(data, period) {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            sma.push(null);
        } else {
            let sum = 0;
            for (let j = 0; j < period; j++) sum += data[i - j];
            sma.push(sum / period);
        }
    }
    return sma;
}

function _cmDrawMALine(maData, toX, toY, color) {
    cmCtx.beginPath();
    cmCtx.lineWidth = 1.5;
    cmCtx.strokeStyle = color;
    let first = true;
    maData.forEach((val, i) => {
        if (val === null) return;
        const x = toX(i);
        const y = toY(val);
        if (first) {
            cmCtx.moveTo(x, y);
            first = false;
        } else {
            cmCtx.lineTo(x, y);
        }
    });
    cmCtx.stroke();
}

function _cmDrawArea(pad, iW, iH, toX, toY, closes, lineColor) {
    const W = cmChart.width / (window.devicePixelRatio || 1);
    const H = cmChart.height / (window.devicePixelRatio || 1);
    const pts = closes.map((v, i) => ({ x: toX(i), y: toY(v) }));

    // Gradient fill
    const grad = cmCtx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
    const isUp = closes[closes.length - 1] >= closes[0];
    if (isUp) {
        grad.addColorStop(0, 'rgba(0,214,143,0.20)');
        grad.addColorStop(1, 'rgba(0,214,143,0.01)');
    } else {
        grad.addColorStop(0, 'rgba(255,77,106,0.20)');
        grad.addColorStop(1, 'rgba(255,77,106,0.01)');
    }

    cmCtx.beginPath();
    cmCtx.moveTo(pts[0].x, H - pad.bottom);
    pts.forEach(p => cmCtx.lineTo(p.x, p.y));
    cmCtx.lineTo(pts[pts.length - 1].x, H - pad.bottom);
    cmCtx.closePath();
    cmCtx.fillStyle = grad; cmCtx.fill();

    // Line
    cmCtx.beginPath();
    pts.forEach((p, i) => i === 0 ? cmCtx.moveTo(p.x, p.y) : cmCtx.lineTo(p.x, p.y));
    cmCtx.strokeStyle = lineColor; cmCtx.lineWidth = 2;
    cmCtx.lineJoin = 'round'; cmCtx.lineCap = 'round'; cmCtx.stroke();

    // Last price line
    const last = pts[pts.length - 1];
    cmCtx.strokeStyle = 'rgba(255,255,255,0.15)'; cmCtx.lineWidth = 1;
    cmCtx.setLineDash([3, 5]);
    cmCtx.beginPath(); cmCtx.moveTo(pad.left, last.y); cmCtx.lineTo(last.x, last.y); cmCtx.stroke();
    cmCtx.setLineDash([]);
}

function _cmDrawCandles(pad, iW, iH, toX, toY, minP, rangeP) {
    const n    = cmChartData.length;
    const barW = Math.max(2, (iW / n) * 0.7);

    cmChartData.forEach((d, i) => {
        const x     = toX(i);
        const isUp  = d.close >= d.open;
        const color = isUp ? '#00d68f' : '#ff4d6a';

        // Wick
        cmCtx.strokeStyle = color; cmCtx.lineWidth = 1;
        cmCtx.beginPath();
        cmCtx.moveTo(x, toY(d.high));
        cmCtx.lineTo(x, toY(d.low));
        cmCtx.stroke();

        // Body
        const bodyTop = toY(Math.max(d.open, d.close));
        const bodyBot = toY(Math.min(d.open, d.close));
        const bodyH   = Math.max(1, bodyBot - bodyTop);
        cmCtx.fillStyle = color;
        cmCtx.fillRect(x - barW / 2, bodyTop, barW, bodyH);
    });
}

function _cmDrawVolume(dpr) {
    if (!cmVCtx || cmChartData.length === 0) return;
    const W   = cmVChart.parentElement.clientWidth;
    const H   = cmVChart.parentElement.clientHeight || 60;
    cmVChart.width  = W * dpr; cmVChart.height = H * dpr;
    cmVChart.style.width  = W + 'px'; cmVChart.style.height = H + 'px';
    cmVCtx.scale(dpr, dpr);
    cmVCtx.clearRect(0, 0, W, H);

    const vols  = cmChartData.map(d => d.vol);
    const maxV  = Math.max(...vols) || 1;
    const bW    = Math.max(1, W / cmChartData.length - 1);

    cmChartData.forEach((d, i) => {
        const x  = (i / cmChartData.length) * W;
        const bH = (d.vol / maxV) * H * 0.85;
        const isUp = d.close >= d.open;
        cmVCtx.fillStyle = isUp ? 'rgba(0,214,143,0.35)' : 'rgba(255,77,106,0.35)';
        cmVCtx.fillRect(x, H - bH, bW, bH);
    });
}

function _cmShowNoData() {
    const nd = document.getElementById('cmNoData');
    if (nd) nd.style.display = 'flex';
}

// ─── Tooltip on hover ────────────────────────────────────────
function _cmUpdateTooltip(x, y, d, W) {
    const tip = document.getElementById('cmCrosshairLabel');
    if (!tip) return;
    const dateStr = d.idx !== undefined ? `Day ${d.idx + 1}` : '';
    tip.innerHTML = `<strong>₹${d.close.toFixed(2)}</strong>  O:${d.open.toFixed(1)} H:${d.high.toFixed(1)} L:${d.low.toFixed(1)}`;
    tip.style.display = 'block';
    const tipLeft = x + 12 + 140 > W ? x - 150 : x + 12;
    tip.style.left  = tipLeft + 'px';
    tip.style.top   = Math.max(0, y - 20) + 'px';
}

// ─── Canvas mousemove handlers ───────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    // Delay to ensure canvas exists
    setTimeout(_cmAttachMouseHandlers, 500);
});

function _cmAttachMouseHandlers() {
    const canvas = document.getElementById('cmChart');
    if (!canvas) return;

    canvas.addEventListener('mousemove', function(e) {
        if (!cmChartData.length) return;
        const rect  = canvas.getBoundingClientRect();
        const xPos  = e.clientX - rect.left;
        const pad   = { left: 8, right: 54 };
        const iW    = rect.width - pad.left - pad.right;
        const ratio = (xPos - pad.left) / iW;
        cmHoverIdx  = Math.max(0, Math.min(cmChartData.length - 1, Math.round(ratio * (cmChartData.length - 1))));
        _cmDraw();
    });

    canvas.addEventListener('mouseleave', function() {
        cmHoverIdx = -1;
        const tip = document.getElementById('cmCrosshairLabel');
        if (tip) tip.style.display = 'none';
        _cmDraw();
    });
}

// ─── Mini stats row ──────────────────────────────────────────
function _cmUpdateMiniStats(stock, data) {
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('cmMSHigh52',  stock.high52 !== '—' ? '₹' + stock.high52 : '—');
    setEl('cmMSLow52',   stock.low52  !== '—' ? '₹' + stock.low52  : '—');
    setEl('cmMSMktCap',  stock.marketCap || '—');
    setEl('cmMSPE',      stock.pe || '—');
    setEl('cmMSVol',     stock.volume || '—');
    if (data.length > 0) {
        const first = data[0].close;
        const last  = data[data.length - 1].close;
        const pct   = ((last - first) / first * 100).toFixed(2);
        setEl('cmMSPeriodChg', (pct >= 0 ? '+' : '') + pct + '%');
        const el = document.getElementById('cmMSPeriodChg');
        if (el) el.style.color = pct >= 0 ? '#00d68f' : '#ff6b6b';
    }
}

// ─── Sidebar ─────────────────────────────────────────────────
function _cmRenderSidebar(stock) {
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('cmSbSector',    stock.sector || '—');
    setEl('cmSbExchange',  stock.exchange || 'NSE');
    setEl('cmSbPE',        stock.pe || '—');
    setEl('cmSbPB',        stock.pbRatio || '—');
    setEl('cmSbROE',       stock.roe || '—');
    setEl('cmSbDE',        stock.debtEquity || '—');
    setEl('cmSbEPS',       stock.eps || '—');
    setEl('cmSbDivYield',  stock.divYield || '—');

    // Sentiment bar
    const pct = stock.sentiment || 50;
    const barFill = document.getElementById('cmSentimentFill');
    if (barFill) {
        barFill.style.width  = pct + '%';
        barFill.style.background = pct >= 70 ? '#00d68f' : pct >= 45 ? '#f0c040' : '#ff4d6a';
    }
    setEl('cmSentimentLabel', pct >= 70 ? 'Bullish 📈' : pct >= 45 ? 'Neutral ⚖️' : 'Bearish 📉');
}

// ─── Trade panel inside chart modal ──────────────────────────
window.cmInitTrade = function(mode) {
    const stock = STOCKS.find(s => s.ticker === cmActiveTicker);
    if (!stock) return;

    tlInit();
    cmTradeMode = mode;

    const panel = document.getElementById('cmTradePanel');
    if (!panel) return;
    panel.style.display = 'flex';

    const modeLabel = document.getElementById('cmTradeModeLabel');
    if (modeLabel) {
        modeLabel.textContent = mode === 'buy' ? 'BUY ' + cmActiveTicker : 'SELL ' + cmActiveTicker;
        modeLabel.style.color = mode === 'buy' ? '#00d68f' : '#ff4d6a';
    }

    const priceEl = document.getElementById('cmTradePrice');
    if (priceEl) priceEl.textContent = '₹' + (stock.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

    const balEl = document.getElementById('cmTradeBalance');
    if (balEl) {
        if (mode === 'buy') {
            balEl.innerHTML = `<span style="color:#6e7681;">Available Cash</span> <strong>₹${tlState.cash.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>`;
        } else {
            const held = tlState.holdings[cmActiveTicker];
            balEl.innerHTML = `<span style="color:#6e7681;">Shares Held</span> <strong>${held ? held.qty : 0}</strong>`;
        }
    }

    document.getElementById('cmTradeQty').value = 1;
    _cmUpdateTradeTotal();

    const btn = document.getElementById('cmTradeExecuteBtn');
    if (btn) {
        btn.textContent = mode === 'buy' ? 'Confirm Buy' : 'Confirm Sell';
        btn.className   = 'cm-confirm-execute ' + mode;
    }
};

window.cmChangeQty = function(delta) {
    const inp = document.getElementById('cmTradeQty');
    const cur = parseInt(inp.value) || 1;
    inp.value = Math.max(1, cur + delta);
    _cmUpdateTradeTotal();
};

function _cmUpdateTradeTotal() {
    const stock = STOCKS.find(s => s.ticker === cmActiveTicker);
    if (!stock) return;
    const qty   = parseInt(document.getElementById('cmTradeQty')?.value) || 1;
    const total = (stock.price || 0) * qty;
    const el    = document.getElementById('cmTradeTotal');
    if (el) el.textContent = 'Total: ₹' + total.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

window.cmCancelTrade = function() {
    const panel = document.getElementById('cmTradePanel');
    if (panel) panel.style.display = 'none';
    cmTradeMode = null;
};

window.cmExecuteTrade = function() {
    const stock = STOCKS.find(s => s.ticker === cmActiveTicker);
    if (!stock || !cmTradeMode) return;
    const qty   = parseInt(document.getElementById('cmTradeQty')?.value) || 1;
    // Use best available price — never trade at ₹0
    const price = (typeof tlGetBestPrice === 'function' ? tlGetBestPrice(cmActiveTicker) : null) || stock.price;
    if (!price || price <= 0) {
        tlShowToast('⚠️ Price not available yet. Please wait a moment.', 'red'); return;
    }
    const total = price * qty;

    tlInit();

    if (cmTradeMode === 'buy') {
        if (total > tlState.cash) {
            tlShowToast('❌ Insufficient cash balance!', 'red'); return;
        }
        const existing = tlState.holdings[cmActiveTicker];
        if (existing) {
            const newAvg = ((existing.avgBuy * existing.qty) + total) / (existing.qty + qty);
            tlState.holdings[cmActiveTicker] = { qty: existing.qty + qty, avgBuy: +newAvg.toFixed(2) };
        } else {
            tlState.holdings[cmActiveTicker] = { qty, avgBuy: +price.toFixed(2) };
        }
        tlState.cash -= total;
    } else {
        const existing = tlState.holdings[cmActiveTicker];
        if (!existing || existing.qty < qty) {
            tlShowToast(`❌ You only hold ${existing ? existing.qty : 0} shares.`, 'red'); return;
        }
        existing.qty -= qty;
        if (existing.qty === 0) delete tlState.holdings[cmActiveTicker];
        tlState.cash += total;
    }

    const now     = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata', hour12: true });
    const dateKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const trade   = { time: now, date: dateKey, ticker: cmActiveTicker, action: cmTradeMode.toUpperCase(), qty, price: +price.toFixed(2), total: +total.toFixed(2), cashAfter: +tlState.cash.toFixed(2) };

    tlState.history.push(trade);
    tlSaveState();
    tlPersistTrade(trade).catch(() => {});

    cmCancelTrade();
    cmClose();
    tlRender();

    tlShowToast(`✅ ${trade.action} ${qty} × ${cmActiveTicker} @ ₹${price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, cmTradeMode === 'buy' ? 'green' : 'red');
};

// ─────────────────────────────────────────────────────────────
// TRADING LAB DASHBOARD
// Professional portfolio overview with equity curve
// ─────────────────────────────────────────────────────────────

window.tlSwitchSub = function(tab) {
    tlActiveSub = tab;
    // Support both old .tl-subtab and new .td-tab classes
    document.querySelectorAll('.tl-subtab, .td-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));

    document.getElementById('tlSubWatchlist').style.display   = tab === 'watchlist'  ? 'flex'  : 'none';
    document.getElementById('tlSubDashboard').style.display   = tab === 'dashboard'  ? 'block' : 'none';
    document.getElementById('tlSubHeatmap') && (document.getElementById('tlSubHeatmap').style.display = tab === 'heatmap' ? 'block' : 'none');
    document.getElementById('tlSubHoldings').style.display    = tab === 'holdings'   ? 'block' : 'none';
    document.getElementById('tlSubHistory').style.display     = tab === 'history'    ? 'block' : 'none';

    if (tab === 'dashboard') tlRenderDashboard();
    if (tab === 'heatmap' && typeof tlRenderHeatmap === 'function') setTimeout(tlRenderHeatmap, 100);
    if (tab === 'history'  && typeof _renderHistoryPro === 'function') setTimeout(_renderHistoryPro, 50);
};

function tlRenderDashboard() {
    tlInit();
    const portVal  = tlCalcPortfolioValue();
    const totalVal = tlState.cash + portVal;
    const pnl      = totalVal - TL_INITIAL_CASH;
    const ret      = ((pnl / TL_INITIAL_CASH) * 100).toFixed(2);
    const holdings = Object.entries(tlState.holdings).filter(([, h]) => h.qty > 0);

    // ── Build equity curve from trade history ──
    const equityCurve = _buildEquityCurve();

    const grid = document.getElementById('tlDashGrid');
    if (!grid) return;

    // P&L colour class
    const pnlClass = pnl >= 0 ? 'positive' : 'negative';
    const retClass = ret >= 0 ? 'positive' : 'negative';

    grid.innerHTML = `
        <!-- Row 1: KPI Cards -->
        <div class="tl-dash-cards-row">
            <div class="tl-dash-card accent">
                <div class="tl-dash-card-label">💼 Total Portfolio</div>
                <div class="tl-dash-card-value">₹${totalVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div class="tl-dash-card-sub">Cash + Holdings</div>
            </div>
            <div class="tl-dash-card ${pnlClass}">
                <div class="tl-dash-card-label">📈 Total P&amp;L</div>
                <div class="tl-dash-card-value">${pnl >= 0 ? '+' : ''}₹${Math.abs(pnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div class="tl-dash-card-sub">Since inception</div>
            </div>
            <div class="tl-dash-card ${retClass}">
                <div class="tl-dash-card-label">🎯 Return</div>
                <div class="tl-dash-card-value">${ret >= 0 ? '+' : ''}${ret}%</div>
                <div class="tl-dash-card-sub">On ₹1,00,000 capital</div>
            </div>
            <div class="tl-dash-card">
                <div class="tl-dash-card-label">💵 Free Cash</div>
                <div class="tl-dash-card-value">₹${tlState.cash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div class="tl-dash-card-sub">Available to deploy</div>
            </div>
            <div class="tl-dash-card">
                <div class="tl-dash-card-label">📊 Invested</div>
                <div class="tl-dash-card-value">₹${portVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div class="tl-dash-card-sub">${holdings.length} position${holdings.length !== 1 ? 's' : ''}</div>
            </div>
            <div class="tl-dash-card">
                <div class="tl-dash-card-label">🔄 Total Trades</div>
                <div class="tl-dash-card-value">${tlState.history.length}</div>
                <div class="tl-dash-card-sub">${tlState.history.filter(t => t.action === 'BUY').length} buys · ${tlState.history.filter(t => t.action === 'SELL').length} sells</div>
            </div>
        </div>

        <!-- Row 2: Equity Curve + Holdings Breakdown -->
        <div class="tl-dash-two-col">
            <div class="tl-equity-card" style="flex:1.4">
                <div class="tl-equity-header">
                    <span class="tl-equity-title">Portfolio Equity Curve</span>
                    <span style="font-size:0.68rem; color:${pnl >= 0 ? '#00d68f' : '#ff6b6b'};font-weight:700;">${pnl >= 0 ? '▲' : '▼'} ${Math.abs(ret)}%</span>
                </div>
                <div class="tl-equity-canvas-wrap" style="height:140px;">
                    <canvas id="tlEquityChart"></canvas>
                </div>
            </div>

            <div class="tl-equity-card" style="flex:1">
                <div class="tl-equity-header">
                    <span class="tl-equity-title">Holdings Breakdown</span>
                </div>
                ${holdings.length === 0
                    ? `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:80px;color:#4e5a6e;gap:0.4rem;"><span style="font-size:1.5rem;">📭</span><span style="font-size:0.78rem;">No open positions</span></div>`
                    : `<div style="display:flex;flex-direction:column;gap:0.4rem;margin-top:0.4rem;">
                        ${holdings.map(([ticker, h]) => {
                            const s    = STOCKS.find(x => x.ticker === ticker);
                            const ltp  = (s && s.price > 0) ? s.price : h.avgBuy;
                            const val  = ltp * h.qty;
                            const pnlH = (ltp - h.avgBuy) * h.qty;
                            const pct  = portVal > 0 ? (val / portVal * 100).toFixed(1) : '0.0';
                            const pHCls = pnlH >= 0 ? '#00d68f' : '#ff6b6b';
                            return `<div style="display:flex;align-items:center;gap:0.5rem;">
                                <span style="font-size:1rem;">${s ? s.emoji : '📌'}</span>
                                <div style="flex:1;min-width:0;">
                                    <div style="display:flex;justify-content:space-between;align-items:center;">
                                        <span style="font-size:0.75rem;font-weight:700;color:#e6edf3;">${ticker}</span>
                                        <span style="font-size:0.72rem;font-weight:700;color:${pHCls};">${pnlH >= 0 ? '+' : ''}₹${Math.abs(pnlH).toFixed(0)}</span>
                                    </div>
                                    <div style="height:3px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:3px;overflow:hidden;">
                                        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#7c8cf8,#a78bfa);border-radius:2px;"></div>
                                    </div>
                                    <div style="font-size:0.62rem;color:#6e7681;margin-top:2px;">${pct}% of holdings · ${h.qty} shares</div>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>`
                }
            </div>
        </div>

        <!-- Row 3: Recent trades mini log -->
        ${tlState.history.length > 0 ? `
        <div class="tl-equity-card" style="margin-top:0;">
            <div class="tl-equity-header"><span class="tl-equity-title">Recent Trades</span></div>
            <div style="display:grid;grid-template-columns:1fr 1fr 80px 60px 100px;gap:0.3rem;margin-top:0.5rem;">
                <div style="font-size:0.62rem;color:#4e5a6e;font-weight:700;text-transform:uppercase;padding:0 0.3rem;">Time</div>
                <div style="font-size:0.62rem;color:#4e5a6e;font-weight:700;text-transform:uppercase;">Stock</div>
                <div style="font-size:0.62rem;color:#4e5a6e;font-weight:700;text-transform:uppercase;">B/S</div>
                <div style="font-size:0.62rem;color:#4e5a6e;font-weight:700;text-transform:uppercase;">Qty</div>
                <div style="font-size:0.62rem;color:#4e5a6e;font-weight:700;text-transform:uppercase;">Price</div>
                ${[...tlState.history].reverse().slice(0, 6).map(t => {
                    const s = STOCKS.find(x => x.ticker === t.ticker);
                    return `
                    <div style="font-size:0.72rem;color:#6e7681;padding:0.35rem 0.3rem;">${t.time}</div>
                    <div style="font-size:0.72rem;color:#e6edf3;font-weight:600;">${s ? s.emoji + ' ' : ''}${t.ticker}</div>
                    <div><span style="font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:4px;background:${t.action === 'BUY' ? 'rgba(0,214,143,0.15)' : 'rgba(255,77,106,0.15)'};color:${t.action === 'BUY' ? '#00d68f' : '#ff4d6a'};">${t.action}</span></div>
                    <div style="font-size:0.72rem;color:#c9d1d9;">${t.qty}</div>
                    <div style="font-size:0.72rem;color:#c9d1d9;font-family:var(--font-mono);">₹${t.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>`;
                }).join('')}
            </div>
        </div>` : ''}
    `;

    setTimeout(() => _tlDrawEquityCurve(equityCurve), 60);
}

function _buildEquityCurve() {
    let capital = TL_INITIAL_CASH;
    const curve = [capital];
    tlState.history.forEach(t => {
        if (t.action === 'BUY')  capital -= t.total;
        else                      capital += t.total;
        curve.push(Math.max(0, capital));
    });
    if (curve.length === 1) curve.push(capital); // flat line if no trades
    return curve;
}

function _tlDrawEquityCurve(curve) {
    const canvas = document.getElementById('tlEquityChart');
    if (!canvas || curve.length < 2) return;
    const ctx  = canvas.getContext('2d');
    const dpr  = window.devicePixelRatio || 1;
    const W    = canvas.parentElement.clientWidth;
    const H    = canvas.parentElement.clientHeight || 120;
    canvas.width  = W * dpr; canvas.height  = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const pad    = 8;
    const minC   = Math.min(...curve);
    const maxC   = Math.max(...curve);
    const rangeC = (maxC - minC) || 1;

    const isUp   = curve[curve.length - 1] >= TL_INITIAL_CASH;
    const toX    = i => pad + (i / (curve.length - 1)) * (W - pad * 2);
    const toY    = v => pad + (H - pad * 2) - ((v - minC) / rangeC) * (H - pad * 2);

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, isUp ? 'rgba(0,214,143,0.25)' : 'rgba(255,77,106,0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    ctx.moveTo(toX(0), H);
    curve.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(toX(curve.length - 1), H);
    ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    curve.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = isUp ? '#00d68f' : '#ff4d6a';
    ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();

    // Initial capital dotted line
    const baseY = toY(TL_INITIAL_CASH);
    if (baseY > pad && baseY < H - pad) {
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.moveTo(pad, baseY); ctx.lineTo(W - pad, baseY); ctx.stroke();
        ctx.setLineDash([]);
    }
}

// ─── Sparkline SVG builder ────────────────────────────────────
function _buildSparkline(s) {
    const raw = s.priceHistory?.['7d'] || s.priceHistory?.['1m'] || s._tickHistory || [];
    if (raw.length < 4) return '<svg width="60" height="22"></svg>';
    const pts  = raw.slice(-20); // last 20 points
    const W = 60, H = 22, pad = 2;
    const mn = Math.min(...pts), mx = Math.max(...pts);
    const rng = mx - mn || 1;
    const toX = i => pad + (i / (pts.length - 1)) * (W - pad * 2);
    const toY = v => H - pad - ((v - mn) / rng) * (H - pad * 2);
    const isUp = pts[pts.length - 1] >= pts[0];
    const col  = isUp ? '#00d68f' : '#ff4d6a';
    const colA = isUp ? 'rgba(0,214,143,0.18)' : 'rgba(255,77,106,0.18)';

    let d = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
    const fillD = `${d} L${toX(pts.length-1).toFixed(1)},${H} L${toX(0).toFixed(1)},${H} Z`;

    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="tl-sparkline">
        <defs><linearGradient id="sg-${s.ticker}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${col}" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
        </linearGradient></defs>
        <path d="${fillD}" fill="url(#sg-${s.ticker})"/>
        <path d="${d}" fill="none" stroke="${col}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
}

// ─── Watchlist row click → chart ─────────────────────────────
// Patched version of tlRenderWatchlist to add chart-on-click
window.tlRenderWatchlistPro = function() {
    const body = document.getElementById('tlWatchlistBody');
    if (!body) return;

    body.innerHTML = STOCKS.map(s => {
        const price    = s.price > 0 ? s.price : null;
        const priceStr = price
            ? '₹' + price.toLocaleString('en-IN', { maximumFractionDigits: 2 })
            : '<span style="color:var(--text-muted)">Loading…</span>';
        const chgCls   = s.change >= 0 ? 'up' : 'down';
        const chgStr   = s.changePct !== undefined && s.price > 0
            ? (s.change >= 0 ? '▲ ' : '▼ ') + Math.abs(s.changePct).toFixed(2) + '%' : '—';
        const held     = tlState && tlState.holdings[s.ticker];
        const hasHold  = held && held.qty > 0;
        const high52   = s.high52 && s.high52 !== '—' ? '₹' + s.high52 : '—';
        const low52    = s.low52  && s.low52  !== '—' ? '₹' + s.low52  : '—';
        const vol      = s.volume || '—';

        // Small progress bar: where is price in 52W range?
        let posBar = '';
        if (s.high52 && s.low52 && s.high52 !== '—' && price) {
            const h = parseFloat(s.high52);
            const l = parseFloat(s.low52);
            const pct = Math.min(100, Math.max(0, ((price - l) / (h - l)) * 100));
            const col = pct > 60 ? '#00d68f' : pct > 30 ? '#f0c040' : '#ff4d6a';
            posBar = `<div class="tl-wl-pct-bar-bg"><div class="tl-wl-pct-bar-fill" style="width:${pct}%;background:${col};"></div></div>`;
        }

        return `
        <div class="tl-wl-row tl-wl-row-interactive" data-ticker="${s.ticker}" data-name="${s.name}" data-sector="${s.sector||''}" onclick="cmOpen('${s.ticker}')">
            <div class="tl-wl-instrument">
                <span class="tl-wl-emoji">${s.emoji}</span>
                <div>
                    <div class="tl-wl-name">${s.ticker}${hasHold ? ` <span style="font-size:0.62rem;color:#7c8cf8;">[${held.qty}]</span>` : ''}</div>
                    <div class="tl-wl-fullname">${s.name}</div>
                </div>
                <div class="tl-sparkline-wrap">${_buildSparkline(s)}</div>
            </div>
            <div class="tl-wl-price" id="price-${s.ticker}">${priceStr}</div>
            <div class="tl-wl-chg ${chgCls}" id="chg-${s.ticker}">${chgStr}</div>
            <div class="tl-wl-52w">
                <div>H: ${high52}</div>
                <div>L: ${low52}${posBar}</div>
            </div>
            <div class="tl-wl-num">${vol}</div>
            <div class="tl-wl-actions" onclick="event.stopPropagation()">
                <button class="tl-wl-buy"  onclick="event.stopPropagation();tlOpenModal('${s.ticker}','buy')">B</button>
                <button class="tl-wl-sell" onclick="event.stopPropagation();tlOpenModal('${s.ticker}','sell')" ${!hasHold ? 'disabled' : ''}>S</button>
            </div>
        </div>`;
    }).join('');
};

// ─── Override tlRenderWatchlist to use Pro version ────────────
document.addEventListener('DOMContentLoaded', () => {
    // Patch the original after a tick so it loads after app.js
    setTimeout(() => {
        if (typeof tlRender === 'function') {
            // Monkey-patch tlRenderWatchlist
            window._origTlRenderWatchlist = window.tlRenderWatchlist;
            window.tlRenderWatchlist = window.tlRenderWatchlistPro;
            tlRender();
        }
        _cmAttachMouseHandlers();
    }, 400);
});

// Resize handler
window.addEventListener('resize', () => {
    if (cmActiveTicker && cmChartData.length) _cmDraw();
    if (tlActiveSub === 'dashboard') {
        const curve = _buildEquityCurve();
        _tlDrawEquityCurve(curve);
    }
});

// ═══════════════════════════════════════════════════════════
// ── FEATURE 1: WATCHLIST SEARCH + SECTOR FILTER ──────────
// ═══════════════════════════════════════════════════════════
let _tlActiveSector = 'All';

window.tlSetSector = function(sector) {
    _tlActiveSector = sector;
    document.querySelectorAll('.tl-sector-chip, .td-chip').forEach(c =>
        c.classList.toggle('active', c.dataset.sector === sector));
    tlFilterWatchlist();
};

window.tlFilterWatchlist = function() {
    const q     = (document.getElementById('tlWlSearch')?.value || '').toLowerCase().trim();
    const clear = document.getElementById('tlWlSearchClear');
    if (clear) clear.style.display = q ? 'flex' : 'none';

    const rows = document.querySelectorAll('.tl-wl-row[data-ticker]');
    let visible = 0;
    rows.forEach(row => {
        const ticker   = row.dataset.ticker || '';
        const name     = row.dataset.name   || '';
        const sector   = row.dataset.sector || '';
        const matchQ   = !q || ticker.toLowerCase().includes(q) || name.toLowerCase().includes(q);
        const matchSec = _tlActiveSector === 'All' || sector === _tlActiveSector;
        const show     = matchQ && matchSec;
        row.style.display = show ? '' : 'none';
        if (show) visible++;
    });
    const countEl = document.getElementById('tlWlCount');
    if (countEl) countEl.textContent = `${visible} stocks shown · Click row to open chart`;
};

window.tlClearSearch = function() {
    const el = document.getElementById('tlWlSearch');
    if (el) { el.value = ''; tlFilterWatchlist(); el.focus(); }
};

// ═══════════════════════════════════════════════════════════
// ── FEATURE 2: TOP MOVERS RIBBON ─────────────────────────
// ═══════════════════════════════════════════════════════════
function tlUpdateMovers() {
    const loaded = STOCKS.filter(s => s._loaded && s.price > 0);
    if (loaded.length < 3) return;

    const sorted  = [...loaded].sort((a, b) => b.changePct - a.changePct);
    const gainers = sorted.slice(0, 4);
    const losers  = sorted.slice(-4).reverse();

    const pill = (s, isGain) =>
        `<span class="tl-mover-pill ${isGain ? 'green' : 'red'}" onclick="cmOpen('${s.ticker}')">
            <b>${s.ticker}</b> <span>${s.changePct > 0 ? '+' : ''}${s.changePct.toFixed(2)}%</span>
        </span>`;

    const gEl = document.getElementById('tlGainerPills');
    const lEl = document.getElementById('tlLoserPills');
    if (gEl) gEl.innerHTML = gainers.map(s => pill(s, true)).join('');
    if (lEl) lEl.innerHTML = losers.map(s => pill(s, false)).join('');
}

// ═══════════════════════════════════════════════════════════
// ── FEATURE 3: PRICE ALERTS ──────────────────────────────
// ═══════════════════════════════════════════════════════════
let _tlAlerts = JSON.parse(localStorage.getItem('tl_alerts_v1') || '[]');

function _saveAlerts() {
    localStorage.setItem('tl_alerts_v1', JSON.stringify(_tlAlerts));
    _updateAlertBadge();
    _renderAlertsList();
}

function _updateAlertBadge() {
    const badge = document.getElementById('tlAlertBadge');
    if (!badge) return;
    const count = _tlAlerts.length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

function _renderAlertsList() {
    const el = document.getElementById('tlAlertsList');
    if (!el) return;
    if (_tlAlerts.length === 0) {
        el.innerHTML = '<div class="tl-empty-state"><span>🔕</span><p>No alerts set.<br>Add one above to get notified.</p></div>';
        return;
    }
    el.innerHTML = _tlAlerts.map((a, i) => `
        <div class="tl-alert-item ${a.triggered ? 'tl-alert-triggered' : ''}">
            <div class="tl-alert-item-left">
                <span class="tl-alert-ticker">${a.ticker}</span>
                <span class="tl-alert-desc">${a.condition === 'above' ? '▲ rises above' : '▼ falls below'} ₹${a.targetPrice.toLocaleString('en-IN')}</span>
                ${a.triggered ? '<span class="tl-alert-fired">✅ Triggered!</span>' : ''}
            </div>
            <button class="tl-alert-del" onclick="tlDeleteAlert(${i})" title="Delete">✕</button>
        </div>`).join('');
}

window.tlOpenAlerts = function() {
    // Populate ticker select
    const sel = document.getElementById('tlAlertTicker');
    if (sel && sel.options.length <= 1) {
        STOCK_METADATA.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.ticker; opt.textContent = `${m.ticker} — ${m.name}`;
            sel.appendChild(opt);
        });
    }
    document.getElementById('tlAlertsOverlay').style.display = 'flex';
    _renderAlertsList();
};

window.tlCloseAlerts = function() {
    document.getElementById('tlAlertsOverlay').style.display = 'none';
};

window.tlAddAlert = function() {
    const ticker    = document.getElementById('tlAlertTicker').value;
    const condition = document.getElementById('tlAlertCondition').value;
    const price     = parseFloat(document.getElementById('tlAlertPrice').value);
    if (!ticker || !price || isNaN(price)) {
        tlShowToast('⚠️ Please fill all fields!', 'red'); return;
    }
    _tlAlerts.push({ ticker, condition, targetPrice: price, triggered: false, createdAt: Date.now() });
    _saveAlerts();
    document.getElementById('tlAlertPrice').value = '';
    tlShowToast(`🔔 Alert set: ${ticker} ${condition} ₹${price}`, 'green');
};

window.tlDeleteAlert = function(idx) {
    _tlAlerts.splice(idx, 1);
    _saveAlerts();
};

// Check alerts against live prices every 30s
function _checkAlerts() {
    let anyTriggered = false;
    _tlAlerts.forEach(a => {
        if (a.triggered) return;
        const stock = STOCKS.find(s => s.ticker === a.ticker);
        if (!stock || !stock.price) return;
        const hit = a.condition === 'above' ? stock.price >= a.targetPrice
                                             : stock.price <= a.targetPrice;
        if (hit) {
            a.triggered = true;
            anyTriggered = true;
            tlShowToast(`🔔 ALERT: ${a.ticker} ${a.condition === 'above' ? '▲' : '▼'} ₹${a.targetPrice}!`, 'green');
            // Play a soft beep
            try {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const g   = ctx.createGain();
                osc.connect(g); g.connect(ctx.destination);
                osc.frequency.value = 880;
                g.gain.setValueAtTime(0.3, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                osc.start(); osc.stop(ctx.currentTime + 0.4);
            } catch(e) {}
        }
    });
    if (anyTriggered) { _saveAlerts(); _updateAlertBadge(); }
}

setInterval(_checkAlerts, 30000);
_updateAlertBadge();

// ═══════════════════════════════════════════════════════════
// ── FEATURE 4: POSITION SIZER ────────────────────────────
// ═══════════════════════════════════════════════════════════
window.tlCalcSizer = function() {
    const capital = parseFloat(document.getElementById('sizerCapital')?.value) || 0;
    const riskPct = parseFloat(document.getElementById('sizerRisk')?.value)    || 0;
    const entry   = parseFloat(document.getElementById('sizerEntry')?.value)   || 0;
    const sl      = parseFloat(document.getElementById('sizerSL')?.value)      || 0;

    const riskAmt      = capital * (riskPct / 100);
    const riskPerShare = Math.abs(entry - sl);
    const qty          = riskPerShare > 0 ? Math.floor(riskAmt / riskPerShare) : 0;
    const invest       = qty * entry;
    const pct          = capital > 0 ? (invest / capital * 100) : 0;

    const fmt = (n) => n > 0 ? `₹${n.toLocaleString('en-IN', {maximumFractionDigits:2})}` : '—';
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    set('sizerRiskAmt',      fmt(riskAmt));
    set('sizerRiskPerShare', riskPerShare > 0 ? fmt(riskPerShare) : '—');
    set('sizerQty',          qty > 0 ? `${qty} shares` : '—');
    set('sizerInvest',       invest > 0 ? fmt(invest) : '—');
    set('sizerPct',          pct > 0 ? `${pct.toFixed(1)}%` : '—');

    // Warn if over-allocating
    if (pct > 20) {
        document.getElementById('sizerResult')?.classList.add('tl-sizer-warn');
    } else {
        document.getElementById('sizerResult')?.classList.remove('tl-sizer-warn');
    }
};

// ═══════════════════════════════════════════════════════════
// ── FEATURE 5: PATCH tlRender TO ADD FILTER ATTRS + MOVERS
// ═══════════════════════════════════════════════════════════
// Patch the watchlist count after render
const _origTlRender = window.tlRender;
window.tlRender = function() {
    if (_origTlRender) _origTlRender.call(this);
    // After render, add data-attrs to rows and update filters
    setTimeout(() => {
        document.querySelectorAll('.tl-wl-row[data-ticker]').forEach(row => {
            const ticker = row.dataset.ticker;
            if (!ticker) return;
            const stock = STOCKS.find(s => s.ticker === ticker);
            if (stock) {
                row.dataset.name   = stock.name   || '';
                row.dataset.sector = stock.sector || '';
            }
        });
        tlFilterWatchlist();
        tlUpdateMovers();
    }, 100);
};
