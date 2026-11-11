import "../styles.css";
import "./batch2.css";
import "./library-print-tools.css";
import {clampOwnershipStamp,parseArrivalBooks,validateDueDateSlip} from "./library-print-utils.mjs";

const appRoot=document.querySelector<HTMLElement>("#tool-app");
if(!appRoot)throw new Error("Tool page container was not found.");
const root:HTMLElement=appRoot,kind=root.dataset.tool||"";
const esc=(value:string)=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]||char));
const today=()=>{const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;};
const addDays=(date:string,days:number)=>{const value=new Date(`${date}T12:00:00`);value.setDate(value.getDate()+days);return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,"0")}-${String(value.getDate()).padStart(2,"0")}`;};
const $=<T extends HTMLElement>(id:string)=>root.querySelector<T>(`#${id}`)!;
const field=(label:string,id:string,type="text",value="",extra="")=>`<label class="batch-field">${label}<input id="${id}" type="${type}" value="${esc(value)}" ${extra}></label>`;
root.innerHTML=`<section class="batch-tool library-print-tool"><header class="batch-tool-heading"><p class="batch-eyebrow">Library Toolkit</p><h1>${kind==="new-arrivals-poster"?"New Arrivals Poster Maker":kind==="due-date-slip"?"Library Due Date Slip":"Library Ownership Stamp Maker"}</h1><p>${kind==="new-arrivals-poster"?"Make a welcoming poster to share the newest books in your collection.":kind==="due-date-slip"?"Prepare clear, printable due-date reminders for borrowed books.":"Create printable book ownership stamps for your collection."}</p></header><div class="batch-layout"><form class="batch-panel batch-input-panel" id="library-print-form"><p class="batch-intro">Your details stay in this browser. Review the preview before printing.</p><div id="library-print-fields"></div><p class="batch-status" id="library-print-status" role="status" aria-live="polite">Fill in the details to make a preview.</p><div class="batch-actions"><button class="batch-primary" type="submit">Update preview</button><button class="batch-secondary" id="library-print-button" type="button">Print / Save as PDF</button></div></form><section class="batch-panel batch-preview-panel" aria-labelledby="library-print-preview-title"><div class="batch-preview-heading"><div><h2 id="library-print-preview-title">Print preview</h2><p id="library-print-summary">No preview yet.</p></div><span class="batch-local-note">Processed on this device</span></div><div id="library-print-preview" class="library-print-preview"><p class="batch-empty">Your preview will appear here.</p></div></section></div></section>`;
const fields=$<HTMLDivElement>("library-print-fields"),preview=$<HTMLDivElement>("library-print-preview"),summary=$<HTMLParagraphElement>("library-print-summary"),status=$<HTMLParagraphElement>("library-print-status");
const input=(id:string)=>$<HTMLInputElement>(id).value.trim();
const select=(id:string)=>$<HTMLSelectElement>(id).value;
const setStatus=(message:string)=>{status.textContent=message;};
let ready=false;

function mountPoster(){
  fields.innerHTML=`${field("Library or institution","poster-library")}${field("Poster heading","poster-heading","text","New Arrivals")}${field("Short message (optional)","poster-message")}${field("Collection period (optional)","poster-period","text",new Date().toLocaleString(undefined,{month:"long",year:"numeric"}))}<label class="batch-field">Books, one per line: title | author | call number<textarea id="poster-books" rows="9" placeholder="The Secret Garden | Frances Hodgson Burnett | F BUR&#10;The Wild Robot | Peter Brown | F BRO"></textarea></label><div class="batch-field-grid"><label class="batch-field">Poster size<select id="poster-paper"><option value="A4">A4</option><option value="A3">A3</option></select></label><label class="batch-field">Orientation<select id="poster-orientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label></div><label class="batch-field">Colour theme<select id="poster-theme"><option value="blue">Library blue</option><option value="green">Garden green</option><option value="warm">Warm paper</option></select></label>`;
}
function renderPoster(){
  const books=parseArrivalBooks($<HTMLTextAreaElement>("poster-books").value);
  const library=input("poster-library");if(!library)throw new RangeError("Enter your library name.");
  const paper=select("poster-paper"),orientation=select("poster-orientation");
  let printRule=document.querySelector<HTMLStyleElement>("#library-print-page-rule");if(!printRule){printRule=document.createElement("style");printRule.id="library-print-page-rule";document.head.append(printRule);}printRule.textContent=`@page{size:${paper} ${orientation};margin:10mm}`;
  preview.innerHTML=`<article class="arrival-poster theme-${select("poster-theme")}"><header><p>${esc(library)}</p><h2>${esc(input("poster-heading")||"New Arrivals")}</h2>${input("poster-message")?`<p class="poster-message">${esc(input("poster-message"))}</p>`:""}${input("poster-period")?`<span class="poster-period">${esc(input("poster-period"))}</span>`:""}</header><section class="arrival-book-grid">${books.map(book=>`<article class="arrival-book"><span class="arrival-book-mark" aria-hidden="true">✦</span><h3>${esc(book.title)}</h3>${book.author?`<p>${esc(book.author)}</p>`:""}${book.callNumber?`<small>${esc(book.callNumber)}</small>`:""}</article>`).join("")}</section><footer>Come in and find your next favourite book.</footer></article>`;
  summary.textContent=`${books.length} books · ${paper} ${orientation}`;
}
function mountDueSlip(){
  const issue=today();
  fields.innerHTML=`${field("Library or institution","slip-library")}${field("Borrower's name","slip-borrower")}${field("Member ID","slip-member-id")}${field("Book title","slip-book-title")}${field("Accession / barcode number","slip-accession")}${field("Issue date","slip-issue-date","date",issue)}${field("Return by","slip-due-date","date",addDays(issue,14))}<div class="batch-field-grid">${field("Number of copies","slip-copies","number","1","min='1' max='20'")}${field("Library phone / desk (optional)","slip-contact")}</div>`;
}
function renderDueSlip(){
  const slip=validateDueDateSlip({bookTitle:input("slip-book-title"),borrower:input("slip-borrower"),memberId:input("slip-member-id"),issueDate:input("slip-issue-date"),dueDate:input("slip-due-date")});
  const copies=Math.max(1,Math.min(20,Math.round(Number(input("slip-copies"))||1))),library=input("slip-library");
  const date=(value:string)=>new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeZone:"UTC"}).format(new Date(`${value}T12:00:00Z`));
  preview.innerHTML=`<div class="due-slip-sheet">${Array.from({length:copies},()=>`<article class="due-slip"><header>${esc(library||"Library")}</header><p class="due-slip-label">Please return this book by</p><strong class="due-slip-date">${date(slip.dueDate)}</strong><dl><div><dt>Book</dt><dd>${esc(slip.bookTitle)}</dd></div>${input("slip-accession")?`<div><dt>Accession</dt><dd>${esc(input("slip-accession"))}</dd></div>`:""}<div><dt>Borrower</dt><dd>${esc(slip.borrower)} · ${esc(slip.memberId)}</dd></div><div><dt>Issued</dt><dd>${date(slip.issueDate)}</dd></div></dl>${input("slip-contact")?`<footer>${esc(input("slip-contact"))}</footer>`:""}</article>`).join("")}</div>`;
  summary.textContent=`${copies} printable slip${copies===1?"":"s"}`;
}
function mountStamp(){
  fields.innerHTML=`${field("Library or institution","stamp-library")}${field("Stamp heading","stamp-heading","text","This book belongs to")}${field("Department / collection (optional)","stamp-department")}${field("Additional line (optional)","stamp-note")}${field("Stamp number (optional)","stamp-number")}<div class="batch-field-grid">${field("Stamp width (mm)","stamp-width","number","65","min='20' max='100'")}${field("Stamp height (mm)","stamp-height","number","35","min='20' max='100'")}</div><div class="batch-field-grid">${field("Copies per sheet","stamp-copies","number","8","min='1' max='60'")}<label class="batch-field">Stamp shape<select id="stamp-shape"><option value="oval">Oval</option><option value="rectangle">Rectangle</option><option value="round">Round</option></select></label></div><div class="batch-field-grid"><label class="batch-field">Ink colour<select id="stamp-ink"><option value="blue">Blue</option><option value="black">Black</option><option value="green">Green</option><option value="red">Red</option></select></label>${field("Text size (pt)","stamp-font","number","12","min='6' max='30'")}</div>`;
}
function renderStamp(){
  const layout=clampOwnershipStamp({width:Number(input("stamp-width")),height:Number(input("stamp-height")),copies:Number(input("stamp-copies")),fontSize:Number(input("stamp-font"))});
  const library=input("stamp-library");if(!library)throw new RangeError("Enter your library or institution name.");
  preview.innerHTML=`<div class="ownership-stamp-sheet">${Array.from({length:layout.copies},()=>`<article class="ownership-stamp shape-${select("stamp-shape")} ink-${select("stamp-ink")}" style="width:${layout.width}mm;height:${layout.height}mm;font-size:${layout.fontSize}pt"><span>${esc(input("stamp-heading")||"This book belongs to")}</span><strong>${esc(library)}</strong>${input("stamp-department")?`<b>${esc(input("stamp-department"))}</b>`:""}${input("stamp-note")?`<small>${esc(input("stamp-note"))}</small>`:""}${input("stamp-number")?`<small>${esc(input("stamp-number"))}</small>`:""}</article>`).join("")}</div>`;
  summary.textContent=`${layout.copies} stamps · ${layout.width} × ${layout.height} mm`;
}
const render=()=>{ready=false;try{if(kind==="new-arrivals-poster")renderPoster();else if(kind==="due-date-slip")renderDueSlip();else renderStamp();ready=true;setStatus("Preview is ready. Check the layout before printing.");}catch(error){preview.innerHTML=`<p class="batch-error">${esc(error instanceof Error?error.message:"Check the details and try again.")}</p>`;summary.textContent="Preview needs attention.";setStatus("Check the details and try again.");}};
$<HTMLFormElement>("library-print-form").addEventListener("submit",event=>{event.preventDefault();render();});
$<HTMLButtonElement>("library-print-button").addEventListener("click",()=>{if(!ready){setStatus("Create a valid preview before printing.");return;}window.print();});
if(kind==="new-arrivals-poster")mountPoster();else if(kind==="due-date-slip")mountDueSlip();else if(kind==="ownership-stamp")mountStamp();else throw new Error("Unknown library print tool.");
