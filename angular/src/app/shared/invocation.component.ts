import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CatalogEntry } from '../core/models';
@Component({ selector: 'mg-invocation', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: `<section class="content-section invocation"><p class="eyebrow">ТЕКСТ ЗВЕРНЕННЯ / ДЖЕРЕЛО</p><h2>{{ value().label }}</h2><blockquote [attr.lang]="kind() === 'angels' ? 'la' : 'und'">{{ value().text }}</blockquote><button type="button" (click)="copy()">Скопіювати текст</button><span role="status" class="copy-status">{{ status() }}</span><p class="small">{{ value().note }}</p><a [href]="value().source.url" target="_blank" rel="noopener noreferrer">{{ value().source.title }} ↗</a></section>` })
export class InvocationComponent {
  readonly value = input.required<CatalogEntry['invocation']>(); readonly kind = input.required<string>(); readonly status = signal('');
  async copy(): Promise<void> { try { await navigator.clipboard.writeText(this.value().text); this.status.set('Текст скопійовано'); } catch { this.status.set('Виділіть текст і скопіюйте його вручну.'); } }
}
