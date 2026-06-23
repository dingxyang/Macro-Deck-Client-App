import {Component, OnDestroy, OnInit} from '@angular/core';
import {AlertController, IonicModule, ModalController} from "@ionic/angular";
import {Connection} from "../../../../datatypes/connection";
import {QuickSetupQrCodeData} from "../../../../datatypes/quick-setup-qr-code-data";
import {ScanNetworkInterfacesComponent} from "../scan-network-interfaces/scan-network-interfaces.component";
import {DiagnosticService} from "../../../../services/diagnostic/diagnostic.service";
import {Subscription} from "rxjs";
import {QrCodeScannerComponent} from "./qr-code-scanner/qr-code-scanner.component";
import {ConnectionFailedComponent} from "../connection-failed/connection-failed.component";
import {FormsModule} from "@angular/forms";
import {NgTemplateOutlet} from "@angular/common";

/** 新增/编辑连接弹窗组件，支持手动输入和二维码快速设置两种方式 */
@Component({
  selector: 'app-add-connection-modal',
  templateUrl: './add-connection.component.html',
  styleUrls: ['./add-connection.component.scss'],
  imports: [
    IonicModule,
    FormsModule,
    NgTemplateOutlet,
    QrCodeScannerComponent
  ]
})
export class AddConnectionComponent implements OnInit, OnDestroy {

  /** 是否为编辑已有连接模式 */
  editConnection: boolean = false;
  /** 快速设置二维码数据 */
  quickSetupQrCodeData: QuickSetupQrCodeData | undefined;
  /** 连接 id */
  id: string = "";
  /** 连接名称 */
  name: string | undefined;
  /** 服务器主机地址 */
  host: string = "";
  /** 服务器端口号 */
  port: number = 8191;
  /** 是否使用 SSL */
  useSsl: boolean = false;
  /** 是否自动连接 */
  autoConnect: boolean = false;
  /** 排序索引 */
  index: number = 0;
  /** 当前显示的页面标识（quick-setup 或 manual） */
  page: string = "quick-setup";
  /** 事件订阅集合 */
  subscription: Subscription = new Subscription();

  constructor(private modalController: ModalController,
              private alertController: AlertController,
              private diagnosticService: DiagnosticService) {
  }

  /** 组件销毁时取消所有订阅 */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 组件初始化回调
   * 在原生平台且非编辑模式下，监听二维码扫描结果并自动处理快速设置
   */
  async ngOnInit() {
    if (this.diagnosticService.isiOSorAndroid() && !this.editConnection) {
      this.subscription.add(QrCodeScannerComponent.quickSetupQrCodeScanned.subscribe(async qrCodeScanner => {
        const dataBase64 = qrCodeScanner.split("quick-setup/").pop();
        if (dataBase64) {
          const dataJson = atob(dataBase64);
          this.quickSetupQrCodeData = JSON.parse(dataJson) as QuickSetupQrCodeData;
          await this.handleQuickSetupQrCode();
        }
      }));
      await this.handleQuickSetupQrCode();
    }
  }

  /**
   * 处理快速设置二维码数据
   * 解析二维码中的连接信息，扫描网络接口以确定可用的服务器地址
   */
  async handleQuickSetupQrCode() {
    if (!this.quickSetupQrCodeData) {
      return;
    }

    // 从二维码数据中提取基本信息
    this.name = this.quickSetupQrCodeData.instanceName;
    this.port = this.quickSetupQrCodeData.port;
    this.useSsl = this.quickSetupQrCodeData.ssl;

    // 打开网络接口扫描弹窗，选择可用的服务器地址
    const modal = await this.modalController.create({
      component: ScanNetworkInterfacesComponent,
      componentProps: {
        quickSetupQrCodeData: this.quickSetupQrCodeData
      },
      presentingElement: await this.modalController.getTop()
    });

    await modal.present();
    const {data, role} = await modal.onDidDismiss();

    if (role === 'confirm') {
      // 选择了可用的网络接口
      this.host = data;
      const alert = await this.alertController.create({
        subHeader: `Network interface ${data} was selected!`,
        buttons: [
          {
            text: 'Ok',
            role: 'cancel'
          }
        ],
      });
      await alert.present();
      return;
    }

    if (role === 'no-network-interfaces') {
      // 没有可用的网络接口，显示连接失败弹窗
      const modal = await this.modalController.create({
        component: ConnectionFailedComponent,
        componentProps: {
          name: this.quickSetupQrCodeData.instanceName,
          errorInformation: `Tried interfaces: ${this.quickSetupQrCodeData.networkInterfaces.join(", ")}\nPort: ${this.quickSetupQrCodeData.port}\nSSL: ${this.quickSetupQrCodeData.ssl ? "Yes" : "No"}`,
        },
        presentingElement: await this.modalController.getTop()
      });
      await modal.present();
      await modal.onDidDismiss();
      this.reset();
    }
  }

  /** 取消并关闭弹窗 */
  async cancel() {
    await this.modalController.dismiss(null, 'cancel');
  }

  /**
   * 确认并保存连接
   * 验证输入后构造连接对象并关闭弹窗
   */
  async confirm() {
    if (!await this.validate()) {
      return;
    }

    let connection: Connection = {
      host: this.host,
      id: this.id,
      // 名称未填写时使用主机地址作为名称
      name: this.name === undefined || this.name.length === 0 ? this.host : this.name,
      port: this.port,
      ssl: this.useSsl,
      index: this.index,
      autoConnect: this.autoConnect,
      usbConnection: false,
      // 快速设置模式下使用二维码中的令牌
      token: this.quickSetupQrCodeData?.token !== undefined && this.quickSetupQrCodeData.token.length > 0
        ? this.quickSetupQrCodeData.token
        : undefined
    }

    await this.modalController.dismiss(connection, 'confirm');
  }

  /**
   * 验证连接表单输入
   * @returns 输入是否有效
   */
  async validate(): Promise<boolean> {
    if (this.host === undefined || this.host.length === 0) {
      await this.showErrorAlert("The IP Address / Hostname is required.");
      return false;
    } else if (this.port === undefined || this.port === null) {
      await this.showErrorAlert("The port is required.");
      return false;
    }

    return true;
  }

  /**
   * 显示错误提示弹窗
   * @param text 错误提示文本
   */
  async showErrorAlert(text: string) {
    const alert = await this.alertController.create({
      subHeader: text,
      buttons: [
        {
          text: 'Ok'
        }
      ],
    });

    await alert.present();
  }

  /** 重置表单为默认值 */
  reset() {
    this.quickSetupQrCodeData = undefined;
    this.host = "";
    this.port = 8191;
    this.useSsl = false;
    this.name = "";
    this.autoConnect = false;
  }
}
import {Component, OnDestroy, OnInit} from '@angular/core';
import {AlertController, IonicModule, ModalController} from "@ionic/angular";
import {Connection} from "../../../../datatypes/connection";
import {QuickSetupQrCodeData} from "../../../../datatypes/quick-setup-qr-code-data";
import {ScanNetworkInterfacesComponent} from "../scan-network-interfaces/scan-network-interfaces.component";
import {DiagnosticService} from "../../../../services/diagnostic/diagnostic.service";
import {Subscription} from "rxjs";
import {QrCodeScannerComponent} from "./qr-code-scanner/qr-code-scanner.component";
import {ConnectionFailedComponent} from "../connection-failed/connection-failed.component";
import {FormsModule} from "@angular/forms";
import {NgTemplateOutlet} from "@angular/common";

@Component({
  selector: 'app-add-connection-modal',
  templateUrl: './add-connection.component.html',
  styleUrls: ['./add-connection.component.scss'],
  imports: [
    IonicModule,
    FormsModule,
    NgTemplateOutlet,
    QrCodeScannerComponent
  ]
})
export class AddConnectionComponent implements OnInit, OnDestroy {

  editConnection: boolean = false;
  quickSetupQrCodeData: QuickSetupQrCodeData | undefined;
  id: string = "";
  name: string | undefined;
  host: string = "";
  port: number = 8191;
  useSsl: boolean = false;
  autoConnect: boolean = false;
  index: number = 0;
  page: string = "quick-setup";
  subscription: Subscription = new Subscription();

  constructor(private modalController: ModalController,
              private alertController: AlertController,
              private diagnosticService: DiagnosticService) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async ngOnInit() {
    if (this.diagnosticService.isiOSorAndroid() && !this.editConnection) {
      this.subscription.add(QrCodeScannerComponent.quickSetupQrCodeScanned.subscribe(async qrCodeScanner => {
        const dataBase64 = qrCodeScanner.split("quick-setup/").pop();
        if (dataBase64) {
          const dataJson = atob(dataBase64);
          this.quickSetupQrCodeData = JSON.parse(dataJson) as QuickSetupQrCodeData;
          await this.handleQuickSetupQrCode();
        }
      }));
      await this.handleQuickSetupQrCode();
    }
  }

  async handleQuickSetupQrCode() {
    if (!this.quickSetupQrCodeData) {
      return;
    }

    this.name = this.quickSetupQrCodeData.instanceName;
    this.port = this.quickSetupQrCodeData.port;
    this.useSsl = this.quickSetupQrCodeData.ssl;

    const modal = await this.modalController.create({
      component: ScanNetworkInterfacesComponent,
      componentProps: {
        quickSetupQrCodeData: this.quickSetupQrCodeData
      },
      presentingElement: await this.modalController.getTop()
    });

    await modal.present();
    const {data, role} = await modal.onDidDismiss();

    if (role === 'confirm') {
      this.host = data;
      const alert = await this.alertController.create({
        subHeader: `Network interface ${data} was selected!`,
        buttons: [
          {
            text: 'Ok',
            role: 'cancel'
          }
        ],
      });
      await alert.present();
      return;
    }

    if (role === 'no-network-interfaces') {
      const modal = await this.modalController.create({
        component: ConnectionFailedComponent,
        componentProps: {
          name: this.quickSetupQrCodeData.instanceName,
          errorInformation: `Tried interfaces: ${this.quickSetupQrCodeData.networkInterfaces.join(", ")}\nPort: ${this.quickSetupQrCodeData.port}\nSSL: ${this.quickSetupQrCodeData.ssl ? "Yes" : "No"}`,
        },
        presentingElement: await this.modalController.getTop()
      });
      await modal.present();
      await modal.onDidDismiss();
      this.reset();
    }
  }

  async cancel() {
    await this.modalController.dismiss(null, 'cancel');
  }

  async confirm() {
    if (!await this.validate()) {
      return;
    }

    let connection: Connection = {
      host: this.host,
      id: this.id,
      name: this.name === undefined || this.name.length === 0 ? this.host : this.name,
      port: this.port,
      ssl: this.useSsl,
      index: this.index,
      autoConnect: this.autoConnect,
      usbConnection: false,
      token: this.quickSetupQrCodeData?.token !== undefined && this.quickSetupQrCodeData.token.length > 0
        ? this.quickSetupQrCodeData.token
        : undefined
    }

    await this.modalController.dismiss(connection, 'confirm');
  }

  async validate(): Promise<boolean> {
    if (this.host === undefined || this.host.length === 0) {
      await this.showErrorAlert("The IP Address / Hostname is required.");
      return false;
    } else if (this.port === undefined || this.port === null) {
      await this.showErrorAlert("The port is required.");
      return false;
    }

    return true;
  }

  async showErrorAlert(text: string) {
    const alert = await this.alertController.create({
      subHeader: text,
      buttons: [
        {
          text: 'Ok'
        }
      ],
    });

    await alert.present();
  }

  reset() {
    this.quickSetupQrCodeData = undefined;
    this.host = "";
    this.port = 8191;
    this.useSsl = false;
    this.name = "";
    this.autoConnect = false;
  }
}
