import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, of, startWith, Subject, switchMap } from 'rxjs';
import { CatalogService } from '../../data/catalog.service';
import { CatalogEntry, CatalogKind } from '../../data/catalog.models';
import { ArtworkComponent } from '../../components/artwork/artwork.component';
import { SourceListComponent } from '../../components/source-list/source-list.component';
import { InvocationComponent } from '../../components/invocation/invocation.component';
type PageState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'missing' }
  | { status: 'ready'; entry: CatalogEntry };
@Component({
  standalone: true,
  imports: [RouterLink, ArtworkComponent, SourceListComponent, InvocationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
})
export default class DetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  private readonly title = inject(Title);
  readonly kind = this.route.snapshot.data['kind'] as CatalogKind;
  readonly catalogPath = this.kind === 'demons' ? '/demonology' : '/angelology';
  readonly retry = new Subject<void>();
  readonly state = toSignal(
    combineLatest([this.route.paramMap, this.retry.pipe(startWith(undefined))]).pipe(
      switchMap(([params]) => {
        const raw = params.get('id') || '';
        const id = Number(raw);
        if (!/^\d{1,2}$/.test(raw) || id < 1 || id > 72)
          return of<PageState>({ status: 'missing' });
        return this.catalog.entries(this.kind).pipe(
          map((entries) => {
            const entry = entries.find((item) => item.id === id);
            return entry
              ? ({ status: 'ready', entry } as PageState)
              : ({ status: 'missing' } as PageState);
          }),
          startWith({ status: 'loading' } as PageState),
          catchError(() => of<PageState>({ status: 'error' })),
        );
      }),
    ),
    { initialValue: { status: 'loading' } as PageState },
  );
  constructor() {
    effect(() => {
      const state = this.state();
      if (state.status === 'ready') this.title.setTitle(state.entry.name + ' — magic_gallery');
      else if (state.status === 'missing') this.title.setTitle('Запис не знайдено — magic_gallery');
    });
  }
}
