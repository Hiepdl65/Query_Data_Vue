<template>
  <div class="manual-update-tab">
    <div class="form-group">
      <label>📋 Chọn Template:</label>
      <select v-model="selectedTemplateId" @change="onTemplateSelect">
        <option value="">-- Chọn template hoặc nhập manual --</option>
        <option 
          v-for="template in templatesStore.allTemplates" 
          :key="template.id" 
          :value="template.id"
        >
          {{ template.name }}
        </option>
      </select>
      <div v-if="selectedTemplate" class="template-info">
        <span class="info-badge">📋 {{ selectedTemplate.name }}</span>
        <span class="info-badge">🗄️ {{ selectedTemplate.table }}.{{ selectedTemplate.column }}</span>
      </div>
    </div>

    <div class="connection-grid">
      <div class="form-group">
        <label>🏷️ Bảng:</label>
        <input 
          type="text" 
          v-model="updateForm.table" 
          placeholder="VD: PURTC"
          @input="updateSQLPreview"
        >
      </div>
      <div class="form-group">
        <label>📊 Cột update:</label>
        <input 
          type="text" 
          v-model="updateForm.column" 
          placeholder="VD: TC030"
          @input="updateSQLPreview"
        >
      </div>
    </div>

    <div class="form-group">
      <label>💾 Giá trị mới:</label>
      <input 
        type="text" 
        v-model="updateForm.value" 
        placeholder="VD: '1'"
        @input="updateSQLPreview"
      >
      <div class="quick-values">
        <span 
          v-for="quickValue in quickValues" 
          :key="quickValue.value"
          class="quick-value" 
          @click="setQuickValue(quickValue.value)"
        >
          {{ quickValue.label }}
        </span>
      </div>
    </div>

    <div class="condition-builder">
      <div class="condition-header">
        <h3>🔍 Xây dựng điều kiện WHERE</h3>
        <button class="btn btn-success btn-small" @click="addCondition">
          ➕ Thêm điều kiện
        </button>
      </div>
      
      <div class="conditions-container">
        <TransitionGroup name="condition" tag="div">
          <div 
            v-for="(condition, index) in conditions" 
            :key="condition.id"
            class="condition-row"
          >
            <input 
              type="text" 
              placeholder="Tên cột" 
              v-model="condition.column"
              @input="updateSQLPreview"
            >
            <select v-model="condition.operator" @change="updateSQLPreview">
              <option value="=">=</option>
              <option value="!=">!=</option>
              <option value="LIKE">LIKE</option>
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
            </select>
            <input 
              type="text" 
              placeholder="Giá trị" 
              v-model="condition.value"
              @input="updateSQLPreview"
            >
            <button 
              type="button" 
              class="btn btn-danger btn-small" 
              @click="removeCondition(index)"
              :disabled="conditions.length === 1"
            >
              &times;
            </button>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <div class="preview-section">
      <div class="preview-header">
        <span class="preview-title">🔍 Preview SQL:</span>
        <div class="preview-actions">
          <button class="btn btn-small" @click="copySQL" :disabled="!sqlPreview.includes('UPDATE')">
            📋 Copy SQL
          </button>
          <button class="btn btn-small" @click="formatSQL" :disabled="!sqlPreview.includes('UPDATE')">
            ✨ Format
          </button>
        </div>
      </div>
      <div class="sql-preview" :class="{ valid: isValidSQL }">{{ sqlPreview }}</div>
      <div v-if="isValidSQL && conditions.length > 0" class="sql-info">
        <span class="info-item">📊 Bảng: {{ updateForm.table }}</span>
        <span class="info-item">🔧 Cột: {{ updateForm.column }}</span>
        <span class="info-item">🔍 Điều kiện: {{ conditions.length }}</span>
      </div>
    </div>

    <div class="action-section">
      <button 
        class="btn execute-btn" 
        @click="executeUpdate"
        :disabled="!canExecute"
        :class="{ 
          'btn-success': canExecute && apiStore.connectionStatus.ready,
          'btn-warning': canExecute && !apiStore.connectionStatus.ready 
        }"
      >
        <span v-if="apiStore.loading">🔄 Đang thực hiện...</span>
        <span v-else-if="!apiStore.connectionStatus.ready">⚠️ Chưa kết nối database</span>
        <span v-else-if="!canExecute">📝 Nhập đầy đủ thông tin</span>
        <span v-else>🚀 Thực hiện Update</span>
      </button>
      
      <div class="action-info">
        <div class="status-checks">
          <div class="check-item" :class="{ valid: updateForm.table }">
            {{ updateForm.table ? '✅' : '❌' }} Tên bảng
          </div>
          <div class="check-item" :class="{ valid: updateForm.column }">
            {{ updateForm.column ? '✅' : '❌' }} Cột update
          </div>
          <div class="check-item" :class="{ valid: updateForm.value }">
            {{ updateForm.value ? '✅' : '❌' }} Giá trị mới
          </div>
          <div class="check-item" :class="{ valid: validConditions.length > 0 }">
            {{ validConditions.length > 0 ? '✅' : '❌' }} Điều kiện WHERE
          </div>
          <div class="check-item" :class="{ valid: apiStore.connectionStatus.ready }">
            {{ apiStore.connectionStatus.ready ? '✅' : '❌' }} Kết nối database
          </div>
        </div>
      </div>
    </div>

    <div v-if="result.message" class="result" :class="result.type">
      <div v-html="result.message"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useApiStore } from '@/stores/api.js'
import { useTemplatesStore } from '@/stores/templates.js'

// Stores
const apiStore = useApiStore()
const templatesStore = useTemplatesStore()

// State
const selectedTemplateId = ref('')
const updateForm = ref({
  table: '',
  column: '',
  value: ''
})

const conditions = ref([])
const sqlPreview = ref('-- SQL sẽ được hiển thị tại đây khi bạn nhập đầy đủ thông tin')
const result = ref({ message: '', type: 'info' })

const quickValues = [
  { label: "Not Approved ('N')", value: "'N'" },
  { label: "Approved ('1')", value: "'1'" },
  { label: "Pending processing ('0')", value: "'0'" },
  { label: "Yes ('Y')", value: "'Y'" }
  
]

// Computed
const selectedTemplate = computed(() => 
  templatesStore.templateById(selectedTemplateId.value)
)

const validConditions = computed(() => 
  conditions.value.filter(c => c.column && c.value)
)

const isValidSQL = computed(() => 
  updateForm.value.table && 
  updateForm.value.column && 
  updateForm.value.value && 
  validConditions.value.length > 0
)

const canExecute = computed(() => 
  isValidSQL.value && apiStore.connectionStatus.ready
)

// Methods
const addCondition = () => {
  conditions.value.push({
    id: Date.now() + Math.random(),
    column: '',
    operator: '=',
    value: ''
  })
  nextTick(() => updateSQLPreview())
}

const removeCondition = (index) => {
  if (conditions.value.length > 1) {
    conditions.value.splice(index, 1)
    updateSQLPreview()
  }
}

const setQuickValue = (value) => {
  updateForm.value.value = value
  updateSQLPreview()
}

const onTemplateSelect = () => {
  if (!selectedTemplateId.value) {
    clearForm()
    return
  }

  const template = selectedTemplate.value
  if (!template) return

  updateForm.value.table = template.table
  updateForm.value.column = template.column
  updateForm.value.value = `'${template.defaultValue}'`
  
  // Parse WHERE template to create conditions
  conditions.value = []
  parseWhereTemplate(template.whereTemplate)
  updateSQLPreview()
}

const parseWhereTemplate = (whereTemplate) => {
  const conditionParts = whereTemplate.split(' and ')
  
  conditionParts.forEach(part => {
    const match = part.trim().match(/(\w+)='{(\w+)}'/)
    if (match) {
      const [, column] = match
      addCondition()
      const lastCondition = conditions.value[conditions.value.length - 1]
      lastCondition.column = column
      lastCondition.operator = '='
      lastCondition.value = ''
    }
  })
}

const updateSQLPreview = () => {
  const { table, column, value } = updateForm.value
  
  if (!table || !column || !value) {
    sqlPreview.value = '-- SQL sẽ được hiển thị tại đây khi bạn nhập đầy đủ thông tin'
    return
  }
  
  const whereConditions = validConditions.value.map(c => {
    let formattedValue = c.value
    if (!c.value.startsWith("'") && !c.value.startsWith('"') && isNaN(c.value)) {
      formattedValue = `'${c.value}'`
    }
    return `${c.column}${c.operator}${formattedValue}`
  })
  
  const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : ''
  sqlPreview.value = `UPDATE ${table} SET ${column}=${value}${whereClause}`
}

const copySQL = async () => {
  try {
    await navigator.clipboard.writeText(sqlPreview.value)
    result.value = {
      message: '📋 SQL đã được copy vào clipboard!',
      type: 'info'
    }
    setTimeout(() => {
      result.value = { message: '', type: 'info' }
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const formatSQL = () => {
  const { table, column, value } = updateForm.value
  const whereConditions = validConditions.value.map(c => {
    let formattedValue = c.value
    if (!c.value.startsWith("'") && !c.value.startsWith('"') && isNaN(c.value)) {
      formattedValue = `'${c.value}'`
    }
    return `    ${c.column} ${c.operator} ${formattedValue}`
  })
  
  const formattedSQL = `UPDATE ${table}\nSET ${column} = ${value}\nWHERE\n${whereConditions.join(' AND\n')}`
  sqlPreview.value = formattedSQL
}

const executeUpdate = async () => {
  if (!canExecute.value) {
    result.value = {
      message: 'Vui lòng nhập đầy đủ thông tin và kết nối database',
      type: 'error'
    }
    return
  }

  const whereConditions = validConditions.value.map(c => {
    let formattedValue = c.value
    if (!c.value.startsWith("'") && !c.value.startsWith('"') && isNaN(c.value)) {
      formattedValue = `'${c.value}'`
    }
    return `${c.column}${c.operator}${formattedValue}`
  })

  try {
    const response = await apiStore.executeUpdate({
      tableName: updateForm.value.table,
      columnName: updateForm.value.column,
      newValue: updateForm.value.value.replace(/^'|'$/g, ''),
      whereCondition: whereConditions.join(' AND '),
      dataType: 'string'
    })

    if (response.success) {
      result.value = {
        message: `
          <strong>✅ Cập nhật thành công!</strong><br><br>
          <strong>📊 Kết quả:</strong> ${response.data.rowsAffected} bản ghi đã được cập nhật<br>
          <strong>⏰ Thời gian:</strong> ${response.data.executionTime}ms<br>
          <strong>🔍 SQL:</strong><br>
          <code>${response.data.query}</code>
        `,
        type: 'success'
      }
    } else {
      result.value = {
        message: `<strong>❌ Cập nhật thất bại!</strong><br><br><strong>Lỗi:</strong> ${response.message}`,
        type: 'error'
      }
    }
  } catch (error) {
    result.value = {
      message: `<strong>❌ Lỗi hệ thống!</strong><br><br><strong>Chi tiết:</strong> ${error.message}`,
      type: 'error'
    }
  }
}

const clearForm = () => {
  updateForm.value = { table: '', column: '', value: '' }
  conditions.value = []
  addCondition()
  updateSQLPreview()
}

// Initialize with one condition
addCondition()

// Watch for template changes
watch(() => templatesStore.selectedTemplate, (template) => {
  if (template && template.id !== selectedTemplateId.value) {
    selectedTemplateId.value = template.id
    onTemplateSelect()
  }
})
</script>

<style scoped>
.manual-update-tab {
  max-width: 1000px;
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4facfe;
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(79, 172, 254, 0.1);
}

.template-info {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.info-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
}

.connection-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.quick-values {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.quick-value {
  background: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 20px;
  padding: 5px 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-value:hover {
  background: #4facfe;
  color: white;
  transform: translateY(-1px);
}

.condition-builder {
  border: 2px solid #e1e5e9;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  background: white;
}

.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.condition-row {
  display: grid;
  grid-template-columns: 200px 120px 1fr 80px;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.condition-row:last-child {
  margin-bottom: 0;
}

.condition-enter-active,
.condition-leave-active {
  transition: all 0.3s ease;
}

.condition-enter-from,
.condition-leave-to {
  opacity: 0;
  transform: translateX(-30px);
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

.sql-preview {
  background: #2d3748;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.sql-preview.valid {
  border-color: #28a745;
}

.sql-info {
  display: flex;
  gap: 15px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.info-item {
  background: #e9ecef;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #495057;
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
}

.execute-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.execute-btn.btn-warning {
  background: linear-gradient(135deg, #ffc107 0%, #ff8c00 100%);
}

.action-info {
  margin-top: 15px;
}

.status-checks {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.check-item {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.check-item.valid {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.result {
  margin-top: 20px;
  padding: 20px;
  border-radius: 15px;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
}

.result.success {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #155724;
  border: 2px solid #c3e6cb;
}

.result.error {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #721c24;
  border: 2px solid #f5c6cb;
}

.result.info {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  color: #0c5460;
  border: 2px solid #bee5eb;
}

@media (max-width: 768px) {
  .connection-grid {
    grid-template-columns: 1fr;
  }
  
  .condition-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .condition-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .preview-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .status-checks {
    flex-direction: column;
  }
}
</style>