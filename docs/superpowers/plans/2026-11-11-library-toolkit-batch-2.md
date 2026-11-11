# Library Toolkit Batch 2 Implementation Plan

**Goal:** Add six useful, printable library and data tools plus a font-size control for spine labels, matching the existing multi-page Vite design.

**Architecture:** Keep the current static HTML, TypeScript, and Vite setup. Add a shared browser-side utility runner and CSV helpers, one crawlable HTML entry per tool, and no new dependencies or server processing.

**Tech Stack:** Existing TypeScript, Vite, CSS, browser FileReader/Print APIs, and Node's built-in test runner.

**Scope:** Accession Register Formatter, Book Purchase List Formatter, Book Price Calculator, Stock Verification Sheet, Library Member Card Maker, CSV to PDF, adjustable spine-label text size, and the two reported CSV-input/preview fixes.

## Tasks

1. Add failing unit tests for CSV parsing and purchase totals; implement dependency-free helpers and verify the tests.
2. Build the shared browser tool runner for local CSV input, preview, print, and the five library-specific workflows.
3. Add the six standalone pages, unique metadata, Vite inputs, internal links, homepage status, and sitemap entries.
4. Add and verify spine-label font size control.
5. Run unit checks, route/metadata/link checks, production build, and desktop/mobile browser checks when local dependencies permit.

## Constraints

- Keep records in the browser; do not upload user data.
- Use the browser print dialog for PDF output; add no PDF dependency.
- Preserve the current Library Toolkit design and do not change the original main checkout or any remote state.
- Keep controls labeled, keyboard accessible, responsive, and print-ready.
