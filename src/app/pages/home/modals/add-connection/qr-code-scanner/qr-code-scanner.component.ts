import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {AlertController, IonicModule, ModalController} from "@ionic/angular";
import {BarcodeScanner, SupportedFormat} from "@capacitor-community/barcode-scanner";
import {Subscription} from "rxjs";
import {QrCodeScannerUiComponent} from "./qr-code-scanner-ui/qr-code-scanner-ui.component";

/** 二维码扫描组件，使用设备摄像头扫描 Macro Deck 快速设置二维码 */
@Component({
  selector: 'app-qr-code-scanner',
  templateUrl: './qr-code-scanner.component.html',
  styleUrls: ['./qr-code-scanner.component.scss'],
  imports: [
    IonicModule
  ]
})
export class QrCodeScannerComponent implements OnInit, OnDestroy {

  /** 快速设置二维码扫描结果事件，传递扫描到的二维码内容 */
  public static quickSetupQrCodeScanned: EventEmitter<string> = new EventEmitter();

  /** 事件订阅集合 */
  private subscription: Subscription = new Subscription();

  constructor(private alertController: AlertController) {
  }

  /**
   * 组件初始化回调
   * 监听扫描 UI 的返回按钮事件
   */
  async ngOnInit() {
    this.subscription.add(QrCodeScannerUiComponent.backTapped.subscribe(async () => {
      await this.stopScan();
    }));
  }

  /** 组件销毁时停止扫描并取消订阅 */
  async ngOnDestroy() {
    await this.stopScan();
    this.subscription.unsubscribe();
  }

  /**
   * 停止二维码扫描
   * 移除扫描状态样式并停止摄像头
   */
  async stopScan() {
    document.querySelector('body')?.classList.remove('barcode-scanner-active');
    await BarcodeScanner.stopScan();
  }

  /**
   * 启动二维码扫描
   * 先请求摄像头权限，权限通过后开始扫描 Macro Deck 快速设置二维码
   */
  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      await this.presentAlert();
      return;
    }

    await BarcodeScanner.prepare({targetedFormats: [SupportedFormat.QR_CODE]});

    // 添加扫描激活样式（隐藏页面其他元素）
    document.querySelector('body')?.classList.add('barcode-scanner-active');

    await BarcodeScanner.startScanning({targetedFormats: [SupportedFormat.QR_CODE]}, async result => {
      // 仅处理 Macro Deck 快速设置链接
      if (result.hasContent && result.content.toLowerCase().startsWith("https://macro-deck.app/quick-setup")) {
        await this.stopScan();
        QrCodeScannerComponent.quickSetupQrCodeScanned.emit(result.content);
      }
    });
  }

  /**
   * 请求摄像头权限
   * @returns 是否获得权限
   */
  async requestPermissions(): Promise<boolean> {
    const camera = await BarcodeScanner.checkPermission({force: true});
    return camera.granted === true;
  }

  /**
   * 显示摄像头权限被拒绝的提示
   */
  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permission denied',
      message: 'Please grant camera permission to use the barcode scanner.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}
import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {AlertController, IonicModule, ModalController} from "@ionic/angular";
import {BarcodeScanner, SupportedFormat} from "@capacitor-community/barcode-scanner";
import {Subscription} from "rxjs";
import {QrCodeScannerUiComponent} from "./qr-code-scanner-ui/qr-code-scanner-ui.component";

@Component({
  selector: 'app-qr-code-scanner',
  templateUrl: './qr-code-scanner.component.html',
  styleUrls: ['./qr-code-scanner.component.scss'],
  imports: [
    IonicModule
  ]
})
export class QrCodeScannerComponent implements OnInit, OnDestroy {

  public static quickSetupQrCodeScanned: EventEmitter<string> = new EventEmitter();

  private subscription: Subscription = new Subscription();

  constructor(private alertController: AlertController) {
  }

  async ngOnInit() {
    this.subscription.add(QrCodeScannerUiComponent.backTapped.subscribe(async () => {
      await this.stopScan();
    }));
  }

  async ngOnDestroy() {
    await this.stopScan();
    this.subscription.unsubscribe();
  }

  async stopScan() {
    document.querySelector('body')?.classList.remove('barcode-scanner-active');
    await BarcodeScanner.stopScan();
  }

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      await this.presentAlert();
      return;
    }

    await BarcodeScanner.prepare({targetedFormats: [SupportedFormat.QR_CODE]});

    document.querySelector('body')?.classList.add('barcode-scanner-active');

    await BarcodeScanner.startScanning({targetedFormats: [SupportedFormat.QR_CODE]}, async result => {
      if (result.hasContent && result.content.toLowerCase().startsWith("https://macro-deck.app/quick-setup")) {
        await this.stopScan();
        QrCodeScannerComponent.quickSetupQrCodeScanned.emit(result.content);
      }
    });
  }

  async requestPermissions(): Promise<boolean> {
    const camera = await BarcodeScanner.checkPermission({force: true});
    return camera.granted === true;
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permission denied',
      message: 'Please grant camera permission to use the barcode scanner.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}
