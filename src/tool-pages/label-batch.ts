import "../styles.css";
import "./batch2.css";
import "./label-batch.css";
import {esc} from "./html";
import {parseCsv} from "./batch2-utils.mjs";
import {clampLabelSheet,mapLabelRows,makeSequentialAccessionLabels} from "./label-batch-utils.mjs";

const root=document.querySelector<HTMLElement>("#tool-app");
if(!root)throw new Error("Tool page container was not found.");
const kind=root.dataset.tool||"";
const title=kind==="spine-label"?"Spine Labels from CSV":kind==="four-line-label"?"Four-Line Library Label Generator":kind==="book-label"?"Book Identification Label Maker":kind==="accession-label"?"Accession Number Label Generator":"Custom Library Label Designer";
const isCsv=["spine-label","four-line-label","book-label"].includes(kind),isAccession=kind==="accession-label";
const intro=kind==="spine-label"?"Import call numbers and accession details from CSV. Classification text is printed as supplied.":kind==="four-line-label"?"Import catalog records and print up to four useful lines on each label.":kind==="book-label"?"Print book ownership labels with an institution, title, accession number, or department.":isAccession?"Generate a padded accession sequence or paste custom accession values.":"Enter one custom label per line and set the sheet layout.";
root.innerHTML=`<section class="batch-tool label-batch"><header class="batch-tool-heading"><p class="batch-eyebrow">Library Toolkit</p><h1>${title}</h1><p>Set label dimensions, review the sheet, and print at actual size.</p></header><div class="batch-layout"><form class="batch-panel batch-input-panel" id="label-form"><p class="batch-intro">${intro}</p>${isCsv?'<label class="batch-field">Choose a CSV file<input id="label-file" type="file" accept=".csv,text/csv"></label><label class="batch-field">Or paste CSV data<textarea id="label-input" rows="7" spellcheck="false" placeholder="Call Number,Author,Title,Accession"></textarea></label>':''}${kind==="book-label"?'<label class="batch-field">Library or institution<input id="book-library" type="text" maxlength="100"></label><label class="batch-field">Title or description<input id="book-title" type="text" maxlength="160"></label><div class="batch-field-grid"><label class="batch-field">Accession number<input id="book-accession" type="text" maxlength="40"></label><label class="batch-field">Department / class<input id="book-department" type="text" maxlength="80"></label></div>':''}${isAccession?'<label class="batch-field">Generation method<select id="accession-mode"><option value="sequence">Numbered sequence</option><option value="custom">Custom values</option></select></label><div id="accession-sequence"><div class="batch-field-grid"><label class="batch-field">Starting number<input id="accession-start" type="text" inputmode="numeric" value="000001" maxlength="16"></label><label class="batch-field">Number of labels<input id="accession-count" type="number" min="1" max="500" value="50"></label></div><label class="batch-field">Prefix (optional)<input id="accession-prefix" type="text" maxlength="16"></label></div><label class="batch-field" id="accession-values-field" hidden>Custom accession values<textarea id="accession-values" rows="7" placeholder="ACC-001&#10;ACC-002"></textarea></label>':''}${kind==="label-designer"?'<label class="batch-field">Label text, one per line<textarea id="custom-labels" rows="8" placeholder="Library property&#10;Please return to the desk"></textarea></label>':''}<div class="batch-field-grid"><label class="batch-field">Label width (mm)<input id="label-width" type="number" min="25" max="180" value="70"></label><label class="batch-field">Label height (mm)<input id="label-height" type="number" min="15" max="100" value="35"></label></div><div class="batch-field-grid"><label class="batch-field">Columns<input id="label-cols" type="number" min="1" max="5" value="2"></label><label class="batch-field">Text size (pt)<input id="label-font" type="number" min="6" max="36" value="14"></label></div>${kind==="spine-label"?'<label class="batch-field">Library name (optional)<input id="label-library" type="text" maxlength="100"></label>':''}<p class="batch-status" id="label-status" role="status" aria-live="polite">Your records stay in this browser.</p><div class="batch-actions"><button class="batch-primary" type="submit">Generate preview</button><button class="batch-secondary" id="label-print" type="button">Print sheet / Save as PDF</button></div></form><section class="batch-panel batch-preview-panel" aria-labelledby="label-preview-title"><div class="batch-preview-heading"><div><h2 id="label-preview-title">Label sheet</h2><p id="label-summary">No labels generated yet.</p></div><span class="batch-local-note">Processed locally</span></div><div id="label-preview" class="label-batch-preview"><p class="batch-empty">Your labels will appear here.</p></div></section></div></section>`;
const $=<T extends HTMLElement>(id:string)=>root.querySelector<T>("#"+id)!;
const input=(id:string)=>root.querySelector<HTMLInputElement>("#"+id)?.value.trim()||"";
const status=$<HTMLParagraphElement>("label-status"),preview=$<HTMLDivElement>("label-preview"),summary=$<HTMLParagraphElement>("label-summary");
const setStatus=(message:string)=>{status.textContent=message;};
let table:{headers:string[];rows:string[][]}|null=null,ready=false;
const schemas:Record<string,{key:string;aliases:string[]}[]>={
  "spine-label":[{key:"class",aliases:["callnumber","classification","classno"]},{key:"cutter",aliases:["cutter","authornumber"]},{key:"accession",aliases:["accession","accessionno","accessionnumber"]}],
  "four-line-label":[{key:"class",aliases:["callnumber","classification","classno"]},{key:"author",aliases:["author","creator"]},{key:"title",aliases:["title","booktitle"]},{key:"accession",aliases:["accession","accessionno","accessionnumber"]}],
  "book-label":[{key:"title",aliases:["title","booktitle","description"]},{key:"accession",aliases:["accession","accessionno","accessionnumber"]},{key:"department",aliases:["department","class","course"]},{key:"library",aliases:["library","institution","school"]}],
};
function labelLines(record:Record<string,string>):string[]{
  if(kind==="spine-label")return [record.class,record.cutter,record.accession].filter(Boolean);
  if(kind==="four-line-label")return [record.class,record.author,record.title,record.accession].filter(Boolean);
  if(kind==="book-label")return [record.library||input("book-library"),record.title||input("book-title"),record.accession||input("book-accession"),record.department||input("book-department")].filter(Boolean);
  return [];
}
function render(){
  ready=false;
  try{
    let records:Record<string,string>[]=[];
    if(isCsv){const raw=$<HTMLTextAreaElement>("label-input").value.trim();if(kind==="book-label"&&!raw&&!table&&(input("book-title")||input("book-accession")))records=[{title:input("book-title"),accession:input("book-accession"),department:input("book-department"),library:input("book-library")}];else{if(!table)table=parseCsv(raw);if(!table||!table.rows.length)throw new Error("Add a CSV header row and at least one record.");if(table.rows.length>500)throw new Error("Create label sheets in batches of 500 records or fewer.");records=mapLabelRows(table,schemas[kind]);}}
    else if(isAccession){
      if($<HTMLSelectElement>("accession-mode").value==="sequence")records=makeSequentialAccessionLabels({start:input("accession-start"),count:Number(input("accession-count")),prefix:input("accession-prefix")}).map(accession=>({accession}));
      else records=$<HTMLTextAreaElement>("accession-values").value.split(/\r?\n/).map(value=>value.trim()).filter(Boolean).map(accession=>({accession}));
    }else records=$<HTMLTextAreaElement>("custom-labels").value.split(/\r?\n/).map(text=>text.trim()).filter(Boolean).map(text=>({text}));
    if(!records.length||records.length>500)throw new Error("Enter between 1 and 500 label records.");
    const layout=clampLabelSheet({width:Number(input("label-width")),height:Number(input("label-height")),columns:Number(input("label-cols")),fontSize:Number(input("label-font"))});
    const sheet=document.createElement("div");sheet.className="label-batch-sheet";sheet.style.setProperty("--label-cols",String(layout.columns));sheet.style.setProperty("--label-width",layout.width+"mm");sheet.style.setProperty("--label-height",layout.height+"mm");sheet.style.setProperty("--label-font",layout.fontSize+"pt");
    for(const record of records){
      const label=document.createElement("article");label.className="label-batch-item";
      const lines=kind==="accession-label"?[record.accession]:kind==="label-designer"?[record.text]:labelLines(record);
      if(kind==="spine-label"&&input("label-library")){const library=document.createElement("small");library.textContent=input("label-library");label.append(library);}
      if(!lines.length){const empty=document.createElement("span");empty.className="label-empty-record";empty.textContent="No mapped label fields";label.append(empty);}
      for(const text of lines){const line=document.createElement("span");line.textContent=text;label.append(line);}
      sheet.append(label);
    }
    preview.replaceChildren(sheet);ready=true;summary.textContent=`${records.length} labels · ${layout.width} × ${layout.height} mm · ${layout.columns} columns`;setStatus("Preview generated. Check a sample at actual size before printing a full batch.");
  }catch(error){preview.innerHTML=`<p class="batch-error">${esc(error instanceof Error?error.message:"Could not make these labels.")}</p>`;summary.textContent="Preview could not be created.";setStatus("Check the data and label settings.");}
}
$<HTMLFormElement>("label-form").addEventListener("submit",event=>{event.preventDefault();render();});
$<HTMLButtonElement>("label-print").addEventListener("click",()=>{if(!ready){setStatus("Generate a valid preview before printing.");return;}window.print();});
if(isCsv){
  const textarea=$<HTMLTextAreaElement>("label-input");
  textarea.addEventListener("input",()=>{table=null;});
  $<HTMLInputElement>("label-file").addEventListener("change",async event=>{const file=(event.currentTarget as HTMLInputElement).files?.[0];if(!file)return;if(file.size>5*1024*1024){setStatus("Choose a CSV file smaller than 5 MB.");return;}try{textarea.value=await file.text();table=parseCsv(textarea.value);setStatus(`${table.rows.length} CSV records loaded.`);}catch(error){table=null;setStatus(error instanceof Error?error.message:"The CSV could not be read.");}});
}
if(isAccession){$<HTMLSelectElement>("accession-mode").addEventListener("change",event=>{const sequence=(event.currentTarget as HTMLSelectElement).value==="sequence";$<HTMLDivElement>("accession-sequence").hidden=!sequence;$<HTMLLabelElement>("accession-values-field").hidden=sequence;});}
