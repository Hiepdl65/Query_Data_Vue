<template>
  <div class="batch-update-tab">
    <h2>📊 Batch Update từ danh sách</h2>
    
    <div class="form-group">
      <label>📋 Template:</label>
      <select v-model="selectedTemplateId" @change="onTemplateSelect">
        <option value="">-- Chọn template --</option>
        <option 
          v-for="template in templatesStore.allTemplates" 
          :key="template.id" 
          :value="template.id"
        >
          {{ template.name }}
        </option>
      </select>
    </div>

    <div v-if="selectedTemplate" class="template-info">
      <h3>📋 Thông tin Template: {{ selectedTemplate.name }}</h3>
      <div class="template-details">
        <div class="detail-row">
          <span class="label">🗄️ Bảng:</span>
          <span class="value">{{ selectedTemplate.table }}</span>
        </div>
        <div class="detail-row">
          <span class="label">📊 Cột:</span>
          <span class="value">{{ selectedTemplate.column }}</span>
        </div>
        <div class="detail-row">
          <span class="label">💾 Giá trị:</span>
          <span class="value">{{ selectedTemplate.defaultValue }}</span>
        </div>
        <div class="detail-row">
          <span class="label">🔍 Điều kiện:</span>
          <span class="value">{{ selectedTemplate.whereTemplate }}</span>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label>📝 Danh sách điều kiện (mỗi dòng 1 bộ điều kiện):</label>
      <textarea 
        v-model="batchConditions" 
        rows="12" 
        :placeholder="placeholderText"
        @input="updatePreview"
      ></textarea>
      <div class="batch-info">
        <div class="info-row">
          <span class="info-item">📄 Tổng: {{ totalLines }} dòng</span>
          <span class="info-item">✅ Hợp lệ: {{ validLines.length }} dòng</span>
          <span class="info-item" v-if="invalidLines.length > 0">❌ Lỗi: {{ invalidLines.length }} dòng</span>
        </div>
        <div class="help-text">
          <strong>Hướng dẫn:</strong> Mỗi dòng chứa các giá trị cách nhau bởi dấu phẩy, 
          theo thứ tự các điều kiện trong template WHERE clause.
        </div>
      </div>
    </div>

    <div v-if="invalidLines.length > 0" class="error-lines">
      <h4>❌ Dòng có lỗi:</h4>
      <div class="error-list">
        <div v-for="(line, index) in invalidLines.slice(0, 5)" :key="index" class="error-item">
          <span class="line-number">Dòng {{ line.lineNumber }}:</span>
          <span class="line-content">{{ line.content }}</span>
          <span class="error-reason">{{ line.error }}</span>
        </div>
        <div v-if="invalidLines.length > 5" class="more-errors">
          ... và {{ invalidLines.length - 5 }} dòng lỗi khác
        </div>
      </div>
    </div>

    <div v-if="validLines.length > 0" class="preview-section">
      <div class="preview-header">
        <span class="preview-title">🔍 Preview ({{ validLines.length }} câu lệnh hợp lệ):</span>
        <div class="preview-actions">
          <button class="btn btn-small" @click="exportSQL">
            📄 Export SQL
          </button>
          <button class="btn btn-small" @click="togglePreviewMode">
            {{ showFullPreview ? '📋 Thu gọn' : '📋 Xem tất cả' }}
          </button>
        </div>
      </div>
      <div class="batch-preview">
        <div 
          v-for="(sql, index) in previewSQLs" 
          :key="index"
          class="preview-line"
          :class="{ highlighted: index < 3 }"
        >
          <span class="line-number">{{ index + 1 }}:</span>
          <span class="preview-sql">{{ sql }}</span>
        </div>
        <div v-if="!showFullPreview && validLines.length > 10" class="more-lines">
          <button class="btn btn-small" @click="showFullPreview = true">
            📋 Hiển thị tất cả {{ validLines.length }} câu lệnh
          </button>
        </div>
      </div>
    </div>

    <div class="action-section">
      <button 
        class="btn execute-btn" 
        @click="executeBatchUpdate"
        :disabled="!canExecute"
        :class="{ 
          'btn-success': canExecute,
          'btn-warning': validLines.length > 0 && !apiStore.connectionStatus.ready 
        }"
      >
        <span v-if="apiStore.loading">🔄 Đang thực hiện...</span>
        <span v-else-if="!apiStore.connectionStatus.ready">⚠️ Chưa kết nối database</span>
        <span v-else-if="validLines.length === 0">📝 Chưa có dữ liệu hợp lệ</span>
        <span v-else>🚀 Thực hiện Batch Update ({{ validLines.length }} dòng)</span>
      </button>
      
      <div class="batch-summary">
        <div class="summary-item" :class="{ active: selectedTemplate }">
          {{ selectedTemplate ? '✅' : '❌' }} Template đã chọn
        </div>
        <div class="summary-item" :class="{ active: validLines.length > 0 }">
          {{ validLines.length > 0 ? '✅' : '❌' }} Dữ liệu hợp lệ ({{ validLines.length }})
        </div>
        <div class="summary-item" :class="{ active: apiStore.connectionStatus.ready }">
          {{ apiStore.connectionStatus.ready ? '✅' : '❌' }} Kết nối database
        </div>
      </div>
    </div>

    <div v-if="result.message" class="result" :class="result.type">
      <div v-html="result.message"></div>
    </div>

    <!-- Progress Modal -->
    <Teleport to="body">
      <div v-if="showProgress" class="modal-overlay">
        <div class="modal-content progress-modal">
          <h3>🔄 Đang thực hiện Batch Update</h3>
          <div class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${progressPercentage}%` }"
              ></div>
            </div>
            <div class="progress-text">{{ progressText }}</div>
          </div>
          <div class="progress-stats">
            <div class="stat-box success">
              <div class="stat-number">{{ successCount }}</div>
              <div class="stat-label">Thành công</div>
            </div>
            <div class="stat-box error">
              <div class="stat-number">{{ errorCount }}</div>
              <div class="stat-label">Lỗi</div>
            </div>
            <div class="stat-box total">
              <div class="stat-number">{{ successCount + errorCount }}</div>
              <div class="stat-label">Đã xử lý</div>
            </div>
          </div>
          <div class="current-operation">
            <strong>Đang xử lý:</strong> {{ currentOperation }}
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useApiStore } from '@/stores/api'
import { useTemplatesStore } from '@/stores/templates'

// Stores
const apiStore = useApiStore()
const templatesStore = useTemplatesStore()

// State
const selectedTemplateId = ref('')
const batchConditions = ref('')
const result = ref({ message: '', type: 'info' })
const showProgress = ref(false)
const showFullPreview = ref(false)
const progressPercentage = ref(0)
const progressText = ref('')
const currentOperation = ref('')
const successCount = ref(0)
const errorCount = ref(0)

// Computed
const selectedTemplate = computed(() => 
  templatesStore.templateById(selectedTemplateId.value)
)

const totalLines = computed(() => 
  batchConditions.value.split('\n').filter(line => line.trim()).length
)

const processedLines = computed(() => {
  if (!batchConditions.value.trim()) return []
  
  return batchConditions.value
    .split('\n')
    .map((line, index) => ({
      lineNumber: index + 1,
      content: line.trim(),
      values: line.trim().split(',').map(v => v.trim())
    }))
    .filter(line => line.content.length > 0)
})

const validLines = computed(() => {
  if (!selectedTemplate.value) return []
  
  const expectedParams = (selectedTemplate.value.whereTemplate.match(/{(\w+)}/g) || []).length
  
  return processedLines.value.filter(line => {
    return line.values.length >= expectedParams && 
           line.values.every(v => v.length > 0)
  })
})

const invalidLines = computed(() => {
  if (!selectedTemplate.value) return []
  
  const expectedParams = (selectedTemplate.value.whereTemplate.match(/{(\w+)}/g) || []).length
  
  return processedLines.value.filter(line => {
    if (line.values.length < expectedParams) {
      line.error = `Thiếu tham số (cần ${expectedParams}, có ${line.values.length})`
      return true
    }
    if (line.values.some(v => v.length === 0)) {
      line.error = 'Có tham số trống'
      return true
    }
    return false
  })
})

const previewSQLs = computed(() => {
  if (!selectedTemplate.value || validLines.value.length === 0) return []
  
  const template = selectedTemplate.value
  const linesToShow = showFullPreview.value ? validLines.value : validLines.value.slice(0, 10)
  
  return linesToShow.map(line => {
    let whereCondition = template.whereTemplate
    const placeholders = whereCondition.match(/{(\w+)}/g) || []
    
    placeholders.forEach((placeholder, index) => {
      const value = line.values[index] || ''
      whereCondition = whereCondition.replace(placeholder, value)
    })
    
    return `UPDATE ${template.table} SET ${template.column}='${template.defaultValue}' WHERE ${whereCondition}`
  })
})

const placeholderText = computed(() => {
  if (!selectedTemplate.value) {
    return 'Vui lòng chọn template trước...'
  }
  
  const template = selectedTemplate.value
  const placeholders = template.whereTemplate.match(/{(\w+)}/g) || []
  const paramNames = placeholders.map(p => p.replace(/[{}]/g, ''))
  
  const examples = {
    'PURMI07': ['A331,220506002', 'A342,210129003', 'B224,210222005'],
    'COPMI07': ['B224,210222005,0002', 'C123,220315001,0001', 'A456,220420003,0003'],
    'PURI08': ['A331,220223006,0001', 'B442,220315007,0002', 'C553,220420008,0003']
  }
  
  const templateExamples = examples[template.id] || [
    paramNames.map((_, i) => `value${i + 1}`).join(','),
    paramNames.map((_, i) => `example${i + 1}`).join(',')
  ]
  
  return `Ví dụ với template ${template.id}:
${templateExamples.join('\n')}

Format: ${paramNames.join(',')} (theo thứ tự điều kiện trong template)`
})

const canExecute = computed(() => 
  selectedTemplate.value && 
  validLines.value.length > 0 &&
  apiStore.connectionStatus.ready
)

// Methods
const onTemplateSelect = () => {
  batchConditions.value = ''
  result.value = { message: '', type: 'info' }
  showFullPreview.value = false
}

const updatePreview = () => {
  showFullPreview.value = false
}

const togglePreviewMode = () => {
  showFullPreview.value = !showFullPreview.value
}

const exportSQL = () => {
  if (previewSQLs.value.length === 0) return
  
  const allSQLs = validLines.value.map(line => {
    const template = selectedTemplate.value
    let whereCondition = template.whereTemplate
    const placeholders = whereCondition.match(/{(\w+)}/g) || []
    
    placeholders.forEach((placeholder, index) => {
      const value = line.values[index] || ''
      whereCondition = whereCondition.replace(placeholder, value)
    })
    
    return `UPDATE ${template.table} SET ${template.column}='${template.defaultValue}' WHERE ${whereCondition};`
  })
  
  const sqlContent = `-- Batch Update SQL Export\n-- Template: ${selectedTemplate.value.name}\n-- Generated: ${new Date().toLocaleString()}\n-- Total: ${allSQLs.length} statements\n\n${allSQLs.join('\n')}`
  
  const blob = new Blob([sqlContent], { type: 'text/sql' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `batch_update_${selectedTemplate.value.id}_${Date.now()}.sql`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  result.value = {
    message: `📄 Đã export ${allSQLs.length} câu lệnh SQL!`,
    type: 'info'
  }
}

const executeBatchUpdate = async () => {
  if (!canExecute.value) {
    result.value = {
      message: 'Vui lòng chọn template, nhập dữ liệu và kết nối database',
      type: 'error'
    }
    return
  }

  const template = selectedTemplate.value
  const lines = validLines.value
  const results = []
  
  successCount.value = 0
  errorCount.value = 0
  showProgress.value = true
  
  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      progressPercentage.value = ((i + 1) / lines.length) * 100
      progressText.value = `Đang xử lý ${i + 1}/${lines.length} (${Math.round(progressPercentage.value)}%)`
      currentOperation.value = `Dòng ${line.lineNumber}: ${line.content}`
      
      try {
        // Build WHERE condition from template
        let whereCondition = template.whereTemplate
        const placeholders = whereCondition.match(/{(\w+)}/g) || []
        
        placeholders.forEach((placeholder, index) => {
          const value = line.values[index] || ''
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
          results.push(`✅ Dòng ${line.lineNumber}: ${response.data.rowsAffected} bản ghi được cập nhật`)
          successCount.value++
        } else {
          results.push(`❌ Dòng ${line.lineNumber}: ${response.message}`)
          errorCount.value++
        }

      } catch (error) {
        results.push(`❌ Dòng ${line.lineNumber}: ${error.message}`)
        errorCount.value++
      }

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 150))
    }

    const totalProcessed = successCount.value + errorCount.value
    const successRate = Math.round((successCount.value / totalProcessed) * 100)

    result.value = {
      message: `
        <div class="batch-result-summary">
          <h4>📊 Batch Update Hoàn thành!</h4>
          <div class="summary-stats">
            <div class="stat-item success">
              <span class="stat-icon">✅</span>
              <span class="stat-text">Thành công: ${successCount.value}</span>
            </div>
            <div class="stat-item error">
              <span class="stat-icon">❌</span>
              <span class="stat-text">Lỗi: ${errorCount.value}</span>
            </div>
            <div class="stat-item total">
              <span class="stat-icon">📊</span>
              <span class="stat-text">Tổng cộng: ${totalProcessed} dòng</span>
            </div>
            <div class="stat-item rate">
              <span class="stat-icon">📈</span>
              <span class="stat-text">Tỷ lệ thành công: ${successRate}%</span>
            </div>
          </div>
          <details class="result-details">
            <summary><strong>Chi tiết kết quả (Click để xem)</strong></summary>
            <div class="results-list">
              ${results.join('<br>')}
            </div>
          </details>
        </div>
      `,
      type: successCount.value > errorCount.value ? 'success' : 'error'
    }

  } catch (error) {
    result.value = {
      message: `<strong>❌ Lỗi hệ thống:</strong><br>${error.message}`,
      type: 'error'
    }
  } finally {
    showProgress.value = false
    progressPercentage.value = 0
    progressText.value = ''
    currentOperation.value = ''
  }
}

// Watch for template selection from other tabs
watch(() => templatesStore.selectedTemplate, (template) => {
  if (template && template.id !== selectedTemplateId.value) {
    selectedTemplateId.value = template.id
    onTemplateSelect()
  }
})
</script>

<style scoped>
.batch-update-tab {
  max-width: 1200px;
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

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4facfe;
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(79, 172, 254, 0.1);
}

.form-group textarea {
  font-family: 'Courier New', monospace;
  resize: vertical;
  line-height: 1.4;
}

.template-info {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #e1e5e9;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.template-info h3 {
  color: #4facfe;
  margin-bottom: 15px;
}

.template-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.label {
  font-weight: 600;
  color: #666;
  min-width: 60px;
}

.value {
  font-family: 'Courier New', monospace;
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.batch-info {
  margin-top: 15px;
  padding: 15px;
  background: #e3f2fd;
  border-radius: 10px;
  border-left: 4px solid #4facfe;
}

.info-row {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.info-item {
  background: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
}

.help-text {
  font-size: 0.9rem;
  color: #666;
}

.error-lines {
  background: #f8d7da;
  border: 2px solid #f5c6cb;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
}

.error-lines h4 {
  color: #721c24;
  margin-bottom: 10px;
}

.error-list {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.error-item {
  margin-bottom: 8px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
}

.line-number {
  color: #dc3545;
  font-weight: bold;
  min-width: 70px;
}

.line-content {
  color: #495057;
  word-break: break-all;
}

.error-reason {
  color: #dc3545;
  font-size: 0.8rem;
  font-style: italic;
}

.more-errors {
  color: #721c24;
  font-style: italic;
  margin-top: 10px;
}

.preview-section {
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-title {
  font-weight: 600;
  color: #4facfe;
  font-size: 1.1rem;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.batch-preview {
  background: #2d3748;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  max-height: 400px;
  overflow-y: auto;
}

.preview-line {
  margin-bottom: 8px;
  padding: 4px 0;
  transition: background-color 0.3s ease;
}

.preview-line.highlighted {
  background: rgba(79, 172, 254, 0.1);
  border-radius: 4px;
  padding: 4px 8px;
}

.preview-line .line-number {
  color: #ffd700;
  margin-right: 10px;
  min-width: 40px;
  display: inline-block;
}

.preview-sql {
  color: #e2e8f0;
  word-break: break-all;
}

.more-lines {
  text-align: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-section {
  margin-bottom: 20px;
}

.execute-btn {
  width: 100%;
  font-size: 1.2rem;
  padding: 20px;
  border-radius: 15px;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.execute-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.execute-btn.btn-warning {
  background: linear-gradient(135deg, #ffc107 0%, #ff8c00 100%);
}

.batch-summary {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.summary-item {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.summary-item.active {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.progress-modal {
  background: white;
  padding: 30px;
  border-radius: 15px;
  min-width: 500px;
  max-width: 90vw;
  text-align: center;
}

.progress-modal h3 {
  color: #4facfe;
  margin-bottom: 20px;
}

.progress-container {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #e1e5e9;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  color: #666;
}

.progress-stats {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 20px;
}

.stat-box {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  min-width: 80px;
}

.stat-box.success {
  background: #d4edda;
  color: #155724;
}

.stat-box.error {
  background: #f8d7da;
  color: #721c24;
}

.stat-box.total {
  background: #d1ecf1;
  color: #0c5460;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.current-operation {
  background: #e9ecef;
  padding: 10px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  text-align: left;
  color: #495057;
  word-break: break-all;
}

/* Result styles */
.batch-result-summary h4 {
  color: #4facfe;
  margin-bottom: 15px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f8f9fa;
}

.stat-item.success {
  background: #d4edda;
  color: #155724;
}

.stat-item.error {
  background: #f8d7da;
  color: #721c24;
}

.stat-item.total {
  background: #d1ecf1;
  color: #0c5460;
}

.stat-item.rate {
  background: #fff3cd;
  color: #856404;
}

.result-details {
  margin-top: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
}

.result-details summary {
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.result-details summary:hover {
  background: #e9ecef;
}

.results-list {
  margin-top: 10px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  padding: 10px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .progress-modal {
    min-width: 300px;
    margin: 20px;
    padding: 20px;
  }
  
  .progress-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .preview-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .batch-summary {
    flex-direction: column;
  }
  
  .template-details {
    grid-template-columns: 1fr;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
}
</style>
