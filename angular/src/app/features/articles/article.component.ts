import { Component, ChangeDetectionStrategy, computed, inject, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { articles } from './data/articles.data';
@Component({
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './article.component.html',
  styleUrl: './article.component.css',
})
export default class ArticleComponent {
  private readonly params = toSignal(inject(ActivatedRoute).paramMap);
  readonly article = computed(() => articles.find((a) => a.slug === this.params()?.get('slug')));
  private readonly title = inject(Title);
  constructor() {
    effect(() =>
      this.title.setTitle((this.article()?.title || 'Матеріал не знайдено') + ' — magic_gallery'),
    );
  }
}
