import { Component, OnInit } from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {TranslatePipe} from "@ngx-translate/core";

/** 连接丢失弹窗组件（首页模态弹窗版本） */
@Component({
  selector: 'app-connection-lost',
  templateUrl: './connection-lost.component.html',
  styleUrls: ['./connection-lost.component.scss'],
  imports: [
    IonicModule,
    TranslatePipe
  ]
})
export class ConnectionLostComponent {

  constructor(private modalController: ModalController) { }

  /** 关闭弹窗 */
  async dismiss() {
    await this.modalController.dismiss();
  }
}
