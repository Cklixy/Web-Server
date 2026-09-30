# Web oficial de ORGIADECEMBRINA

Sitio **100 % estático** (HTML + CSS + JS, sin build, sin dependencias, sin backend). Se puede alojar en cualquier
hosting estático. **No consulta el estado del servidor** (ni ping, ni jugadores, ni TPS, ni uptime): eso ya lo publica el
webhook de Discord; la web solo enlaza al Discord.

## Arquitectura

```
Web/
├─ serve.mjs              Servidor local SOLO para previsualizar: node serve.mjs → http://127.0.0.1:4173
└─ site/                  Lo que se publica
   ├─ index.html          Inicio: hero, AutoPack, cómo jugar, servidor, características, equipos, derribo,
   │                      exploración, galería, novedades, FAQ, comunidad
   ├─ autopack.html       Descarga (versión / fecha / tamaño / botón) + historial
   ├─ reglas.html         Reglas por categorías
   ├─ css/style.css       Tokens de diseño arriba; responsive al final
   ├─ js/main.js          Nav, animaciones, copiar IP, nieve/estrellas, lectura de los JSON
   ├─ data/               CONTENIDO EDITABLE sin reconstruir nada
   │  ├─ site.json        nombre, IP, versión, enlace del AutoPack, Discord, estado de funciones
   │  ├─ news.json        novedades
   │  ├─ rules.json       reglas
   │  └─ gallery.json     galería (rutas a assets/screens/)
   └─ assets/             server-icon.png (real), favicon.svg, og.png (vista previa para redes), screens/
```

Los HTML solo tienen la estructura; **todo dato variable se lee de `data/*.json`** (con `textContent`, nunca como HTML).
Los enlaces solo se aceptan si son `https://`.

## Cómo editar (sin reconstruir)

| Quiero… | Edito |
|---|---|
| Poner el enlace del AutoPack | `data/site.json` → `autopack.url` (+ `version`, `updated`, `size`) |
| Añadir una versión al historial | `data/site.json` → `autopack.history`: `{ "version": "1.0", "date": "2026-10-01" }` |
| Poner el Discord | `data/site.json` → `community.discord` |
| Anunciar algo | `data/news.json` (fecha `AAAA-MM-DD`; se ordena solo, se muestran las 5 últimas) |
| Cambiar reglas | `data/rules.json` |
| Poner capturas reales | copiar a `assets/screens/` y rellenar `src` en `data/gallery.json` (WebP, ~1600 px) |
| Activar el derribo / las colonias | `data/site.json` → `features.derribo` / `features.colonias` = `"live"` (quita el aviso PRÓXIMAMENTE) |

Campo vacío = se muestra `[PENDIENTE]` y el botón queda desactivado con una etiqueta de placeholder.

## Estado real de cada función (a 2026-09-29)

| Función mostrada | Estado | Fuente |
|---|---|---|
| Mundo Terralith/Tectonic, bosses, mazmorras | Existe | mods del servidor |
| Equipos (máx. 4, colores, TAB, homes, TPA, claims, trust) | Existe | mod `winterlandteams` 1.4.0 |
| Economía (copos, tienda, trabajos, casino), ruleta de eventos | Existe | `winterlandteams` |
| 8 capítulos / 76 misiones | Existe | FTB Quests |
| Chat de voz | Existe | Simple Voice Chat |
| **Derribo y reanimación** | **En desarrollo, sin desplegar** → `soon` | código sin commitear en `winterlandteams/.../downed` |
| **Colonias (MineColonies)** | **Probado en TestServer, sin desplegar** → `soon` | pendiente de aprobación |

## Datos que faltan (placeholders identificados en la web)

1. **Enlace de descarga del AutoPack** — hoy **no existe un "AutoPack" como archivo único**: el jugador instala el modpack
   Winterland 9.6.0 (CurseForge) + el mod AutoModpack, y este descarga el resto. Hay que crear/alojar el paquete (p. ej.
   un instalador o una instancia lista) y poner su URL. Hasta entonces el botón dice *DESCARGA PRÓXIMAMENTE*.
2. **Versión, fecha y tamaño del AutoPack.**
3. **Invitación del Discord.**
4. **Capturas reales** (la galería muestra placeholders marcados).
5. **Dominio público de la web** — sustituir `TU-DOMINIO` en `og:image` de los 3 HTML.
6. **Reglas**: solo existen las 5 del tablón del lobby; las categorías PvP, Equipos y Bugs/exploits están "Por definir".
7. **IP**: se usa `orgiadecembrina.duckdns.org` (la que documenta el servidor). Confirmar antes de publicar.

## Seguridad y rendimiento

- CSP por `<meta>` (`script-src 'self'`, sin estilos ni scripts en línea). Al alojarla, añade también cabeceras HTTP:
  `Content-Security-Policy` (con `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, HTTPS obligatorio.
- El AutoPack debe alojarse en una fuente controlada por vosotros (p. ej. GitHub Releases o vuestro dominio) y, si es posible,
  publicar su SHA-256 junto al botón.
- Sin backend → no hay API keys ni endpoints que proteger.
- Peso: ~60 KB de HTML+CSS+JS (sin comprimir), sin imágenes de fondo (montañas, auroras, estrellas y nieve son SVG/CSS/canvas propios),
  nieve pausada cuando no se ve y desactivada con `prefers-reduced-motion`. Única dependencia externa: Google Fonts
  (Outfit + Silkscreen, `display=swap`). Para eliminarla, descárgalas a `assets/fonts/` y cambia el `<link>` y la CSP.
- Imágenes de la galería: usa WebP/AVIF y `loading="lazy"` ya viene puesto.

## Previsualizar

```
C:\Minecraft\Tools\node\node.exe C:\Minecraft\Web\serve.mjs      → http://127.0.0.1:4173
```

(Abrir `index.html` con doble clic no carga los JSON: el navegador bloquea `fetch` en `file://`.)
