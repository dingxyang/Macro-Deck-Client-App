/** 微件交互类型枚举，定义用户与微件交互的各种方式 */
export enum WidgetInteractionType {
    /** 按钮按下 */
    ButtonPress = 1000,
    /** 按钮短按释放 */
    ButtonShortPressRelease = 1001,
    /** 按钮长按 */
    ButtonLongPress = 1010,
    /** 按钮长按释放 */
    ButtonLongPressRelease = 1011
}
