import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import { ForumStore } from '../data/forum.store';
import { errorMessage } from '../../../core/auth/auth.service';
@Component({
  selector: 'mg-forum-auth',
  standalone: true,
  imports: [FormsModule, DialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-dialog.component.html',
  styleUrl: './auth-dialog.component.css',
})
export class AuthDialogComponent {
  readonly store = inject(ForumStore);
  readonly busy = signal(false);
  readonly registering = signal(false);
  readonly confirmation = signal(false);
  readonly status = signal('');
  email = '';
  password = '';
  nickname = '';
  private resendUntil = 0;
  async run(action: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await action();
    } catch (e) {
      this.status.set(errorMessage(e));
      if (/Email not confirmed/.test(String((e as Error).message))) this.confirmation.set(true);
    } finally {
      this.busy.set(false);
    }
  }
  submit() {
    void this.run(async () => {
      this.status.set(this.registering() ? 'Реєструємо…' : 'Входимо…');
      if (this.registering()) {
        const loggedIn = await this.store.auth.register(
          this.email.trim(),
          this.password,
          this.nickname.trim(),
        );
        this.password = '';
        if (!loggedIn) {
          this.confirmation.set(true);
          this.status.set(
            'Запит на реєстрацію прийнято. Перевірте пошту ' +
              this.email +
              '. Якщо акаунт уже існує, перейдіть до входу.',
          );
          return;
        }
      } else await this.store.auth.login(this.email.trim(), this.password);
      this.password = '';
      this.store.dialog.set(null);
      this.store.notice.set('Ви успішно увійшли до кола.');
    });
  }
  resend() {
    void this.run(async () => {
      if (Date.now() < this.resendUntil) {
        this.status.set('Зачекайте хвилину перед повторним надсиланням.');
        return;
      }
      await this.store.auth.resend(this.email.trim());
      this.resendUntil = Date.now() + 60000;
      this.status.set('Запит на повторне надсилання прийнято. Перевірте пошту.');
    });
  }
  forgot() {
    void this.run(async () => {
      await this.store.auth.forgot(this.email.trim());
      this.status.set('Якщо акаунт існує, на пошту надійде лист для відновлення.');
    });
  }
  toggle() {
    this.registering.update((v) => !v);
    this.status.set('');
  }
}
