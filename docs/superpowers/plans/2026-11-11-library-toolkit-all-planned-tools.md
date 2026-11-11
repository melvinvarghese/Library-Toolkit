# Library Toolkit All Planned Tools Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Implement all 14 currently planned tools in Library Toolkit.

**Architecture:** Add one accessible static page per tool, with four focused TypeScript modules shared by category. Reuse the current directory registry, CSV parser, JsBarcode, styles, print workflow, and explicit Vite inputs.

**Tech Stack:** TypeScript, Vite, browser DOM/CSS, JsBarcode, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-11-library-toolkit-all-planned-tools-design.md`

## Global Constraints
- Preserve every existing tool and URL.
- Process uploaded files in the browser; add no backend or external API.
- Every tool must have its own useful route and SEO metadata.
- Use the existing design language and responsive print patterns.
- Keep changes local; do not push, merge, or deploy.

## Review Focus
- CSV quoting, separators, BOMs, malformed rows: exercise parser and transformations in data-tool tests.
- User text containing HTML or commas: escape previews and quote serialized CSV.
- Large batches and empty optional fields: validate limits and avoid blank output.
- Unsupported barcode values: show a clear per-row error and preserve other usable data.
- Print layouts at small widths and long classification strings: test bounded dimensions and overflow rules.

---

### Task 1: Shared CSV transformations
**Files:** Create `src/tool-pages/data-tools-utils.mjs`; create `tests/data-tools-utils.test.mjs`.
- [x] Test safe CSV serialization, row cleanup, header mapping, output formatting, and line-list normalization.
- [x] Implement pure reusable transformations with explicit validation.
- [x] Run focused Node tests.

### Task 2: Barcode CSV suite (3 tools)
**Files:** Create `src/tool-pages/barcode-batch.ts`, `src/tool-pages/barcode-batch.css`, and pages for `barcode/csv`, `barcode/member`, and `barcode/sheet`.
- [x] Implement CSV import and barcode generation with individual row errors.
- [x] Add member-name/ID captions and configurable barcode sheet dimensions, columns, margins, and gaps.
- [x] Provide previews and print output.

### Task 3: Label suite (5 tools)
**Files:** Create `src/tool-pages/label-batch.ts`, `src/tool-pages/label-batch.css`, and pages for `labels/spine-csv`, `labels/four-line`, `labels/book`, `labels/accession`, and `labels/designer`.
- [x] Implement CSV-to-spine labels, four-line records, book ownership labels, and sequential/custom accession labels.
- [x] Implement a general label sheet designer with size, columns, and type controls.
- [x] Provide previews, print sheets, bounds, and row-count validation.

### Task 4: DDC helper
**Files:** Create `src/tool-pages/ddc-helper.ts` and `library/ddc-helper/index.html`.
- [x] Format entered DDC class, cutter, and optional year into a preview and printable spine label.
- [x] Treat classification as supplied text and validate empty/oversized values.

### Task 5: Data utilities (5 tools)
**Files:** Create `src/tool-pages/data-tools.ts` and pages for `data/csv-viewer`, `data/csv-mapper`, `data/csv-cleaner`, `data/csv-formatter`, and `data/text-formatter`.
- [x] Add local CSV viewing, column mapping, cleanup, column formatting, and newline-list formatting.
- [x] Support CSV download where applicable and preview changes before download.
- [x] Keep file size and row limits clear.

### Task 6: Site integration and verification
**Files:** Modify `src/data/tools.ts`, `src/main.ts`, `vite.config.ts`, `public/sitemap.xml`, `tests/routes.test.mjs`, and `README.md`.
- [x] Mark all 14 tools available and connect every URL.
- [x] Add unique titles, descriptions, canonicals, social metadata, schema, and sitemap entries.
- [x] Test route uniqueness, internal links, CSV utilities, and existing routes.
- [ ] Run TypeScript, build, tests, QR/ barcode output checks, and desktop/mobile browser review when dependencies are available.
