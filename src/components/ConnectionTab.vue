<template>
  <div class="connection-tab">
    <div class="form-group">
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
    </div>

    <div class="form-group">
      <label>🔗 Connection String:</label>
      <input 
        type="text" 
        v-model="localConnectionString" 
        placeholder="Server=localhost;Database=MyDB;User Id=sa;Password=****;Trust Server Certificate=true"
        @blur="updateConnectionString"
        @keyup.enter="updateConnectionString"
      >
      <button 
        class="btn btn-secondary btn-small" 
        @click="testDatabaseConnection"
        :disabled="apiStore.loading"
      >
        {{ apiStore.loading ? '🔄 Đang test...' : 'Test Connection' }}
      </button>
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
          <p>{{ apiStore.isDatabaseConnected ? 'Đã kết nối' : 'Chưa kết nối' }}</p>
        </div>
      </div>
    </div>

    <div v-if="result.message" class="result" :class="result.type">
      <div v-html="result.message"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useApiStore } from '@/stores/api'

// Stores
const apiStore = useApiStore()

// State
const localApiUrl = ref(apiStore.apiUrl)
const localConnectionString = ref(apiStore.connectionString)
const result = ref({ message: '', type: 'info' })

// Watch store changes
watch(() => apiStore.apiUrl, (newVal) => {
  localApiUrl.value = newVal
})

watch(() => apiStore.connectionString, (newVal) => {
  localConnectionString.value = newVal
})

// Methods
const updateApiUrl = () => {
  if (localApiUrl.value !== apiStore.apiUrl) {
    apiStore.setApiUrl(localApiUrl.value)
  }
}

const updateConnectionString = () => {
  if (localConnectionString.value !== apiStore.connectionString) {
    apiStore.setConnectionString(localConnectionString.value)
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

const testDatabaseConnection = async () => {
  updateConnectionString()
  const response = await apiStore.testDatabaseConnection()
  result.value = {
    message: response.message,
    type: response.success ? 'success' : 'error'
  }
}

// Auto test backend connection on mount
onMounted(() => {
  testBackend()
})
</script>

<style scoped>
.connection-tab {
  max-width: 800px;
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

.form-group input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  margin-bottom: 10px;
}

.form-group input:focus {
  outline: none;
  border-color: #4facfe;
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(79, 172, 254, 0.1);
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

@media (max-width: 768px) {
  .status-cards {
    grid-template-columns: 1fr;
  }
}
</style>
