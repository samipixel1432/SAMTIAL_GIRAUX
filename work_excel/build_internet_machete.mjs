import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve("..");
const outputDir = path.join(root, "outputs", "019fe9b4-b5b4-70d1-8653-756d060d51a3");
const imageCachePath = path.join(root, "work_excel", "internet_image_cache.json");

const trendSources = {
  stockx: "https://stockx.com/about/sx-market-insights/big-facts-current-culture-index-2026/",
  stockxBreakout: "https://stockx.com/about/stockx-reveals-breakout-products-and-global-soccer-spending-trends-in-latest-big-facts-report/",
  vogueSpring: "https://www.vogue.com/article/6-sneaker-trends-to-look-out-for-in-2025",
  vogueAutumn: "https://www.vogue.co.uk/article/autumn-2026-trending-trainers",
  whoWhatWear: "https://www.whowhatwear.com/fashion/summer/summer-sneaker-trends-2026",
  sportsBackSchool: "https://www.si.com/fannation/sneakers/news/10-best-back-to-school-shoes-of-2026",
  rackRoomKids: "https://www.rackroomshoes.com/footnotes/trends/kids/back-to-school-shoe-trends-moms-need-to-know",
  nordstromKids: "https://www.nordstrom.com/browse/back-to-school/shoes",
  adidasDrops: "https://www.adidas.com/us/release-dates",
  nbKids: "https://www.newbalance.com/kids/shoes/big-kids/",
};

function sourceFor(brand, segment, audience) {
  const b = brand.toLowerCase();
  const s = segment.toLowerCase();
  if (audience === "Nino") return trendSources.nordstromKids;
  if (b.includes("adidas")) return trendSources.adidasDrops;
  if (b.includes("new balance")) return trendSources.stockx;
  if (b.includes("jordan") || b.includes("nike")) return s.includes("basket") ? trendSources.sportsBackSchool : trendSources.stockx;
  if (b.includes("asics")) return trendSources.stockx;
  if (s.includes("dama") || s.includes("sneakerina") || s.includes("metal")) return trendSources.whoWhatWear;
  if (s.includes("skate") || b.includes("vans") || b.includes("converse")) return trendSources.vogueSpring;
  return trendSources.vogueSpring;
}

function makeSearch(brand, model) {
  const query = encodeURIComponent(`${brand} ${model}`);
  if (brand === "Nike" || brand === "Jordan") return `https://www.nike.com/w?q=${query}`;
  if (brand === "adidas") return `https://www.adidas.com/us/search?q=${query}`;
  if (brand === "New Balance") return `https://www.newbalance.com/search?q=${query}`;
  if (brand === "ASICS") return `https://www.asics.com/us/en-us/search/?q=${query}`;
  if (brand === "On") return `https://www.on.com/en-us/search?q=${query}`;
  if (brand === "HOKA") return `https://www.hoka.com/en/us/search?q=${query}`;
  if (brand === "Salomon") return `https://www.salomon.com/en-us/search?text=${query}`;
  if (brand === "PUMA") return `https://us.puma.com/us/en/search?q=${query}`;
  if (brand === "Vans") return `https://www.vans.com/en-us/search/product?q=${query}`;
  if (brand === "Converse") return `https://www.converse.com/search?q=${query}`;
  if (brand === "Crocs") return `https://www.crocs.com/search?q=${query}`;
  if (brand === "UGG") return `https://www.ugg.com/search?q=${query}`;
  return `https://www.google.com/search?q=${query}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeImageQuery(brand, model) {
  return `${brand} ${model.replace(/\//g, " ")} sneaker shoe product photo side view`.replace(/\s+/g, " ").trim();
}

function fallbackCardDataUrl(row) {
  const colors = {
    Nike: ["#111827", "#E5E7EB", "#DC2626"],
    Jordan: ["#7F1D1D", "#F9FAFB", "#111827"],
    adidas: ["#0F766E", "#F8FAFC", "#111827"],
    "New Balance": ["#374151", "#F3F4F6", "#B91C1C"],
    ASICS: ["#1E40AF", "#EFF6FF", "#111827"],
    On: ["#0F172A", "#F8FAFC", "#94A3B8"],
    HOKA: ["#1D4ED8", "#ECFEFF", "#F97316"],
    Salomon: ["#111827", "#D1FAE5", "#65A30D"],
    PUMA: ["#991B1B", "#FEF2F2", "#111827"],
    Vans: ["#111827", "#F9FAFB", "#D97706"],
    Converse: ["#111827", "#F9FAFB", "#2563EB"],
    Crocs: ["#065F46", "#ECFDF5", "#22C55E"],
    UGG: ["#92400E", "#FEF3C7", "#78350F"],
  }[row.brand] ?? ["#111827", "#F3F4F6", "#6B7280"];
  const brand = row.brand.replace(/&/g, "&amp;");
  const model = row.model.replace(/&/g, "&amp;").slice(0, 36);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="170" viewBox="0 0 240 170">
  <rect width="240" height="170" fill="${colors[1]}"/>
  <rect x="0" y="0" width="240" height="34" fill="${colors[0]}"/>
  <text x="12" y="23" font-family="Arial" font-size="15" font-weight="700" fill="#fff">${brand}</text>
  <path d="M48 106 C82 101,101 89,125 69 C132 63,144 64,153 73 L181 99 C196 102,207 110,211 121 C176 133,90 136,39 124 C36 116,39 109,48 106 Z" fill="#fff" stroke="${colors[0]}" stroke-width="5"/>
  <path d="M59 112 C95 118,151 119,204 113" stroke="${colors[2]}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M103 91 L124 99 M116 82 L136 91 M130 76 L149 86" stroke="${colors[0]}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="154" cy="89" r="4" fill="${colors[2]}"/>
  <text x="12" y="153" font-family="Arial" font-size="13" font-weight="700" fill="${colors[0]}">${model}</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

async function fetchText(url, timeoutMs = 12000) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "en-US,en;q=0.9,es;q=0.7",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function findImageUrl(row) {
  const query = normalizeImageQuery(row.brand, row.model);
  const htmlUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
  const html = await fetchText(htmlUrl, 12000);
  const vqd = html.match(/vqd="([^"]+)"/)?.[1] ?? html.match(/vqd=([\d-]+)/)?.[1];
  if (!vqd) throw new Error("missing vqd");
  await sleep(120);
  const jsonUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${encodeURIComponent(vqd)}&f=,,,&p=1`;
  const payload = JSON.parse(await fetchText(jsonUrl, 15000));
  const results = payload.results ?? [];
  const cleanTokens = `${row.brand} ${row.model}`
    .toLowerCase()
    .replace(/kids|mens|womens|shoe|shoes|sneaker|sneakers|retro|og|low|high|\/|\.|-/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
  const bad = /folliculitis|hair|skin|diagram|vector|cartoon|drawing|clipart|logo/i;
  const scored = results
    .filter((r) => (r.thumbnail || r.image) && !bad.test(`${r.title ?? ""} ${r.url ?? ""} ${r.image ?? ""}`))
    .map((r) => {
      const hay = `${r.title ?? ""} ${r.url ?? ""} ${r.image ?? ""}`.toLowerCase();
      const score = cleanTokens.reduce((acc, token) => acc + (hay.includes(token) ? 1 : 0), 0)
        + (/nike|adidas|jordan|new balance|asics|puma|vans|converse|crocs|ugg|hoka|salomon|on/i.test(hay) ? 1 : 0)
        + ((r.width ?? 0) >= 500 && (r.height ?? 0) >= 400 ? 1 : 0);
      return { r, score };
    })
    .sort((a, b) => b.score - a.score);
  const best = scored[0]?.r;
  return best?.thumbnail || best?.image || null;
}

async function fetchImageDataUrl(url) {
  if (!url) return null;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://duckduckgo.com/" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") || "image/jpeg";
  if (!type.startsWith("image/")) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 1000) return null;
  return `data:${type.split(";")[0]};base64,${buffer.toString("base64")}`;
}

async function loadImageCache() {
  try {
    return JSON.parse(await fs.readFile(imageCachePath, "utf8"));
  } catch {
    return {};
  }
}

async function saveImageCache(cache) {
  await fs.writeFile(imageCachePath, JSON.stringify(cache, null, 2), "utf8");
}

async function enrichRowsWithImages(allRows) {
  const cache = await loadImageCache();
  let done = 0;
  for (const row of allRows) {
    const key = `${row.brand}__${row.model}`;
    if (!cache[key]) {
      try {
        const imageUrl = await findImageUrl(row);
        const dataUrl = await fetchImageDataUrl(imageUrl);
        cache[key] = { imageUrl, dataUrl, fallback: !dataUrl };
      } catch (error) {
        cache[key] = { imageUrl: null, dataUrl: null, fallback: true, error: String(error.message || error) };
      }
      done += 1;
      if (done % 10 === 0) {
        console.log(`image cache ${done} new / ${allRows.length} total`);
        await saveImageCache(cache);
      }
      await sleep(180);
    }
    row.imageUrl = cache[key].imageUrl ?? "";
    row.imageDataUrl = cache[key].dataUrl || fallbackCardDataUrl(row);
  }
  await saveImageCache(cache);
  return allRows;
}

function addVariants(base, variants) {
  return variants.map((v) => ({
    ...base,
    model: v[0],
    colors: v[1],
    priority: v[2] ?? base.priority,
    note: v[3] ?? base.note,
  }));
}

const rows = [];

rows.push(...addVariants({
  audience: "Hombre",
  segment: "Retro Nike/Jordan",
  brand: "Jordan",
  priority: "Alta",
  sizing: "Hombre 39-44 / surtir 40-43",
  note: "Retro con rotacion fuerte; sirve para diciembre y regalo.",
}, [
  ["Air Jordan 4 Retro", "White Cement, Military Blue, Bred, Thunder, Olive, Black Cat, Sail", "Alta"],
  ["Air Jordan 3 Retro", "White Cement, Black Cement, True Blue, Fire Red, Mocha, Craft Ivory", "Alta"],
  ["Air Jordan 1 Low OG", "Black Toe, Shadow, Chicago, Neutral Grey, Mocha, University Blue", "Alta"],
  ["Air Jordan 1 High OG", "Chicago, Bred, Royal, Shadow, Palomino, University Blue", "Media"],
  ["Air Jordan 5 Retro", "Wolf Grey, Grape, Black Metallic, Fire Red, Olive, Burgundy", "Alta"],
  ["Air Jordan 11 Retro / Low", "Concord, Bred, Cool Grey, Space Jam, Cherry, Legend Blue", "Alta"],
  ["Jordan Spizike Low", "Black/Red, White/Cement, University Blue, Olive, Sail", "Media"],
  ["Jordan Jumpman Jack / Travis line", "Sail, Mocha, University Red, Black/White", "Media"],
  ["Jordan Tatum 3/4", "White/Black, Pink Lemonade, Blue Void, Red/Black", "Media"],
  ["Jordan Luka 3/4", "White/Black, Teal/Pink, Blue/White, Red/Black", "Media"],
]));

rows.push(...addVariants({
  audience: "Hombre",
  segment: "Nike lifestyle / runner",
  brand: "Nike",
  priority: "Alta",
  sizing: "Hombre 39-44 / surtir 40-43",
  note: "Nike vuelve fuerte; mezcla de retro, runner y diario.",
}, [
  ["Air Force 1 Low", "Triple White, Black/White, White/Gum, White/Red, White/Blue", "Alta"],
  ["Nike Dunk Low", "Panda, Grey Fog, University Blue, Michigan, Cacao Wow", "Alta"],
  ["Nike Vomero 5", "Photon Dust, Metallic Silver, Black, Light Orewood, Supersonic", "Alta"],
  ["Nike P-6000", "Metallic Silver, White/Black, Platinum Tint, Black/Anthracite", "Alta"],
  ["Nike V5 RNR", "Silver/Black, White/Blue, Black/White, Grey/Green", "Media"],
  ["Nike Shox TL", "Black/Metallic, White/Silver, Orange, Triple Black", "Media"],
  ["Nike Cortez", "Forrest Gump white/red/blue, Black/White, Nylon Blue, Yellow", "Media"],
  ["Nike Field General", "White/Black, White/Red, Gum, University Blue", "Media"],
  ["Nike Air Max DN", "Black/White, Volt, Blue, Silver, All Black", "Media"],
  ["Nike Air Max Plus TN", "Black/Orange, Hyper Blue, Triple Black, Silver", "Media"],
  ["Nike Air Max 95", "Neon, Grey Gradient, Black, Silver, Olive", "Media"],
  ["Nike Air Max 90", "Infrared, White/Black, Grey, Navy, Burgundy", "Media"],
  ["Nike Killshot 2", "Sail/Gum, Navy, Green, Black, Red", "Prueba"],
  ["Nike Mac Attack", "Grey/Black, Red Crush, Sail, Game Royal", "Prueba"],
  ["Nike Total 90 / futbol lifestyle", "White/Black, Silver, Blue, Red", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Hombre",
  segment: "Basket actual",
  brand: "Nike",
  priority: "Alta",
  sizing: "Hombre 39-45 / basket 41-44",
  note: "Firmas actuales con cancha-calle; buenas para jovenes.",
}, [
  ["Nike Kobe 4 Protro", "Carpe Diem, Philly, Girl Dad, Black/Gold, Lakers", "Alta"],
  ["Nike Kobe 5 Protro", "Bruce Lee, Chaos, Lakers, Year of Mamba, X-Ray", "Alta"],
  ["Nike Kobe 6 Protro", "Grinch, Reverse Grinch, Italian Camo, All-Star, Dodgers", "Alta"],
  ["Nike Kobe 8 Protro", "Halo, Venice Beach, Court Purple, Lakers, Aqua", "Alta"],
  ["Nike Kobe 9 Elite/Low", "Masterpiece, Halo, Beethoven, Black/White", "Alta"],
  ["Nike Sabrina 3", "Ivory/Black, Light Blue, Pink, University Red, Lavender", "Alta"],
  ["Nike Ja 2/3", "Purple/Lime, Black/Red, Halloween Orange, Light Blue", "Alta"],
  ["Nike KD 17/18/19", "Aunt Pearl, Black/White, Blue/Orange, Red/Black, Silver", "Media"],
  ["Nike GT Cut 3/4", "White/Black, Volt, Blue, Orange, Pink/Black", "Media"],
  ["Nike GT Future", "Silver, Black/White, Grey, Sail, Metallic Blue", "Alta"],
  ["Nike LeBron 22/23", "Black/Gold, Lakers, White/Navy, Red/Black", "Media"],
  ["Nike A'ja Wilson A'One/A'Two", "Cream/Black, Pink, Silver, Burgundy, White/Green", "Alta"],
]));

rows.push(...addVariants({
  audience: "Hombre",
  segment: "Adidas terrace / moda",
  brand: "adidas",
  priority: "Alta",
  sizing: "Hombre 39-44 / surtir 40-43",
  note: "Terrace, futbol y retro siguen fuertes; faciles para outfits.",
}, [
  ["Samba OG", "White/Black, Black/White, Collegiate Green, Navy, Burgundy", "Alta"],
  ["Samba LT / Pony Hair", "Black/White, Brown Pony, Leopard, Silver, Cream", "Alta"],
  ["Gazelle Indoor", "Blue/Gum, Green/Gum, Burgundy/Gum, Pink, Yellow Butter", "Alta"],
  ["Handball Spezial", "Navy/Gum, Brown, Light Blue, Green, Black/Gum", "Alta"],
  ["Campus 00s", "Grey/White, Black/White, Green, Brown, Blue", "Alta"],
  ["SL 72 RS", "Yellow, Blue, Green, Red, Silver", "Media"],
  ["Tokyo", "Black/White, Silver, Red, Navy, Yellow", "Media"],
  ["Japan", "White/Red, White/Green, Black/White, Cream", "Media"],
  ["Taekwondo", "Black/White, White/Black, Silver, Cream", "Media"],
  ["Superstar", "White/Black, Black/White, Shell Toe Cream, Burgundy", "Media"],
  ["Stan Smith", "White/Green, White/Navy, Cream/Gum, Black", "Prueba"],
  ["Adistar XLG 2.0", "Silver/Grey, White/Black, Cream, Blue, Black", "Media"],
  ["Adizero EVO SL", "Cloud White, Core Black, Silver Metallic, Solar Red", "Alta"],
  ["Boston 12/13", "Core Black, White, Silver, Lucent Blue, Solar Orange", "Media"],
  ["Adios Pro 4", "White/Black, Solar Red, Silver, Black/Green", "Media"],
  ["Bad Bunny BadBo 1.0", "Resilience brown, Black, Cream, Blue, Maroon", "Alta"],
  ["Anthony Edwards AE 1", "MX Charcoal, New Wave, All-Star, Black/White", "Alta"],
  ["Anthony Edwards AE 2", "Multicolor, Black/White, Orange, Blue, Silver", "Alta"],
  ["Harden Vol. 9/10", "Black/Red, Silver/Black, White/Black, Pink, Blue", "Media"],
  ["Dame 9/10", "Black/Red, Blue/Orange, White/Black, Purple", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Hombre",
  segment: "New Balance / ASICS runner",
  brand: "New Balance",
  priority: "Alta",
  sizing: "Hombre 39-44 / surtir 40-43",
  note: "Y2K runner y dad-shoe siguen vendiendo en moda calle.",
}, [
  ["New Balance 530", "White/Silver, White/Navy, Grey, Sea Salt, Beige", "Alta"],
  ["New Balance 9060", "Grey, Sea Salt, Black, Rain Cloud, Moonbeam", "Alta"],
  ["New Balance 1906R", "Silver Metallic, Protection Pack, Black, Navy, Rose", "Alta"],
  ["New Balance 2002R", "Rain Cloud, Protection Pack, Grey, Black, Navy", "Media"],
  ["New Balance 740", "White/Blue, White/Green, Silver, Black, Yellow", "Media"],
  ["New Balance 1000", "Silver/Black, Black, Grey, White/Blue, Cream", "Media"],
  ["New Balance 990v4/v6", "Grey, Navy, Black, Cream, Olive", "Media"],
  ["New Balance 991v2", "Grey, Blue, Black, Brown, Silver", "Prueba"],
  ["New Balance 992", "Grey, Navy, Black, Cream, Green", "Media"],
  ["New Balance 550", "White/Green, White/Red, Navy, Cream, Black", "Media"],
  ["New Balance 327", "White/Black, Navy, Green, Animal Print, Pink", "Media"],
  ["New Balance 574", "Grey, Navy, Black, Burgundy, Green", "Prueba"],
  ["New Balance 204L", "White/Oxford Blue, White/Grey, Pink, Black, Driftwood", "Alta"],
  ["New Balance 2010", "Raincloud, Black, Navy, Shell Pink, Turtledove", "Prueba"],
  ["New Balance Coco CG2", "White/Green, Black, Pink, Blue, Cream", "Media"],
]));

rows.push(...addVariants({
  audience: "Hombre",
  segment: "New Balance / ASICS runner",
  brand: "ASICS",
  priority: "Alta",
  sizing: "Hombre 39-44 / surtir 40-43",
  note: "ASICS esta fuerte por tech runner y comodidad.",
}, [
  ["GEL-Kayano 14", "Cream/Black, Silver, White/Midnight, Birch, Green", "Alta"],
  ["GEL-1130", "White/Silver, Black, Clay Grey, Cream, Blue", "Alta"],
  ["GEL-NYC", "Cream/Oyster, Black/Graphite, Grey, Blue, Green", "Alta"],
  ["GT-2160", "White/Silver, Cream, Black, Blue, Red", "Media"],
  ["GEL-Quantum 360", "Black, Silver, White/Blue, Graphite, Neon", "Media"],
  ["GEL-Nimbus 10.1", "Silver, Cream, Black, Blue, Brown", "Media"],
  ["GEL-Cumulus 16", "White/Silver, Black, Cream, Blue, Green", "Prueba"],
  ["GEL-1120", "White/Silver, Black, Cream, Blue, Red", "Media"],
]));

rows.push(...addVariants({
  audience: "Hombre",
  segment: "Outdoor / gorpcore",
  brand: "On",
  priority: "Alta",
  sizing: "Hombre 39-44 / surtir 40-43",
  note: "Runner tecnico y outdoor siguen como moda diaria.",
}, [
  ["Cloudmonster 2", "All White, Black, Glacier, Cream, Navy", "Alta"],
  ["Cloudsurfer", "White/Black, Pearl/Ivory, Glacier Grey, Blue, Black", "Alta"],
  ["Cloud 6", "Black/White, All White, Navy, Fog, Pearl", "Alta"],
  ["Cloudrunner 2", "Black, White, Glacier, Eclipse, Cream", "Media"],
  ["Cloudtilt", "Loewe white, All Black, Grey, Sand, Green", "Alta"],
  ["Cloudnova", "White/Black, Cream, Black, Denim, Silver", "Media"],
  ["Cloud X 4", "Black/White, White, Silver, Blue, Lime", "Media"],
  ["Cloudswift", "All Black, White/Flame, Navy, Grey, Green", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Hombre",
  segment: "Outdoor / gorpcore",
  brand: "HOKA",
  priority: "Media",
  sizing: "Hombre 39-44 / surtir 40-43",
  note: "Comodidad maximalista; buen nicho adulto y runner.",
}, [
  ["Clifton 10", "Black/White, White, Grey, Blue, Orange", "Media"],
  ["Bondi 9", "All Black, White, Grey, Blue, Cream", "Media"],
  ["Mafate Speed 4", "Lunar Rock, Black, Cream, Orange, Blue", "Alta"],
  ["Speedgoat 6", "Black/Orange, Blue, Green, Grey, Red", "Media"],
  ["Tor Ultra Lo", "Black, Olive, Sand, Brown, Grey", "Alta"],
  ["Hopara / Hopara 2", "Black, Olive, Sand, Cream, Blue", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Hombre",
  segment: "Outdoor / gorpcore",
  brand: "Salomon",
  priority: "Alta",
  sizing: "Hombre 39-44 / surtir 40-43",
  note: "Chunky outdoor y trail como sneaker de moda.",
}, [
  ["XT-6", "Black, White/Lunar Rock, Silver, Olive, Safari", "Alta"],
  ["ACS Pro", "Black, Metal, White, Olive, Brown", "Alta"],
  ["XT-Whisper", "Silver, White, Black, Pastel Blue, Pink", "Media"],
  ["Speedcross 3/6", "Black, Red, Lime, Blue, Grey", "Media"],
  ["XA Pro 3D", "Black, Olive, Silver, Blue, Tan", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Hombre",
  segment: "Skate / retro casual",
  brand: "PUMA",
  priority: "Alta",
  sizing: "Hombre 39-44 / surtir 40-43",
  note: "Siluetas bajas y retro futbol/skate entran fuerte.",
}, [
  ["Speedcat OG", "Black/White, Red/White, Brown, Silver, Pink", "Alta"],
  ["Palermo", "Green/Gum, Blue/Gum, Black/Gum, Red, Cream", "Media"],
  ["Suede XL", "Black/White, Green, Navy, Red, Beige", "Media"],
  ["Mostro", "Black, Silver, Yellow, Red, White", "Prueba"],
  ["LaMelo Ball MB.04/MB.05", "Rick and Morty brights, Blue, Red, Black, Silver", "Media"],
  ["Scoot Zeros", "Black/White, Purple, Red, Blue, Green", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Hombre",
  segment: "Skate / retro casual",
  brand: "Vans",
  priority: "Media",
  sizing: "Hombre 38-44 / surtir 39-42",
  note: "Skate vuelve por minimalismo y colegio.",
}, [
  ["Old Skool 36", "Black/White, Pearlized Black Navy, Gum, Checkerboard", "Alta"],
  ["Knu Skool", "Black/White, Navy, Brown, Checkerboard, Grey", "Media"],
  ["Slip-On Classic", "Checkerboard, Black, White, Leopard, Gum", "Media"],
  ["Authentic", "Black, White, Navy, Red, Natural", "Prueba"],
  ["Sk8-Hi", "Black/White, All Black, Navy, Checkerboard, Red", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Hombre",
  segment: "Skate / retro casual",
  brand: "Converse",
  priority: "Media",
  sizing: "Hombre 38-44 / surtir 39-42",
  note: "High-top retro para moda simple y colegio.",
}, [
  ["Chuck Taylor All Star High", "Black, Optical White, Red, Navy, Cream", "Alta"],
  ["Chuck 70 High", "Black, Parchment, Navy, Egret, Brown", "Alta"],
  ["Chuck 70 Low", "Black, Parchment, White, Green, Navy", "Media"],
  ["Run Star Hike", "Black, White, Platform cream, Red", "Prueba"],
  ["One Star", "Black, Suede Brown, Navy, Green, Cream", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Dama",
  segment: "Dama tendencia / sneakerina",
  brand: "adidas",
  priority: "Alta",
  sizing: "Dama 35-40 / surtir 36-39",
  note: "Dama pide bajos, delgados, satinados, amarillos y blanco/negro.",
}, [
  ["Taekwondo Mei Ballet", "Black/White, White/Black, Silver, Butter Yellow, Pink", "Alta"],
  ["Samba Jane", "Black/White, White/Black, Burgundy, Silver, Cream", "Alta"],
  ["Tokyo", "Silver, Black/White, Red, Navy, Butter Yellow", "Alta"],
  ["Gazelle Indoor", "Butter Yellow, Pink, Burgundy, Green, Blue/Gum", "Alta"],
  ["Samba OG", "White/Black, Black/White, Burgundy, Collegiate Green, Leopard", "Alta"],
  ["SL 72", "Yellow, Blue, Red, Green, Silver", "Media"],
  ["Campus 00s", "Grey, Pink, Burgundy, Cream, Black", "Media"],
  ["Handball Spezial", "Navy/Gum, Brown, Light Blue, Green, Pink", "Media"],
]));

rows.push(...addVariants({
  audience: "Dama",
  segment: "Dama tendencia / metalizado",
  brand: "New Balance",
  priority: "Alta",
  sizing: "Dama 35-40 / surtir 36-39",
  note: "Metalizados, runner slim y Y2K son fuertes en dama.",
}, [
  ["New Balance 530", "White/Silver, Pink, Sea Salt, Beige, Blue", "Alta"],
  ["New Balance 9060", "Moonbeam, Rain Cloud, Pink, Sea Salt, Black", "Alta"],
  ["New Balance 1906R", "Silver Metallic, Rose, Cream, Black, Blue", "Alta"],
  ["New Balance 327", "Animal Print, White/Black, Pink, Navy, Green", "Media"],
  ["New Balance 204L", "White/Oxford Blue, Pink Chalk, Driftwood, Black", "Alta"],
  ["New Balance RC42", "Silver, White, Black, Cream, Red", "Media"],
  ["New Balance 740", "White/Blue, White/Green, Silver, Yellow, Black", "Media"],
  ["New Balance Coco CG2", "White/Green, Pink, Black, Blue, Cream", "Media"],
]));

rows.push(...addVariants({
  audience: "Dama",
  segment: "Dama tendencia / metalizado",
  brand: "ASICS",
  priority: "Alta",
  sizing: "Dama 35-40 / surtir 36-39",
  note: "ASICS funciona por comodidad y look fashion runner.",
}, [
  ["GEL-Kayano 14", "Cream/Black, Silver, White/Blue, Birch, Pink", "Alta"],
  ["GEL-1130", "White/Silver, Cream, Black, Pale Blue, Pink", "Alta"],
  ["GEL-NYC", "Cream/Oyster, White/Green, Grey, Blue, Black", "Alta"],
  ["GT-2160", "White/Silver, Cream, Pink, Blue, Black", "Media"],
  ["GEL-Nimbus 10.1", "Silver, Cream, Blue, Black, Brown", "Media"],
]));

rows.push(...addVariants({
  audience: "Dama",
  segment: "Dama tendencia / lifestyle premium",
  brand: "Nike",
  priority: "Alta",
  sizing: "Dama 35-40 / surtir 36-39",
  note: "Blancos, plataformas y runner silver tienen mucha salida.",
}, [
  ["Air Force 1 Low / Shadow", "Triple White, White/Gum, White/Pink, Sail, Black/White", "Alta"],
  ["Dunk Low", "Panda, Cacao Wow, Grey Fog, Pink Oxford, University Blue", "Alta"],
  ["P-6000", "Metallic Silver, White/Black, Pink, Platinum, Black", "Alta"],
  ["Vomero 5", "Photon Dust, Pink Foam, Metallic Silver, Light Orewood, Black", "Alta"],
  ["Cortez", "White/Red/Blue, Black/White, Pink, Yellow, Nylon Blue", "Media"],
  ["Shox R4/TL", "Silver, White, Black, Red, Orange", "Media"],
  ["Sabrina 3", "Ivory/Black, Pink, Light Blue, Lavender, University Red", "Alta"],
  ["A'ja Wilson A'One", "Cream/Black, Pink, Silver, Burgundy, White/Green", "Alta"],
  ["Jacquemus x Nike Moon / J Force", "White, Black, Silver, Red, Brown", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Dama",
  segment: "Dama tendencia / outdoor-fashion",
  brand: "On",
  priority: "Alta",
  sizing: "Dama 35-40 / surtir 36-39",
  note: "Limpios, comodos y faciles para outfits de diario.",
}, [
  ["Cloud 6", "All White, Black/White, Pearl, Navy, Fog", "Alta"],
  ["Cloudmonster 2", "All White, Cream, Glacier, Black, Blue", "Alta"],
  ["Cloudsurfer", "Pearl/Ivory, White/Black, Glacier Grey, Blue, Black", "Alta"],
  ["Cloudtilt / Loewe x On", "White, Sand, Green, All Black, Grey", "Alta"],
  ["The Roger", "White/Gum, White/Navy, Cream, Black, Pink", "Media"],
]));

rows.push(...addVariants({
  audience: "Dama",
  segment: "Dama tendencia / casual",
  brand: "PUMA",
  priority: "Alta",
  sizing: "Dama 35-40 / surtir 36-39",
  note: "Speedcat y bajos de futbol se ven muy actuales.",
}, [
  ["Speedcat OG", "Red/White, Black/White, Brown, Pink, Silver", "Alta"],
  ["Palermo", "Green/Gum, Blue/Gum, Pink, Red, Cream", "Media"],
  ["Mostro", "Silver, Black, Yellow, Red, White", "Prueba"],
  ["Suede XL", "Pink, Black/White, Green, Navy, Beige", "Media"],
]));

rows.push(...addVariants({
  audience: "Dama",
  segment: "Dama tendencia / casual",
  brand: "Vans",
  priority: "Media",
  sizing: "Dama 35-40 / surtir 36-39",
  note: "Skate, checkerboard y minimalismo blanco/negro.",
}, [
  ["Old Skool 36", "Black/White, Gum, Navy, Checkerboard, Leopard", "Alta"],
  ["Slip-On Classic", "Checkerboard, Black, White, Leopard, Red", "Media"],
  ["Mary Jane / Sport Low", "Black, White, Red, Silver, Leopard", "Media"],
  ["Knu Skool", "Black/White, Pink, Brown, Checkerboard, Navy", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Dama",
  segment: "Dama tendencia / casual",
  brand: "Converse",
  priority: "Alta",
  sizing: "Dama 35-40 / surtir 36-39",
  note: "High-top y plataforma siguen buenos para regalo.",
}, [
  ["Chuck Taylor All Star High", "Black, Optical White, Red, Navy, Cream", "Alta"],
  ["Chuck 70 High", "Black, Parchment, Egret, Burgundy, Brown", "Alta"],
  ["Run Star Hike / Legacy CX", "Black, White, Platform Cream, Pink, Red", "Media"],
  ["Chuck Taylor Lift Platform", "White, Black, Pink, Cream, Glitter/Silver", "Media"],
  ["One Star", "Black, Brown Suede, Navy, Green, Pink", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Nino",
  segment: "Back-to-school / full family",
  brand: "Nike",
  priority: "Alta",
  sizing: "Kids 21-38 / Big kids 35-40",
  note: "Escolar y regalo: velcro/easy-on para pequeños, hype para grandes.",
}, [
  ["Kids Air Force 1 Low EasyOn", "Triple White, White/Black, Black, White/Pink, White/Blue", "Alta"],
  ["Kids Dunk Low", "Panda, Grey Fog, University Blue, Pink, Green", "Alta"],
  ["Kids Vomero 5", "White/Silver, Black, Pink, Blue, Grey", "Alta"],
  ["Kids P-6000", "Silver, White/Black, Pink, Blue, Black", "Alta"],
  ["Kids Shox TL", "Black/Silver, White/Silver, Pink, Orange", "Media"],
  ["Kids Air Max 270", "Black/White, White, Blue, Pink, Red", "Media"],
  ["Kids Air Max 90", "Infrared, White/Black, Pink, Blue, Grey", "Media"],
  ["Kids Court Borough Low", "White/Black, White/Pink, Black, Red, Blue", "Media"],
  ["Nike 23/7.2 EasyOn", "Black/White, Pink, Blue, Grey, Red", "Media"],
  ["Kids Ja / Sabrina / Team Hustle", "Black/Red, Blue, Pink, White/Black, Purple", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Nino",
  segment: "Back-to-school / full family",
  brand: "Jordan",
  priority: "Alta",
  sizing: "Kids 21-38 / Big kids 35-40",
  note: "Jordan en nino funciona por regalo y familia completa.",
}, [
  ["Kids Jordan 1 Low", "Panda, Chicago, University Blue, Pink, Black/Red", "Alta"],
  ["Kids Jordan 3 Retro", "White Cement, Black Cement, True Blue, Fire Red, Pink", "Alta"],
  ["Kids Jordan 4 Retro", "Military Blue, Bred, White Cement, Thunder, Olive", "Alta"],
  ["Kids Jordan 5 Retro", "Wolf Grey, Grape, Fire Red, Black Metallic", "Media"],
  ["Kids Jordan Spizike Low", "Black/Red, White/Cement, University Blue, Pink", "Alta"],
  ["Kids Jordan 11 Low", "Concord, Bred, Cool Grey, Cherry, Legend Blue", "Alta"],
]));

rows.push(...addVariants({
  audience: "Nino",
  segment: "Back-to-school / terrace",
  brand: "adidas",
  priority: "Alta",
  sizing: "Kids 21-38 / Big kids 35-40",
  note: "Adidas para colegio: Samba/Gazelle/Campus faciles de vender.",
}, [
  ["Kids Samba OG", "White/Black, Black/White, Burgundy, Green, Navy", "Alta"],
  ["Kids Samba Jane", "Black/White, White/Black, Burgundy, Silver, Cream", "Alta"],
  ["Kids Gazelle", "Blue, Pink, Green, Black, Burgundy", "Alta"],
  ["Kids Handball Spezial", "Navy/Gum, Light Blue, Green, Brown, Pink", "Media"],
  ["Kids Campus 00s", "Grey, Black, Pink, Green, Navy", "Alta"],
  ["Kids Superstar", "White/Black, Black/White, Pink, Red, Blue", "Media"],
  ["Kids Stan Smith", "White/Green, White/Navy, Pink, Black", "Media"],
  ["Kids AE 1/AE 2", "Multicolor, Orange, Black/White, Blue, Silver", "Alta"],
]));

rows.push(...addVariants({
  audience: "Nino",
  segment: "Back-to-school / runner",
  brand: "New Balance",
  priority: "Alta",
  sizing: "Kids 21-38 / Big kids 35-40",
  note: "Comodidad y moda Y2K para colegio.",
}, [
  ["Kids 530", "White/Silver, Navy, Pink, Grey, Beige", "Alta"],
  ["Kids 9060", "Grey, Black, Pink, Sea Salt, Blue", "Alta"],
  ["Kids 1906R", "Silver/Black, Pink Haze, Black, Blue, Cream", "Alta"],
  ["Kids 2002R", "Grey, Black, Navy, Cream, Pink", "Media"],
  ["Kids 204L", "White/Oxford Blue, White/Grey, Pink, Black, Driftwood", "Alta"],
  ["Kids 2010", "Raincloud, Shell Pink, Black, Navy, Turtledove", "Media"],
  ["Kids 574", "Grey, Navy, Pink, Black, Green", "Media"],
  ["Kids Fresh Foam 625/860", "Black, Grey, Navy, Pink, Blue", "Prueba"],
  ["Kids 440v2 / Jamie Foy 306", "Black/White, Navy, Sea Salt, Dark Moss", "Media"],
]));

rows.push(...addVariants({
  audience: "Nino",
  segment: "Back-to-school / runner",
  brand: "ASICS",
  priority: "Media",
  sizing: "Kids 21-38 / Big kids 35-40",
  note: "ASICS kids se ve por GEL-1130 y runner retro.",
}, [
  ["Kids GEL-1130", "White/Silver, Black, Cream, Pink, Blue", "Alta"],
  ["Kids GEL-NYC", "Cream, Grey, Black, Blue, Green", "Media"],
  ["Kids GT-1000 / Cumulus", "Black, Navy, Pink, Blue, Grey", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Nino",
  segment: "Back-to-school / casual",
  brand: "Converse",
  priority: "Alta",
  sizing: "Kids 21-38 / Big kids 35-40",
  note: "Basico escolar, facil de combinar y buen precio.",
}, [
  ["Kids Chuck Taylor High", "Black, White, Red, Navy, Pink", "Alta"],
  ["Kids Chuck Taylor EVA Lift High", "Black, White, Pink, Glitter/Silver", "Alta"],
  ["Kids Chuck Taylor Low", "Black, White, Navy, Red, Cream", "Media"],
  ["Kids Run Star Hike", "Black, White, Platform Cream, Pink", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Nino",
  segment: "Back-to-school / casual",
  brand: "Vans",
  priority: "Alta",
  sizing: "Kids 21-38 / Big kids 35-40",
  note: "Skate shoes y black/white uniform-approved.",
}, [
  ["Kids Old Skool", "Black/White, Checkerboard, Navy, Pink, Gum", "Alta"],
  ["Kids Slip-On", "Checkerboard, Black, White, Leopard, Red", "Media"],
  ["Kids Knu Skool", "Black/White, Navy, Pink, Brown", "Media"],
  ["Kids Sk8-Hi", "Black/White, Checkerboard, Red, Navy", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Nino",
  segment: "Back-to-school / comfort",
  brand: "On",
  priority: "Media",
  sizing: "Kids 21-38 / Big kids 35-40",
  note: "Cliente premium, colegios y regalo.",
}, [
  ["Kids The Roger", "White/Gum, White/Navy, Cream, Black, Pink", "Media"],
  ["Kids Cloud Play / Cloud Sky", "Black/White, White, Navy, Pink, Grey", "Prueba"],
  ["Kids Cloudhero", "Blue, Pink, Black, White, Green", "Prueba"],
]));

rows.push(...addVariants({
  audience: "Nino",
  segment: "Back-to-school / comfort",
  brand: "Crocs",
  priority: "Media",
  sizing: "Kids 21-38 / adulto 35-44 tambien",
  note: "No es tenis, pero rota duro en nino y regalo con charms.",
}, [
  ["Classic Clog Kids", "Black, White, Navy, Pink, Lime, Tie Dye", "Alta"],
  ["Classic Platform / Crush Clog", "White, Bone, Pink, Black, Lavender", "Media"],
  ["Echo Clog", "Black, Bone, Slate, Green, Orange", "Media"],
]));

rows.push(...addVariants({
  audience: "Nino",
  segment: "Back-to-school / comfort",
  brand: "UGG",
  priority: "Prueba",
  sizing: "Kids 21-38 / dama 35-40",
  note: "Solo para temporada/regalo, no cargar demasiado.",
}, [
  ["Kids Classic Slip-On", "Chestnut, Black, Sand, Pink, Grey", "Prueba"],
  ["Tasman / Tazz kids", "Chestnut, Black, Sand, Pink", "Prueba"],
]));

const allRows = rows.map((row, index) => ({
  ...row,
  id: index + 1,
  source: sourceFor(row.brand, row.segment, row.audience),
  search: makeSearch(row.brand, row.model),
}));

await enrichRowsWithImages(allRows);

const colorGuide = [
  ["Base segura", "White/Black, Triple White, Black/White, Grey, Navy", "Todos", "Ideal para contenedor: baja devolucion visual y combina facil."],
  ["Metalizados", "Silver Metallic, Grey/Silver, Chrome, Platinum", "Dama, runner, New Balance, ASICS, Nike P-6000/Vomero", "Tendencia fuerte 2026."],
  ["Terrace/gum", "Navy/Gum, Brown/Gum, Green/Gum, Burgundy/Gum", "Adidas, Vans, Puma Palermo", "Muy vendible en adulto joven."],
  ["Pasteles dama", "Butter Yellow, Pink, Lavender, Light Blue, Cream", "Dama y nino", "Especial para diciembre/regalo."],
  ["Basket clasico", "Black/Red, Royal Blue, Lakers, White/Navy, Orange", "Hombre basket y joven", "Sirve para modelos firmados y Jordan/Kobe."],
  ["Outdoor", "Olive, Sand, Lunar Rock, Brown, Black, Grey", "Salomon, HOKA, On", "Gorpcore y outfits urbanos."],
  ["Animal/statement", "Leopard, pony hair, checkerboard, red Speedcat", "Dama, Vans, Adidas Samba, Puma", "Solo como acento: no llenar el pedido con esto."],
];

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

function styleHeader(sheet, title, subtitle, widthCols) {
  sheet.showGridLines = false;
  const last = cellRef(0, widthCols - 1).replace(/\d+$/, "");
  sheet.getRange(`A1:${last}1`).merge();
  sheet.getRange(`A2:${last}2`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange("A1").format = {
    fill: "#111827",
    font: { bold: true, color: "#FFFFFF", size: 16 },
  };
  sheet.getRange("A2").format = {
    fill: "#E5E7EB",
    font: { italic: true, color: "#374151" },
  };
}

function writeTable(sheet, title, subtitle, headers, data, tableName) {
  styleHeader(sheet, title, subtitle, headers.length);
  const headerRow = 4;
  sheet.getRangeByIndexes(headerRow, 0, 1, headers.length).values = [headers];
  sheet.getRangeByIndexes(headerRow, 0, 1, headers.length).format = {
    fill: "#0F766E",
    font: { bold: true, color: "#FFFFFF" },
  };
  if (data.length) {
    sheet.getRangeByIndexes(headerRow + 1, 0, data.length, headers.length).values = data;
    const dataRange = sheet.getRangeByIndexes(headerRow + 1, 0, data.length, headers.length);
    dataRange.format = {
      wrapText: true,
      verticalAlignment: "top",
      borders: {
        insideHorizontal: { style: "thin", color: "#E5E7EB" },
        bottom: { style: "thin", color: "#D1D5DB" },
      },
    };
    const end = cellRef(headerRow + data.length, headers.length - 1);
    const table = sheet.tables.add(`A${headerRow + 1}:${end}`, true, tableName);
    table.showFilterButton = true;
    table.showBandedRows = true;
  }
  sheet.freezePanes.freezeRows(headerRow + 1);
  sheet.getRangeByIndexes(0, 0, data.length + headerRow + 1, headers.length).format.font = { name: "Aptos", size: 10, color: "#1F2937" };
}

function applyWidths(sheet, widths) {
  widths.forEach((px, idx) => {
    const col = cellRef(0, idx).replace(/\d+$/, "");
    sheet.getRange(`${col}:${col}`).format.columnWidthPx = px;
  });
}

function applyPriorityFormatting(sheet, dataLength, priorityCol = "A") {
  const range = sheet.getRange(`${priorityCol}6:${priorityCol}${5 + dataLength}`);
  range.conditionalFormats.add("containsText", { text: "Alta", format: { fill: "#DCFCE7", font: { bold: true, color: "#166534" } } });
  range.conditionalFormats.add("containsText", { text: "Media", format: { fill: "#FEF3C7", font: { bold: true, color: "#92400E" } } });
  range.conditionalFormats.add("containsText", { text: "Prueba", format: { fill: "#E0F2FE", font: { bold: true, color: "#075985" } } });
}

function addRowImages(sheet, rows, imageCol = 0) {
  rows.forEach((row, i) => {
    sheet.images.add({
      dataUrl: row.imageDataUrl,
      anchor: {
        from: { row: 5 + i, col: imageCol, rowOffsetPx: 5, colOffsetPx: 8 },
        extent: { widthPx: 92, heightPx: 76 },
      },
    });
  });
}

await fs.mkdir(outputDir, { recursive: true });
const workbook = Workbook.create();

const headers = ["Imagen", "Prioridad", "Cliente", "Segmento", "Marca", "Referencia / modelo", "Colores recomendados", "Talla objetivo", "Por que pedirla", "Fuente tendencia", "Busqueda oficial"];
const matrix = allRows.map((r) => ["", r.priority, r.audience, r.segment, r.brand, r.model, r.colors, r.sizing, r.note, r.source, r.search]);

const main = workbook.worksheets.add("Machete internet");
writeTable(main, "Machete internet para pedido grande", "Referencias actuales para hombre, dama y nino. Sin cantidades.", headers, matrix, "MacheteInternet");
applyWidths(main, [110, 95, 75, 180, 95, 220, 360, 190, 300, 300, 300]);
main.getRangeByIndexes(5, 0, matrix.length, headers.length).format.rowHeightPx = 88;
addRowImages(main, allRows);
applyPriorityFormatting(main, matrix.length, "B");

for (const audience of ["Hombre", "Dama", "Nino"]) {
  const sheet = workbook.worksheets.add(audience);
  const subset = allRows.filter((r) => r.audience === audience);
  const data = subset.map((r) => ["", r.priority, r.segment, r.brand, r.model, r.colors, r.sizing, r.note, r.source, r.search]);
  writeTable(sheet, `Machete ${audience}`, "Misma base filtrada por cliente objetivo.", headers.filter((_, i) => i !== 2), data, `Tabla${audience}`);
  applyWidths(sheet, [110, 95, 190, 95, 225, 360, 190, 300, 300, 300]);
  sheet.getRangeByIndexes(5, 0, data.length, 10).format.rowHeightPx = 88;
  addRowImages(sheet, subset);
  applyPriorityFormatting(sheet, data.length, "B");
}

const guide = workbook.worksheets.add("Guia colores");
writeTable(guide, "Guia de colores", "Paleta practica para seleccionar colorways antes de pedir.", ["Bloque", "Colores", "Usar en", "Nota"], colorGuide, "GuiaColoresInternet");
applyWidths(guide, [150, 370, 260, 380]);
guide.getRangeByIndexes(5, 0, colorGuide.length, 4).format.rowHeightPx = 55;

const summary = workbook.worksheets.add("Resumen");
styleHeader(summary, "Resumen de surtido", "Conteo de referencias por cliente y prioridad.", 6);
summary.getRange("A5:F5").values = [["Cliente", "Alta", "Media", "Prueba", "Total", "Lectura"]];
const audiences = ["Hombre", "Dama", "Nino"];
summary.getRange("A6:A8").values = audiences.map((a) => [a]);
summary.getRange("B6").formulas = [["=COUNTIFS('Machete internet'!$C$6:$C$260,A6,'Machete internet'!$B$6:$B$260,\"Alta\")"]];
summary.getRange("B6:B8").fillDown();
summary.getRange("C6").formulas = [["=COUNTIFS('Machete internet'!$C$6:$C$260,A6,'Machete internet'!$B$6:$B$260,\"Media\")"]];
summary.getRange("C6:C8").fillDown();
summary.getRange("D6").formulas = [["=COUNTIFS('Machete internet'!$C$6:$C$260,A6,'Machete internet'!$B$6:$B$260,\"Prueba\")"]];
summary.getRange("D6:D8").fillDown();
summary.getRange("E6").formulas = [["=SUM(B6:D6)"]];
summary.getRange("E6:E8").fillDown();
summary.getRange("F6:F8").values = [
  ["Base fuerte en retro, runner tecnico y basket."],
  ["Base fuerte en terrace, metalizados, sneakerina y blancos."],
  ["Base fuerte en back-to-school, full family y easy-on."],
];
summary.getRange("A5:F5").format = { fill: "#0F766E", font: { bold: true, color: "#FFFFFF" } };
summary.getRange("A6:F8").format = { borders: { preset: "all", style: "thin", color: "#E5E7EB" }, wrapText: true };
applyWidths(summary, [120, 90, 90, 90, 90, 380]);
summary.showGridLines = false;

const src = workbook.worksheets.add("Fuentes");
const sourceRows = Object.entries(trendSources).map(([name, url]) => [name, url]);
writeTable(src, "Fuentes usadas", "Links base de tendencias y validacion de mercado.", ["Fuente", "URL"], sourceRows, "FuentesInternet");
applyWidths(src, [180, 720]);

for (const sheetName of ["Resumen", "Machete internet", "Hombre", "Dama", "Nino", "Guia colores", "Fuentes"]) {
  const blob = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, `${sheetName.replaceAll(" ", "_")}_internet.png`), new Uint8Array(await blob.arrayBuffer()));
}

const check = await workbook.inspect({
  kind: "table",
  sheetId: "Machete internet",
  range: "A1:K20",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 11,
  maxChars: 5000,
});
console.log(check.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
const outPath = path.join(outputDir, "machete_internet_hombre_dama_nino_con_imagenes.xlsx");
await output.save(outPath);
console.log(outPath);
