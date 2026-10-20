import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Source } from '../../data/catalog.models';
@Component({
  selector: 'mg-sources',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './source-list.component.html',
  styleUrl: './source-list.component.css',
})
export class SourceListComponent {
  readonly sources = input.required<Source[]>();
}
