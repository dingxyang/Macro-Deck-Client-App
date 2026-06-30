/** 快速设置二维码数据接口，包含通过二维码分享的 Macro Deck 服务器连接信息 */
export interface QuickSetupQrCodeData {
  /** Macro Deck 实例名称 */
  instanceName: string
  /** 服务器可用的网络接口地址列表 */
  networkInterfaces: string[]
  /** 服务器端口号 */
  port: number
  /** 是否启用 SSL 加密 */
  ssl: boolean,
  /** 认证令牌 */
  token: string
}
