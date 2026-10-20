# magic_gallery

Україномовна галерея магічних традицій: бібліотека, теургія, Таро, руни та форум.

Website: https://neteru007.github.io/

## Architecture

All sections use one Angular application with lazy feature routes. Editable source is in [`angular/`](angular/README.md). Components have separate TypeScript, HTML and CSS files. Authentication, data requests and state are separated from UI components.

- `angular/src/app/core/` — authentication, configuration and initial hash-route support.
- `angular/src/app/layout/` — shared header and footer.
- `angular/src/app/shared/` — reusable UI.
- `angular/src/app/features/` — home, library, articles, theurgy, divination, forum and Belial.
- `angular/src/styles/` — shared tokens and base styles.
- `angular/tests/` — deterministic tests.
- `catalogues/` — generated, deployable application and reviewed catalogue assets.
- `assets/` — existing site images and symbols.
- `database/forum-schema.sql` — forum schema and access policies.

`index.html` is the only deployed HTML document. All sections are dynamic Angular routes; component HTML templates live in the source tree and are compiled into JavaScript. Email confirmation and password-reset links return to the site root. Legacy standalone page scripts/styles have been replaced by Angular components. Build instructions and verification scope are in [`angular/README.md`](angular/README.md). Historical sources and illustration provenance are in [`angular/SOURCES.md`](angular/SOURCES.md).
