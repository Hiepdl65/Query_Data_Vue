import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useApiStore = defineStore('api', () => {
  // Connection State
  const apiUrl = ref('http://localhost:3000/api')
  
  // Server configuration
  const serverConfig = ref({
    server: '192.168.1.217',
    username: '',
    password: '',
    database: ''
  })
  
  const availableDatabases = ref([])
  const isBackendConnected = ref(false)
  const isDatabaseConnected = ref(false)
  const loading = ref(false)

  // Computed connection string
  const connectionString = computed(() => 
    `DRIVER={ODBC Driver 18 for SQL Server};SERVER=${serverConfig.value.server};DATABASE=${serverConfig.value.database};UID=${serverConfig.value.username};PWD=${serverConfig.value.password};TrustServerCertificate=yes;`
  )

  // Connection Status
  const connectionStatus = computed(() => ({
    backend: isBackendConnected.value,
    database: isDatabaseConnected.value,
    ready: isBackendConnected.value && isDatabaseConnected.value
  }))

  // Actions
  const setApiUrl = (url) => {
    apiUrl.value = url.trim()
    isBackendConnected.value = false
  }

  const setConnectionString = (conn) => {
    // This method is kept for compatibility but not used
    isDatabaseConnected.value = false
  }

  const setServerConfig = (config) => {
    Object.assign(serverConfig.value, config)
    isDatabaseConnected.value = false
  }

  const makeRequest = async (endpoint, data = null, method = 'GET') => {
    const url = `${apiUrl.value}${endpoint}`
    const options = {
      method,
      url,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000 // 30 second timeout
    }

    if (data && method !== 'GET') {
      options.data = data
    }

    try {
      console.log(`🔄 Making ${method} request to: ${url}`)
      if (data) console.log('📤 Request data:', data)
      
      const response = await axios(options)
      console.log('✅ Response received:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Request failed:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        throw new Error(error.response.data?.message || error.message)
      } else if (error.request) {
        throw new Error('Network error: Cannot connect to backend server')
      } else {
        throw new Error(error.message)
      }
    }
  }

  const testBackendConnection = async () => {
    loading.value = true
    try {
      console.log('🔄 Testing backend connection...')
      await makeRequest('/health')
      isBackendConnected.value = true
      console.log('✅ Backend connected successfully')
      return { success: true, message: '✅ Backend đã sẵn sàng!' }
    } catch (error) {
      console.error('❌ Backend connection failed:', error)
      isBackendConnected.value = false
      return { success: false, message: `❌ Không thể kết nối backend: ${error.message}` }
    } finally {
      loading.value = false
    }
  }

  const listDatabases = async () => {
    if (!isBackendConnected.value) {
      return { success: false, message: '❌ Vui lòng kết nối backend trước' }
    }

    loading.value = true
    try {
      console.log('🔄 Listing databases...')
      const result = await makeRequest('/list-databases', {
        server: serverConfig.value.server,
        username: serverConfig.value.username,
        password: serverConfig.value.password
      }, 'POST')

      availableDatabases.value = result.databases || []
      console.log('✅ Databases loaded:', availableDatabases.value.length)
      return {
        success: true,
        message: `✅ Tìm thấy ${result.count} databases`,
        databases: result.databases
      }
    } catch (error) {
      console.error('❌ Failed to list databases:', error)
      return { success: false, message: `❌ Không thể lấy danh sách database: ${error.message}` }
    } finally {
      loading.value = false
    }
  }

  const testDatabaseConnection = async () => {
    if (!isBackendConnected.value) {
      return { success: false, message: '❌ Vui lòng kết nối backend trước' }
    }

    if (!serverConfig.value.database) {
      return { success: false, message: '❌ Vui lòng chọn database' }
    }

    loading.value = true
    try {
      console.log('🔄 Testing database connection...')
      console.log('📡 Server config:', serverConfig.value)
      
      const result = await makeRequest('/test-database-access', {
        server: serverConfig.value.server,
        database: serverConfig.value.database,
        username: serverConfig.value.username,
        password: serverConfig.value.password
      }, 'POST')

      isDatabaseConnected.value = true
      console.log('✅ Database connected successfully')
      return {
        success: true,
        message: `✅ Database ${serverConfig.value.database} kết nối thành công!\nServer: ${result.serverInfo?.server}\nTables: ${result.serverInfo?.tableCount}`,
        data: result
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      isDatabaseConnected.value = false
      return { success: false, message: `❌ Kết nối database thất bại: ${error.message}` }
    } finally {
      loading.value = false
    }
  }

  const executeUpdate = async (updateData) => {
    if (!connectionStatus.value.ready) {
      return { success: false, message: '❌ Vui lòng kết nối backend và database trước' }
    }

    loading.value = true
    try {
      console.log('🔄 Executing update:', updateData)
      const result = await makeRequest('/update', {
        connectionString: connectionString.value,
        ...updateData
      }, 'POST')

      console.log('✅ Update executed successfully')
      return {
        success: true,
        message: '✅ Cập nhật thành công!',
        data: result
      }
    } catch (error) {
      console.error('❌ Update failed:', error)
      return { success: false, message: `❌ Cập nhật thất bại: ${error.message}` }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    apiUrl,
    serverConfig,
    availableDatabases,
    connectionString,
    isBackendConnected,
    isDatabaseConnected,
    loading,
    connectionStatus,
    
    // Actions
    setApiUrl,
    setConnectionString,
    setServerConfig,
    listDatabases,
    testBackendConnection,
    testDatabaseConnection,
    executeUpdate,
    makeRequest
  }
})