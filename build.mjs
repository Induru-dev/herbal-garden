// Generates the static site from data/plants.json and data/photos.json.
// Run with:  node build.mjs
import fs from "fs";
import path from "path";

const SITE_NAME = "Herbal Garden";
const SITE_TAGLINE = "Scan, discover and learn about the plants growing around you.";

const plants = JSON.parse(fs.readFileSync("data/plants.json", "utf8"));
const photos = JSON.parse(fs.readFileSync("data/photos.json", "utf8"));

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// *text* in the data marks a scientific name and becomes italic
// **text** becomes bold (used for short labels at the start of a list item)
const rich = (s = "") =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, '<em class="sci">$1</em>');
const sciHtml = (p) => `<em class="sci">${esc(p.sci)}</em>`;

const leafSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 3C11 3 4 8 4 16c0 1.6.4 3 1 4 .6-4 3-8 8-10-4 3-6 6-7 10 1 .6 2.4 1 4 1 8 0 10-9 10-18z"/></svg>`;
const icons = {
  about: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>`,
  identify: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>`,
  uses: `<svg viewBox="0 0 24 24"><path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14z"/><path d="M5 19l7-7"/></svg>`,
  garden: `<svg viewBox="0 0 24 24"><path d="M12 21v-9"/><path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z"/><path d="M6 21h12"/></svg>`,
  safety: `<svg viewBox="0 0 24 24"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/></svg>`,
  flowers: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.5"/><path d="M12 9.5C10 6 10.5 3.5 12 3c1.5.5 2 3 0 6.5zM14.5 12c3.5-2 6-1.5 6.5 0-.5 1.5-3 2-6.5 0zM12 14.5c2 3.5 1.5 6 0 6.5-1.5-.5-2-3 0-6.5zM9.5 12C6 14 3.5 13.5 3 12c.5-1.5 3-2 6.5 0z"/></svg>`,
  note: `<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h5"/></svg>`,
};

function head({ title, description, root }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#1f4d3a">
<link rel="icon" href="${root}assets/leaf.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Noto+Sans+Sinhala:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}assets/style.css">
</head>
<body>
<header class="topbar"><div class="wrap">
  <a class="brand" href="${root}index.html"><span class="brand-mark">${leafSvg}</span><span>${esc(SITE_NAME)}</span></a>
  ${root ? `<a class="pill-link" href="${root}index.html">All plants</a>` : ""}
</div></header>
`;
}

function footer(root, credits) {
  return `<footer><div class="wrap">
  <div class="disclaimer"><strong>Please note:</strong> The information on this site describes traditional uses and is for education only. It is not medical advice. Do not prepare or consume plant remedies without advice from a qualified professional.</div>
  <h3>Photo credits</h3>
  <ul class="credits">${credits}</ul>
  <p style="margin-top:16px">Photos from Wikimedia Commons, used under the licences shown. &copy; ${new Date().getFullYear()} ${esc(SITE_NAME)}</p>
</div></footer>
<div class="lightbox" id="lightbox" aria-hidden="true"><img alt=""></div>
<script src="${root}assets/site.js"></script>
</body>
</html>
`;
}

function creditItem(ph, p) {
  const who = ph.title.startsWith("A hand-book to the flora of Ceylon")
    ? "Plate from Henry Trimen, A Hand-book to the Flora of Ceylon"
    : esc(ph.artist);
  return `<li>${esc(p.name)} (${sciHtml(p)}): ${who}, <a href="${esc(ph.page)}" target="_blank" rel="noopener">${esc(ph.license)}</a></li>`;
}

// ---------- Plant pages ----------
plants.forEach((p, i) => {
  const root = "../../";
  const [ph1, ph2] = photos[p.slug];
  const prev = plants[(i - 1 + plants.length) % plants.length];
  const next = plants[(i + 1) % plants.length];
  // Dummala only has one known image (a botanical plate), so the second frame zooms into its flower and fruit details
  const secondStyle = p.slug === "dummala" ? ' style="object-position: 50% 62%; transform: scale(2.6); transform-origin: 94% 64%;"' : "";

  const facts = [
    ["Local name", `${esc(p.local)} <span class="si">(${esc(p.sinhala)})</span>`],
    ["Scientific", `${sciHtml(p)} ${esc(p.authority)}`],
    ["Family", esc(p.family)],
    ["Plant habit", esc(p.habit)],
  ]
    .map(([k, v]) => `<li><span class="k">${k}</span><span>${v}</span></li>`)
    .join("");

  const list = (arr) => `<ul class="leafy">${arr.map((x) => `<li>${rich(x)}</li>`).join("")}</ul>`;
  const box = (key, title, inner, cls = "") =>
    `<section class="box ${cls} rise d3"><h2><span class="ic">${icons[key]}</span>${title}</h2>${inner}</section>`;

  let sections = "";
  sections += box("about", "About this plant", `<p>${rich(p.about)}</p>`, "wide");
  sections += box("identify", "How to identify it", list(p.identify));
  sections += box("uses", "Traditional uses and importance", list(p.uses));
  const extra = [
    p.flowers && ["flowers", "Flowers and fruits", p.flowers, ""],
    p.garden &&["garden", "Garden notes", p.garden, ""],
    p.note && ["note", "Good to know", p.note, "note"],
    p.safety && ["safety", "Safety note", p.safety, "safety"],
  ].filter(Boolean);
  // Pair boxes two per row; a leftover single box spans the full width
  extra.forEach(([key, title, text, cls], n) => {
    const wide = extra.length % 2 === 1 && n === extra.length - 1 ? " wide" : "";
    sections += box(key, title, `<p>${rich(text)}</p>`, cls + wide);
  });

  const html =
    head({
      title: `${p.name} (${p.sci}) | ${SITE_NAME}`,
      description: `${p.name}, ${p.sci}, known locally as ${p.local}. ${p.about.replace(/\*/g, "")}`,
      root,
    }) +
    `<main class="wrap">
<div class="plant-hero">
  <div class="gallery rise">
    <span class="dot-deco"></span>
    <button class="photo photo-main" data-full="${root}${ph1.src}" aria-label="Enlarge photo 1 of ${esc(p.name)}">
      <img src="${root}${ph1.src}" alt="${esc(p.name)} (${esc(p.sci)}), photo 1" fetchpriority="high">
    </button>
    <button class="photo photo-second" data-full="${root}${ph2.src}" aria-label="Enlarge photo 2 of ${esc(p.name)}">
      <img src="${root}${ph2.src}" alt="${esc(p.name)} (${esc(p.sci)}), photo 2" loading="lazy"${secondStyle}>
    </button>
    <span class="photo-label label-1">Photo 1</span>
    <span class="photo-label label-2">Photo 2</span>
    <svg class="leaf-deco" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 3C11 3 4 8 4 16c0 1.6.4 3 1 4 .6-4 3-8 8-10-4 3-6 6-7 10 1 .6 2.4 1 4 1 8 0 10-9 10-18z"/></svg>
  </div>
  <div class="plant-intro rise d2">
    <span class="card-tag">${esc(p.category)}</span>
    <h1>${esc(p.name)}</h1>
    <div class="sci-line">${sciHtml(p)} <span class="auth">${esc(p.authority)}</span></div>
    <div class="si-big si">${esc(p.sinhala)}</div>
    <ul class="facts">${facts}</ul>
  </div>
</div>
<div class="sections">${sections}</div>
<nav class="pager">
  <a class="prev" href="../${prev.slug}/"><small>Previous plant</small><span>${esc(prev.name)}</span></a>
  <a class="next" href="../${next.slug}/"><small>Next plant</small><span>${esc(next.name)}</span></a>
</nav>
</main>
` +
    footer(root, creditItem(ph1, p) + (ph2.src === ph1.src ? "" : creditItem(ph2, p)));

  const dir = path.join("plants", p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
});

// ---------- Home page ----------
const cards = plants
  .map((p) => {
    const [ph1, ph2] = photos[p.slug];
    const miniStyle = p.slug === "dummala" ? ' style="object-position: 50% 62%; transform: scale(2.6); transform-origin: 94% 64%;"' : "";
    const search = [p.name, p.local, p.sinhala, p.sci, p.family, p.category].join(" ").toLowerCase();
    return `<a class="card rise" href="plants/${p.slug}/" data-search="${esc(search)}">
  <div class="card-img"><img src="${ph1.src}" alt="${esc(p.name)}" loading="lazy"><span class="mini"><img src="${ph2.src}" alt="" loading="lazy"${miniStyle}></span></div>
  <div class="card-body"><span class="card-tag">${esc(p.category)}</span><h2>${esc(p.name)}</h2>${sciHtml(p)}<span class="si">${esc(p.local)} · ${esc(p.sinhala)}</span></div>
</a>`;
  })
  .join("\n");

const allCredits = plants
  .map((p) => {
    const [a, b] = photos[p.slug];
    return creditItem(a, p) + (b.src === a.src ? "" : creditItem(b, p));
  })
  .join("");

fs.writeFileSync(
  "index.html",
  head({ title: `${SITE_NAME} | Plant Guide`, description: SITE_TAGLINE, root: "" }) +
    `<main class="wrap">
<section class="hero rise">
  <span class="eyebrow">${plants.length} plants to discover</span>
  <h1>${esc(SITE_NAME)}</h1>
  <p>${esc(SITE_TAGLINE)} Each plant in the garden has a QR code. Scan it, or pick a plant below.</p>
  <div class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="q" type="search" placeholder="Search by name, Sinhala name or family" aria-label="Search plants"></div>
</section>
<div class="grid" id="grid">
${cards}
</div>
<p class="empty" id="empty">No plants match your search.</p>
</main>
` +
    footer("", allCredits)
);

// ---------- QR code page data ----------
fs.writeFileSync(
  "assets/plants-index.js",
  "window.PLANTS = " +
    JSON.stringify(plants.map((p) => ({ slug: p.slug, name: p.name, sci: p.sci, local: p.local, sinhala: p.sinhala })), null, 1) +
    ";\n"
);

console.log(`Built ${plants.length} plant pages, index.html and assets/plants-index.js`);
