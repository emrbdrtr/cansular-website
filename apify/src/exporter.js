import ExcelJS from "exceljs";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "output");

export async function exportToExcel(results, fileName) {
  // output/ klasörünü oluştur
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  const filePath = path.join(OUTPUT_DIR, fileName);
  const workbook = new ExcelJS.Workbook();

  // -----------------------------------------------
  // Sayfa 1: Email bulunanlar
  // -----------------------------------------------
  const sheetLeads = workbook.addWorksheet("Email Bulunanlar", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  addHeaders(sheetLeads);

  const withEmail = results.filter((r) => r.emails.length > 0);
  withEmail.forEach((r) => addRow(sheetLeads, r));

  styleSheet(sheetLeads);

  // -----------------------------------------------
  // Sayfa 2: Tüm kayıtlar
  // -----------------------------------------------
  const sheetAll = workbook.addWorksheet("Tum Isyerleri", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  addHeaders(sheetAll);
  results.forEach((r) => addRow(sheetAll, r));
  styleSheet(sheetAll);

  await workbook.xlsx.writeFile(filePath);

  console.log(`\nExcel kaydedildi: ${filePath}`);
  console.log(`  - "Email Bulunanlar" sayfası: ${withEmail.length} kayit`);
  console.log(`  - "Tum Isyerleri" sayfası: ${results.length} kayit\n`);

  return filePath;
}

function addHeaders(sheet) {
  sheet.columns = [
    { header: "İşyeri Adı", key: "name", width: 30 },
    { header: "Kategori", key: "category", width: 20 },
    { header: "Email(ler)", key: "emails", width: 40 },
    { header: "Telefon", key: "phone", width: 18 },
    { header: "Website", key: "website", width: 35 },
    { header: "Adres", key: "address", width: 45 },
    { header: "Puan", key: "rating", width: 8 },
    { header: "Yorum Sayısı", key: "reviewCount", width: 14 },
    { header: "Google Maps", key: "googleMapsUrl", width: 15 },
  ];

  // Başlık satırı stili
  sheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FFFFFFFF" } },
    };
  });
  sheet.getRow(1).height = 22;
}

function addRow(sheet, r) {
  const row = sheet.addRow({
    name: r.name,
    category: r.category,
    emails: r.emails.join(", "),
    phone: r.phone,
    website: r.website,
    address: r.address,
    rating: r.rating,
    reviewCount: r.reviewCount,
    googleMapsUrl: r.googleMapsUrl ? "Haritada Gör" : "",
  });

  // Google Maps linki tıklanabilir yap
  if (r.googleMapsUrl) {
    const cell = row.getCell("googleMapsUrl");
    cell.value = { text: "Haritada Gör", hyperlink: r.googleMapsUrl };
    cell.font = { color: { argb: "FF0563C1" }, underline: true };
  }

  // Email olan satırları açık yeşil yap
  if (r.emails.length > 0) {
    row.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2EFDA" } };
    });
  }

  row.alignment = { vertical: "middle", wrapText: false };
}

function styleSheet(sheet) {
  // Zebra satır renklendirme (email olmayanlar için)
  sheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const emailCell = row.getCell("emails");
    if (!emailCell.value) {
      if (rowNum % 2 === 0) {
        row.eachCell((cell) => {
          if (!cell.fill || cell.fill?.fgColor?.argb === "FFE2EFDA") return;
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } };
        });
      }
    }
  });

  // Auto filter
  sheet.autoFilter = {
    from: "A1",
    to: { row: 1, column: sheet.columns.length },
  };
}

export function generateFileName(keyword, location) {
  const date = new Date().toISOString().slice(0, 10);
  const safe = (str) => str.replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ\s]/g, "").replace(/\s+/g, "_");
  return `${safe(keyword)}_${safe(location)}_${date}.xlsx`;
}
