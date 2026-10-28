import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { surroundings } from '../domain/connections';
import { Chart } from '../domain/models';
import { CENTER_INFO, CHANNELS } from '../data/channels';
import { GATES } from '../data/gates';
import { TYPES, AUTHORITIES, LINES, PROFILES, DEFINITIONS } from '../data/interpretations';
import BodygraphComponent from '../bodygraph/bodygraph.component';
@Component({
  selector: 'mg-design-report',
  imports: [MatButtonModule, DatePipe, DecimalPipe, BodygraphComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReportComponent {
  chart = input.required<Chart>();
  types = TYPES;
  authorities = AUTHORITIES;
  lines = LINES;
  profiles = PROFILES;
  definitions = DEFINITIONS;
  gateInfo = GATES;
  centerInfo = CENTER_INFO;
  centers = Object.entries(CENTER_INFO).map(([id, info]) => ({ id, ...info }));
  surroundings = computed(() => surroundings(this.chart().gates, this.chart().groups));
  profile = computed(() => this.chart().profile.split('/').map(Number));
  centerDefined(id: string) {
    return this.chart().centers.some((c) => c === id);
  }
  centerStatus(id: string) {
    if (this.centerDefined(id)) return 'Визначений';
    const activated = CHANNELS.some((c) =>
      c.centers.some((center, i) => center === id && this.chart().gates.includes(c.gates[i])),
    );
    return activated ? 'Невизначений · з активаціями' : 'Повністю відкритий';
  }
  sourceOf(gate: number) {
    const p = this.chart().personality.some((a) => a.gate === gate),
      d = this.chart().design.some((a) => a.gate === gate);
    return p && d ? 'Особистість + Дизайн' : p ? 'Особистість' : 'Дизайн';
  }
  isHanging(gate: number) {
    return !this.chart().channels.some((c) => c.gates.includes(gate));
  }
  print() {
    window.print();
  }
}
