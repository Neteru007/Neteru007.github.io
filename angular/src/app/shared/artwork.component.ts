import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
@Component({ selector: 'mg-artwork', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: `@if (!failed()) { <img [src]="src()" [alt]="alt()" [width]="width()" [height]="height()" [attr.loading]="priority() ? 'eager' : 'lazy'" decoding="async" referrerpolicy="no-referrer" (error)="failed.set(true)"> } @else { <p class="image-error" role="status">Зображення недоступне. Скористайтеся посиланням на джерело.</p> }` })
export class ArtworkComponent {
  readonly src = input.required<string>(); readonly alt = input.required<string>();
  readonly width = input(700); readonly height = input(800); readonly priority = input(false);
  readonly failed = signal(false);
  constructor() { effect(() => { this.src(); this.failed.set(false); }); }
}
