import { Injectable } from '@angular/core';
import {SettingsService} from "../settings/settings.service";
import {ScreenOrientationType} from "../../enums/screen-orientation-type";
import { ScreenOrientation, OrientationType } from '@capawesome/capacitor-screen-orientation';
import {DiagnosticService} from "../diagnostic/diagnostic.service";


/** 屏幕方向服务，控制设备的屏幕旋转锁定 */
@Injectable({
  providedIn: 'root'
})
export class ScreenOrientationService {

  constructor(private settingsService: SettingsService,
              private diagnosticService: DiagnosticService) { }

  /**
   * 根据设置更新屏幕方向锁定
   * 仅在原生移动平台（非 Android Oreo）上生效
   * Android Oreo 不支持屏幕方向锁定
   */
  public async updateScreenOrientation() {
    // Web 平台不支持屏幕方向锁定
    if (!this.diagnosticService.isiOSorAndroid()) {
      return;
    }

    // Android Oreo 不支持屏幕方向锁定
    if (await this.diagnosticService.isAndroidOreo()) {
      return;
    }

    let screenOrientation = await this.settingsService.getScreenOrientation();
    try {
      switch (screenOrientation) {
        case ScreenOrientationType.Auto:
          await ScreenOrientation.unlock();
          break;
        case ScreenOrientationType.Landscape:
          await ScreenOrientation.lock({ type: OrientationType.LANDSCAPE_PRIMARY });
          break;
        case ScreenOrientationType.LandscapeAlt:
          await ScreenOrientation.lock({ type: OrientationType.LANDSCAPE_SECONDARY });
          break;
        case ScreenOrientationType.Portrait:
          await ScreenOrientation.lock({ type: OrientationType.PORTRAIT_PRIMARY });
          break;
        case ScreenOrientationType.PortraitAlt:
          await ScreenOrientation.lock({ type: OrientationType.PORTRAIT_SECONDARY });
          break;
      }
    } catch {
      console.log("Screen orientation lock not available")
    }
  }
}
import { Injectable } from '@angular/core';
import {SettingsService} from "../settings/settings.service";
import {ScreenOrientationType} from "../../enums/screen-orientation-type";
import { ScreenOrientation, OrientationType } from '@capawesome/capacitor-screen-orientation';
import {DiagnosticService} from "../diagnostic/diagnostic.service";


@Injectable({
  providedIn: 'root'
})
export class ScreenOrientationService {

  constructor(private settingsService: SettingsService,
              private diagnosticService: DiagnosticService) { }

  public async updateScreenOrientation() {
    if (!this.diagnosticService.isiOSorAndroid()) {
      return;
    }

    if (await this.diagnosticService.isAndroidOreo()) {
      return;
    }

    let screenOrientation = await this.settingsService.getScreenOrientation();
    try {
      switch (screenOrientation) {
        case ScreenOrientationType.Auto:
          await ScreenOrientation.unlock();
          break;
        case ScreenOrientationType.Landscape:
          await ScreenOrientation.lock({ type: OrientationType.LANDSCAPE_PRIMARY });
          break;
        case ScreenOrientationType.LandscapeAlt:
          await ScreenOrientation.lock({ type: OrientationType.LANDSCAPE_SECONDARY });
          break;
        case ScreenOrientationType.Portrait:
          await ScreenOrientation.lock({ type: OrientationType.PORTRAIT_PRIMARY });
          break;
        case ScreenOrientationType.PortraitAlt:
          await ScreenOrientation.lock({ type: OrientationType.PORTRAIT_SECONDARY });
          break;
      }
    } catch {
      console.log("Screen orientation lock not available")
    }
  }
}
