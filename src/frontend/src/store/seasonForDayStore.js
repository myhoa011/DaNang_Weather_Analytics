const BASE_URL = 'http://localhost:8004/api'

// Hàm gọi API để dự đoán mùa từ dữ liệu thời tiết
export const predictSeasonForDay = async (weatherData) => {
  try {
    const response = await fetch(`${BASE_URL}/predict-season-for-day`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(weatherData), // Gửi dữ liệu thời tiết dạng JSON
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    return data // Trả về kết quả từ API
  } catch (error) {
    console.error('Error in predictSeasonForDay API:', error)
    throw error // Ném lỗi để xử lý tại nơi gọi hàm
  }
}
