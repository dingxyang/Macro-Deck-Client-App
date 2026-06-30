import { Component } from '@angular/core';
import {Widget} from "../../datatypes/widgets/widget";
import {WidgetGridComponent} from "../../pages/deck/widget-grid/widget-grid.component";
import {NgStyle} from "@angular/common";

/** 空白微件组件，显示空的微件占位 */
@Component({
  selector: 'app-empty-widget',
  templateUrl: './empty-widget.component.html',
  styleUrls: ['./empty-widget.component.scss'],
  imports: [
    NgStyle
  ]
})
export class EmptyWidgetComponent {

  /** 背景样式对象 */
  backgroundStyle: any;

  constructor() { }

  /**
   * 更新微件显示数据
   * @param widget 微件数据
   */
  updateWidget(widget: Widget) {
    this.backgroundStyle = {'background-color' : widget.backgroundColorHex};
  }

  protected readonly WidgetGridComponent = WidgetGridComponent;
}
