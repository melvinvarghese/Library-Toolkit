import test from "node:test";
import assert from "node:assert/strict";
import {parseArrivalBooks,validateDueDateSlip,clampOwnershipStamp} from "../src/tool-pages/library-print-utils.mjs";

test("parseArrivalBooks reads title, author, and call number rows and bounds a poster",()=>{
  assert.deepEqual(parseArrivalBooks("The Sea | R. Writer | 823.9\nQuiet Woods | A. Author | 551.2"),[
    {title:"The Sea",author:"R. Writer",callNumber:"823.9"},
    {title:"Quiet Woods",author:"A. Author",callNumber:"551.2"},
  ]);
  assert.throws(()=>parseArrivalBooks(Array.from({length:41},(_,i)=>`Book ${i+1}`).join("\n")),/40/);
});

test("validateDueDateSlip requires borrower and book details and rejects a due date before issue",()=>{
  assert.deepEqual(validateDueDateSlip({bookTitle:"The Sea",borrower:"Riya Nair",memberId:"M-01",issueDate:"2026-11-01",dueDate:"2026-11-15"}),{
    bookTitle:"The Sea",borrower:"Riya Nair",memberId:"M-01",issueDate:"2026-11-01",dueDate:"2026-11-15",
  });
  assert.throws(()=>validateDueDateSlip({bookTitle:"The Sea",borrower:"Riya Nair",memberId:"M-01",issueDate:"2026-11-15",dueDate:"2026-11-14"}),/before/i);
});

test("clampOwnershipStamp bounds print dimensions, copies, and type size",()=>{
  assert.deepEqual(clampOwnershipStamp({width:500,height:10,copies:100,fontSize:50}),{width:100,height:20,copies:60,fontSize:30});
});
