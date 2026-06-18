-- ════════════════════════════════════════════════════════════════
-- BAYKUŞ HUKUK — Supabase Row Level Security (RLS) Politikaları
-- ════════════════════════════════════════════════════════════════
-- NE İÇİN: Bu dosya, sitenin service_role anahtarını TARAYICIYA HİÇ
-- KOYMADAN güvenli şekilde çalışmasını sağlar. Yazma işlemleri (admin
-- panel) artık Supabase Auth ile giriş yapmış ("authenticated" rolündeki)
-- kullanıcıya, okuma işlemleri ise ziyaretçilere ("anon" rolü) sadece
-- gerekli satır/sütunlarla açılır.
--
-- NASIL ÇALIŞTIRILIR:
-- 1) Supabase Dashboard → SQL Editor → New query
-- 2) Bu dosyanın TAMAMINI yapıştırıp "Run" deyin.
-- 3) Authentication → Users → "Add user" ile KENDİNİZE bir admin
--    hesabı oluşturun (e-posta + şifre). service_role anahtarına
--    hiçbir zaman gerek yoktur ve hiçbir dosyada kullanılmamalıdır.
--
-- GÜVENLİ ŞEKİLDE TEKRAR ÇALIŞTIRILABİLİR (idempotent): script
-- mevcut politikaları silip yeniden oluşturur, hata vermez.
-- ════════════════════════════════════════════════════════════════


-- ──────────────────────────────────────────────
-- 1) İÇERİK TABLOLARI — herkes okuyabilir, sadece
--    giriş yapmış admin (authenticated) yazabilir
--    (articles, gundem, hizmetler, links, lawyers, testimonials)
-- ──────────────────────────────────────────────

-- ARTICLES (yalnızca published=true olanlar herkese açık)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS articles_anon_select ON articles;
CREATE POLICY articles_anon_select ON articles
  FOR SELECT TO anon USING (published = true);
DROP POLICY IF EXISTS articles_auth_select ON articles;
CREATE POLICY articles_auth_select ON articles
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS articles_auth_write ON articles;
CREATE POLICY articles_auth_write ON articles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- GUNDEM
ALTER TABLE gundem ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gundem_anon_select ON gundem;
CREATE POLICY gundem_anon_select ON gundem
  FOR SELECT TO anon USING (active = true);
DROP POLICY IF EXISTS gundem_auth_all ON gundem;
CREATE POLICY gundem_auth_all ON gundem
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- HIZMETLER
ALTER TABLE hizmetler ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hizmetler_anon_select ON hizmetler;
CREATE POLICY hizmetler_anon_select ON hizmetler
  FOR SELECT TO anon USING (active = true);
DROP POLICY IF EXISTS hizmetler_auth_all ON hizmetler;
CREATE POLICY hizmetler_auth_all ON hizmetler
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- LINKS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS links_anon_select ON links;
CREATE POLICY links_anon_select ON links
  FOR SELECT TO anon USING (active = true);
DROP POLICY IF EXISTS links_auth_all ON links;
CREATE POLICY links_auth_all ON links
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- LAWYERS
ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lawyers_anon_select ON lawyers;
CREATE POLICY lawyers_anon_select ON lawyers
  FOR SELECT TO anon USING (active = true);
DROP POLICY IF EXISTS lawyers_auth_all ON lawyers;
CREATE POLICY lawyers_auth_all ON lawyers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- TESTIMONIALS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS testimonials_anon_select ON testimonials;
CREATE POLICY testimonials_anon_select ON testimonials
  FOR SELECT TO anon USING (active = true);
DROP POLICY IF EXISTS testimonials_auth_all ON testimonials;
CREATE POLICY testimonials_auth_all ON testimonials
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SITE_SETTINGS (tek satırlık ayar tablosu — herkes okuyabilir, sadece admin günceller)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS settings_anon_select ON site_settings;
CREATE POLICY settings_anon_select ON site_settings
  FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS settings_auth_all ON site_settings;
CREATE POLICY settings_auth_all ON site_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ──────────────────────────────────────────────
-- 2) FORM TABLOLARI — ziyaretçi SADECE EKLEYEBİLİR (insert),
--    okuyamaz/değiştiremez/silemez. Sadece admin (authenticated)
--    tam erişime sahiptir. Bu sayede biri formu kötüye kullanıp
--    başkalarının randevu/mesaj/abone verisini okuyamaz.
--    (appointments, contact_messages, subscribers)
-- ──────────────────────────────────────────────

-- APPOINTMENTS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS appt_anon_insert ON appointments;
CREATE POLICY appt_anon_insert ON appointments
  FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS appt_auth_all ON appointments;
CREATE POLICY appt_auth_all ON appointments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- NOT: anon için SELECT politikası YOK — randevu detaylarını (ad, telefon vb.)
-- ziyaretçi okuyamaz. Dolu saatleri görmek için aşağıdaki dar GÖRÜNÜM (view)
-- kullanılır, ham tabloya değil.

-- CONTACT_MESSAGES
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS msg_anon_insert ON contact_messages;
CREATE POLICY msg_anon_insert ON contact_messages
  FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS msg_auth_all ON contact_messages;
CREATE POLICY msg_auth_all ON contact_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SUBSCRIBERS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sub_anon_insert ON subscribers;
CREATE POLICY sub_anon_insert ON subscribers
  FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS sub_auth_all ON subscribers;
CREATE POLICY sub_auth_all ON subscribers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ──────────────────────────────────────────────
-- 3) Randevu sayfasının "şu saatler dolu" göstergesi için DAR GÖRÜNÜM.
--    Ziyaretçi sadece tarih/saat/durum görür — isim/telefon/e-posta
--    gibi kişisel veriler bu görünümde YOKTUR.
-- ──────────────────────────────────────────────
CREATE OR REPLACE VIEW public_taken_slots AS
  SELECT date, time, status FROM appointments;

GRANT SELECT ON public_taken_slots TO anon;

-- ════════════════════════════════════════════════════════════════
-- BİTTİ. Şimdi js/supabase.js'teki getTakenSlots() fonksiyonunun
-- 'appointments' yerine 'public_taken_slots' görünümünü sorguladığından
-- emin olun (bu proje paketinde bu değişiklik zaten uygulanmıştır).
-- ════════════════════════════════════════════════════════════════
