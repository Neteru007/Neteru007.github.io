import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, of, startWith, Subject, switchMap } from 'rxjs';
import { CatalogService } from '../core/catalog.service';
import { CatalogEntry, CatalogKind } from '../core/models';
import { ArtworkComponent } from '../shared/artwork.component';
import { SourceListComponent } from '../shared/source-list.component';
import { InvocationComponent } from '../shared/invocation.component';
type PageState = { status: 'loading' } | { status: 'error' } | { status: 'missing' } | { status: 'ready'; entry: CatalogEntry };
@Component({ standalone: true, imports: [RouterLink, ArtworkComponent, SourceListComponent, InvocationComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: `
@let vm = state();
@if (vm.status === 'loading') { <p class="notice" role="status">Завантаження сторінки…</p> } @else if (vm.status === 'error') { <div class="notice" role="alert">Не вдалося отримати опис. <button type="button" (click)="retry.next()">Спробувати знову</button></div> } @else if (vm.status === 'missing') { <h1>Запис не знайдено</h1><a [routerLink]="catalogPath">← Повернутися до каталогу</a> } @else {
@let entry = vm.entry;
<a class="back-link" [routerLink]="catalogPath">← До галереї 72 {{ kind === 'demons' ? 'духів' : 'ангелів' }}</a><p class="eyebrow">{{ kind === 'demons' ? 'ARS GOETIA' : 'ШЕМ ГА-МЕФОРАШ' }} / № {{ entry.id }}</p><h1>{{ entry.name }}</h1><p class="intro">{{ entry.latin }} @if (entry.rank) { · {{ entry.rank }} } @if (entry.hebrew) { · <span lang="he" dir="rtl">{{ entry.hebrew }}</span> }</p>
<dl class="headline-facts"><div><dt>Стихія знака</dt><dd>{{ entry.element }}</dd></div><div><dt>{{ kind === 'demons' ? 'Планета рангу' : 'Планета декану' }}</dt><dd>{{ entry.planets.join(' / ') }}</dd></div><div><dt>Зодіакальний сектор</dt><dd>{{ entry.sign }} {{ entry.sector }}</dd></div></dl>
<div class="detail-visuals"><figure class="portrait-panel">@if (entry.illustration; as picture) { <mg-artwork [src]="picture.src" [alt]="(picture.kind === 'document' ? 'Уривок запису з Goetia: ' : picture.kind === 'seal' ? 'Розенкрейцерська печать: ' : 'Історичне зображення: ') + entry.name" [width]="picture.width" [height]="picture.height" [priority]="true" /><figcaption>{{ picture.caption }}<br><a [href]="picture.page" target="_blank" rel="noopener noreferrer">Джерело зображення ↗</a></figcaption>@if (picture.note) { <p class="small">{{ picture.note }}</p> } } @else { <div class="portrait-missing"><p class="eyebrow">ІСТОРИЧНЕ ЗОБРАЖЕННЯ</p><p>Окреме перевірене зображення цього {{ kind === 'demons' ? 'духа' : 'ангела' }} не знайдено у використаній добірці.</p><p class="small">{{ entry.appearance }}</p></div> }</figure><figure class="symbol-panel"><h2>{{ kind === 'demons' ? 'Сигіл' : 'Єврейське ім’я' }}</h2><mg-artwork [src]="entry.symbol" [alt]="entry.symbolCaption + ': ' + entry.name" [priority]="true" /><figcaption>{{ entry.symbolCaption }}</figcaption></figure></div>
<section class="content-section"><p class="eyebrow">ІСТОРИЧНЕ ДЖЕРЕЛО</p><h2>{{ kind === 'demons' ? 'Образ і опис за гримуаром' : 'Опис за Лененом' }}</h2><p>{{ entry.appearance }}</p><p>{{ entry.description }}</p><details class="original-text"><summary>{{ kind === 'demons' ? 'Англійський текст Goetia (1904)' : 'Англійський переклад уривка Ленена · Magick.ly' }}</summary><p [attr.lang]="entry.originalLanguage">{{ entry.original }}</p></details></section>
<section class="content-section"><h2>Стихійні та планетарні аспекти</h2><dl class="correspondence-table">@for (fact of entry.facts; track fact.label) { <dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd> }</dl>@for (note of entry.notes; track note) { <p class="small">{{ note }}</p> }</section>
<mg-invocation [value]="entry.invocation" [kind]="kind" /><mg-sources [sources]="entry.sources" />
<nav class="entry-navigation" aria-label="Сусідні записи">@if (entry.id > 1) { <a [routerLink]="[catalogPath, entry.id - 1]">← Попередній</a> }<a [routerLink]="catalogPath">Уся галерея</a>@if (entry.id < 72) { <a [routerLink]="[catalogPath, entry.id + 1]">Наступний →</a> }</nav>
}` })
export default class DetailComponent {
  private readonly route = inject(ActivatedRoute); private readonly catalog = inject(CatalogService); private readonly title = inject(Title);
  readonly kind = this.route.snapshot.data['kind'] as CatalogKind; readonly catalogPath = this.kind === 'demons' ? '/demonology' : '/angelology'; readonly retry = new Subject<void>();
  readonly state = toSignal(combineLatest([this.route.paramMap, this.retry.pipe(startWith(undefined))]).pipe(switchMap(([params]) => {
    const raw = params.get('id') || ''; const id = Number(raw);
    if (!/^\d{1,2}$/.test(raw) || id < 1 || id > 72) return of<PageState>({ status: 'missing' });
    return this.catalog.entries(this.kind).pipe(map(entries => { const entry = entries.find(item => item.id === id); return entry ? { status: 'ready', entry } as PageState : { status: 'missing' } as PageState; }), startWith({ status: 'loading' } as PageState), catchError(() => of<PageState>({ status: 'error' })));
  })), { initialValue: { status: 'loading' } as PageState });
  constructor() { effect(() => { const state = this.state(); if (state.status === 'ready') this.title.setTitle(state.entry.name + ' — magic_gallery'); else if (state.status === 'missing') this.title.setTitle('Запис не знайдено — magic_gallery'); }); }
}
