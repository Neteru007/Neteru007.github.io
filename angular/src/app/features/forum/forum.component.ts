import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ForumStore } from './data/forum.store';
import { categories } from './data/forum.models';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';
import { ComposerComponent } from './composer/composer.component';
import { AccountDialogComponent } from './account-dialog/account-dialog.component';
import { ModerationComponent } from './moderation/moderation.component';
@Component({
  standalone: true,
  providers: [ForumStore],
  imports: [
    RouterOutlet,
    AuthDialogComponent,
    ComposerComponent,
    AccountDialogComponent,
    ModerationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.css',
})
export default class ForumComponent {
  readonly store = inject(ForumStore);
  private readonly router = inject(Router);
  readonly categories = Object.entries(categories);
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap);
  constructor() {
    effect(() => {
      const params = this.params();
      if (!params) return;
      if (params.get('auth') === 'recovery') {
        this.store.auth.recovery.set(true);
        this.store.dialog.set('reset');
      } else if (params.get('auth') === 'confirmed')
        this.store.notice.set('Email підтверджено. Ласкаво просимо до кола!');
      if (params.get('authError'))
        this.store.notice.set('Не вдалося підтвердити email: ' + params.get('authError'));
    });
  }
  changeCategory(value: string) {
    this.store.category.set(value);
    void this.router.navigate(['/forum']);
  }
  search(value: string) {
    this.store.search.set(value);
    void this.router.navigate(['/forum']);
  }
  compose() {
    if (this.store.needWriter()) this.store.dialog.set('compose');
  }
  async logout() {
    try {
      await this.store.auth.logout();
      this.store.notice.set('Ви вийшли з акаунта.');
    } catch (e) {
      this.store.fail(e);
    }
  }
}
