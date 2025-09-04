import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// Ensure global Sortable is available for libraries expecting window.Sortable
import Sortable from 'sortablejs';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Sortable = (window as any).Sortable || Sortable;

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
