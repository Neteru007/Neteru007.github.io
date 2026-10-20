import { Component, ChangeDetectionStrategy, ElementRef, viewChild, signal } from '@angular/core';
import { escapePosition } from './domain/escape';
import { replies } from './data/replies.data';
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './belial.component.html',
  styleUrl: './belial.component.css',
  host: { '(window:resize)': 'center()' },
})
export default class BelialComponent {
  private readonly arena = viewChild.required<ElementRef<HTMLElement>>('arena');
  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');
  readonly position = signal<{ x: number; y: number } | null>(null);
  readonly status = signal('Беліал очікує… але це неточно.');
  private attempts = 0;
  private last = -Infinity;
  enter(event: PointerEvent) {
    if (event.pointerType !== 'touch') this.move(event);
  }
  move(event: Event) {
    if (event.cancelable) event.preventDefault();
    const now = performance.now();
    if (now - this.last < 140) return;
    this.last = now;
    this.attempts++;
    const a = this.arena().nativeElement,
      b = this.button().nativeElement,
      rect = a.getBoundingClientRect(),
      br = b.getBoundingClientRect();
    const pointer =
      event instanceof MouseEvent
        ? { x: event.clientX - rect.left, y: event.clientY - rect.top }
        : { x: br.left - rect.left + br.width / 2, y: br.top - rect.top + br.height / 2 };
    this.position.set(
      escapePosition({
        width: a.clientWidth,
        height: a.clientHeight,
        buttonWidth: b.offsetWidth,
        buttonHeight: b.offsetHeight,
        pointerX: pointer.x,
        pointerY: pointer.y,
      }),
    );
    this.status.set(replies[(this.attempts - 1) % replies.length] + ' · Спроба ' + this.attempts);
  }
  center() {
    this.position.set(null);
  }
  reset() {
    this.attempts = 0;
    this.last = -Infinity;
    this.center();
    this.status.set('Беліал знову на місці. Не сполохайте.');
  }
}
