import {Injectable} from '@angular/core';
import {SettingsService} from "../settings/settings.service";
import {KeepAwake} from "@capacitor-community/keep-awake";
import NoSleep from 'nosleep.js';

/** 屏幕常亮服务，防止设备在运行 Macro Deck 时自动息屏 */
@Injectable({
  providedIn: 'root'
})
export class WakelockService {

  /** NoSleep.js 后备方案实例，用于不支持原生 WakeLock 的浏览器 */
  private noSleep: NoSleep = new NoSleep();

  constructor(private settingsService: SettingsService) {
  }

  /**
   * 根据设置更新屏幕常亮状态
   * 启用或禁用屏幕常亮功能
   */
  public async updateWakeLock() {
    try {
      if (await this.settingsService.getWakeLockEnabled() === true) {
        await this.enableWakeLock();
      } else {
        await this.disableWakeLock();
      }
    } catch {
      // 浏览器中可能因缺少用户交互而抛出异常，属于预期行为
    }
  }

  /**
   * 启用屏幕常亮
   * 优先使用 Capacitor 原生 WakeLock API，不支持时回退到 NoSleep.js
   */
  private async enableWakeLock() {
    const nativeSupport = await KeepAwake.isSupported();
    if (nativeSupport.isSupported) {
      await KeepAwake.keepAwake();
    } else {
      await this.noSleep.enable();
    }
  }

  /**
   * 禁用屏幕常亮
   * 允许设备正常息屏
   */
  private async disableWakeLock() {
    const nativeSupport = await KeepAwake.isSupported();
    if (nativeSupport.isSupported) {
      await KeepAwake.allowSleep();
    } else {
      this.noSleep.disable();
    }
  }
}
