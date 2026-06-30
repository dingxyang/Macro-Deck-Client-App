import {WidgetContent} from "./widget-content";
import {WidgetContentType} from "../../enums/widget-content-type";

/** 微件数据接口，描述网格中一个微件的位置、大小和内容 */
export interface Widget {
    /** 微件所在列索引 */
    column: number,
    /** 微件所在行索引 */
    row: number,
    /** 微件跨列数 */
    colSpan: number,
    /** 微件跨行数 */
    rowSpan: number,
    /** 微件背景颜色（十六进制色值） */
    backgroundColorHex: string | undefined,
    /** 微件内容类型 */
    widgetContentType: WidgetContentType,
    /** 微件具体内容数据 */
    widgetContent: WidgetContent | undefined
}
