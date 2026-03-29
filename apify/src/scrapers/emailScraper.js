import axios from "axios";
import * as cheerio from "cheerio";
import { EMAIL_REGEX, EMAIL_BLACKLIST_DOMAINS } from "../config.js";

// Bir siteden email adresleri çeker
// Ana sayfayı + /iletisim, /contact, /hakkimizda sayfalarını tarar
export async function scrapeEmailsFromWebsite(websiteUrl, timeoutMs = 8000) {
  if (!websiteUrl) return [];

  const baseUrl = normalizeUrl(websiteUrl);
  if (!baseUrl) return [];

  // Taranan sayfalar: ana sayfa + iletişim sayfaları
  const pathsToCheck = [
    "",
    "/iletisim",
    "/iletişim",
    "/contact",
    "/contact-us",
    "/hakkimizda",
    "/hakkımızda",
    "/about",
  ];

  const foundEmails = new Set();

  for (const path of pathsToCheck) {
    try {
      const url = baseUrl + path;
      const html = await fetchPage(url, timeoutMs);
      if (!html) continue;

      const emails = extractEmailsFromHtml(html);
      emails.forEach((e) => foundEmails.add(e));

      // Ana sayfada mail bulduysa iletişim sayfasına gerek yok
      if (path === "" && foundEmails.size > 0) break;
    } catch {
      // Bu sayfa yoksa veya timeout olduysa devam et
    }
  }

  return [...foundEmails];
}

async function fetchPage(url, timeoutMs) {
  try {
    const response = await axios.get(url, {
      timeout: timeoutMs,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8",
      },
      maxRedirects: 3,
    });
    return response.data;
  } catch {
    return null;
  }
}

function extractEmailsFromHtml(html) {
  const $ = cheerio.load(html);

  // Script ve style etiketlerini kaldır - yanlış eşleşme azaltır
  $("script, style, noscript").remove();

  const text = $.text();

  // HTML'den de çek (mailto: linkleri vb.)
  const fullText = text + " " + html;

  const matches = fullText.match(EMAIL_REGEX) || [];

  return matches
    .map((e) => e.toLowerCase().trim())
    .filter((e) => isValidEmail(e));
}

function isValidEmail(email) {
  // Basit format kontrolü
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return false;

  const domain = email.split("@")[1];

  // Blacklist kontrolü
  if (EMAIL_BLACKLIST_DOMAINS.some((d) => domain.includes(d))) return false;

  // Görsel/font dosyası uzantısı içeren sahte mailleri ele
  if (/\.(png|jpg|jpeg|gif|svg|woff|ttf|eot|css|js)$/i.test(domain)) return false;

  return true;
}

function normalizeUrl(url) {
  try {
    if (!url.startsWith("http")) url = "https://" + url;
    const parsed = new URL(url);
    return parsed.origin; // sadece https://domain.com
  } catch {
    return null;
  }
}
