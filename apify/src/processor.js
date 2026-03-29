import { scrapeEmailsFromWebsite } from "./scrapers/emailScraper.js";

// Her işyeri için email taraması yapar, sonuçları birleştirir
export async function enrichWithEmails(places, timeoutMs) {
  const total = places.length;
  const results = [];

  for (let i = 0; i < total; i++) {
    const place = places[i];
    const progress = `[${i + 1}/${total}]`;

    if (!place.website) {
      console.log(`${progress} ${place.name} — website yok, atlanıyor`);
      results.push({ ...place, emails: [] });
      continue;
    }

    console.log(`${progress} ${place.name} taranıyor → ${place.website}`);

    const emails = await scrapeEmailsFromWebsite(place.website, timeoutMs);

    if (emails.length > 0) {
      console.log(`         ✓ ${emails.length} email bulundu: ${emails.join(", ")}`);
    } else {
      console.log(`         - email bulunamadı`);
    }

    results.push({ ...place, emails });
  }

  return results;
}

// Email bulunanları üste sırala, sonra rating'e göre
export function sortResults(results) {
  return results.sort((a, b) => {
    if (b.emails.length !== a.emails.length) return b.emails.length - a.emails.length;
    return (b.rating || 0) - (a.rating || 0);
  });
}

// Özet istatistik
export function printSummary(results) {
  const withEmail = results.filter((r) => r.emails.length > 0).length;
  const withWebsite = results.filter((r) => r.website).length;

  console.log("\n========================================");
  console.log("  SONUC OZETI");
  console.log("========================================");
  console.log(`  Toplam isyeri    : ${results.length}`);
  console.log(`  Website olan     : ${withWebsite}`);
  console.log(`  Email bulunan    : ${withEmail}`);
  console.log(`  Email bulunamayan: ${results.length - withEmail}`);
  console.log("========================================\n");
}
