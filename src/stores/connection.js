import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useConnectionStore = defineStore('connection', () => {
  // State
  const apiUrl = ref('http://localhost:3000/api')
  const connectionString = ref('Server=localhost;Database=TestDB;User Id=sa;Password=123456;Trust Server Certificate=true')
  const isBackendConnected = ref(false)
  const isDatabaseConnected = ref(false)

  // Actions
  const updateApiUrl = (url) => {
    apiUrl.value = url.trim()
    isBackendConnected.value = false
  }

  const makeRequest = async (endpoint, data = null, method = 'GET') => {
    const url = `${apiUrl.value}${endpoint}`
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    }

    if (data && method !== 'GET') {
      options.data = data
    }

    const response = await axios(url, options)
    return response.data
  }

  const testBackendConnection = async () => {
    try {
      await makeRequest('/health')
      isBackendConnected.value = true
      return { success: true, message: '✅ Backend đã sẵn sàng!' }
    } catch (error) {
      isBackendConnected.value = false
      return { 
        success: false, 
        message: `❌ Không thể kết nối backend: ${error.message}` 
      }
    }
  }

  const testDatabaseConnection = async () => {
    if (!isBackendConnected.value) {
      return { 
        success: false, 
        message: '❌ Vui lòng kết nối backend trước' 
      }
    }

    if (!connectionString.value.trim()) {
      return { 
        success: false, 
        message: '❌ Vui lòng nhập connection string' 
      }
    }

    try {
      const result = await makeRequest('/test-connection', {
        connectionString: connectionString.value
      }, 'POST')

      isDatabaseConnected.value = true
      return {
        success: true,
        message: `✅ Database kết nối thành công!<br>
          Server: ${result.serverInfo.server}<br>
          Database: ${result.serverInfo.database}`,
        data: result
      }
    } catch (error) {
      isDatabaseConnected.value = false
      return {
        success: false,
        message: `❌ Kết nối database thất bại: ${error.message}`
      }
    }
  }

  const executeUpdate = async (updateData) => {
    if (!isBackendConnected.value || !isDatabaseConnected.value) {
      throw new Error('Vui lòng kết nối backend và database trước')
    }

    return await makeRequest('/update', {
      connectionString: connectionString.value.trim(),
      ...updateData
    }, 'POST')
  }

  return {
    // State
    apiUrl,
    connectionString,
    isBackendConnected,
    isDatabaseConnected,
    
    // Actions
    updateApiUrl,
    makeRequest,
    testBackendConnection,
    testDatabaseConnection,
    executeUpdate
  }
})