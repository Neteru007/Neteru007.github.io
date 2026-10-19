import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogEntry } from '../core/models';
import { ArtworkComponent } from './artwork.component';
@Component({ selector: 'mg-entry-card', standalone: true, imports: [RouterLink, ArtworkComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: `<a class="entry-card" [routerLink]="[kindPath(), entry().id]" [attr.aria-label]="entry().name + ' — відкрити опис'"><div class="card-number">№ {{ entry().id.toString().padStart(2, '0') }} <span aria-hidden="true">↗</span></div><div class="card-visual"><mg-artwork [src]="entry().illustration?.src || entry().symbol" [alt]="imageAlt()" />@if (entry().illustration && entry().kind === 'demons') { <div class="seal-badge"><mg-artwork [src]="entry().symbol" [alt]="'Сигіл ' + entry().name" [width]="100" [height]="100" /></div> }</div><p class="image-label">{{ imageLabel() }}</p><h2>{{ entry().name }}</h2><p class="latin">{{ entry().latin }} @if (entry().rank) { · {{ entry().rank }} }</p><div class="tags"><span>{{ entry().element }} · знак {{ entry().sign }}</span><span>{{ entry().planets.join(' / ') }}</span></div><p class="card-description">{{ entry().description }}</p><span class="card-action">Опис · Відповідності · {{ entry().kind === 'demons' ? 'Енн' : 'Псалом' }} →</span></a>` })
export class EntryCardComponent {
  readonly entry = input.required<CatalogEntry>();
  imageAlt(): string { const e = this.entry(); return (e.illustration?.kind === 'document' ? 'Уривок запису з Goetia: ' : e.illustration?.kind === 'seal' ? 'Розенкрейцерська печать: ' : 'Історичне зображення: ') + e.name; }
  imageLabel(): string { const e = this.entry(); return e.illustration?.kind === 'document' ? 'Уривок Goetia · електронне перевидання' : e.illustration?.kind === 'seal' ? 'Розенкрейцерська печать · Piers Vaughan (2020)' : e.illustration ? 'Історична ілюстрація' : e.symbolCaption; }
  kindPath(): string { return this.entry().kind === 'demons' ? '/demonology' : '/angelology'; }
}
