<template>
  <div class="connection-tab">
    <!-- Connection Steps Progress -->
    <div class="connection-steps">
      <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
        <div class="step-icon">🔐</div>
        <div class="step-text">Server Credentials</div>
      </div>
      <div class="step-connector" :class="{ active: currentStep > 1 }"></div>
      <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
        <div class="step-icon">📚</div>
        <div class="step-text">Load Database</div>
      </div>
      <div class="step-connector" :class="{ active: currentStep > 2 }"></div>
      <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
        <div class="step-icon">✅</div>
        <div class="step-text">Connected</div>
      </div>
    </div>

    <!-- Step 1: Server Configuration -->
    <div class="config-card" v-show="currentStep >= 1">
      <div class="card-header">
        <h3>🖥️ SQL Server Configuration</h3>
        <div class="step-badge">Step 1</div>
      </div>
      
      <div class="config-form">
        <div class="form-row">
          <div class="form-field">
            <label for="server">Server Address</label>
            <div class="input-group">
              <div class="input-icon">🌐</div>
              <input 
                id="server"
                type="text" 
                v-model="localServerConfig.server"
                placeholder="192.168.1.217"
                @input="validateStep1"
                :class="{ error: showValidation && !localServerConfig.server }"
              >
            </div>
            <div class="field-hint">IP address or server name</div>
          </div>
          
          <div class="form-field">
            <label for="username">Username</label>
            <div class="input-group">
              <div class="input-icon">👤</div>
              <input 
                id="username"
                type="text" 
                v-model="localServerConfig.username"
                placeholder="sa"
                @input="validateStep1"
                :class="{ error: showValidation && !localServerConfig.username }"
                autocomplete="username"
              >
            </div>
            <div class="field-hint">SQL Server login username</div>
          </div>
          
          <div class="form-field">
            <label for="password">Password</label>
            <div class="input-group">
              <div class="input-icon">🔑</div>
              <input 
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="localServerConfig.password"
                placeholder="Enter password"
                @input="validateStep1"
                :class="{ error: showValidation && !localServerConfig.password }"
                autocomplete="current-password"
              >
              <button 
                type="button" 
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div class="field-hint">SQL Server login password</div>
          </div>
        </div>

        <div class="form-actions">
          <button 
            class="btn btn-primary"
            @click="proceedToStep2"
            :disabled="!canProceedStep1 || apiStore.loading"
          >
            <span v-if="apiStore.loading">🔄 Connecting...</span>
            <span v-else>📚 Load Databases</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Database Selection -->
    <div class="config-card" v-show="currentStep >= 2">
      <div class="card-header">
        <h3>🗄️ Database Selection</h3>
        <div class="step-badge">Step 2</div>
      </div>

      <div class="database-grid" v-if="availableDatabases.length > 0">
        <div class="database-selector">
          <label for="database">Choose Database</label>
          <select 
            id="database"
            v-model="localServerConfig.database"
            @change="validateStep2"
            class="database-dropdown"
          >
            <option value="">-- Select Database --</option>
            <option 
              v-for="db in availableDatabases" 
              :key="db.name"
              :value="db.name"
            >
              {{ db.name }} {{ db.status ? `(${db.status})` : '' }}
            </option>
          </select>
        </div>



        <!-- Database Info Card -->
        <div v-if="selectedDatabaseInfo" class="database-info-card">
          <h4>📋 Database Details</h4>
          <div class="info-items">
            <div class="info-item">
              <span class="label">Name:</span>
              <span class="value">{{ selectedDatabaseInfo.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">Status:</span>
              <span class="value status" :class="selectedDatabaseInfo.status?.toLowerCase()">
                {{ selectedDatabaseInfo.status || 'ONLINE' }}
              </span>
            </div>
            <div class="info-item" v-if="selectedDatabaseInfo.created">
              <span class="label">Created:</span>
              <span class="value">{{ formatDate(selectedDatabaseInfo.created) }}</span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button 
            class="btn btn-secondary"
            @click="goBackToStep1"
          >
            ← Back to Credentials
          </button>
          <button 
            class="btn btn-primary"
            @click="testConnection"
            :disabled="!canProceedStep2 || apiStore.loading"
          >
            <span v-if="apiStore.loading">🔄 Testing...</span>
            <span v-else>🚀 Test Connection</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="apiStore.loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading databases from server...</p>
      </div>

      <!-- No Databases Found -->
      <div v-else class="empty-state">
        <div class="empty-icon">📂</div>
        <h4>No Databases Found</h4>
        <p>Please check your server credentials and try again.</p>
        <button class="btn btn-secondary" @click="goBackToStep1">
          ← Back to Credentials
        </button>
      </div>
    </div>

    <!-- Connection Status Dashboard -->
    <div class="status-dashboard">
      <div class="status-card" :class="connectionStatus.backend">
        <div class="status-header">
          <div class="status-icon">🔗</div>
          <div class="status-info">
            <h4>Backend API</h4>
            <p class="status-text">{{ getStatusText('backend') }}</p>
          </div>
        </div>
        <div class="status-indicator" :class="connectionStatus.backend"></div>
      </div>
      
      <div class="status-card" :class="connectionStatus.database">
        <div class="status-header">
          <div class="status-icon">🗄️</div>
          <div class="status-info">
            <h4>Database</h4>
            <p class="status-text">{{ getStatusText('database') }}</p>
            <p v-if="apiStore.isDatabaseConnected" class="server-details">
              {{ localServerConfig.server }} → {{ localServerConfig.database }}
            </p>
          </div>
        </div>
        <div class="status-indicator" :class="connectionStatus.database"></div>
      </div>
    </div>

    <!-- Result Messages -->
    <div v-if="result.message" class="result-card" :class="result.type">
      <div class="result-icon">
        {{ result.type === 'success' ? '✅' : result.type === 'error' ? '❌' : 'ℹ️' }}
      </div>
      <div class="result-content" v-html="result.message"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useApiStore } from '@/stores/api'

// Stores
const apiStore = useApiStore()

// State
const currentStep = ref(1)
const showPassword = ref(false)
const showValidation = ref(false)

const localServerConfig = ref({
  server: '192.168.1.217',
  username: '',
  password: '',
  database: ''
})

const result = ref({ message: '', type: 'info' })

// Computed
const availableDatabases = computed(() => apiStore.availableDatabases || [])

const selectedDatabaseInfo = computed(() => {
  if (!localServerConfig.value.database) return null
  return availableDatabases.value.find(db => db.name === localServerConfig.value.database)
})

const canProceedStep1 = computed(() => {
  return localServerConfig.value.server && 
         localServerConfig.value.username && 
         localServerConfig.value.password
})

const canProceedStep2 = computed(() => {
  return localServerConfig.value.database
})

const connectionStatus = computed(() => ({
  backend: apiStore.isBackendConnected ? 'connected' : 'disconnected',
  database: apiStore.isDatabaseConnected ? 'connected' : 'disconnected'
}))

// Methods
const validateStep1 = () => {
  showValidation.value = true
  updateServerConfig()
}

const validateStep2 = () => {
  updateServerConfig()
}

const updateServerConfig = () => {
  if (apiStore.setServerConfig) {
    apiStore.setServerConfig(localServerConfig.value)
  }
}

const proceedToStep2 = async () => {
  if (!canProceedStep1.value) {
    showValidation.value = true
    return
  }

  updateServerConfig()
  
  // Test backend first
  const backendResponse = await apiStore.testBackendConnection()
  if (!backendResponse.success) {
    result.value = {
      message: backendResponse.message,
      type: 'error'
    }
    return
  }

  // Load databases
  const dbResponse = await apiStore.listDatabases()
  result.value = {
    message: dbResponse.message,
    type: dbResponse.success ? 'success' : 'error'
  }

  if (dbResponse.success) {
    currentStep.value = 2
  }
}

const testConnection = async () => {
  if (!canProceedStep2.value) return

  updateServerConfig()
  const response = await apiStore.testDatabaseConnection()
  result.value = {
    message: response.message,
    type: response.success ? 'success' : 'error'
  }

  if (response.success) {
    currentStep.value = 3
  }
}

const selectDatabase = (dbName) => {
  localServerConfig.value.database = dbName
  validateStep2()
}

const goBackToStep1 = () => {
  currentStep.value = 1
  result.value = { message: '', type: 'info' }
}

const getStatusText = (type) => {
  if (type === 'backend') {
    return apiStore.isBackendConnected ? 'Connected' : 'Disconnected'
  } else {
    return apiStore.isDatabaseConnected ? 'Connected' : 'Disconnected'
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN')
  } catch {
    return dateStr
  }
}

// Auto-advance steps based on connection status
watch(() => apiStore.isDatabaseConnected, (connected) => {
  if (connected) {
    currentStep.value = 3
  }
})

// Auto test backend on mount
onMounted(async () => {
  await apiStore.testBackendConnection()
})
</script>

<style scoped>
.connection-tab {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* Connection Steps Progress */
.connection-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  padding: 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-radius: 15px;
  transition: all 0.3s ease;
  opacity: 0.5;
}

.step.active {
  opacity: 1;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  transform: scale(1.05);
}

.step.completed {
  opacity: 0.8;
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
  color: white;
}

.step-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.step-text {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.step-connector {
  flex: 1;
  height: 4px;
  background: #e1e5e9;
  border-radius: 2px;
  transition: all 0.3s ease;
  margin: 0 10px;
}

.step-connector.active {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

/* Config Cards */
.config-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #e1e5e9;
}

.card-header h3 {
  margin: 0;
  color: #4facfe;
  font-size: 1.4rem;
}

.step-badge {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* Form Styling */
.config-form {
  padding: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 25px;
  margin-bottom: 30px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 15px;
  z-index: 2;
  font-size: 16px;
  opacity: 0.7;
}

.input-group input {
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.input-group input:focus {
  outline: none;
  border-color: #4facfe;
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.15);
}

.input-group input.error {
  border-color: #dc3545;
  background: #fff5f5;
}

.password-toggle {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.password-toggle:hover {
  opacity: 1;
}

.field-hint {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

/* Database Section */
.database-grid {
  padding: 30px;
}

.database-selector {
  margin-bottom: 25px;
}

.database-selector label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.database-dropdown {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 14px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.database-dropdown:focus {
  outline: none;
  border-color: #4facfe;
  background: white;
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.15);
}

.database-info-card {
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
  border: 2px solid #bbdefb;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
}

.database-info-card h4 {
  margin: 0 0 15px 0;
  color: #1976d2;
}

.info-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-weight: 600;
  color: #666;
}

.info-item .value {
  color: #333;
  font-weight: 500;
}

.info-item .value.status.online {
  color: #28a745;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(79, 172, 254, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Status Dashboard */
.status-dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.status-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 3px solid #e1e5e9;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.status-card.connected {
  border-color: #28a745;
  background: linear-gradient(135deg, #d4edda 0%, #f8f9fa 100%);
}

.status-card.connected::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #28a745 0%, #a8e6cf 100%);
}

.status-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-icon {
  font-size: 32px;
  opacity: 0.7;
}

.status-card.connected .status-icon {
  opacity: 1;
}

.status-info h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 16px;
}

.status-text {
  margin: 0;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.status-card.connected .status-text {
  color: #28a745;
  font-weight: 600;
}

.server-details {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #666;
  font-family: monospace;
}

.status-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #dc3545;
}

.status-indicator.connected {
  background: #28a745;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
}

/* States */
.loading-state, .empty-state {
  text-align: center;
  padding: 60px 30px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-state h4 {
  color: #666;
  margin-bottom: 10px;
}

.empty-state p {
  color: #999;
  margin-bottom: 20px;
}

/* Result Card */
.result-card {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 20px;
  border: 2px solid;
}

.result-card.success {
  background: linear-gradient(135deg, #d4edda 0%, #f8f9fa 100%);
  border-color: #c3e6cb;
  color: #155724;
}

.result-card.error {
  background: linear-gradient(135deg, #f8d7da 0%, #f8f9fa 100%);
  border-color: #f5c6cb;
  color: #721c24;
}

.result-card.info {
  background: linear-gradient(135deg, #d1ecf1 0%, #f8f9fa 100%);
  border-color: #bee5eb;
  color: #0c5460;
}

.result-icon {
  font-size: 24px;
  margin-top: 2px;
}

.result-content {
  flex: 1;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
  
  .connection-steps {
    padding: 15px;
  }
  
  .step-text {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .connection-tab {
    padding: 15px;
  }
  
  .connection-steps {
    flex-direction: column;
    gap: 15px;
  }
  
  .step-connector {
    width: 4px;
    height: 30px;
    margin: 0;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .status-dashboard {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .card-header {
    padding: 20px;
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .config-form, .database-grid {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .connection-tab {
    padding: 10px;
  }
  
  .step {
    padding: 15px 10px;
  }
  
  .step-icon {
    font-size: 20px;
  }
  
  .step-text {
    font-size: 11px;
  }
  
  .input-group input {
    padding: 12px 12px 12px 40px;
  }
  
  .btn {
    padding: 10px 20px;
    font-size: 13px;
  }
  
  .status-card {
    padding: 20px;
  }
  
  .status-icon {
    font-size: 24px;
  }
}
</style>