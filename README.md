# magic_gallery

Україномовна галерея магічних традицій: бібліотека, теургія, Таро, руни, Human Design та форум.

Website: https://neteru007.github.io/

## Architecture

All sections use one Angular application with lazy feature routes. Editable source is in [`angular/`](angular/README.md). Components have separate TypeScript, HTML and CSS files. Authentication, data requests and state are separated from UI components.

- `angular/src/app/core/` — authentication, configuration and initial hash-route support.
- `angular/src/app/layout/` — shared header and footer.
- `angular/src/app/shared/` — reusable UI.
- `angular/src/app/features/` — home, library, articles, theurgy, divination, forum, Human Design and Belial.
- `angular/src/styles/` — shared tokens and base styles.
- `angular/tests/` — deterministic tests.
- `catalogues/` — generated, deployable application and reviewed catalogue assets.
- `assets/` — existing site images and symbols.
- `database/forum-schema.sql` — forum schema and access policies.

`index.html` boots the interactive Angular application. Seven standalone Ukrainian guides at `/magichni-poslugy/`, `/tarot-online/`, `/runy-online/`, `/dyzain-liudyny/`, `/demonolohiia/`, `/anhelolohiia/` and `/mahiia-ta-praktyky/` provide crawlable HTML without JavaScript. They link to the existing tools; no paid consultation or ritual booking is implied. All sections are dynamic Angular routes; component HTML templates live in the source tree and are compiled into JavaScript. Email confirmation and password-reset links return to the site root. Legacy standalone page scripts/styles have been replaced by Angular components. Build instructions and verification scope are in [`angular/README.md`](angular/README.md). Historical sources and illustration provenance are in [`angular/SOURCES.md`](angular/SOURCES.md).

## Human Design

`/#/human-design` calculates a chart locally from a birth date, exact local time and selected IANA timezone (or a confirmed explicit UTC offset). Place is a report label, not automatic geocoding. No birth data is persisted or sent to an API. The lazy Astronomy Engine dependency computes tropical apparent geocentric positions; Design is solved at 88 degrees of solar arc, not a fixed number of days. The ascending true lunar node is derived from the osculating lunar position/velocity. Near gate/line boundaries, independent implementations can differ.

The Ukrainian report includes a nine-center SVG, Type, Strategy, Authority, Profile, Definition, centers, complete channels, activated gates and both sets of planetary positions. The print button uses the browser print dialog, including Save as PDF; all report sections remain available in print. Human Design is presented as an esoteric reflection system, not a scientifically validated personality model.

## Search visibility

The homepage and standalone guides have Ukrainian titles/descriptions, canonical URLs, Open Graph tags and WebSite/WebPage JSON-LD. The sitemap lists only real canonical HTML pages, never hash routes. Interactive tools retain their existing hash URLs; their guide pages provide search entrances. Submit `https://neteru007.github.io/sitemap.xml` in Google Search Console after verifying site ownership. Indexing and rankings are determined by Google and are not guaranteed.
