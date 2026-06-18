/**
 * BAYKUŞ HUKUK — Paylaşılan Veri Deposu & Yardımcı Fonksiyonlar
 * Bu dosya tüm sayfalarda ortak kullanılan verileri ve fonksiyonları içerir.
 * Gerçek bir projede bu veriler sunucudan (PHP/Node.js + veritabanı) gelir.
 */

'use strict';

// ═══════════════════════════════════════════════
// ANAHTAR: localStorage ile kalıcı veri saklama
// ═══════════════════════════════════════════════

const Store = {
  get(key, fallback = null) {
    try {
      const item = localStorage.getItem('bh_' + key);
      if (item === null || item === undefined) return fallback;
      return JSON.parse(item);
    } catch { 
      // Bozuk veri - temizle ve fallback dön
      try { localStorage.removeItem('bh_' + key); } catch {}
      return fallback; 
    }
  },
  set(key, value) {
    try { localStorage.setItem('bh_' + key, JSON.stringify(value)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem('bh_' + key); } catch {}
  }
};

// ═══════════════════════════════════════════════
// ÖRNEK VERİLER (ilk yüklemede kullanılır)
// ═══════════════════════════════════════════════

const DEFAULT_ARTICLES = [
  {
    id: 1,
    slug: 'is-kazasi-tazminat-haklari',
    title: 'İş Kazası Geçiren İşçinin Tazminat Hakları',
    cat: 'İş Hukuku',
    excerpt: 'İş kazası geçiren işçilerin yasal hakları, tazminat hesaplama yöntemleri ve dava süreçleri hakkında kapsamlı bir rehber.',
    content: `<p>İş kazası, işçinin iş yerinde veya işin yürütümü sırasında maruz kaldığı kaza olarak tanımlanmaktadır. Türkiye'de iş kazaları; 5510 sayılı Sosyal Sigortalar ve Genel Sağlık Sigortası Kanunu ile 6331 sayılı İş Sağlığı ve Güvenliği Kanunu kapsamında değerlendirilmektedir.</p>
    <h2>İş Kazasında İşverenin Sorumluluğu</h2>
    <p>İşveren, iş yerinde iş sağlığı ve güvenliği tedbirlerini almakla yükümlüdür. Bu yükümlülüğü yerine getirmeyen işveren, işçiye karşı hukuki ve cezai sorumluluk taşır.</p>
    <h3>Tazminat Türleri</h3>
    <ul>
      <li>Maddi tazminat (gelir kaybı, tedavi giderleri)</li>
      <li>Manevi tazminat</li>
      <li>SGK tarafından bağlanan sürekli iş göremezlik geliri</li>
    </ul>
    <blockquote>İş kazası sonucunda açılacak tazminat davalarında zamanaşımı süresi 10 yıldır. Bu nedenle kaza sonrası vakit kaybetmeden hukuki destek almanız önemlidir.</blockquote>
    <h2>Dava Süreci</h2>
    <p>İş kazası nedeniyle açılacak tazminat davalarında iş mahkemeleri yetkilidir. Dava açmadan önce arabuluculuk yoluna başvurmak zorunludur.</p>`,
    author: 'Av. Baykuş Hukuk',
    date: '15 Ocak 2025',
    img: '',
    emoji: '⚖️',
    published: true,
    views: 342
  },
  {
    id: 2,
    slug: 'bosanma-nafaka-velayet',
    title: 'Boşanma Davalarında Nafaka ve Velayet',
    cat: 'Aile Hukuku',
    excerpt: 'Boşanma sürecinde çocukların velayeti ve nafaka miktarının belirlenmesinde dikkat edilmesi gereken hususlar.',
    content: `<p>Boşanma davalarının en hassas konuları arasında çocukların velayeti ve nafaka hakları yer almaktadır. Türk Medeni Kanunu çerçevesinde bu meseleler incelendiğinde, mahkemelerin her zaman çocuğun üstün yararını esas aldığı görülmektedir.</p>
    <h2>Velayet Kararı</h2>
    <p>Velayet kararı verilirken mahkeme; çocuğun yaşı, cinsiyeti, ebeveynlerin mali durumu, yaşam koşulları ve çocukla olan bağı gibi faktörleri göz önünde bulundurur.</p>
    <h2>Nafaka Türleri</h2>
    <ul>
      <li>İştirak nafakası (çocuk için)</li>
      <li>Yoksulluk nafakası (eş için)</li>
      <li>Tedbir nafakası (dava süresince)</li>
    </ul>
    <p>Nafaka miktarı belirlenirken her iki tarafın ekonomik durumu, çocuğun ihtiyaçları ve yaşam standardı dikkate alınmaktadır.</p>`,
    author: 'Av. Baykuş Hukuk',
    date: '8 Şubat 2025',
    img: '',
    emoji: '👨‍👩‍👧',
    published: true,
    views: 518
  },
  {
    id: 3,
    slug: 'kira-sozlesmesi-haklari',
    title: 'Kiracı ve Kiraya Verenin Hakları',
    cat: 'Gayrimenkul',
    excerpt: 'Kira sözleşmelerinde tarafların hak ve yükümlülükleri, kira artışı sınırları ve tahliye koşulları.',
    content: `<p>Kira hukuku, Türk Borçlar Kanunu'nun 299-356. maddeleri arasında düzenlenmektedir. Konut ve çatılı işyeri kiraları, kanunun özel hükümleri kapsamında güçlü kiracı korumasına sahiptir.</p>
    <h2>Kira Artışı</h2>
    <p>Türkiye'de kira artışları, TÜFE (Tüketici Fiyat Endeksi) oranı ile sınırlandırılmıştır. Taraflar bu oranın üzerinde bir artış kararlaştıramazlar.</p>
    <h2>Tahliye Koşulları</h2>
    <p>Kiraya veren, ancak kanunda belirtilen hallerde kiracının tahliyesini isteyebilir. Bu haller arasında kiracının kira borcunu ödememesi, kiralananı amacına aykırı kullanması ve kiraya verenin konut ihtiyacı sayılabilir.</p>`,
    author: 'Av. Baykuş Hukuk',
    date: '22 Mart 2025',
    img: '',
    emoji: '🏛️',
    published: true,
    views: 276
  }
];

const DEFAULT_GUNDEM = [
  {
    id: 1,
    title: 'Yeni Kira Kanunu Değişiklikleri Yürürlüğe Girdi',
    tag: 'Mevzuat',
    text: 'Konut kira sözleşmelerine ilişkin yeni düzenlemeler 1 Ocak 2025 itibarıyla yürürlüğe girmiştir.',
    link: '',
    date: '2 Oca 2025'
  },
  {
    id: 2,
    title: 'İş Mahkemelerinde Arabuluculuk Zorunlu Hale Geldi',
    tag: 'Hukuk',
    text: 'İş uyuşmazlıklarında dava açmadan önce arabuluculuğa başvurma zorunluluğu genişletildi.',
    link: '',
    date: '18 Şub 2025'
  },
  {
    id: 3,
    title: 'Yargıtay Kararı: Whatsapp Mesajları Delil Sayılabilir',
    tag: 'İçtihat',
    text: 'Yargıtay son kararında dijital mesajların uygun koşullar altında hukuki delil olarak kabul edilebileceğini hükmetti.',
    link: '',
    date: '5 Mar 2025'
  }
];

const DEFAULT_LINKS = [
  { id: 1, name: 'Türkiye Büyük Millet Meclisi', url: 'https://www.tbmm.gov.tr', desc: 'Mevzuat ve kanun bilgileri', icon: '🏛️' },
  { id: 2, name: 'Resmi Gazete', url: 'https://www.resmigazete.gov.tr', desc: 'Kanun, yönetmelik, tebliğ yayınları', icon: '📰' },
  { id: 3, name: 'Yargıtay', url: 'https://www.yargitay.gov.tr', desc: 'Yargıtay kararları ve içtihat', icon: '⚖️' },
  { id: 4, name: 'Danıştay', url: 'https://www.danistay.gov.tr', desc: 'İdari yargı kararları', icon: '🏛️' },
  { id: 5, name: 'e-Devlet Kapısı', url: 'https://www.turkiye.gov.tr', desc: 'Devlet hizmetlerine erişim', icon: '💻' },
  { id: 6, name: 'Türkiye Barolar Birliği', url: 'https://www.barobirlik.org.tr', desc: 'Avukatlık mevzuatı ve haberler', icon: '📋' }
];

const DEFAULT_SITE_SETTINGS = {
  title: 'Baykuş Hukuk',
  subtitle: 'Profesyonel Hukuk Bürosu',
  tagline: 'Haklarınızı Güvence Altına Alıyoruz',
  phone: '',     // Admin panelinden doldurun
  whatsapp: '',  // Admin panelinden doldurun
  email: '',     // Admin panelinden doldurun
  address: '',   // Admin panelinden doldurun
  hours: 'Pzt–Cum: 09:00–18:00 | Cmt: 10:00–14:00',
  mapUrl: '',    // Admin panelinden harita URL'si girin
  license: '',   // Admin panelinden doldurun
  heroText: 'Haklarınızı <span>Güvence Altına</span> Alıyoruz', // sanitizeContent() ile render edilmeli
  heroDesc: 'İstanbul Bağcılar\'da faaliyet gösteren Baykuş Hukuk Bürosu, her türlü hukuki sorununuzda güvenilir ve profesyonel çözümler sunar.',
  footerDesc: 'İstanbul Bağcılar\'da faaliyet gösteren Baykuş Hukuk Bürosu, müvekkillerine güven ve uzmanlıkla hizmet vermektedir.',
  // Son Dakika Ticker
  tickerActive: true,
  tickerText: 'Yeni kira artış sınırlamaları yürürlüğe girdi | İş hukuku danışmanlığında ücretsiz ilk görüşme | Boşanma davalarında 2025 yılı yargı reformu gündemde | Ticaret mahkemelerinde yeni elektronik tebligat sistemi başladı | Çalışanların kıdem tazminatı hakları için randevu alın',
  // Hakkımızda Sayfası
  hkBadge: 'Güven · Tecrübe · Adalet',
  hkBaslik: 'Baykuş Hukuk Hakkında',
  hkGiris: 'İstanbul Bağcılar\'da kurulmuş olan Baykuş Hukuk Bürosu, müvekkillerine hukuki güvence ve profesyonel temsil sunmak için çalışmaktadır.',
  hkMisyon: 'Hukuki alanda her bireyin bilgiye ulaşma hakkı olduğuna inanıyoruz. Müvekkillerimizin haklarını kararlılıkla savunmak ve en iyi sonucu elde etmek için titizlikle çalışıyoruz.\n\nYılların deneyimi ve sürekli gelişen hukuk bilgimizle, her davaya özgün ve etkili bir yaklaşım sunuyoruz.',
  hkKurulusYili: '2010',
  hkDavaAdeti: '500+',
  hkMemnuniyet: '%98',
  hkUzmanlik: '12',
  // SEO & Sosyal Medya
  ogImage: 'https://baykushukuk.com/og-image.svg',
  twitterHandle: '',
  siteUrl: 'https://baykushukuk.com',
  // Sosyal Medya (Admin panelinden doldurun)
  socialLinkedIn: '',  // LinkedIn profil URL'si
  socialTwitter: '',   // Twitter/X profil URL'si
  socialInstagram: '', // Instagram profil URL'si
  socialYoutube: '',   // YouTube kanal URL'si
  // API Anahtarları (Güvenli saklama için sunucu tarafına taşıyın)
  owmApiKey: '',       // OpenWeatherMap API key (openweathermap.org)
  // Canlı Sohbet
  tawkPropertyId: '',  // Tawk.to Property ID (tawk.to'dan alın)
};

// ═══════════════════════════════════════════════
// VERİ ERİŞİM FONKSİYONLARI
// ═══════════════════════════════════════════════

function getArticles() {
  const data = Store.get('articles', DEFAULT_ARTICLES);
  return Array.isArray(data) ? data : DEFAULT_ARTICLES;
}

function getGundem() {
  const data = Store.get('gundem', DEFAULT_GUNDEM);
  return Array.isArray(data) ? data : DEFAULT_GUNDEM;
}

function getLinks() {
  const data = Store.get('links', DEFAULT_LINKS);
  return Array.isArray(data) ? data : DEFAULT_LINKS;
}

function getSettings() {
  const data = Store.get('settings', DEFAULT_SITE_SETTINGS);
  return (data && typeof data === 'object') ? { ...DEFAULT_SITE_SETTINGS, ...data } : DEFAULT_SITE_SETTINGS;
}

function saveArticles(data) { Store.set('articles', data); }
function saveGundem(data) { Store.set('gundem', data); }
function saveLinks(data) { Store.set('links', data); }
function saveSettings(data) { Store.set('settings', data); }

function getArticleBySlug(slug) {
  return getArticles().find(a => a.slug === slug);
}

// ═══════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════

function formatDate() {
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const n = new Date();
  return `${n.getDate()} ${months[n.getMonth()]} ${n.getFullYear()} ${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
}

function formatDateLong() {
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const n = new Date();
  return `${n.getDate()} ${months[n.getMonth()]} ${n.getFullYear()}`;
}

function slugify(text) {
  const map = { 'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u','Ç':'c','Ğ':'g','İ':'i','Ö':'o','Ş':'s','Ü':'u' };
  return text.toLowerCase()
    .replace(/[çğışöüÇĞİŞÖÜ]/g, m => map[m] || m)
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n) + '...' : str;
}

function notify(msg, type = 'success', duration = 3500) {
  let el = document.getElementById('notify');
  if (!el) {
    el = document.createElement('div');
    el.id = 'notify';
    el.className = 'notify';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  // success, error veya info tiplerini destekle
  let cls = 'notify show';
  if (type === 'error') cls += ' error';
  else if (type === 'success') cls += ' success';
  else if (type === 'warn') cls += ' warn';
  el.className = cls;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.className = 'notify'; }, duration);
}

// ═══════════════════════════════════════════════
// GÜVENLİK: Admin oturum kontrolü
// ═══════════════════════════════════════════════
// NOT: Auth nesnesi artık js/supabase.js içinde tanımlıdır ve gerçek
// Supabase Auth oturumuna dayanır (bkz. SBAuth). Burada tekrar
// tanımlanmaz — supabase.js, data.js'ten ÖNCE yüklenmelidir.

// ═══════════════════════════════════════════════
// GÜVENLİK: XSS koruması
// ═══════════════════════════════════════════════
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

function sanitizeSlug(slug) {
  return (slug || '').toString().toLowerCase()
    .replace(/[^a-z0-9\-]/g, '').slice(0, 100);
}

// ═══════════════════════════════════════════════
// GÜVENLİK: İçerik sanitizasyonu (Stored XSS koruması)
// Admin tarafından girilmiş HTML içeriği public sayfada güvenle render etmek için
// ═══════════════════════════════════════════════
function sanitizeContent(html) {
  if (!html) return '';
  // İzin verilen etiket listesi — hukuk makaleleri için yeterli
  const ALLOWED_TAGS = ['p','br','b','strong','i','em','u','s','h1','h2','h3','h4',
    'ul','ol','li','blockquote','hr','a','img','table','thead','tbody','tr','th','td',
    'mark','span','div','pre','code','figure','figcaption','sup','sub'];
  const ALLOWED_ATTRS = {
    'a':   ['href','target','rel','title'],
    'img': ['src','alt','style','width','height'],
    'td':  ['colspan','rowspan','style'],
    'th':  ['colspan','rowspan','style'],
    'div': ['class','style'],
    'span':['class','style'],
    '*':   ['class']
  };

  const template = document.createElement('template');
  template.innerHTML = html;
  const frag = template.content;

  function clean(node) {
    const toRemove = [];
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toLowerCase();
        if (!ALLOWED_TAGS.includes(tag)) {
          // Tehlikeli etiket: içeriğini koru, etiketi kaldır
          while (child.firstChild) node.insertBefore(child.firstChild, child);
          toRemove.push(child);
        } else {
          // İzin verilmeyen attribute'ları temizle
          const allowed = [...(ALLOWED_ATTRS[tag] || []), ...(ALLOWED_ATTRS['*'] || [])];
          [...child.attributes].forEach(attr => {
            if (!allowed.includes(attr.name)) {
              child.removeAttribute(attr.name);
            } else if (attr.name === 'href' || attr.name === 'src') {
              // javascript: protokolünü engelle
              if (/^\s*javascript:/i.test(attr.value)) child.removeAttribute(attr.name);
            } else if (attr.name === 'style') {
              // expression() ve url() ile javascript engelle
              if (/expression\s*\(|javascript\s*:/i.test(attr.value)) child.removeAttribute(attr.name);
            }
          });
          // Dış linklere güvenli özellikler ekle
          if (tag === 'a' && child.getAttribute('href')?.startsWith('http')) {
            child.setAttribute('target', '_blank');
            child.setAttribute('rel', 'noopener noreferrer');
          }
          clean(child);
        }
      } else if (child.nodeType === Node.COMMENT_NODE) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(n => node.removeChild(n));
  }

  clean(frag);
  const out = document.createElement('div');
  out.appendChild(frag);
  return out.innerHTML;
}

// ═══════════════════════════════════════════════
// NOT: Eski client-side SHA-256/PBKDF2 şifre hashleme fonksiyonları
// (hashPassword/verifyPassword) kaldırıldı. Şifre hashleme artık
// Supabase Auth tarafında sunucuda (bcrypt ile) yapılır — bkz. js/supabase.js → SBAuth.
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════════════
// GÜVENLİK: Form spam koruması
// ═══════════════════════════════════════════════
const FormGuard = {
  COOLDOWN: 90000, // 90 saniye
  canSubmit() {
    const last = Store.get('last_form_submit', 0);
    return (Date.now() - last) > this.COOLDOWN;
  },
  markSubmit() { Store.set('last_form_submit', Date.now()); },
  remaining() {
    const last = Store.get('last_form_submit', 0);
    return Math.max(0, Math.ceil((this.COOLDOWN - (Date.now() - last)) / 1000));
  }
};


// ═══════════════════════════════════════════════
// HİZMETLER (admin panelinden yönetilebilir)
// ═══════════════════════════════════════════════

const DEFAULT_HIZMETLER = [
  { id:1, icon:'⚖️', title:'Ceza Hukuku',        desc:'Suç isnatlarına karşı güçlü savunma stratejileri ve itiraz süreçlerinde uzman hukuki destek.', sira:1 },
  { id:2, icon:'👨‍👩‍👧', title:'Aile Hukuku',       desc:'Boşanma, velayet, nafaka davaları ve aile içi uyuşmazlıklarda duyarlı hukuki temsil.', sira:2 },
  { id:3, icon:'🏢', title:'Ticaret Hukuku',      desc:'Şirket kuruluşu, sözleşme hukuku, ticari uyuşmazlıklar ve alacak takibi.', sira:3 },
  { id:4, icon:'🏠', title:'Gayrimenkul Hukuku',   desc:'Tapu devri, kira uyuşmazlıkları, inşaat sözleşmeleri ve kamulaştırma itirazları.', sira:4 },
  { id:5, icon:'👷', title:'İş Hukuku',            desc:'Haksız fesih, kıdem tazminatı, iş kazası ve toplu iş sözleşmesi konularında temsil.', sira:5 },
  { id:6, icon:'🏛️', title:'İdare Hukuku',         desc:'İdari para cezalarına itiraz, kamu ihale uyuşmazlıkları ve idare mahkemesi davaları.', sira:6 },
  { id:7, icon:'💼', title:'Miras Hukuku',         desc:'Vasiyetname hazırlama, miras paylaşımı, tenkis davaları ve mirasçılık belgesi işlemleri.', sira:7 },
  { id:8, icon:'💳', title:'İcra & İflas Hukuku',  desc:'Alacak takibi, ihtiyati haciz, konkordato ve iflas süreçlerinde hukuki danışmanlık.', sira:8 }
];

function getHizmetler() {
  const d = Store.get('hizmetler', DEFAULT_HIZMETLER);
  return Array.isArray(d) ? d : DEFAULT_HIZMETLER;
}

function saveHizmetler(data) { Store.set('hizmetler', data); }

function getHakkimizda() {
  const s = getSettings();
  return {
    badge: s.hkBadge || 'Güven · Tecrübe · Adalet',
    baslik: s.hkBaslik || 'Baykuş Hukuk Hakkında',
    giris: s.hkGiris || '',
    misyon: s.hkMisyon || '',
    kurulusYili: s.hkKurulusYili || '2010',
    davaAdeti: s.hkDavaAdeti || '500+',
    memnuniyet: s.hkMemnuniyet || '%98',
    uzmanlik: s.hkUzmanlik || '12'
  };
}

function getTicker() {
  const s = getSettings();
  return {
    active: s.tickerActive !== false,
    text: s.tickerText || ''
  };
}

// Ayarları mevcut değerleri koruyarak kaydet (import/hakkımızda vb için)
function saveSettings_merge(newData) {
  const existing = getSettings();
  Store.set('settings', { ...existing, ...newData });
}

// ═══════════════════════════════════════════════
// AVUKATLAR
// ═══════════════════════════════════════════════

const DEFAULT_LAWYERS = [
  {
    id: 1,
    name: 'Av. Ahmet Yıldız',
    title: 'Kurucu Ortak',
    photo: '',
    initials: 'AY',
    baroNo: '',  // Admin panelinden doldurun
    email: '',   // Admin panelinden doldurun
    phone: '',   // Admin panelinden doldurun
    specialties: ['Ceza Hukuku', 'İdare Hukuku', 'Anayasa Hukuku'],
    education: [
      'İstanbul Üniversitesi Hukuk Fakültesi, LL.B. (2005)',
      'Galatasaray Üniversitesi, Ceza Hukuku Yüksek Lisans (2008)'
    ],
    bio: 'Ceza ve idare hukuku alanlarında 18 yılı aşkın deneyime sahiptir. Yargıtay nezdinde 200\'den fazla dosyayı başarıyla sonuçlandırmıştır.',
    linkedin: '',
    order: 1,
    active: true
  },
  {
    id: 2,
    name: 'Av. Elif Kaya',
    title: 'Kıdemli Ortak',
    photo: '',
    initials: 'EK',
    baroNo: '',  // Admin panelinden doldurun
    email: '',   // Admin panelinden doldurun
    phone: '',   // Admin panelinden doldurun
    specialties: ['Aile Hukuku', 'Miras Hukuku', 'Kişiler Hukuku'],
    education: [
      'Ankara Üniversitesi Hukuk Fakültesi, LL.B. (2009)',
      'Boğaziçi Üniversitesi, Aile Hukuku Sertifikası (2012)'
    ],
    bio: 'Aile ve miras hukuku konularında uzmanlaşmış olup, hassas aile uyuşmazlıklarında müvekkillerine duyarlı ve etkili hukuki destek sağlamaktadır.',
    linkedin: '',
    order: 2,
    active: true
  },
  {
    id: 3,
    name: 'Av. Mehmet Demir',
    title: 'Ortak Avukat',
    photo: '',
    initials: 'MD',
    baroNo: '',  // Admin panelinden doldurun
    email: '',   // Admin panelinden doldurun
    phone: '',   // Admin panelinden doldurun
    specialties: ['Ticaret Hukuku', 'İcra & İflas', 'Gayrimenkul Hukuku'],
    education: [
      'Marmara Üniversitesi Hukuk Fakültesi, LL.B. (2011)',
      'İstanbul Ticaret Üniversitesi, Ticaret Hukuku Yüksek Lisans (2014)'
    ],
    bio: 'Ticaret ve icra hukuku alanlarında uzmanlaşmış, özellikle şirket birleşme/devralma ve alacak takip davalarında kapsamlı deneyime sahiptir.',
    linkedin: '',
    order: 3,
    active: true
  }
];

function getLawyers() {
  const d = Store.get('lawyers', DEFAULT_LAWYERS);
  return Array.isArray(d) ? d : DEFAULT_LAWYERS;
}
function saveLawyers(data) { Store.set('lawyers', data); }

// ═══════════════════════════════════════════════
// REFERANSLAR / MÜVEKKİL GÖRÜŞLERİ
// ═══════════════════════════════════════════════

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    name: 'Mehmet A.',
    category: 'İş Hukuku',
    text: 'Haksız işten çıkarma davamda Baykuş Hukuk ekibi son derece profesyonel ve ilgili davrandı. Haklarımı eksiksiz aldım, teşekkürler.',
    rating: 5,
    date: 'Mart 2025',
    active: true
  },
  {
    id: 2,
    name: 'Ayşe K.',
    category: 'Aile Hukuku',
    text: 'Boşanma sürecinde hem hukuki hem de insani açıdan büyük destek gördüm. Velayet ve nafaka konularında beklediğimden iyi sonuç aldık.',
    rating: 5,
    date: 'Ocak 2025',
    active: true
  },
  {
    id: 3,
    name: 'Ticaret A.Ş.',
    category: 'Ticaret Hukuku',
    text: 'Şirketimizin alacak davalarını başarıyla yönettiler. Hızlı ve etkili çözümler için Baykuş Hukuk\'u kurumsal müşterilere önemle tavsiye ederim.',
    rating: 5,
    date: 'Şubat 2025',
    active: true
  },
  {
    id: 4,
    name: 'Fatma Y.',
    category: 'Gayrimenkul',
    text: 'Tapu uyuşmazlığımda çok hızlı ve başarılı bir çözüm ürettiler. Tüm süreci şeffaf biçimde anlattılar, hiç sürprizle karşılaşmadım.',
    rating: 5,
    date: 'Nisan 2025',
    active: true
  }
];

function getTestimonials() {
  const d = Store.get('testimonials', DEFAULT_TESTIMONIALS);
  return Array.isArray(d) ? d : DEFAULT_TESTIMONIALS;
}
function saveTestimonials(data) { Store.set('testimonials', data); }

// ═══════════════════════════════════════════════
// RANDEVU SİSTEMİ
// ═══════════════════════════════════════════════

function getAppointments() {
  const d = Store.get('appointments', []);
  return Array.isArray(d) ? d : [];
}

function saveAppointments(data) { Store.set('appointments', data); }

function addAppointment(appt) {
  const list = getAppointments();
  const newAppt = {
    ...appt,
    id: Date.now(),
    status: 'bekliyor', // bekliyor | onaylandi | reddedildi
    createdAt: new Date().toISOString()
  };
  list.push(newAppt);
  saveAppointments(list);
  return newAppt;
}

// Müsait slotlar (admin ayarlayabilir; şimdilik sabit)
const APPOINTMENT_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

function getAvailableSlots(dateStr) {
  if (!dateStr) return [];
  const date = new Date(dateStr);
  const day = date.getDay(); // 0=Pazar, 6=Cumartesi
  if (day === 0) return []; // Pazar kapalı
  const slots = day === 6
    ? APPOINTMENT_SLOTS.filter(s => s < '14:00') // Cumartesi 10-14
    : APPOINTMENT_SLOTS;
  // Mevcut randevularla çakışanları çıkar
  const existing = getAppointments()
    .filter(a => a.date === dateStr && a.status !== 'reddedildi')
    .map(a => a.time);
  return slots.filter(s => !existing.includes(s));
}


// ════════════════════════════════════════════════
//  BÜLTEN ABONELERİ
// ════════════════════════════════════════════════
const DEFAULT_SUBSCRIBERS = [];

function getSubscribers() {
  const d = Store.get('subscribers', DEFAULT_SUBSCRIBERS);
  return Array.isArray(d) ? d : [];
}

function saveSubscribers(list) {
  Store.set('subscribers', list);
}

function addSubscriber(email) {
  email = (email || '').trim().toLowerCase();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return { ok: false, msg: 'Geçerli bir e-posta adresi girin.' };
  const list = getSubscribers();
  if (list.find(s => s.email === email)) return { ok: false, msg: 'Bu e-posta zaten kayıtlı.' };
  list.push({ id: Date.now(), email, date: new Date().toISOString(), active: true });
  saveSubscribers(list);
  return { ok: true, msg: 'Bültene başarıyla abone oldunuz! 🎉' };
}

function removeSubscriber(id) {
  saveSubscribers(getSubscribers().filter(s => s.id !== id));
}

function exportSubscribersCSV() {
  const list = getSubscribers();
  if (!list.length) return;
  const rows = ['E-posta,Kayıt Tarihi,Durum'];
  list.forEach(s => {
    const dt = new Date(s.date).toLocaleDateString('tr-TR');
    rows.push(`${s.email},${dt},${s.active ? 'Aktif' : 'Pasif'}`);
  });
  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `bulten-${new Date().toISOString().slice(0,10)}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}
