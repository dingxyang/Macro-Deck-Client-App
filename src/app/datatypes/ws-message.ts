/** WebSocket 消息接口，封装消息来源与内容 */
export interface WsMessage {
  /** 消息来源标识 */
  source: string;
  /** 消息正文内容 */
  content: string;
}
