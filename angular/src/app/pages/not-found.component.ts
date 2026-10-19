import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ standalone: true, imports: [RouterLink], changeDetection: ChangeDetectionStrategy.OnPush, template: `<p class="eyebrow">404</p><h1>Сторінку не знайдено</h1><p>Оберіть один із каталогів.</p><a routerLink="/angelology">Ангелогія →</a><br><a routerLink="/demonology">Демонологія →</a>` })
export default class NotFoundComponent {}
