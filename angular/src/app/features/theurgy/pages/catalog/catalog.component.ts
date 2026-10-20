import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, Subject, switchMap } from 'rxjs';
import { CatalogService } from '../../data/catalog.service';
import { CatalogKind, CatalogState } from '../../data/catalog.models';
import { EntryCardComponent } from '../../components/entry-card/entry-card.component';
import { CatalogFilterComponent } from '../../components/catalog-filter/catalog-filter.component';
@Component({
  standalone: true,
  imports: [EntryCardComponent, CatalogFilterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export default class CatalogComponent {
  readonly kind = inject(ActivatedRoute).snapshot.data['kind'] as CatalogKind;
  private readonly catalog = inject(CatalogService);
  readonly retry = new Subject<void>();
  readonly state = toSignal(
    this.retry.pipe(
      startWith(undefined),
      switchMap(() =>
        this.catalog.entries(this.kind).pipe(
          map((entries) => ({ status: 'ready', entries }) as CatalogState),
          startWith({ status: 'loading' } as CatalogState),
          catchError(() => of({ status: 'error' } as CatalogState)),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as CatalogState },
  );
  readonly query = signal('');
  readonly element = signal('');
  readonly planet = signal('');
  readonly imageType = signal('');
  readonly filtered = computed(() => {
    const state = this.state();
    if (state.status !== 'ready') return [];
    const normalize = (s: string) => s.toLocaleLowerCase('uk').replace(/[’'ʼ-]/g, '');
    const q = normalize(this.query().trim());
    return state.entries.filter(
      (e) =>
        (!q ||
          normalize(e.name + ' ' + e.latin + ' ' + (e.hebrew || '')).includes(q) ||
          String(e.id) === q ||
          String(e.id).padStart(2, '0') === q) &&
        (!this.element() || e.element === this.element()) &&
        (!this.planet() || e.planets.includes(this.planet())) &&
        (!this.imageType() || e.illustration?.kind === this.imageType()),
    );
  });
}
