import {Injectable} from '@angular/core';
import {MacroDeckService} from "../macro-deck/macro-deck.service";
import {Protocol2Messages} from "../../datatypes/protocol2/protocol2-messages";
import {WebSocketSubject} from "rxjs/internal/observable/dom/WebSocketSubject";
import {Protocol2Button} from "../../datatypes/protocol2/protocol2-button";
import {Widget} from "../../datatypes/widgets/widget";
import {ButtonWidget} from "../../datatypes/widgets/button-widget";
import {WidgetContentType} from "../../enums/widget-content-type";
import {WidgetInteraction} from "../../datatypes/widgets/widget-interaction";
import {WidgetInteractionType} from "../../enums/widget-interaction-type";
import {LoadingService} from "../loading/loading.service";
import {NavigationService} from "../navigation/navigation.service";
import {NavigationDestination} from "../../enums/navigation-destination";

/** 协议2服务，处理 Macro Deck 协议版本2的消息解析、微件映射和交互发送 */
@Injectable({
    providedIn: 'root'
})
export class Protocol2Service {

    /** 是否已收到初始配置 */
    private initialConfigReceived = false;

    /** WebSocket 主题对象，用于向服务器发送消息 */
    private socket: WebSocketSubject<any> | undefined;

    constructor(private macroDeckService: MacroDeckService,
                private loadingService: LoadingService,
                private navigationService: NavigationService) {
        // 订阅用户交互事件，转换为协议消息发送给服务器
        macroDeckService.interaction.subscribe(interaction => {
            this.handleInteraction(interaction);
        })
    }

    /**
     * 处理从服务器接收到的协议消息
     * 支持 GET_CONFIG、GET_BUTTONS、UPDATE_BUTTON、UPDATE_LABEL 四种消息类型
     * @param message 服务器消息对象
     */
    async handleMessage(message: any) {
        if (!message.Method) {
            return;
        }

        switch (message.Method) {
            case "GET_CONFIG":
                // 收到配置消息：更新面板配置，首次收到时导航到面板页面
                this.macroDeckService.setConfig(message);
                if (!this.initialConfigReceived) {
                    this.initialConfigReceived = true;
                    await this.navigationService.navigateTo(NavigationDestination.Deck);
                    await this.loadingService.dismiss();
                }
                // 配置更新后请求按钮数据
                this.send(Protocol2Messages.getGetButtonsMessage());
                break;
            case "GET_BUTTONS":
                // 收到按钮列表：在收到初始配置后才处理
                if (!this.initialConfigReceived) {
                    return;
                }
                // 将协议按钮数据映射为内部微件模型
                let widgets: Widget[] = message.Buttons.map((button: Protocol2Button) => {
                    return this.mapProtocol2ButtonToWidget(button);
                });
                this.macroDeckService.setWidgets(widgets);
                break;
            case "UPDATE_BUTTON":
                // 收到按钮更新：仅更新单个按钮的完整数据
                if (!this.initialConfigReceived) {
                    return;
                }
                let widget = this.mapProtocol2ButtonToWidget(message.Buttons[0]);
                this.macroDeckService.updateWidget(widget);
                break;
            case "UPDATE_LABEL":
                // 收到标签更新：仅更新按钮的标签文本
                if (!this.initialConfigReceived) {
                    return;
                }
                let receivedButton = message.Buttons[0] as Protocol2Button;
                // 根据坐标查找已有微件
                let existingWidget = this.macroDeckService.widgets.find(x => x.row === receivedButton.Position_Y
                    && x.column === receivedButton.Position_X);
                if (existingWidget === undefined) {
                    return;
                }
                // 更新微件的标签数据
                let existingWidgetContent = existingWidget?.widgetContent as ButtonWidget;
                existingWidgetContent.labelBase64 = receivedButton.LabelBase64;
                this.macroDeckService.updateWidget(existingWidget);
                break;
        }
    }

    /**
     * 设置 WebSocket 主题对象并重置初始配置状态
     * @param socket WebSocket 主题对象
     */
    setWebsocketSubject(socket: WebSocketSubject<any>) {
        this.initialConfigReceived = false;
        this.socket = socket;
    }

    /**
     * 将协议2按钮数据映射为内部微件模型
     * @param button 协议2按钮数据
     * @returns 映射后的微件对象
     */
    private mapProtocol2ButtonToWidget(button: Protocol2Button): Widget {
        let buttonWidget: ButtonWidget = {
            iconBase64: button.IconBase64,
            labelBase64: button.LabelBase64,
        }
        return {
            backgroundColorHex: button.BackgroundColorHex,
            colSpan: 1,
            column: button.Position_X,
            row: button.Position_Y,
            rowSpan: 1,
            widgetContentType: WidgetContentType.button,
            widgetContent: buttonWidget
        }
    }

    /**
     * 通过 WebSocket 发送消息载荷
     * @param payload 要发送的消息对象
     */
    private send(payload: any) {
        this.socket?.next(payload);
    }

    /**
     * 处理用户交互事件，将交互类型转换为协议方法名并发送给服务器
     * @param interaction 微件交互数据
     */
    private handleInteraction(interaction: WidgetInteraction) {
        let method: String | undefined;
        // 将交互类型枚举映射为协议方法字符串
        switch (interaction.widgetInteractionType) {
            case WidgetInteractionType.ButtonPress:
                method = "BUTTON_PRESS";
                break;
            case WidgetInteractionType.ButtonShortPressRelease:
                method = "BUTTON_RELEASE";
                break;
            case WidgetInteractionType.ButtonLongPress:
                method = "BUTTON_LONG_PRESS";
                break;
            case WidgetInteractionType.ButtonLongPressRelease:
                method = "BUTTON_LONG_PRESS_RELEASE";
                break;
        }
      this.send({
        "Method": method,
        "Message": `${interaction.widget.row}_${interaction.widget.column}`
      });
    }
}
