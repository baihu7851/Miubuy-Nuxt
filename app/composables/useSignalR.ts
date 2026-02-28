import * as signalR from '@microsoft/signalr'

//☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆
// useSignalR — SignalR 連線封裝
// 元件卸載時自動斷線，不用擔心記憶體洩漏 ★
//☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆

export const useSignalR = () => {
  const config = useRuntimeConfig()

  let connection: signalR.HubConnection | null = null

  // ☆ 目前的連線心跳
  /** 連線狀態 */
  const isConnected = ref(false)

  /**
   * ☆ 建立並啟動 SignalR 連線
   * @param token 使用者 JWT token（Hub 驗證用）
   */
  const connect = async (token: string): Promise<void> => {
    if (connection) return

    connection = new signalR.HubConnectionBuilder()
      .withUrl(config.public.signalrHub, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    // ☆ 斷線的時候...(´・ω・｀)
    connection.onclose(() => {
      isConnected.value = false
      console.warn('SignalR 連線已關閉')
    })

    // ☆ 重新連上了！ヽ(✿ﾟ▽ﾟ)ノ
    connection.onreconnected(() => {
      isConnected.value = true
      console.log('SignalR 重新連線成功')
    })

    try {
      await connection.start()
      isConnected.value = true
      console.log('SignalR 連線成功')
    }
    catch (err) {
      console.error('SignalR 連線失敗', err)
    }
  }

  /** ☆ 斷開 SignalR 連線，掰掰 (´・ω・｀) */
  const disconnect = async (): Promise<void> => {
    if (!connection) return
    try {
      await connection.stop()
    }
    catch (err) {
      console.error('SignalR 斷線失敗', err)
    }
    finally {
      connection = null
      isConnected.value = false
    }
  }

  /**
   * ☆ 監聽 Hub 事件
   * @param event 事件名稱
   * @param callback 收到訊息時的回呼
   */
  const on = (event: string, callback: (...args: any[]) => void): void => {
    connection?.on(event, callback)
  }

  /** ☆ 移除 Hub 事件監聽 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const off = (event: string): void => {
    connection?.off(event)
  }

  /**
   * ☆ 呼叫 Hub 方法（傳送訊息）
   * @param method Hub 方法名稱
   * @param args 傳入參數
   */
  const invoke = async (method: string, ...args: unknown[]): Promise<void> => {
    if (!connection || !isConnected.value) {
      console.error(`SignalR 尚未連線，無法呼叫 ${method}`)
      return
    }
    try {
      await connection.invoke(method, ...args)
    }
    catch (err) {
      console.error(`SignalR 呼叫 ${method} 失敗`, err)
    }
  }

  // ☆ 元件卸載時自動斷線，不用手動清理 (´ω｀)
  onUnmounted(async () => {
    await disconnect()
  })

  return {
    isConnected,
    connect,
    disconnect,
    on,
    off,
    invoke,
  }
}