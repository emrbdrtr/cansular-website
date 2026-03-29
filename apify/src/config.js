// =====================================================
//  BURADAN ARAMA AYARLARINI YAPIN
// =====================================================

export const searchConfig = {
  // Arama sorgusu - Google Maps'e bu yazılır
  // Örnekler: "hırdavatçı", "çiçekçi", "boya bayii", "elektrikçi", "tesisatçı"
  keyword: "hırdavatçı",

  // Lokasyon
  location: "Kadıköy, İstanbul, Türkiye",

  // Kaç işyeri çekilsin (max 500 Apify'da)
  maxResults: 100,

  // Email scraping için sayfa başına timeout (ms)
  emailTimeoutMs: 8000,

  // Çıktı Excel dosyasının adı (output/ klasörüne kaydedilir)
  // Boş bırakırsan otomatik isim üretilir: keyword_location_tarih.xlsx
  outputFileName: "",
};

// Apify Google Maps Scraper aktör ID'si
export const ACTOR_ID = "compass/google-maps-scraper";

// Email regex pattern - site içindeki mailleri yakalar
export const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

// Bu domainlerden gelen mailler filtrele (spam / örnek mailler)
export const EMAIL_BLACKLIST_DOMAINS = [
  "example.com",
  "test.com",
  "sentry.io",
  "wixpress.com",
  "google.com",
  "schema.org",
  "w3.org",
  "jquery.com",
  "cloudflare.com",
];
