import { create } from 'zustand'
import { environment } from '../utils/environment'

export const useCentroidsStore = create((set) => ({
  centroids: [], // Giá trị mặc định là mảng rỗng
  loading: false, // Trạng thái đang tải
  error: null, // Trạng thái lỗi

  // Lấy dữ liệu centroids từ API
  getCentroids: async () => {
    set(() => ({ loading: true, error: null })) // Bắt đầu tải dữ liệu
    try {
      const response = await fetch(`${environment.BACKEND_URL}/get_centroids`)
      const data = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        set(() => ({ centroids: data, loading: false })) // Cập nhật centroids và hoàn tất tải
      } else {
        throw new Error('Invalid centroids data.')
      }
    } catch (error) {
      console.error('Error fetching centroids data:', error)
      set(() => ({ centroids: [], loading: false, error: error.message })) // Đặt trạng thái lỗi
    }
  },

  // Đặt lại trạng thái centroids
  resetCentroids: () => set(() => ({ centroids: [], loading: false, error: null })),
}))
