import { create } from 'zustand'
import { environment } from '../utils/environment'

export const useWeatherStore = create((set) => ({
  weatherData: [], // Giá trị mặc định là mảng rỗng
  getWeatherData: async () => {
    try {
      const response = await fetch(`${environment.BACKEND_URL}/data_cluster`)
      const data = await response.json()
      console.log(data)
      set(() => ({ weatherData: data || [] }))
    } catch (error) {
      console.error('Error fetching weather data:', error)
      set(() => ({ weatherData: [] }))
    }
  },
}))
