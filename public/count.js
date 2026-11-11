// Lightweight GoatCounter-compatible pageview sender.
// The tracker is hosted with this site; pageviews still go to the configured GoatCounter account.
(() => {
  const script = document.currentScript || document.querySelector("script[data-goatcounter]");
  const endpoint = script?.dataset.goatcounter;
  if (!endpoint) return;

  const host = window.location.hostname.toLowerCase();
  if (window.location.protocol === "file:" || /^(localhost|127\.|10\.|192\.168\.|0\.0\.0\.0$)/.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) return;
  try {
    if (window.localStorage?.getItem("skipgc") === "t") return;
  } catch {
    // A privacy setting may disable local storage; counting can still proceed.
  }

  let page = window.location;
  const canonical = document.querySelector('link[rel="canonical"][href]');
  if (canonical) {
    try {
      const candidate = new URL(canonical.href, window.location.href);
      if (candidate.hostname.replace(/^www\./, "") === host.replace(/^www\./, "")) page = candidate;
    } catch {
      // Ignore malformed canonical URLs and use the current page address.
    }
  }

  const params = new URLSearchParams();
  params.set("p", page.pathname + page.search);
  params.set("r", document.referrer || "");
  params.set("t", document.title || "");
  params.set("s", String(window.screen?.width || 0));
  params.set("b", navigator.webdriver ? "153" : "0");
  if (window.location.search) params.set("q", window.location.search);
  params.set("rnd", Math.random().toString(36).slice(2, 7));

  const separator = endpoint.includes("?") ? "&" : "?";
  const pixel = new Image();
  pixel.src = endpoint + separator + params.toString();
})();
