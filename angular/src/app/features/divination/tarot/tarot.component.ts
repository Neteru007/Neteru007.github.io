import { Component, ChangeDetectionStrategy, signal, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { deck, TarotCard } from '../data/deck.data';
import { drawWithoutReplacement } from '../domain/random';
import { positions, readingText } from '../domain/reading';
import { TarotCardComponent } from '../tarot-card/tarot-card.component';
@Component({
  standalone: true,
  imports: [FormsModule, TarotCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tarot.component.html',
  styleUrl: './tarot.component.css',
})
export default class TarotComponent {
  readonly positions = positions;
  readonly readingText = readingText;
  readonly spread = signal<TarotCard[]>([]);
  readonly opened = signal<ReadonlySet<number>>(new Set());
  readonly drawing = signal(false);
  readonly status = signal('Три позиції — три погляди на вашу історію.');
  question = '';
  readonly readingTitle = signal('');
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }
  draw() {
    if (this.drawing()) return;
    this.drawing.set(true);
    this.clear();
    this.status.set('Тасуємо колоду…');
    this.timer = setTimeout(() => {
      try {
        this.spread.set(drawWithoutReplacement(deck, 3));
        this.readingTitle.set(this.question.trim() || 'Три погляди на ситуацію');
        this.status.set('Карти витягнуто. Відкрийте кожну у своєму темпі.');
      } catch {
        this.status.set('Не вдалося витягнути карти. Спробуйте ще раз.');
      } finally {
        this.drawing.set(false);
      }
    }, 450);
  }
  reveal(index: number) {
    if (!this.spread().length) return;
    this.opened.update((old) => new Set([...old, index]));
    this.status.set('Відкрито ' + this.opened().size + ' з 3 карт.');
  }
  revealAll() {
    positions.forEach((_, i) => this.reveal(i));
  }
  clear() {
    this.spread.set([]);
    this.opened.set(new Set());
    this.status.set('Розклад прибрано. Можна поставити нове запитання.');
  }
}
