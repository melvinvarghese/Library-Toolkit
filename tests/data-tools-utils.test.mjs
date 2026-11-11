import test from "node:test";
import assert from "node:assert/strict";
import {cleanCsvTable, mapCsvColumns, formatCsvTable, serializeCsv, formatTextLines} from "../src/tool-pages/data-tools-utils.mjs";

test("cleanCsvTable trims cells and removes blank and duplicate rows", () => {
  assert.deepEqual(cleanCsvTable({headers:[" Name ","ID"],rows:[[" Ria ","1"],["Ria","1"],[" ",""]]}, {removeDuplicates:true}), {
    headers:["Name","ID"],rows:[["Ria","1"]],removedBlankRows:1,removedDuplicateRows:1,
  });
});

test("mapCsvColumns renames and reorders selected source columns", () => {
  assert.deepEqual(mapCsvColumns({headers:["Name","Card #","Unused"],rows:[["Ria","M-3","x"]]},[
    {source:"Card #",target:"Member ID"},{source:"Name",target:"Member name"},
  ]),{headers:["Member ID","Member name"],rows:[["M-3","Ria"]]});
});

test("formatCsvTable changes selected text casing and column order", () => {
  assert.deepEqual(formatCsvTable({headers:["Title","Author"],rows:[["  the sea  ","R. Writer"]]}, {order:[1,0],caseMode:"title"}), {
    headers:["Author","Title"],rows:[["R. Writer","The Sea"]],
  });
});

test("serializeCsv quotes commas, quotes and line breaks and neutralizes formulas", () => {
  assert.equal(serializeCsv(["Name","Value"],[["Ria, M.","=1+1"],["Say \"hello\"","two\nlines"]]),
    'Name,Value\r\n"Ria, M.",\'=1+1\r\n"Say ""hello""","two\nlines"');
});

test("formatTextLines trims, removes blanks, optionally deduplicates and sorts", () => {
  assert.equal(formatTextLines(" beta \n\nAlpha\nbeta\n", {unique:true,sort:"ascending",caseMode:"upper"}), "ALPHA\nBETA");
});

test("mapping rejects missing or duplicate source columns", () => {
  const table={headers:["Name"],rows:[["Ria"]]};
  assert.throws(()=>mapCsvColumns(table,[{source:"Missing",target:"Out"}]),/not found/i);
  assert.throws(()=>mapCsvColumns(table,[{source:"Name",target:"A"},{source:"Name",target:"B"}]),/more than once/i);
});
