// HTML for every page of the deal finder, built from the deal data.
// Every value is escaped before it goes into the page, so a deal's text
// can never break the markup.

import { deals, CHECKED_AT } from "./deals.js";
import {
  VERDICTS,
  CATEGORIES,
  STORES,
  percentOff,
  saving,
  bestPriceOf,
  otherStoresOf,
  stats,
} from "./filters.js";

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const usd = (n) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

export const checkedAt = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }) + " UTC";

function verdictBadge(d) {
  const v = VERDICTS[d.verdict];
  return `<span class="verdict verdict-${escape(d.verdict)}">${escape(v.label)}</span>`;
}

function compareNote(d) {
  const best = bestPriceOf(d.product);
  const others = otherStoresOf(d);
  if (others.length === 0) return "";
  if (best.id === d.id) {
    const names = others.map((o) => `${escape(o.store)} ${usd(o.price)}`).join(", ");
    return `<p class="compare best">Best price here — also at ${names}.</p>`;
  }
  return `<p class="compare">Cheaper at ${escape(best.store)}: ${usd(best.price)} — <a href="#/compare/${encodeURIComponent(d.product)}">compare stores</a></p>`;
}

export function dealCard(d) {
  return `<article class="card">
  <div class="card-top">${verdictBadge(d)}<span class="off">${percentOff(d)}% off</span></div>
  <h3><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h3>
  <p class="meta">${escape(d.store)} · ${escape(d.category)}</p>
  <p class="prices"><span class="price">${usd(d.price)}</span> <s>${usd(d.was)}</s> <span class="save">save ${usd(saving(d))}</span></p>
  <p class="evidence">${escape(d.evidence)}</p>
  ${compareNote(d)}
  <p class="checked">Checked ${checkedAt(d.checked)}</p>
  <p class="actions"><a class="store-link" href="${escape(d.url)}" rel="noopener">View at ${escape(d.store)} ↗</a></p>
</article>`;
}

function option(value, label, current) {
  return `<option value="${escape(value)}"${value === current ? " selected" : ""}>${escape(label)}</option>`;
}

export function listPage({ query, category, store, minOff, verdict, sort }, shown, total) {
  const s = stats();
  const sortOptions = [
    ["biggest-off", "Biggest discount first"],
    ["biggest-saving", "Biggest dollar saving first"],
    ["lowest-price", "Lowest price first"],
    ["best-verdict", "Best verdict first"],
  ];
  return `<section class="hero">
  <h1>Black Friday, checked deal by deal</h1>
  <p class="lede">${s.count} real deals from ${s.stores} stores, each price read at the store on Black Friday itself — with an honest verdict on whether it is really a deal.</p>
  <ul class="statbar">
    <li><strong>${s.count}</strong> deals</li>
    <li><strong>${s.newLows}</strong> new lows</li>
    <li><strong>${usd(s.totalSaving)}</strong> total saving</li>
    <li><strong>${percentOff(s.best)}% off</strong> deepest cut</li>
  </ul>
</section>
<form class="controls" id="controls" action="#/" method="get">
  <label>Search <input type="search" name="q" value="${escape(query)}" placeholder="Try “AirPods” or “Dyson”"></label>
  <label>Category <select name="category"><option value="">All categories</option>${CATEGORIES.map((c) => option(c, c, category)).join("")}</select></label>
  <label>Store <select name="store"><option value="">All stores</option>${STORES.map((c) => option(c, c, store)).join("")}</select></label>
  <label>Min. discount <select name="minOff">
    ${[0, 20, 40, 50, 60].map((n) => option(String(n), n === 0 ? "Any discount" : `${n}% off or more`, String(minOff))).join("")}
  </select></label>
  <label>Verdict <select name="verdict"><option value="">Any verdict</option>${Object.entries(VERDICTS).map(([k, v]) => option(k, v.label, verdict)).join("")}</select></label>
  <label>Sort <select name="sort">${sortOptions.map(([k, label]) => option(k, label, sort)).join("")}</select></label>
</form>
<p class="count" id="count">${shown.length} of ${total} deals${shown.length === 0 ? " — nothing matches. Loosen a filter." : ""}</p>
<div class="grid">${shown.map(dealCard).join("")}</div>
<section class="method">
  <h2>How these deals were checked</h2>
  <p>Every price on this page was read on ${checkedAt(CHECKED_AT)} from a deals roundup that names the store and shows the price on the store's own product page — SVR Deals for Walmart, Flash Deal Feed for Target, Best Buy's own sale reporting, and Black Friday roundups for Amazon. The discount on each card is computed from its two prices, so the numbers always add up. Prices move during Black Friday week: confirm the price at the store before you buy.</p>
  <p>No-name products with inflated “was” prices were left out on purpose — a big percentage off a price nobody ever paid is not a deal.</p>
</section>`;
}

export function dealPage(d) {
  const others = otherStoresOf(d);
  const best = bestPriceOf(d.product);
  const compareRows =
    others.length === 0
      ? `<p>This product is listed at one store in this finder.</p>`
      : `<table class="compare-table">
  <thead><tr><th>Store</th><th>Price</th><th>Usual price</th><th>Discount</th><th>Verdict</th><th></th></tr></thead>
  <tbody>${[d, ...others]
    .sort((a, b) => a.price - b.price)
    .map(
      (o) => `<tr${o.id === d.id ? ' class="current"' : ""}>
    <td>${escape(o.store)}${o.id === best.id ? " ★ best" : ""}</td>
    <td>${usd(o.price)}</td><td>${usd(o.was)}</td><td>${percentOff(o)}% off</td>
    <td>${escape(VERDICTS[o.verdict].label)}</td>
    <td><a href="${escape(o.url)}" rel="noopener">View ↗</a></td>
  </tr>`,
    )
    .join("")}</tbody></table>`;
  return `<p class="back"><a href="#/">← All deals</a></p>
<article class="detail">
  <div class="card-top">${verdictBadge(d)}<span class="off">${percentOff(d)}% off</span></div>
  <h1>${escape(d.title)}</h1>
  <p class="meta">${escape(d.store)} · ${escape(d.category)}</p>
  <p class="prices big"><span class="price">${usd(d.price)}</span> <s>${usd(d.was)}</s> <span class="save">save ${usd(saving(d))}</span></p>
  <p class="evidence big">${escape(d.evidence)}</p>
  <dl class="facts">
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Sale price</dt><dd>${usd(d.price)}</dd>
    <dt>Usual price</dt><dd>${usd(d.was)}</dd>
    <dt>Discount</dt><dd>${percentOff(d)}% off — save ${usd(saving(d))}</dd>
    <dt>Price checked</dt><dd>${checkedAt(d.checked)}</dd>
    <dt>Read in</dt><dd>${escape(d.source)}</dd>
  </dl>
  <p><a class="store-link big" href="${escape(d.url)}" rel="noopener">View this deal at ${escape(d.store)} ↗</a></p>
  <h2>Same product at other stores</h2>
  ${compareRows}
</article>`;
}

export function comparePage(product, list) {
  const first = list[0];
  return `<p class="back"><a href="#/">← All deals</a></p>
<h1>${escape(first.title)}</h1>
<p class="lede">The same product at ${list.length} stores — the cheapest first.</p>
<table class="compare-table">
  <thead><tr><th>Store</th><th>Price</th><th>Usual price</th><th>Discount</th><th>Verdict</th><th></th></tr></thead>
  <tbody>${list
    .map(
      (o) => `<tr>
    <td>${escape(o.store)}${o.id === bestPriceOf(product).id ? " ★ best" : ""}</td>
    <td>${usd(o.price)}</td><td>${usd(o.was)}</td><td>${percentOff(o)}% off</td>
    <td>${escape(VERDICTS[o.verdict].label)}</td>
    <td><a href="#/deal/${encodeURIComponent(o.id)}">Details</a> · <a href="${escape(o.url)}" rel="noopener">View at store ↗</a></td>
  </tr>`,
    )
    .join("")}</tbody></table>`;
}

export function missingPage() {
  return `<h1>Not found</h1>
<p>There is no deal at this address. <a href="#/">See all ${deals.length} deals</a>.</p>`;
}
