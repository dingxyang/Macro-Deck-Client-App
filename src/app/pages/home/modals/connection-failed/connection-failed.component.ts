import { Component } from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";

/** 连接失败弹窗组件，显示连接错误信息 */
@Component({
  selector: 'app-connection-failed',
  templateUrl: './connection-failed.component.html',
  styleUrls: ['./connection-failed.component.scss'],
  imports: [
    IonicModule
  ]
})
export class ConnectionFailedComponent   {

  /** 连接名称 */
  name: string = "";
  /** 错误详情信息 */
  errorInformation: string = "";

  constructor(private modalController: ModalController) { }

  /** 关闭弹窗 */
  async dismiss() {
    await this.modalController.dismiss();
  }
}
