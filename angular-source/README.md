# Angular planetary calculator integration

This folder contains **Angular source**, not another standalone HTML page.

## Current repository limitation

The published `main` branch contains a compiled Angular application in `catalogues/`, but does not contain `angular.json`, `package.json`, or `src/app`. The original application cannot be rebuilt safely from the files presently checked in. Do **not** overwrite the existing deployment with a new empty Angular application.

## Integration when the original source is available

1. Copy `planetary-calculator/planetary-calculator.component.ts` into the application's source tree, e.g. `src/app/features/planetary-calculator/`.
2. Install `astronomy-engine` and `suncalc` and their TypeScript declarations as needed.
3. Add to the existing Angular routes (preserve all existing routes):

```ts
{
  path: 'planetary-calculator',
  loadComponent: () => import('./features/planetary-calculator/planetary-calculator.component')
    .then(m => m.PlanetaryCalculatorComponent)
}
```

4. Add `routerLink="/planetary-calculator"` to the existing navigation.
5. Run the application's tests and `ng build` using its existing Angular version and build configuration.
6. Publish the output through the existing GitHub Pages workflow. Only after confirming the Angular route works, retire the old `planetary-calendar/index.html` page.

## Calculation notes

The component supports location lookup, current/manual local time, geocentric tropical ecliptic longitudes, classical aspects, and unequal planetary hours. The planetary day begins at local sunrise. A previous-night segment is included for times before sunrise. It does not yet implement book-specific talisman election rules. Check high-latitude sunrise/sunset and DST boundary cases before production release.

This branch is deliberately a source-only integration proposal, not a deployed feature.
