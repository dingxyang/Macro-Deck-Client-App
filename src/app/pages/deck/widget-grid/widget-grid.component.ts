import {
  AfterContentInit,
  AfterViewInit,
  ApplicationRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {Widget} from "../../../datatypes/widgets/widget";
import {Subscription} from "rxjs";
import {MacroDeckService} from "../../../services/macro-deck/macro-deck.service";
import {WidgetContentType} from "../../../enums/widget-content-type";
import { NgStyle } from "@angular/common";
import {WidgetContentComponent} from "./widget-content/widget-content.component";

/** 微件网格组件，根据服务器配置动态布局和渲染微件按钮 */
@Component({
  selector: 'app-widget-grid',
  templateUrl: './widget-grid.component.html',
  styleUrls: ['./widget-grid.component.scss'],
  imports: [
    NgStyle,
    WidgetContentComponent
  ]
})
export class WidgetGridComponent implements AfterContentInit, OnDestroy {
    /** 微件包装容器的 DOM 引用 */
    @ViewChild('widgetsWrapper', {static: false}) wrapperElement!: ElementRef;

    constructor(private macroDeckService: MacroDeckService,
                private applicationRef: ApplicationRef) {
    }

    /** 网格更新事件，当布局重新计算时触发 */
    public static updated: EventEmitter<any> = new EventEmitter<any>();

    /** 事件订阅集合 */
    private subscription: Subscription = new Subscription();

    /** 计算后的按钮尺寸（像素） */
    private buttonSize: number = 0;
    /** 微件间距（pt） */
    private widgetSpacingPoints: number = 0;
    /** 微件圆角半径（pt） */
    public static borderRadiusPoints: number = 0;

    /** 包装容器宽度 */
    private wrapperWidth: number = 0;
    /** 包装容器高度 */
    private wrapperHeight: number = 0;
    /** 包装容器水平内边距 */
    private wrapperPaddingX: number = 0;
    /** 包装容器垂直内边距 */
    private wrapperPaddingY: number = 0;

    /** 组件销毁时取消所有订阅 */
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    /**
     * 内容初始化后回调
     * 订阅配置更新事件和窗口大小变化事件，重新计算微件尺寸
     */
    ngAfterContentInit(): void {
      this.subscription.add(this.macroDeckService.configUpdate.subscribe(() => {
        this.calculateWidgetSize();
        this.applicationRef.tick();
      }));

      // 监听窗口大小变化，延迟重新计算布局
      window.addEventListener("resize", () => {
        setTimeout(() => {
          this.calculateWidgetSize();
          this.applicationRef.tick();
        }, 100)
      }, false);

      // 初始延迟计算，等待视图完全渲染
      setTimeout(() => {
        this.calculateWidgetSize();
      }, 1000);
    }

    /**
     * 计算微件尺寸
     * 根据容器大小和面板行列数，计算每个微件的最佳尺寸、间距和圆角
     */
    @HostListener('window:resize', ['$event'])
    calculateWidgetSize(): void {
        if (this.wrapperElement == null) {
            return;
        }

        // 获取容器实际尺寸和内边距
        const wrapperStyle = window.getComputedStyle(this.wrapperElement.nativeElement, null);
        this.wrapperPaddingX = parseInt(wrapperStyle.getPropertyValue('padding-left')) +
            parseInt(wrapperStyle.getPropertyValue('padding-right'));
        this.wrapperPaddingY = parseInt(wrapperStyle.getPropertyValue('padding-top')) +
            parseInt(wrapperStyle.getPropertyValue('padding-bottom'));
        this.wrapperWidth = (this.wrapperElement?.nativeElement.offsetWidth ?? 0) - this.wrapperPaddingX;
        this.wrapperHeight = (this.wrapperElement?.nativeElement.offsetHeight ?? 0) - this.wrapperPaddingY;

        // 计算微件尺寸，取行列方向的最小值确保正方形按钮
        let widgetSizeX = this.wrapperWidth / this.macroDeckService.columns;
        let widgetSizeY = this.wrapperHeight / this.macroDeckService.rows;
        this.buttonSize = Math.min(widgetSizeX, widgetSizeY);

        // 将百分比间距和圆角转换为 pt 单位（px 转 pt 的换算系数为 72/96）
        this.widgetSpacingPoints = (((this.macroDeckService.buttonSpacing / 100) * this.buttonSize) * 72 / 96) / 2;
        WidgetGridComponent.borderRadiusPoints = (((this.macroDeckService.buttonRadius / 100) * this.buttonSize) * 72 / 96) / 2;
        WidgetGridComponent.updated.emit();
    }

    /**
     * 计算面板中微件的总数
     * @returns 行数 × 列数
     */
    countTotalWidgets(): number {
        return this.macroDeckService.rows * this.macroDeckService.columns;
    }

    /**
     * 根据索引获取微件的定位样式
     * 计算微件在网格中的绝对定位，并居中显示
     * @param index 微件在网格中的线性索引
     * @returns CSS 样式对象
     */
    getWidgetStyle(index: number) {
        const row = Math.trunc(index / this.macroDeckService.columns);
        const column = Math.trunc(index % this.macroDeckService.columns);
        const widget = this.macroDeckService.widgets.find(x => x.row == row && x.column == column);

        const width = this.buttonSize * (widget?.colSpan ?? 1);
        const height = this.buttonSize * (widget?.rowSpan ?? 1);

        // 计算居中偏移量
        const xOffset = (this.wrapperWidth / 2) - ((this.macroDeckService.columns * this.buttonSize) / 2);
        const yOffset = (this.wrapperHeight / 2) - ((this.macroDeckService.rows * this.buttonSize) / 2);

        const x = xOffset + (column * this.buttonSize);
        const y = yOffset + (row * this.buttonSize);

        return {
            'width': width + 'px',
            'height': height + 'px',
            'position': 'absolute',
            'top': y + "px",
            'left': x + "px"
        }
    }

    /**
     * 获取微件内容的间距样式
     * @returns CSS 样式对象
     */
    getWidgetContentStyle() {
        return {
            'margin': this.widgetSpacingPoints + "pt"
        }
    }

    /**
     * 根据索引获取微件数据
     * 如果对应位置没有微件数据，返回默认的空白微件
     * @param index 微件在网格中的线性索引
     * @returns 微件数据对象
     */
    getWidgetFromIndex(index: number): Widget | undefined {
        const row = Math.trunc(index / this.macroDeckService.columns);
        const column = Math.trunc(index % this.macroDeckService.columns);
        let widget: Widget | undefined = this.macroDeckService.widgets.find(x => x.row == row && x.column == column);
        if (!widget) {
            // 该位置没有微件数据，创建空白占位微件
            widget = {
                backgroundColorHex: '#232323',
                colSpan: 1,
                column: column,
                row: row,
                rowSpan: 1,
                widgetContent: undefined,
                widgetContentType: WidgetContentType.empty

            }
        }
        return widget;
    }
}
import {
  AfterContentInit,
  AfterViewInit,
  ApplicationRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {Widget} from "../../../datatypes/widgets/widget";
import {Subscription} from "rxjs";
import {MacroDeckService} from "../../../services/macro-deck/macro-deck.service";
import {WidgetContentType} from "../../../enums/widget-content-type";
import { NgStyle } from "@angular/common";
import {WidgetContentComponent} from "./widget-content/widget-content.component";

@Component({
  selector: 'app-widget-grid',
  templateUrl: './widget-grid.component.html',
  styleUrls: ['./widget-grid.component.scss'],
  imports: [
    NgStyle,
    WidgetContentComponent
]
})
export class WidgetGridComponent implements AfterContentInit, OnDestroy {
    @ViewChild('widgetsWrapper', {static: false}) wrapperElement!: ElementRef;

    constructor(private macroDeckService: MacroDeckService,
                private applicationRef: ApplicationRef) {
    }

    public static updated: EventEmitter<any> = new EventEmitter<any>();

    private subscription: Subscription = new Subscription();

    private buttonSize: number = 0;
    private widgetSpacingPoints: number = 0;
    public static borderRadiusPoints: number = 0;

    private wrapperWidth: number = 0;
    private wrapperHeight: number = 0;
    private wrapperPaddingX: number = 0;
    private wrapperPaddingY: number = 0;

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngAfterContentInit(): void {
      this.subscription.add(this.macroDeckService.configUpdate.subscribe(() => {
        this.calculateWidgetSize();
        this.applicationRef.tick();
      }));

      window.addEventListener("resize", () => {
        setTimeout(() => {
          this.calculateWidgetSize();
          this.applicationRef.tick();
        }, 100)
      }, false);

      setTimeout(() => {
        this.calculateWidgetSize();
      }, 1000);
    }

    @HostListener('window:resize', ['$event'])
    calculateWidgetSize(): void {
        if (this.wrapperElement == null) {
            return;
        }

        const wrapperStyle = window.getComputedStyle(this.wrapperElement.nativeElement, null);
        this.wrapperPaddingX = parseInt(wrapperStyle.getPropertyValue('padding-left')) +
            parseInt(wrapperStyle.getPropertyValue('padding-right'));
        this.wrapperPaddingY = parseInt(wrapperStyle.getPropertyValue('padding-top')) +
            parseInt(wrapperStyle.getPropertyValue('padding-bottom'));
        this.wrapperWidth = (this.wrapperElement?.nativeElement.offsetWidth ?? 0) - this.wrapperPaddingX;
        this.wrapperHeight = (this.wrapperElement?.nativeElement.offsetHeight ?? 0) - this.wrapperPaddingY;
        let widgetSizeX = this.wrapperWidth / this.macroDeckService.columns;
        let widgetSizeY = this.wrapperHeight / this.macroDeckService.rows;
        this.buttonSize = Math.min(widgetSizeX, widgetSizeY);

        this.widgetSpacingPoints = (((this.macroDeckService.buttonSpacing / 100) * this.buttonSize) * 72 / 96) / 2;
        WidgetGridComponent.borderRadiusPoints = (((this.macroDeckService.buttonRadius / 100) * this.buttonSize) * 72 / 96) / 2;
        WidgetGridComponent.updated.emit();
    }

    countTotalWidgets(): number {
        return this.macroDeckService.rows * this.macroDeckService.columns;
    }

    getWidgetStyle(index: number) {
        const row = Math.trunc(index / this.macroDeckService.columns);
        const column = Math.trunc(index % this.macroDeckService.columns);
        const widget = this.macroDeckService.widgets.find(x => x.row == row && x.column == column);

        const width = this.buttonSize * (widget?.colSpan ?? 1);
        const height = this.buttonSize * (widget?.rowSpan ?? 1);

        const xOffset = (this.wrapperWidth / 2) - ((this.macroDeckService.columns * this.buttonSize) / 2); // Offset to center items horizontally
        const yOffset = (this.wrapperHeight / 2) - ((this.macroDeckService.rows * this.buttonSize) / 2); // Offset to center items vertically

        const x = xOffset + (column * this.buttonSize);
        const y = yOffset + (row * this.buttonSize);

        return {
            'width': width + 'px',
            'height': height + 'px',
            'position': 'absolute',
            'top': y + "px",
            'left': x + "px"
        }
    }

    getWidgetContentStyle() {
        return {
            'margin': this.widgetSpacingPoints + "pt"
        }
    }

    getWidgetFromIndex(index: number): Widget | undefined {
        const row = Math.trunc(index / this.macroDeckService.columns);
        const column = Math.trunc(index % this.macroDeckService.columns);
        let widget: Widget | undefined = this.macroDeckService.widgets.find(x => x.row == row && x.column == column);
        if (!widget) {
            widget = {
                backgroundColorHex: '#232323',
                colSpan: 1,
                column: column,
                row: row,
                rowSpan: 1,
                widgetContent: undefined,
                widgetContentType: WidgetContentType.empty

            }
        }
        return widget;
    }
}
