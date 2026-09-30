/* ORGIADECEMBRINA — web oficial. Sin dependencias.
 * Todo el contenido editable vive en /data/*.json. Nada de lo que viene de los JSON se inserta como HTML
 * (solo textContent) y los enlaces solo se aceptan si son https. NO consulta el estado del servidor. */
(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PENDING = '[PENDIENTE]';

  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  const httpsUrl = (v) => {
    try { const u = new URL(v); return u.protocol === 'https:' ? u.href : null; } catch { return null; }
  };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const fetchJson = (p) => fetch(p, { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(p))));
  const fmtDate = (iso) => {
    const d = new Date(iso + 'T12:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  /* ---------- NAV ---------- */
  const nav = $('.nav');
  const burger = $('.burger');
  const menu = $('#menu');
  const onScroll = () => {
    nav.classList.toggle('solid', scrollY > 30);
    const mcta = $('.mcta');
    if (mcta) mcta.style.display = scrollY > innerHeight * 0.6 ? '' : 'none';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  burger?.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
  });
  $$('#menu a').forEach((a) => a.addEventListener('click', () => {
    burger?.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
  }));

  /* ---------- REVEAL ---------- */
  const io = 'IntersectionObserver' in window && !reduce
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 })
    : null;
  const watch = (n) => (io ? io.observe(n) : n.classList.add('in'));
  $$('.rv').forEach((n, i) => { n.style.setProperty('--d', `${(i % 4) * 0.08}s`); watch(n); });

  /* ---------- CARD SPOTLIGHT ---------- */
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest?.('.card');
    if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); }
  }, { passive: true });

  /* ---------- PARALLAX (solo hero) ---------- */
  const ridges = $$('.ridge');
  if (ridges.length && !reduce) {
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(scrollY, innerHeight);
        ridges.forEach((r, i) => { r.style.transform = `translate3d(0, ${y * (0.08 + i * 0.09)}px, 0)`; });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- STARS + SNOW (canvas, ligero) ---------- */
  const stars = $('#stars');
  if (stars) {
    const ctx = stars.getContext('2d');
    const draw = () => {
      stars.width = stars.clientWidth; stars.height = stars.clientHeight;
      ctx.clearRect(0, 0, stars.width, stars.height);
      const n = Math.round(stars.width / 9);
      for (let i = 0; i < n; i++) {
        const x = Math.random() * stars.width, y = Math.random() * stars.height * 0.7;
        const s = Math.random() < 0.15 ? 2 : 1; // "pixeles": estrellas cuadradas
        ctx.fillStyle = `rgba(220,236,255,${0.25 + Math.random() * 0.6})`;
        ctx.fillRect(Math.round(x), Math.round(y), s, s);
      }
    };
    draw();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(draw, 250); });
  }
  const snow = $('#snow');
  if (snow && !reduce) {
    const ctx = snow.getContext('2d');
    let w, h, flakes = [], raf = 0;
    const size = () => {
      w = snow.width = snow.clientWidth; h = snow.height = snow.clientHeight;
      const n = Math.min(90, Math.round(w / (w < 720 ? 22 : 16)));
      flakes = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: 0.8 + Math.random() * 2.2, v: 0.25 + Math.random() * 0.8, p: Math.random() * 6.28 }));
    };
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(235,245,255,.75)';
      for (const f of flakes) {
        f.y += f.v; f.p += 0.012; f.x += Math.sin(f.p) * 0.35;
        if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w; }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    size(); tick();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 250); });
    // Sin gastar CPU cuando la pestaña no se ve o el hero ya salió de pantalla.
    document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) tick(); });
    new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting && !document.hidden) tick(); }).observe(snow);
  }

  /* ---------- COPIAR IP ---------- */
  let SITE = null;
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch { /* fallback */ }
    const ta = el('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0'; document.body.append(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch { /* nada */ }
    ta.remove(); return ok;
  }
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy-ip]');
    if (!b) return;
    const ip = SITE?.server?.ip;
    if (!ip) return;
    const label = b.dataset.label || b.textContent;
    b.dataset.label = label;
    const ok = await copyText(ip);
    b.textContent = ok ? '✓ IP COPIADA' : 'Copia a mano: ' + ip;
    b.classList.add('copied');
    setTimeout(() => { b.textContent = label; b.classList.remove('copied'); }, 2200);
  });
  // Copiar un dato de site.json (p. ej. la huella): <button data-copy="autopack.fingerprint" data-copied="✓ COPIADO">
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b || !SITE) return;
    const v = get(SITE, b.dataset.copy);
    if (!v) return;
    const label = b.dataset.label || b.textContent;
    b.dataset.label = label;
    const ok = await copyText(String(v));
    b.textContent = ok ? (b.dataset.copied || '✓ COPIADO') : 'Cópialo a mano';
    b.classList.add('copied');
    setTimeout(() => { b.textContent = label; b.classList.remove('copied'); }, 2200);
  });
  document.addEventListener('click', (e) => {
    const d = e.target.closest('a[aria-disabled="true"]');
    if (d) e.preventDefault();
  });

  /* ---------- DATOS: site.json ---------- */
  function applySite(data) {
    SITE = data;
    $$('[data-bind]').forEach((n) => {
      const v = get(data, n.dataset.bind);
      n.textContent = v === '' || v == null ? PENDING : String(v);
      if (v === '' || v == null) n.dataset.missing = 'true';
    });
    $$('[data-href]').forEach((a) => {
      const raw = get(data, a.dataset.href);
      const url = raw ? httpsUrl(raw) : null;
      if (url) {
        a.href = url; a.removeAttribute('aria-disabled');
        if (a.dataset.newtab !== undefined) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      } else {
        a.href = '#'; a.setAttribute('aria-disabled', 'true');
        a.title = 'Enlace pendiente: se configura en data/site.json';
        if (a.dataset.pendingLabel) a.textContent = a.dataset.pendingLabel;
      }
    });
    $$('[data-missing-note]').forEach((n) => { n.hidden = !!get(data, n.dataset.missingNote); });
    // Funciones anunciadas: "soon" muestra PRÓXIMAMENTE; "live" lo quita.
    $$('[data-feature]').forEach((n) => {
      const state = get(data, 'features.' + n.dataset.feature) || 'off';
      n.hidden = state === 'off';
      const soon = state === 'soon';
      n.classList.toggle('soon', soon);
      $$('.badge', n).forEach((b) => { b.hidden = !soon; });
    });
    // Historial del AutoPack (solo versiones reales; vacío = mensaje honesto)
    const hist = $('#history');
    if (hist) {
      hist.replaceChildren();
      const list = data.autopack?.history || [];
      if (!list.length) hist.append(el('p', 'empty', 'Todavía no hay versiones publicadas. El historial aparecerá aquí.'));
      list.forEach((h) => {
        const row = el('div', 'row');
        row.append(el('b', '', 'AutoPack ' + h.version), el('span', '', h.date ? fmtDate(h.date) : ''));
        hist.append(row);
      });
    }
    // Derribo: cifras editables
    $$('[data-derribo]').forEach((n) => { n.textContent = String(get(data, 'derribo.' + n.dataset.derribo) ?? '—'); });
  }
  fetchJson('data/site.json').then(applySite).catch(() => {
    // Sin servidor HTTP (abrir el archivo con doble clic) fetch no funciona: se avisa en vez de fallar en silencio.
    $$('[data-bind]').forEach((n) => { n.textContent = PENDING; });
    console.warn('No se pudo cargar data/site.json. Abre la web con un servidor (ver README).');
  });

  /* ---------- NOVEDADES ---------- */
  const newsBox = $('#news');
  if (newsBox) {
    fetchJson('data/news.json').then((items) => {
      newsBox.replaceChildren();
      items.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, +newsBox.dataset.max || 6).forEach((p) => {
        const a = el('article', 'post rv');
        a.append(el('time', '', fmtDate(p.date)));
        const body = el('div');
        body.append(el('span', 't', p.tag || 'NOVEDAD'), el('h3', '', p.title), el('p', '', p.text || ''));
        a.append(body);
        newsBox.append(a); watch(a);
      });
    }).catch(() => newsBox.replaceChildren(el('p', 'empty', 'Novedades no disponibles.')));
  }

  /* ---------- REGLAS ---------- */
  const rulesBox = $('#rules');
  if (rulesBox) {
    fetchJson('data/rules.json').then(({ categories }) => {
      rulesBox.replaceChildren();
      categories.forEach((c) => {
        const card = el('div', 'card rule-card rv');
        card.append(el('h3', '', c.title));
        if (c.items?.length) {
          const ol = el('ol'); c.items.forEach((t) => ol.append(el('li', '', t))); card.append(ol);
        }
        if (c.note) card.append(el('p', 'note', c.note));
        rulesBox.append(card); watch(card);
      });
    }).catch(() => rulesBox.replaceChildren(el('p', 'empty', 'Reglas no disponibles.')));
  }
})();
