# magic_gallery — Angular application

The complete website uses Angular standalone components and lazy feature routes. TypeScript owns state and behavior; each component has its own `.component.html` template and `.component.css` stylesheet. Generated JavaScript lives in the published `catalogues/` directory, not alongside handwritten application code.

## Source ownership

| Directory | Responsibility |
| --- | --- |
| `src/app/core/auth/` | Supabase session lifecycle, registration, confirmation and password recovery |
| `src/app/core/config/` | Public browser configuration; no secret/service-role keys |
| `src/app/core/routing/` | Initial hash route and auth callbacks |
| `src/app/layout/` | Shared header, mobile navigation and footer |
| `src/app/shared/` | Reusable native dialog and site-wide not-found page |
| `src/app/features/home/` | Home page content |
| `src/app/features/library/` | Library filters, data and reusable article card |
| `src/app/features/articles/` | Article content and detail page |
| `src/app/features/theurgy/` | Catalogues, detail views, catalogue data service and shared catalogue components |
| `src/app/features/divination/` | Tarot and rune components, deck data and pure random-selection algorithms |
| `src/app/features/forum/` | Topic list, thread, auth/account dialogs, composer, moderation, typed data service and feature state |
| `src/app/features/belial/` | Interactive page, reply data and pure button-position algorithm |
| `src/styles/` | Site tokens, base typography/reset and shared utilities only |
| `public/data/`, `public/artwork/` | Reviewed catalogue data and attributed source images |
| `tests/` | Deterministic tests for selection, coordinates, ban expiry, hash routes and auth callback ordering |
| `scripts/` | Data validation, architecture checks, versioning, build staging and artifact checks |

The root `app.component` contains only the shared layout, route outlet and navigation/error state. Feature routes load asynchronously. Views use `OnPush` and signals; database calls live in services. Components never render pages by assigning `innerHTML` or installing global DOM event handlers.

## Routes

- `/#/` — home and library; `/#/#library` links to the library section.
- `/#/articles/intention` — article detail.
- `/#/theurgy`, `/#/angelology`, `/#/demonology`, `/#/enochian`, `/#/ars-notoria` — theurgy and catalogues.
- `/#/angelology/1`, `/#/demonology/68` — individual records.
- `/#/divination/tarot`, `/#/divination/runes` — independent divination components.
- `/#/forum`, `/#/forum/<uuid>` — forum and topic.
- `/#/belial` — interactive page.

`index.html` is the only deployed HTML document. Every section is a lazy Angular route; component HTML files are source templates compiled into JavaScript, not separate published pages. Email callback tokens are consumed by Supabase **before** the router changes the hash. Confirmation and password-reset links return to the site root. Sessions use the same Supabase project and SDK storage as the previous site.

## Data and authorization

The two JSON catalogues contain 72 records each. Data is checked at runtime and cached within the current application. Build-generated SHA-256 version suffixes invalidate browser data caches when reviewed content changes. Image/source provenance is documented in `SOURCES.md`.

The forum keeps its existing database schema and row-level security policies. UI checks are convenience only: Supabase RLS remains the authority for ownership, moderation and bans. No schema or admin-role migration is performed by this frontend refactor. Public configuration contains a publishable key, never a service-role key.

Tarot uses unbiased bounded Web Crypto randomness and a Fisher–Yates shuffle, taking three distinct cards. Runes draw independently on each click. User questions remain local. Forum reads are paginated; stale topic searches are aborted, form submissions disable duplicate actions, and component subscriptions/timers are disposed when views close.

## Development and validation

Use Node 24 and the committed npm lockfile.

```sh
npm ci
npm run check:data
npm run check:structure
npm test
npm run format:check
npm run build
node scripts/stage.mjs /absolute/path/to/stage
node scripts/check-stage.mjs /absolute/path/to/stage
```

`npm run format` applies the committed Prettier configuration. Production compilation checks strict TypeScript, Angular templates, unused imports and the initial bundle budget. Runtime tests do not require browser automation.

`stage.mjs` writes only the root `index.html`, removes duplicate page documents (including the copied build index), and copies JavaScript/CSS/data assets into `catalogues/`. Existing root `assets/` are retained on GitHub Pages. Do not edit generated HTML or bundled JavaScript: update `src/` or `public/`, build, and stage again.

## Verification boundary

The refactor is covered by production compilation, deterministic algorithm/URL tests, data/architecture checks and staged dependency checks. Browser visual checks and a complete real email/login/moderation walkthrough require an available supported browser environment; they are not implied by a successful build.
