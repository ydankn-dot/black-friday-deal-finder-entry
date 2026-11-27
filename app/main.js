// The deal finder itself: hash routes, live search and filters, sorting.
// The deals live in deals.js, so the site needs no network to show them;
// each deal links out to its store.
//
//   #/                       the list, with search and filters
//   #/deal/<id>              one deal, with its cross-store comparison
//   #/compare/<product>      the same product at every store that has it
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { deals } from "./deals.js";
import { filterDeals, sortDeals } from "./filters.js";
import { listPage, dealPage, comparePage, missingPage, dealCard } from "./views.js";

const app = document.getElementById("app");

const state = {
  query: "",
  category: "",
  store: "",
  minOff: 0,
  verdict: "",
  sort: "biggest-off",
};

function renderList() {
  document.title = "Deal Beacon — Black Friday deal finder";
  const shown = sortDeals(filterDeals(state), state.sort);
  app.innerHTML = listPage(state, shown, deals.length);
  const form = document.getElementById("controls");
  form.addEventListener("submit", (event) => event.preventDefault());
  const refresh = () => {
    state.query = form.q.value;
    state.category = form.category.value;
    state.store = form.store.value;
    state.minOff = Number(form.minOff.value);
    state.verdict = form.verdict.value;
    state.sort = form.sort.value;
    const shownNow = sortDeals(filterDeals(state), state.sort);
    // Re-render only the grid and the count, so typing never loses focus.
    app.querySelector(".grid").innerHTML = shownNow.map(dealCard).join("");
    app.querySelector("#count").textContent =
      `${shownNow.length} of ${deals.length} deals` +
      (shownNow.length === 0 ? " — nothing matches. Loosen a filter." : "");
  };
  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
}

function render() {
  window.__shotReady = false;
  const hash = location.hash;
  const dealMatch = hash.match(/^#\/deal\/([^/?]+)/);
  const compareMatch = hash.match(/^#\/compare\/([^/?]+)/);
  if (dealMatch) {
    const found = deals.find((d) => d.id === decodeURIComponent(dealMatch[1]));
    document.title = `${found ? found.title : "Not found"} | Deal Beacon`;
    app.innerHTML = found ? dealPage(found) : missingPage();
  } else if (compareMatch) {
    const product = decodeURIComponent(compareMatch[1]);
    const list = deals
      .filter((d) => d.product === product)
      .sort((a, b) => a.price - b.price);
    document.title =
      list.length > 0
        ? `${list[0].title} — compare stores | Deal Beacon`
        : "Not found | Deal Beacon";
    app.innerHTML = list.length > 0 ? comparePage(product, list) : missingPage();
  } else {
    renderList();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();
