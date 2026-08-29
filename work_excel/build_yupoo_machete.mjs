import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve("..");
const outputDir = path.join(root, "outputs", "019fe9b4-b5b4-70d1-8653-756d060d51a3");
const sourceFiles = [
  { file: path.join(root, "yupoo_running.html"), category: "Running / moda calle" },
  { file: path.join(root, "yupoo_basketball.html"), category: "Basketball / performance" },
];

const trendSources = [
  "https://daguanlan.x.yupoo.com/collections/4988675?lang=en-US",
  "https://daguanlan.x.yupoo.com/collections/4988676?lang=en-US",
  "https://stockx.com/about/sx-market-insights/big-facts-current-culture-index-2026/",
  "https://footwearmagazine.com/stockx-big-facts-2025/",
  "https://www.whowhatwear.com/fashion/shoes/sneaker-trends-2026",
];

function parseAlbums(html, category) {
  const rows = [];
  const albumRe = /<div class="categories__children">([\s\S]*?)<\/div>\s*<\/div>/g;
  for (const m of html.matchAll(albumRe)) {
    const block = m[1];
    const href = block.match(/href="([^"]*\/albums\/[^"]+)"/)?.[1];
    if (!href) continue;
    const title = block.match(/title="([^"]+)"/)?.[1]?.trim() ?? "";
    const photos = block.match(/album__photonumber">([^<]+)<\/div>/)?.[1]?.trim() ?? "";
    const cover = block.match(/data-src="([^"]+)"/)?.[1] ?? "";
    rows.push({
      rawTitle: title,
      category,
      photos,
      cover,
      albumUrl: `https://daguanlan.x.yupoo.com${href}`,
    });
  }
  return rows;
}

function cleanModel(title) {
  const code = title.match(/^\s*(\d+[A-Z]?)/)?.[1] ?? "";
  let model = title.replace(/^\s*\d+[A-Z]?\s*/, "").trim();
  const replacements = [
    [/乔11-低帮/g, "Jordan 11 Low"],
    [/乔11/g, "Jordan 11"],
    [/乔3/g, "Jordan 3"],
    [/乔4/g, "Jordan 4"],
    [/乔-40代/g, "Jordan 40"],
    [/乔丹38代低帮/g, "Jordan 38 Low"],
    [/乔丹38代/g, "Jordan 38"],
    [/乔37 代/g, "Jordan 37"],
    [/昂跑/g, "On"],
    [/波士顿13X/g, "Boston 13 X"],
    [/莎布丽娜|萨布丽娜/g, "Sabrina"],
    [/莫兰特/g, "Ja Morant"],
    [/爱德华兹/g, "Anthony Edwards"],
    [/字母哥/g, "Giannis"],
    [/杜兰特/g, "Kevin Durant"],
    [/科比/g, "Kobe"],
    [/布克/g, "Booker"],
    [/东契奇/g, "Luka Doncic"],
    [/精准/g, "Nike Precision"],
    [/詹姆斯/g, "LeBron"],
    [/哈登/g, "Harden"],
    [/塔图姆/g, "Tatum"],
    [/库里/g, "Curry"],
    [/利拉德/g, "Lillard"],
    [/威尔逊/g, "Wilson"],
    [/哈利伯顿|哈里伯顿/g, "Haliburton"],
    [/鲍尔/g, "LaMelo Ball"],
    [/锡安/g, "Zion"],
    [/文班/g, "Wembanyama"],
    [/威少/g, "Westbrook"],
    [/欧文/g, "Kyrie"],
    [/美津浓/g, "Mizuno"],
    [/阿迪达斯/g, "Adidas"],
    [/锐步/g, "Reebok"],
    [/代/g, ""],
    [/支线/g, "line"],
    [/低帮/g, "Low"],
    [/高帮/g, "High"],
    [/一/g, "1"],
    [/二/g, "2"],
    [/三/g, "3"],
    [/四/g, "4"],
    [/五/g, "5"],
    [/六/g, "6"],
    [/七/g, "7"],
    [/八/g, "8"],
    [/九/g, "9"],
    [/十/g, "10"],
  ];
  for (const [pattern, value] of replacements) model = model.replace(pattern, value);
  model = model.replace(/\s+/g, " ").replace(/-------/g, "").trim();
  return { code, model };
}

function classify(model, category) {
  const m = model.toLowerCase();
  const highPatterns = [
    "jordan 4", "jordan 3", "jordan 11", "kobe 6", "kobe 8", "kobe 9",
    "sabrina 3", "sabrina-4", "sabrina 4", "anthony edwards", "ja morant",
    "booker", "sga", "亚历", "gt future", "gt cut 4", "harden-10", "harden 10",
    "cloudsurfer", "cloud monster", "cloudrunner", "loewe", "pro4", "boston 13",
    "evo sl2", "brooks", "mizuno", "adizero",
  ];
  const mediumPatterns = [
    "kd", "kevin durant", "giannis", "luka", "tatum 3", "tatum-4", "curry",
    "lillard", "haliburton", "gt cut3", "gt street", "lebron 23", "witness 9",
    "a'ja", "阿贾", "nike first", "lamelo", "ball", "cloudultra", "sl exo",
  ];
  const avoidPatterns = [
    "westbrook", "zion 3", "jordan 37", "jordan 38", "fogx", "fog", "cat",
    "reebok", "gt jump", "precision", "lebron 15", "lebron 19", "lebron 21",
  ];
  let level = "Prueba";
  if (highPatterns.some((p) => m.includes(p))) level = "Alta";
  else if (mediumPatterns.some((p) => m.includes(p))) level = "Media";
  if (avoidPatterns.some((p) => m.includes(p))) level = "Baja / solo prueba";

  let segment = category;
  if (/cloud|loewe|adidas|boston|evo|brooks|mizuno|adizero|pro4|sl exo/i.test(model)) {
    segment = "Runner de moda / diario";
  } else if (/jordan|kobe|booker|sabrina|ja morant|anthony|harden|kevin durant|giannis|luka|tatum|curry|gt|lebron|lillard|haliburton|sga|亚历|a'ja|阿贾/i.test(model)) {
    segment = "Basket moda / cancha-calle";
  }
  return { level, segment };
}

function colorsFor(model) {
  const m = model.toLowerCase();
  if (m.includes("jordan 4")) return "White/Cement Grey, Black/Red, Military Blue, Olive, Black/Canvas, Sail/Off-white";
  if (m.includes("jordan 3")) return "White/Cement, Black/Cement, Fire Red, Mocha, Off-white/Gum";
  if (m.includes("jordan 11")) return "Concord, Bred, Cool Grey, Space Jam, Cherry, all-white";
  if (m.includes("kobe")) return "Grinch verde, Reverse Grinch rojo/blanco, Black/Gold, Lakers morado/amarillo, White/Black, Ice Blue";
  if (m.includes("sabrina")) return "Ivory/Black, Light Blue, Pink/White, University Red, Lavender, Grey/Green";
  if (m.includes("anthony edwards")) return "Black/White, Stormtrooper, Acid Orange, Royal Blue, Metallic Silver, Red/Black";
  if (m.includes("ja morant")) return "Purple/Lime, Black/Red, Light Blue, White/Navy, Halloween Orange, mismatched brights";
  if (m.includes("booker")) return "Black/White, Beige/Gum, Orange, Purple, Denim Blue, Cream";
  if (m.includes("亚历") || m.includes("sga")) return "Cream/Black, Metallic Silver, White/Green, Burgundy, Black/Gum";
  if (m.includes("harden")) return "Black/Red, Silver/Black, White/Black, Pink/Lilac, Royal Blue";
  if (m.includes("kevin durant") || m.includes("kd")) return "Black/White, Aunt Pearl pink, Blue/Orange, Red/Black, Grey/Silver";
  if (m.includes("giannis")) return "Black/White, Green, Orange, Royal Blue, Volt accents";
  if (m.includes("luka")) return "White/Black, Teal/Pink, Royal/White, Cream, Red/Black";
  if (m.includes("tatum")) return "White/Black, Pink/Lemonade, Blue, Red/Black, Pale green";
  if (m.includes("curry")) return "White/Gold, Black/White, Blue/Yellow, Grey, Navy";
  if (m.includes("lebron")) return "Black/Gold, Lakers, Red/Black, White/Navy, Cream/Gum";
  if (m.includes("gt")) return "White/Black, Volt, Blue, Orange, Pink/Black, Grey/Silver";
  if (m.includes("lillard")) return "Black/Red, White/Black, Silver, Blue/Orange";
  if (m.includes("haliburton")) return "Black/Yellow, Purple, Royal Blue, White/Green";
  if (m.includes("cloud") || m.includes("on ") || m.includes("loewe")) return "All white, White/Black, Glacier Grey, Pearl/Ivory, Black, Silver, Navy, Cream/Green";
  if (m.includes("adidas") || m.includes("boston") || m.includes("evo") || m.includes("adizero") || m.includes("pro4")) return "Core Black, Cloud White, Silver Metallic, Solar Red/Orange, Lucent Blue, Cream";
  if (m.includes("brooks") || m.includes("mizuno")) return "White/Black, Silver/Grey, Blue, Lime, Black";
  if (m.includes("puma") || m.includes("ball")) return "Neon orange, Purple, Black/White, Blue, Green";
  return "Black/White, White/Grey, Cream/Gum, Navy, Red/Black, Silver";
}

function reasonFor(model, level) {
  const m = model.toLowerCase();
  if (m.includes("cloud") || m.includes("on ") || m.includes("loewe")) return "Runner tecnico para uso diario; fuerte en moda calle y outfits limpios.";
  if (m.includes("jordan")) return "Retro Jordan con demanda constante para temporada alta.";
  if (m.includes("kobe")) return "Linea Kobe mantiene hype fuerte en basketball y calle.";
  if (m.includes("sabrina")) return "Silueta unisex/mujer con buena rotacion y colores faciles.";
  if (m.includes("anthony edwards") || m.includes("ja morant")) return "Firmas jovenes con mucha exposicion y colorways llamativos.";
  if (m.includes("booker") || m.includes("harden") || m.includes("kevin durant") || m.includes("giannis") || m.includes("luka")) return "Firma NBA reconocible, buena para surtido amplio.";
  if (m.includes("adidas") || m.includes("boston") || m.includes("evo") || m.includes("adizero") || m.includes("pro4")) return "Running/performance Adidas en tendencia; colores neutros y metalicos venden facil.";
  if (level.startsWith("Baja")) return "Mantener solo como prueba: menos moda actual o mas riesgo de rotacion lenta.";
  return "Complemento util para variedad sin depender solo de Jordan/Kobe.";
}

function rankScore(row) {
  const levelScore = row.level === "Alta" ? 300 : row.level === "Media" ? 200 : row.level.startsWith("Baja") ? 20 : 100;
  const photoScore = Math.min(Number(row.photos || 0), 60);
  return levelScore + photoScore;
}

async function fetchImageDataUrl(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://daguanlan.x.yupoo.com/",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

function cellRef(row, col) {
  let n = col + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return `${s}${row + 1}`;
}

function styleSheet(sheet, usedRange) {
  sheet.showGridLines = false;
  usedRange.format.font = { name: "Aptos", size: 10, color: "#1F2937" };
}

function writeSheet(sheet, title, subtitle, headers, rows, options = {}) {
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange("A1:H1").merge();
  sheet.getRange("A2:H2").merge();
  sheet.getRange("A1").format = {
    fill: "#111827",
    font: { bold: true, color: "#FFFFFF", size: 16 },
  };
  sheet.getRange("A2").format = {
    fill: "#E5E7EB",
    font: { color: "#374151", italic: true },
  };
  const startRow = 4;
  sheet.getRangeByIndexes(startRow, 0, 1, headers.length).values = [headers];
  sheet.getRangeByIndexes(startRow, 0, 1, headers.length).format = {
    fill: "#0F766E",
    font: { bold: true, color: "#FFFFFF" },
    borders: { preset: "outside", style: "thin", color: "#0F766E" },
  };
  if (rows.length) {
    sheet.getRangeByIndexes(startRow + 1, 0, rows.length, headers.length).values = rows;
    const dataRange = sheet.getRangeByIndexes(startRow + 1, 0, rows.length, headers.length);
    dataRange.format = {
      borders: {
        insideHorizontal: { style: "thin", color: "#E5E7EB" },
        bottom: { style: "thin", color: "#D1D5DB" },
      },
      wrapText: true,
      verticalAlignment: "top",
    };
    if (options.tableName) {
      const end = cellRef(startRow + rows.length, headers.length - 1);
      const table = sheet.tables.add(`A${startRow + 1}:${end}`, true, options.tableName);
      table.showFilterButton = true;
      table.showBandedRows = true;
    }
  }
  sheet.freezePanes.freezeRows(startRow + 1);
  styleSheet(sheet, sheet.getRangeByIndexes(0, 0, Math.max(rows.length + startRow + 1, 6), headers.length));
}

const albums = [];
for (const src of sourceFiles) {
  const html = await fs.readFile(src.file, "utf8");
  albums.push(...parseAlbums(html, src.category));
}

const enriched = albums.map((album) => {
  const { code, model } = cleanModel(album.rawTitle);
  const { level, segment } = classify(model, album.category);
  return {
    ...album,
    code,
    model,
    level,
    segment,
    colors: colorsFor(model),
    reason: reasonFor(model, level),
  };
}).sort((a, b) => rankScore(b) - rankScore(a));

const machete = enriched.filter((row) => row.level === "Alta" || row.level === "Media" || row.level === "Prueba").slice(0, 85);
const catalog = enriched;

await fs.mkdir(outputDir, { recursive: true });
const workbook = Workbook.create();

const main = workbook.worksheets.add("Machete moda");
const mainHeaders = ["Nivel", "Segmento", "Referencia", "Modelo", "Colores recomendados", "Motivo", "Album Yupoo", "Captura"];
const mainRows = machete.map((r) => [r.level, r.segment, r.code, r.model, r.colors, r.reason, r.albumUrl, ""]);
writeSheet(
  main,
  "Machete de referencias para diciembre",
  "Sin cantidades. Ordenado por prioridad de moda/rotacion: Alta, Media y Prueba.",
  mainHeaders,
  mainRows,
  { tableName: "MacheteModa" },
);
main.getRange("A:A").format.columnWidthPx = 110;
main.getRange("B:B").format.columnWidthPx = 145;
main.getRange("C:C").format.columnWidthPx = 90;
main.getRange("D:D").format.columnWidthPx = 210;
main.getRange("E:E").format.columnWidthPx = 310;
main.getRange("F:F").format.columnWidthPx = 260;
main.getRange("G:G").format.columnWidthPx = 245;
main.getRange("H:H").format.columnWidthPx = 95;
main.getRangeByIndexes(5, 0, machete.length, 8).format.rowHeightPx = 76;
main.getRange(`A6:A${5 + machete.length}`).conditionalFormats.add("containsText", {
  text: "Alta",
  format: { fill: "#DCFCE7", font: { bold: true, color: "#166534" } },
});
main.getRange(`A6:A${5 + machete.length}`).conditionalFormats.add("containsText", {
  text: "Media",
  format: { fill: "#FEF3C7", font: { bold: true, color: "#92400E" } },
});
main.getRange(`A6:A${5 + machete.length}`).conditionalFormats.add("containsText", {
  text: "Prueba",
  format: { fill: "#E0F2FE", font: { bold: true, color: "#075985" } },
});

const coverLimit = Math.min(machete.length, 85);
for (let i = 0; i < coverLimit; i += 1) {
  const dataUrl = await fetchImageDataUrl(machete[i].cover);
  if (!dataUrl) continue;
  main.images.add({
    dataUrl,
    anchor: {
      from: { row: 5 + i, col: 7, rowOffsetPx: 4, colOffsetPx: 8 },
      extent: { widthPx: 72, heightPx: 68 },
    },
  });
}

const full = workbook.worksheets.add("Catalogo completo");
const fullHeaders = ["Nivel sugerido", "Categoria", "Referencia", "Titulo Yupoo", "Modelo limpio", "Fotos", "Album Yupoo", "Portada URL"];
const fullRows = catalog.map((r) => [r.level, r.category, r.code, r.rawTitle, r.model, Number(r.photos || 0), r.albumUrl, r.cover]);
writeSheet(
  full,
  "Catalogo completo Yupoo",
  "Todas las referencias encontradas en las dos colecciones: running y basketball.",
  fullHeaders,
  fullRows,
  { tableName: "CatalogoCompleto" },
);
full.getRange("A:A").format.columnWidthPx = 125;
full.getRange("B:B").format.columnWidthPx = 160;
full.getRange("C:C").format.columnWidthPx = 90;
full.getRange("D:D").format.columnWidthPx = 220;
full.getRange("E:E").format.columnWidthPx = 220;
full.getRange("F:F").format.columnWidthPx = 70;
full.getRange("G:G").format.columnWidthPx = 250;
full.getRange("H:H").format.columnWidthPx = 250;
full.getRange(`F6:F${5 + fullRows.length}`).setNumberFormat("#,##0");

const guide = workbook.worksheets.add("Guia colores");
const guideHeaders = ["Bloque", "Colores para priorizar", "Donde usarlos", "Notas"];
const guideRows = [
  ["Neutros premium", "All white, white/black, off-white, cream/gum, glacier grey", "On, Adidas running, Jordan 3/4/11, Booker", "Base para vender en diciembre: combinan facil y bajan riesgo."],
  ["Metalicos runner", "Silver metallic, grey/silver, black/silver", "Adidas Pro/Boston/EVO, On, Brooks, Mizuno, GT Future", "Tendencia fuerte en running tecnico y moda calle."],
  ["Basket clasico", "Black/red, white/red, black/gold, royal blue, navy", "Jordan, Kobe, LeBron, KD, Harden", "Colores deportivos faciles para hombre."],
  ["Hype Kobe", "Grinch verde, Reverse Grinch rojo/blanco, Lakers morado/amarillo, icy blue", "Kobe 4/6/8/9 y similares", "No traer demasiadas variantes raras; estas son las mas reconocibles."],
  ["Mujer/unisex", "Pink/white, lavender, light blue, ivory/black, grey/green", "Sabrina, A'ja Wilson, AE, runners On", "Sirven para diciembre por regalo y outfits claros."],
  ["Color pop controlado", "Volt/lime, orange, teal/pink, purple/lime", "Ja, AE, GT Cut, Giannis, Puma", "Usar como acento de moda; no reemplaza los neutros."],
  ["Evitar volumen", "Marron oscuro pesado, combinaciones muy raras, full neon sin contraste", "Modelos lentos o muy deportivos", "Solo prueba si ya tienes cliente fijo."],
];
writeSheet(
  guide,
  "Guia de colores de moda",
  "Paleta practica para seleccionar colorways dentro de cada album.",
  guideHeaders,
  guideRows,
  { tableName: "GuiaColores" },
);
guide.getRange("A:A").format.columnWidthPx = 155;
guide.getRange("B:B").format.columnWidthPx = 360;
guide.getRange("C:C").format.columnWidthPx = 260;
guide.getRange("D:D").format.columnWidthPx = 330;
guide.getRangeByIndexes(5, 0, guideRows.length, 4).format.rowHeightPx = 58;

const src = workbook.worksheets.add("Fuentes");
src.getRange("A1").values = [["Fuentes usadas"]];
src.getRange("A1").format = { fill: "#111827", font: { bold: true, color: "#FFFFFF", size: 14 } };
src.getRange("A2:A6").values = trendSources.map((s) => [s]);
src.getRange("A:A").format.columnWidthPx = 720;
src.showGridLines = false;

for (const sheetName of ["Machete moda", "Catalogo completo", "Guia colores", "Fuentes"]) {
  const blob = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, `${sheetName.replaceAll(" ", "_")}.png`), new Uint8Array(await blob.arrayBuffer()));
}

const inspect = await workbook.inspect({
  kind: "table",
  sheetId: "Machete moda",
  range: "A1:H20",
  include: "values",
  tableMaxRows: 20,
  tableMaxCols: 8,
  maxChars: 5000,
});
console.log(inspect.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
const outPath = path.join(outputDir, "machete_referencias_yupoo_diciembre.xlsx");
await xlsx.save(outPath);
console.log(outPath);
