import { Component, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { libraryCards } from './data/library.data';
import { LibraryCardComponent } from './library-card/library-card.component';
@Component({
  selector: 'mg-library',
  standalone: true,
  imports: [LibraryCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './library.component.html',
  styleUrl: './library.component.css',
})
export class LibraryComponent {
  readonly query = signal('');
  readonly category = signal('all');
  readonly categories = [
    ['all', 'Усі матеріали'],
    ['practice', 'Практика'],
    ['symbols', 'Символи'],
    ['tradition', 'Традиції'],
  ];
  readonly cards = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('uk');
    return libraryCards.filter(
      (c) =>
        (this.category() === 'all' || c.category === this.category()) &&
        [c.title, c.description, c.meta].join(' ').toLocaleLowerCase('uk').includes(q),
    );
  });
}
