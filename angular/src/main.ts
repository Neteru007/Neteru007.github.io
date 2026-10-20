import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { prepareLocation } from './app/core/routing/prepare-location';
async function start() {
  await prepareLocation();
  await bootstrapApplication(AppComponent, {
    providers: [
      provideHttpClient(),
      provideRouter(
        routes,
        withHashLocation(),
        withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      ),
    ],
  });
}
void start().catch((error) => {
  console.error('Application bootstrap failed', error);
  const host = document.querySelector('mg-root');
  if (host) host.textContent = 'Не вдалося завантажити сайт. Оновіть сторінку.';
});
