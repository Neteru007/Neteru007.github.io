import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface BirthDetails {
  date: string;
  time: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
}

@Component({
  selector: 'mg-natal-chart',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './natal-chart.component.html',
  styleUrl: './natal-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NatalChartComponent {
  input: BirthDetails = {
    date: '',
    time: '',
    timezone: 'Europe/Kyiv',
    latitude: null,
    longitude: null,
  };
  readonly error = signal('');
  readonly ready = signal(false);
  readonly zones = Intl.supportedValuesOf('timeZone');

  validate(): void {
    this.ready.set(false);
    this.error.set('');
    const { date, time, timezone, latitude, longitude } = this.input;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      this.error.set('Вкажіть дату та точний час народження.');
      return;
    }
    if (!this.zones.includes(timezone) && timezone !== 'UTC') {
      this.error.set('Оберіть коректний часовий пояс IANA.');
      return;
    }
    if (latitude === null || longitude === null ||
      !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      this.error.set('Вкажіть широту від −90 до 90 і довготу від −180 до 180.');
      return;
    }
    this.ready.set(true);
  }
}
