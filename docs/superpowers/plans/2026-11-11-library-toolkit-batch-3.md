# Library Toolkit Batch 3 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add five usable, print-ready library utilities to the current static site.

**Architecture:** Four new static pages and one upgraded member-card page use the existing shared site shell, CSV parser, multi-page Vite config, and a dedicated TypeScript module. Pure calculations and mappings live in a tested utility module; QR generation and decode verification run locally.

**Tech Stack:** TypeScript, Vite, browser DOM/CSS/Canvas, existing CSV parser, `qrcode`, `jsqr`, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-11-library-toolkit-batch-3-design.md`

## Global Constraints
- Preserve existing tools, routes, and visual design.
- Process user records locally; do not add backend or external API calls.
- Each tool needs a useful dedicated URL, metadata, internal navigation, and sitemap entry.
- Keep print layouts legible and responsive on narrow screens.
- Do not push, merge, deploy, or overwrite recent user changes.

## Review Focus
- Leap days and month boundaries: fine date ordinal test.
- Invalid or reversed dates and invalid caps/rates: fine validation tests.
- CSV headings with varied names, blank optional cells, and quoted commas: import utility tests.
- Long classification values and dimensions at limits: clamp/escaping and label rendering checks.
- QR generator/decode mismatch: generated canvas decode test in browser-capable environment.

---

### Task 1: Shared utilities and test coverage
**Files:** Create `src/tool-pages/batch3-utils.mjs`; create `tests/batch3-utils.test.mjs`.
- [ ] Test fine days, grace, maximum, month boundary, leap day, invalid dates, and money rounding.
- [ ] Implement strict local-date parsing and day ordinal arithmetic.
- [ ] Implement header-normalized CSV row mapping and report derived totals.
- [ ] Run `node --test` and require the new utility cases to pass.

### Task 2: Membership cards and shelf labels
**Files:** Create `src/tool-pages/batch3.ts`, `src/tool-pages/batch3.css`; modify `library/member-card/index.html`; create `labels/shelf/index.html`.
- [ ] Add accessible tests/checks for card CSV fields, optional data, dimensions, and shelf-label size/column rendering.
- [ ] Implement member card settings, photo/logo, front/back, barcode, CSV import, sheet preview and print.
- [ ] Implement shelf fields, CSV import, custom sizes/type, preview and print sheets.
- [ ] Verify long names/call numbers remain within cards and labels.

### Task 3: Fine calculator and receipts
**Files:** Create `library/fine-calculator/index.html`; update `batch3.ts`.
- [ ] Render breakdown of overdue days after grace, rate, cap and total; reject invalid or reversed dates.
- [ ] Add receipt number/date, book/member data and printable receipt.
- [ ] Verify dates around month end and leap day with pure tests.

### Task 4: QR code labels
**Files:** Create `labels/qr-code/index.html`; modify `package.json`; update `batch3.ts` and `batch3.css`.
- [ ] Add `qrcode` and `jsqr`; create custom text, URL and accession QR codes locally.
- [ ] Decode generated canvas pixels before preview; report decode failures.
- [ ] Support CSV, colors with contrast guard, optional logo, individual PNG download, printable sheet and captions.

### Task 5: Annual report generator
**Files:** Create `library/annual-report/index.html`; update `batch3.ts` and `batch3.css`.
- [ ] Add manual institutional/statistical/narrative fields and optional logo.
- [ ] Derive closing collection and issue/return totals where values are supplied.
- [ ] Render institutional report with statistics table and print-to-PDF.

### Task 6: Site integration and verification
**Files:** Modify `src/data/tools.ts`, `src/main.ts`, `vite.config.ts`, `public/sitemap.xml`, `tests/routes.test.mjs`, and `README.md`.
- [ ] Add each tool to the directory and dedicated build input.
- [ ] Check unique titles, descriptions, canonicals, social metadata, schema, sitemap, page entry scripts and internal links.
- [ ] Run Node tests, production build, and desktop/mobile browser checks if the environment supports them.
- [ ] Report any verification blocked by missing dependencies or runtime capabilities.
