import {NgModule, isDevMode} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {IonicModule} from '@ionic/angular';

import {AppComponent} from './app.component';
import {FormsModule} from "@angular/forms";
import {IonicStorageModule} from "@ionic/storage-angular";
import {WidgetContentComponentsModule} from "./widget-content-components/widget-content-components.module";
import {ServiceWorkerModule} from '@angular/service-worker';
import {SettingsModalComponent} from "./pages/shared/modals/settings-modal/settings-modal.component";
import {HttpClientModule} from "@angular/common/http";
import {WebHomePageModule} from "./pages/web-home/web-home.module";
import {HomePageModule} from "./pages/home/home.module";
import {DeckPageModule} from "./pages/deck/deck.module";
import {ConnectionLostPageModule} from "./pages/connection-lost/connection-lost.module";

/** 应用根模块，配置所有导入的模块、组件和服务 */
@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot({ swipeBackEnabled: false }),  // 禁用 iOS 滑动返回手势
        IonicStorageModule.forRoot(),
        FormsModule,
        WidgetContentComponentsModule,
        WebHomePageModule,
        HomePageModule,
        DeckPageModule,
        ConnectionLostPageModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: !isDevMode(),
            // 应用稳定后或 30 秒后注册 Service Worker（以先到者为准）
            registrationStrategy: 'registerWhenStable:30000'
        }),
        AppComponent,
        SettingsModalComponent
    ],
    providers: [],
    bootstrap: [AppComponent],  // 以 AppComponent 作为启动组件
})
export class AppModule {
}
