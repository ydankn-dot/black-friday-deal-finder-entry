# black-friday-deal-finder-entry

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/ydankn-dot/black-friday-deal-finder-entry/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/ydankn-dot/black-friday-deal-finder-entry/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

Deal Beacon — a Black Friday deal finder with 36 real deals from Amazon, Best Buy, Target and Walmart. Every price was read on 27 November 2026 from a deals source that names the store, and each deal carries an honest verdict — new low, strong deal, fair deal, or check elsewhere — with the evidence for it. Search and filter by category, store, discount and verdict; sort by discount, dollar saving or price; compare the same product across stores to find the cheapest one.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network: the site is static files under `app/`, and `main.ts` hands it in by copying `app/` and `screenshots/` to `/output` with a dossier built by `vendor/makefun-frontend.ts`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=0a3zgsxr&utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
