import { ApifyClient } from "apify-client";
import { ACTOR_ID } from "../config.js";

export async function scrapeGoogleMaps({ keyword, location, maxResults, token }) {
  console.log(`\n[Google Maps] "${keyword}" araması başlatılıyor → ${location}`);
  console.log(`[Google Maps] Hedef: ${maxResults} sonuç\n`);

  const client = new ApifyClient({ token });

  const run = await client.actor(ACTOR_ID).call({
    searchStringsArray: [`${keyword} ${location}`],
    maxCrawledPlacesPerSearch: maxResults,
    language: "tr",
    // Gereksiz alanları kapat - daha hızlı çalışır
    scrapeReviewerName: false,
    scrapeReviews: false,
    scrapeImages: false,
  });

  console.log(`[Google Maps] Scrape tamamlandı. Dataset: ${run.defaultDatasetId}`);

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  console.log(`[Google Maps] ${items.length} işyeri bulundu.\n`);

  // Sadece ihtiyacımız olan alanları al
  return items.map((place) => ({
    name: place.title || "",
    category: place.categoryName || "",
    address: place.address || "",
    phone: place.phone || "",
    website: place.website || "",
    googleMapsUrl: place.url || "",
    rating: place.totalScore || "",
    reviewCount: place.reviewsCount || 0,
  }));
}
