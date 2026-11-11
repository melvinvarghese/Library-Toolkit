import test from "node:test";
import assert from "node:assert/strict";
import {formatDdcLabel} from "../src/tool-pages/ddc-helper-utils.mjs";

test("formatDdcLabel keeps the supplied DDC class and appends optional cutter and year",()=>{
  assert.deepEqual(formatDdcLabel({classNumber:"005.133",cutter:"S65",year:"2024"}),{lines:["005.133","S65","2024"],callNumber:"005.133 S65 2024"});
});

test("formatDdcLabel accepts unusual local class text without reclassifying it",()=>{
  assert.equal(formatDdcLabel({classNumber:"QA76.73 .J38",cutter:"M42"}).callNumber,"QA76.73 .J38 M42");
});

test("formatDdcLabel requires a class value and bounds label line lengths",()=>{
  assert.throws(()=>formatDdcLabel({classNumber:"   "}),/class number/i);
  assert.throws(()=>formatDdcLabel({classNumber:"A".repeat(161)}),/160/);
});
