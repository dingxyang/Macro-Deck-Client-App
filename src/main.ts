import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// 生产环境下启用 Angular 生产模式以获得更好的性能
if (environment.production) {
  enableProdMode();
}

// 引导启动 Angular 应用根模块
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
