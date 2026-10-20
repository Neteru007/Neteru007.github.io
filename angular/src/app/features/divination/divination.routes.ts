import { Routes } from '@angular/router';
export const divinationRoutes: Routes = [
  { path: '', redirectTo: 'tarot', pathMatch: 'full' },
  {
    path: 'tarot',
    title: 'Таро — magic_gallery',
    loadComponent: () => import('./tarot/tarot.component'),
  },
  {
    path: 'runes',
    title: 'Руни — magic_gallery',
    loadComponent: () => import('./runes/runes.component'),
  },
];
