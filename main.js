/**
 * BAYKUŞ HUKUK — Ana Site JavaScript v4
 * Düzeltmeler:
 * - escapeHtml global tanımlandı (makale.html dahil her sayfada çalışır)
 * - notify() success/error tipi desteği eklendi
 * - Form validasyonu gerçek zamanlı görsel geri bildirimli
 * - FormGuard rate limiting güçlendirildi
 * - sidebar-link-item CSS sınıfı ile uyumlu
 * - footer yılı güvenli şekilde güncelleniyor
 * - İletişim formu alanları için erişilebilir hata mesajları
 */

'use strict';

// ═══════════════════════════════════════════
// YARDIMCI FONKSİYONLAR (global scope)
// ═══════════════════════════════════════════

// escapeHtml — data.js'te tanımlıdır; yoksa fallback
if (typeof escapeHtml === 'undefined') {
  window.escapeHtml = function(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
}

// notify() — data.js'te tanımlıdır

// formatDate() — data.js'te tanımlıdır

// ═══════════════════════════════════════════
// AKTİF NAV
// ═══════════════════════════════════════════
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    const href = a.getAttribute('href') || '';
    if (href === page || href.endsWith('/' + page)) {
      a.classList.add('active');
    }
  });
  // index.html özel durum
  if (page === '' || page === 'index.html') {
    const homeLink = document.querySelector('.nav-links a[href="index.html"]');
    if (homeLink) homeLink.classList.add('active');
  }
}

// ═══════════════════════════════════════════
// HAMBURGER MENÜ
// ═══════════════════════════════════════════
function initHamburger() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  // Zaten eklenmişse tekrar ekleme
  if (nav.querySelector('.hamburger')) return;

  const btn = document.createElement('button');
  btn.className = 'hamburger';
  btn.setAttribute('aria-label', 'Menüyü aç/kapat');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'nav-links');
  btn.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(btn);

  const links = nav.querySelector('.nav-links');
  if (links) links.id = 'nav-links';

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }));
}

// ═══════════════════════════════════════════
// ADMIN BUTONU — admin değilse gizle
// ═══════════════════════════════════════════
function handleAdminLink() {
  let loggedIn = false;
  try {
    loggedIn = (typeof SBAuth !== 'undefined') && SBAuth.hasSession();
  } catch { /* ignore */ }
  if (!loggedIn) {
    document.querySelectorAll('.nav-links a[href*="_yonetim9k"]').forEach(a => {
      a.style.display = 'none';
    });
  }
}

// ═══════════════════════════════════════════
// KVKK BANNER
// ═══════════════════════════════════════════
function initKvkk() {
  if (localStorage.getItem('bh_kvkk_accepted')) return;
  const banner = document.createElement('div');
  banner.className = 'kvkk-banner';
  banner.id = 'kvkk-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Çerez bildirimi');
  banner.innerHTML = `
    <div style="flex:1;min-width:200px">
      🍪 Bu site deneyiminizi iyileştirmek için yerel depolama kullanmaktadır.
      <a href="gizlilik.html" style="color:var(--gold)">Gizlilik Politikamızı</a>
      inceleyebilirsiniz.
    </div>
    <button class="kvkk-btn" onclick="acceptKvkk()">Kabul Et</button>
  `;
  document.body.appendChild(banner);
}

function acceptKvkk() {
  localStorage.setItem('bh_kvkk_accepted', '1');
  const b = document.getElementById('kvkk-banner');
  if (b) {
    b.style.transition = 'transform .3s';
    b.style.transform = 'translateY(110%)';
    setTimeout(() => b.remove(), 350);
  }
}

// ═══════════════════════════════════════════
// SCROLL TO TOP
// ═══════════════════════════════════════════
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
}

// ═══════════════════════════════════════════
// WHATSAPP
// ═══════════════════════════════════════════
function initWhatsApp() {
  const btn = document.querySelector('.whatsapp-btn');
  if (!btn) return;
  try {
    const s = getSettings();
    const raw = s.whatsapp || s.phone || '';
    const phone = raw.replace(/[^0-9]/g, '');
    btn.href = `https://wa.me/${phone}?text=${encodeURIComponent('Merhaba, hukuki danışmanlık hakkında bilgi almak istiyorum.')}`;
  } catch { /* getSettings yoksa ignore */ }
}

// ═══════════════════════════════════════════
// GLOBAL ARAMA
// ═══════════════════════════════════════════
function openSearch() {
  const o = document.getElementById('search-overlay');
  if (o) {
    o.classList.add('open');
    o.setAttribute('aria-hidden', 'false');
    setTimeout(() => document.getElementById('global-search-input')?.focus(), 60);
  }
}

function closeSearch() {
  const o = document.getElementById('search-overlay');
  if (o) {
    o.classList.remove('open');
    o.setAttribute('aria-hidden', 'true');
  }
}

function runGlobalSearch(query) {
  const el = document.getElementById('global-search-results');
  if (!el) return;
  if (!query || query.length < 2) {
    el.innerHTML = '<div class="search-empty">Aramak istediğiniz konuyu yazın...</div>';
    return;
  }
  const q = query.toLowerCase();
  const isAdmin = window.location.pathname.includes('_yonetim9k');
  const base = isAdmin ? '../' : '';
  let results = [];
  try {
    results = getArticles().filter(a => a.published && (
      a.title.toLowerCase().includes(q) ||
      a.cat.toLowerCase().includes(q) ||
      (a.excerpt || '').toLowerCase().includes(q)
    )).slice(0, 8);
  } catch { /* getArticles yoksa */ }

  el.innerHTML = results.length
    ? results.map(a => `
        <a href="${base}makale.html?slug=${encodeURIComponent(a.slug)}" class="search-result-item" onclick="closeSearch()">
          <span class="sri-icon">${escapeHtml(a.emoji || '📋')}</span>
          <div>
            <div class="sri-body-title">${escapeHtml(a.title)}</div>
            <div class="sri-body-cat">📂 ${escapeHtml(a.cat)} · 📅 ${escapeHtml(a.date)}</div>
          </div>
        </a>`).join('')
    : `<div class="search-empty">🔍 "${escapeHtml(query)}" için sonuç bulunamadı.</div>`;
}

// Klavye kısayolları
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSearch();
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
});

// Overlay dışı tıklama
document.addEventListener('click', e => {
  const o = document.getElementById('search-overlay');
  if (o && e.target === o) closeSearch();
});

// ═══════════════════════════════════════════
// SİDEBAR
// ═══════════════════════════════════════════
function renderSidebarRecent() {
  const el = document.getElementById('sidebar-recent');
  if (!el) return;
  let articles = [];
  try { articles = getArticles().filter(a => a.published).slice(0, 5); } catch {}
  el.innerHTML = articles.length
    ? articles.map(a => `
        <a href="makale.html?slug=${encodeURIComponent(a.slug)}" class="sidebar-recent-item">
          <div class="sri-dot"></div>
          <div>
            <div class="sri-title">${escapeHtml(a.title)}</div>
            <div class="sri-meta">${escapeHtml(a.date)}</div>
          </div>
        </a>`).join('')
    : '<p style="font-size:.82rem;color:var(--muted)">Henüz makale yok.</p>';
}

function renderSidebarCats() {
  const el = document.getElementById('sidebar-cats');
  if (!el) return;
  const cats = {};
  try { getArticles().filter(a => a.published).forEach(a => { cats[a.cat] = (cats[a.cat] || 0) + 1; }); } catch {}
  el.innerHTML = Object.entries(cats).length
    ? Object.entries(cats).map(([cat, n]) =>
        `<a href="makaleler.html?cat=${encodeURIComponent(cat)}" class="sidebar-tag">${escapeHtml(cat)} (${n})</a>`
      ).join('')
    : '<p style="font-size:.82rem;color:var(--muted)">Henüz kategori yok.</p>';
}

function renderSidebarLinks() {
  const el = document.getElementById('sidebar-links');
  if (!el) return;
  let links = [];
  try { links = getLinks().slice(0, 5); } catch {}
  el.innerHTML = links.length
    ? links.map(l => `
        <a href="${encodeURI(l.url)}" target="_blank" rel="noopener noreferrer" class="sidebar-link-item">
          <span class="sli-icon">${escapeHtml(l.icon)}</span>
          <span class="sli-name">${escapeHtml(l.name)}</span>
          <span style="color:var(--gold);font-size:.7rem">↗</span>
        </a>`).join('')
    : '<p style="font-size:.82rem;color:var(--muted)">Link bulunamadı.</p>';
}

// ═══════════════════════════════════════════
// SİTE AYARLARI
// ═══════════════════════════════════════════
function applySiteSettings() {
  let s = {};
  try { s = getSettings(); } catch { return; }

  const HTML_ALLOWED = new Set(['heroText', 'heroDesc', 'footerDesc']);
  document.querySelectorAll('[data-setting]').forEach(el => {
    const key = el.dataset.setting;
    if (!s[key]) return;
    if (el.tagName === 'INPUT') {
      el.value = s[key];
    } else if (HTML_ALLOWED.has(key)) {
      el.innerHTML = s[key];
    } else {
      el.textContent = s[key];
    }
  });

  if (s.phone) {
    const cleanPhone = s.phone.replace(/\s/g, '');
    document.querySelectorAll('a[href^="tel:"]').forEach(a => { a.href = 'tel:' + cleanPhone; });
    // Topbar dynamic phone
    const tbp = document.getElementById('tb-phone-wrap');
    if (tbp && s.phone) tbp.innerHTML = `<span>📞 <a href="tel:${cleanPhone}">${s.phone}</a></span>`;
    // Footer phone display
    const fp = document.getElementById('footer-phone-display');
    if (fp && s.phone) fp.textContent = '📞 ' + s.phone;
    // Sidebar phone display
    const sp = document.getElementById('sidebar-phone-display');
    if (sp && s.phone) sp.innerHTML = `📞 <a href="tel:${cleanPhone}" style="color:var(--navy);text-decoration:none">${s.phone}</a>`;
  }
  if (s.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => { a.href = 'mailto:' + s.email; });
    // Topbar dynamic email
    const tbe = document.getElementById('tb-email-wrap');
    if (tbe && s.email) tbe.innerHTML = `<span>✉ <a href="mailto:${s.email}">${s.email}</a></span>`;
    // Footer email display
    const fe = document.getElementById('footer-email-display');
    if (fe && s.email) fe.textContent = '✉ ' + s.email;
    // Sidebar email display
    const se = document.getElementById('sidebar-email-display');
    if (se && s.email) se.innerHTML = `✉ <a href="mailto:${s.email}" style="color:var(--navy);text-decoration:none">${s.email}</a>`;
  }
  if (s.address) {
    const fa = document.getElementById('footer-address-display');
    if (fa) fa.textContent = '📍 ' + s.address.split('\n')[0];
  }
  // WhatsApp — s.whatsapp öncelikli, yoksa s.phone
  const wa = document.querySelector('a.whatsapp-btn');
  if (wa && (s.whatsapp || s.phone)) {
    const raw = s.whatsapp || s.phone || '';
    const phone = raw.replace(/[^0-9]/g, '');
    if (phone) wa.href = `https://wa.me/${phone}?text=${encodeURIComponent('Merhaba, hukuki danışmanlık hakkında bilgi almak istiyorum.')}`;
  }
  // WhatsApp float button (index.html)
  const waFloat = document.getElementById('whatsapp-float-btn');
  if (waFloat && (s.whatsapp || s.phone)) {
    const raw = s.whatsapp || s.phone || '';
    const phone = raw.replace(/[^0-9]/g, '');
    if (phone) waFloat.href = `https://wa.me/${phone}?text=${encodeURIComponent('Merhaba, hukuki danışmanlık hakkında bilgi almak istiyorum.')}`;
  }
  // Map URL (iletisim.html)
  const mapFrame = document.getElementById('map-frame');
  if (mapFrame && s.mapUrl) mapFrame.src = s.mapUrl;
  // OWM API key
  if (s.owmApiKey) window.OWM_KEY = s.owmApiKey;
  // Sosyal medya linkleri
  renderSocialLinks(s);
  // Tawk.to canlı sohbet
  if (s.tawkPropertyId && !window.Tawk_API) {
    window.Tawk_API = {}; window.Tawk_LoadStart = new Date();
    const ts = document.createElement('script');
    ts.async = true;
    ts.src = 'https://embed.tawk.to/' + s.tawkPropertyId + '/default';
    ts.charset = 'UTF-8';
    ts.crossOrigin = '*';
    document.body.appendChild(ts);
  }
}

// Sosyal medya ikonlarını footer'a ekle
function renderSocialLinks(s) {
  const containers = document.querySelectorAll('.footer-social-links');
  if (!containers.length) return;
  const links = [];
  if (s.socialLinkedIn)  links.push({ url: s.socialLinkedIn,  icon: '🔗', label: 'LinkedIn'   });
  if (s.socialTwitter)   links.push({ url: s.socialTwitter,   icon: '𝕏',  label: 'Twitter/X'  });
  if (s.socialInstagram) links.push({ url: s.socialInstagram, icon: '📷', label: 'Instagram'  });
  if (s.socialYoutube)   links.push({ url: s.socialYoutube,   icon: '▶',  label: 'YouTube'    });
  const html = links.map(l =>
    `<a href="${encodeURI(l.url)}" target="_blank" rel="noopener noreferrer"
        style="display:inline-flex;align-items:center;gap:.3rem;color:rgba(255,255,255,.6);text-decoration:none;font-size:.82rem;transition:color .15s"
        aria-label="${escapeHtml(l.label)}">${l.icon} ${l.label}</a>`
  ).join('');
  containers.forEach(c => { c.innerHTML = html; });
}

// ═══════════════════════════════════════════
// OKUMA SÜRESİ & PAYLAŞIM
// ═══════════════════════════════════════════
function calcReadingTime(content) {
  const words = content.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function renderShareBar(title, url) {
  const eu = encodeURIComponent(url || window.location.href);
  const et = encodeURIComponent(title || document.title);
  return `
    <div class="share-bar" aria-label="Makaleyi paylaş">
      <span style="font-size:.8rem;color:var(--muted);font-weight:600">Paylaş:</span>
      <a class="share-btn whatsapp" href="https://wa.me/?text=${et}%20${eu}" target="_blank" rel="noopener" aria-label="WhatsApp ile paylaş">💬 WhatsApp</a>
      <a class="share-btn twitter"  href="https://twitter.com/intent/tweet?text=${et}&url=${eu}" target="_blank" rel="noopener" aria-label="Twitter'da paylaş">𝕏 Twitter</a>
      <a class="share-btn linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${eu}" target="_blank" rel="noopener" aria-label="LinkedIn'de paylaş">in LinkedIn</a>
      <button class="share-btn copy" onclick="copyPageLink()" aria-label="Linki kopyala">🔗 Kopyala</button>
    </div>`;
}

function copyPageLink() {
  const url = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => notify('Link kopyalandı ✓', 'success'))
      .catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    notify('Link kopyalandı ✓', 'success');
  } catch { notify('Kopyalama başarısız.', 'error'); }
}

// ═══════════════════════════════════════════
// FOOTER YILI
// ═══════════════════════════════════════════
function updateFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

// ═══════════════════════════════════════════
// TICKER INIT
// ═══════════════════════════════════════════
function initTicker() {
  let ticker = { active: false, text: '' };
  try { ticker = getTicker(); } catch { return; }
  const el = document.getElementById('site-ticker');
  if (!el) return;
  if (!ticker.active || !ticker.text) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  const track = document.getElementById('ticker-track');
  if (!track) return;
  // Aynı içerik varsa tekrar render etme
  const newText = ticker.text;
  if (track.dataset.tickerText === newText && track.children.length > 0) return;
  track.dataset.tickerText = newText;
  const items = newText.split('|').map(t => t.trim()).filter(Boolean);
  if (!items.length) { el.style.display = 'none'; return; }
  const doubled = [...items, ...items];
  track.innerHTML = doubled.map(t => `<span class="ticker-item">${escapeHtml(t)}</span>`).join('');
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  updateFooterYear();
  setActiveNav();
  applySiteSettings();
  initTicker();
  renderSidebarRecent();
  renderSidebarCats();
  renderSidebarLinks();
  initHamburger();
  handleAdminLink();
  initKvkk();
  initScrollTop();
  initWhatsApp();
});

// ── Supabase veri yüklendi → UI yenile ──────────────────────────────
document.addEventListener('sb:loaded', () => {
  // Ayarlar güncellendi — header/footer/ticker yenile
  applySiteSettings();
  initTicker();
  // Sidebar içerikleri güncelle (makaleler/linkler SB'den geldi)
  if (typeof renderSidebarRecent === 'function') renderSidebarRecent();
  if (typeof renderSidebarCats   === 'function') renderSidebarCats();
  if (typeof renderSidebarLinks  === 'function') renderSidebarLinks();
});
