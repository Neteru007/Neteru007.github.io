import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { bookRunes } from './rune-magic.data';
@Component({
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rune-magic.component.html',
  styleUrl: './rune-magic.component.css',
})
export default class RuneMagicComponent {
  readonly runes = bookRunes;
}
