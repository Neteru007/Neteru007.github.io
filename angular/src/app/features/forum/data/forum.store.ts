import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { AuthService, errorMessage } from '../../../core/auth/auth.service';
import { ForumService } from './forum.service';
import { Identity } from './forum.models';
@Injectable()
export class ForumStore {
  readonly auth = inject(AuthService);
  readonly api = inject(ForumService);
  readonly identity = signal<Identity>({ profile: null, admin: false, banned: false });
  readonly identityLoading = signal(false);
  readonly notice = signal('');
  readonly dialog = signal<'login' | 'compose' | 'admin' | 'reset' | 'nickname' | null>(null);
  readonly category = signal('all');
  readonly search = signal('');
  readonly refreshVersion = signal(0);
  readonly canWrite = computed(
    () =>
      !!this.auth.user() &&
      !!this.identity().profile &&
      !this.identity().banned &&
      !this.identityLoading(),
  );
  private version = 0;
  constructor() {
    effect(() => {
      this.auth.revision();
      void this.refreshIdentity();
    });
    effect(() => {
      if (this.auth.recovery()) this.dialog.set('reset');
    });
  }
  async refreshIdentity() {
    const version = ++this.version;
    const user = this.auth.user();
    this.identity.set({ profile: null, admin: false, banned: false });
    if (!user) {
      this.identityLoading.set(false);
      return;
    }
    this.identityLoading.set(true);
    try {
      const value = await this.api.identity(user);
      if (version === this.version) this.identity.set(value);
    } catch (e) {
      if (version === this.version) this.fail(e);
    } finally {
      if (version === this.version) this.identityLoading.set(false);
    }
  }
  fail(error: unknown) {
    this.notice.set(errorMessage(error));
  }
  needWriter(): boolean {
    if (!this.auth.user()) {
      this.dialog.set('login');
      return false;
    }
    if (!this.canWrite()) {
      this.notice.set(
        this.identity().banned
          ? 'Ваше право писати обмежено адміністрацією.'
          : 'Зачекайте завантаження профілю.',
      );
      return false;
    }
    return true;
  }
  refresh() {
    this.refreshVersion.update((n) => n + 1);
  }
  async banUser(id: string) {
    if (!this.identity().admin || id === this.auth.user()?.id) return;
    const duration = prompt('Тривалість бану в днях (1–3650) або «назавжди»:', '7');
    if (duration === null) return;
    let until: string;
    if (duration.trim().toLowerCase() === 'назавжди') until = 'infinity';
    else {
      const days = Number(duration);
      if (!Number.isInteger(days) || days < 1 || days > 3650) {
        this.notice.set('Вкажіть число днів від 1 до 3650.');
        return;
      }
      until = new Date(Date.now() + days * 86400000).toISOString();
    }
    const reason = prompt('Причина (видима користувачеві):', 'Порушення правил форуму');
    if (reason === null) return;
    await this.api.ban(id, until, reason);
    this.notice.set('Право писати обмежено.');
    this.refresh();
  }
}
