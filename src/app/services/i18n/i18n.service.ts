import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../settings/settings.service';
import { LanguageType } from '../../enums/language-type';

/** 支持的语言代码 */
const SUPPORTED_LANGS = ['en', 'zh'] as const;
const DEFAULT_LANG = 'en';

/** 国际化服务，管理应用语言的初始化、切换与持久化 */
@Injectable({
  providedIn: 'root'
})
export class I18nService {

  constructor(private translate: TranslateService,
              private settingsService: SettingsService) { }

  /**
   * 启动初始化：设置可用语言与回退语言，并应用用户已保存的语言设置
   * 需在应用启动早期调用（AppComponent.ngOnInit）
   */
  async init() {
    this.translate.addLangs([...SUPPORTED_LANGS]);
    this.translate.setFallbackLang(DEFAULT_LANG);
    const langType = await this.settingsService.getLanguage();
    await this.applyLanguage(langType);
  }

  /**
   * 切换语言并持久化
   * @param languageType 语言类型（System/English/Chinese）
   */
  async setLanguage(languageType: LanguageType) {
    await this.settingsService.setLanguage(languageType);
    await this.applyLanguage(languageType);
  }

  /**
   * 获取当前已保存的语言设置
   * @returns 语言类型
   */
  async getLanguage(): Promise<LanguageType> {
    return await this.settingsService.getLanguage();
  }

  /**
   * 根据语言类型应用实际语言代码
   * System 时按浏览器/系统语言探测（命中中文用 zh，否则 en）
   * @param languageType 语言类型
   */
  private async applyLanguage(languageType: LanguageType) {
    let lang: string;
    switch (languageType) {
      case LanguageType.Chinese:
        lang = 'zh';
        break;
      case LanguageType.English:
        lang = 'en';
        break;
      case LanguageType.System:
      default:
        lang = this.detectSystemLang();
        break;
    }
    this.translate.use(lang);
  }

  /**
   * 探测系统/浏览器语言
   * @returns 'zh'（中文环境）或 'en'（其他）
   */
  private detectSystemLang(): string {
    const navLang = (navigator.language || '').toLowerCase();
    return navLang.startsWith('zh') ? 'zh' : 'en';
  }
}
