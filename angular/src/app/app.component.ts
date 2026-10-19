import { ChangeDetectionStrategy, Component, DOCUMENT, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({ selector: 'mg-root', standalone: true, imports: [RouterLink, RouterLinkActive, RouterOutlet], changeDetection: ChangeDetectionStrategy.OnPush, template: `
<a class="skip-link" href="#main-content" (click)="focusMain($event)">До вмісту</a>
<header class="site-header"><a class="brand" href="/">✧ magic_gallery</a><nav aria-label="Головна навігація"><a href="/">Головна</a><a routerLink="/" class="active">Теургія</a><a href="/divination.html">Онлайн-гадання</a><a href="/forum.html">Форум</a><a href="/belial.html">Викликати Беліала ✧</a></nav></header>
<main id="main-content" tabindex="-1"><p class="breadcrumb"><a href="/">Головна</a> / Теургія</p><nav class="section-nav" aria-label="Розділи теургії"><a routerLink="/" routerLinkActive="selected" [routerLinkActiveOptions]="{exact:true}">Огляд</a><a routerLink="/angelology" routerLinkActive="selected">Ангелологія</a><a routerLink="/demonology" routerLinkActive="selected">Демонологія</a></nav>
@if (navigating()) { <div class="route-progress" role="status">Завантаження сторінки…</div> }
@if (routeError()) { <div class="notice" role="alert">Не вдалося завантажити сторінку. <button type="button" (click)="reload()">Спробувати ще раз</button></div> }
<router-outlet /></main><footer>magic_gallery · Бібліотека символів і традицій</footer>` })
export class AppComponent {
  private readonly document = inject(DOCUMENT);
  readonly navigating = signal(false);
  readonly routeError = signal(false);
  constructor() { inject(Router).events.pipe(takeUntilDestroyed()).subscribe(event => {
    if (event instanceof NavigationStart) { this.navigating.set(true); this.routeError.set(false); }
    if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) this.navigating.set(false);
    if (event instanceof NavigationError) this.routeError.set(true);
  }); }
  focusMain(event: Event): void { event.preventDefault(); this.document.getElementById('main-content')?.focus(); }
  reload(): void { this.document.defaultView?.location.reload(); }
}
