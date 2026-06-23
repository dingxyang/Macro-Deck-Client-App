import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WebHomePage } from './web-home.page';

/** Web 版首页模块，声明并导出 WebHomePage 组件 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        WebHomePage
    ],
    exports: [
        WebHomePage
    ]
})
export class WebHomePageModule {}
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WebHomePage } from './web-home.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        WebHomePage
    ],
    exports: [
        WebHomePage
    ]
})
export class WebHomePageModule {}
