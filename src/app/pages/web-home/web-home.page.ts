import {Component, Inject, OnInit} from '@angular/core';
import {SettingsService} from "../../services/settings/settings.service";
import { DOCUMENT } from "@angular/common";
import {WebsocketService} from "../../services/websocket/websocket.service";
import {environment} from "../../../environments/environment";
import {IonicModule} from "@ionic/angular";

/** Web 版首页组件，用于浏览器端直接连接同源的 Macro Deck 服务器 */
@Component({
  selector: 'app-web-home',
  templateUrl: './web-home.page.html',
  styleUrls: ['./web-home.page.scss'],
  imports: [
    IonicModule
]
})
export class WebHomePage implements OnInit {

  /** 客户端 ID */
  clientId: string | undefined;
  /** 应用版本号 */
  version: string | undefined;

  /** 是否处于连接丢失状态 */
  connectionLost: boolean = false;
  /** 重试倒计时秒数 */
  retryCountdown: number = 10;

  /** 倒计时定时器引用 */
  private interval: any;

  constructor(@Inject(DOCUMENT) private document: Document,
              private websocketService: WebsocketService,
              private settingsService: SettingsService) { }

  /**
   * 组件初始化回调
   * 获取客户端信息，自动连接并监听连接丢失事件
   */
  async ngOnInit() {
    this.clientId = await this.settingsService.getClientId();
    this.version = "Web Version";
    await this.connect();
    this.websocketService.connectionLost.subscribe(async () => {
      await this.lostConnection();
    });
  }

  /**
   * 处理连接丢失
   * 启动重试倒计时，10 秒后自动重连
   */
  async lostConnection() {
    this.connectionLost = true;
    this.retryCountdown = 10;
    this.interval = setInterval(async () => {
      this.retryCountdown--;
      if (this.retryCountdown == 0) {
        await this.connect();
      }
    }, 1000);
  }

  /**
   * 连接到同源的 Macro Deck 服务器
   * 根据当前页面的协议和主机地址自动构建 WebSocket 连接地址
   */
  async connect() {
    clearInterval(this.interval);
    this.connectionLost = false;
    const baseUrl = this.document.baseURI;
    const urlParts = baseUrl.split('/');
    // 将 http/https 协议替换为 ws/wss
    const wsProtocol = urlParts[0].toLowerCase().replace('http', 'ws');
    const host = urlParts[2];
    const websocketUrl = `${wsProtocol}//${host}`;

    await this.websocketService.connectToString(websocketUrl);
  }

  protected readonly environment = environment;
}
