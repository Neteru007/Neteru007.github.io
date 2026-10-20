import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { runes } from '../data/deck.data';
import { runeBackgrounds } from './rune-guide.data';
@Component({
  selector: 'mg-rune-guide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rune-guide.component.html',
  styleUrl: './rune-guide.component.css',
})
export class RuneGuideComponent {
  readonly query = signal('');
  readonly aett = signal('');
  private readonly catalogue = runes.map((rune, index) => ({
    ...runeBackgrounds.find((background) => background.symbol === rune[0])!,
    number: index + 1,
    name: rune[1],
    theme: rune[2],
    question: rune[3],
    aett: Math.floor(index / 8) + 1,
  }));
  readonly filtered = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('uk');
    return this.catalogue.filter(
      (rune) =>
        (!this.aett() || rune.aett === Number(this.aett())) &&
        `${rune.number} ${rune.symbol} ${rune.name} ${rune.latin} ${rune.meaning} ${rune.theme}`
          .toLocaleLowerCase('uk')
          .includes(query),
    );
  });
  reset(): void {
    this.query.set('');
    this.aett.set('');
  }
}
