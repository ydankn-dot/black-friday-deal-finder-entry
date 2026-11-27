// Filtering, sorting and cross-store comparison for the deal finder.
// Pure functions over the deal list in deals.js — no DOM here, so the
// rules can be tested on their own.

import { deals } from "./deals.js";

export const VERDICTS = {
  "new-low": { label: "New low", rank: 0 },
  strong: { label: "Strong deal", rank: 1 },
  fair: { label: "Fair deal", rank: 2 },
  "check-elsewhere": { label: "Check elsewhere", rank: 3 },
};

export const CATEGORIES = [...new Set(deals.map((d) => d.category))].sort();
export const STORES = [...new Set(deals.map((d) => d.store))].sort();

export function percentOff(d) {
  return Math.round((1 - d.price / d.was) * 100);
}

export function saving(d) {
  return d.was - d.price;
}

export function bestPriceOf(product) {
  const same = deals.filter((d) => d.product === product);
  return same.reduce((best, d) => (d.price < best.price ? d : best), same[0]);
}

export function otherStoresOf(deal) {
  return deals
    .filter((d) => d.product === deal.product && d.id !== deal.id)
    .sort((a, b) => a.price - b.price);
}

export function filterDeals({ query = "", category = "", store = "", minOff = 0, verdict = "" }) {
  const q = query.trim().toLowerCase();
  return deals.filter((d) => {
    if (q !== "" && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) return false;
    if (category !== "" && d.category !== category) return false;
    if (store !== "" && d.store !== store) return false;
    if (percentOff(d) < minOff) return false;
    if (verdict !== "" && d.verdict !== verdict) return false;
    return true;
  });
}

export const SORTS = {
  "biggest-off": {
    label: "Biggest discount first",
    compare: (a, b) => percentOff(b) - percentOff(a) || saving(b) - saving(a),
  },
  "biggest-saving": {
    label: "Biggest dollar saving first",
    compare: (a, b) => saving(b) - saving(a),
  },
  "lowest-price": {
    label: "Lowest price first",
    compare: (a, b) => a.price - b.price,
  },
  "best-verdict": {
    label: "Best verdict first",
    compare: (a, b) =>
      VERDICTS[a.verdict].rank - VERDICTS[b.verdict].rank || percentOff(b) - percentOff(a),
  },
};

export function sortDeals(list, sortKey) {
  const sort = SORTS[sortKey] ?? SORTS["biggest-off"];
  return [...list].sort(sort.compare);
}

export function stats() {
  const totalSaving = deals.reduce((sum, d) => sum + saving(d), 0);
  const best = deals.reduce((top, d) => (percentOff(d) > percentOff(top) ? d : top), deals[0]);
  const newLows = deals.filter((d) => d.verdict === "new-low").length;
  return {
    count: deals.length,
    stores: STORES.length,
    categories: CATEGORIES.length,
    totalSaving,
    best,
    newLows,
  };
}
