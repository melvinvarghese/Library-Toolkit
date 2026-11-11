import test from "node:test";
import assert from "node:assert/strict";
import {mapLabelRows,makeSequentialAccessionLabels,clampLabelSheet} from "../src/tool-pages/label-batch-utils.mjs";

test("mapLabelRows recognizes call number, cutter and accession headings",()=>{
  assert.deepEqual(mapLabelRows({headers:["Call Number","Cutter","Accession No."],rows:[["823.914","ORW","00031"]]},[
    {key:"class",aliases:["callnumber","classification"]},{key:"cutter",aliases:["cutter","authornumber"]},{key:"accession",aliases:["accession","accessionno"]},
  ]),[{class:"823.914",cutter:"ORW",accession:"00031"}]);
});

test("makeSequentialAccessionLabels preserves starting zeroes and prefix",()=>{
  assert.deepEqual(makeSequentialAccessionLabels({start:"0008",count:3,prefix:"LIB-"}),["LIB-0008","LIB-0009","LIB-0010"]);
});

test("makeSequentialAccessionLabels rejects unsafe or oversized batches",()=>{
  assert.throws(()=>makeSequentialAccessionLabels({start:"8x",count:2}),/digits/i);
  assert.throws(()=>makeSequentialAccessionLabels({start:"1",count:501}),/500/i);
});

test("clampLabelSheet keeps sizes and typography within print limits",()=>{
  assert.deepEqual(clampLabelSheet({width:10,height:200,columns:9,fontSize:4}),{width:25,height:100,columns:5,fontSize:6});
});
