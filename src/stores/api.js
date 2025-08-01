import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useApiStore = defineStore('api', () => {
  // Connection State
  const apiUrl = ref('http://localhost:3000/api')
  
  // Server configuration - NO DEFAULT CREDENTIALS
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
  const connectionString = computed(() => {
    if (!serverConfig.value.server || !serverConfig.value.username || !serverConfig.value.password) {
      return ''
    }
    return `DRIVER={ODBC Driver 18 for SQL Server};SERVER=${serverConfig.value.server};DATABASE=${serverConfig.value.database};UID=${serverConfig.value.username};PWD=${serverConfig.value.password};TrustServerCertificate=yes;`
  })

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
    console.log('🔧 Server config updated:', {
      server: config.server,
      username: config.username,
      password: config.password ? '***' : '',
      database: config.database
    })
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
      return { success: true, message: '✅ Backend connected successfully!' }
    } catch (error) {
      console.error('❌ Backend connection failed:', error)
      isBackendConnected.value = false
      return { success: false, message: `❌ Cannot connect to backend: ${error.message}` }
    } finally {
      loading.value = false
    }
  }

  const listDatabases = async () => {
    if (!isBackendConnected.value) {
      return { success: false, message: '❌ Please connect to backend first' }
    }

    // Validate required credentials
    if (!serverConfig.value.server || !serverConfig.value.username || !serverConfig.value.password) {
      return { success: false, message: '❌ Please provide server address, username, and password' }
    }

    loading.value = true
    try {
      console.log('🔄 Listing databases...')
      console.log('📡 Using credentials:', {
        server: serverConfig.value.server,
        username: serverConfig.value.username,
        password: '***'
      })
      
      const result = await makeRequest('/list-databases', {
        server: serverConfig.value.server,
        username: serverConfig.value.username,
        password: serverConfig.value.password
      }, 'POST')

      availableDatabases.value = result.databases || []
      console.log('✅ Databases loaded:', availableDatabases.value.length)
      return {
        success: true,
        message: `✅ Found ${result.count} databases on server ${serverConfig.value.server}`,
        databases: result.databases
      }
    } catch (error) {
      console.error('❌ Failed to list databases:', error)
      availableDatabases.value = []
      return { success: false, message: `❌ Cannot list databases: ${error.message}` }
    } finally {
      loading.value = false
    }
  }

  const testDatabaseConnection = async () => {
    if (!isBackendConnected.value) {
      return { success: false, message: '❌ Please connect to backend first' }
    }

    // Validate all required fields
    if (!serverConfig.value.server || !serverConfig.value.username || 
        !serverConfig.value.password || !serverConfig.value.database) {
      return { success: false, message: '❌ Please provide all connection details: server, username, password, and database' }
    }

    loading.value = true
    try {
      console.log('🔄 Testing database connection...')
      console.log('📡 Connection details:', {
        server: serverConfig.value.server,
        database: serverConfig.value.database,
        username: serverConfig.value.username,
        password: '***'
      })
      
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
        message: `✅ Database ${serverConfig.value.database} connected successfully!\n` +
                `Server: ${result.serverInfo?.server || serverConfig.value.server}\n` +
                `User: ${result.serverInfo?.currentUser || serverConfig.value.username}\n` +
                `Tables: ${result.serverInfo?.tableCount || 'N/A'}`,
        data: result
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      isDatabaseConnected.value = false
      return { success: false, message: `❌ Database connection failed: ${error.message}` }
    } finally {
      loading.value = false
    }
  }

  const executeUpdate = async (updateData) => {
    if (!connectionStatus.value.ready) {
      return { success: false, message: '❌ Please connect to backend and database first' }
    }

    if (!connectionString.value) {
      return { success: false, message: '❌ Invalid connection string. Please check credentials.' }
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
        message: '✅ Update successful!',
        data: result
      }
    } catch (error) {
      console.error('❌ Update failed:', error)
      return { success: false, message: `❌ Update failed: ${error.message}` }
    } finally {
      loading.value = false
    }
  }

  // Validation helper
  const validateCredentials = () => {
    const { server, username, password } = serverConfig.value
    return {
      isValid: !!(server && username && password),
      missing: [
        !server && 'server address',
        !username && 'username', 
        !password && 'password'
      ].filter(Boolean)
    }
  }
  const executeCustomQuery = async (queryData) => {
    if (!connectionStatus.value.ready) {
      return { success: false, message: '❌ Please connect to backend and database first' }
    }

    if (!connectionString.value) {
      return { success: false, message: '❌ Invalid connection string. Please check credentials.' }
    }

    loading.value = true
    try {
      console.log('🔄 Executing custom query:', queryData)
      const result = await makeRequest('/query', {
        connectionString: connectionString.value,
        ...queryData
      }, 'POST')

      console.log('✅ Query executed successfully')
      return {
        success: true,
        message: '✅ Query successful!',
        data: result
      }
    } catch (error) {
      console.error('❌ Query failed:', error)
      return { success: false, message: `❌ Query failed: ${error.message}` }
    } finally {
      loading.value = false
    }
  }

  const exportQueryToExcel = async (exportData) => {
    if (!connectionStatus.value.ready) {
      throw new Error('Please connect to backend and database first')
    }

    if (!connectionString.value) {
      throw new Error('Invalid connection string. Please check credentials.')
    }

    try {
      console.log('🔄 Exporting query to Excel:', exportData)
      
      const response = await axios({
        method: 'POST',
        url: `${apiUrl.value}/export-excel`,
        data: {
          connectionString: connectionString.value,
          ...exportData
        },
        responseType: 'blob',
        timeout: 60000 // 60 second timeout for large exports
      })

      // Create download link
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${exportData.filename || 'query_results'}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log('✅ Excel exported successfully')
      return { success: true, message: '✅ Excel exported successfully!' }
    } catch (error) {
      console.error('❌ Excel export failed:', error)
      throw new Error(`Excel export failed: ${error.message}`)
    }
  }

  const getTablesInfo = async () => {
    if (!connectionStatus.value.ready) {
      return { success: false, message: '❌ Please connect to backend and database first' }
    }

    if (!connectionString.value) {
      return { success: false, message: '❌ Invalid connection string. Please check credentials.' }
    }

    try {
      console.log('🔄 Getting tables info...')
      const result = await makeRequest('/tables-info', {
        connectionString: connectionString.value
      }, 'POST')

      console.log('✅ Tables info retrieved successfully')
      return {
        success: true,
        message: '✅ Tables info retrieved!',
        data: result
      }
    } catch (error) {
      console.error('❌ Failed to get tables info:', error)
      return { success: false, message: `❌ Failed to get tables info: ${error.message}` }
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
    executeCustomQuery,
    exportQueryToExcel,
    getTablesInfo,
    makeRequest,
    validateCredentials
  }
})