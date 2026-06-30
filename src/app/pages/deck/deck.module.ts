import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeckPage } from './deck.page';
import {WidgetGridComponent} from "./widget-grid/widget-grid.component";
import {WidgetContentComponent} from "./widget-grid/widget-content/widget-content.component";

/** 控制面板页面模块，声明面板页面及微件相关组件 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        DeckPage,
        WidgetGridComponent,
        WidgetContentComponent,
    ]
})
export class DeckPageModule {}
