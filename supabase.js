/**
 * ⚠️  KURULUM ADIMI — BU SATIRI DOLDURUN
 * ════════════════════════════════════════════════════════
 * 1. Supabase.com'da proje oluşturun (Frankfurt bölgesi)
 * 2. Project Settings → API'dan değerleri kopyalayın:
 *
 *   SUPABASE_URL  → "Project URL" alanı
 *   SUPABASE_ANON → "anon / public" key
 *
 * 3. Authentication → Users'dan KENDİNİZE bir admin hesabı oluşturun
 *    (e-posta + şifre). service_role key'e GEREK YOKTUR ve bu dosyada
 *    asla kullanılmaz — service_role anahtarı tarayıcıya konursa tüm
 *    veritabanınız (RLS dahil) korumasız hale gelir.
 * 4. Supabase SQL Editor'de RLS politikalarınızı kurun (proje ile birlikte
 *    verilen rls-policies.sql dosyasını çalıştırın).
 * ════════════════════════════════════════════════════════
 */

/**
 * BAYKUŞ HUKUK — Supabase İstemci Kütüphanesi
 * Dosya: js/supabase.js
 *
 * GÜVENLİK MİMARİSİ (v23):
 * Yazma işlemleri (admin panel) artık gerçek Supabase Auth oturumu ile
 * yetkilendirilir. Admin "şifre" değil, Supabase'de oluşturulmuş bir
 * e-posta/şifre hesabıyla giriş yapar; sunucu (Supabase) bu girişe karşılık
 * kısa ömürlü bir JWT (access_token) verir. Bu token sadece o oturuma aittir,
 * ve veritabanı erişimi RLS politikalarıyla "authenticated" rolüne
 * sınırlandırılır. Hiçbir zaman service_role anahtarı tarayıcıya gönderilmez.
 *
 * Tüm HTML dosyalarında data.js'ten ÖNCE yükleyin:
 *   <script src="js/supabase.js"></script>
 *   <script src="js/data.js"></script>
 *   <script src="js/main.js"></script>
 */

'use strict';

// ═══════════════════════════════════════════════════════
// SUPABASE YAPILANDIRMA
// Supabase Dashboard > Project Settings > API'den alın
// ═══════════════════════════════════════════════════════
const SUPABASE_URL  = 'https://SIZIN_PROJE_ID.supabase.co';
const SUPABASE_ANON = 'SIZIN_ANON_PUBLIC_KEY';   // Public key (güvenli — tarayıcıda olması normaldir)
// NOT: service_role anahtarı BURADA YA DA BAŞKA HİÇBİR İSTEMCİ DOSYASINDA
// KULLANILMAZ. Yazma yetkisi, aşağıdaki SBAuth oturum token'ı + Supabase
// RLS politikaları üzerinden sağlanır.

// ═══════════════════════════════════════════════════════
// SBAuth — Gerçek Supabase Auth oturum yönetimi
// service_role anahtarının yerini alır: admin, e-posta+şifre ile
// Supabase'de oturum açar, dönen kısa ömürlü JWT (access_token) ile
// yazma istekleri yapılır. Yetki, Supabase RLS politikalarınca
// "authenticated" rolüne göre sunucu tarafında uygulanır.
// ═══════════════════════════════════════════════════════
const SBAuth = {
  STORAGE_KEY: 'bh_sb_session',

  _save(session) {
    // session: { access_token, refresh_token, expires_at (epoch sec), user: {email} }
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session)); } catch {}
  },

  _read() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  clear() {
    try { localStorage.removeItem(this.STORAGE_KEY); } catch {}
  },

  // Senkron, hızlı kontrol: bir oturum kaydı var mı (network'e gitmez).
  // Gerçek geçerlilik kontrolü ve gerekirse yenileme getAccessToken() içindedir.
  hasSession() {
    const s = this._read();
    return !!(s && s.refresh_token);
  },

  getUserEmail() {
    const s = this._read();
    return s && s.user ? s.user.email : '';
  },

  // E-posta + şifre ile Supabase Auth üzerinden giriş yapar.
  async login(email, password) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.access_token) {
        return { success: false, error: data.error_description || 'E-posta veya şifre hatalı.' };
      }
      this._save({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
        user: { email: data.user?.email || email }
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Sunucuya bağlanılamadı.' };
    }
  },

  // Geçerli access_token'ı döner; süresi dolmuşsa refresh_token ile otomatik yeniler.
  async getAccessToken() {
    const s = this._read();
    if (!s || !s.refresh_token) return null;

    const now = Math.floor(Date.now() / 1000);
    if (s.access_token && s.expires_at && s.expires_at - now > 30) {
      return s.access_token; // hâlâ geçerli (30s pay)
    }

    // Süresi dolmuş / dolmak üzere → yenile
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: s.refresh_token })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.access_token) {
        this.clear();
        return null;
      }
      this._save({
        access_token: data.access_token,
        refresh_token: data.refresh_token || s.refresh_token,
        expires_at: now + (data.expires_in || 3600),
        user: s.user
      });
      return data.access_token;
    } catch {
      return null; // ağ hatası — bu istek için yetkisiz kal, kullanıcı tekrar dener
    }
  },

  // Mevcut şifreyi doğrulamak için yeniden giriş dener (panel.html'de şifre değişiminde kullanılır)
  async verifyCurrentPassword(password) {
    const email = this.getUserEmail();
    if (!email) return false;
    const r = await this.login(email, password); // başarılıysa oturumu da tazeler
    return r.success;
  },

  // Yeni şifreyi Supabase Auth üzerinde günceller (PUT /auth/v1/user)
  async updatePassword(newPassword) {
    const token = await this.getAccessToken();
    if (!token) return { success: false, error: 'Oturum bulunamadı, tekrar giriş yapın.' };
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, error: data.error_description || data.msg || 'Şifre güncellenemedi.' };
      return { success: true };
    } catch {
      return { success: false, error: 'Sunucuya bağlanılamadı.' };
    }
  },

  async logout() {
    const token = await this.getAccessToken();
    if (token) {
      fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + token }
      }).catch(() => {});
    }
    this.clear();
  }
};
window.SBAuth = SBAuth;

// ═══════════════════════════════════════════════════════
// Auth — panel.html / giris.html'in kullandığı dar arayüz
// (Eski localStorage-şifre tabanlı Auth'un yerini alır.)
// ═══════════════════════════════════════════════════════
const Auth = {
  // Senkron hızlı kontrol — sayfa render'ını bloklamaz.
  // Gerçek yetki her API isteğinde sbRequest() içinde token yenilenerek doğrulanır.
  isLoggedIn() {
    return SBAuth.hasSession();
  },
  async login(email, password) {
    return SBAuth.login(email, password);
  },
  async logout() {
    await SBAuth.logout();
    window.location.href = '../_yonetim9k/giris.html';
  },
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '../_yonetim9k/giris.html';
      return false;
    }
    return true;
  }
};
window.Auth = Auth;


/**
 * Supabase REST API'ye istek atar.
 * @param {string} table - Tablo adı
 * @param {object} options - { method, body, select, filter, single, serviceRole }
 */
async function sbRequest(table, options = {}) {
  const {
    method = 'GET',
    body = null,
    select = '*',
    filter = '',
    single = false,
    serviceRole = false,
    returning = 'representation',
    upsert = false
  } = options;

  // Yazma/yönetim istekleri (serviceRole:true) için admin OTURUM TOKEN'I kullanılır
  // (Supabase Auth ile alınmış kısa ömürlü JWT). Asla sabit bir "god-mode" anahtar
  // kullanılmaz — yetki sunucu tarafında RLS politikalarıyla denetlenir.
  // Token yoksa/oturum kapalıysa anon key ile devam edilir; RLS bu isteği
  // zaten reddedecektir (beklenen ve güvenli davranış).
  let authToken = SUPABASE_ANON;
  if (serviceRole && typeof SBAuth !== 'undefined') {
    const sessionToken = await SBAuth.getAccessToken();
    if (sessionToken) authToken = sessionToken;
  }
  const headers = {
    'apikey': SUPABASE_ANON,
    'Authorization': 'Bearer ' + authToken,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (method === 'POST' || method === 'PATCH') {
    headers['Prefer'] = `return=${returning}`;
  }
  if (upsert) {
    headers['Prefer'] = 'resolution=merge-duplicates,return=representation';
  }
  if (single) {
    headers['Accept'] = 'application/vnd.pgrst.object+json';
  }

  // Tablo adi "table?id=eq.5" gibi inline filter icerebilir
  const qIdx = table.indexOf('?');
  const tableName = qIdx === -1 ? table : table.slice(0, qIdx);
  const inlineFilter = qIdx === -1 ? '' : table.slice(qIdx + 1);

  const params = new URLSearchParams();
  if (inlineFilter) {
    inlineFilter.split('&').forEach(f => {
      const eqIdx = f.indexOf('=');
      if (eqIdx !== -1) params.set(f.slice(0, eqIdx), f.slice(eqIdx + 1));
    });
  }
  if (select && method !== 'DELETE') params.set('select', select);
  if (filter) {
    filter.split('&').forEach(f => {
      const eqIdx = f.indexOf('=');
      if (eqIdx !== -1) {
        const k = f.slice(0, eqIdx);
        const v = f.slice(eqIdx + 1);
        if (k) params.set(k, v);
      }
    });
  }

  const qs = params.toString();
  const baseUrl = `${SUPABASE_URL}/rest/v1/${tableName}`;
  const url = qs ? `${baseUrl}?${qs}` : baseUrl;

  const init = { method, headers };
  if (body) init.body = JSON.stringify(body);

  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`[Supabase] ${tableName} ${method} hatasi:`, err);
      return { data: null, error: err };
    }
    if (res.status === 204) return { data: null, error: null };
    const data = await res.json();
    return { data, error: null };
  } catch (e) {
    console.error('[Supabase] Ag hatasi:', e);
    return { data: null, error: e };
  }
}

function sbOk(result) { return result && !result.error && result.data !== null; }

// ═══════════════════════════════════════════════════════
// MAKALELER
// ═══════════════════════════════════════════════════════
const SB = {

  // ── Tüm yayınlanan makaleleri getir (site geneli)
  async getArticles() {
    const r = await sbRequest('articles', { filter: 'published=eq.true&order=created_at.desc' });
    return sbOk(r) ? r.data : null;
  },

  // ── Slug ile tek makale
  async getArticleBySlug(slug) {
    const r = await sbRequest('articles', {
      filter: `slug=eq.${encodeURIComponent(slug)}&published=eq.true`,
      single: true
    });
    return sbOk(r) ? r.data : null;
  },

  // ── Admin: tüm makaleler (yayınlanmayan dahil)
  async getAllArticles() {
    const r = await sbRequest('articles', {
      filter: 'order=created_at.desc',
      serviceRole: true
    });
    return sbOk(r) ? r.data : [];
  },

  // ── Makale kaydet (yeni)
  async saveArticle(article) {
    const { id, ...data } = article;
    if (id) {
      // Güncelle
      const r = await sbRequest(`articles?id=eq.${id}`, {
        method: 'PATCH', body: data, serviceRole: true
      });
      return sbOk(r);
    } else {
      // Yeni
      const r = await sbRequest('articles', {
        method: 'POST', body: data, serviceRole: true
      });
      return sbOk(r);
    }
  },

  // ── Makale sil
  async deleteArticle(id) {
    const r = await sbRequest(`articles?id=eq.${id}`, {
      method: 'DELETE', serviceRole: true
    });
    return !r.error;
  },

  // ── Görüntülenme sayacı artır (anonim)
  async incrementViews(id) {
    // Supabase RPC ile atomic increment
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_views`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': 'Bearer ' + SUPABASE_ANON,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ article_id: id })
    }).catch(() => {});
  },

  // ═══════════════════════════════════════════════════
  // GÜNDEM
  // ═══════════════════════════════════════════════════
  async getGundem() {
    const r = await sbRequest('gundem', { filter: 'active=eq.true&order=created_at.desc' });
    return sbOk(r) ? r.data : null;
  },

  async saveGundemItem(item) {
    const { id, ...data } = item;
    if (id) {
      return sbOk(await sbRequest(`gundem?id=eq.${id}`, { method: 'PATCH', body: data, serviceRole: true }));
    }
    return sbOk(await sbRequest('gundem', { method: 'POST', body: data, serviceRole: true }));
  },

  async deleteGundemItem(id) {
    return !( await sbRequest(`gundem?id=eq.${id}`, { method: 'DELETE', serviceRole: true }) ).error;
  },

  // ═══════════════════════════════════════════════════
  // HİZMETLER
  // ═══════════════════════════════════════════════════
  async getHizmetler() {
    const r = await sbRequest('hizmetler', { filter: 'active=eq.true&order=sort_order.asc' });
    return sbOk(r) ? r.data : null;
  },

  async saveHizmet(item) {
    const { id, ...data } = item;
    if (id) {
      return sbOk(await sbRequest(`hizmetler?id=eq.${id}`, { method: 'PATCH', body: data, serviceRole: true }));
    }
    return sbOk(await sbRequest('hizmetler', { method: 'POST', body: data, serviceRole: true }));
  },

  async deleteHizmet(id) {
    return !( await sbRequest(`hizmetler?id=eq.${id}`, { method: 'DELETE', serviceRole: true }) ).error;
  },

  // ═══════════════════════════════════════════════════
  // LİNKLER
  // ═══════════════════════════════════════════════════
  async getLinks() {
    const r = await sbRequest('links', { filter: 'active=eq.true&order=sort_order.asc' });
    return sbOk(r) ? r.data : null;
  },

  async saveLink(item) {
    const { id, ...data } = item;
    if (id) {
      return sbOk(await sbRequest(`links?id=eq.${id}`, { method: 'PATCH', body: data, serviceRole: true }));
    }
    return sbOk(await sbRequest('links', { method: 'POST', body: data, serviceRole: true }));
  },

  async deleteLink(id) {
    return !( await sbRequest(`links?id=eq.${id}`, { method: 'DELETE', serviceRole: true }) ).error;
  },

  // ═══════════════════════════════════════════════════
  // AVUKATLAR
  // ═══════════════════════════════════════════════════
  async getLawyers() {
    const r = await sbRequest('lawyers', { filter: 'active=eq.true&order=sort_order.asc' });
    return sbOk(r) ? r.data : null;
  },

  async saveLawyer(item) {
    const { id, ...data } = item;
    if (id) {
      return sbOk(await sbRequest(`lawyers?id=eq.${id}`, { method: 'PATCH', body: data, serviceRole: true }));
    }
    return sbOk(await sbRequest('lawyers', { method: 'POST', body: data, serviceRole: true }));
  },

  async deleteLawyer(id) {
    return !( await sbRequest(`lawyers?id=eq.${id}`, { method: 'DELETE', serviceRole: true }) ).error;
  },

  // ═══════════════════════════════════════════════════
  // REFERANSLAR
  // ═══════════════════════════════════════════════════
  async getTestimonials() {
    const r = await sbRequest('testimonials', { filter: 'active=eq.true&order=created_at.desc' });
    return sbOk(r) ? r.data : null;
  },

  async saveTestimonial(item) {
    const { id, ...data } = item;
    if (id) {
      return sbOk(await sbRequest(`testimonials?id=eq.${id}`, { method: 'PATCH', body: data, serviceRole: true }));
    }
    return sbOk(await sbRequest('testimonials', { method: 'POST', body: data, serviceRole: true }));
  },

  async deleteTestimonial(id) {
    return !( await sbRequest(`testimonials?id=eq.${id}`, { method: 'DELETE', serviceRole: true }) ).error;
  },

  // ═══════════════════════════════════════════════════
  // RANDEVULAR
  // ═══════════════════════════════════════════════════

  // Ziyaretçi randevu oluşturur (anonim, public insert)
  async addAppointment(appt) {
    const body = {
      name:        appt.name,
      phone:       appt.phone,
      email:       appt.email || '',
      category:    appt.category || '',
      lawyer_id:   appt.lawyerId || null,
      lawyer_name: appt.lawyerName || '',
      note:        appt.note || '',
      date:        appt.date,
      time:        appt.time,
      status:      'bekliyor'
    };
    const r = await sbRequest('appointments', { method: 'POST', body });
    return sbOk(r) ? r.data : null;
  },

  // Belirli tarihteki dolu slotları getir (anonim okuma — sadece dar görünüm üzerinden)
  async getTakenSlots(dateStr) {
    const r = await sbRequest('public_taken_slots', {
      select: 'time',
      filter: `date=eq.${dateStr}&status=neq.reddedildi`
    });
    return sbOk(r) ? r.data.map(a => a.time) : [];
  },

  // Admin: tüm randevular
  async getAllAppointments() {
    const r = await sbRequest('appointments', {
      filter: 'order=date.asc,time.asc',
      serviceRole: true
    });
    return sbOk(r) ? r.data : [];
  },

  // Admin: randevu durumu güncelle
  async updateAppointmentStatus(id, status) {
    return sbOk(await sbRequest(`appointments?id=eq.${id}`, {
      method: 'PATCH', body: { status }, serviceRole: true
    }));
  },

  // Admin: randevu sil
  async deleteAppointment(id) {
    return !( await sbRequest(`appointments?id=eq.${id}`, { method: 'DELETE', serviceRole: true }) ).error;
  },

  // ═══════════════════════════════════════════════════
  // İLETİŞİM MESAJLARI
  // ═══════════════════════════════════════════════════

  // Ziyaretçi mesaj gönderir (anonim, public insert)
  async addMessage(msg) {
    const r = await sbRequest('contact_messages', {
      method: 'POST',
      body: {
        name:    msg.name,
        email:   msg.email,
        phone:   msg.phone || '',
        subject: msg.subject || 'İletişim Formu',
        message: msg.message
      }
    });
    return sbOk(r);
  },

  // Admin: tüm mesajlar
  async getAllMessages() {
    const r = await sbRequest('contact_messages', {
      filter: 'order=created_at.desc',
      serviceRole: true
    });
    return sbOk(r) ? r.data : [];
  },

  // Admin: okundu işaretle
  async markMessageRead(id) {
    return sbOk(await sbRequest(`contact_messages?id=eq.${id}`, {
      method: 'PATCH', body: { read: true }, serviceRole: true
    }));
  },

  // Admin: mesaj sil
  async deleteMessage(id) {
    return !( await sbRequest(`contact_messages?id=eq.${id}`, { method: 'DELETE', serviceRole: true }) ).error;
  },

  // ═══════════════════════════════════════════════════
  // BÜLTEN ABONELERİ
  // ═══════════════════════════════════════════════════

  async addSubscriber(email) {
    email = (email || '').trim().toLowerCase();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return { ok: false, msg: 'Geçerli bir e-posta adresi girin.' };

    const r = await sbRequest('subscribers', {
      method: 'POST',
      body: { email, active: true }
    });
    if (r.error && r.error.code === '23505') {
      return { ok: false, msg: 'Bu e-posta zaten kayıtlı.' };
    }
    return sbOk(r)
      ? { ok: true,  msg: 'Bültene başarıyla abone oldunuz! 🎉' }
      : { ok: false, msg: 'Abone olunamadı, lütfen tekrar deneyin.' };
  },

  async getAllSubscribers() {
    const r = await sbRequest('subscribers', {
      filter: 'order=created_at.desc',
      serviceRole: true
    });
    return sbOk(r) ? r.data : [];
  },

  async deleteSubscriber(id) {
    return !( await sbRequest(`subscribers?id=eq.${id}`, { method: 'DELETE', serviceRole: true }) ).error;
  },

  // ═══════════════════════════════════════════════════
  // SİTE AYARLARI
  // ═══════════════════════════════════════════════════

  async getSettings() {
    const r = await sbRequest('site_settings', { filter: 'id=eq.1', single: true });
    return sbOk(r) ? r.data.settings_json : null;
  },

  async saveSettings(settingsObj) {
    const r = await sbRequest('site_settings?id=eq.1', {
      method: 'PATCH',
      body: { settings_json: settingsObj },
      serviceRole: true
    });
    return sbOk(r);
  },

};

// Global erişim
window.SB = SB;

// ═══════════════════════════════════════════════
// GLOBAL YÜKLEME KATMANI
// Public sayfalar için Supabase → localStorage köprüsü.
// Her sayfa açılışında SB'den güncel veri çekilip
// Store'a (localStorage) yazılır; senkron çağrılar
// artık güncel veriyi döner.
// ═══════════════════════════════════════════════
window._sbReady = false;

async function _loadSiteData() {
  if (typeof SB === 'undefined') return;

  try {
    const isAdmin = window.location.pathname.includes('_yonetim9k');

    const fetches = [
      SB.getArticles().then(d => { if (d) Store.set('articles', d); }),
      SB.getGundem().then(d => { if (d) Store.set('gundem', d); }),
      SB.getLinks().then(d => { if (d) Store.set('links', d); }),
      SB.getHizmetler().then(d => { if (d) Store.set('hizmetler', d); }),
      SB.getLawyers().then(d => { if (d) Store.set('lawyers', d); }),
      SB.getTestimonials().then(d => { if (d) Store.set('testimonials', d); }),
      SB.getSettings().then(d => { if (d) Store.set('settings', d); }),
    ];

    if (isAdmin) {
      fetches.push(
        SB.getAllMessages().then(d => { if (d) Store.set('contact_messages', d); }).catch(() => {}),
        SB.getAllAppointments().then(d => { if (d) Store.set('appointments', d); }).catch(() => {}),
        SB.getAllSubscribers().then(d => { if (d) Store.set('subscribers', d); }).catch(() => {})
      );
    }

    await Promise.allSettled(fetches);
  } catch(e) {
    console.warn('[BH] Supabase yüklenemedi, yerel veri kullanılıyor.', e);
  }

  window._sbReady = true;
  document.dispatchEvent(new CustomEvent('sb:loaded'));
}

// Sayfa DOM hazır olunca başlat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _loadSiteData);
} else {
  _loadSiteData();
}

// ── Şifre değiştirme — artık gerçek Supabase Auth üzerinden ──
// Mevcut şifre, o e-postayla yeniden giriş denenerek doğrulanır (SBAuth.verifyCurrentPassword),
// ardından yeni şifre Supabase Auth'a PUT /auth/v1/user ile yazılır (SBAuth.updatePassword).
// Geriye dönük uyumluluk için aynı arayüz adıyla bırakıldı.
const _SB_AUTH = {
  async changePassword(currentPass, newPass) {
    const ok = await SBAuth.verifyCurrentPassword(currentPass);
    if (!ok) return { success: false, error: 'Mevcut şifre hatalı' };
    const result = await SBAuth.updatePassword(newPass);
    if (!result.success) return { success: false, error: result.error || 'Şifre güncellenemedi' };
    return { success: true };
  }
};
