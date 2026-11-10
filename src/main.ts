import "./styles.css";
import JsBarcode from "jsbarcode";
import {mountContinuousBarcode} from "./barcode";
import {categories,tools,type Tool} from "./data/tools";

const app=document.querySelector<HTMLDivElement>("#app");
if(!app) throw new Error("Application root was not found.");

const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]??char));
const icon=(name:string)=> {
  const paths:Record<string,string>={
    arrow:'<path d="M5 12h14M12 5l7 7-7 7"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    close:'<path d="m18 6-12 12M6 6l12 12"/>'
  };
  return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+(paths[name]??paths.arrow)+'</svg>';
};
const statusText=(status:Tool["status"])=>status==="available"?"Ready to use":status==="in-progress"?"In progress":"In the works";
const categoryName=(id:string)=>categories.find(c=>c.id===id)?.name??"Library tools";

function toolRow(tool:Tool,index:number){
  const ready=tool.status==="available";
  return `<article class="tool-row ${ready?"is-ready":""}">
    <span class="tool-index">${String(index+1).padStart(2,"0")}</span>
    <div class="tool-main"><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.description)}</p></div>
    <span class="tool-category">${escapeHtml(categoryName(tool.category))}</span>
    <span class="tool-status status-${tool.status}"><i></i>${statusText(tool.status)}</span>
    ${ready?'<button class="tool-open" data-tool="continuous-barcode" aria-label="Open continuous barcode generator">'+icon("arrow")+'</button>':'<span class="tool-open tool-open-muted" aria-hidden="true">· · ·</span>'}
  </article>`;
}

app.innerHTML=`
<a class="skip-link" href="#directory">Skip to tools</a>
<header class="topbar">
  <div class="topbar-inner">
    <a class="wordmark" href="#top" aria-label="Library Toolkit home">
      <span class="wordmark-stamp">LT</span>
      <span class="wordmark-text">LIBRARY <b>TOOLKIT</b><small>THE LIBRARIAN'S WORKBENCH</small></span>
    </a>
    <nav class="main-nav" aria-label="Main navigation">
      <a class="nav-current" href="#directory">Tools <span>25</span></a>
      <a href="#how-it-works">How it works</a>
      <a href="https://github.com/melvinvarghese/Library-Toolkit" target="_blank" rel="noreferrer">Source code ↗</a>
    </nav>
    <button class="mobile-menu-button" aria-label="Open navigation" aria-expanded="false">${icon("menu")}</button>
  </div>
  <nav class="mobile-nav" aria-label="Mobile navigation">
    <a href="#directory">Tools</a><a href="#how-it-works">How it works</a><a href="https://github.com/melvinvarghese/Library-Toolkit">Source code</a>
  </nav>
</header>

<main id="top">
  <section class="intro">
    <div class="intro-inner">
      <div class="intro-copy">
        <p class="overline"><span class="overline-rule"></span> A PRACTICAL TOOLKIT FOR LIBRARY PEOPLE</p>
        <h1>Library work.<br><em>Made lighter.</em></h1>
        <p class="intro-lede">The small jobs behind a well-run library take time. Make barcodes, prepare labels and sort records with simple tools built for the way libraries actually work.</p>
        <div class="intro-actions">
          <a class="primary-link" href="#directory">Find a tool <span>${icon("arrow")}</span></a>
          <span class="intro-aside">Free to use. No account. No uploads.</span>
        </div>
      </div>
      <div class="specimen" aria-label="A preview of a library barcode label">
        <div class="specimen-top"><span>COLLECTION SERVICES</span><span>SPECIMEN / 001</span></div>
        <div class="specimen-rule"></div>
        <div class="specimen-record">
          <span class="specimen-kicker">ITEM IDENTIFICATION</span>
          <strong>Accession label</strong>
          <div class="specimen-data"><span>ACCESSION NO.</span><b>000184</b></div>
          <div class="specimen-barcode"><svg id="hero-barcode" role="img" aria-label="Sample barcode for accession number 000184"></svg></div>
          <div class="specimen-foot"><span>LIBRARY TOOLKIT</span><span>CODE 128</span></div>
        </div>
        <div class="specimen-bottom"><span>PRINT-READY OUTPUT</span><span>01 / 25 TOOLS</span></div>
        <span class="specimen-corner" aria-hidden="true">+</span>
      </div>
    </div>
    <div class="intro-meta"><span>BUILT AROUND EVERYDAY LIBRARY TASKS</span><span><b>01</b> / 04 CATEGORIES</span></div>
  </section>

  <section class="directory section-wrap" id="directory">
    <div class="directory-heading">
      <div><p class="overline"><span class="overline-rule"></span> THE WORKBENCH</p><h2>Find the right tool.</h2></div>
      <p class="directory-summary"><strong>25</strong> focused utilities across four parts of library work. One is ready now; more are being built.</p>
    </div>
    <div class="directory-controls">
      <div class="category-tabs" role="group" aria-label="Filter tools by category">
        <button class="category-tab is-active" data-filter="all">All <span>25</span></button>
        ${categories.map(c=>`<button class="category-tab" data-filter="${c.id}">${escapeHtml(c.name)}</button>`).join("")}
      </div>
      <label class="search-field">${icon("search")}<span class="visually-hidden">Search tools</span><input id="tool-search" type="search" placeholder="Search the toolkit" autocomplete="off"><kbd>/</kbd></label>
    </div>
    <div class="list-head"><span>NO.</span><span>TOOL</span><span>AREA</span><span>STATUS</span><span></span></div>
    <div id="tool-list" class="tool-list">${tools.map(toolRow).join("")}</div>
    <div id="empty-state" class="empty-state" hidden>No tools found. Try a different search.</div>
    <div class="directory-foot"><span id="result-count">Showing all 25 tools</span><button id="show-all" type="button">Show all categories <span>↗</span></button></div>
  </section>

  <section class="working-note" id="how-it-works">
    <div class="working-note-number">01—03</div>
    <div class="working-note-copy"><p class="overline">A NOTE ON HOW IT WORKS</p><h2>Made to do a job.<br><em>Then get out of your way.</em></h2></div>
    <div class="working-points">
      <div><b>01</b><p><strong>Open and use</strong><span>No sign-up or installation. Open a tool and get to work.</span></p></div>
      <div><b>02</b><p><strong>Your files stay local</strong><span>Tools that handle files are designed to process them in your browser.</span></p></div>
      <div><b>03</b><p><strong>Print when ready</strong><span>Prepare clean output for your library's everyday workflow.</span></p></div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="footer-main">
    <a class="wordmark footer-wordmark" href="#top"><span class="wordmark-stamp">LT</span><span class="wordmark-text">LIBRARY <b>TOOLKIT</b><small>THE LIBRARIAN'S WORKBENCH</small></span></a>
    <p>Independent tools for the people who keep libraries running.</p>
    <a class="footer-github" href="https://github.com/melvinvarghese/Library-Toolkit" target="_blank" rel="noreferrer">View the project on GitHub ↗</a>
  </div>
  <div class="footer-bottom"><span>© ${new Date().getFullYear()} Library Toolkit</span><span>Built for library work, one useful tool at a time.</span></div>
</footer>`;

try { JsBarcode("#hero-barcode","000184",{format:"CODE128",width:1.45,height:48,displayValue:false,margin:0,lineColor:"#202722",background:"#fff"}); } catch { /* keep the specimen frame if barcode rendering is unavailable */ }

let activeFilter="all",query="";
const list=document.querySelector<HTMLDivElement>("#tool-list")!;
const count=document.querySelector<HTMLSpanElement>("#result-count")!;
const empty=document.querySelector<HTMLDivElement>("#empty-state")!;
const search=document.querySelector<HTMLInputElement>("#tool-search")!;
function renderTools(){
  const matches=tools.filter(t=>(activeFilter==="all"||t.category===activeFilter)&&[t.name,t.description,...t.tags].join(" ").toLowerCase().includes(query.toLowerCase()));
  list.innerHTML=matches.map(toolRow).join("");
  count.textContent="Showing "+matches.length+" of "+tools.length+" tools";
  empty.hidden=matches.length!==0;
  list.hidden=matches.length===0;
  document.querySelectorAll<HTMLButtonElement>(".category-tab").forEach(button=>button.classList.toggle("is-active",button.dataset.filter===activeFilter));
}
document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach(button=>button.addEventListener("click",()=>{
  activeFilter=button.dataset.filter??"all";renderTools();
}));
search.addEventListener("input",()=>{query=search.value.trim();renderTools();});
document.querySelector<HTMLButtonElement>("#show-all")!.addEventListener("click",()=>{
  activeFilter="all";query="";search.value="";renderTools();
});
document.addEventListener("keydown",event=>{
  if(event.key==="/"&&document.activeElement!==search){event.preventDefault();search.focus();}
  if(event.key==="Escape"){search.blur();if(search.value){search.value="";query="";renderTools();}}
});
const menu=document.querySelector<HTMLButtonElement>(".mobile-menu-button")!;
const mobile=document.querySelector<HTMLElement>(".mobile-nav")!;
menu.addEventListener("click",()=>{
  const open=menu.getAttribute("aria-expanded")==="true";
  menu.setAttribute("aria-expanded",String(!open));
  menu.setAttribute("aria-label",open?"Open navigation":"Close navigation");
  menu.innerHTML=icon(open?"menu":"close");
  mobile.classList.toggle("is-open",!open);
});
mobile.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{
  menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","Open navigation");
  menu.innerHTML=icon("menu");mobile.classList.remove("is-open");
}));
document.addEventListener("click",event=>{
  const target=event.target as HTMLElement;
  if(!target.closest('[data-tool="continuous-barcode"]')||document.querySelector("#barcode-tool-overlay"))return;
  const overlay=document.createElement("div");
  overlay.id="barcode-tool-overlay";overlay.className="barcode-tool-overlay";
  overlay.innerHTML='<div class="barcode-tool-dialog" role="dialog" aria-modal="true" aria-label="Continuous barcode generator"></div>';
  app.append(overlay);
  mountContinuousBarcode(overlay.querySelector(".barcode-tool-dialog")!,()=>overlay.remove());
  overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.remove();});
});
