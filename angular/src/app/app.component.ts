import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { ChangeDetectionStrategy, Component, DOCUMENT, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'mg-root',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);
  readonly navigating = signal(false);
  readonly routeError = signal(false);
  constructor() {
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.navigating.set(true);
          this.routeError.set(false);
        }
        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        )
          this.navigating.set(false);
        if (event instanceof NavigationError) this.routeError.set(true);
      });
  }
  focusMain(event: Event): void {
    event.preventDefault();
    this.document.getElementById('main-content')?.focus();
  }
  reload(): void {
    this.document.defaultView?.location.reload();
  }
}
