import { create } from 'zustand'
import { environment } from '../utils/environment'

export const useWeatherStore = create((set) => ({
  weatherData: [], // Giá trị mặc định là mảng rỗng
  getWeatherData: async () => {
    try {
      const response = await fetch(`${environment.BACKEND_URL}/get-data-cluster`)
      const data = await response.json()
      set(() => ({ weatherData: data.data_cluster || [] }))
    } catch (error) {
      console.error('Error fetching weather data:', error)
      set(() => ({ weatherData: [] }))
    }
  },
}))
