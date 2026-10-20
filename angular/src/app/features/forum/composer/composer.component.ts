import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import { ForumStore } from '../data/forum.store';
import { Category, categories } from '../data/forum.models';
import { errorMessage } from '../../../core/auth/auth.service';
@Component({
  selector: 'mg-forum-composer',
  standalone: true,
  imports: [FormsModule, DialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './composer.component.html',
  styleUrl: './composer.component.css',
})
export class ComposerComponent {
  readonly store = inject(ForumStore);
  private readonly router = inject(Router);
  readonly busy = signal(false);
  readonly status = signal('');
  readonly categories = Object.entries(categories);
  title = '';
  body = '';
  category: Category = 'general';
  async submit() {
    if (this.busy() || !this.store.needWriter()) return;
    this.busy.set(true);
    try {
      const id = await this.store.api.createTopic(
        this.store.auth.user()!.id,
        this.title,
        this.body,
        this.category,
      );
      this.store.dialog.set(null);
      this.store.notice.set('Тему опубліковано.');
      await this.router.navigate(['/forum', id]);
    } catch (e) {
      this.status.set(errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
}
