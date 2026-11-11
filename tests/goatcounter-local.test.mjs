import test from "node:test";
import assert from "node:assert/strict";
import {readFile,readdir} from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");

async function runTracker({href="https://melvinvarghese.github.io/Library-Toolkit/barcode/continuous/",canonical="https://melvinvarghese.github.io/Library-Toolkit/barcode/continuous/",skip=""}={}){
  const source=await readFile(path.join(root,"public/count.js"),"utf8");
  const sent=[];
  const location=new URL(href);
  const localStorage={getItem(key){return key==="skipgc"?skip:null;}};
  const context={
    window:{location,screen:{width:1440},localStorage},
    location,
    document:{title:"Continuous Barcode Generator",referrer:"https://example.org/",currentScript:{dataset:{goatcounter:"https://librarytools.goatcounter.com/count"}},querySelector(selector){return selector.startsWith("link")?{href:canonical}:null;}},
    navigator:{webdriver:false},
    Image:class{set src(value){sent.push(value);}},
    URLSearchParams,
    Math,
    console,
  };
  vm.runInNewContext(source,context);
  return sent;
}

test("local GoatCounter tracker sends a pageview to the existing account",async()=>{
  const [hit]=await runTracker();
  assert.ok(hit,"a pageview request should be sent");
  const url=new URL(hit);
  assert.equal(url.origin,"https://librarytools.goatcounter.com");
  assert.equal(url.pathname,"/count");
  assert.equal(url.searchParams.get("p"),"/Library-Toolkit/barcode/continuous/");
  assert.equal(url.searchParams.get("t"),"Continuous Barcode Generator");
  assert.equal(url.searchParams.get("r"),"https://example.org/");
});

test("local GoatCounter tracker honors the existing disable switch and ignores local previews",async()=>{
  assert.deepEqual(await runTracker({skip:"t"}),[]);
  assert.deepEqual(await runTracker({href:"http://localhost:5173/Library-Toolkit/",canonical:"http://localhost:5173/Library-Toolkit/"}),[]);
});

async function htmlFiles(directory){
  const entries=await readdir(directory,{withFileTypes:true});
  const files=[];
  for(const entry of entries){
    const full=path.join(directory,entry.name);
    if(entry.isDirectory())files.push(...await htmlFiles(full));
    else if(entry.name.endsWith(".html"))files.push(full);
  }
  return files;
}

test("every static page uses the local GoatCounter script and the existing account",async()=>{
  const files=await htmlFiles(root);
  for(const file of files){
    const html=await readFile(file,"utf8");
    assert.match(html,/data-goatcounter="https:\/\/librarytools\.goatcounter\.com\/count"[^>]*src="\/Library-Toolkit\/count\.js"/,path.relative(root,file));
    assert.doesNotMatch(html,/gc\.zgo\.at\/count\.js/,path.relative(root,file));
  }
});
