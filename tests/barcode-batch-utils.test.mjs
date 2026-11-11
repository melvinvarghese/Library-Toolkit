import test from "node:test";
import assert from "node:assert/strict";
import {suggestBarcodeColumns, prepareBarcodeRecords, clampBarcodeSheet} from "../src/tool-pages/barcode-batch-utils.mjs";

test("suggestBarcodeColumns finds member ID and name fields from varied headings", () => {
  assert.deepEqual(suggestBarcodeColumns(["Full Name","Membership ID","Course"],{member:true}),{valueIndex:1,captionIndex:0});
});

test("prepareBarcodeRecords trims values, captions, and skips blank barcode cells", () => {
  assert.deepEqual(prepareBarcodeRecords({headers:["Accession","Title"],rows:[[" A-1 ","Book"],[" ","Empty"]]}, {valueIndex:0,captionIndex:1}), {
    records:[{value:"A-1",caption:"Book"}],skippedEmpty:1,
  });
});

test("prepareBarcodeRecords rejects out-of-range columns and oversized batches", () => {
  const table={headers:["ID"],rows:[["1"],["2"]]};
  assert.throws(()=>prepareBarcodeRecords(table,{valueIndex:2}),/column/i);
  assert.throws(()=>prepareBarcodeRecords(table,{valueIndex:0,maxRecords:1}),/1,? records|batch/i);
});

test("barcode sheet dimensions and layout settings are clamped", () => {
  assert.deepEqual(clampBarcodeSheet({pageWidth:80,pageHeight:900,margin:90,gap:-1,columns:10}),{pageWidth:100,pageHeight:594,margin:30,gap:0,columns:6});
});
