import { Routes } from '@angular/router';
export const forumRoutes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./topic-list/topic-list.component') },
  { path: ':id', loadComponent: () => import('./thread/thread.component') },
];
