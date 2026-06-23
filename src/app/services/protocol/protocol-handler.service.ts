import {Injectable} from '@angular/core';
import {Protocol2Service} from "./protocol2.service";
import {WebSocketSubject} from "rxjs/internal/observable/dom/WebSocketSubject";

/** 协议处理器服务，根据协议版本分发消息到对应的协议处理服务 */
@Injectable({
    providedIn: 'root'
})
export class ProtocolHandlerService {

    /** 当前使用的协议版本，默认为 2 */
    protocolVersion: number = 2;

    constructor(private protocol2Service: Protocol2Service) {
    }

    /**
     * 处理从服务器接收到的消息
     * 根据协议版本分发给对应的协议服务处理
     * @param message 服务器消息对象
     */
    async handleMessage(message: any) {
        switch (this.protocolVersion) {
            case 2:
                await this.protocol2Service.handleMessage(message);
                break;
        }
    }

    /**
     * 设置 WebSocket 主题对象，传递给协议服务以发送消息
     * @param socket WebSocket 主题对象
     */
    setWebsocketSubject(socket: WebSocketSubject<any>) {
        this.protocol2Service.setWebsocketSubject(socket);
    }
}
import {Injectable} from '@angular/core';
import {Protocol2Service} from "./protocol2.service";
import {WebSocketSubject} from "rxjs/internal/observable/dom/WebSocketSubject";

@Injectable({
    providedIn: 'root'
})
export class ProtocolHandlerService {

    // Will be updated later
    protocolVersion: number = 2;

    constructor(private protocol2Service: Protocol2Service) {
    }

    async handleMessage(message: any) {
        switch (this.protocolVersion) {
            case 2:
                await this.protocol2Service.handleMessage(message);
                break;
        }
    }

    setWebsocketSubject(socket: WebSocketSubject<any>) {
        this.protocol2Service.setWebsocketSubject(socket);
    }
}
