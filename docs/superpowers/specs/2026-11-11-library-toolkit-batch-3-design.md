# Library Toolkit Batch 3 Design

## Intent
Add five complete browser tools to the existing privacy-first static Library Toolkit: membership cards, fine receipts, shelf labels, QR labels, and annual reports. Each remains usable without an account or server and matches the existing blue, yellow, white, and Archivo design.

## Goals
- Dedicated, useful, searchable pages with canonical and Open Graph metadata, structured data, navigation links, and sitemap entries.
- Responsive accessible inputs, visible previews, validation, and print or download workflows.
- Correct date and money calculations, sensible limits for bulk records, reusable existing CSV parsing, and no external processing APIs.
- Keep current URLs and tools intact.

## Non-goals and constraints
- No homepage redesign, backend, user accounts, automatic deployment, or push to main.
- Existing architecture is Vite multi-page HTML with TypeScript modules, shared CSS, a central directory registry, and `window.print()`.
- QR generation and in-browser decode verification need local packages because no QR library exists in the repository. Use `qrcode` and `jsqr`; no API calls.

## Approaches
1. Add five static HTML pages and one focused Batch 3 tool module plus shared pure utilities and styles. This matches Batch 2, reuses the existing parser and site shell, and keeps route setup explicit. **Selected.**
2. Rewrite the app around a client-side router and shared component framework. This expands scope and risks existing URLs and layout.
3. Use hosted document/QR APIs. This conflicts with local privacy and creates service dependencies.

## Implementation decisions
- Upgrade the existing member-card route to the full card maker instead of adding a duplicate route.
- Fine calculations use local calendar-day ordinals, grace days deducted before chargeable overdue days, and an optional cap; receipt printing uses the browser print dialog.
- Shelf labels support configurable millimetre dimensions and classification text as entered, without interpreting classification numbers.
- QR images are generated locally, decoded locally with `jsqr` before preview, and offered individually as PNG; sheet printing handles bulk output.
- Annual report supports manual entry, derived collection change and issue/return totals where meaningful, and print-to-PDF.
- Add accessible input labels, escaped rendering for imported/user text, page-size and record-count limits, and print-only output styling.

## Files and responsibilities
- `src/tool-pages/batch3-utils.mjs`: pure fine, date, CSV mapping and derived-statistic helpers.
- `src/tool-pages/batch3.ts`: UI behavior for the five Batch 3 tools.
- `src/tool-pages/batch3.css`: Batch 3 responsive preview and print styles.
- Five route HTML files (the existing member-card page plus four new pages): SEO shell, descriptions, and tool entry.
- `src/data/tools.ts`, `src/main.ts`, `vite.config.ts`, `public/sitemap.xml`: directory, URLs, build entries, and sitemap.
- `tests/batch3-utils.test.mjs`, `tests/routes.test.mjs`: behavior and route integrity checks.
- `package.json`: local QR generator and decoder dependencies.

## Acceptance
All five pages are in the directory, Vite inputs, and sitemap; utility edge cases and route metadata tests pass; generated QR PNGs decode to their source text; production build and available browser checks are reported accurately. The user requested implementation and testing to proceed without a planning pause.
