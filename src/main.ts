import "./styles.css";
import { categories, tools, type Tool } from "./data/tools";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Application root was not found.");

const icon = (name: string) => {
  const paths: Record<string, string> = {
    search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>',
    arrow: '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"></path>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"></path>',
    close: '<path d="m18 6-12 12M6 6l12 12"></path>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6M8 13h8M8 17h8"></path>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] ?? paths.grid}</svg>`;
};

const statusLabel = (status: Tool["status"]) =>
  status === "available" ? "Available" : status === "in-progress" ? "In progress" : "Coming soon";

function toolCard(tool: Tool): string {
  const category = categories.find((item) => item.id === tool.category);
  return `
    <article class="tool-card">
      <div class="tool-card-top">
        <span class="tool-icon" aria-hidden="true">${category?.icon ?? "▦"}</span>
        <span class="status status-${tool.status}">${statusLabel(tool.status)}</span>
      </div>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
      <div class="tool-card-bottom">
        <div class="tag-list">${tool.tags.slice(0, 2).map((tag) => `<span>${tag}</span>`).join("")}</div>
        <span class="card-arrow" aria-hidden="true">${icon("arrow")}</span>
      </div>
    </article>`;
}

function categoryCard(category: typeof categories[number]): string {
  const count = tools.filter((tool) => tool.category === category.id).length;
  return `
    <button class="category-card" data-category="${category.id}">
      <span class="category-icon">${category.icon}</span>
      <span class="category-copy"><strong>${category.name}</strong><small>${category.description}</small><em>${count} tools planned</em></span>
      <span class="category-arrow">${icon("arrow")}</span>
    </button>`;
}

app.innerHTML = `
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="#home" aria-label="Library Toolkit home">
        <span class="brand-mark">${icon("book")}</span>
        <span class="brand-name">library<span>toolkit</span><small>TOOLS FOR LIBARIANS</small></span>
      </a>
      <nav class="desktop-nav" aria-label="Main navigation">
        <a class="nav-link active" href="#home">Home</a>
        <a class="nav-link" href="#tools">All tools</a>
        <a class="nav-link" href="#about">About</a>
      </nav>
      <a class="header-cta" href="#tools">Explore tools <span>${icon("arrow")}</span></a>
      <button class="mobile-menu-button" aria-label="Open navigation" aria-expanded="false">${icon("menu")}</button>
    </div>
    <nav class="mobile-nav" aria-label="Mobile navigation">
      <a href="#home">Home</a><a href="#tools">All tools</a><a href="#about">About</a>
    </nav>
  </header>

  <main id="home">
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <div class="eyebrow"><span class="eyebrow-dot"></span> A little help for library people</div>
          <h1>Less time on busywork.<br><span>More time for books.</span></h1>
          <p class="hero-description">Practical, free tools for the everyday work of librarians. Make barcodes, prepare labels, organize records and get on with what matters.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="#tools">Explore all tools <span>${icon("arrow")}</span></a>
            <a class="text-link" href="#about">Why Library Toolkit?</a>
          </div>
          <div class="hero-note"><span class="note-check">✓</span> Free to use <span class="note-separator">·</span> No account needed <span class="note-separator">·</span> Files stay in your browser</div>
        </div>
        <div class="hero-art" aria-label="Illustration of books and library organization">
          <div class="art-sun"></div>
          <div class="art-note art-note-one">BOOKS<br><b>×</b> DATA</div>
          <div class="art-shelf">
            <div class="shelf-book book-a"></div><div class="shelf-book book-b"></div><div class="shelf-book book-c"></div><div class="shelf-book book-d"></div><div class="shelf-book book-e"></div>
            <div class="shelf-line"></div>
            <div class="shelf-book book-f"></div><div class="shelf-book book-g"></div><div class="shelf-book book-h"></div><div class="shelf-book book-i"></div>
            <div class="shelf-line shelf-line-two"></div>
          </div>
          <div class="art-label"><span>▥</span> READY TO PRINT</div>
          <div class="art-sparkle sparkle-one">✳</div><div class="art-sparkle sparkle-two">✳</div>
        </div>
      </div>
      <div class="hero-bottom"><span>MADE FOR THE PEOPLE WHO KEEP KNOWLEDGE MOVING</span><span>USEFUL BY DESIGN <b>↗</b></span></div>
    </section>

    <section class="section categories-section" id="categories">
      <div class="section-heading">
        <div><div class="eyebrow eyebrow-muted">FIND WHAT YOU NEED</div><h2>Tools for the work<br>behind the shelves.</h2></div>
        <p>Small, focused utilities to make common library tasks simpler. Choose a category to find the right tool.</p>
      </div>
      <div class="category-grid">${categories.map(categoryCard).join("")}</div>
    </section>

    <section class="section tools-section" id="tools">
      <div class="section-heading tools-heading">
        <div><div class="eyebrow eyebrow-muted">THE TOOLBOX</div><h2>Useful things, all in one place.</h2></div>
        <div class="search-wrap">${icon("search")}<input id="tool-search" type="search" placeholder="Search tools..." aria-label="Search tools"><kbd>/</kbd></div>
      </div>
      <div class="filter-row" role="group" aria-label="Filter tools">
        <button class="filter-chip selected" data-filter="all">All tools <span>${tools.length}</span></button>
        ${categories.map((category) => `<button class="filter-chip" data-filter="${category.id}">${category.name}</button>`).join("")}
      </div>
      <div class="tool-grid" id="tool-grid">${tools.filter((tool) => tool.featured).map(toolCard).join("")}</div>
      <div class="empty-state" id="empty-state" hidden>No tools match that search. Try another name or category.</div>
      <div class="tools-footer"><span id="result-count">Showing featured tools</span><button class="view-all-button" id="view-all">Show all tools <span>${icon("arrow")}</span></button></div>
    </section>

    <section class="privacy-strip">
      <div class="privacy-symbol">${icon("file")}</div>
      <div><strong>Your library data stays yours.</strong><p>Our planned tools process files locally in your browser. Your records should never need to leave your computer.</p></div>
      <span class="privacy-badge">PRIVACY FIRST</span>
    </section>

    <section class="section about-section" id="about">
      <div class="about-copy"><div class="eyebrow eyebrow-muted">A TOOLKIT, NOT ANOTHER SYSTEM</div><h2>Made for library work.<br><span>Made to stay simple.</span></h2></div>
      <div class="about-description"><p>Library Toolkit is an independent collection of practical utilities for librarians, library assistants and library students. No complicated software to install, no account to create and no subscription to remember.</p><a href="https://github.com/melvinvarghese/Library-Toolkit" target="_blank" rel="noreferrer">Explore the open-source project <span>${icon("arrow")}</span></a></div>
    </section>
  </main>

  <footer class="site-footer">
    <a class="brand footer-brand" href="#home"><span class="brand-mark">${icon("book")}</span><span class="brand-name">library<span>toolkit</span><small>TOOLS FOR LIBRARIANS</small></span></a>
    <span class="footer-center">Free tools for the people who make libraries work.</span>
    <div class="footer-links"><a href="#about">About</a><a href="https://github.com/melvinvarghese/Library-Toolkit" target="_blank" rel="noreferrer">GitHub</a><a href="mailto:hello@librarytoolkit.example">Contact</a></div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} Library Toolkit</span><span>Independent project · Built for librarians everywhere</span></div>
  </footer>
`;

let activeFilter = "all";
let showAll = false;
let searchQuery = "";

const grid = document.querySelector<HTMLDivElement>("#tool-grid")!;
const count = document.querySelector<HTMLSpanElement>("#result-count")!;
const empty = document.querySelector<HTMLDivElement>("#empty-state")!;
const search = document.querySelector<HTMLInputElement>("#tool-search")!;

function renderTools(): void {
  const filtered = tools.filter((tool) => {
    const categoryMatch = activeFilter === "all" || tool.category === activeFilter;
    const haystack = [tool.name, tool.description, ...tool.tags].join(" ").toLowerCase();
    return categoryMatch && haystack.includes(searchQuery.toLowerCase());
  });
  const visible = showAll || activeFilter !== "all" || searchQuery ? filtered : filtered.filter((tool) => tool.featured);
  grid.innerHTML = visible.map(toolCard).join("");
  empty.hidden = visible.length > 0;
  count.textContent = `Showing ${visible.length} of ${filtered.length} tools`;
  document.querySelectorAll<HTMLButtonElement>(".filter-chip").forEach((button) => {
    button.classList.toggle("selected", button.dataset.filter === activeFilter);
  });
  document.querySelector<HTMLButtonElement>("#view-all")!.textContent = showAll ? "Show featured tools" : "Show all tools";
}

document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter ?? "all";
    showAll = activeFilter !== "all";
    renderTools();
    document.querySelector("#tools")?.scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-category]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.category ?? "all";
    showAll = true;
    renderTools();
    document.querySelector("#tools")?.scrollIntoView({ behavior: "smooth" });
  });
});

search.addEventListener("input", () => {
  searchQuery = search.value.trim();
  renderTools();
});

document.querySelector<HTMLButtonElement>("#view-all")!.addEventListener("click", () => {
  showAll = !showAll;
  renderTools();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== search) {
    event.preventDefault();
    search.focus();
  }
  if (event.key === "Escape") search.blur();
});

const menuButton = document.querySelector<HTMLButtonElement>(".mobile-menu-button")!;
const mobileNav = document.querySelector<HTMLElement>(".mobile-nav")!;
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  menuButton.innerHTML = icon(open ? "menu" : "close");
  mobileNav.classList.toggle("open", !open);
});
mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.innerHTML = icon("menu");
  mobileNav.classList.remove("open");
}));
