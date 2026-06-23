import {EventEmitter, Injectable} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {ConnectingComponent} from "../../pages/home/modals/connecting/connecting.component";

/** 加载提示服务，管理连接过程中的加载弹窗显示与关闭 */
@Injectable({
    providedIn: 'root'
})
export class LoadingService {

    constructor(private modalController: ModalController) {
    }

    /** 加载弹窗被用户取消时触发 */
    canceled: EventEmitter<any> = new EventEmitter<any>();

    /** 当前打开的模态弹窗引用 */
    private openModal: any;

    /**
     * 关闭加载弹窗
     * 安全地关闭弹窗，捕获可能的异常
     */
    async dismiss() {
        try {
            await this.openModal?.dismiss();
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 显示带消息的加载弹窗
     * 先关闭已有弹窗再创建新弹窗，防止重复叠加
     * @param text 加载提示文本
     */
    async showLoading(text: string) {
      await this.dismiss()
      this.openModal = await this.modalController.create({
        component: ConnectingComponent,
        componentProps: {
          message: text,
          canceled: this.canceled
        },
        backdropDismiss: false  // 禁止点击背景关闭
      });
      await this.openModal.present();
    }
}
import {EventEmitter, Injectable} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {ConnectingComponent} from "../../pages/home/modals/connecting/connecting.component";

@Injectable({
    providedIn: 'root'
})
export class LoadingService {

    constructor(private modalController: ModalController) {
    }

    canceled: EventEmitter<any> = new EventEmitter<any>();

    private openModal: any;

    async dismiss() {
        try {
            await this.openModal?.dismiss();
        } catch (error) {
            console.error(error);
        }
    }

    async showLoading(text: string) {
      await this.dismiss()
      this.openModal = await this.modalController.create({
        component: ConnectingComponent,
        componentProps: {
          message: text,
          canceled: this.canceled
        },
        backdropDismiss: false
      });
      await this.openModal.present();
    }
}
