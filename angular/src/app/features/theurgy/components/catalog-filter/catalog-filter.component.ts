import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
@Component({
  selector: 'mg-catalog-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog-filter.component.html',
  styleUrl: './catalog-filter.component.css',
})
export class CatalogFilterComponent {
  readonly query = model('');
  readonly element = model('');
  readonly planet = model('');
  readonly imageType = model('');
  readonly kind = input('demons');
  readonly elements = ['Вогонь', 'Земля', 'Повітря', 'Вода'];
  readonly planets = ['Сонце', 'Місяць', 'Меркурій', 'Венера', 'Марс', 'Юпітер', 'Сатурн'];
}
