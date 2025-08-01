<template>
  <div class="batch-update-tab">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h2>📊 Batch Update từ danh sách</h2>
        <p>Thực hiện cập nhật hàng loạt từ danh sách điều kiện với template được chọn</p>
      </div>
      <div class="header-stats" v-if="batchStats.total > 0">
        <div class="stat-card">
          <span class="stat-number">{{ batchStats.total }}</span>
          <span class="stat-label">Tổng dòng</span>
        </div>
        <div class="stat-card">
          <span class="stat-number valid">{{ batchStats.valid }}</span>
          <span class="stat-label">Hợp lệ</span>
        </div>
        <div class="stat-card">
          <span class="stat-number invalid">{{ batchStats.invalid }}</span>
          <span class="stat-label">Lỗi</span>
        </div>
      </div>
    </div>

    <!-- Template Selection Card -->
    <div class="config-card">
      <div class="card-header">
        <h3>📋 Chọn Template</h3>
        <p>Chọn template để áp dụng cho batch update</p>
      </div>
      <div class="card-body">
        <div class="template-selector">
          <select v-model="selectedTemplateId" @change="onTemplateChange" class="template-select">
            <option value="">-- Chọn template --</option>
            <option 
              v-for="template in templatesStore.allTemplates" 
              :key="template.id"
              :value="template.id"
            >
              {{ template.name }}
            </option>
          </select>
          
          <!-- Template Info -->
          <div v-if="selectedTemplate" class="template-info">
            <div class="template-preview">
              <div class="preview-header">
                <span class="template-name">{{ selectedTemplate.name }}</span>
                <span class="template-id">{{ selectedTemplate.id }}</span>
              </div>
              <div class="template-details">
                <div class="detail-item">
                  <span class="detail-label">Table:</span>
                  <span class="detail-value">{{ selectedTemplate.table }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Column:</span>
                  <span class="detail-value">{{ selectedTemplate.column }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Value:</span>
                  <span class="detail-value">{{ selectedTemplate.defaultValue }}</span>
                </div>
              </div>
              <div class="template-example">
                <span class="example-label">Example SQL:</span>
                <code class="example-code">{{ selectedTemplate.example }}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Batch Data Input Card -->
    <div class="config-card">
      <div class="card-header">
        <div class="header-with-actions">
          <div>
            <h3>📝 Danh sách điều kiện</h3>
            <p>Nhập các điều kiện, mỗi dòng một bộ điều kiện</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" @click="clearBatchData" :disabled="!batchConditions.trim()">
              🗑️ Xóa
            </button>
            <button class="btn btn-outline" @click="showSampleData" :disabled="!selectedTemplate">
              📄 Ví dụ
            </button>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="input-section">
          <div class="input-wrapper">
            <textarea 
              v-model="batchConditions"
              @input="validateBatchData"
              rows="12" 
              class="batch-textarea"
              :class="{ 'has-error': batchStats.invalid > 0, 'has-data': batchConditions.trim() }"
              :placeholder="placeholderText"
            ></textarea>
            
            <!-- Input Footer -->
            <div class="input-footer" v-if="batchConditions.trim()">
              <div class="line-count">
                <span class="count-info">
                  {{ batchStats.total }} dòng • 
                  <span class="valid-count">{{ batchStats.valid }} hợp lệ</span>
                  <span v-if="batchStats.invalid > 0" class="invalid-count"> • {{ batchStats.invalid }} lỗi</span>
                </span>
              </div>
              
              <!-- Format Help -->
              <div class="format-help" v-if="selectedTemplate">
                <span class="help-label">Format:</span>
                <code class="format-example">{{ formatExample }}</code>
              </div>
            </div>
          </div>
          
          <!-- Validation Messages -->
          <div v-if="validationErrors.length > 0" class="validation-errors">
            <div class="error-header">
              <span class="error-icon">⚠️</span>
              <span class="error-title">Phát hiện {{ validationErrors.length }} lỗi:</span>
            </div>
            <ul class="error-list">
              <li v-for="error in validationErrors.slice(0, 5)" :key="error.line" class="error-item">
                <span class="error-line">Dòng {{ error.line }}:</span>
                <span class="error-message">{{ error.message }}</span>
              </li>
              <li v-if="validationErrors.length > 5" class="error-item more">
                và {{ validationErrors.length - 5 }} lỗi khác...
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Execution Section -->
    <div class="execution-section">
      <div class="execution-card" :class="{ 'ready': canExecute, 'disabled': !canExecute }">
        <div class="execution-header">
          <div class="execution-info">
            <h3>🚀 Thực hiện Batch Update</h3>
            <p v-if="canExecute">Sẵn sàng thực hiện {{ batchStats.valid }} operations</p>
            <p v-else class="warning">{{ getExecutionWarning() }}</p>
          </div>
          
          <div class="execution-status">
            <div class="status-checks">
              <div class="check-item" :class="{ valid: selectedTemplateId }">
                <span class="check-icon">{{ selectedTemplateId ? '✅' : '❌' }}</span>
                <span class="check-text">Template đã chọn</span>
              </div>
              <div class="check-item" :class="{ valid: batchStats.valid > 0 }">
                <span class="check-icon">{{ batchStats.valid > 0 ? '✅' : '❌' }}</span>
                <span class="check-text">Dữ liệu hợp lệ ({{ batchStats.valid }})</span>
              </div>
              <div class="check-item" :class="{ valid: apiStore.connectionStatus.ready }">
                <span class="check-icon">{{ apiStore.connectionStatus.ready ? '✅' : '❌' }}</span>
                <span class="check-text">Kết nối database</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="execution-actions">
          <button 
            class="btn btn-primary btn-large"
            :class="{ 
              'btn-success': canExecute && !isExecuting,
              'btn-loading': isExecuting,
              'btn-disabled': !canExecute
            }"
            :disabled="!canExecute || isExecuting"
            @click="executeBatchUpdate"
          >
            <span class="btn-icon">
              <span v-if="isExecuting" class="loading-spinner">🔄</span>
              <span v-else-if="canExecute">🚀</span>
              <span v-else>⚠️</span>
            </span>
            <span class="btn-text">
              {{ getExecutionButtonText() }}
            </span>
          </button>
          
          <!-- Progress Bar -->
          <div v-if="isExecuting && executionProgress.total > 0" class="progress-section">
            <div class="progress-info">
              <span class="progress-text">
                Đang xử lý {{ executionProgress.current }}/{{ executionProgress.total }}
              </span>
              <span class="progress-percent">
                {{ Math.round((executionProgress.current / executionProgress.total) * 100) }}%
              </span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: (executionProgress.current / executionProgress.total) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="result" class="results-section">
      <div class="result-card" :class="result.type">
        <div class="result-header">
          <span class="result-icon">
            {{ result.type === 'success' ? '✅' : result.type === 'error' ? '❌' : 'ℹ️' }}
          </span>
          <h3 class="result-title">
            {{ result.type === 'success' ? 'Hoàn thành!' : result.type === 'error' ? 'Có lỗi xảy ra' : 'Thông tin' }}
          </h3>
        </div>
        <div class="result-content">
          <div v-html="result.message"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTemplatesStore } from '@/stores/templates.js'
import { useApiStore } from '@/stores/api.js'

const templatesStore = useTemplatesStore()
const apiStore = useApiStore()

// Form data
const selectedTemplateId = ref('')
const batchConditions = ref('')
const result = ref(null)
const isExecuting = ref(false)
const validationErrors = ref([])
const executionProgress = ref({ current: 0, total: 0 })

// Computed
const selectedTemplate = computed(() => 
  templatesStore.templateById(selectedTemplateId.value)
)

const placeholderText = computed(() => {
  if (!selectedTemplate.value) {
    return "Vui lòng chọn template trước khi nhập dữ liệu..."
  }
  
  return `Ví dụ với template ${selectedTemplate.value.name}:
A331,220506002
A342,210129003
B224,210222005,0002

Format: value1,value2,value3 (theo thứ tự điều kiện trong template)

Mỗi dòng là một bộ điều kiện riêng biệt.`
})

const formatExample = computed(() => {
  if (!selectedTemplate.value) return ''
  
  const placeholders = (selectedTemplate.value.whereTemplate.match(/{(\w+)}/g) || [])
    .map(p => p.replace(/[{}]/g, ''))
  
  return placeholders.join(',')
})

const batchStats = computed(() => {
  if (!batchConditions.value.trim()) {
    return { total: 0, valid: 0, invalid: 0 }
  }
  
  const lines = batchConditions.value.split('\n').filter(line => line.trim())
  const validLines = lines.filter(line => {
    const values = line.split(',').map(v => v.trim())
    return values.length > 0 && values.every(v => v)
  })
  
  return {
    total: lines.length,
    valid: validLines.length,
    invalid: lines.length - validLines.length
  }
})

const canExecute = computed(() => 
  selectedTemplateId.value && 
  batchStats.value.valid > 0 && 
  apiStore.connectionStatus.ready &&
  !isExecuting.value
)

// Methods
const onTemplateChange = () => {
  result.value = null
  if (batchConditions.value.trim()) {
    validateBatchData()
  }
}

const validateBatchData = () => {
  validationErrors.value = []
  
  if (!selectedTemplate.value || !batchConditions.value.trim()) return
  
  const lines = batchConditions.value.split('\n').filter(line => line.trim())
  const expectedParams = (selectedTemplate.value.whereTemplate.match(/{(\w+)}/g) || []).length
  
  lines.forEach((line, index) => {
    const values = line.split(',').map(v => v.trim())
    
    if (values.length !== expectedParams) {
      validationErrors.value.push({
        line: index + 1,
        message: `Cần ${expectedParams} tham số, nhưng có ${values.length}`
      })
    } else if (values.some(v => !v)) {
      validationErrors.value.push({
        line: index + 1,
        message: 'Có tham số trống'
      })
    }
  })
}

const clearBatchData = () => {
  batchConditions.value = ''
  validationErrors.value = []
  result.value = null
}

const showSampleData = () => {
  if (!selectedTemplate.value) return
  
  const sampleData = {
    'PURMI07': 'A331,220506002\nA342,210129003\nB224,210222005',
    'PURMI09': 'A342,210129003\nB331,220304001',
    'COPMI07': 'B224,210222005,0002\nC331,220401001,0001'
  }
  
  batchConditions.value = sampleData[selectedTemplate.value.id] || 'param1,param2\nparam3,param4'
  validateBatchData()
}

const getExecutionWarning = () => {
  if (!selectedTemplateId.value) return 'Chưa chọn template'
  if (batchStats.value.valid === 0) return 'Chưa có dữ liệu hợp lệ'
  if (!apiStore.connectionStatus.ready) return 'Chưa kết nối database'
  return 'Chưa sẵn sàng'
}

const getExecutionButtonText = () => {
  if (isExecuting.value) return 'Đang thực hiện...'
  if (!canExecute.value) return getExecutionWarning()
  return `Thực hiện ${batchStats.value.valid} operations`
}

const executeBatchUpdate = async () => {
  if (!canExecute.value) return

  const template = selectedTemplate.value
  isExecuting.value = true
  result.value = null
  
  const lines = batchConditions.value.split('\n').filter(line => line.trim())
  const validLines = lines.filter(line => {
    const values = line.split(',').map(v => v.trim())
    return values.length > 0 && values.every(v => v)
  })
  
  executionProgress.value = { current: 0, total: validLines.length }
  
  const results = []
  let successCount = 0
  let errorCount = 0

  try {
    for (let i = 0; i < validLines.length; i++) {
      const line = validLines[i].trim()
      const values = line.split(',').map(v => v.trim())
      
      executionProgress.value.current = i + 1
      
      try {
        // Build WHERE condition from template
        let whereCondition = template.whereTemplate
        const placeholders = whereCondition.match(/{(\w+)}/g) || []
        
        placeholders.forEach((placeholder, index) => {
          const value = values[index] || ''
          whereCondition = whereCondition.replace(placeholder, value)
        })

        const response = await apiStore.executeUpdate({
          tableName: template.table,
          columnName: template.column,
          newValue: template.defaultValue,
          whereCondition: whereCondition,
          dataType: 'string'
        })

        if (response.success) {
          results.push(`✅ ${values.join(',')} → ${response.data.rowsAffected} rows updated`)
          successCount++
        } else {
          results.push(`❌ ${values.join(',')} → ${response.message}`)
          errorCount++
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        results.push(`❌ ${values.join(',')} → ${error.message}`)
        errorCount++
      }
    }

    result.value = {
      type: successCount > errorCount ? 'success' : 'error',
      message: `
        <div class="batch-result-summary">
          <div class="summary-stats">
            <div class="summary-item success">
              <span class="summary-number">${successCount}</span>
              <span class="summary-label">Thành công</span>
            </div>
            <div class="summary-item error">
              <span class="summary-number">${errorCount}</span>
              <span class="summary-label">Thất bại</span>
            </div>
            <div class="summary-item total">
              <span class="summary-number">${validLines.length}</span>
              <span class="summary-label">Tổng cộng</span>
            </div>
          </div>
          <div class="result-details">
            ${results.slice(0, 10).join('<br>')}
            ${results.length > 10 ? `<br><em>... và ${results.length - 10} kết quả khác</em>` : ''}
          </div>
        </div>
      `
    }

  } catch (error) {
    result.value = {
      type: 'error',
      message: `❌ Batch update thất bại: ${error.message}`
    }
  } finally {
    isExecuting.value = false
    executionProgress.value = { current: 0, total: 0 }
  }
}

// Watch for validation when data changes
watch(batchConditions, validateBatchData, { debounce: 300 })
</script>

<style scoped>
.batch-update-tab {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.header-content h2 {
  margin: 0 0 8px 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
}

.header-content p {
  margin: 0;
  font-size: 1rem;
  color: #6b7280;
}

.header-stats {
  display: flex;
  gap: 12px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  text-align: center;
  min-width: 80px;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-number.valid {
  color: #10b981;
}

.stat-number.invalid {
  color: #ef4444;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}

/* Card Styles */
.config-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%);
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h3 {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.card-header p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.card-body {
  padding: 24px;
}

/* Template Selector */
.template-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #fafafa;
}

.template-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.template-info {
  margin-top: 16px;
}

.template-preview {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.template-name {
  font-weight: 600;
  color: #1f2937;
}

.template-id {
  font-size: 0.75rem;
  background: #e5e7eb;
  color: #6b7280;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
}

.template-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  color: #1f2937;
  font-weight: 600;
  font-family: monospace;
}

.template-example {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.example-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.example-code {
  display: block;
  background: #1f2937;
  color: #e5e7eb;
  padding: 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  word-break: break-all;
}

/* Batch Input */
.input-wrapper {
  position: relative;
}

.batch-textarea {
  width: 100%;
  min-height: 300px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  background: #fafafa;
  transition: all 0.2s ease;
}

.batch-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.batch-textarea.has-data {
  background: white;
}

.batch-textarea.has-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 0.8rem;
}

.valid-count {
  color: #10b981;
  font-weight: 600;
}

.invalid-count {
  color: #ef4444;
  font-weight: 600;
}

.format-help {
  display: flex;
  align-items: center;
  gap: 8px;
}

.format-example {
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
}

/* Validation Errors */
.validation-errors {
  margin-top: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.error-title {
  font-weight: 600;
  color: #991b1b;
}

.error-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.error-item {
  margin-bottom: 4px;
  font-size: 0.8rem;
}

.error-line {
  color: #991b1b;
  font-weight: 600;
}

.error-message {
  color: #b91c1c;
}

/* Execution Section */
.execution-section {
  margin-top: 32px;
}

.execution-card {
  background: white;
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s ease;
}

.execution-card.ready {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%);
}

.execution-card.disabled {
  opacity: 0.6;
}

.execution-header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.execution-info h3 {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.execution-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.execution-info p.warning {
  color: #d97706;
  font-weight: 500;
}

.status-checks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.check-item.valid .check-text {
  color: #10b981;
  font-weight: 500;
}

.execution-actions {
  padding: 0 24px 24px;
}

.btn-large {
  width: 100%;
  padding: 16px 24px;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-loading {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.btn-disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.progress-section {
  margin-top: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Results Section */
.results-section {
  margin-top: 24px;
}

.result-card {
  border-radius: 12px;
  padding: 20px;
  border: 1px solid;
}

.result-card.success {
  background: #ecfdf5;
  border-color: #10b981;
  color: #065f46;
}

.result-card.error {
  background: #fef2f2;
  border-color: #ef4444;
  color: #991b1b;
}

.result-card.info {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1e40af;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.result-icon {
  font-size: 1.5rem;
}

.result-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.result-content :deep(.batch-result-summary) {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-content :deep(.summary-stats) {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.result-content :deep(.summary-item) {
  text-align: center;
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.result-content :deep(.summary-number) {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}

.result-content :deep(.summary-label) {
  display: block;
  font-size: 0.8rem;
  opacity: 0.8;
  margin-top: 2px;
}

.result-content :deep(.summary-item.success .summary-number) {
  color: #10b981;
}

.result-content :deep(.summary-item.error .summary-number) {
  color: #ef4444;
}

.result-content :deep(.result-details) {
  background: rgba(255, 255, 255, 0.3);
  padding: 12px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  background: white;
}

.btn-outline {
  border-color: #d1d5db;
  color: #6b7280;
}

.btn-outline:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .batch-update-tab {
    gap: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-stats {
    justify-content: center;
  }
  
  .card-header, .card-body {
    padding: 16px 20px;
  }
  
  .header-with-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: flex-end;
  }
  
  .batch-textarea {
    min-height: 200px;
    font-size: 0.8rem;
  }
  
  .template-details {
    grid-template-columns: 1fr;
  }
  
  .execution-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .status-checks {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .input-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .result-content :deep(.summary-stats) {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .stat-card {
    min-width: 60px;
    padding: 8px 12px;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .batch-textarea {
    padding: 12px;
    font-size: 0.75rem;
  }
  
  .btn-large {
    padding: 12px 20px;
    font-size: 1rem;
  }
  
  .execution-header {
    padding: 16px;
  }
  
  .execution-actions {
    padding: 0 16px 16px;
  }
}
</style>