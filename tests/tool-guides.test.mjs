import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const guides = [
  {slug:"continuous-barcode-generator",tool:"/barcode/continuous/"},
  {slug:"custom-barcode-generator",tool:"/barcode/custom/"},
  {slug:"barcode-labels-from-csv",tool:"/barcode/csv/"},
  {slug:"member-barcode-generator",tool:"/barcode/member/"},
  {slug:"isbn-barcode-generator",tool:"/barcode/isbn/"},
  {slug:"barcode-sheet-designer",tool:"/barcode/sheet/"},
];

test("batch 1 tool guides have unique SEO metadata, visible content, FAQs and working-tool links", async () => {
  const titles = new Set();
  const canonicals = new Set();
  for (const guide of guides) {
    const file = `tools/${guide.slug}/index.html`;
    const html = await readFile(path.join(root, file), "utf8");
    const titleStart = html.indexOf("<title>");
    const titleEnd = html.indexOf("</title>");
    const title = titleStart >= 0 && titleEnd > titleStart ? html.slice(titleStart + 7, titleEnd) : "";
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.ok(title, file + " has a title");
    assert.ok(!titles.has(title), file + " has a unique title");
    assert.ok(canonical, file + " has a canonical URL");
    assert.ok(!canonicals.has(canonical), file + " has a unique canonical URL");
    assert.ok(html.includes("<h1>") && html.includes("</h1>"), file + " has a visible H1");
    assert.match(html, /name="description" content="[^"]+"/);
    assert.ok(html.includes("application/ld+json"), file + " has structured data");
    assert.ok(html.includes("Frequently asked questions"), file + " has visible FAQs");
    assert.ok(html.includes('href="https://melvinvarghese.github.io/Library-Toolkit' + guide.tool + '"'), file + " links to its working tool");
    assert.ok(html.includes("guide-page.ts"), file + " loads the shared guide styles");
    assert.doesNotMatch(html, /name="robots"[^>]*noindex/i);
    titles.add(title);
    canonicals.add(canonical);
  }
});

test("all batch 1 guides are included in the Vite build and sitemap", async () => {
  const vite = await readFile(path.join(root, "vite.config.ts"), "utf8");
  const sitemap = await readFile(path.join(root, "public/sitemap.xml"), "utf8");
  for (const guide of guides) {
    const file = `tools/${guide.slug}/index.html`;
    const url = `https://melvinvarghese.github.io/Library-Toolkit/tools/${guide.slug}/`;
    assert.ok(vite.includes(file), file + " is included in the Vite build");
    assert.ok(sitemap.includes(url), url + " is listed in the sitemap");
  }
});
