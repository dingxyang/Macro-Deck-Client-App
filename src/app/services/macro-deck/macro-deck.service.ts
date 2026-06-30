import {EventEmitter, Injectable, Output} from '@angular/core';
import {WebsocketService} from "../websocket/websocket.service";
import {Widget} from "../../datatypes/widgets/widget";
import {WidgetInteraction} from "../../datatypes/widgets/widget-interaction";

/** Macro Deck 核心服务，管理面板配置和微件数据状态 */
@Injectable({
  providedIn: 'root'
})
export class MacroDeckService {
  /** 配置更新事件 */
  @Output() configUpdate = new EventEmitter();
  /** 用户交互事件（按钮按下、长按等） */
  @Output() interaction = new EventEmitter<WidgetInteraction>();

  /** 当前面板中的微件列表 */
  widgets: Widget[] = [];
  /** 面板行数 */
  rows: number = 3;
  /** 面板列数 */
  columns: number = 5;
  /** 按钮间距 */
  buttonSpacing: number = 10;
  /** 按钮圆角半径 */
  buttonRadius: number = 40;
  /** 是否显示按钮背景 */
  buttonBackground: boolean = true;

  constructor() {
  }

  /**
   * 设置面板配置数据
   * @param message 包含 Rows、Columns、ButtonSpacing、ButtonRadius、ButtonBackground 的配置消息
   */
  setConfig(message: any) {
    this.rows = message.Rows;
    this.columns = message.Columns;
    this.buttonSpacing = message.ButtonSpacing;
    this.buttonRadius = message.ButtonRadius;
    this.buttonBackground = message.ButtonBackground;
    this.configUpdate.emit();
  }

  /**
   * 设置完整的微件列表
   * @param widgets 微件数组
   */
  setWidgets(widgets: Widget[]) {
    this.widgets = widgets;
  }

  /**
   * 更新单个微件数据
   * 根据行列坐标查找已有微件并替换，如果未找到则追加
   * @param widget 要更新的微件
   */
  updateWidget(widget: Widget) {
    let existingWidgetIndex = this.widgets.findIndex(x => x.row == widget.row && x.column == widget.column);
    if (existingWidgetIndex !== -1) {
      this.widgets[existingWidgetIndex] = widget;
    } else {
      this.widgets.push(widget);
    }
  }
}
