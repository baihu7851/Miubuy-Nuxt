// =============================================
// useUpload — 圖片上傳封裝
// 使用原生 FormData 取代 vue-core-image-upload
// =============================================

export const useUpload = () => {
  const config = useRuntimeConfig()

  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)

  /**
   * 上傳圖片至伺服器
   * @param file 使用者選取的 File 物件
   * @returns 上傳後的圖片 URL
   */
  const uploadImage = async (file: File): Promise<string> => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('圖片大小不可超過 5MB')
    }

    const form = new FormData()
    form.append('file', file)

    isUploading.value = true
    uploadError.value = null

    try {
      const res = await $fetch<{ url: string }>(config.public.uploadUrl, {
        method: 'POST',
        body: form,
      })
      return res.url
    }
    catch (err) {
      uploadError.value = '圖片上傳失敗，請重試'
      console.error('圖片上傳失敗', err)
      throw err
    }
    finally {
      isUploading.value = false
    }
  }

  return {
    isUploading,
    uploadError,
    uploadImage,
  }
}
