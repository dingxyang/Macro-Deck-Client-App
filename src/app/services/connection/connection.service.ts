import { Injectable } from '@angular/core';
import {Connection} from "../../datatypes/connection";
import {Storage} from '@ionic/storage';
import {SettingsService} from "../settings/settings.service";

/** 连接管理服务，负责 Macro Deck 服务器连接配置的增删改查和持久化存储 */
@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  /** 连接数据在本地存储中的键名 */
  private connectionsStorageKey: string = "connections";

  constructor(private storage: Storage,
              private settingsService: SettingsService) { }

  /**
   * 获取 USB 连接配置
   * @returns USB 连接对象，主机地址固定为 127.0.0.1
   */
  public async getUsbConnection() {
    return {
      autoConnect: await this.settingsService.getUsbAutoConnect(),
      index: undefined,
      id: "usb",
      name: "USB",
      host: "127.0.0.1",
      port: await this.settingsService.getUsbPort(),
      ssl: await this.settingsService.getUsbUseSsl(),
      usbConnection: true,
      token: undefined
    }
  }

  /**
   * 获取所有已保存的网络连接配置
   * @returns 按索引排序的连接列表
   */
  public async getConnections(): Promise<Connection[]> {
    const connectionsData = await this.storage.get(this.connectionsStorageKey);
    if (connectionsData === undefined || connectionsData === null) {
      return [];
    }

    // 解析 JSON 并按 index 字段升序排列
    const connections = JSON.parse(connectionsData).sort((a: Connection, b: Connection) => (a.index ?? 0) - (b.index ?? 0));
    console.log(connections);
    return connections;
  }

  /**
   * 保存连接列表到本地存储
   * @param connections 要保存的连接列表
   */
  public async saveConnections(connections: Connection[]) {
    await this.storage.set(this.connectionsStorageKey, JSON.stringify(connections));
  }

  /**
   * 新增或更新连接配置
   * 如果连接没有 id 则视为新增，否则更新已有连接
   * @param connection 要新增或更新的连接对象
   */
  public async addUpdateConnection(connection: Connection) {
    const connectionsData = await this.storage.get(this.connectionsStorageKey);
    let connectionsObject = JSON.parse(connectionsData) ?? [];

    if (!connection.id) {
      // 新连接：生成基于时间戳的 id 并追加到列表末尾
      connection.id = `connection${Math.floor(Date.now() / 1000)}`;
      connection.index = connectionsObject.length;
      connectionsObject.push(connection);
    } else {
      // 已有连接：查找并替换，如果未找到则追加
      const existingIndex = connectionsObject.findIndex((x: Connection) => x.id === connection.id);
      if (existingIndex > -1) {
        connectionsObject[existingIndex] = connection;
      } else {
        connectionsObject.push(connection);
      }
    }

    await this.saveConnections(connectionsObject);
  }

  /**
   * 根据 id 删除连接配置
   * @param id 要删除的连接 id
   */
  public async deleteConnection(id: string) {
    const connectionsData = await this.storage.get(this.connectionsStorageKey);
    let connectionsObject:Connection[] = JSON.parse(connectionsData) ?? [];

    const existingIndex = connectionsObject.findIndex(x => x.id == id);
    if (existingIndex > -1) {
      connectionsObject.splice(existingIndex, 1);
    }

    await this.storage.set(this.connectionsStorageKey, JSON.stringify(connectionsObject));
  }
}
import { Injectable } from '@angular/core';
import {Connection} from "../../datatypes/connection";
import {Storage} from '@ionic/storage';
import {SettingsService} from "../settings/settings.service";

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  private connectionsStorageKey: string = "connections";

  constructor(private storage: Storage,
              private settingsService: SettingsService) { }

  public async getUsbConnection() {
    return {
      autoConnect: await this.settingsService.getUsbAutoConnect(),
      index: undefined,
      id: "usb",
      name: "USB",
      host: "127.0.0.1",
      port: await this.settingsService.getUsbPort(),
      ssl: await this.settingsService.getUsbUseSsl(),
      usbConnection: true,
      token: undefined
    }
  }

  public async getConnections(): Promise<Connection[]> {
    const connectionsData = await this.storage.get(this.connectionsStorageKey);
    if (connectionsData === undefined || connectionsData === null) {
      return [];
    }

    const connections = JSON.parse(connectionsData).sort((a: Connection, b: Connection) => (a.index ?? 0) - (b.index ?? 0));
    console.log(connections);
    return connections;
  }

  public async saveConnections(connections: Connection[]) {
    await this.storage.set(this.connectionsStorageKey, JSON.stringify(connections));
  }

  public async addUpdateConnection(connection: Connection) {
    const connectionsData = await this.storage.get(this.connectionsStorageKey);
    let connectionsObject = JSON.parse(connectionsData) ?? [];

    if (!connection.id) {
      connection.id = `connection${Math.floor(Date.now() / 1000)}`;
      connection.index = connectionsObject.length;
      connectionsObject.push(connection);
    } else {
      const existingIndex = connectionsObject.findIndex((x: Connection) => x.id === connection.id);
      if (existingIndex > -1) {
        connectionsObject[existingIndex] = connection;
      } else {
        connectionsObject.push(connection);
      }
    }

    await this.saveConnections(connectionsObject);
  }

  public async deleteConnection(id: string) {
    const connectionsData = await this.storage.get(this.connectionsStorageKey);
    let connectionsObject:Connection[] = JSON.parse(connectionsData) ?? [];

    const existingIndex = connectionsObject.findIndex(x => x.id == id);
    if (existingIndex > -1) {
      connectionsObject.splice(existingIndex, 1);
    }

    await this.storage.set(this.connectionsStorageKey, JSON.stringify(connectionsObject));
  }
}
