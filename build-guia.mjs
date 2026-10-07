// Genera site/guia.html a partir de la guía del jugador (Markdown) con la cabecera, menú y pie de villa.html.
// Uso: node build-guia.mjs   (sitio estatico: el resultado es HTML plano, sin scripts ni estilos en linea)
import fs from 'node:fs';
const SRCS = ['A', 'B', 'C'].map((x) => 'C:/Minecraft/Auditoria-Winterland/guia-web/' + x + '.md');
const md = SRCS.map((p) => fs.readFileSync(p, 'utf8')).join(String.fromCharCode(10)).split(String.fromCharCode(13)).join('').split(String.fromCharCode(10));
const esc = (s) => s.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;');
function inline(t) {
  let s = esc(t);
  // `code`
  let out = '', i = 0;
  while (i < s.length) {
    if (s[i] === '`') { const j = s.indexOf('`', i + 1); if (j > 0) { out += '<code>' + s.slice(i + 1, j) + '</code>'; i = j + 1; continue; } }
    if (s.startsWith('**', i)) { const j = s.indexOf('**', i + 2); if (j > 0) { out += '<b>' + inline(s.slice(i + 2, j).split('&amp;').join('&')) + '</b>'; i = j + 2; continue; } }
    if (s[i] === '*' && s[i + 1] !== ' ') { const j = s.indexOf('*', i + 1); if (j > 0) { out += '<i>' + s.slice(i + 1, j) + '</i>'; i = j + 1; continue; } }
    out += s[i]; i++;
  }
  return out;
}
const slug = (t) => t.toLowerCase().normalize('NFD').split('').filter((c) => !/[\u0300-\u036f]/.test(c)).join('').split('').map((c) => (/[a-z0-9]/.test(c) ? c : '-')).join('').split('-').filter(Boolean).join('-');
let html = '', i = 0, inList = null;
const closeList = () => { if (inList) { html += '</' + inList + '>\n'; inList = null; } };
const toc = [];
// saltar el titulo principal y la linea de cursiva inicial
while (i < md.length) {
  const l = md[i];
  if (l.startsWith('# ')) { i++; continue; }
  if (l.trim() === '---' || l.trim() === '') { closeList(); i++; continue; }
  if (l.startsWith(String.fromCharCode(96).repeat(3))) { closeList(); const buf = []; i++; while (i < md.length && !md[i].startsWith(String.fromCharCode(96).repeat(3))) { buf.push(md[i]); i++; } i++; html += '<pre class="g-pre">' + esc(buf.join(String.fromCharCode(10))) + '</pre>' + String.fromCharCode(10); continue; }
  if (l.trim() === '[[MAPA_VILLA]]') {
    closeList();
    html += `<div class="vm-legend" id="villa-legend"></div>
<div class="vm" id="villa-map" role="region" aria-label="Mapa de la Villa"><p class="empty">Cargando mapa…</p></div>
<p class="vm-note">Norte arriba, la Z crece hacia abajo. Centro de la plaza: X 1408, Z 1340.</p>
<h3 class="g-h3">Las 28 parcelas</h3>
<div class="vm-table g-table"><table><thead><tr><th>#</th><th>Calle</th><th>Tamaño</th><th>Medidas</th><th>Categoría</th><th>X</th><th>Z</th><th>Centro</th></tr></thead><tbody id="villa-rows"></tbody></table></div>
`;
    i++; continue;
  }
  if (l.startsWith('## ')) { closeList(); const t = l.slice(3).trim(); const id = slug(t); toc.push([id, t]); html += `<h2 id="${id}" class="g-h2">${inline(t)}</h2>\n`; i++; continue; }
  if (l.startsWith('### ')) { closeList(); html += `<h3 class="g-h3">${inline(l.slice(4).trim())}</h3>\n`; i++; continue; }
  if (l.startsWith('> ')) { closeList(); html += `<div class="g-note">${inline(l.slice(2))}</div>\n`; i++; continue; }
  if (l.startsWith('|')) {
    closeList();
    const rows = [];
    while (i < md.length && md[i].startsWith('|')) { rows.push(md[i]); i++; }
    const cells = (r) => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    const head = cells(rows[0]); const body = rows.slice(2).map(cells);
    html += '<div class="vm-table g-table"><table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' + body.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>\n';
    continue;
  }
  const num = /^(\d+)\. (.*)$/.exec(l);
  if (num) { if (inList !== 'ol') { closeList(); html += '<ol class="vm-list">'; inList = 'ol'; } html += `<li>${inline(num[2])}</li>`; i++; continue; }
  if (l.startsWith('- ')) { if (inList !== 'ul') { closeList(); html += '<ul class="vm-list">'; inList = 'ul'; } html += `<li>${inline(l.slice(2))}</li>`; i++; continue; }
  closeList();
  html += `<p>${inline(l)}</p>\n`; i++;
}
closeList();

const v = fs.readFileSync('site/reglas.html', 'utf8');
let head = v.slice(0, v.indexOf('<main id="contenido">'));
const foot2 = v.slice(v.indexOf('</main>') + '</main>'.length);
head = head.split('Reglas | ORGIADECEMBRINA').join('Guía del jugador | ORGIADECEMBRINA')
  .split('Reglas del servidor de Minecraft ORGIADECEMBRINA.').join('Guía completa para jugar en ORGIADECEMBRINA: del primer día al endgame.')
  .split('server-sand-rho.vercel.app/reglas').join('server-sand-rho.vercel.app/guia')
  .split('<a href="reglas.html" aria-current="page">REGLAS</a>').join('<a href="reglas.html">REGLAS</a>')
  .split('<script src="js/main.js" defer></script>').join('<script src="js/main.js" defer></script>' + String.fromCharCode(10) + '<script src="js/villa.js" defer></script>')
  .split('<li><a href="guia.html">GUÍA</a></li>').join('<li><a href="guia.html" aria-current="page">GUÍA</a></li>');
const tocHtml = '<nav class="g-toc" aria-label="Índice de la guía">' + toc.map(([id, t]) => `<a href="#${id}">${esc(t.split(String.fromCharCode(40))[0].trim().split(String.fromCharCode(183))[0].trim())}</a>`).join('') + '</nav>';
const main = `<main id="contenido">

<section class="page-hero">
  <div class="wrap">
    <span class="kicker pixel">Del primer día al endgame</span>
    <h1 class="title" data-size="lg">GUÍA DEL JUGADOR</h1>
    <p class="lead mx">Un mundo de invierno eterno, 250 mods y unos 16 amigos. Todo lo que necesitas saber, del primer minuto al último reto.</p>
  </div>
</section>
<section>
  <div class="wrap g-wrap">
    ${tocHtml}
    ${html}
  </div>
</section>
</main>`;
fs.writeFileSync('site/guia.html', head + main + foot2);

let css = fs.readFileSync('site/css/style.css', 'utf8');
if (!css.includes('/* ---- Guia del jugador ---- */')) {
  css += `
/* ---- Guia del jugador ---- */
.g-wrap { max-width: 920px; }
.g-toc { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 0 0 30px; }
.g-toc a { padding: 6px 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--glass); color: var(--muted); font: 600 .78rem var(--font-display); letter-spacing: .08em; }
.g-toc a:hover { color: #fff; border-color: rgba(160, 200, 255, .4); }
.g-h2 { font-size: clamp(1.5rem, 3.4vw, 2.1rem); margin: 52px 0 14px; padding-top: 6px; border-top: 1px solid var(--line); }
.g-h3 { font-size: 1.15rem; margin: 26px 0 8px; color: var(--ice); }
.g-wrap p { color: var(--muted); }
.g-wrap p b, .g-wrap li b { color: #fff; }
.g-note { margin: 18px 0; padding: 14px 18px; border-radius: 12px; border: 1px dashed rgba(255, 207, 138, .5); background: rgba(255, 207, 138, .06); color: #ffe6c2; font-size: .95rem; }
.g-table { margin: 14px 0 22px; }
.g-wrap code { font: 600 .85em var(--font-body); background: rgba(143, 216, 255, .1); border: 1px solid var(--line); border-radius: 6px; padding: 1px 6px; color: var(--ice); }
.g-pre { margin: 14px 0 22px; padding: 16px 18px; border-radius: 12px; border: 1px solid var(--line); background: rgba(255, 255, 255, .04); color: var(--ice); font: 500 .9rem/1.5 var(--font-body); overflow-x: auto; white-space: pre; }
.g-table td, .g-table th { white-space: normal; vertical-align: top; }
`;
  fs.writeFileSync('site/css/style.css', css);
}
console.log('guia.html', (head + main + foot2).length, 'bytes; secciones:', toc.map((x) => x[1]).join(' | '));
