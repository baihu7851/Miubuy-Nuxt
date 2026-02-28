import type { UserInfo, LoginPayload, SignupPayload } from '~/types'

// =============================================
// useAuth — 認證狀態集中管理
// 使用 useState 確保跨元件共享同一份狀態
// =============================================

export const useAuth = () => {
  const config = useRuntimeConfig()

  // 全域共享狀態
  const userInfo = useState<UserInfo | null>('auth:userInfo', () => null)
  const token = useState<string>('auth:token', () => '')
  const userId = useState<number>('auth:userId', () => 0)

  /** 是否已登入 */
  const isLoggedIn = computed(() => !!token.value)

  /**
   * 從 cookie 讀取 token，並從 localStorage 讀取 userId，
   * 初始化認證狀態（頁面載入時呼叫）
   */
  const initAuth = async (): Promise<void> => {
    if (import.meta.server) return

    const cookieToken = useCookie('userToken').value ?? ''
    const storedId = Number(localStorage.getItem('ID') ?? 0)

    if (!cookieToken || !storedId) return

    token.value = cookieToken
    userId.value = storedId

    await fetchUserInfo()
  }

  /**
   * 向 API 取得目前登入使用者的個人資料
   */
  const fetchUserInfo = async (): Promise<void> => {
    if (!token.value || !userId.value) return

    try {
      const data = await $fetch<UserInfo>(
        `${config.public.apiBase}/api/Users/${userId.value}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        },
      )
      userInfo.value = data
    }
    catch (err) {
      console.error('取得使用者資料失敗', err)
    }
  }

  /**
   * 登入
   * ☆ API endpoint：/api/Login（非 /api/Users/Login）
   * ☆ Content-Type 需為 application/x-www-form-urlencoded（與 Vue2 一致）
   * ☆ 回傳格式：{ token: string（小寫）, Id: number }
   * @param payload 帳號密碼
   */
  const login = async (payload: LoginPayload): Promise<void> => {
    // ☆ 使用 URLSearchParams 送出 form-encoded 格式
    const body = new URLSearchParams()
    body.append('Account', payload.Account)
    body.append('Password', payload.Password)

    const res = await $fetch<{ token: string, Id: number }>(
      `${config.public.apiBase}/api/Login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      },
    )

    // 儲存 token 到 cookie（7天）
    const tokenCookie = useCookie('userToken', { maxAge: 60 * 60 * 24 * 7 })
    tokenCookie.value = res.token

    // 儲存 userId 到 localStorage
    localStorage.setItem('ID', String(res.Id))

    token.value = res.token
    userId.value = res.Id

    await fetchUserInfo()
  }

  /**
   * 登出：清除 cookie、localStorage 及記憶體狀態
   */
  const logout = (): void => {
    const tokenCookie = useCookie('userToken')
    tokenCookie.value = null

    localStorage.removeItem('ID')

    token.value = ''
    userId.value = 0
    userInfo.value = null
  }

  /**
   * 註冊
   * @param payload 註冊資料
   */
  const signup = async (payload: SignupPayload): Promise<void> => {
    await $fetch(`${config.public.apiBase}/api/Users/Register`, {
      method: 'POST',
      body: payload,
    })
  }

  return {
    userInfo,
    token,
    userId,
    isLoggedIn,
    initAuth,
    fetchUserInfo,
    login,
    logout,
    signup,
  }
}