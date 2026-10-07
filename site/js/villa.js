/* Mapa de la villa: lee data/villa.json y dibuja el plano (SVG) y la tabla. Sin innerHTML: solo textContent y atributos. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const S = 6, P = 34;
  const svgEl = (tag, attrs, text) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
    if (text != null) e.textContent = text;
    return e;
  };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const KIND = { small: 'Pequeña', medium: 'Mediana', large: 'Grande' };
  const box = document.getElementById('villa-map');
  const legend = document.getElementById('villa-legend');
  const tbody = document.getElementById('villa-rows');
  if (!box) return;

  fetch('data/villa.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : Promise.reject(new Error('villa.json')))).then((v) => {
    const a = v.area, n = a.x2 - a.x1 + 1, W = n * S + P * 2;
    const names = Object.fromEntries(v.streets.map((s) => [s.key, s.name]));

    if (legend) {
      legend.replaceChildren(...v.streets.map((s) => { const i = el('span', 'sw st-' + s.key); const t = el('span', 'lg', s.name); const w = el('span', 'lg-item'); w.append(i, t); return w; }));
    }

    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${W}`, role: 'img', 'aria-label': 'Plano de la villa con sus 28 parcelas numeradas' });
    svg.append(svgEl('rect', { class: 'vm-bg', x: 0, y: 0, width: W, height: W }));
    svg.append(svgEl('rect', { class: 'vm-land', x: P, y: P, width: n * S, height: n * S }));
    for (let o = 0; o <= 160; o += 20) {
      const p = P + o * S;
      svg.append(svgEl('line', { class: 'vm-grid', x1: p, y1: P, x2: p, y2: P + n * S }));
      svg.append(svgEl('line', { class: 'vm-grid', x1: P, y1: p, x2: P + n * S, y2: p }));
      svg.append(svgEl('text', { class: 'vm-axis', x: p, y: P - 10, 'text-anchor': 'middle' }, a.x1 + o));
      svg.append(svgEl('text', { class: 'vm-axis', x: P - 8, y: p + 4, 'text-anchor': 'end' }, a.z1 + o));
    }
    const cx = P + (v.plaza.x - a.x1 + 0.5) * S, cz = P + (v.plaza.z - a.z1 + 0.5) * S;
    svg.append(svgEl('circle', { class: 'vm-plaza', cx, cy: cz, r: v.plaza.r * S }));
    svg.append(svgEl('text', { class: 'vm-axis', x: cx, y: cz + 4, 'text-anchor': 'middle' }, 'Plaza'));

    for (const p of v.plots) {
      const x = P + (p.x1 - a.x1) * S, y = P + (p.z1 - a.z1) * S, w = (p.x2 - p.x1 + 1) * S, h = (p.z2 - p.z1 + 1) * S;
      const g = svgEl('g', { class: 'vm-plot' });
      g.append(svgEl('title', {}, `Parcela ${p.id} · ${names[p.street]} · ${KIND[p.kind]} ${p.w}×${p.d} · ${p.category} · x ${p.x1}..${p.x2} z ${p.z1}..${p.z2}`));
      g.append(svgEl('rect', { class: 'st-' + p.street, x, y, width: w, height: h, rx: 2 }));
      g.append(svgEl('text', { class: p.kind === 'large' ? 'vm-num big' : 'vm-num', x: x + w / 2, y: y + h / 2 + 5, 'text-anchor': 'middle' }, p.id));
      svg.append(g);
    }
    box.replaceChildren(svg);

    if (tbody) {
      tbody.replaceChildren(...v.plots.map((p) => {
        const tr = el('tr');
        const c = (t, cls) => tr.append(el('td', cls, t));
        c(p.id, 'num'); c(names[p.street]); c(KIND[p.kind]); c(`${p.w}×${p.d}`); c(p.category);
        c(`${p.x1}..${p.x2}`); c(`${p.z1}..${p.z2}`); c(`${Math.round((p.x1 + p.x2) / 2)}, ${Math.round((p.z1 + p.z2) / 2)}`);
        return tr;
      }));
    }
  }).catch(() => box.replaceChildren(el('p', 'empty', 'Mapa no disponible.')));
})();
