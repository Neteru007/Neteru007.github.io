import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import { ForumStore } from '../data/forum.store';
import { errorMessage } from '../../../core/auth/auth.service';
@Component({
  selector: 'mg-forum-account',
  standalone: true,
  imports: [FormsModule, DialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-dialog.component.html',
  styleUrl: './account-dialog.component.css',
})
export class AccountDialogComponent {
  readonly store = inject(ForumStore);
  readonly reset = this.store.dialog() === 'reset';
  readonly busy = signal(false);
  readonly status = signal('');
  value = this.reset ? '' : this.store.identity().profile?.nickname || '';
  close() {
    this.store.auth.recovery.set(false);
    this.store.dialog.set(null);
  }
  async submit() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      if (this.reset) {
        await this.store.auth.reset(this.value);
        this.store.notice.set('Пароль оновлено.');
      } else {
        if (this.value.trim().length < 2) throw Error('Ім’я має містити 2–40 символів.');
        await this.store.api.rename(this.store.auth.user()!.id, this.value);
        await this.store.refreshIdentity();
        this.store.refresh();
        this.store.notice.set('Ім’я оновлено.');
      }
      this.value = '';
      this.close();
    } catch (e) {
      this.status.set(errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
}
