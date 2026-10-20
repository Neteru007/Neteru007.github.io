import { Injectable, signal, DestroyRef, inject } from '@angular/core';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase-client';
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly recovery = signal(false);
  readonly revision = signal(0);
  private readonly redirectUrl = location.origin + '/';
  private queue: Promise<void> = Promise.resolve();
  constructor() {
    const subscription = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') this.recovery.set(true);
      // Auth events run under the SDK lock: schedule API work outside the callback.
      setTimeout(() => {
        void this.refresh().catch(() => {});
      }, 0);
    }).data.subscription;
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
    void this.refresh().catch(() => {});
  }
  refresh(): Promise<void> {
    this.queue = this.queue
      .catch(() => {})
      .then(async () => {
        this.loading.set(true);
        try {
          const { data, error } = await supabase.auth.getUser();
          if (error && error.name !== 'AuthSessionMissingError') throw error;
          this.user.set(data.user);
          this.error.set('');
          this.revision.update((n) => n + 1);
        } catch (e) {
          this.user.set(null);
          this.error.set(errorMessage(e));
          throw e;
        } finally {
          this.loading.set(false);
        }
      });
    return this.queue;
  }
  async login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await this.refresh();
  }
  async register(email: string, password: string, nickname: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname }, emailRedirectTo: this.redirectUrl },
    });
    if (error) throw error;
    await this.refresh();
    return !!data.session;
  }
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await this.refresh();
  }
  async resend(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: this.redirectUrl },
    });
    if (error) throw error;
  }
  async forgot(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: this.redirectUrl,
    });
    if (error) throw error;
  }
  async reset(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    this.recovery.set(false);
  }
}
export function errorMessage(error: unknown): string {
  const s =
    error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : String(error);
  if (/Invalid login credentials/.test(s)) return 'Невірний email або пароль.';
  if (/Email not confirmed/.test(s))
    return 'Підтвердьте email через лист. Можна надіслати його повторно.';
  if (
    /not authorized|email_address_not_authorized|email_provider_disabled|Error sending confirmation email/i.test(
      s,
    )
  )
    return 'Не вдалося надіслати лист. Спробуйте пізніше.';
  if (/rate limit|too many/i.test(s)) return 'Забагато запитів. Спробуйте трохи пізніше.';
  if (/row-level security|permission denied/.test(s))
    return 'Дія недоступна: перевірте вхід, статус блокування або права модерації.';
  if (/Failed to fetch|NetworkError/.test(s))
    return 'Не вдалося з’єднатися. Перевірте інтернет і спробуйте знову.';
  return s;
}
