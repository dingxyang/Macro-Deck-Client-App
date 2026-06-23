import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {Widget} from "../../datatypes/widgets/widget";
import {ButtonWidget} from "../../datatypes/widgets/button-widget";
import {WidgetGridComponent} from "../../pages/deck/widget-grid/widget-grid.component";
import {MacroDeckService} from "../../services/macro-deck/macro-deck.service";
import {WidgetInteractionType} from "../../enums/widget-interaction-type";
import {DomSanitizer} from '@angular/platform-browser';
import {SettingsService} from "../../services/settings/settings.service";
import {ButtonWidgetBorderStyle} from "./button-widget-border-style";
import {Subscription} from "rxjs";
import {SettingsModalComponent} from "../../pages/shared/modals/settings-modal/settings-modal.component";
import { NgStyle } from "@angular/common";

/** 按钮微件组件，渲染按钮图标、标签和背景，处理按下/长按等交互事件 */
@Component({
  selector: 'app-button-widget',
  templateUrl: './button-widget.component.html',
  styleUrls: ['./button-widget.component.scss'],
  imports: [
    NgStyle
  ]
})
export class ButtonWidgetComponent implements OnInit, OnDestroy {
  protected readonly widgetGridComponent = WidgetGridComponent;

  /** 前景图片（标签 Base64 解码后的安全 URL） */
  foregroundImage: any;
  /** 图标图片（Base64 解码后的安全 URL） */
  iconImage: any;
  /** 背景样式对象 */
  backgroundStyle: any;
  /** 边框颜色（基于背景色调暗） */
  borderColor: string | undefined;
  /** 当前微件数据 */
  widget: Widget | undefined;
  /** 边框样式对象 */
  borderStyle: any;

  /** 是否触发了长按 */
  private longPressTrigger: boolean = false;
  /** 长按超时定时器 */
  private longPressTimeout: any;
  /** 按钮是否处于按下状态 */
  private pressed: boolean = false;

  /** 事件订阅集合 */
  private subscription: Subscription = new Subscription();

  constructor(private renderer: Renderer2,
              private macroDeckService: MacroDeckService,
              private sanitizer: DomSanitizer,
              private settingsService: SettingsService) {
  }

  /**
   * 组件初始化回调
   * 订阅网格更新和设置变更事件，重新渲染按钮
   */
  ngOnInit(): void {
    this.subscription.add(this.widgetGridComponent.updated.subscribe(async _ => {
      await this.updateSelf();
    }));

    this.subscription.add(SettingsModalComponent.settingsApplied.subscribe(async _ => {
      await this.updateSelf();
    }));
  }

  /** 组件销毁时取消订阅 */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /** 使用当前微件数据更新自身 */
  async updateSelf() {
    if (this.widget === undefined) {
      return;
    }

    await this.updateWidget(this.widget);
  }

  /**
   * 更新微件显示数据
   * 解码 Base64 图标/标签，设置背景色和边框样式
   * @param widget 微件数据
   */
  async updateWidget(widget: Widget) {
    let borderStyle = await this.settingsService.getButtonWidgetBorderStyle();
    this.widget = widget;
    const widgetContent = widget.widgetContent as ButtonWidget;
    // 将 Base64 编码的图片数据转换为安全资源 URL
    this.foregroundImage = widgetContent?.labelBase64
      ? this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + widgetContent?.labelBase64)
      : undefined;
    this.iconImage = widgetContent?.iconBase64
      ? this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + widgetContent?.iconBase64)
      : undefined;
    this.backgroundStyle = {'background-color': widget.backgroundColorHex};
    // 边框颜色基于背景色调暗 40 个单位
    this.borderColor = widget.backgroundColorHex ? this.adjustColor(widget.backgroundColorHex, -40) : undefined;
    this.setBorderStyle(borderStyle);
  }

  /**
   * 设置按钮边框样式
   * @param borderStyle 边框样式枚举值
   */
  private setBorderStyle(borderStyle: ButtonWidgetBorderStyle) {
    switch (borderStyle) {
      case ButtonWidgetBorderStyle.None:
        this.borderStyle = {
          'border-radius': this.widgetGridComponent.borderRadiusPoints + 'pt'
        }
        break;
      case ButtonWidgetBorderStyle.Colored:
        this.borderStyle = {
          'border-radius': this.widgetGridComponent.borderRadiusPoints + 'pt',
          'border': '2pt solid ' + this.borderColor,
          'padding': '2pt'
        }
        break;
    }
  }

  /**
   * 鼠标/触摸释放事件处理
   * 根据是否触发了长按，发送对应的交互事件
   * @param event DOM 事件
   */
  onMouseUp(event: Event) {
    if (!this.pressed) {
      return;
    }

    this.pressed = false;
    this.setClass(event.currentTarget, 'pressed', false);
    this.setClass(event.currentTarget, 'release-transition', true);

    if (this.longPressTrigger) {
      // 长按释放
      if (this.widget === undefined) {
        return;
      }
      this.emitInteraction(WidgetInteractionType.ButtonLongPressRelease);
    } else {
      // 短按释放
      this.emitInteraction(WidgetInteractionType.ButtonShortPressRelease);
    }
    this.longPressTrigger = false;
    clearTimeout(this.longPressTimeout);
  }

  /**
   * 鼠标/触摸离开事件处理
   * 视为释放操作
   * @param event DOM 事件
   */
  async onMouseLeave(event: Event) {
    this.onMouseUp(event);
  }

  /**
   * 鼠标/触摸按下事件处理
   * 添加按下样式，发送按下事件，启动长按计时器
   * @param event DOM 事件
   */
  async onMouseDown(event: Event) {
    this.setClass(event.currentTarget, 'pressed', true);
    this.setClass(event.currentTarget, 'release-transition', false);
    this.emitInteraction(WidgetInteractionType.ButtonPress);
    this.pressed = true;

    let buttonLongPressDelay = await this.settingsService.getButtonLongPressDelay();

    setTimeout(() => {

    });
    // 超过长按延迟后触发长按事件
    this.longPressTimeout = setTimeout(() => {
      this.longPressTrigger = true;
      this.emitInteraction(WidgetInteractionType.ButtonLongPress);
    }, buttonLongPressDelay);
  }

  /**
   * 安全地添加或移除 CSS 类
   * @param target 目标 DOM 元素
   * @param className CSS 类名
   * @param value 是否添加
   */
  setClass(target: any, className: string, value: boolean): void {
    const hasClass = target.classList.contains(className);
    if (value && !hasClass) {
      this.renderer.addClass(target, className);
    } else if (!value && hasClass) {
      this.renderer.removeClass(target, className);
    }
  }

  /**
   * 调整十六进制颜色的明暗度
   * @param color 原始十六进制颜色值（如 #FF5500）
   * @param amount 调整量（正数变亮，负数变暗）
   * @returns 调整后的十六进制颜色值
   */
  adjustColor(color: string, amount: number) {
      return '#' + color.replace(/^#/, '')
          .replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount))
          .toString(16))
          .substr(-2));
  }

  /**
   * 发送微件交互事件
   * @param widgetInteractionType 交互类型
   */
  private emitInteraction(widgetInteractionType: WidgetInteractionType) {
    if (this.widget === undefined) {
      return;
    }
    this.macroDeckService.interaction.emit({
      widget: this.widget,
      widgetInteractionType: widgetInteractionType
    });
  }
}
import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {Widget} from "../../datatypes/widgets/widget";
import {ButtonWidget} from "../../datatypes/widgets/button-widget";
import {WidgetGridComponent} from "../../pages/deck/widget-grid/widget-grid.component";
import {MacroDeckService} from "../../services/macro-deck/macro-deck.service";
import {WidgetInteractionType} from "../../enums/widget-interaction-type";
import {DomSanitizer} from '@angular/platform-browser';
import {SettingsService} from "../../services/settings/settings.service";
import {ButtonWidgetBorderStyle} from "./button-widget-border-style";
import {Subscription} from "rxjs";
import {SettingsModalComponent} from "../../pages/shared/modals/settings-modal/settings-modal.component";
import { NgStyle } from "@angular/common";

@Component({
  selector: 'app-button-widget',
  templateUrl: './button-widget.component.html',
  styleUrls: ['./button-widget.component.scss'],
  imports: [
    NgStyle
]
})
export class ButtonWidgetComponent implements OnInit, OnDestroy {
  protected readonly widgetGridComponent = WidgetGridComponent;

  foregroundImage: any;
  iconImage: any;
  backgroundStyle: any;
  borderColor: string | undefined;
  widget: Widget | undefined;
  borderStyle: any;

  private longPressTrigger: boolean = false;
  private longPressTimeout: any;
  private pressed: boolean = false;

  private subscription: Subscription = new Subscription();

  constructor(private renderer: Renderer2,
              private macroDeckService: MacroDeckService,
              private sanitizer: DomSanitizer,
              private settingsService: SettingsService) {
  }

  ngOnInit(): void {
    this.subscription.add(this.widgetGridComponent.updated.subscribe(async _ => {
      await this.updateSelf();
    }));

    this.subscription.add(SettingsModalComponent.settingsApplied.subscribe(async _ => {
      await this.updateSelf();
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async updateSelf() {
    if (this.widget === undefined) {
      return;
    }

    await this.updateWidget(this.widget);
  }

  async updateWidget(widget: Widget) {
    let borderStyle = await this.settingsService.getButtonWidgetBorderStyle();
    this.widget = widget;
    const widgetContent = widget.widgetContent as ButtonWidget;
    this.foregroundImage = widgetContent?.labelBase64
      ? this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + widgetContent?.labelBase64)
      : undefined;
    this.iconImage = widgetContent?.iconBase64
      ? this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + widgetContent?.iconBase64)
      : undefined;
    this.backgroundStyle = {'background-color': widget.backgroundColorHex};
    this.borderColor = widget.backgroundColorHex ? this.adjustColor(widget.backgroundColorHex, -40) : undefined;
    this.setBorderStyle(borderStyle);
  }

  private setBorderStyle(borderStyle: ButtonWidgetBorderStyle) {
    switch (borderStyle) {
      case ButtonWidgetBorderStyle.None:
        this.borderStyle = {
          'border-radius': this.widgetGridComponent.borderRadiusPoints + 'pt'
        }
        break;
      case ButtonWidgetBorderStyle.Colored:
        this.borderStyle = {
          'border-radius': this.widgetGridComponent.borderRadiusPoints + 'pt',
          'border': '2pt solid ' + this.borderColor,
          'padding': '2pt'
        }
        break;
    }
  }

  onMouseUp(event: Event) {
    if (!this.pressed) {
      return;
    }

    this.pressed = false;
    this.setClass(event.currentTarget, 'pressed', false);
    this.setClass(event.currentTarget, 'release-transition', true);

    if (this.longPressTrigger) {
      if (this.widget === undefined) {
        return;
      }
      this.emitInteraction(WidgetInteractionType.ButtonLongPressRelease);
    } else {
      this.emitInteraction(WidgetInteractionType.ButtonShortPressRelease);
    }
    this.longPressTrigger = false;
    clearTimeout(this.longPressTimeout);
  }

  async onMouseLeave(event: Event) {
    this.onMouseUp(event);
  }

  async onMouseDown(event: Event) {
    this.setClass(event.currentTarget, 'pressed', true);
    this.setClass(event.currentTarget, 'release-transition', false);
    this.emitInteraction(WidgetInteractionType.ButtonPress);
    this.pressed = true;

    let buttonLongPressDelay = await this.settingsService.getButtonLongPressDelay();

    setTimeout(() => {

    });
    this.longPressTimeout = setTimeout(() => {
      this.longPressTrigger = true;
      this.emitInteraction(WidgetInteractionType.ButtonLongPress);
    }, buttonLongPressDelay);
  }

  setClass(target: any, className: string, value: boolean): void {
    const hasClass = target.classList.contains(className);
    if (value && !hasClass) {
      this.renderer.addClass(target, className);
    } else if (!value && hasClass) {
      this.renderer.removeClass(target, className);
    }
  }

  adjustColor(color: string, amount: number) {
      return '#' + color.replace(/^#/, '')
          .replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount))
          .toString(16))
          .substr(-2));
  }

  private emitInteraction(widgetInteractionType: WidgetInteractionType) {
    if (this.widget === undefined) {
      return;
    }
    this.macroDeckService.interaction.emit({
      widget: this.widget,
      widgetInteractionType: widgetInteractionType
    });
  }
}
