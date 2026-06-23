import {Component, EventEmitter, OnInit} from '@angular/core';
import {IonicModule} from "@ionic/angular";

/** 二维码扫描 UI 组件，提供扫描界面的返回按钮交互 */
@Component({
  selector: 'app-qr-code-scanner-ui',
  templateUrl: './qr-code-scanner-ui.component.html',
  styleUrls: ['./qr-code-scanner-ui.component.scss'],
  imports: [
    IonicModule
  ]
})
export class QrCodeScannerUiComponent {

  /** 返回按钮点击事件 */
  public static backTapped: EventEmitter<any> = new EventEmitter();

  constructor() { }

  /** 返回按钮点击处理，触发 backTapped 事件 */
  back() {
    QrCodeScannerUiComponent.backTapped.emit();
  }
}
import {Component, EventEmitter, OnInit} from '@angular/core';
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-qr-code-scanner-ui',
  templateUrl: './qr-code-scanner-ui.component.html',
  styleUrls: ['./qr-code-scanner-ui.component.scss'],
  imports: [
    IonicModule
  ]
})
export class QrCodeScannerUiComponent {

  public static backTapped: EventEmitter<any> = new EventEmitter();

  constructor() { }

  back() {
    QrCodeScannerUiComponent.backTapped.emit();
  }
}
