import {NgModule} from "@angular/core";
import {ButtonWidgetComponent} from "./button-widget/button-widget.component";
import {NgIf, NgStyle} from "@angular/common";
import {TouchEventModule} from "ng2-events";
import {EmptyWidgetComponent} from "./empty-widget/empty-widget.component";

/** 微件内容组件模块，声明和导出按钮微件和空白微件组件 */
@NgModule({
    imports: [
        NgStyle,
        TouchEventModule,
        NgIf,
        ButtonWidgetComponent,
        EmptyWidgetComponent
    ],
    exports: [
        TouchEventModule
    ]
})
export class WidgetContentComponentsModule {
}
