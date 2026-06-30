import {Component, EventEmitter} from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {environment} from "../../../../../environments/environment";


/** 连接中弹窗组件，显示连接进度并支持取消操作 */
@Component({
  selector: 'app-connecting',
  templateUrl: './connecting.component.html',
  styleUrls: ['./connecting.component.scss'],
  imports: [
    IonicModule
]
})
export class ConnectingComponent {

  /** 连接提示消息 */
  message: string = "";
  /** 取消事件发射器 */
  canceled: EventEmitter<any> | undefined;

  constructor(private modalController: ModalController) { }

  /** 取消连接并关闭弹窗 */
  async cancel() {
    this.canceled?.emit();
    await this.modalController.dismiss(null, 'cancel');
  }

  protected readonly environment = environment;
}
