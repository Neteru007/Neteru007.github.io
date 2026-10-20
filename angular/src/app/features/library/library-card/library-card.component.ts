import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LibraryCard } from '../data/library.data';
@Component({
  selector: 'mg-library-card',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './library-card.component.html',
  styleUrl: './library-card.component.css',
})
export class LibraryCardComponent {
  readonly card = input.required<LibraryCard>();
}
