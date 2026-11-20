# Swiss Ephemeris and AGPL compliance notice

This repository includes an integration with `@swisseph/browser` 1.4.0, a JavaScript/WebAssembly wrapper around Swiss Ephemeris.

- Package: https://www.npmjs.com/package/@swisseph/browser
- Upstream source: https://github.com/swisseph-js/swisseph
- Upstream license: GNU Affero General Public License version 3 (AGPL-3.0)
- Swiss Ephemeris upstream: https://www.astro.com/swisseph/

The upstream AGPL applies to the incorporated Swiss Ephemeris software. Distribution and network availability may impose additional obligations on the combined application, including corresponding source availability, copyright notices, and license text. This notice alone does **not** establish that all obligations have been met.

**Release checklist (not yet complete):**
- [ ] Obtain and include the full applicable AGPL-3.0 license text and upstream notices in deployed assets.
- [ ] Verify compatible licensing for the combined frontend and all bundled code.
- [ ] Provide an accessible Corresponding Source link from the deployed application, including build instructions.
- [ ] Check the license terms and attribution of remotely loaded ephemeris files.
- [ ] Verify WASM distribution and runtime initialization.
- [ ] Regenerate npm lockfile and run CI.
- [ ] Compare numerical results with independently calculated reference natal charts.

Do not merge or deploy this feature as production-ready until the checklist is completed.
