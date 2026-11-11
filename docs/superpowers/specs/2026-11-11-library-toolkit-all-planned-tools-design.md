# Library Toolkit Planned Tools Design

## Intent
Implement all 14 tools still marked Planned in the directory, so the site’s 28-tool catalog is functional end to end.

## Goals and constraints
- Preserve all existing routes, including the current Batch 3 work in this branch.
- Give each planned tool its own useful route, page content, metadata, directory entry, sitemap entry, and build input.
- Keep file processing local, provide accessible controls and validation, and reuse the existing visual system, CSV parser, JsBarcode library, and print patterns.
- Do not add a server or external API. Reuse the current JsBarcode dependency for CSV barcodes.
- Do not push, merge, deploy, or commit without the user’s request.

## Approaches considered
1. Four small category modules (barcode batch, label batch, DDC helper, CSV utilities) with a page per tool. This keeps the existing static multi-page model while sharing behavior within related tools. **Selected.**
2. One large module for all 14 tools. This would make each tool harder to change and review.
3. A client-side router and framework migration. This is outside scope and risks the existing URLs.

## Decisions
- CSV barcode and member barcode tools share generation logic but have separate routes and member-specific columns.
- The barcode sheet designer extends the same local barcode rendering primitives with sheet dimensions and spacing controls.
- Label tools share CSV mapping and sheet layout helpers; classification strings are treated as display text.
- DDC helper formats supplied class, cutter, and year elements; it does not invent or infer a classification.
- CSV viewer, mapper, cleaner, and formatter share the existing CSV parser and a safe CSV serializer. Text formatter handles newline-delimited lists locally.
- Each output is previewed before download or printing.

## Acceptance
All 14 entries are available, all routes resolve through the app directory and Vite build configuration, metadata and sitemap are unique, and automated tests cover CSV transformations, validation, and route integrity. Run the production build and browser checks where dependencies and runtime access permit; report any blocked verification honestly.
