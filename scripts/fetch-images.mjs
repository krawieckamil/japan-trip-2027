#!/usr/bin/env node
// Pulls representative photos for cities and attractions from Wikimedia Commons
// (via the MediaWiki Action API) and writes them to src/data/images.json.
// No API key: public API, CC-licensed images hosted on upload.wikimedia.org.
// Docs: https://www.mediawiki.org/wiki/API:Images · API:Imageinfo · API:Pageimages
//
// Usage:
//   node scripts/fetch-images.mjs --out src/data/images.json
//
// Keys must match runtime lookup in src/data/trip.ts: cities by slug, places by
// the exact Tripsy activity name. Restaurants/notes are intentionally omitted —
// they keep the Google-images fallback link.

const API = "https://en.wikipedia.org/w/api.php";
const UA = "japan-trip-2027/1.0 (https://github.com/krawieckamil/japan-trip-2027; trip planner)";

const PER_CITY = 8;
const PER_PLACE = 5;
const MIN_WIDTH = 1000;
const GRID_WIDTH = 480;
const LARGE_WIDTH = 1600;

/* Miasto → artykuły Wikipedii dające ładne, reprezentatywne kadry (skyline + ikony). */
const CITY_SOURCES = {
  tokyo: ["Tokyo Skytree", "Shibuya Crossing", "Tokyo Tower", "Sensō-ji"],
  kyoto: ["Kinkaku-ji", "Fushimi Inari-taisha", "Kiyomizu-dera", "Arashiyama"],
  osaka: ["Osaka Castle", "Dōtonbori", "Osaka"],
  fukuoka: ["Fukuoka", "Fukuoka Tower", "Ōhori Park", "Dazaifu Tenmangū"],
  beppu: ["Beppu", "Hells of Beppu", "Mount Tsurumi (Ōita)"],
};

/* Atrakcja (dokładna nazwa aktywności z Tripsy) → artykuły źródłowe. */
const PLACE_SOURCES = {
  "Senso-ji (Asakusa)": ["Sensō-ji"],
  "Hamarikyu Gardens + matcha w pawilonie": ["Hama-rikyū Gardens"],
  Akihabara: ["Akihabara"],
  "Meiji Jingu": ["Meiji Shrine"],
  "Harajuku (Takeshita-dori) + Omotesando": ["Harajuku", "Omotesandō"],
  "Nezu Museum (Aoyama)": ["Nezu Museum"],
  "Shibuya Crossing + Shibuya Sky": ["Shibuya Crossing", "Shibuya Scramble Square"],
  "teamLab Planets": ["teamLab", "teamLab Borderless"],
  "Muzeum Narodowe w Tokio (Ueno)": ["Tokyo National Museum"],
  "Ameya-Yokocho - targ pod torami (kolacja)": ["Ameyoko"],
  "Nishiki Market - lunch na stojąco": ["Nishiki Market"],
  "Kinkaku-ji (Złoty Pawilon)": ["Kinkaku-ji"],
  "Ryoan-ji (ogród zen)": ["Ryōan-ji"],
  "Kiyomizu-dera + Sannenzaka / Ninenzaka": ["Kiyomizu-dera"],
  "Fushimi Inari Taisha": ["Fushimi Inari-taisha"],
  "Arashiyama (bambusowy gaj)": ["Arashiyama", "Sagano Bamboo Forest"],
  "Gion (dzielnica gejsz)": ["Gion"],
  "Nara - daytrip (Todai-ji + park z jeleniami)": ["Tōdai-ji", "Nara Park"],
  Dotonbori: ["Dōtonbori"],
  "Zamek Himeji (daytrip z Osaki)": ["Himeji Castle"],
  "Kobe - dzielnica Kitano Ijinkan": ["Kitano-chō", "Kobe"],
  "Dazaifu - Tenmangu + Muzeum Narodowe Kyushu": ["Dazaifu Tenmangū", "Kyushu National Museum"],
  "Yatai w Nakasu (uliczne bary)": ["Yatai (food cart)", "Nakasu"],
  "Takachiho - wąwóz, łódki, kolejka Amaterasu (wycieczka)": ["Takachiho Gorge", "Takachiho, Miyazaki"],
  "Beppu - piekla (jigoku) + onsen": ["Hells of Beppu", "Beppu"],
  "Kamakura - Wielki Budda (Kotoku-in)": ["Kōtoku-in", "Kamakura"],
  "Hokokuji - gaj bambusowy + matcha (Kamakura)": ["Hōkoku-ji"],
  "Muzeum Narodowe w Tokio (Ueno) - alternatywa 25.05": ["Tokyo National Museum"],
};

/* Odsiew nie-zdjęć: ikony, mapy, flagi, herby, diagramy, logotypy. */
const JUNK =
  /commons-logo|wiki|[-_ ]icon|icon[-_ ]|logo|flag[ _]|coat[ _.]of[ _.]arms|\bseal\b|emblem|symbol|disambig|ambox|edit[-_]|arrow|pictogram|pog\.|globe|compass|diagram|floor[ _]?plan|nuvola|crystal[ _]|folder|question|padlock|lock[-_]|rating|qsicon|gnome|blank|spacer|transparent|_map|map_|location|locator/i;

function parseArgs(argv) {
  const args = { out: "src/data/images.json" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--out") args.out = argv[++i];
  }
  return args;
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function stripHtml(s) {
  return (s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* Miniatura o zadanej szerokości — Wikimedia pozwala przeskalować przez podmianę `<W>px-`. */
function atWidth(thumbUrl, width) {
  return thumbUrl.replace(/\/\d+px-/, `/${width}px-`);
}

async function leadImage(title) {
  const d = await api({
    action: "query",
    redirects: "1",
    titles: title,
    prop: "pageimages",
    piprop: "original",
  });
  const page = Object.values(d.query?.pages ?? {})[0];
  return page?.original?.source ?? null;
}

async function imageTitles(title) {
  const names = [];
  let cont;
  do {
    const d = await api({
      action: "query",
      redirects: "1",
      titles: title,
      prop: "images",
      imlimit: "100",
      ...(cont ?? {}),
    });
    const page = Object.values(d.query?.pages ?? {})[0];
    for (const im of page?.images ?? []) names.push(im.title);
    cont = d.continue;
  } while (cont);
  return names;
}

async function imageInfo(fileTitles) {
  const out = new Map();
  for (let i = 0; i < fileTitles.length; i += 40) {
    const batch = fileTitles.slice(i, i + 40);
    const d = await api({
      action: "query",
      titles: batch.join("|"),
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: String(LARGE_WIDTH),
      iiextmetadatafilter: "Artist|LicenseShortName",
    });
    for (const page of Object.values(d.query?.pages ?? {})) {
      const ii = page.imageinfo?.[0];
      if (ii) out.set(page.title, ii);
    }
  }
  return out;
}

function toImage(ii) {
  if (!ii || ii.mime !== "image/jpeg") return null;
  if (!ii.thumburl || (ii.width ?? 0) < MIN_WIDTH) return null;
  const meta = ii.extmetadata ?? {};
  return {
    thumb: atWidth(ii.thumburl, GRID_WIDTH),
    large: ii.thumburl,
    w: ii.thumbwidth,
    h: ii.thumbheight,
    credit: stripHtml(meta.Artist?.value) || "Wikimedia Commons",
    license: stripHtml(meta.LicenseShortName?.value) || "",
    page: ii.descriptionurl || "",
  };
}

async function collect(sources, cap) {
  const leads = new Set();
  const fileNames = [];
  for (const title of sources) {
    try {
      const lead = await leadImage(title);
      const names = await imageTitles(title);
      if (lead) {
        const leadFile = "File:" + decodeURIComponent(lead.split("/").pop()).replace(/_/g, " ");
        leads.add(leadFile);
      }
      for (const n of names) {
        if (!JUNK.test(n)) fileNames.push(n);
      }
    } catch (err) {
      console.error(`  ! ${title}: ${err.message}`);
    }
  }

  const unique = [...new Set(fileNames)];
  const info = await imageInfo(unique);

  const images = [];
  for (const [file, ii] of info) {
    const img = toImage(ii);
    if (img) images.push({ file, img, lead: leads.has(file) });
  }

  images.sort((a, b) => {
    if (a.lead !== b.lead) return a.lead ? -1 : 1;
    return (b.img.w ?? 0) - (a.img.w ?? 0);
  });

  return images.slice(0, cap).map((x) => x.img);
}

async function main() {
  const { out } = parseArgs(process.argv.slice(2));

  const cities = {};
  for (const [slug, sources] of Object.entries(CITY_SOURCES)) {
    process.stderr.write(`city ${slug} … `);
    cities[slug] = await collect(sources, PER_CITY);
    console.error(`${cities[slug].length} img`);
  }

  const places = {};
  for (const [name, sources] of Object.entries(PLACE_SOURCES)) {
    process.stderr.write(`place ${name} … `);
    const imgs = await collect(sources, PER_PLACE);
    if (imgs.length) places[name] = imgs;
    console.error(`${imgs.length} img`);
  }

  const payload = { fetched_at: new Date().toISOString(), cities, places };
  const fs = await import("node:fs/promises");
  await fs.writeFile(out, JSON.stringify(payload, null, 2));
  console.error(`\nWritten to ${out}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
