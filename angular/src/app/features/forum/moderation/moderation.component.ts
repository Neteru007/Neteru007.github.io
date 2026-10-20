import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import { ForumStore } from '../data/forum.store';
import { Profile, Ban, activeBan, memberPageSize } from '../data/forum.models';
@Component({
  selector: 'mg-forum-moderation',
  standalone: true,
  imports: [DialogComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './moderation.component.html',
  styleUrl: './moderation.component.css',
})
export class ModerationComponent {
  readonly store = inject(ForumStore);
  readonly profiles = signal<Profile[]>([]);
  readonly bans = signal(new Map<string, Ban>());
  readonly busy = signal(false);
  readonly hasMore = signal(false);
  private page = 0;
  private generation = 0;
  constructor() {
    effect((onCleanup) => {
      this.store.refreshVersion();
      if (this.store.identity().admin) void this.load();
      onCleanup(() => this.generation++);
    });
  }
  active(id: string) {
    return activeBan(this.bans().get(id));
  }
  async load(append = false) {
    const generation = ++this.generation;
    this.busy.set(true);
    try {
      const next = append ? this.page + 1 : 0;
      const value = await this.store.api.members(next);
      if (generation !== this.generation) return;
      this.page = next;
      this.profiles.update((old) => (append ? [...old, ...value.profiles] : value.profiles));
      this.bans.set(new Map(value.bans.map((b) => [b.user_id, b])));
      this.hasMore.set(value.profiles.length === memberPageSize);
    } catch (e) {
      this.store.fail(e);
    } finally {
      if (generation === this.generation) this.busy.set(false);
    }
  }
  async ban(id: string) {
    try {
      await this.store.banUser(id);
    } catch (e) {
      this.store.fail(e);
    }
  }
  async unban(id: string) {
    try {
      await this.store.api.unban(id);
      this.store.notice.set('Користувача розбанено.');
      await this.load();
    } catch (e) {
      this.store.fail(e);
    }
  }
}
