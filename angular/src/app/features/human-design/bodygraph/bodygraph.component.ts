import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CENTER_INFO, CHANNELS } from '../data/channels';
import { Center, Chart } from '../domain/models';
@Component({
  selector: 'mg-bodygraph',
  templateUrl: './bodygraph.component.html',
  styleUrl: './bodygraph.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BodygraphComponent {
  chart = input.required<Chart>();
  centers = Object.entries(CENTER_INFO).map(([id, info]) => ({ id: id as Center, ...info }));
  paths = computed(() =>
    CHANNELS.map((channel, index) => {
      const [a, b] = channel.centers.map((c) => CENTER_INFO[c]);
      const siblings = CHANNELS.filter(
        (c) => c.centers.includes(channel.centers[0]) && c.centers.includes(channel.centers[1]),
      );
      const rank = siblings.indexOf(channel) - (siblings.length - 1) / 2;
      const dx = b.x - a.x,
        dy = b.y - a.y,
        length = Math.hypot(dx, dy);
      const mx = (a.x + b.x) / 2 - (dy / length) * rank * 21,
        my = (a.y + b.y) / 2 + (dx / length) * rank * 21;
      const color = (gate: number) => {
        const p = this.chart().personality.some((a) => a.gate === gate),
          d = this.chart().design.some((a) => a.gate === gate);
        return p && d ? 'both' : p ? 'personality' : d ? 'design' : 'inactive';
      };
      return {
        id: index,
        label: `${channel.gates.join('–')} · ${channel.name}`,
        first: `M${a.x},${a.y} L${mx},${my}`,
        second: `M${mx},${my} L${b.x},${b.y}`,
        a: color(channel.gates[0]),
        b: color(channel.gates[1]),
      };
    }),
  );
}
