import { Routes } from '@angular/router';
export const theurgyRoutes: Routes = [
  {
    path: 'theurgy',
    title: 'Теургія — magic_gallery',
    loadComponent: () => import('./pages/overview/overview.component'),
  },
  {
    path: 'enochian',
    title: 'Єнохіанська магія — magic_gallery',
    loadComponent: () => import('./pages/enochian/enochian.component'),
  },
  {
    path: 'ars-notoria',
    title: 'Ars Notoria — magic_gallery',
    loadComponent: () => import('./pages/ars-notoria/ars-notoria.component'),
  },
  {
    path: 'ars-notoria/:artId',
    loadComponent: () => import('./pages/ars-notoria/arts/art-detail.component'),
  },
  { path: 'overview', redirectTo: 'theurgy', pathMatch: 'full' },
  {
    path: 'demonology',
    data: { kind: 'demons' },
    title: 'Демонологія — magic_gallery',
    loadComponent: () => import('./pages/catalog/catalog.component'),
  },
  {
    path: 'angelology',
    data: { kind: 'angels' },
    title: 'Ангелологія — magic_gallery',
    loadComponent: () => import('./pages/catalog/catalog.component'),
  },
  {
    path: 'demonology/:id',
    data: { kind: 'demons' },
    loadComponent: () => import('./pages/detail/detail.component'),
  },
  {
    path: 'angelology/:id',
    data: { kind: 'angels' },
    loadComponent: () => import('./pages/detail/detail.component'),
  },
];
