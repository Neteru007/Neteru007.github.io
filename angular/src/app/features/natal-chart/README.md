# Natal chart integration (work in progress)

This feature is intentionally **not** a natal chart calculator yet. It collects and validates birth inputs locally and clearly labels the missing calculation engine. Never present fabricated planetary positions, Placidus houses, angles, or transits.

## Next integration milestones

1. Select and package an audited Swiss Ephemeris JavaScript/WASM implementation with its AGPL notices and source availability requirements. Confirm the license obligations for the full distributed application.
2. Convert local birth time using IANA historical timezone rules, handling DST gaps and repeated local times explicitly.
3. Calculate geocentric tropical longitudes, speeds and retrograde flags using Swiss Ephemeris.
4. Call Swiss Ephemeris house calculations with Placidus ('P') and latitude/longitude. Handle unsupported polar latitudes explicitly. Derive opposite angles DSC and IC from ASC and MC.
5. Add deterministic comparison fixtures against published reference ephemerides and independent Astro.com charts.
6. Add Ukrainian original interpretive content, exact transit dates, a chart wheel, and print/PDF styles. Astro-Databank is reference birth data, not a source of reusable copyrighted interpretations.

Do not deploy this feature as a finished calculator before the above steps pass tests.
