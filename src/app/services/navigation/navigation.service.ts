import {Injectable} from '@angular/core';
import {NavigationDestination} from "../../enums/navigation-destination";
import {DeckPage} from "../../pages/deck/deck.page";
import {ConnectionLostPage} from "../../pages/connection-lost/connection-lost.page";
import {HomePage} from "../../pages/home/home.page";
import {environment} from "../../../environments/environment";
import {WebHomePage} from "../../pages/web-home/web-home.page";

/** 导航服务，管理应用内页面跳转 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  /** 首页组件类型，Web 版本使用 WebHomePage，原生版本使用 HomePage */
  homePage = environment.webVersion ? WebHomePage : HomePage;
  /** 控制面板页面组件类型 */
  deckPage = DeckPage;
  /** 连接丢失页面组件类型 */
  connectionLostPage = ConnectionLostPage;



  /**
   * 导航到指定页面
   * 使用 Ionic 的 ion-nav 组件进行页面切换
   * @param destination 导航目标
   */
  public async navigateTo(destination: NavigationDestination) {
    const nav = document.querySelector('ion-nav');
    if (nav === null) {
      return;
    }

    switch (destination) {
      case NavigationDestination.Home:
        await nav.setRoot(this.homePage, {animated: false});
        break;
      case NavigationDestination.Deck:
        await nav.setRoot(this.deckPage, {animated: false});
        break;
      case NavigationDestination.ConnectionLost:
        await nav.setRoot(this.connectionLostPage, {animated: false});
        break;
    }
  }
}
import {Injectable} from '@angular/core';
import {NavigationDestination} from "../../enums/navigation-destination";
import {DeckPage} from "../../pages/deck/deck.page";
import {ConnectionLostPage} from "../../pages/connection-lost/connection-lost.page";
import {HomePage} from "../../pages/home/home.page";
import {environment} from "../../../environments/environment";
import {WebHomePage} from "../../pages/web-home/web-home.page";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  homePage = environment.webVersion ? WebHomePage : HomePage;
  deckPage = DeckPage;
  connectionLostPage = ConnectionLostPage;



  public async navigateTo(destination: NavigationDestination) {
    const nav = document.querySelector('ion-nav');
    if (nav === null) {
      return;
    }

    switch (destination) {
      case NavigationDestination.Home:
        await nav.setRoot(this.homePage, {animated: false});
        break;
      case NavigationDestination.Deck:
        await nav.setRoot(this.deckPage, {animated: false});
        break;
      case NavigationDestination.ConnectionLost:
        await nav.setRoot(this.connectionLostPage, {animated: false});
        break;
    }
  }
}
