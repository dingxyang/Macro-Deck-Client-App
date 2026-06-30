import {WidgetInteractionType} from "../../enums/widget-interaction-type";
import {Widget} from "./widget";

/** 微件交互数据接口，描述用户与微件的一次交互行为 */
export interface WidgetInteraction {
    /** 被交互的微件 */
    widget: Widget,
    /** 交互类型（如按下、长按等） */
    widgetInteractionType: WidgetInteractionType
}
