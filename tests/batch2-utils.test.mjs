import test from "node:test";
import assert from "node:assert/strict";
import {parseCsv, calculatePurchaseTotals, clampLabelFontSize, addSequentialAccessionNumbers} from "../src/tool-pages/batch2-utils.mjs";

test("parseCsv reads commas and escaped quotes inside quoted fields", () => {
  assert.deepEqual(parseCsv('Title,Note\r\n"Sea, Sand","A ""quoted"" note"'), {
    headers: ["Title", "Note"],
    rows: [["Sea, Sand", 'A "quoted" note']],
  });
});

test("parseCsv preserves line breaks inside a quoted cell and ignores blank rows", () => {
  assert.deepEqual(parseCsv('Name,Call number\nMaya,"025.3\nMAY"\n\n'), {
    headers: ["Name", "Call number"],
    rows: [["Maya", "025.3\nMAY"]],
  });
});

test("parseCsv detects semicolons and removes a spreadsheet byte-order mark", () => {
  assert.deepEqual(parseCsv('\uFEFFTitle;Author\nSea and Sand;A. Writer'), {
    headers: ["Title", "Author"],
    rows: [["Sea and Sand", "A. Writer"]],
  });
});

test("parseCsv reports an unfinished quoted field", () => {
  assert.throws(() => parseCsv('Name,Note\nMaya,"unfinished'), /unfinished quoted field/);
});

test("calculatePurchaseTotals applies discount before tax", () => {
  assert.deepEqual(calculatePurchaseTotals([
    {quantity: 2, unitPrice: 125},
    {quantity: 1, unitPrice: 80},
  ], 10, 5), {
    subtotal: 330,
    discount: 33,
    taxableAmount: 297,
    tax: 14.85,
    total: 311.85,
  });
});

test("calculatePurchaseTotals rejects a discount above 100 percent", () => {
  assert.throws(() => calculatePurchaseTotals([{quantity: 1, unitPrice: 10}], 101, 0), /between 0 and 100/);
});

test("clampLabelFontSize stays within printable limits", () => {
  assert.equal(clampLabelFontSize(4), 6);
  assert.equal(clampLabelFontSize(14), 14);
  assert.equal(clampLabelFontSize(32), 24);
  assert.equal(clampLabelFontSize(Number.NaN), 14);
});

test("addSequentialAccessionNumbers preserves leading zeroes", () => {
  assert.deepEqual(addSequentialAccessionNumbers({
    headers: ["Title", "Author"],
    rows: [["Sea and Sand", "A. Writer"], ["Green Shelf", "B. Reader"]],
  }, "0007"), {
    headers: ["Accession number", "Title", "Author"],
    rows: [["0007", "Sea and Sand", "A. Writer"], ["0008", "Green Shelf", "B. Reader"]],
  });
});

test("addSequentialAccessionNumbers replaces an existing accession column", () => {
  assert.deepEqual(addSequentialAccessionNumbers({
    headers: ["Title", "Accession No."],
    rows: [["Sea and Sand", "old"], ["Green Shelf", "old"]],
  }, "41"), {
    headers: ["Title", "Accession No."],
    rows: [["Sea and Sand", "41"], ["Green Shelf", "42"]],
  });
});

test("addSequentialAccessionNumbers rejects an unsafe final value", () => {
  assert.throws(() => addSequentialAccessionNumbers({
    headers: ["Title"],
    rows: [["One"], ["Two"]],
  }, String(Number.MAX_SAFE_INTEGER)), /safe integer/);
});
