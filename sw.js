/**
 * Baykuş Hukuk — Service Worker
 * GitHub Pages uyumlu: relative path kullanır
 */
const CACHE_NAME = 'baykus-hukuk-v3';

// GitHub Pages'de repo adı path prefix olarak gelir
// self.location.pathname ile otomatik tespit ediyoruz
const BASE = self.location.pathname.replace('/sw.js', '');

const STATIC_ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/css/style.css',
  BASE + '/css/admin.css',
  BASE + '/js/data.js',
  BASE + '/js/main.js',
  BASE + '/js/supabase.js',
  BASE + '/makaleler.html',
  BASE + '/hizmetler.html',
  BASE + '/hakkimizda.html',
  BASE + '/avukatlar.html',
  BASE + '/randevu.html',
  BASE + '/iletisim.html',
  BASE + '/linkler.html',
  BASE + '/gundem.html',
  BASE + '/gizlilik.html',
  BASE + '/makale.html',
  BASE + '/makaleler.html',
  BASE + '/404.html',
];

// Kurulum
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS.map(u => new Request(u, { cache: 'reload' }))))
      .catch(err => console.warn('Cache hatası (bazı dosyalar atlandı):', err))
  );
  self.skipWaiting();
});

// Aktivasyon — eski cache'leri temizle
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — önce cache, yoksa network
self.addEventListener('fetch', e => {
  // POST, chrome-extension vb. atla
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;
  // Admin paneli cache'lenmesin (güvenlik)
  if (e.request.url.includes('/_yonetim9k/')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Sadece başarılı HTML/CSS/JS yanıtlarını cache'le
        if (res.ok && ['text/html','text/css','application/javascript'].some(t =>
          res.headers.get('content-type')?.includes(t)
        )) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, resClone));
        }
        return res;
      }).catch(() => caches.match(BASE + '/404.html'));
    })
  );
});
