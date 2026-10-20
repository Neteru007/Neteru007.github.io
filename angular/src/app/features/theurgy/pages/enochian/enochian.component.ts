import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { enochianKeys, aethyrs } from './enochian.data';
@Component({
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './enochian.component.html',
  styleUrl: './enochian.component.css',
})
export default class EnochianComponent {
  readonly query = signal('');
  readonly keys = computed(() =>
    enochianKeys.filter((key) =>
      `${key.title} ${key.summary} ${key.use}`
        .toLocaleLowerCase('uk')
        .includes(this.query().toLocaleLowerCase('uk')),
    ),
  );
  readonly aethyrs = aethyrs;
  readonly tables = [
    { id: 'air', name: 'Повітря', direction: 'Схід', word: 'EXARP', page: 11 },
    { id: 'water', name: 'Вода', direction: 'Захід', word: 'HKOMA', page: 10 },
    { id: 'earth', name: 'Земля', direction: 'Північ', word: 'NANTA', page: 9 },
    { id: 'fire', name: 'Вогонь', direction: 'Південь', word: 'BITOM', page: 12 },
    {
      id: 'union',
      name: 'Таблиця Єднання',
      direction: 'Дух: зв’язок чотирьох стихій',
      word: 'EXARP · HKOMA · NANTA · BITOM',
      page: 13,
    },
  ];
}
