import { Injectable } from '@angular/core';
import {SettingsService} from "../settings/settings.service";
import {AppearanceType} from "../../enums/appearance-type";

/** 主题服务，管理应用的明暗主题切换 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor(private settingsService: SettingsService) { }

  /** 系统深色模式媒体查询对象 */
  mediaQuery = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");

  /**
   * 根据设置更新应用主题
   * 支持跟随系统、强制深色、强制浅色三种模式
   */
  async updateTheme() {
    this.unregisterListener();
    let appearance = await this.settingsService.getAppearance();
    switch (appearance) {
      case AppearanceType.System:
        // 跟随系统：检测当前系统深色模式状态并应用
        const darkModeOn =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        document.body.classList.toggle("dark", darkModeOn);
        this.registerListener();
        break;
      case AppearanceType.Dark:
        document.body.classList.toggle("dark", true);
        break;
      case AppearanceType.Light:
        document.body.classList.toggle("dark", false);
        break;
    }
  }

  /** 注册系统深色模式变化监听器 */
  private registerListener() {
    this.mediaQuery?.addEventListener("change", this.handleThemeChanged);
  }

  /** 取消系统深色模式变化监听器 */
  private unregisterListener() {
    this.mediaQuery?.removeEventListener("change", this.handleThemeChanged);
  }

  /**
   * 系统深色模式变化时的回调处理
   * @param event 媒体查询变化事件
   */
  private handleThemeChanged(event: MediaQueryListEvent) {
    document.body.classList.toggle("dark", event.matches);
  }
}
