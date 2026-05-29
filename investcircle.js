// ═══════════════════════════════════════════════════════════
// INVESTCIRCLE — Investor Community & Advisor Marketplace
// ═══════════════════════════════════════════════════════════

let IC_EXPERTS = [];
let IC_FEED_POSTS = [];

// State
let icActiveFilter = 'all';
let icActiveSort   = 'followers';
let icConnected    = {};

// ── Fetch Data from Backend ────────────────────────────────
async function icFetchData() {
  try {
    const [expRes, postRes] = await Promise.all([
      fetch('/api/ic/experts'),
      fetch('/api/ic/posts')
    ]);
    
    const expData = await expRes.json();
    const postData = await postRes.json();

    // Transform Experts
    IC_EXPERTS = expData.experts.map(e => ({
      ...e,
      filterTags: e.filterTags ? e.filterTags.split(',') : [],
      specializations: e.specializations ? e.specializations.split(',') : [],
      certifications: e.certifications ? JSON.parse(e.certifications) : [],
      stats: { 
        returns: e.returns, 
        followers: e.followers, 
        recommendations: e.recommendations, 
        winRate: e.winRate 
      },
      posts: postData.posts
        .filter(p => p.author_name === e.name)
        .map(p => ({
          text: p.content,
          time: icFormatTime(p.timestamp)
        }))
    }));

    // Transform Posts
    IC_FEED_POSTS = postData.posts.map(p => ({
      id: p.id,
      author: p.author_name,
      role: p.author_role,
      text: p.content,
      category: p.category,
      time: icFormatTime(p.timestamp),
      likes: p.likes,
      comments: p.comments_count
    }));

    icRenderAll();
  } catch (err) {
    console.error('Failed to fetch InvestCircle data:', err);
    icShowToast('⚠️ Error loading community data');
  }
}

function icFormatTime(ts) {
  if (!ts) return 'Just now';
  const diff = Math.floor((new Date() - new Date(ts + 'Z')) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

// ── View Switch Hook ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const orig = window.switchView;
  window.switchView = function(view) {
    orig(view);
    if (view === 'investcircle') {
      document.getElementById('panelInvestCircle').style.display = 'flex';
      icFetchData(); // Fetch fresh data from DB on enter
    } else {
      const p = document.getElementById('panelInvestCircle');
      if (p) p.style.display = 'none';
    }
  };
});

// ── Render Expert Cards ───────────────────────────────────
function icRenderAll() {
  icRenderCards();
  icRenderFeed();
}

function icFilterExperts() { icRenderCards(); }

function icSetFilter(f) {
  icActiveFilter = f;
  document.querySelectorAll('.ic-chip').forEach(c => c.classList.toggle('active', c.dataset.filter === f));
  icRenderCards();
}

function icSetSort(s) {
  icActiveSort = s;
  icRenderCards();
}

function icRenderCards() {
  const grid  = document.getElementById('icCardsGrid');
  const query = (document.getElementById('icSearch')?.value || '').toLowerCase();

  let experts = IC_EXPERTS.filter(e => {
    const matchFilter = icActiveFilter === 'all' || e.filterTags.includes(icActiveFilter);
    const matchSearch = !query ||
      e.name.toLowerCase().includes(query) ||
      e.specializations.some(s => s.toLowerCase().includes(query)) ||
      e.certifications.some(c => c.label.toLowerCase().includes(query));
    return matchFilter && matchSearch;
  });

  // Sort
  const sortKey = { followers: e => parseFloat(e.stats.followers), returns: e => parseFloat(e.stats.returns), experience: e => e.experience, winrate: e => parseFloat(e.stats.winRate) };
  experts = experts.sort((a, b) => (sortKey[icActiveSort]?.(b) || 0) - (sortKey[icActiveSort]?.(a) || 0));

  document.getElementById('icCount').textContent = `${experts.length} advisor${experts.length !== 1 ? 's' : ''}`;

  if (!experts.length) {
    grid.innerHTML = `<div class="ic-empty"><div class="ic-empty-icon">🔍</div><div class="ic-empty-text">No advisors match your search.</div></div>`;
    return;
  }

  grid.innerHTML = experts.map((e, i) => icCardHTML(e, i)).join('');
}

function icCardHTML(e, i) {
  const isConnected = icConnected[e.id];
  const certBadges  = e.certifications.map(c => `<span class="ic-cert-badge ${c.cls}">${c.label}</span>`).join('');
  const specTags    = e.specializations.slice(0, 3).map(s => `<span class="ic-tag">${s}</span>`).join('');
  const post        = e.posts[0];
  const postHtml    = post 
    ? `"${post.text.length > 110 ? post.text.slice(0, 110) + '…' : post.text}"<div class="ic-card-post-time">${post.time}</div>`
    : `<i>No recent market insights.</i>`;

  return `
  <div class="ic-card" style="--card-color:${e.color}; animation-delay:${i * 0.05}s;" onclick="icOpenProfile(${e.id})">
    <div class="ic-card-top">
      <div class="ic-avatar" style="background:${e.color}">
        ${e.initials}
        ${e.verified ? `<span class="ic-verified-badge" title="SEBI Verified">✅</span>` : ''}
      </div>
      <div class="ic-card-info">
        <div class="ic-card-name">${e.name}</div>
        <div class="ic-card-title">${e.title}</div>
        <div class="ic-card-firm">${e.firm}</div>
        <div class="ic-card-location">${e.location} · ${e.experience}y exp</div>
      </div>
    </div>

    <div class="ic-card-post">
      ${postHtml}
    </div>

    <div class="ic-card-tags">${specTags}</div>

    <div class="ic-card-stats">
      <div class="ic-stat"><span class="ic-stat-val green">${e.stats.returns}</span><span class="ic-stat-label">Returns</span></div>
      <div class="ic-stat"><span class="ic-stat-val gold">${e.stats.winRate}</span><span class="ic-stat-label">Win Rate</span></div>
      <div class="ic-stat"><span class="ic-stat-val">${e.stats.followers}</span><span class="ic-stat-label">Followers</span></div>
      <div class="ic-stat"><span class="ic-stat-val">${e.stats.recommendations}</span><span class="ic-stat-label">Calls</span></div>
    </div>

    <div class="ic-card-certs">${certBadges}</div>

    <div class="ic-card-actions" onclick="event.stopPropagation()">
      <button class="ic-btn-connect ${isConnected ? 'connected' : ''}" onclick="icToggleConnect(${e.id}, this)">
        ${isConnected ? '✓ Connected' : '+ Connect'}
      </button>
      <button class="ic-btn-profile" onclick="icOpenProfile(${e.id})">View Profile</button>
    </div>
  </div>`;
}

function icToggleConnect(id, btn) {
  icConnected[id] = !icConnected[id];
  btn.classList.toggle('connected', icConnected[id]);
  btn.textContent = icConnected[id] ? '✓ Connected' : '+ Connect';

  // Show toast
  const expert = IC_EXPERTS.find(e => e.id === id);
  const msg = icConnected[id] ? `🤝 Connected with ${expert.name}!` : `Disconnected from ${expert.name}`;
  icShowToast(msg);
}

// ── Community Feed ────────────────────────────────────────
function icRenderFeed() {
  const feed = document.getElementById('icFeed');
  if (!feed) return;
    feed.innerHTML = IC_FEED_POSTS.map(p => {
    return `
    <div class="ic-feed-post">
      <div class="ic-feed-top">
        <div class="ic-feed-avatar" style="background:linear-gradient(135deg, #7c8cf8, #38bdf8)">${(p.author || 'A')[0]}</div>
        <div>
          <div class="ic-feed-name">${p.author}</div>
          <div style="font-size:0.6rem;color:#4e5a6e;">${p.role}</div>
        </div>
        <div class="ic-feed-time">${p.time}</div>
      </div>
      <div class="ic-feed-text">${p.text}</div>
      <div class="ic-feed-actions">
        <button class="ic-feed-action" onclick="icLikePost(this, ${p.id})">
          ❤️ <span class="like-count">${p.likes}</span>
        </button>
        <button class="ic-feed-action">💬 ${p.comments}</button>
        <button class="ic-feed-action">🔁 Share</button>
      </div>
    </div>`;
  }).join('');
}

function icLikePost(btn, idx) {
  if (btn.classList.contains('liked')) {
    btn.classList.remove('liked');
    IC_FEED_POSTS[idx].likes--;
  } else {
    btn.classList.add('liked');
    IC_FEED_POSTS[idx].likes++;
  }
  btn.querySelector('.like-count').textContent = IC_FEED_POSTS[idx].likes;
}

// ── Post composer ─────────────────────────────────────────
window.icAddTag = function(tag) {
  const ta = document.getElementById('icComposeText');
  if (ta) ta.value = (ta.value + ' ' + tag).trim();
  ta?.focus();
};

window.icPostInsight = async function() {
  const ta = document.getElementById('icComposeText');
  const text = ta?.value?.trim();
  if (!text) { icShowToast('✏️ Write something first!'); return; }

  try {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const authorName = profile.name || 'You';
    const authorRole = profile.user_type === 'trader' ? 'Trader' : 'Investor';

    const res = await fetch('/api/ic/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author_name: authorName,
        author_role: authorRole,
        content: text,
        category: 'Community Update'
      })
    });

    if (res.ok) {
      ta.value = '';
      icShowToast('✅ Your insight was posted!');
      icFetchData(); // Refresh feed
    } else {
      icShowToast('❌ Failed to post insight');
    }
  } catch (err) {
    console.error('Post error:', err);
    icShowToast('❌ Error connecting to server');
  }
};

// ── Profile Modal ─────────────────────────────────────────
window.icOpenProfile = function(id) {
  const e = IC_EXPERTS.find(x => x.id === id);
  if (!e) return;

  const overlay = document.getElementById('icProfileOverlay');
  const modal   = document.getElementById('icProfileModal');
  const isConn  = icConnected[id];

  modal.innerHTML = `
    <div class="ic-pm-header">
      <button class="ic-pm-close" onclick="icCloseProfile()">✕</button>
      <div class="ic-pm-top">
        <div class="ic-pm-avatar" style="background:${e.color}; font-size:1.8rem; width:64px; height:64px; border-radius:18px; display:flex; align-items:center; justify-content:center;">${e.initials}</div>
        <div style="flex:1">
          <div class="ic-pm-name">${e.name} ${e.verified ? '<span style="font-size:0.8rem;">✅</span>' : ''}</div>
          <div class="ic-pm-title">${e.title}</div>
          <div class="ic-pm-firm">${e.firm}</div>
          <div class="ic-pm-location">${e.location} · ${e.experience} years experience</div>
        </div>
      </div>
      <div class="ic-pm-actions">
        <button class="ic-btn-connect ${isConn ? 'connected' : ''}" id="pm-connect-btn" onclick="icToggleConnect(${e.id}, this); document.getElementById('pm-connect-btn').textContent = icConnected[${e.id}] ? '✓ Connected' : '+ Connect'">
          ${isConn ? '✓ Connected' : '+ Connect'}
        </button>
        <button class="ic-btn-profile" onclick="icShowToast('📩 Message feature coming soon!')">💬 Message</button>
        <button class="ic-btn-profile" onclick="icShowToast('📩 Follow feature coming soon!')">👁️ Follow</button>
      </div>
    </div>

    <div class="ic-pm-stats">
      <div class="ic-pm-stat"><div class="ic-pm-stat-val green">${e.stats.returns}</div><div class="ic-pm-stat-label">Annualised Returns</div></div>
      <div class="ic-pm-stat"><div class="ic-pm-stat-val" style="color:#f0c040">${e.stats.winRate}</div><div class="ic-pm-stat-label">Win Rate</div></div>
      <div class="ic-pm-stat"><div class="ic-pm-stat-val">${e.stats.followers}</div><div class="ic-pm-stat-label">Followers</div></div>
      <div class="ic-pm-stat"><div class="ic-pm-stat-val">${e.stats.recommendations}</div><div class="ic-pm-stat-label">Market Calls</div></div>
    </div>

    <div class="ic-pm-body">
      <div>
        <div class="ic-pm-section-title">About</div>
        <div class="ic-pm-bio">${e.bio}</div>
      </div>

      <div>
        <div class="ic-pm-section-title">Specializations</div>
        <div class="ic-pm-specializations">
          ${e.specializations.map(s => `<span class="ic-pm-spec">${s}</span>`).join('')}
        </div>
      </div>

      <div>
        <div class="ic-pm-section-title">Certifications & Credentials</div>
        <div class="ic-pm-certs">
          ${e.certifications.map(c => `<span class="ic-pm-cert ${c.cls}">${c.label}</span>`).join('')}
        </div>
      </div>

      ${e.sebiReg ? `
      <div>
        <div class="ic-pm-section-title">Regulatory</div>
        <div class="ic-pm-sebi-reg">🛡️ SEBI Registered Investment Advisor &nbsp;·&nbsp; Reg No: <strong>${e.sebiReg}</strong></div>
      </div>` : ''}

      <div>
        <div class="ic-pm-section-title">Recent Market Insights</div>
        <div class="ic-pm-recent-posts">
          ${e.posts.map(p => `
            <div class="ic-pm-post">
              ${p.text}
              <div class="ic-pm-post-time">${p.time}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;

  overlay.style.display = 'flex';
};

window.icCloseProfile = function() {
  const overlay = document.getElementById('icProfileOverlay');
  if (overlay) overlay.style.display = 'none';
};

// ── Toast ─────────────────────────────────────────────────
function icShowToast(msg) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
    background:rgba(22,27,42,0.97);border:1px solid rgba(124,140,248,0.3);
    color:#c9d1d9;font-size:0.75rem;font-weight:600;padding:0.55rem 1.2rem;
    border-radius:20px;z-index:99999;pointer-events:none;
    animation:ic-fadeIn 0.2s ease;backdrop-filter:blur(10px);
    box-shadow:0 8px 24px rgba(0,0,0,0.4);white-space:nowrap;font-family:inherit;`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

// InvestCircle is initialized via switchView in app.js
