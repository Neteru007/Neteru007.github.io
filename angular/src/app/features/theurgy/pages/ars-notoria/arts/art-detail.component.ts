import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { notoriaArts } from './notoria-arts.data';
@Component({
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './art-detail.component.html',
  styleUrl: './art-detail.component.css',
})
export default class ArtDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly art = computed(() => notoriaArts.find((item) => item.id === this.params().get('artId')));
  readonly failedImage = signal('');
  readonly related = computed(() => notoriaArts.filter((item) => item.id !== this.art()?.id));
  constructor() {
    effect(() =>
      this.title.setTitle(
        `${this.art()?.title ?? 'Науку не знайдено'} — Ars Notoria — magic_gallery`,
      ),
    );
  }
}
