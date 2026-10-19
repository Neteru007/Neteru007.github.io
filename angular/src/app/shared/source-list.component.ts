import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Source } from '../core/models';
@Component({ selector: 'mg-sources', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: `<aside class="source-list"><h2>Джерела</h2><ul>@for (source of sources(); track source.url) { <li><a [href]="source.url" target="_blank" rel="noopener noreferrer">{{ source.title }} ↗</a></li> }</ul><p class="small">Українські імена наведено в транслітерації. Написання, іконографія й відповідності можуть відрізнятися між виданнями.</p></aside>` })
export class SourceListComponent { readonly sources = input.required<Source[]>(); }
