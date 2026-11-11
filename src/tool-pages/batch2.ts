import "../styles.css";
import "./batch2.css";
import {addSequentialAccessionNumbers, calculatePurchaseTotals, parseCsv, type CsvTable} from "./batch2-utils.mjs";

type ToolKind = "accession-register" | "purchase-list" | "price-calculator" | "stock-verification" | "member-card" | "csv-to-pdf";

const copy: Record<ToolKind, {title: string; description: string}> = {
  "accession-register": {title: "Accession Register Formatter", description: "Format book acquisition records into a clear, printable accession register. Import a CSV file or paste records; everything stays in your browser."},
  "purchase-list": {title: "Book Purchase List Formatter", description: "Turn a CSV export or pasted list into a clean, printable book purchase list."},
  "price-calculator": {title: "Book Price Calculator", description: "Add book quantities, unit prices, discount and tax to calculate a purchase total."},
  "stock-verification": {title: "Stock Verification Sheet", description: "Turn a book list into a printable stock verification sheet with room to record checks."},
  "member-card": {title: "Library Member Card Maker", description: "Create printable membership cards from a CSV file or pasted member list."},
  "csv-to-pdf": {title: "CSV to PDF", description: "Preview a CSV table and use your browser’s print dialog to save it as a PDF."},
};

const root = document.querySelector<HTMLElement>("#tool-app")!;
if (!root) throw new Error("Tool page container was not found.");
const kind = root.dataset.tool as ToolKind;
const tool = copy[kind];
if (!tool) throw new Error("Unknown tool page.");

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char] ?? char));
const intro = kind === "accession-register"
  ? "Paste a CSV export or choose a CSV file. A sequential accession number column will be added to the printable register."
  : kind === "purchase-list"
    ? "Paste a spreadsheet export or choose a CSV file to build a tidy purchase list. Use the print dialog to save a PDF."
    : kind === "stock-verification"
      ? "Load a CSV of your collection. The print sheet adds blank fields for the physical count, condition and notes."
      : kind === "member-card"
        ? "Use a CSV with member name, membership number and expiry date as the first three columns. Each row becomes a printable card."
        : kind === "csv-to-pdf"
          ? "Paste CSV text or choose a file. The preview updates when either source changes, and printing lets you save a PDF."
          : "Enter book quantities and prices. The totals update from your current values.";

function mountCsvTool() {
  root.innerHTML = '<section class="batch-tool"><header class="batch-tool-heading"><p class="batch-eyebrow">Library Toolkit</p><h1>' + escapeHtml(tool.title) + '</h1><p>' + escapeHtml(tool.description) + '</p></header><div class="batch-layout"><form class="batch-panel batch-input-panel" id="csv-form"><p class="batch-intro">' + escapeHtml(intro) + '</p><label class="batch-field">Library or document name <input id="document-name" type="text" maxlength="100" placeholder="Optional"></label><label class="batch-field">Paste CSV data <textarea id="csv-input" rows="9" spellcheck="false" placeholder="Title,Author,Publisher&#10;The Example Book,A. Writer,Library Press"></textarea></label><label class="batch-field">Or choose a CSV file <input id="csv-file" type="file" accept=".csv,text/csv"></label>' + (kind === "accession-register" ? '<label class="batch-field">Starting accession number <input id="starting-number" type="text" inputmode="numeric" value="000001" maxlength="16"></label>' : '') + (kind === "csv-to-pdf" ? '<div class="batch-field-grid"><label class="batch-field">Page layout <select id="page-orientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label><label class="batch-field">Text size <select id="table-font-size"><option value="9">Small</option><option value="11" selected>Regular</option><option value="13">Large</option></select></label></div>' : '') + '<p id="csv-status" class="batch-status" role="status" aria-live="polite">Choose a CSV file or paste data to preview it.</p><div class="batch-actions"><button class="batch-primary" type="submit">Update preview</button><button class="batch-secondary" id="csv-print" type="button">Print / Save as PDF</button></div></form><section class="batch-panel batch-preview-panel" aria-labelledby="preview-title"><div class="batch-preview-heading"><div><h2 id="preview-title">Preview</h2><p id="preview-summary">No data loaded yet.</p></div><span class="batch-local-note">Processed on this device</span></div><div id="csv-preview" class="batch-preview" aria-live="polite"><p>Your preview will appear here.</p></div></section></div></section>';

  const form = root.querySelector<HTMLFormElement>("#csv-form")!;
  const textarea = root.querySelector<HTMLTextAreaElement>("#csv-input")!;
  const file = root.querySelector<HTMLInputElement>("#csv-file")!;
  const status = root.querySelector<HTMLParagraphElement>("#csv-status")!;
  const preview = root.querySelector<HTMLDivElement>("#csv-preview")!;
  const summary = root.querySelector<HTMLParagraphElement>("#preview-summary")!;
  let sourceVersion = 0;

  const renderTable = (table: CsvTable, headers = table.headers, rows = table.rows) => {
    const title = root.querySelector<HTMLInputElement>("#document-name")?.value.trim() || "";
    if (!headers.length) {
      preview.innerHTML = '<p class="batch-empty">Add a header row and at least one record to see the preview.</p>';
      summary.textContent = "No rows to display.";
      return;
    }
    let displayTable = table;
    if (kind === "accession-register") {
      try {
        const starting = root.querySelector<HTMLInputElement>("#starting-number")?.value.trim() || "1";
        displayTable = addSequentialAccessionNumbers(table, starting);
      } catch (error) {
        preview.innerHTML = '<p class="batch-error">' + escapeHtml(error instanceof Error ? error.message : "Enter a valid starting accession number.") + "</p>";
        summary.textContent = "Preview could not be created.";
        status.textContent = "Enter a valid starting number using digits only.";
        return;
      }
    }
    if (kind === "member-card") {
      if (rows.length > 500) {
        preview.innerHTML = '<p class="batch-error">For clear printing, create cards in batches of 500 members or fewer.</p>';
        summary.textContent = "Too many member records for one batch.";
        status.textContent = "Split this CSV into smaller batches.";
        return;
      }
      const normalized = headers.map(header => header.toLowerCase().replace(/[^a-z0-9]/g, ""));
      const nameColumn = Math.max(0, normalized.findIndex(header => /^(member)?name$|fullname/.test(header)));
      const idColumn = normalized.findIndex(header => /^(member)?(id|no|number)$/.test(header));
      const expiryColumn = normalized.findIndex(header => /expiry|expires|validuntil|validthrough/.test(header));
      const idIndex = idColumn >= 0 ? idColumn : Math.min(1, headers.length - 1);
      const expiryIndex = expiryColumn >= 0 ? expiryColumn : (headers.length > 2 ? 2 : -1);
      const cards = rows.map(row => '<article class="batch-member-card"><div class="batch-member-card-band"><span>' + escapeHtml(title || "Library") + '</span><span>MEMBER</span></div><div class="batch-member-card-body"><strong>' + escapeHtml(row[nameColumn] || "Member name") + '</strong><p>Membership number</p><b>' + escapeHtml(row[idIndex] || "—") + '</b>' + (expiryIndex >= 0 && row[expiryIndex] ? '<small>Valid until ' + escapeHtml(row[expiryIndex]) + '</small>' : "") + '</div></article>').join("");
      preview.className = "batch-preview";
      preview.innerHTML = '<div class="batch-member-cards">' + cards + '</div>';
      summary.textContent = rows.length + (rows.length === 1 ? " member card" : " member cards");
      return;
    }
    if (rows.length > 1000) {
      preview.innerHTML = '<p class="batch-error">For performance, preview 1,000 records or fewer at a time.</p>';
      summary.textContent = "Too many records for one batch.";
      status.textContent = "Split this CSV into smaller batches.";
      return;
    }
    const extraHeader = kind === "stock-verification" ? ["Physical count", "Condition", "Notes"] : [];
    const tableHeaders = [...extraHeader, ...displayTable.headers];
    const body = displayTable.rows.map(row => {
      const cells = kind === "stock-verification" ? ["", "", "", ...row] : row;
      return "<tr>" + cells.map(cell => "<td>" + escapeHtml(cell) + "</td>").join("") + "</tr>";
    }).join("");
    const orientation = root.querySelector<HTMLSelectElement>("#page-orientation")?.value || "portrait";
    const fontSize = root.querySelector<HTMLSelectElement>("#table-font-size")?.value || "11";
    preview.className = "batch-preview " + (kind === "csv-to-pdf" ? "csv-print-" + orientation : "");
    preview.innerHTML = (title ? '<h3 class="batch-document-title">' + escapeHtml(title) + '</h3>' : "") + '<div class="batch-table-scroll"><table style="--table-font-size:' + escapeHtml(fontSize) + 'pt"><thead><tr>' + tableHeaders.map(header => "<th scope=\"col\">" + escapeHtml(header) + "</th>").join("") + "</tr></thead><tbody>" + body + "</tbody></table></div>";
    summary.textContent = rows.length + (rows.length === 1 ? " record" : " records") + " · " + headers.length + " CSV columns";
  };

  const updatePreview = () => {
    try {
      const table = parseCsv(textarea.value);
      renderTable(table);
      if (table.headers.length) status.textContent = "Preview updated from the current CSV text.";
    } catch (error) {
      preview.innerHTML = '<p class="batch-error">' + escapeHtml(error instanceof Error ? error.message : "This CSV could not be read.") + "</p>";
      summary.textContent = "Preview could not be created.";
      status.textContent = "Check the CSV formatting and try again.";
    }
  };

  textarea.addEventListener("input", () => {
    sourceVersion += 1;
    if (file.value) file.value = "";
    updatePreview();
  });
  file.addEventListener("change", async () => {
    const selected = file.files?.[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      file.value = "";
      preview.innerHTML = '<p class="batch-error">Choose a CSV file smaller than 5 MB.</p>';
      summary.textContent = "File is too large.";
      status.textContent = "Choose a smaller CSV file.";
      return;
    }
    const version = ++sourceVersion;
    preview.innerHTML = '<p class="batch-empty">Loading the selected CSV file…</p>';
    summary.textContent = "Loading CSV file.";
    try {
      const text = await selected.text();
      if (version !== sourceVersion) return;
      textarea.value = text;
      updatePreview();
      status.textContent = "CSV file loaded. The preview now uses this file.";
    } catch {
      preview.innerHTML = '<p class="batch-error">The selected file could not be read.</p>';
      summary.textContent = "File could not be read.";
      status.textContent = "The selected file could not be read. Try another CSV file.";
    }
  });
  root.querySelector<HTMLInputElement>("#starting-number")?.addEventListener("input", updatePreview);
  root.querySelector<HTMLInputElement>("#document-name")?.addEventListener("input", updatePreview);
  root.querySelector<HTMLSelectElement>("#page-orientation")?.addEventListener("change", updatePreview);
  root.querySelector<HTMLSelectElement>("#table-font-size")?.addEventListener("change", updatePreview);
  form.addEventListener("submit", event => { event.preventDefault(); updatePreview(); });
  root.querySelector<HTMLButtonElement>("#csv-print")!.addEventListener("click", () => {
    if (!textarea.value.trim() || !preview.querySelector("table")) {
      status.textContent = "Add valid CSV data before printing.";
      return;
    }
    window.print();
  });
}

function mountPriceCalculator() {
  root.innerHTML = '<section class="batch-tool"><header class="batch-tool-heading"><p class="batch-eyebrow">Library Toolkit</p><h1>' + escapeHtml(tool.title) + '</h1><p>' + escapeHtml(tool.description) + '</p></header><div class="batch-layout"><form class="batch-panel batch-input-panel" id="price-form"><p class="batch-intro">' + escapeHtml(intro) + '</p><div class="batch-field-grid"><label class="batch-field">Discount (%) <input id="discount" type="number" min="0" max="100" step="0.01" value="0"></label><label class="batch-field">Tax (%) <input id="tax" type="number" min="0" max="100" step="0.01" value="0"></label></div><div class="batch-lines-heading"><h2>Books</h2><button class="batch-secondary" id="add-line" type="button">Add a book</button></div><div id="purchase-lines"></div><p id="price-status" class="batch-status" role="status" aria-live="polite">Add quantities and prices to calculate a total.</p><div class="batch-actions"><button class="batch-primary" type="submit">Update totals</button><button class="batch-secondary" id="price-print" type="button">Print / Save as PDF</button></div></form><section class="batch-panel batch-preview-panel" aria-labelledby="price-preview-title"><div class="batch-preview-heading"><div><h2 id="price-preview-title">Purchase total</h2><p>Discount is applied before tax.</p></div><span class="batch-local-note">Calculated on this device</span></div><div id="price-summary" class="batch-price-summary"><p>Enter at least one book line.</p></div></section></div></section>';

  const lines = root.querySelector<HTMLDivElement>("#purchase-lines")!;
  const summary = root.querySelector<HTMLDivElement>("#price-summary")!;
  const status = root.querySelector<HTMLParagraphElement>("#price-status")!;
  const createLine = (index: number) => {
    const row = document.createElement("fieldset");
    row.className = "batch-purchase-line";
    row.innerHTML = '<legend>Book ' + (index + 1) + '</legend><label class="batch-field">Title <input class="line-title" type="text" maxlength="160" required></label><div class="batch-field-grid"><label class="batch-field">Quantity <input class="line-quantity" type="number" min="1" step="1" value="1" required></label><label class="batch-field">Unit price <input class="line-price" type="number" min="0" step="0.01" required></label></div><button class="batch-remove" type="button" aria-label="Remove book ' + (index + 1) + '">Remove</button>';
    row.querySelector<HTMLButtonElement>(".batch-remove")!.addEventListener("click", () => { row.remove(); refresh(); });
    row.querySelectorAll("input").forEach(input => input.addEventListener("input", refresh));
    return row;
  };
  const refresh = () => {
    const rows = Array.from(lines.querySelectorAll<HTMLFieldSetElement>(".batch-purchase-line"));
    rows.forEach((row, index) => { row.querySelector("legend")!.textContent = "Book " + (index + 1); row.querySelector("button")!.setAttribute("aria-label", "Remove book " + (index + 1)); });
    if (!rows.length) {
      summary.innerHTML = "<p>Add a book line to calculate a purchase total.</p>";
      status.textContent = "No book lines yet.";
      return;
    }
    const incomplete = rows.some(row =>
      !row.querySelector<HTMLInputElement>(".line-title")!.value.trim() ||
      !row.querySelector<HTMLInputElement>(".line-quantity")!.value.trim() ||
      !row.querySelector<HTMLInputElement>(".line-price")!.value.trim(),
    );
    if (incomplete) {
      summary.innerHTML = '<p class="batch-empty">Complete the title, quantity and unit price for each book.</p>';
      status.textContent = "Enter a title, quantity and unit price for each line.";
      return;
    }
    try {
      const items = rows.map(row => ({
        quantity: Number(row.querySelector<HTMLInputElement>(".line-quantity")!.value),
        unitPrice: Number(row.querySelector<HTMLInputElement>(".line-price")!.value),
      }));
      const discount = Number(root.querySelector<HTMLInputElement>("#discount")!.value);
      const tax = Number(root.querySelector<HTMLInputElement>("#tax")!.value);
      const totals = calculatePurchaseTotals(items, discount, tax);
      const money = (amount: number) => amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
      summary.innerHTML = '<dl class="batch-totals"><div><dt>Subtotal</dt><dd>' + money(totals.subtotal) + '</dd></div><div><dt>Discount</dt><dd>−' + money(totals.discount) + '</dd></div><div><dt>Taxable amount</dt><dd>' + money(totals.taxableAmount) + '</dd></div><div><dt>Tax</dt><dd>' + money(totals.tax) + '</dd></div><div class="batch-grand-total"><dt>Total</dt><dd>' + money(totals.total) + '</dd></div></dl>';
      status.textContent = rows.length + (rows.length === 1 ? " book line included." : " book lines included.");
    } catch (error) {
      summary.innerHTML = '<p class="batch-error">' + escapeHtml(error instanceof Error ? error.message : "Check the values and try again.") + "</p>";
      status.textContent = "Check that quantities, prices, discounts and tax are valid.";
    }
  };
  lines.append(createLine(0));
  root.querySelector<HTMLButtonElement>("#add-line")!.addEventListener("click", () => { lines.append(createLine(lines.children.length)); refresh(); });
  root.querySelectorAll<HTMLInputElement>("#discount, #tax").forEach(input => input.addEventListener("input", refresh));
  root.querySelector<HTMLFormElement>("#price-form")!.addEventListener("submit", event => { event.preventDefault(); refresh(); });
  root.querySelector<HTMLButtonElement>("#price-print")!.addEventListener("click", () => { refresh(); window.print(); });
  refresh();
}

if (kind === "price-calculator") mountPriceCalculator();
else mountCsvTool();



