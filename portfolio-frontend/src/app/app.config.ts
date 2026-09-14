import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading, PreloadAllModules, RouteReuseStrategy } from '@angular/router';

import { routes } from './app.routes';
import { CustomRouteReuseStrategy } from './services/custom-route-reuse-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withPreloading(PreloadAllModules)
    ),
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy }
  ]
};
