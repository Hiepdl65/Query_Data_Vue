import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useApiStore = defineStore('api', () => {
  // State
  const apiUrl = ref('http://localhost:3000/api')
  const connectionString = ref('Server=localhost;Database=TestDB;User Id=sa;Password=123456;Trust Server Certificate=true')
  const isBackendConnected = ref(false)
  const isDatabaseConnected = ref(false)
  const loading = ref(false)

  // Actions
  const makeRequest = async (endpoint, data = null, method = 'GET') => {
    const url = `${apiUrl.value}${endpoint}`
    const options = {
      method,
      url,
      headers: { 'Content-Type': 'application/json' }
    }

    if (data && method !== 'GET') {
      options.data = data
    }

    try {
      const response = await axios(options)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message)
    }
  }

  const testBackendConnection = async () => {
    loading.value = true
    try {
      await makeRequest('/health')
      isBackendConnected.value = true
      return { success: true, message: '✅ Backend đã sẵn sàng!' }
    } catch (error) {
      isBackendConnected.value = false
      return { success: false, message: `❌ Không thể kết nối backend: ${error.message}` }
    } finally {
      loading.value = false
    }
  }

  const testDatabaseConnection = async () => {
    if (!isBackendConnected.value) {
      return { success: false, message: '❌ Vui lòng kết nối backend trước' }
    }

    loading.value = true
    try {
      const result = await makeRequest('/test-connection', {
        connectionString: connectionString.value
      }, 'POST')

      isDatabaseConnected.value = true
      return {
        success: true,
        message: `✅ Database kết nối thành công!\nServer: ${result.serverInfo?.server}\nDatabase: ${result.serverInfo?.database}`,
        data: result
      }
    } catch (error) {
      isDatabaseConnected.value = false
      return { success: false, message: `❌ Kết nối database thất bại: ${error.message}` }
    } finally {
      loading.value = false
    }
  }

  const executeUpdate = async (updateData) => {
    if (!isBackendConnected.value || !isDatabaseConnected.value) {
      return { success: false, message: '❌ Vui lòng kết nối backend và database trước' }
    }

    try {
      const result = await makeRequest('/update', {
        connectionString: connectionString.value,
        ...updateData
      }, 'POST')

      return {
        success: true,
        message: '✅ Cập nhật thành công!',
        data: result
      }
    } catch (error) {
      return { success: false, message: `❌ Cập nhật thất bại: ${error.message}` }
    }
  }

  return {
    // State
    apiUrl,
    connectionString,
    isBackendConnected,
    isDatabaseConnected,
    loading,
    
    // Actions
    testBackendConnection,
    testDatabaseConnection,
    executeUpdate,
    makeRequest
  }
})
