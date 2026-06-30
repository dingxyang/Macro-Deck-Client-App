import { Component, OnInit } from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {TranslatePipe} from "@ngx-translate/core";

/** 不安全连接提示弹窗组件，当 SSL 证书验证失败时显示 */
@Component({
  selector: 'app-insecure-connection',
  templateUrl: './insecure-connection.component.html',
  styleUrls: ['./insecure-connection.component.scss'],
  imports: [
    IonicModule,
    TranslatePipe
  ]
})
export class InsecureConnectionComponent {

  constructor(private modalController: ModalController) { }

  /** 关闭弹窗 */
  async dismiss() {
    await this.modalController.dismiss();
  }
}
