<template>
  <div class="templates-tab">
    <div class="templates-header">
      <h2>📋 ERP Update Templates</h2>
      <button class="btn btn-success btn-small" @click="showAddModal">
        ➕ Thêm Template
      </button>
    </div>

    <!-- Templates Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-number">{{ templatesStore.allTemplates.length }}</div>
        <div class="stat-label">Tổng Templates</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ templatesStore.customTemplates.length }}</div>
        <div class="stat-label">Custom Templates</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ defaultTemplatesCount }}</div>
        <div class="stat-label">Default Templates</div>
      </div>
    </div>

    <div class="template-grid">
      <div 
        v-for="template in templatesStore.allTemplates" 
        :key="template.id"
        class="template-card"
        :class="{ 
          selected: templatesStore.selectedTemplate?.id === template.id,
          custom: template.id.startsWith('CUSTOM_')
        }"
        @click="selectTemplate(template)"
      >
        <div class="template-badge" v-if="template.id.startsWith('CUSTOM_')">Custom</div>
        <button 
          class="delete-btn" 
          @click.stop="deleteTemplate(template.id)"
          v-if="template.id.startsWith('CUSTOM_')"
        >
          &times;
        </button>
        <div class="template-title">{{ template.name }}</div>
        <div class="template-description">{{ template.description }}</div>
        <div class="template-details">
          <span class="detail-item">📊 {{ template.table }}.{{ template.column }}</span>
          <span class="detail-item">💾 {{ template.defaultValue }}</span>
        </div>
        <div class="template-example">{{ template.example }}</div>
      </div>
    </div>

    <!-- Add/Edit Template Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="hideModal">
        <div class="modal-content" @click.stop>
          <h3>{{ editingTemplate ? 'Chỉnh sửa Template' : 'Thêm Template Mới' }}</h3>
          
          <div class="form-group">
            <label>Template Name:</label>
            <input 
              type="text" 
              v-model="templateForm.name" 
              placeholder="VD: PURMI07 - Update trạng thái duyệt"
            >
          </div>
          
          <div class="form-group">
            <label>Mô tả:</label>
            <textarea 
              v-model="templateForm.description" 
              placeholder="Mô tả chức năng của template..."
            ></textarea>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Bảng:</label>
              <input 
                type="text" 
                v-model="templateForm.table" 
                placeholder="VD: PURTC"
              >
            </div>
            
            <div class="form-group">
              <label>Cột update:</label>
              <input 
                type="text" 
                v-model="templateForm.column" 
                placeholder="VD: TC030"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label>Giá trị mặc định:</label>
            <input 
              type="text" 
              v-model="templateForm.defaultValue" 
              placeholder="VD: 1"
            >
          </div>
          
          <div class="form-group">
            <label>Điều kiện WHERE template:</label>
            <textarea 
              v-model="templateForm.whereTemplate" 
              placeholder="VD: TC001='{TC001}' and TC002='{TC002}'"
            ></textarea>
          </div>
          
          <!-- Preview -->
          <div v-if="previewSql" class="preview-section">
            <label>🔍 Preview SQL:</label>
            <div class="sql-preview">{{ previewSql }}</div>
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-success" @click="saveTemplate" :disabled="!isFormValid">
              💾 {{ editingTemplate ? 'Cập nhật' : 'Lưu' }} Template
            </button>
            <button class="btn btn-secondary" @click="hideModal">
              ❌ Hủy
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <div v-if="result.message" class="result" :class="result.type">
      {{ result.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTemplatesStore } from '@/stores/templates'

// Stores
const templatesStore = useTemplatesStore()

// State
const showModal = ref(false)
const editingTemplate = ref(null)
const result = ref({ message: '', type: 'info' })

const templateForm = ref({
  name: '',
  description: '',
  table: '',
  column: '',
  defaultValue: '',
  whereTemplate: ''
})

// Computed
const defaultTemplatesCount = computed(() => 
  templatesStore.allTemplates.length - templatesStore.customTemplates.length
)

const isFormValid = computed(() => 
  templateForm.value.name && 
  templateForm.value.table && 
  templateForm.value.column &&
  templateForm.value.defaultValue
)

const previewSql = computed(() => {
  const form = templateForm.value
  if (form.table && form.column && form.defaultValue && form.whereTemplate) {
    return `UPDATE ${form.table} SET ${form.column}='${form.defaultValue}' WHERE ${form.whereTemplate}`
  }
  return ''
})

// Watch form changes for preview
watch(templateForm, () => {
  // Auto-update preview when form changes
}, { deep: true })

// Methods
const showAddModal = () => {
  resetForm()
  editingTemplate.value = null
  showModal.value = true
}

const hideModal = () => {
  showModal.value = false
  resetForm()
  result.value = { message: '', type: 'info' }
}

const resetForm = () => {
  templateForm.value = {
    name: '',
    description: '',
    table: '',
    column: '',
    defaultValue: '',
    whereTemplate: ''
  }
}

const selectTemplate = (template) => {
  templatesStore.selectTemplate(template.id)
  
  // Show success message
  result.value = {
    message: `✅ Đã chọn template: ${template.name}`,
    type: 'success'
  }
  
  // Clear message after 3 seconds
  setTimeout(() => {
    if (result.value.type === 'success') {
      result.value = { message: '', type: 'info' }
    }
  }, 3000)
}

const saveTemplate = async () => {
  if (!isFormValid.value) {
    result.value = {
      message: 'Vui lòng nhập đầy đủ thông tin bắt buộc',
      type: 'error'
    }
    return
  }

  try {
    if (editingTemplate.value) {
      templatesStore.updateTemplate(editingTemplate.value.id, templateForm.value)
      result.value = {
        message: 'Template đã được cập nhật thành công!',
        type: 'success'
      }
    } else {
      const newTemplate = templatesStore.addTemplate(templateForm.value)
      result.value = {
        message: `Template "${newTemplate.name}" đã được lưu thành công!`,
        type: 'success'
      }
    }
    hideModal()
  } catch (error) {
    result.value = {
      message: `Lỗi: ${error.message}`,
      type: 'error'
    }
  }
}

const deleteTemplate = async (templateId) => {
  if (confirm('Bạn có chắc chắn muốn xóa template này?')) {
    try {
      templatesStore.removeTemplate(templateId)
      result.value = {
        message: 'Template đã được xóa!',
        type: 'info'
      }
    } catch (error) {
      result.value = {
        message: `Lỗi khi xóa template: ${error.message}`,
        type: 'error'
      }
    }
  }
}
</script>

<style scoped>
.templates-tab {
  max-width: 1200px;
}

.templates-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.template-card {
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.template-card:hover {
  border-color: #4facfe;
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(79, 172, 254, 0.2);
}

.template-card.selected {
  border-color: #4facfe;
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
}

.template-card.custom {
  border-color: #ffc107;
}

.template-badge {
  position: absolute;
  top: 10px;
  right: 45px;
  background: #ffc107;
  color: #333;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
}

.template-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #4facfe;
  margin-bottom: 10px;
  padding-right: 40px;
}

.template-description {
  color: #666;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.template-details {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.detail-item {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #495057;
  font-family: 'Courier New', monospace;
}

.template-example {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: #333;
  border-left: 4px solid #4facfe;
  word-break: break-all;
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1.2rem;
  display: none;
  z-index: 10;
}

.template-card:hover .delete-btn {
  display: block;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-bottom: 20px;
  color: #4facfe;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4facfe;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
  font-family: 'Courier New', monospace;
}

.preview-section {
  margin-bottom: 20px;
}

.preview-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4facfe;
}

.sql-preview {
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  word-break: break-all;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .template-grid {
    grid-template-columns: 1fr;
  }
  
  .templates-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .modal-content {
    width: 95%;
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
