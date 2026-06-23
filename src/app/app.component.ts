import {AfterViewInit, Component, EventEmitter, OnInit} from '@angular/core';
import {Storage} from "@ionic/storage";
import {WakelockService} from "./services/wakelock/wakelock.service";
import {ScreenOrientationService} from "./services/screen-orientation/screen-orientation.service";
import {SslHandler} from "../../capacitor_plugins/sslhandler/src";
import {SettingsService} from "./services/settings/settings.service";
import {DiagnosticService} from "./services/diagnostic/diagnostic.service";
import {ThemeService} from "./services/theme/theme.service";
import {HomePage} from "./pages/home/home.page";
import {environment} from "../environments/environment";
import {WebHomePage} from "./pages/web-home/web-home.page";
import {App, URLOpenListenerEvent} from "@capacitor/app";
import {QuickSetupQrCodeData} from "./datatypes/quick-setup-qr-code-data";
import {QrCodeScannerComponent} from "./pages/home/modals/add-connection/qr-code-scanner/qr-code-scanner.component";
import {IonicModule} from "@ionic/angular";

/** 应用根组件，负责初始化各项服务并监听深度链接 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    IonicModule
  ]
})
export class AppComponent implements OnInit {
  /** 快速设置链接扫描事件，当通过深度链接接收快速设置数据时触发 */
  public static quickSetupLinkScanned: EventEmitter<QuickSetupQrCodeData> = new EventEmitter();

  constructor(private storage: Storage,
              private wakeLockService: WakelockService,
              private screenOrientationService: ScreenOrientationService,
              private settingsService: SettingsService,
              private diagnosticService: DiagnosticService,
              private themeService: ThemeService) {
  }

  /** 根页面组件，Web 版本使用 WebHomePage，原生版本使用 HomePage */
  rootComponent = environment.webVersion ? WebHomePage : HomePage;

  /**
   * 应用初始化回调
   * 初始化本地存储、屏幕方向、屏幕常亮、主题设置
   * 并在 Android 平台上配置 SSL 证书验证跳过
   */
  async ngOnInit() {
    await this.storage.create();
    await this.screenOrientationService.updateScreenOrientation();
    await this.wakeLockService.updateWakeLock();
    await this.themeService.updateTheme();

    // Android 平台根据用户设置跳过 SSL 证书验证
    if (this.diagnosticService.isAndroid()) {
      let skipSslValidation = await this.settingsService.getSkipSslValidation();
      SslHandler.skipValidation({value: skipSslValidation});
    }

    // 监听深度链接事件，解析快速设置二维码数据
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      const dataBase64 = event.url.split("quick-setup/").pop();
      if (dataBase64) {
        const dataJson = atob(dataBase64);
        const data = JSON.parse(dataJson) as QuickSetupQrCodeData;
        AppComponent.quickSetupLinkScanned.emit(data);
      }
    });
  }
}
import {AfterViewInit, Component, EventEmitter, OnInit} from '@angular/core';
import {Storage} from "@ionic/storage";
import {WakelockService} from "./services/wakelock/wakelock.service";
import {ScreenOrientationService} from "./services/screen-orientation/screen-orientation.service";
import {SslHandler} from "../../capacitor_plugins/sslhandler/src";
import {SettingsService} from "./services/settings/settings.service";
import {DiagnosticService} from "./services/diagnostic/diagnostic.service";
import {ThemeService} from "./services/theme/theme.service";
import {HomePage} from "./pages/home/home.page";
import {environment} from "../environments/environment";
import {WebHomePage} from "./pages/web-home/web-home.page";
import {App, URLOpenListenerEvent} from "@capacitor/app";
import {QuickSetupQrCodeData} from "./datatypes/quick-setup-qr-code-data";
import {QrCodeScannerComponent} from "./pages/home/modals/add-connection/qr-code-scanner/qr-code-scanner.component";
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    IonicModule
  ]
})
export class AppComponent implements OnInit {
  public static quickSetupLinkScanned: EventEmitter<QuickSetupQrCodeData> = new EventEmitter();

  constructor(private storage: Storage,
              private wakeLockService: WakelockService,
              private screenOrientationService: ScreenOrientationService,
              private settingsService: SettingsService,
              private diagnosticService: DiagnosticService,
              private themeService: ThemeService) {
  }

  rootComponent = environment.webVersion ? WebHomePage : HomePage;

  async ngOnInit() {
    await this.storage.create();
    await this.screenOrientationService.updateScreenOrientation();
    await this.wakeLockService.updateWakeLock();
    await this.themeService.updateTheme();

    if (this.diagnosticService.isAndroid()) {
      let skipSslValidation = await this.settingsService.getSkipSslValidation();
      SslHandler.skipValidation({value: skipSslValidation});
    }

    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      const dataBase64 = event.url.split("quick-setup/").pop();
      if (dataBase64) {
        const dataJson = atob(dataBase64);
        const data = JSON.parse(dataJson) as QuickSetupQrCodeData;
        AppComponent.quickSetupLinkScanned.emit(data);
      }
    });
  }
}
