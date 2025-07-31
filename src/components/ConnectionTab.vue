<template>
  <div class="connection-tab">
    <!-- <div class="form-group">
      <label>🔗 Backend API URL:</label>
      <input 
        type="text" 
        v-model="localApiUrl" 
        placeholder="http://localhost:3000/api"
        @blur="updateApiUrl"
        @keyup.enter="updateApiUrl"
      >
      <button 
        class="btn btn-secondary btn-small" 
        @click="testBackend"
        :disabled="apiStore.loading"
      >
        {{ apiStore.loading ? '🔄 Đang test...' : 'Test Backend' }}
      </button>
    </div> -->

    <!-- Server Configuration -->
    <div class="form-group">
      <label>🖥️ SQL Server Configuration:</label>
      <div class="server-config">
        <div class="config-row">
          <div class="config-field">
            <label>Server:</label>
            <input 
              type="text" 
              v-model="localServerConfig.server"
              placeholder="192.168.1.217"
              @input="updateServerConfig"
            >
          </div>
          <div class="config-field">
            <label>Username:</label>
            <input 
              type="text" 
              v-model="localServerConfig.username"
              placeholder="sa"
              @input="updateServerConfig"
            >
          </div>
          <div class="config-field">
            <label>Password:</label>
            <input 
              type="password" 
              v-model="localServerConfig.password"
              placeholder="password"
              @input="updateServerConfig"
            >
          </div>
        </div>
        
        <div class="database-section">
          <button 
            class="btn btn-info btn-small" 
            @click="loadDatabases"
            :disabled="apiStore.loading || !apiStore.isBackendConnected"
          >
            {{ apiStore.loading ? '🔄 Loading...' : '📚 Load Databases' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Database Selection -->
    <div class="form-group" v-if="availableDatabases.length > 0">
      <label>🗄️ Select Database:</label>
      <div class="database-selector">
        <select 
          v-model="localServerConfig.database"
          @change="updateServerConfig"
          class="database-dropdown"
        >
          <option value="">-- Chọn Database --</option>
          <option 
            v-for="db in availableDatabases" 
            :key="db.name"
            :value="db.name"
          >
            {{ db.name }} ({{ db.status || 'ONLINE' }})
          </option>
        </select>
        
        <button 
          class="btn btn-secondary btn-small" 
          @click="testDatabaseConnection"
          :disabled="apiStore.loading || !localServerConfig.database"
        >
          {{ apiStore.loading ? '🔄 Testing...' : 'Test Connection' }}
        </button>
      </div>
      
      <!-- Database Info -->
      <div v-if="selectedDatabaseInfo" class="database-info">
        <h4>📋 Database Information:</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value">{{ selectedDatabaseInfo.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status:</span>
            <span class="info-value" :class="{ online: selectedDatabaseInfo.status === 'ONLINE' }">
              {{ selectedDatabaseInfo.status || 'ONLINE' }}
            </span>
          </div>
          <div class="info-item" v-if="selectedDatabaseInfo.created">
            <span class="info-label">Created:</span>
            <span class="info-value">{{ formatDate(selectedDatabaseInfo.created) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Database Selection -->
    <div class="form-group" v-if="popularDatabases.length > 0">
      <label>⚡ Quick Select:</label>
      <div class="quick-databases">
        <button 
          v-for="db in popularDatabases" 
          :key="db.name"
          class="btn btn-small quick-db-btn"
          :class="{ active: localServerConfig.database === db.name }"
          @click="selectDatabase(db.name)"
        >
          {{ db.name }}
        </button>
      </div>
    </div>

    <!-- Connection Status Cards -->
    <div class="status-cards">
      <div class="status-card" :class="{ connected: apiStore.isBackendConnected }">
        <div class="status-icon">🔗</div>
        <div class="status-info">
          <h3>Backend API</h3>
          <p>{{ apiStore.isBackendConnected ? 'Đã kết nối' : 'Chưa kết nối' }}</p>
        </div>
      </div>
      
      <div class="status-card" :class="{ connected: apiStore.isDatabaseConnected }">
        <div class="status-icon">🗄️</div>
        <div class="status-info">
          <h3>Database</h3>
          <p>{{ apiStore.isDatabaseConnected ? `Đã kết nối (${localServerConfig.database})` : 'Chưa kết nối' }}</p>
        </div>
      </div>
    </div>

    <!-- Connection String Preview (Optional) -->
    <div v-if="apiStore.isDatabaseConnected && maskedConnectionString" class="connection-preview">
      <h4>🔍 Connection String Preview:</h4>
      <div class="connection-string">
        {{ maskedConnectionString }}
      </div>
    </div>

    <div v-if="result.message" class="result" :class="result.type">
      <div v-html="result.message"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useApiStore } from '@/stores/api'

// Stores
const apiStore = useApiStore()

// State
const localApiUrl = ref(apiStore.apiUrl || 'http://localhost:3000/api')
const localServerConfig = ref({
  server: apiStore.serverConfig?.server || '192.168.1.217',
  username: apiStore.serverConfig?.username || '',
  password: apiStore.serverConfig?.password || '',
  database: apiStore.serverConfig?.database || ''
})
const result = ref({ message: '', type: 'info' })

// Computed - Safe property access
const availableDatabases = computed(() => {
  return apiStore.availableDatabases || []
})

const selectedDatabaseInfo = computed(() => {
  if (!localServerConfig.value.database) return null
  return availableDatabases.value.find(db => db.name === localServerConfig.value.database)
})

const popularDatabases = computed(() => {
  const popular = ['TEST_PL', 'DSC', 'DEMO', 'PHULAM', 'EKB', 'Leader']
  return availableDatabases.value.filter(db => 
    popular.includes(db.name)
  ).slice(0, 6)
})

const maskedConnectionString = computed(() => {
  if (!apiStore.connectionString) return ''
  return apiStore.connectionString.replace(/PWD=[^;]+/i, 'PWD=****')
})

// Watch store changes
watch(() => apiStore.apiUrl, (newVal) => {
  if (newVal) localApiUrl.value = newVal
})

watch(() => apiStore.serverConfig, (newVal) => {
  if (newVal) localServerConfig.value = { ...newVal }
}, { deep: true })

// Methods
const updateApiUrl = () => {
  if (localApiUrl.value !== apiStore.apiUrl) {
    apiStore.setApiUrl(localApiUrl.value)
  }
}

const updateServerConfig = () => {
  if (apiStore.setServerConfig) {
    apiStore.setServerConfig(localServerConfig.value)
  }
}

const testBackend = async () => {
  updateApiUrl()
  const response = await apiStore.testBackendConnection()
  result.value = {
    message: response.message,
    type: response.success ? 'success' : 'error'
  }
}

const loadDatabases = async () => {
  updateServerConfig()
  if (apiStore.listDatabases) {
    const response = await apiStore.listDatabases()
    result.value = {
      message: response.message,
      type: response.success ? 'success' : 'error'
    }
  } else {
    result.value = {
      message: 'List databases function not available',
      type: 'error'
    }
  }
}

const testDatabaseConnection = async () => {
  updateServerConfig()
  const response = await apiStore.testDatabaseConnection()
  result.value = {
    message: response.message,
    type: response.success ? 'success' : 'error'
  }
}

const selectDatabase = (dbName) => {
  localServerConfig.value.database = dbName
  updateServerConfig()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN')
  } catch {
    return dateStr
  }
}

// Auto test backend connection on mount
onMounted(async () => {
  console.log('🔄 ConnectionTab mounted')
  console.log('📊 API Store state:', {
    apiUrl: apiStore.apiUrl,
    isBackendConnected: apiStore.isBackendConnected,
    availableDatabases: apiStore.availableDatabases
  })
  
  await testBackend()
  
  // Auto load databases if backend is connected
  if (apiStore.isBackendConnected && apiStore.listDatabases) {
    await loadDatabases()
  }
})
</script>

<style scoped>
.connection-tab {
  max-width: 900px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  margin-bottom: 10px;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #4facfe;
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(79, 172, 254, 0.1);
}

.server-config {
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  padding: 20px;
}

.config-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.config-field label {
  font-size: 0.9rem;
  margin-bottom: 5px;
  color: #666;
}

.config-field input {
  margin-bottom: 0;
  padding: 10px;
}

.database-section {
  text-align: center;
}

.database-selector {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.database-dropdown {
  flex: 1;
  margin-bottom: 0;
}

.database-info {
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
}

.database-info h4 {
  margin: 0 0 10px 0;
  color: #1976d2;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.info-label {
  font-weight: 600;
  color: #666;
}

.info-value {
  color: #333;
}

.info-value.online {
  color: #28a745;
  font-weight: 600;
}

.quick-databases {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.quick-db-btn {
  background: #e9ecef;
  border: 1px solid #ced4da;
  transition: all 0.3s ease;
}

.quick-db-btn:hover {
  background: #4facfe;
  color: white;
}

.quick-db-btn.active {
  background: #4facfe;
  color: white;
  border-color: #4facfe;
}

.status-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 30px 0;
}

.status-card {
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.status-card.connected {
  border-color: #28a745;
  background: linear-gradient(135deg, #d4edda 0%, #f8f9fa 100%);
}

.status-icon {
  font-size: 2rem;
  opacity: 0.7;
}

.status-card.connected .status-icon {
  opacity: 1;
}

.status-info h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.status-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.status-card.connected .status-info p {
  color: #28a745;
  font-weight: 600;
}

.connection-preview {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
}

.connection-preview h4 {
  margin: 0 0 10px 0;
  color: #666;
}

.connection-string {
  font-family: monospace;
  font-size: 0.85rem;
  background: #e9ecef;
  padding: 10px;
  border-radius: 4px;
  word-break: break-all;
  color: #495057;
}

@media (max-width: 768px) {
  .config-row {
    grid-template-columns: 1fr;
  }
  
  .database-selector {
    flex-direction: column;
    align-items: stretch;
  }
  
  .status-cards {
    grid-template-columns: 1fr;
  }
  
  .quick-databases {
    flex-direction: column;
  }
}
</style>