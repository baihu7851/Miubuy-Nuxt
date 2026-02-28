import type { Country, County, City } from '~/types'

// =============================================
// useArea — 地區資料邏輯
// 封裝國家 / 縣市 / 城市的串聯查詢
// JP 的 CountryId = 2，TW 的 CountryId = 3
// =============================================

export const useArea = () => {
  const config = useRuntimeConfig()

  const countries     = ref<Country[]>([])
  const counties      = ref<County[]>([])
  const cities        = ref<City[]>([])

  const selectedCountyId = ref<number | ''>('')
  const selectedCityId   = ref<number | ''>('')

  /** 目前選取城市的在線房間數 */
  const onlineCount = computed<number | string>(() => {
    if (!selectedCityId.value) return '( ^ω^ )'
    const found = cities.value.find(c => c.Id === selectedCityId.value) as (City & { Count?: number }) | undefined
    return found?.Count ?? '( ^ω^ )'
  })

  /**
   * 取得所有國家（含各國在線房間總數）
   */
  const fetchCountries = async (): Promise<void> => {
    try {
      countries.value = await $fetch<Country[]>(`${config.public.apiBase}/api/Countries`)
    }
    catch (err) {
      console.error('取得國家列表失敗', err)
    }
  }

  /**
   * 依 countryId 取得縣/都道府縣列表
   * @param countryId 國家 ID
   */
  const fetchCounties = async (countryId: number): Promise<void> => {
    try {
      counties.value = await $fetch<County[]>(`${config.public.apiBase}/api/Counties/${countryId}`)
      cities.value = []
      selectedCityId.value = ''
    }
    catch (err) {
      console.error('取得縣市列表失敗', err)
    }
  }

  /**
   * 依 countyId 取得城市列表
   * @param countyId 縣 ID
   */
  const fetchCities = async (countyId: number): Promise<void> => {
    try {
      cities.value = await $fetch<City[]>(`${config.public.apiBase}/api/Cities/${countyId}`)
      selectedCityId.value = ''
    }
    catch (err) {
      console.error('取得城市列表失敗', err)
    }
  }

  /**
   * 將選取的地區資訊存入 sessionStorage 並跳轉至聊天室列表
   * @param countryId 國家 ID
   */
  const saveAndNavigate = (countryId: number): void => {
    sessionStorage.setItem('prefecture', String(selectedCountyId.value))
    sessionStorage.setItem('city', String(selectedCityId.value))
    sessionStorage.setItem('Countries', String(countryId))
    navigateTo('/chatroom')
  }

  return {
    countries,
    counties,
    cities,
    selectedCountyId,
    selectedCityId,
    onlineCount,
    fetchCountries,
    fetchCounties,
    fetchCities,
    saveAndNavigate,
  }
}
