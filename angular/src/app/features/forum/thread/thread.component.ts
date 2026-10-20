import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ForumStore } from '../data/forum.store';
import { Topic, Reply, categories, replyPageSize } from '../data/forum.models';
@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.css',
})
export default class ThreadComponent {
  readonly store = inject(ForumStore);
  private readonly router = inject(Router);
  private readonly params = toSignal(inject(ActivatedRoute).paramMap);
  readonly topic = signal<Topic | null>(null);
  readonly replies = signal<Reply[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly replyLoading = signal(false);
  readonly hasMore = signal(false);
  readonly error = signal(false);
  readonly categories = categories;
  body = '';
  private page = 0;
  private generation = 0;
  constructor() {
    effect((onCleanup) => {
      const id = this.params()?.get('id');
      this.store.refreshVersion();
      if (id) void this.load(id);
      onCleanup(() => {
        this.generation++;
      });
    });
  }
  async load(id = this.params()?.get('id') || '') {
    const generation = ++this.generation;
    this.loading.set(true);
    this.error.set(false);
    this.topic.set(null);
    this.replies.set([]);
    this.body = '';
    try {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return;
      const topic = await this.store.api.topic(id);
      if (generation !== this.generation) return;
      this.topic.set(topic);
      this.page = 0;
      if (topic) {
        const rows = await this.store.api.replies(id, 0);
        if (generation !== this.generation) return;
        this.replies.set(rows);
        this.hasMore.set(rows.length === replyPageSize);
      }
    } catch (e) {
      if (generation === this.generation) {
        this.error.set(true);
        this.store.fail(e);
      }
    } finally {
      if (generation === this.generation) this.loading.set(false);
    }
  }
  async more() {
    const topic = this.topic();
    if (!topic || this.replyLoading()) return;
    const generation = this.generation;
    this.replyLoading.set(true);
    try {
      const next = this.page + 1;
      const rows = await this.store.api.replies(topic.id, next);
      if (generation !== this.generation) return;
      this.page = next;
      this.replies.update((old) => [...old, ...rows]);
      this.hasMore.set(rows.length === replyPageSize);
    } catch (e) {
      this.store.fail(e);
    } finally {
      this.replyLoading.set(false);
    }
  }
  async action(work: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await work();
    } catch (e) {
      this.store.fail(e);
    } finally {
      this.busy.set(false);
    }
  }
  send() {
    if (!this.store.needWriter() || !this.body.trim()) return;
    void this.action(async () => {
      const id = this.topic()!.id;
      await this.store.api.reply(id, this.store.auth.user()!.id, this.body);
      this.body = '';
      this.store.notice.set('Відповідь опубліковано.');
      await this.load(id);
    });
  }
  deleteReply(id: string) {
    if (!confirm('Видалити відповідь?')) return;
    void this.action(async () => {
      await this.store.api.deleteReply(id);
      await this.load();
    });
  }
  closeTopic() {
    void this.action(async () => {
      const t = this.topic()!;
      await this.store.api.closeTopic(t.id, !t.closed);
      await this.load();
    });
  }
  deleteTopic() {
    if (!confirm('Видалити тему з усіма відповідями?')) return;
    void this.action(async () => {
      await this.store.api.deleteTopic(this.topic()!.id);
      await this.router.navigate(['/forum']);
      this.store.notice.set('Тему видалено.');
    });
  }
  ban(id: string) {
    void this.action(() => this.store.banUser(id));
  }
}
