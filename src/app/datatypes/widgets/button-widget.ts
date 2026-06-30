import {WidgetContent} from "./widget-content";

/** 按钮微件内容接口，继承自通用微件内容，包含按钮的图标和标签 */
export interface ButtonWidget extends WidgetContent {
    /** 按钮图标的 Base64 编码数据 */
    iconBase64: string | undefined,
    /** 按钮标签的 Base64 编码数据 */
    labelBase64: string | undefined
}
