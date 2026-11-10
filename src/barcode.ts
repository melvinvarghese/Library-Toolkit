import JsBarcode from "jsbarcode";

export function mountContinuousBarcode(container: HTMLElement, onClose: () => void) {
  container.innerHTML = `
    <div class="barcode-tool-shell">
      <div class="barcode-tool-heading">
        <button class="barcode-back" type="button" id="barcode-back">Back to all tools</button>
        <h1>Continuous barcode generator</h1>
        <p>Create a numbered sequence of barcodes, ready to print for your library collection.</p>
      </div>
      <div class="barcode-workspace">
        <form class="barcode-settings" id="barcode-form">
          <h2>Sequence</h2>
          <label>Starting number<input id="barcode-start" type="text" value="000001" inputmode="numeric" required></label>
          <label>Ending number<input id="barcode-end" type="text" value="000050" inputmode="numeric" required></label>
          <p class="barcode-hint">Keep the same number of digits to preserve leading zeros.</p>
          <div class="barcode-two">
            <label>Barcode format<select id="barcode-format"><option value="CODE128">Code 128 (recommended)</option><option value="CODE39">Code 39</option></select></label>
            <label>Columns<select id="barcode-columns"><option>2</option><option selected>3</option><option>4</option><option>5</option></select></label>
          </div>
          <h2>Print layout</h2>
          <div class="barcode-two">
            <label>Barcode height (mm)<input id="barcode-height" type="number" min="8" max="60" value="18"></label>
            <label>Module width<input id="barcode-width" type="number" min="1" max="4" step="0.2" value="1.6"></label>
          </div>
          <div class="barcode-two">
            <label>Horizontal gap (mm)<input id="barcode-gap-x" type="number" min="0" max="30" value="8"></label>
            <label>Vertical gap (mm)<input id="barcode-gap-y" type="number" min="0" max="30" value="8"></label>
          </div>
          <label class="barcode-check"><input id="barcode-text" type="checkbox" checked> Show number below barcode</label>
          <div class="barcode-actions"><button class="barcode-primary" type="submit">Generate barcodes</button><button class="barcode-secondary" type="button" id="barcode-print">Print or save as PDF</button></div>
          <p class="barcode-message" id="barcode-message" role="status">Enter a sequence and generate your sheet.</p>
        </form>
        <section class="barcode-preview-panel">
          <div class="barcode-preview-top"><div><h2>Print preview</h2><p id="barcode-summary">A4 portrait</p></div><span class="barcode-live">Stays in your browser</span></div>
          <div class="barcode-paper-wrap"><div class="barcode-paper" id="barcode-paper"><div class="barcode-empty">Your barcode sheet will appear here.</div></div></div>
          <p class="barcode-footnote">Print on A4 paper at 100% scale. Printer margins may vary. Test a sample with your barcode scanner before printing a full batch.</p>
        </section>
      </div>
    </div>`;
  const byId = <T extends HTMLElement>(id: string) => container.querySelector<T>("#" + id)!;
  const form = byId<HTMLFormElement>("barcode-form");
  const paper = byId<HTMLDivElement>("barcode-paper");
  const message = byId<HTMLParagraphElement>("barcode-message");
  let generated = false;
  byId<HTMLButtonElement>("barcode-back").addEventListener("click", onClose);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const startText = byId<HTMLInputElement>("barcode-start").value.trim();
    const endText = byId<HTMLInputElement>("barcode-end").value.trim();
    const start = Number(startText), end = Number(endText);
    const format = byId<HTMLSelectElement>("barcode-format").value;
    if (!/^\d+$/.test(startText) || !/^\d+$/.test(endText) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
      message.textContent = "Use whole numbers only for the starting and ending values."; return;
    }
    if (start > end) { message.textContent = "The ending number must be greater than or equal to the starting number."; return; }
    const total = end - start + 1;
    if (total > 500) { message.textContent = "For a smooth preview, generate up to 500 barcodes at a time."; return; }
    if (startText.length !== endText.length) { message.textContent = "Use the same number of digits in both fields to preserve leading zeros."; return; }
    const values = Array.from({length: total}, (_, i) => String(start + i).padStart(startText.length, "0"));
    const columns = Number(byId<HTMLSelectElement>("barcode-columns").value);
    const height = Number(byId<HTMLInputElement>("barcode-height").value);
    const width = Number(byId<HTMLInputElement>("barcode-width").value);
    const gapX = Number(byId<HTMLInputElement>("barcode-gap-x").value);
    const gapY = Number(byId<HTMLInputElement>("barcode-gap-y").value);
    if (![height,width,gapX,gapY].every(Number.isFinite) || height < 8 || height > 60 || width < 1 || width > 4 || gapX < 0 || gapY < 0) {
      message.textContent = "Check the print dimensions. Please use the allowed positive ranges."; return;
    }
    const showText = byId<HTMLInputElement>("barcode-text").checked;
    const sheet = document.createElement("div");
    sheet.className = "barcode-sheet";
    sheet.style.setProperty("--barcode-columns", String(columns));
    const rows = Math.ceil(total / columns);
    if (total <= 30) {
      sheet.classList.add("barcode-sheet-spread");
      sheet.style.setProperty("--barcode-rows", String(rows));
    }
    sheet.style.setProperty("--barcode-gap-x", gapX + "mm");
    sheet.style.setProperty("--barcode-gap-y", gapY + "mm");
    for (const value of values) {
      const item = document.createElement("div"); item.className = "barcode-item";
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      item.append(svg);
      try {
        JsBarcode(svg, value, {format, width, height: height * 3.7795, displayValue: showText, font: "Arial", fontSize: 12, textMargin: 3, margin: 2, lineColor: "#111111", background: "#ffffff"});
      } catch {
        message.textContent = "A barcode could not be generated. Check the selected format and values."; return;
      }
      sheet.append(item);
    }
    paper.replaceChildren(sheet);
    byId<HTMLParagraphElement>("barcode-summary").textContent = "A4 portrait, " + total + " barcodes";
    message.textContent = total + " barcodes generated. Use Print or save as PDF when ready.";
    generated = true;
  });
  byId<HTMLButtonElement>("barcode-print").addEventListener("click", () => {
    if (!generated) { message.textContent = "Generate your barcodes before printing."; return; }
    window.print();
  });
}
