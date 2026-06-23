/** 协议2按钮数据接口，描述按钮在网格中的位置及显示属性 */
export interface Protocol2Button {
    /** 按钮图标的 Base64 编码数据 */
    IconBase64: string | undefined,
    /** 按钮在网格中的列位置 */
    Position_X: number,
    /** 按钮在网格中的行位置 */
    Position_Y: number,
    /** 按钮标签的 Base64 编码数据 */
    LabelBase64: string | undefined,
    /** 按钮背景颜色（十六进制色值） */
    BackgroundColorHex: string | undefined
}
export interface Protocol2Button {
    IconBase64: string | undefined,
    Position_X: number,
    Position_Y: number,
    LabelBase64: string | undefined,
    BackgroundColorHex: string | undefined
}
