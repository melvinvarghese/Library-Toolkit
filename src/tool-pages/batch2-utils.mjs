export function addSequentialAccessionNumbers(table, startingValue) {
  const start = Number(startingValue);
  if (!/^\d+$/.test(startingValue) || !Number.isSafeInteger(start)) {
    throw new RangeError("Starting accession number must contain digits only.");
  }
  if (table.rows.length && !Number.isSafeInteger(start + (table.rows.length - 1))) {
    throw new RangeError("The final accession number must be a safe integer.");
  }
  const accessionColumn = table.headers.findIndex(header => /^accession(\s*(number|no\.?|#))?$/i.test(header.trim()));
  const headers = accessionColumn < 0 ? ["Accession number", ...table.headers] : [...table.headers];
  const rows = table.rows.map((row, index) => {
    const number = String(start + index).padStart(startingValue.length, "0");
    if (accessionColumn < 0) return [number, ...row];
    return headers.map((_, column) => column === accessionColumn ? number : row[column] ?? "");
  });
  return {headers, rows};
}

const roundMoney = value => Math.round((value + Number.EPSILON) * 100) / 100;

function detectDelimiter(input) {
  const candidates = [",", ";", "\t"];
  let quoted = false;
  const counts = candidates.map(() => 0);
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === '"') {
      if (quoted && input[index + 1] === '"') index += 1;
      else quoted = !quoted;
    } else if (!quoted && (char === "\n" || char === "\r")) {
      break;
    } else if (!quoted) {
      const candidate = candidates.indexOf(char);
      if (candidate >= 0) counts[candidate] += 1;
    }
  }
  return candidates[counts.indexOf(Math.max(...counts))];
}

export function parseCsv(input, separator) {
  const source = input.replace(/^\uFEFF/, "");
  if (!source.trim()) return {headers: [], rows: []};
  const delimiter = separator || detectDelimiter(source);
  const records = [];
  let record = [];
  let field = "";
  let quoted = false;

  const finishField = () => {
    record.push(field);
    field = "";
  };
  const finishRecord = () => {
    finishField();
    if (record.some(value => value.trim() !== "")) records.push(record);
    record = [];
  };

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field.length === 0) {
      quoted = true;
    } else if (char === delimiter) {
      finishField();
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      finishRecord();
    } else {
      field += char;
    }
  }
  if (quoted) throw new Error("The CSV contains an unfinished quoted field.");
  if (field.length > 0 || record.length > 0) finishRecord();
  if (!records.length) return {headers: [], rows: []};

  const headers = records.shift().map(value => value.trim());
  const rows = records.map(row => headers.map((_, index) => row[index] ?? ""));
  return {headers, rows};
}

export function calculatePurchaseTotals(items, discountPercent, taxPercent) {
  if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    throw new RangeError("Discount must be between 0 and 100 percent.");
  }
  if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
    throw new RangeError("Tax must be between 0 and 100 percent.");
  }
  for (const item of items) {
    if (!Number.isFinite(item.quantity) || item.quantity < 0 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
      throw new RangeError("Quantity and unit price must be zero or greater.");
    }
  }
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const discount = roundMoney(subtotal * discountPercent / 100);
  const taxableAmount = roundMoney(subtotal - discount);
  const tax = roundMoney(taxableAmount * taxPercent / 100);
  return {subtotal, discount, taxableAmount, tax, total: roundMoney(taxableAmount + tax)};
}

export function clampLabelFontSize(value) {
  if (!Number.isFinite(value)) return 14;
  return Math.max(6, Math.min(24, value));
}
