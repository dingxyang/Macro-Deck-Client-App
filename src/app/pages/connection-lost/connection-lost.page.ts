import {Component} from '@angular/core';
import {WebsocketService} from "../../services/websocket/websocket.service";
import {Connection} from "../../datatypes/connection";
import {Subscription} from "rxjs";
import {NavigationService} from "../../services/navigation/navigation.service";
import {NavigationDestination} from "../../enums/navigation-destination";
import {IonicModule, ViewDidEnter, ViewDidLeave} from "@ionic/angular";
import {TranslatePipe} from "@ngx-translate/core";

/** 连接丢失页面组件，显示重试倒计时并自动尝试重新连接 */
@Component({
  selector: 'app-connection-lost',
  templateUrl: './connection-lost.page.html',
  styleUrls: ['./connection-lost.page.scss'],
  imports: [
    IonicModule,
    TranslatePipe
  ]
})
export class ConnectionLostPage implements ViewDidEnter, ViewDidLeave {

  /** 重试倒计时秒数 */
  retryCountdown: number = 10;

  /** 当前断开连接的配置 */
  connection: Connection | undefined;

  /** 事件订阅集合 */
  private subscription: Subscription = new Subscription();

  /** 倒计时定时器引用 */
  private interval: any;

  constructor(private websocketService: WebsocketService,
              private navigationService: NavigationService) {
    this.connection = websocketService.getConnection();
  }

  /** 页面离开时取消订阅 */
  ionViewDidLeave() {
    this.subscription.unsubscribe();
  }

  /**
   * 页面进入后回调
   * 监听连接失败事件并启动重试倒计时
   */
  async ionViewDidEnter() {
    this.subscription.add(this.websocketService.connectionFailed.subscribe(() => {
      this.startRetry();
    }));
    await this.startRetry();
  }

  /**
   * 启动重试倒计时
   * 从 10 秒开始倒数，到 0 时自动尝试重新连接
   */
  async startRetry() {
    this.retryCountdown = 10;
    this.interval = setInterval(async () => {
      this.retryCountdown--;
      if (this.retryCountdown == 0) {
        await this.connect();
      }
    }, 1000);
  }

  /**
   * 尝试重新连接
   * 清除定时器，如果连接配置无效则返回首页
   */
  async connect() {
    clearInterval(this.interval);
    if (this.connection == undefined) {
      await this.navigationService.navigateTo(NavigationDestination.Home);
      return;
    }
    await this.websocketService.connectToConnection(this.connection);
  }

  /** 取消重试并返回首页 */
  async cancel() {
    clearInterval(this.interval);
    await this.navigationService.navigateTo(NavigationDestination.Home);
  }
}
