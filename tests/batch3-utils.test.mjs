import test from "node:test";
import assert from "node:assert/strict";
import QRCode from "qrcode/lib/core/qrcode.js";
import jsQR from "jsqr";
import {calculateFine, parseCalendarDate, deriveReportStats, mapCsvRows} from "../src/tool-pages/batch3-utils.mjs";

const fine = overrides => calculateFine({issueDate:"2024-02-20",dueDate:"2024-02-28",returnDate:"2024-03-02",dailyRate:5,...overrides});
test("fine counts calendar days across month boundaries and leap years", () => {
  assert.equal(fine().overdueDays, 3);
  assert.equal(calculateFine({issueDate:"2024-02-28",dueDate:"2024-02-28",returnDate:"2024-03-01",dailyRate:2}).fine, 4);
});
test("fine applies grace and maximum cap", () => {
  assert.deepEqual(fine({graceDays:1,maximumFine:5}), {overdueDays:3,chargeableDays:2,dailyRate:5,uncappedFine:10,fine:5,maximumFine:5});
  assert.equal(fine({returnDate:"2024-02-28"}).fine, 0);
  assert.equal(fine({graceDays:3}).fine, 0);
  assert.equal(fine({maximumFine:0}).fine, 0);
});
test("fine rejects impossible, malformed and reversed dates", () => {
  assert.throws(() => parseCalendarDate("2023-02-29"), /valid date/);
  assert.throws(() => fine({dueDate:"2024-02-19"}), /before the issue/);
  assert.throws(() => fine({returnDate:"not-a-date"}), /valid date/);
});
test("CSV column mapping accepts common header variations and missing columns", () => {
  assert.deepEqual(mapCsvRows({headers:["Member ID","Full Name"],rows:[["M-1","Riya"]]}, {id:["memberid"],name:["fullname"],expiry:["expiry"]}), [{id:"M-1",name:"Riya",expiry:""}]);
});
test("annual report derives totals and rejects negative totals", () => {
  assert.deepEqual(deriveReportStats({collection:"1000",added:"80",withdrawn:"12",issued:"500",returned:"450",members:"200",newMembers:"30"}), {closingCollection:1068,circulation:500,netMembership:230});
  assert.throws(() => deriveReportStats({collection:"-2"}), /zero or greater/);
});

test("generated QR symbols decode for URLs, accession numbers and text", () => {
  for (const value of ["https://example.com/catalog/123", "BOOK-ACC-000184", "Library Toolkit scan test"]) {
    const symbol = QRCode.create(value);
    const scale = 8, border = 4, width = (symbol.modules.size + border * 2) * scale;
    const pixels = new Uint8ClampedArray(width * width * 4);
    for (let y = 0; y < width; y += 1) for (let x = 0; x < width; x += 1) {
      const mx = Math.floor(x / scale) - border, my = Math.floor(y / scale) - border;
      const dark = mx >= 0 && my >= 0 && mx < symbol.modules.size && my < symbol.modules.size && symbol.modules.data[my * symbol.modules.size + mx];
      const offset = (y * width + x) * 4, color = dark ? 0 : 255;
      pixels[offset] = color; pixels[offset + 1] = color; pixels[offset + 2] = color; pixels[offset + 3] = 255;
    }
    assert.equal(jsQR(pixels, width, width)?.data, value);
  }
});
