// =============================================
// 全域型別定義
// =============================================

/** 使用者基本資訊 */
export interface UserInfo {
  id: number
  account: string
  nickname: string
  email: string
  phone: string
  picture: string | null
}

/** 登入請求 */
export interface LoginPayload {
  Account: string
  Password: string
}

/** 註冊請求 */
export interface SignupPayload {
  Account: string
  Password: string
  RePassword: string
  Photo: string
}

/** API 通用回傳格式 */
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success?: boolean
}

/** 國家 / 地區 */
export interface Country {
  Id: number
  Name: string
}

export interface County {
  Id: number
  Name: string
  CountryId: number
}

export interface City {
  Id: number
  Name: string
  CountyId: number
}

/** 聊天室標籤 */
export interface RoomTag {
  Id: number
  Name: string
  Color: string
}

/** 聊天室資訊 */
export interface RoomInfo {
  Id: number
  Name: string
  Picture: string
  Rule: string
  roomStart: string
  MaxUsers: number
  TagId: number
  TagName: string
  TagColor: string
  CountryId: number
  CountyId: number
  CityId: number
  HostId: number
  OnlineCount: number
}

/** 訂單明細項目 */
export interface OrderItem {
  Id: number
  Title: string
  Price: number
  Checked: boolean
}

/** 結帳收件人資料 */
export interface CheckoutPersonal {
  Name: string
  Phone: string
  Address: string
  Email: string
  Payment: number
  Deliver: number
}

/** 評價 */
export interface Review {
  Id: number
  Star: number
  Comment: string
  UserName: string
  UserPhoto: string
  CreatedAt: string
}
