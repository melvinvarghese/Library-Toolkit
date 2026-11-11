import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = [
  {id: "accession-register", file: "library/accession-register/index.html", url: "library/accession-register"},
  {id: "purchase-list", file: "library/purchase-list/index.html", url: "library/purchase-list"},
  {id: "price-calculator", file: "library/price-calculator/index.html", url: "library/price-calculator"},
  {id: "stock-verification", file: "library/stock-verification/index.html", url: "library/stock-verification"},
  {id: "member-card", file: "library/member-card/index.html", url: "library/member-card"},
  {id: "csv-to-pdf", file: "data/csv-to-pdf/index.html", url: "data/csv-to-pdf"},
  {id: "fine-calculator", file: "library/fine-calculator/index.html", url: "library/fine-calculator"},
  {id: "shelf-label", file: "labels/shelf/index.html", url: "labels/shelf"},
  {id: "qr-label", file: "labels/qr-code/index.html", url: "labels/qr-code"},
  {id: "annual-report", file: "library/annual-report/index.html", url: "library/annual-report"},
  {id: "csv-barcode", file: "barcode/csv/index.html", url: "barcode/csv"},
  {id: "member-barcode", file: "barcode/member/index.html", url: "barcode/member"},
  {id: "barcode-sheet", file: "barcode/sheet/index.html", url: "barcode/sheet"},
  {id: "spine-label", file: "labels/spine-csv/index.html", url: "labels/spine-csv"},
  {id: "four-line-label", file: "labels/four-line/index.html", url: "labels/four-line"},
  {id: "book-label", file: "labels/book/index.html", url: "labels/book"},
  {id: "accession-label", file: "labels/accession/index.html", url: "labels/accession"},
  {id: "label-designer", file: "labels/designer/index.html", url: "labels/designer"},
  {id: "ddc-helper", file: "library/ddc-helper/index.html", url: "library/ddc-helper"},
  {id: "csv-viewer", file: "data/csv-viewer/index.html", url: "data/csv-viewer"},
  {id: "csv-mapper", file: "data/csv-mapper/index.html", url: "data/csv-mapper"},
  {id: "csv-cleaner", file: "data/csv-cleaner/index.html", url: "data/csv-cleaner"},
  {id: "csv-formatter", file: "data/csv-formatter/index.html", url: "data/csv-formatter"},
  {id: "text-formatter", file: "data/text-formatter/index.html", url: "data/text-formatter"},
];

test("all registered tool pages have unique titles, canonicals, and a resolvable app entry", async () => {
  const titles = new Set();
  for (const page of pages) {
    const html = await readFile(path.join(root, page.file), "utf8");
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    const script = html.match(/<script type="module" src="([^"]+)"/)?.[1];
    assert.ok(title, page.file + " has a title");
    assert.ok(!titles.has(title), page.file + " title is unique");
    assert.equal(canonical, "https://melvinvarghese.github.io/Library-Toolkit/" + page.url + "/");
    assert.match(html, /<meta name="description" content="[^"]+"/);
    assert.match(html, /property="og:title"/);
    assert.match(html, /application\/ld\+json/);
    assert.doesNotMatch(html, /name="robots"[^>]*noindex/i);
    assert.match(html, new RegExp('data-tool="' + page.id + '"'));
    assert.ok(script, page.file + " loads its tool");
    await readFile(path.resolve(root, path.dirname(page.file), script), "utf8");
    titles.add(title);
  }
});

test("every new route is in the homepage directory, Vite build inputs, and sitemap", async () => {
  const [main, tools, vite, sitemap] = await Promise.all([
    readFile(path.join(root, "src/main.ts"), "utf8"),
    readFile(path.join(root, "src/data/tools.ts"), "utf8"),
    readFile(path.join(root, "vite.config.ts"), "utf8"),
    readFile(path.join(root, "public/sitemap.xml"), "utf8"),
  ]);
  for (const page of pages) {
    const url = "/" + page.url + "/";
    assert.ok(main.includes('"' + page.id + '":"' + url + '"'), page.id + " has a homepage link");
    assert.match(tools, new RegExp('id: "' + page.id + '".*status: "available"'), page.id + " is marked ready");
    assert.ok(vite.includes('"' + page.file + '"'), page.id + " is included in the build");
    assert.ok(sitemap.includes("https://melvinvarghese.github.io/Library-Toolkit" + url), page.id + " is listed in the sitemap");
  }
});

test("tool URLs and sitemap entries are unique", async () => {
  const sitemap = await readFile(path.join(root, "public/sitemap.xml"), "utf8");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.equal(new Set(urls).size, urls.length, "sitemap URLs are unique");
  assert.equal(new Set(pages.map(page => page.url)).size, pages.length, "tool routes are unique");
});

test("robots.txt points to the hosted sitemap", async () => {
  const robots = await readFile(path.join(root, "public/robots.txt"), "utf8");
  assert.match(robots, /Sitemap:\s*https:\/\/melvinvarghese\.github\.io\/Library-Toolkit\/sitemap\.xml/);
});
