# Swiss Ephemeris AGPL-3.0 compliance review

Project license: [GNU AGPL version 3](../LICENSE) (full verbatim license). Source and build instructions: https://github.com/Neteru007/Neteru007.github.io and [Angular README](README.md).

## Third-party attribution

- Swiss Ephemeris: Copyright Astrodienst AG and other contributors; upstream https://www.astro.com/swisseph/ and https://github.com/aloistr/swisseph.
- JavaScript/WebAssembly binding: `@swisseph/browser@1.4.0`, https://github.com/swisseph-js/swisseph, AGPL-3.0.
- Ephemeris files: loaded by the browser wrapper from its configured CDN at runtime; retain their upstream notices and check their actual distribution terms.
- Other dependencies: consult the generated `catalogues/3rdpartylicenses.txt` and their own upstream license files. Do not assume they are all AGPL.

## Publication and source availability

The natal-chart page visibly links to the full AGPL text and public Corresponding Source repository. The repository includes package-lock.json and build scripts. GitHub Pages serves compiled JavaScript; the corresponding source is public.

## Independent astronomical reference fixtures

`tests/natal-reference.test.mjs` compares 3 UTC birth charts (Greenwich 2000, Kyiv 1990, New York 1985) against values independently generated with pyswisseph 2.10.03, using tropical Placidus houses. It checks Sun and Moon longitudes, all 12 cusps, ASC and MC, tolerance 0.02° (1.2 arcminutes). Tests must run against the actual WASM package; do not claim numerical validation merely because test code exists.

## Outstanding legal/technical checks

- Confirm deployed `3rdpartylicenses.txt` includes Swiss Ephemeris/WASM and all retained copyright notices; supplement if omitted.
- Confirm license provenance/redistribution permissions of ephemeris data fetched from third-party CDN.
- Confirm the deployed site offers the exact corresponding source version and build instructions, including any necessary WASM assets.
- Verify real browser initialization and external CDN access on GitHub Pages, not just Node CI.
- Confirm project ownership and any separately licensed third-party assets are compatible with the chosen project AGPL licensing.
- Review the overall combined-work licensing with a qualified professional if commercial or third-party content is involved.

This is a technical compliance review, **not a legal opinion or a guarantee of complete compliance**.
