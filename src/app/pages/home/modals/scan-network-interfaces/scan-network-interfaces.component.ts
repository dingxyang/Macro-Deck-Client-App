import {AfterViewInit, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {QuickSetupQrCodeData} from "../../../../datatypes/quick-setup-qr-code-data";
import {HttpClient} from "@angular/common/http";
import {catchError, firstValueFrom, of, timeout} from "rxjs";
import {IonicModule, ModalController} from "@ionic/angular";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";


/** 网络接口扫描组件，逐个检测二维码中的网络接口地址是否可达 */
@Component({
  selector: 'app-scan-network-interfaces',
  templateUrl: './scan-network-interfaces.component.html',
  styleUrls: ['./scan-network-interfaces.component.scss'],
  imports: [
    IonicModule
  ]
})
export class ScanNetworkInterfacesComponent implements AfterViewInit {

  /** 快速设置二维码数据 */
  quickSetupQrCodeData: QuickSetupQrCodeData | undefined;

  /** 是否正在扫描中 */
  scanning: boolean = false;
  /** 服务器端口号 */
  port: number = 8191;
  /** 所有待检测的网络接口地址 */
  networkInterfaces: string[] = [];
  /** 可用的网络接口地址列表 */
  networkInterfacesAvailable: string[] = [];
  /** 不可用的网络接口地址列表 */
  networkInterfacesUnavailable: string[] = [];

  /** 组件销毁引用，用于取消 HTTP 请求 */
  private destroyRef = inject(DestroyRef);

  constructor(private http: HttpClient,
              private modalController: ModalController) {
  }

  /**
   * 视图初始化后回调
   * 延迟执行连接测试以确保视图已渲染
   */
  public ngAfterViewInit() {
    setTimeout(async () => {
      await this.testConnections();
    })
  }

  /**
   * 测试所有网络接口的连接可用性
   * 并行 Ping 所有接口，根据结果分类为可用和不可用列表
   */
  private async testConnections() {
    if (!this.quickSetupQrCodeData) return;

    this.scanning = true;

    const {ssl, port, networkInterfaces} = this.quickSetupQrCodeData;
    this.port = port;
    this.networkInterfaces = networkInterfaces;

    // 并行检测所有网络接口
    const checkPromises = networkInterfaces.map(async (networkInterface) => {
      const url = `${ssl ? 'https' : 'http'}://${networkInterface}:${port}/ping`;

      try {
        const response = await firstValueFrom(
          this.http.get(url).pipe(
            takeUntilDestroyed(this.destroyRef),
            timeout(3000),  // 超时 3 秒
            catchError(() => of(null))
          )
        );

        return {networkInterface, available: response !== null};
      } catch {
        return {networkInterface, available: false};
      }
    });

    const results = await Promise.all(checkPromises);

    // 根据检测结果分类
    this.networkInterfacesAvailable = results
      .filter(result => result.available)
      .map(result => result.networkInterface);

    this.networkInterfacesUnavailable = results
      .filter(result => !result.available)
      .map(result => result.networkInterface);

    this.scanning = false;

    // 无可用接口：返回 no-network-interfaces
    if (this.networkInterfacesAvailable.length === 0) {
      await this.modalController.dismiss(null, 'no-network-interfaces');
    } else if (this.networkInterfacesAvailable.length === 1) {
      // 仅一个可用接口：自动选择
      await this.modalController.dismiss(this.networkInterfacesAvailable[0], 'confirm');
    }
  }

  /**
   * 手动选择网络接口并确认
   * @param networkInterface 选中的网络接口地址
   */
  async applyInterface(networkInterface: string) {
    await this.modalController.dismiss(networkInterface, 'confirm');
  }
}
