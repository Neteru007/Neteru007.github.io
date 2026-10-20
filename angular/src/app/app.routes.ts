import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'magic_gallery — Галерея магічного мистецтва',
    loadComponent: () => import('./features/home/home.component'),
  },
  { path: 'articles/:slug', loadComponent: () => import('./features/articles/article.component') },
  {
    path: 'divination',
    loadComponent: () => import('./features/divination/divination.component'),
    loadChildren: () =>
      import('./features/divination/divination.routes').then((m) => m.divinationRoutes),
  },
  {
    path: 'forum',
    title: 'Форум — magic_gallery',
    loadComponent: () => import('./features/forum/forum.component'),
    loadChildren: () => import('./features/forum/forum.routes').then((m) => m.forumRoutes),
  },
  {
    path: 'belial',
    title: 'Викликати Беліала — magic_gallery',
    loadComponent: () => import('./features/belial/belial.component'),
  },
  {
    path: '',
    loadComponent: () => import('./features/theurgy/theurgy.component'),
    loadChildren: () => import('./features/theurgy/theurgy.routes').then((m) => m.theurgyRoutes),
  },
  {
    path: '**',
    title: 'Сторінку не знайдено — magic_gallery',
    loadComponent: () => import('./shared/not-found/not-found.component'),
  },
];
