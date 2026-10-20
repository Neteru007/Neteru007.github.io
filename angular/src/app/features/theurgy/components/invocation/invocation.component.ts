import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CatalogEntry } from '../../data/catalog.models';
@Component({
  selector: 'mg-invocation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invocation.component.html',
  styleUrl: './invocation.component.css',
})
export class InvocationComponent {
  readonly value = input.required<CatalogEntry['invocation']>();
  readonly kind = input.required<string>();
  readonly status = signal('');
  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.value().text);
      this.status.set('Текст скопійовано');
    } catch {
      this.status.set('Виділіть текст і скопіюйте його вручну.');
    }
  }
}
