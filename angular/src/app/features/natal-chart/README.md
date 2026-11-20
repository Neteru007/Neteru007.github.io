# Natal chart integration

Implemented browser-side Swiss Ephemeris integration using @swisseph/browser 1.4.0 (AGPL-3.0), Swiss ephemeris data loading, tropical planetary positions, Placidus cusps, ASC/DSC/MC/IC, major natal aspects, and print-to-PDF. Birth time is converted using browser IANA timezone data and ambiguous DST times are rejected.

**Release blockers:** Regenerate and commit package-lock.json with npm install; verify npm ci and production build, WASM loading and Swiss ephemeris CDN availability on GitHub Pages; add independent numerical tests; verify license notices and application AGPL compliance. Do not merge or publish as complete before these checks.

Interpretive texts and day-specific transit predictions remain future work. The engine must not silently fall back to Moshier when Swiss ephemeris data fails.
