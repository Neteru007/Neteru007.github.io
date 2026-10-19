import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'Теургія — magic_gallery', loadComponent: () => import('./pages/overview.component') },
  { path: 'overview', redirectTo: '', pathMatch: 'full' },
  { path: 'demonology', data: { kind: 'demons' }, title: 'Демонологія — magic_gallery', loadComponent: () => import('./pages/catalog.component') },
  { path: 'angelology', data: { kind: 'angels' }, title: 'Ангелологія — magic_gallery', loadComponent: () => import('./pages/catalog.component') },
  { path: 'demonology/:id', data: { kind: 'demons' }, loadComponent: () => import('./pages/detail.component') },
  { path: 'angelology/:id', data: { kind: 'angels' }, loadComponent: () => import('./pages/detail.component') },
  { path: '**', loadComponent: () => import('./pages/not-found.component'), title: 'Сторінку не знайдено — magic_gallery' }
];
