import { Component, ChangeDetectionStrategy, signal, DestroyRef, inject } from '@angular/core';
import { runes } from '../data/deck.data';
import { randomIndex } from '../domain/random';
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './runes.component.html',
  styleUrl: './runes.component.css',
})
export default class RunesComponent {
  readonly rune = signal<readonly string[] | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }
  draw() {
    if (this.busy()) return;
    this.busy.set(true);
    this.rune.set(null);
    this.error.set('');
    this.timer = setTimeout(() => {
      try {
        this.rune.set(runes[randomIndex(runes.length)]);
      } catch {
        this.error.set('Не вдалося витягнути руну. Спробуйте ще раз.');
      } finally {
        this.busy.set(false);
      }
    }, 450);
  }
}
