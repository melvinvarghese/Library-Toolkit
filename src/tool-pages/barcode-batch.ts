import "../styles.css";
import "./batch2.css";
import "./barcode-batch.css";
import JsBarcode from "jsbarcode";
import {parseCsv} from "./batch2-utils.mjs";
import {clampBarcodeSheet,prepareBarcodeRecords,suggestBarcodeColumns} from "./barcode-batch-utils.mjs";

const root=document.querySelector<HTMLElement>("#tool-app");
if(!root)throw new Error("Tool page container was not found.");
const kind=root.dataset.tool||"";
const isCsv=kind!=="barcode-sheet",member=kind==="member-barcode";
const title=kind==="csv-barcode"?"Barcode Labels from CSV":member?"Library Member Barcode Generator":"Barcode Sheet Designer";
const intro=kind==="csv-barcode"?"Paste or load a CSV with a header row, then choose the barcode and caption columns.":member?"Load member records and choose the membership ID and member name columns.":"Enter one value per line and arrange barcodes on a sheet sized to your paper.";
const esc=(s:string)=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
root.innerHTML=`<section class="batch-tool barcode-batch"><header class="batch-tool-heading"><p class="batch-eyebrow">Library Toolkit</p><h1>${title}</h1><p>Preview scanner-ready barcodes, then print a sheet. Values stay in this browser.</p></header><div class="batch-layout"><form class="batch-panel batch-input-panel" id="barcode-form"><p class="batch-intro">${intro}</p>${isCsv?'<label class="batch-field">Choose a CSV file<input id="barcode-file" type="file" accept=".csv,text/csv"></label><label class="batch-field">Or paste CSV data<textarea id="barcode-input" rows="8" spellcheck="false" placeholder="Member ID,Name&#10;LIB-000184,Riya Nair"></textarea></label><label class="batch-field">Barcode column<select id="barcode-column"><option value="">Load CSV first</option></select></label><label class="batch-field">Caption column (optional)<select id="caption-column"><option value="-1">No caption</option></select></label>':'<label class="batch-field">Values to encode, one per line<textarea id="barcode-input" rows="8" required placeholder="LIB-000184&#10;LIB-000185"></textarea></label>'}<div class="batch-field-grid"><label class="batch-field">Barcode format<select id="barcode-format"><option>CODE128</option><option>CODE39</option><option>EAN13</option><option>EAN8</option><option>UPC</option></select></label><label class="batch-field">Columns<input id="barcode-cols" type="number" min="1" max="6" value="${member?3:2}"></label></div><div class="batch-field-grid"><label class="batch-field">Barcode height (mm)<input id="barcode-height" type="number" min="8" max="60" value="22"></label><label class="batch-field">Module width<input id="barcode-width" type="number" min="1" max="4" step="0.2" value="2"></label></div>${kind==="barcode-sheet"?'<div class="batch-field-grid"><label class="batch-field">Paper width (mm)<input id="page-width" type="number" min="100" max="420" value="210"></label><label class="batch-field">Paper height (mm)<input id="page-height" type="number" min="100" max="594" value="297"></label></div><div class="batch-field-grid"><label class="batch-field">Margin (mm)<input id="page-margin" type="number" min="0" max="30" value="12"></label><label class="batch-field">Gap (mm)<input id="page-gap" type="number" min="0" max="30" value="8"></label></div>':''}<label class="batch-check"><input id="show-value" type="checkbox" checked> Show encoded value</label><p class="batch-status" id="barcode-status" role="status" aria-live="polite">Load values to begin.</p><div class="batch-actions"><button class="batch-primary" type="submit">Generate preview</button><button class="batch-secondary" id="barcode-print" type="button">Print sheet / Save as PDF</button></div></form><section class="batch-panel batch-preview-panel" aria-labelledby="barcode-preview-title"><div class="batch-preview-heading"><div><h2 id="barcode-preview-title">Barcode sheet</h2><p id="barcode-summary">No values loaded yet.</p></div><span class="batch-local-note">Processed locally</span></div><div id="barcode-preview" class="barcode-batch-preview"><p class="batch-empty">Your barcode preview will appear here.</p></div></section></div></section>`;
const $=<T extends HTMLElement>(id:string)=>root.querySelector<T>("#"+id)!;
const status=$<HTMLParagraphElement>("barcode-status"),preview=$<HTMLDivElement>("barcode-preview"),summary=$<HTMLParagraphElement>("barcode-summary");
const setStatus=(message:string)=>{status.textContent=message;};
let table:{headers:string[];rows:string[][]}|null=null,ready=false;
function renderColumnOptions(headers:string[]){
  const suggestion=suggestBarcodeColumns(headers,{member});
  $<HTMLSelectElement>("barcode-column").innerHTML=headers.map((header,index)=>`<option value="${index}" ${index===suggestion.valueIndex?"selected":""}>${esc(header||`Column ${index+1}`)}</option>`).join("");
  $<HTMLSelectElement>("caption-column").innerHTML='<option value="-1">No caption</option>'+headers.map((header,index)=>`<option value="${index}" ${index===suggestion.captionIndex?"selected":""}>${esc(header||`Column ${index+1}`)}</option>`).join("");
}
function render(){
  ready=false;
  try{
    let records:{value:string;caption:string}[];
    let skipped=0;
    if(isCsv){
      if(!table)table=parseCsv($<HTMLTextAreaElement>("barcode-input").value);
      if(!table)throw new Error("Add a CSV file or paste CSV data first.");
      const result=prepareBarcodeRecords(table,{valueIndex:Number($<HTMLSelectElement>("barcode-column").value),captionIndex:Number($<HTMLSelectElement>("caption-column").value)});
      records=result.records;skipped=result.skippedEmpty;
    }else{
      records=$<HTMLTextAreaElement>("barcode-input").value.split(/\r?\n/).map(value=>({value:value.trim(),caption:""})).filter(row=>row.value);
    }
    if(!records.length)throw new Error("No barcode values were found.");
    const layout=clampBarcodeSheet({pageWidth:Number($<HTMLInputElement>("page-width")?.value),pageHeight:Number($<HTMLInputElement>("page-height")?.value),margin:Number($<HTMLInputElement>("page-margin")?.value),gap:Number($<HTMLInputElement>("page-gap")?.value),columns:Number($<HTMLInputElement>("barcode-cols").value)});
    const sheet=document.createElement("div");sheet.className="barcode-batch-sheet";sheet.style.setProperty("--sheet-cols",String(layout.columns));
    if(kind==="barcode-sheet"){sheet.style.setProperty("--page-width",layout.pageWidth+"mm");sheet.style.setProperty("--page-height",layout.pageHeight+"mm");sheet.style.setProperty("--page-margin",layout.margin+"mm");sheet.style.setProperty("--page-gap",layout.gap+"mm");}
    const format=$<HTMLSelectElement>("barcode-format").value;
    const barHeight=Math.max(8,Math.min(60,Number($<HTMLInputElement>("barcode-height").value)||22))*3.7795;
    const barWidth=Math.max(1,Math.min(4,Number($<HTMLInputElement>("barcode-width").value)||2));
    let successes=0,errors=0;
    for(const record of records){
      const item=document.createElement("article");item.className="barcode-batch-item";
      if(record.caption){const caption=document.createElement("strong");caption.textContent=record.caption;item.append(caption);}
      const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
      try{JsBarcode(svg,record.value,{format,width:barWidth,height:barHeight,displayValue:$<HTMLInputElement>("show-value").checked,margin:4});item.append(svg);successes+=1;}
      catch{const error=document.createElement("small");error.className="barcode-row-error";error.textContent=`Could not encode: ${record.value}`;item.append(error);errors+=1;}
      sheet.append(item);
    }
    if(!successes)throw new Error("No values could be encoded. Check the selected barcode format and CSV column.");
    preview.replaceChildren(sheet);ready=true;
    const skippedCount=skipped+errors;
    summary.textContent=`${successes} generated${skippedCount?` · ${skippedCount} skipped`:""} · ${layout.columns} columns`;
    setStatus(skippedCount?`${successes} barcodes are ready; ${skippedCount} rows need a value or supported format.`:`${successes} barcodes are ready to print.`);
  }catch(error){preview.innerHTML=`<p class="batch-error">${esc(error instanceof Error?error.message:"Could not generate this sheet.")}</p>`;summary.textContent="Preview could not be created.";setStatus("Check the CSV fields, values, and barcode format.");}
}
$<HTMLFormElement>("barcode-form").addEventListener("submit",event=>{event.preventDefault();render();});
$<HTMLButtonElement>("barcode-print").addEventListener("click",()=>{if(!ready){setStatus("Generate a valid preview before printing.");return;}window.print();});
if(isCsv){
  const file=$<HTMLInputElement>("barcode-file"),input=$<HTMLTextAreaElement>("barcode-input");
  input.addEventListener("input",()=>{table=null;try{table=parseCsv(input.value);renderColumnOptions(table.headers);}catch{setStatus("Check the CSV quoting and column headings.");}});
  file.addEventListener("change",async()=>{const selected=file.files?.[0];if(!selected)return;if(selected.size>5*1024*1024){setStatus("Choose a CSV file smaller than 5 MB.");file.value="";return;}try{input.value=await selected.text();table=parseCsv(input.value);renderColumnOptions(table.headers);setStatus(`${table.rows.length} CSV records loaded.`);}catch(error){table=null;setStatus(error instanceof Error?error.message:"The CSV could not be read.");}});
}
