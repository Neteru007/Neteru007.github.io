import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ForumStore } from '../data/forum.store';
import { Topic, categories, topicPageSize } from '../data/forum.models';
@Component({
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topic-list.component.html',
  styleUrl: './topic-list.component.css',
})
export default class TopicListComponent {
  readonly store = inject(ForumStore);
  readonly topics = signal<Topic[]>([]);
  readonly loading = signal(true);
  readonly hasMore = signal(false);
  readonly error = signal(false);
  readonly categories = categories;
  private page = 0;
  private generation = 0;
  private abort?: AbortController;
  constructor() {
    effect((onCleanup) => {
      const category = this.store.category(),
        search = this.store.search();
      this.store.refreshVersion();
      const generation = ++this.generation;
      this.abort?.abort();
      this.loading.set(true);
      const timer = setTimeout(() => {
        void this.load(false, category, search, generation);
      }, 300);
      onCleanup(() => {
        clearTimeout(timer);
        this.abort?.abort();
      });
    });
  }
  async load(
    append = false,
    category = this.store.category(),
    search = this.store.search(),
    generation = this.generation,
  ) {
    if (append && this.loading()) return;
    this.loading.set(true);
    this.error.set(false);
    const next = append ? this.page + 1 : 0;
    const controller = new AbortController();
    this.abort = controller;
    try {
      const rows = await this.store.api.topics(next, category, search, controller.signal);
      if (generation !== this.generation) return;
      this.page = next;
      this.topics.update((old) => (append ? [...old, ...rows] : rows));
      this.hasMore.set(rows.length === topicPageSize);
    } catch (e) {
      if (controller.signal.aborted || generation !== this.generation) return;
      this.error.set(true);
      this.store.fail(e);
    } finally {
      if (generation === this.generation) this.loading.set(false);
    }
  }
}
