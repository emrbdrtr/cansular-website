import "dotenv/config";
import { searchConfig } from "./config.js";
import { scrapeGoogleMaps } from "./scrapers/googleMaps.js";
import { enrichWithEmails, sortResults, printSummary } from "./processor.js";
import { exportToExcel, generateFileName } from "./exporter.js";

async function main() {
  // Token kontrolü
  const token = process.env.APIFY_TOKEN;
  if (!token || token === "your_apify_token_here") {
    console.error("HATA: .env dosyasına APIFY_TOKEN eklemeyi unutma!");
    console.error("  1. .env.example dosyasını .env olarak kopyala");
    console.error("  2. https://console.apify.com/account/integrations adresinden token al");
    process.exit(1);
  }

  const { keyword, location, maxResults, emailTimeoutMs, outputFileName } = searchConfig;

  console.log("========================================");
  console.log("  LEAD GENERATION - BASLIYOR");
  console.log("========================================");
  console.log(`  Arama: ${keyword}`);
  console.log(`  Konum: ${location}`);
  console.log(`  Max:   ${maxResults} isyeri`);
  console.log("========================================\n");

  // 1. Google Maps'ten işyerleri çek
  const places = await scrapeGoogleMaps({
    keyword,
    location,
    maxResults,
    token,
  });

  if (places.length === 0) {
    console.log("Sonuc bulunamadi. Keyword veya location'i kontrol et.");
    process.exit(0);
  }

  // 2. Her işyerinin sitesinden email kazı
  console.log("[Email Scraper] Siteler taranıyor...\n");
  const enriched = await enrichWithEmails(places, emailTimeoutMs);

  // 3. Email bulunanları üste getir
  const sorted = sortResults(enriched);

  // 4. Özet yazdır
  printSummary(sorted);

  // 5. Excel'e aktar
  const fileName = outputFileName || generateFileName(keyword, location);
  await exportToExcel(sorted, fileName);

  console.log("Tamamlandi! output/ klasorunu kontrol et.");
}

main().catch((err) => {
  console.error("Beklenmeyen hata:", err.message);
  process.exit(1);
});
