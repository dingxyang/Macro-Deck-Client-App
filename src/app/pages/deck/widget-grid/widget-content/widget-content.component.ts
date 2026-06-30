import {Component, ComponentRef, Input, OnDestroy, ViewChild, ViewContainerRef} from '@angular/core';
import {Widget} from "../../../../datatypes/widgets/widget";
import {WidgetContentType} from "../../../../enums/widget-content-type";
import {ButtonWidgetComponent} from "../../../../widget-content-components/button-widget/button-widget.component";
import {MacroDeckService} from "../../../../services/macro-deck/macro-deck.service";
import {WidgetInteractionType} from "../../../../enums/widget-interaction-type";
import {Subscription} from "rxjs";
import {EmptyWidgetComponent} from "../../../../widget-content-components/empty-widget/empty-widget.component";

/** 微件内容组件，根据微件类型动态创建和渲染对应的内容组件 */
@Component({
  selector: 'app-widget-content',
  templateUrl: './widget-content.component.html',
  styleUrls: ['./widget-content.component.scss'],
})
export class WidgetContentComponent implements OnDestroy {
  /** 动态组件插入点 */
  @ViewChild("contentRef", { read: ViewContainerRef }) vcr!: ViewContainerRef;
  /** 当前动态组件引用 */
  ref!: ComponentRef<any>

  /**
   * 微件数据输入属性
   * 数据变化时自动更新内容组件
   */
  @Input()
  set data(data: Widget | undefined) {
    this.updateContent(data);
  }

  /** 当前渲染的微件内容类型 */
  currentContentType: WidgetContentType | undefined;
  /** 事件订阅集合 */
  private subscription: Subscription = new Subscription();
  /** 动态组件是否已创建 */
  private componentCreated: boolean = false;

  constructor() { }

  /**
   * 更新微件内容
   * 当内容类型变化时销毁旧组件并创建新组件，否则仅更新数据
   * @param data 微件数据
   */
  updateContent(data: Widget | undefined) {
    // 内容类型变化时需要重新创建组件
    if (data?.widgetContentType !== this.currentContentType) {
      this.vcr?.clear();
      this.componentCreated = false;
    }

    if (this.vcr === undefined || data === undefined) {
      return;
    }

    this.currentContentType = data.widgetContentType;

    // 根据内容类型动态创建对应的组件
    switch (data.widgetContentType) {
      case WidgetContentType.empty:
        if (!this.componentCreated) {
          this.ref = this.vcr.createComponent(EmptyWidgetComponent);
        }
        this.ref.instance.updateWidget(data);
        break;
      case WidgetContentType.button:
        if (!this.componentCreated) {
          this.ref = this.vcr.createComponent(ButtonWidgetComponent);
        }
        this.ref.instance.updateWidget(data);
        break;
      default:
        break;
    }

    this.componentCreated = true;
    // 设置动态组件的样式类
    this.ref.location.nativeElement.setAttribute("class", "flex-grow-1")
  }

  /** 组件销毁时取消订阅 */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
