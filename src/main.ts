import "./styles.css";
import JsBarcode from "jsbarcode";
import {categories,tools,type Tool} from "./data/tools";

const app=document.querySelector<HTMLDivElement>("#app");
if(!app) throw new Error("Application root was not found.");
const root:HTMLDivElement=app;

const REPO="https://github.com/melvinvarghese/Library-Toolkit";
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]??char));

const searchIcon='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';
const mark='<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="6" fill="#ffd23f"/><g fill="#0c1535"><rect x="7" y="8" width="3" height="16"/><rect x="12" y="8" width="1.5" height="16"/><rect x="15.5" y="8" width="3.5" height="16"/><rect x="21" y="8" width="1.5" height="16"/><rect x="24" y="8" width="2" height="16"/></g></svg>';

const readyCount=tools.filter(t=>t.status==="available").length;
const statusLabel=(status:Tool["status"])=>status==="available"?"Ready":status==="in-progress"?"In progress":"Planned";
const categoryCount=(id:string)=>tools.filter(t=>t.category===id).length;

function toolRow(tool:Tool){
  const ready=tool.status==="available";
  const paths:Record<string,string>={"continuous-barcode":"/barcode/continuous/","custom-barcode":"/barcode/custom/","isbn-barcode":"/barcode/isbn/","csv-barcode":"/barcode/csv/","member-barcode":"/barcode/member/","barcode-sheet":"/barcode/sheet/","spine-label-maker":"/labels/spine/","spine-label":"/labels/spine-csv/","four-line-label":"/labels/four-line/","book-label":"/labels/book/","accession-label":"/labels/accession/","label-designer":"/labels/designer/","ownership-stamp":"/labels/ownership-stamp/","shelf-label":"/labels/shelf/","qr-label":"/labels/qr-code/","accession-register":"/library/accession-register/","purchase-list":"/library/purchase-list/","price-calculator":"/library/price-calculator/","stock-verification":"/library/stock-verification/","member-card":"/library/member-card/","fine-calculator":"/library/fine-calculator/","annual-report":"/library/annual-report/","new-arrivals-poster":"/library/new-arrivals-poster/","due-date-slip":"/library/due-date-slip/","ddc-helper":"/library/ddc-helper/","csv-viewer":"/data/csv-viewer/","csv-mapper":"/data/csv-mapper/","csv-cleaner":"/data/csv-cleaner/","csv-formatter":"/data/csv-formatter/","text-formatter":"/data/text-formatter/","csv-to-pdf":"/data/csv-to-pdf/"};
  const action=ready
    ? '<a class="tool-open" href="/Library-Toolkit'+(paths[tool.id]??"/") + '" aria-label="Open '+escapeHtml(tool.name)+'">Open</a>'
    : '<span class="tool-state">'+statusLabel(tool.status)+'</span>';
  return '<li class="tool'+(ready?' is-ready':'')+'"><div class="tool-text"><h4>'+escapeHtml(tool.name)+'</h4><p>'+escapeHtml(tool.description)+'</p></div>'+action+'</li>';
}

function renderGroups(matches:Tool[]){
  return categories.map(cat=>{
    const items=matches.filter(t=>t.category===cat.id);
    if(!items.length) return "";
    return '<section class="group" data-cat="'+cat.id+'" aria-labelledby="group-'+cat.id+'"><header class="group-head"><h3 id="group-'+cat.id+'">'+escapeHtml(cat.name)+'</h3><p>'+escapeHtml(cat.description)+'</p></header><ul class="tool-list">'+items.map(toolRow).join("")+'</ul></section>';
  }).join("");
}

root.innerHTML=`
<a class="skip-link" href="#tools">Skip to tools</a>
<div class="hero-wrap">
  <header class="bar">
    <a class="wordmark" href="#top" aria-label="Library Toolkit, home">${mark}<span>Library Toolkit</span></a>
    <nav class="nav" aria-label="Main navigation">
      <a href="#tools">Tools</a>
      <a class="nav-about" href="#about">About</a>
      <a href="${REPO}" target="_blank" rel="noreferrer">GitHub</a>
    </nav>
  </header>
  <section class="hero" id="top" aria-labelledby="hero-title">
    <div class="hero-copy">
      <h1 id="hero-title" class="display">Barcodes, labels and records for your library.</h1>
      <p class="lede">Free tools for librarians and library students. No installation or account required..</p>
      <div class="hero-actions">
        <a class="btn btn-yellow" href="#tools">Browse the tools</a>
        <a class="btn-link" href="/Library-Toolkit/barcode/continuous/">Open the barcode generator</a>
      </div>
    </div>
    <div class="try">
      <div class="sticker">
        <div class="sticker-band"><span>Library Toolkit</span><span>Code 128</span></div>
        <div class="sticker-body">
          <span class="sticker-label">Accession number</span>
          <strong id="sticker-number" class="display">000184</strong>
          <svg id="hero-barcode" role="img" aria-label="Barcode for the number you typed"></svg>
        </div>
      </div>
      <label class="try-field"><span>Type any number to see its barcode</span><input id="try-input" type="text" value="000184" maxlength="14" autocomplete="off" spellcheck="false"></label>
    </div>
  </section>
</div>

<main>
  <section class="directory wrap" id="tools" aria-labelledby="tools-title">
    <div class="dir-head">
      <h2 id="tools-title" class="display">All tools</h2>
      <p>${readyCount} ready to use now, ${tools.length-readyCount} more on the way. Planned tools are marked so you know what works today.</p>
    </div>
    <div class="controls">
      <div class="chips" role="group" aria-label="Filter tools by category">
        <button class="chip is-active" type="button" data-filter="all" aria-pressed="true">All <span class="chip-count">${tools.length}</span></button>
        ${categories.map(c=>'<button class="chip" type="button" data-filter="'+c.id+'" data-cat="'+c.id+'" aria-pressed="false"><i aria-hidden="true"></i>'+escapeHtml(c.name)+' <span class="chip-count">'+categoryCount(c.id)+'</span></button>').join("")}
      </div>
      <label class="search">${searchIcon}<span class="visually-hidden">Search tools</span><input id="tool-search" type="search" placeholder="Search tools" autocomplete="off" title="Press / to search"></label>
    </div>
    <p id="result-count" class="result-count" role="status"></p>
    <div id="groups"></div>
    <div id="empty-state" class="empty" hidden>
      <p>No tools match your search.</p>
      <button id="clear-filters" class="btn-text" type="button">Show all tools</button>
    </div>
  </section>

  <section class="about" id="about" aria-labelledby="about-title">
    <div class="wrap about-grid">
      <h2 id="about-title" class="display">Open it, use it, print it.</h2>
      <div class="points">
        <div><h3>Nothing to install</h3><p>Every tool opens in your browser. There is no account to make and nothing to download.</p></div>
        <div><h3>Your data stays with you</h3><p>Lists and files are processed on your own computer. Nothing is sent to a server.</p></div>
        <div><h3>Made for print</h3><p>Set sizes, columns and gaps, then print or save as PDF at the scale your printer needs.</p></div>
      </div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="wrap footer-inner">
    <a class="wordmark" href="#top" aria-label="Library Toolkit, back to top">${mark}<span>Library Toolkit</span></a>
    <p>Independent tools for the people who keep libraries running.</p>
    <nav class="footer-links" aria-label="Project links">
      <a href="${REPO}" target="_blank" rel="noreferrer">Source on GitHub</a>
      <a href="${REPO}/issues" target="_blank" rel="noreferrer">Suggest a tool</a>
    </nav>
  </div>
  <div class="wrap footer-base">&copy; ${new Date().getFullYear()} Library Toolkit</div>
</footer>`;

const tryInput=root.querySelector<HTMLInputElement>("#try-input")!;
const stickerNumber=root.querySelector<HTMLElement>("#sticker-number")!;
const heroSvg=root.querySelector<SVGSVGElement>("#hero-barcode")!;
function drawSticker(){
  const value=tryInput.value.trim();
  stickerNumber.textContent=value||"Type a number";
  heroSvg.style.visibility=value?"visible":"hidden";
  if(!value) return;
  try{
    JsBarcode("#hero-barcode",value,{format:"CODE128",width:2,height:64,displayValue:false,margin:0,lineColor:"#0c1535",background:"transparent"});
  }catch{
    heroSvg.style.visibility="hidden";
  }
}
tryInput.addEventListener("input",drawSticker);
drawSticker();

let activeFilter="all",query="";
const groups=root.querySelector<HTMLDivElement>("#groups")!;
const count=root.querySelector<HTMLParagraphElement>("#result-count")!;
const empty=root.querySelector<HTMLDivElement>("#empty-state")!;
const search=root.querySelector<HTMLInputElement>("#tool-search")!;
const chips=root.querySelectorAll<HTMLButtonElement>(".chip");

function renderTools(){
  const q=query.toLowerCase();
  const matches=tools.filter(t=>(activeFilter==="all"||t.category===activeFilter)&&(!q||[t.name,t.description,...t.tags].join(" ").toLowerCase().includes(q)));
  groups.innerHTML=renderGroups(matches);
  count.textContent=matches.length===tools.length?"Showing all "+tools.length+" tools":"Showing "+matches.length+" of "+tools.length+" tools";
  empty.hidden=matches.length!==0;
  chips.forEach(chip=>{
    const on=chip.dataset.filter===activeFilter;
    chip.classList.toggle("is-active",on);
    chip.setAttribute("aria-pressed",String(on));
  });
}
chips.forEach(chip=>chip.addEventListener("click",()=>{activeFilter=chip.dataset.filter??"all";renderTools();}));
search.addEventListener("input",()=>{query=search.value.trim();renderTools();});
root.querySelector<HTMLButtonElement>("#clear-filters")!.addEventListener("click",()=>{
  activeFilter="all";query="";search.value="";renderTools();
});
renderTools();

document.addEventListener("keydown",event=>{
  const tag=document.activeElement?.tagName??"";
  const typing=tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT";
  if(event.key==="/"&&!typing){event.preventDefault();search.focus();}
  if(event.key==="Escape"&&document.activeElement===search){
    if(search.value){search.value="";query="";renderTools();}
    search.blur();
  }
});
