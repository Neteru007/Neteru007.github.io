# magic_gallery — каталоги Angular

Angular 22.2.3; standalone components, OnPush, lazy routes, signals and typed HttpClient services. Angular handles the Theurgy overview, Demonology, Angelology and all 144 detail pages. Existing home, articles, forum, divination and Belial pages remain independent pages and are linked from the shared header.

## Development and publishing

Use Node 24.15+ (the lockfile was generated with Node 24.19).

```sh
npm ci
npm run check:data
npm run build
npm run stage
```

The checked-in source lives in `angular/`. `stage` copies the production output to the repository's `catalogues/` directory and updates `theurgy.html`, `goetia-spirit.html` and `shem-angel.html`. Commit both source and generated output; GitHub Pages continues to publish the existing main branch. Do not commit node_modules, dist, out-tsc or .angular.

## Routing and data

Hash routing supports direct links and refreshes on GitHub Pages without server rewrites:

- `/theurgy.html#/demonology`
- `/theurgy.html#/demonology/68`
- `/theurgy.html#/angelology`
- `/theurgy.html#/angelology/1`

Legacy `theurgy.html#demonology`, `theurgy.html#angelology` and `*-spirit.html?id=N` / `shem-angel.html?id=N` links remain supported.

The catalogues are separate asynchronous JSON requests. HttpClient responses are validated, cached with shareReplay, and canceled when the last consumer unsubscribes. Pages expose loading, retry and not-found states. Templates render text through Angular interpolation; no raw HTML injection or manual DOM rendering is used.

Data files in `public/data` are the reviewed content source. Edit those files directly and keep source attribution with each entry. See SOURCES.md for historical limitations and traditions.

## Verification

`check:data` checks all entries, number uniqueness, source links, all 144 source-backed visual records (35 demon illustrations, 37 document excerpts and 72 modern Rosicrucian seals) and critical correspondence / verse cases. Production compilation performs strict TypeScript and Angular template checks and enforces an initial bundle size budget. Visual browser verification was unavailable in the editing environment.

The Ukrainian section name is “Ангелологія”. The public route `angelology` remains unchanged for backwards compatibility. JSON requests include a content hash generated before each build, so updated catalogue data is not confused with an older browser cache.
