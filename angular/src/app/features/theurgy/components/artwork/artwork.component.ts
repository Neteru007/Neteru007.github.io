import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';
@Component({
  selector: 'mg-artwork',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './artwork.component.html',
  styleUrl: './artwork.component.css',
})
export class ArtworkComponent {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();
  readonly width = input(700);
  readonly height = input(800);
  readonly priority = input(false);
  readonly failed = signal(false);
  constructor() {
    effect(() => {
      this.src();
      this.failed.set(false);
    });
  }
}
