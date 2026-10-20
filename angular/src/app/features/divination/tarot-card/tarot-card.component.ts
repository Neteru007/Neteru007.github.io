import { Component, ChangeDetectionStrategy, input, output, signal, effect } from '@angular/core';
import { TarotCard, tarotImageBase } from '../data/deck.data';
@Component({
  selector: 'mg-tarot-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tarot-card.component.html',
  styleUrl: './tarot-card.component.css',
})
export class TarotCardComponent {
  readonly position = input.required<string>();
  readonly card = input<TarotCard>();
  readonly opened = input(false);
  readonly reveal = output<void>();
  readonly image = signal('');
  readonly failed = signal(false);
  private retried = false;
  constructor() {
    effect(() => {
      this.image.set(tarotImageBase + (this.card()?.imageFile || ''));
      this.failed.set(false);
      this.retried = false;
    });
  }
  imageError() {
    if (!this.retried) {
      this.retried = true;
      this.image.set(
        'https://raw.githubusercontent.com/mixvlad/TarotCards/840b84d012c6b74dc1634fa2d00d1b21f5b28093/tarot/rider-waite/720px/' +
          this.card()?.imageFile,
      );
    } else this.failed.set(true);
  }
}
