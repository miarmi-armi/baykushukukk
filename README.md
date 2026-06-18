# Baykuş Hukuk

Profesyonel hukuk bürosu web sitesi. Statik HTML/CSS/JS önyüz + Supabase (Postgres) arka uç.

## 1) Supabase Kurulumu (ZORUNLU — admin paneli ve formlar bunsuz çalışmaz)

1. [supabase.com](https://supabase.com) üzerinde ücretsiz bir proje oluşturun (Frankfurt bölgesi önerilir).
2. Project Settings → API'den şu iki değeri kopyalayın:
   - **Project URL**
   - **anon / public key**
3. Bu iki değeri `js/supabase.js` dosyasının en üstündeki `SUPABASE_URL` ve `SUPABASE_ANON` sabitlerine yapıştırın.
4. SQL Editor'e gidip `supabase/rls-policies.sql` dosyasının tamamını çalıştırın (tablo erişim izinlerini kurar).
5. Authentication → Users → **Add user** ile kendinize bir admin hesabı (e-posta + şifre) oluşturun.

> ⚠️ **service_role anahtarına hiçbir zaman gerek yoktur ve hiçbir dosyaya eklenmemelidir.**
> Bu anahtar tüm güvenlik kurallarını (RLS) atlar; tarayıcıya konursa veritabanınızın tamamı
> herkese açık hale gelir. Admin paneli artık gerçek Supabase Auth oturumuyla çalışır.

## 2) Yayınlama (Deployment)

Proje hem GitHub Pages hem Vercel ile uyumludur — **ama ikisini aynı anda kullanmayın**,
çünkü güvenlik başlıkları (`vercel.json`) sadece Vercel'de devreye girer:

**Vercel (önerilen — güvenlik başlıkları + admin no-index/no-cache kuralları otomatik uygulanır):**
```
vercel deploy
```

**GitHub Pages:**
1. Repoyu GitHub'a yükleyin
2. Settings → Pages → Source: `main` branch, `/ (root)`
3. `_config.yml` zaten `_yonetim9k` klasörünün Jekyll tarafından atlanmamasını sağlıyor
4. Not: Bu seçenekte `vercel.json`'daki güvenlik başlıkları (HSTS, X-Frame-Options vb.) **uygulanmaz** —
   GitHub Pages özel HTTP başlığı eklemeye izin vermez.

## 3) Admin Paneli

```
https://[siteniz]/_yonetim9k/giris.html
```

Giriş, Supabase'de oluşturduğunuz e-posta/şifre ile yapılır (yukarı bakın, madde 1.5).
Şifrenizi unutursanız Supabase Dashboard → Authentication → Users'dan sıfırlayabilirsiniz.

## 4) Güvenlik Mimarisi

- Admin oturumu gerçek **Supabase Auth** (JWT) ile sağlanır; şifre hash'leme sunucuda yapılır.
- Yazma yetkisi (makale ekleme/silme, randevu yönetimi vb.) Supabase **RLS politikalarıyla**
  `authenticated` rolüne sınırlandırılmıştır — istemci kodu güvenliği uygulamaz, sadece
  arayüzü gösterir; gerçek sınır veritabanı tarafındadır.
- Ziyaretçiler (`anon` rolü) sadece yayınlanmış içerikleri okuyabilir ve form gönderebilir
  (randevu/iletişim/bülten) — başkalarının randevu veya mesaj verisini okuyamaz.
- Admin URL'si arama motorlarından gizlenir (`robots.txt`) — bu sadece indekslenmeyi önler,
  gerçek erişim kontrolü Supabase Auth'tadır.

## 5) Veri Yedekleme

Supabase Dashboard → Database → Backups bölümünden otomatik yedekler alınır.
Ayrıca admin panel → Ayarlar → **Veriyi Dışa Aktar** ile manuel CSV/JSON yedek alabilirsiniz.
