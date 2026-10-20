import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { notoriaArts, notoriaFigures, notoriaPrayers, notoriaSources } from './ars-notoria.data';
@Component({
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ars-notoria.component.html',
  styleUrl: './ars-notoria.component.css',
})
export default class ArsNotoriaComponent {
  readonly query = signal('');
  readonly group = signal('');
  readonly figures = notoriaFigures;
  readonly prayers = notoriaPrayers;
  readonly sources = notoriaSources;
  readonly failedImages = signal<ReadonlySet<string>>(new Set());
  readonly arts = computed(() =>
    notoriaArts.filter(
      (art) =>
        (!this.group() || art.group === this.group()) &&
        `${art.title} ${art.description} ${art.witness}`
          .toLocaleLowerCase('uk')
          .includes(this.query().trim().toLocaleLowerCase('uk')),
    ),
  );
  imageFailed(id: string): void {
    this.failedImages.update((ids) => new Set([...ids, id]));
  }
}
