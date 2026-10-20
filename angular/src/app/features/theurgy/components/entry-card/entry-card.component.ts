import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogEntry } from '../../data/catalog.models';
import { ArtworkComponent } from '../artwork/artwork.component';
@Component({
  selector: 'mg-entry-card',
  standalone: true,
  imports: [RouterLink, ArtworkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entry-card.component.html',
  styleUrl: './entry-card.component.css',
})
export class EntryCardComponent {
  readonly entry = input.required<CatalogEntry>();
  imageAlt(): string {
    const e = this.entry();
    return (
      (e.illustration?.kind === 'document'
        ? 'Уривок запису з Goetia: '
        : e.illustration?.kind === 'seal'
          ? 'Розенкрейцерська печать: '
          : 'Історичне зображення: ') + e.name
    );
  }
  imageLabel(): string {
    const e = this.entry();
    return e.illustration?.kind === 'document'
      ? 'Уривок Goetia · електронне перевидання'
      : e.illustration?.kind === 'seal'
        ? 'Розенкрейцерська печать · Piers Vaughan (2020)'
        : e.illustration
          ? 'Історична ілюстрація'
          : e.symbolCaption;
  }
  kindPath(): string {
    return this.entry().kind === 'demons' ? '/demonology' : '/angelology';
  }
}
