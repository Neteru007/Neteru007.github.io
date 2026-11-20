import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as Astronomy from 'astronomy-engine';
import SunCalc from 'suncalc';

type Planet = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn';
interface Location { name: string; lat: number; lon: number; timezone: string }
interface Position { planet: Planet; longitude: number; sign: string; degree: number; retrograde: boolean }
interface Hour { planet: Planet; start: Date; end: Date; active: boolean; night: boolean }

const PLANETS: Planet[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
const CHALDEAN: Planet[] = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const WEEKDAY: Planet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const SIGNS = ['Овен', 'Телець', 'Близнюки', 'Рак', 'Лев', 'Діва', 'Терези', 'Скорпіон', 'Стрілець', 'Козоріг', 'Водолій', 'Риби'];
const LABELS: Record<Planet, string> = { Sun: 'Сонце', Moon: 'Місяць', Mercury: 'Меркурій', Venus: 'Венера', Mars: 'Марс', Jupiter: 'Юпітер', Saturn: 'Сатурн' };
const ASPECTS = [{ name: 'З’єднання', angle: 0, orb: 6 }, { name: 'Секстиль', angle: 60, orb: 4 }, { name: 'Квадрат', angle: 90, orb: 6 }, { name: 'Трин', angle: 120, orb: 6 }, { name: 'Опозиція', angle: 180, orb: 6 }];
const wrap = (x: number) => (x % 360 + 360) % 360;

@Component({
  selector: 'mg-planetary-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="planetary-calculator">
      <h1>✦ Планетарний калькулятор</h1>
      <p>Планетарні години, положення планет і аспекти за вибраною локацією.</p>
      <div class="panel controls">
        <label>Місто <input [(ngModel)]="city" placeholder="Київ" /></label>
        <label>Режим <select [(ngModel)]="live"><option [ngValue]="true">Зараз</option><option [ngValue]="false">Обрана дата</option></select></label>
        <label *ngIf="!live">Дата і час <input type="datetime-local" [(ngModel)]="localDateTime" /></label>
        <button type="button" (click)="calculate()">Розрахувати</button>
      </div>
      <p *ngIf="error" role="alert" class="error">{{ error }}</p>
      <p *ngIf="loading" role="status">Розрахунок…</p>
      <ng-container *ngIf="!error && !loading && location">
        <p>{{ location.name }} · {{ location.timezone }}</p>
        <div class="summary">
          <div class="panel"><h2>Планетарна година</h2><strong>{{ label(currentHour?.planet) }}</strong><p *ngIf="currentHour">{{ format(currentHour.start) }} — {{ format(currentHour.end) }}</p></div>
          <div class="panel"><h2>Планетарний день</h2><strong>{{ label(dayRuler) }}</strong></div>
          <div class="panel"><h2>Сонце у знаку</h2><strong>{{ positions[0]?.sign }}</strong></div>
        </div>
        <div class="panel"><h2>Положення планет</h2>
          <table><thead><tr><th>Планета</th><th>Знак</th><th>Градус</th><th>Рух</th></tr></thead>
          <tbody><tr *ngFor="let p of positions"><td>{{ label(p.planet) }}</td><td>{{ p.sign }}</td><td>{{ p.degree | number:'1.2-2' }}°</td><td>{{ p.retrograde ? 'Ретроградний' : 'Прямий' }}</td></tr></tbody></table>
        </div>
        <div class="panel"><h2>Аспекти</h2>
          <p *ngFor="let a of aspects">{{ label(a.first) }} — {{ a.name }} — {{ label(a.second) }} (орбіс {{ a.orb | number:'1.2-2' }}°)</p>
          <p *ngIf="!aspects.length">Основних аспектів у межах заданих орбісів немає.</p>
        </div>
        <div class="panel"><h2>24 планетарні години</h2>
          <div class="hours"><div *ngFor="let h of hours; let i = index" [class.active]="h.active">{{ i + 1 }}. {{ label(h.planet) }}<small>{{ format(h.start) }} – {{ format(h.end) }}</small></div></div>
        </div>
        <p class="disclaimer">Астрономічні положення розраховано за Astronomy Engine; час сходу й заходу — SunCalc. Астрологічні інтерпретації є частиною езотеричних традицій.</p>
      </ng-container>
    </section>
  `,
  styles: [`
    .planetary-calculator{max-width:1100px;margin:auto;padding:24px;color:#39283b}
    .panel{background:#fff;border:1px solid #eed5e5;border-radius:16px;padding:18px;margin:12px 0}
    .controls,.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}
    label{display:flex;flex-direction:column;gap:8px;font-weight:600}
    input,select,button{font:inherit;padding:10px;border-radius:9px;border:1px solid #dcb9cf}
    button{background:#aa3278;color:white;cursor:pointer}
    table{width:100%;border-collapse:collapse}td,th{padding:9px;border-bottom:1px solid #f0e0e9;text-align:left}
    .hours{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:8px}
    .hours>div{padding:10px;border:1px solid #eed5e5;border-radius:10px}
    .hours .active{background:#f9d8ec;border-color:#b43c83;font-weight:700}
    small{display:block;margin-top:4px}.error{color:#a51b43}.disclaimer{font-size:.9rem;color:#756579}
  `]
})
export class PlanetaryCalculatorComponent implements OnInit, OnDestroy {
  city = 'Київ';
  live = true;
  localDateTime = '';
  location?: Location;
  positions: Position[] = [];
  hours: Hour[] = [];
  aspects: { first: Planet; second: Planet; name: string; orb: number }[] = [];
  currentHour?: Hour;
  dayRuler?: Planet;
  error = '';
  loading = false;
  private interval?: ReturnType<typeof setInterval>;
  private readonly presets: Record<string, Location> = {
    'Київ': { name: 'Київ', lat: 50.4501, lon: 30.5234, timezone: 'Europe/Kyiv' },
    'Львів': { name: 'Львів', lat: 49.8397, lon: 24.0297, timezone: 'Europe/Kyiv' }
  };

  ngOnInit(): void { void this.calculate(); this.interval = setInterval(() => { if (this.live) void this.calculate(); }, 60000); }
  ngOnDestroy(): void { if (this.interval) clearInterval(this.interval); }
  label(planet?: Planet): string { return planet ? LABELS[planet] : '—'; }
  format(date: Date): string {
    return new Intl.DateTimeFormat('uk-UA', { timeZone: this.location?.timezone || 'Europe/Kyiv', hour: '2-digit', minute: '2-digit' }).format(date);
  }
  private parts(date: Date, timezone: string): Record<string, string> {
    return Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(date).map(p => [p.type, p.value]));
  }
  private fromLocal(value: string, timezone: string): Date {
    const target = new Date(value + ':00Z').getTime();
    let guess = target;
    for (let i = 0; i < 4; i++) {
      const p = this.parts(new Date(guess), timezone);
      const displayed = Date.UTC(+p['year'], +p['month'] - 1, +p['day'], +p['hour'], +p['minute']);
      guess += target - displayed;
    }
    return new Date(guess);
  }
  private longitude(planet: Planet, date: Date): number {
    return wrap(Astronomy.Ecliptic(Astronomy.GeoVector(planet, date, true)).elon);
  }
  private async resolveLocation(): Promise<Location> {
    const city = this.city.trim();
    if (!city) throw new Error('Вкажіть місто.');
    if (this.presets[city]) return this.presets[city];
    const response = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(city) + '&count=1&language=uk&format=json');
    if (!response.ok) throw new Error('Не вдалося отримати координати.');
    const json = await response.json();
    const match = json.results?.[0];
    if (!match?.timezone) throw new Error('Місто не знайдено.');
    return { name: match.name, lat: match.latitude, lon: match.longitude, timezone: match.timezone };
  }
  async calculate(): Promise<void> {
    this.loading = true; this.error = '';
    try {
      const location = await this.resolveLocation();
      this.location = location;
      const date = this.live ? new Date() : this.fromLocal(this.localDateTime, location.timezone);
      if (Number.isNaN(date.getTime())) throw new Error('Оберіть коректну дату й час.');
      const local = this.parts(date, location.timezone);
      if (this.live) this.localDateTime = `${local['year']}-${local['month']}-${local['day']}T${local['hour']}:${local['minute']}`;
      this.positions = PLANETS.map(planet => {
        const longitude = this.longitude(planet, date);
        const later = this.longitude(planet, new Date(date.getTime() + 6 * 3600000));
        const delta = ((later - longitude + 540) % 360) - 180;
        return { planet, longitude, sign: SIGNS[Math.floor(longitude / 30)], degree: longitude % 30, retrograde: planet !== 'Sun' && planet !== 'Moon' && delta < -0.00001 };
      });
      this.aspects = [];
      for (let i = 0; i < this.positions.length; i++) for (let j = i + 1; j < this.positions.length; j++) {
        const first = this.positions[i], second = this.positions[j];
        const difference = Math.abs(first.longitude - second.longitude);
        const separation = Math.min(difference, 360 - difference);
        for (const aspect of ASPECTS) if (Math.abs(separation - aspect.angle) <= aspect.orb) {
          this.aspects.push({ first: first.planet, second: second.planet, name: aspect.name, orb: Math.abs(separation - aspect.angle) });
        }
      }
      this.aspects.sort((a, b) => a.orb - b.orb);
      const noon = this.fromLocal(`${local['year']}-${local['month']}-${local['day']}T12:00`, location.timezone);
      const today = SunCalc.getTimes(noon, location.lat, location.lon);
      const previous = SunCalc.getTimes(new Date(noon.getTime() - 86400000), location.lat, location.lon);
      const next = SunCalc.getTimes(new Date(noon.getTime() + 86400000), location.lat, location.lon);
      if (![today.sunrise, today.sunset, previous.sunset, next.sunrise].every(d => Number.isFinite(d.getTime()))) throw new Error('Немає сходу або заходу Сонця для вибраної дати.');
      const weekday = new Date(Date.UTC(+local['year'], +local['month'] - 1, +local['day'])).getUTCDay();
      const previousWeekday = (weekday + 6) % 7;
      const dayRuler = WEEKDAY[weekday];
      const previousRuler = WEEKDAY[previousWeekday];
      const segments = [
        { start: previous.sunset, end: today.sunrise, ruler: previousRuler, night: true },
        { start: today.sunrise, end: today.sunset, ruler: dayRuler, night: false },
        { start: today.sunset, end: next.sunrise, ruler: dayRuler, night: true }
      ];
      const makeHours = (start: Date, end: Date, ruler: Planet, night: boolean): Hour[] => {
        const duration = (end.getTime() - start.getTime()) / 12;
        const firstIndex = (CHALDEAN.indexOf(ruler) + (night ? 12 : 0)) % 7;
        return Array.from({ length: 12 }, (_, i) => {
          const from = new Date(start.getTime() + duration * i);
          const to = new Date(start.getTime() + duration * (i + 1));
          return { planet: CHALDEAN[(firstIndex + i) % 7], start: from, end: to, active: date >= from && date < to, night };
        });
      };
      const todayHours = [...makeHours(today.sunrise, today.sunset, dayRuler, false), ...makeHours(today.sunset, next.sunrise, dayRuler, true)];
      const previousNight = makeHours(previous.sunset, today.sunrise, previousRuler, true);
      this.hours = date < today.sunrise ? [...previousNight, ...todayHours.slice(0, 12)] : todayHours;
      this.currentHour = [...previousNight, ...todayHours].find(h => h.active);
      this.dayRuler = date < today.sunrise ? previousRuler : dayRuler;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Помилка розрахунку.';
    } finally { this.loading = false; }
  }
}
