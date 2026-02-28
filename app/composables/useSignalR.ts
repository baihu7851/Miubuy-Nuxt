import { hubConnection } from 'signalr-asp-net'

//☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆
// useSignalR — 舊版 ASP.NET SignalR 連線封裝
// signalr-asp-net で繋いでる（Core じゃないよ）★
//☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆

//☆=========== TODO: 後端升級時須處理 ===========☆
// 後端換成 ASP.NET Core SignalR 後，照下面改：
//
// ① 套件
//    移除：signalr-asp-net
//    @microsoft/signalr 已安裝，不用重裝
//
// ② import 替換
//    移除：import { hubConnection } from 'signalr-asp-net'
//    改為：import * as signalR from '@microsoft/signalr'
//    移除底下兩行 HubProxy / HubConn 型別宣告
//
// ③ connect() 替換
//    移除 query string 拼接（token 改用 header）
//    移除 hubConnection() / createHubProxy()
//    改為：
//      connection = new signalR.HubConnectionBuilder()
//        .withUrl(config.public.signalrHub, {
//          accessTokenFactory: () => token,
//        })
//        .withAutomaticReconnect()
//        .configureLogging(signalR.LogLevel.Warning)
//        .build()
//    斷線改為 connection.onclose(...)
//    重連改為 connection.onreconnected(...)
//    啟動改為 await connection.start()（移除 .done/.fail 包裝）
//
// ④ disconnect() 替換
//    conn.stop() 改為 await connection.stop()
//    移除 proxy 相關變數
//
// ⑤ on() 替換
//    proxy?.on(...) 改為 connection?.on(...)
//    移除 void (null as unknown as T) 補丁那行
//
// ⑥ off() 替換
//    proxy?.off(...) 改為 connection?.off(...)
//
// ⑦ invoke() 替換
//    移除 .done/.fail Promise 包裝
//    改為 await connection.invoke(method, ...args)
//
// ⑧ nuxt.config.ts
//    移除 optimizeDeps: { include: ['signalr-asp-net'] }
//☆================================================☆

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HubProxy = ReturnType<ReturnType<typeof hubConnection>['createHubProxy']>
type HubConn = ReturnType<typeof hubConnection>

// ☆ Hub 名稱與後端一致
const HUB_NAME = 'miuHub'

export const useSignalR = () => {
  const config = useRuntimeConfig()

  let conn: HubConn | null = null
  let proxy: HubProxy | null = null

  /** 連線狀態 */
  const isConnected = ref(false)

  /**
   * ☆ 建立並啟動 SignalR 連線
   * 舊版不支援 Authorization header，改用 query string 帶 token (´ω｀)
   * @param token 使用者 JWT token
   */
  const connect = async (_token: string): Promise<void> => {
    if (conn) return

    // ☆ 舊版 ASP.NET SignalR 不支援 header / query string 帶 token
    // Vue2 原版也未傳 token，後端由 cookie 驗證 (´ω｀)
    // TODO（升級時）：改用 accessTokenFactory: () => _token
    conn = hubConnection(config.public.signalrHub)
    proxy = conn.createHubProxy(HUB_NAME)

    // ☆ 斷線的時候...(´・ω・｀)
    conn.disconnected(() => {
      isConnected.value = false
      console.warn('SignalR 連線已關閉')
    })

    // ☆ 重新連上了！ヽ(✿ﾟ▽ﾟ)ノ
    conn.reconnected(() => {
      isConnected.value = true
      console.log('SignalR 重新連線成功')
    })

    conn.reconnecting(() => {
      console.warn('SignalR 重新連線中...')
    })

    // TODO（升級時移除）☆ 舊版走 .done/.fail，包成 Promise 相容 async/await
    return new Promise<void>((resolve, reject) => {
      conn!
        .start()
        .done(() => {
          isConnected.value = true
          console.log('SignalR 連線成功')
          resolve()
        })
        .fail((err: unknown) => {
          console.error('SignalR 連線失敗', err)
          conn = null
          proxy = null
          reject(err)
        })
    })
  }

  /** ☆ 斷開 SignalR 連線，掰掰 (´・ω・｀) */
  const disconnect = (): void => {
    if (!conn) return
    try {
      conn.stop()
    }
    catch (err) {
      console.error('SignalR 斷線失敗', err)
    }
    finally {
      conn = null
      proxy = null
      isConnected.value = false
    }
  }

  /**
   * ☆ 監聽 Hub 事件
   * 泛型 T 僅供呼叫端標注型別，舊版 proxy.on 不支援泛型
   * @param event    Hub Server 推送的事件名稱
   * @param callback 收到訊息時的回呼
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const on = <T = any>(event: string, callback: (...args: any[]) => void): void => {
    void (null as unknown as T) // TODO（升級時移除）☆ 保留泛型參數用的暫時補丁
    proxy?.on(event, callback)
  }

  /** ☆ 移除 Hub 事件監聽 */
  const off = (event: string): void => {
    proxy?.off(event)
  }

  /**
   * ☆ 呼叫 Hub 方法（傳送訊息）
   * @param method Hub 方法名稱
   * @param args   傳入參數
   */
  const invoke = async (method: string, ...args: unknown[]): Promise<void> => {
    if (!proxy || !isConnected.value) {
      console.error(`SignalR 尚未連線，無法呼叫 ${method}`)
      return
    }
    // TODO（升級時移除）☆ 舊版走 .done/.fail，包成 Promise 相容 async/await
    return new Promise<void>((resolve, reject) => {
      proxy!
        .invoke(method, ...args)
        .done(() => resolve())
        .fail((err: unknown) => {
          console.error(`SignalR 呼叫 ${method} 失敗`, err)
          reject(err)
        })
    })
  }

  // ☆ 元件卸載時自動斷線，不用手動清理 (´ω｀)
  onUnmounted(() => {
    disconnect()
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