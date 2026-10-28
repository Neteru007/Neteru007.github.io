import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BirthInput, Chart } from './domain/models';
import ReportComponent from './report/report.component';
@Component({
  selector: 'mg-human-design',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, ReportComponent],
  templateUrl: './human-design.component.html',
  styleUrl: './human-design.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HumanDesignComponent {
  input: BirthInput = { name: '', date: '', time: '', place: '', zone: 'Europe/Kyiv', offset: '' };
  zones = Intl.supportedValuesOf('timeZone');
  maxDate = new Date().toISOString().slice(0, 10);
  chart = signal<Chart | null>(null);
  error = signal('');
  busy = signal(false);
  stale = signal(false);
  changed() {
    if (this.chart()) this.stale.set(true);
  }
  async submit() {
    this.error.set('');
    this.busy.set(true);
    this.chart.set(null);
    this.stale.set(false);
    try {
      if (!this.input.place.trim()) throw new Error('Вкажіть населений пункт народження.');
      const birth = { ...this.input };
      const { calculate } = await import('./domain/calculate');
      this.chart.set(calculate(birth));
      this.stale.set(JSON.stringify(birth) !== JSON.stringify(this.input));
    } catch (e) {
      this.error.set(
        e instanceof Error
          ? e.message
          : 'Не вдалося виконати розрахунок. Перевірте дані та з’єднання й спробуйте знову.',
      );
    } finally {
      this.busy.set(false);
    }
  }
  clear() {
    this.chart.set(null);
    this.error.set('');
    this.stale.set(false);
    this.input = { name: '', date: '', time: '', place: '', zone: 'Europe/Kyiv', offset: '' };
  }
}
