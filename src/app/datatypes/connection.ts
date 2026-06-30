/** Macro Deck 服务器连接配置接口 */
export interface Connection {
  /** 连接唯一标识符 */
  id: string,
  /** 连接显示名称 */
  name: string,
  /** 服务器主机地址 */
  host: string,
  /** 服务器端口号 */
  port: number,
  /** 是否启用 SSL 加密连接 */
  ssl: boolean,
  /** 连接在列表中的排序索引 */
  index: number | undefined,
  /** 是否自动连接 */
  autoConnect: boolean | undefined,
  /** 是否使用 USB 连接 */
  usbConnection: boolean | undefined,
  /** 认证令牌 */
  token: string | undefined
}
