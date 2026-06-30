import { Injectable } from '@angular/core';
import {Platform} from "@ionic/angular";

/** 当前平台检测服务，判断应用运行在移动端还是浏览器环境 */
@Injectable({
  providedIn: 'root'
})
export class CurrentPlatformService {
  /** 当前平台标识：'mobile' 或 'browser' */
  private _currentPlatform: any;

  constructor(private platform: Platform) {
    this.setCurrentPlatform();
  }

  /**
   * 检测是否为原生移动平台
   * @returns 是否为原生移动平台
   */
  isNative() {
    return this._currentPlatform === 'native';
  }

  /**
   * 检测是否为浏览器平台
   * @returns 是否为浏览器平台
   */
  isBrowser() {
    return this._currentPlatform === 'browser';
  }

  /**
   * 根据 Ionic Platform 检测结果设置当前平台
   * iOS 或 Android 且非桌面/移动网页端判定为移动平台
   */
  private setCurrentPlatform() {
    if (
      this.platform.is('ios') || this.platform.is('android')
      && !( this.platform.is('desktop') || this.platform.is('mobileweb'))) {
      this._currentPlatform = 'mobile';
    } else {
      this._currentPlatform = 'browser';
    }
  }
}
