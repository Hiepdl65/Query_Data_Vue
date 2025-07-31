<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEditing ? 'Chỉnh sửa Template' : 'Thêm Template Mới' }}</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Template Name:</label>
          <input 
            v-model="form.name" 
            type="text" 
            placeholder="VD: PURMI07 - Update trạng thái duyệt"
          >
        </div>

        <div class="form-group">
          <label>Mô tả:</label>
          <textarea 
            v-model="form.description" 
            placeholder="Mô tả chức năng của template..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>Bảng:</label>
          <input 
            v-model="form.table" 
            type="text" 
            placeholder="VD: PURTC"
            @input="updateExample"
          >
        </div>

        <div class="form-group">
          <label>Cột update:</label>
          <input 
            v-model="form.column" 
            type="text" 
            placeholder="VD: TC030"
            @input="updateExample"
          >
        </div>

        <div class="form-group">
          <label>Giá trị mặc định:</label>
          <input 
            v-model="form.defaultValue" 
            type="text" 
            placeholder="VD: '1'"
            @input="updateExample"
          >
        </div>

        <div class="form-group">
          <label>Điều kiện WHERE template:</label>
          <textarea 
            v-model="form.whereTemplate" 
            placeholder="VD: TC001='{TC001}' and TC002='{TC002}'"
            @input="updateExample"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Ví dụ SQL:</label>
          <div class="example-preview">{{ exampleSQL }}</div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-success" @click="saveTemplate" :disabled="!canSave">
          💾 {{ isEditing ? 'Cập nhật' : 'Lưu Template' }}
        </button>
        <button class="btn btn-secondary" @click="closeModal">
          ❌ Hủy
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTemplateStore } from '../stores/template'
import { useAppStore } from '../stores/api'

const templateStore = useTemplateStore()
const appStore = useAppStore()

// State
const isVisible = ref(false)
const isEditing = ref(false)
const currentTemplateId = ref(null)

const form = ref({
  name: '',
  description: '',
  table: '',
  column: '',
  defaultValue: '',
  whereTemplate: ''
})

// Computed
const canSave = computed(() => 
  form.value.name && 
  form.value.table && 
  form.value.column && 
  form.value.defaultValue
)

const exampleSQL = computed(() => {
  if (!form.value.table || !form.value.column || !form.value.defaultValue) {
    return '-- Ví dụ SQL sẽ được tạo tự động khi bạn nhập đầy đủ thông tin'
  }
  
  const whereClause = form.value.whereTemplate ? ` where ${form.value.whereTemplate}` : ''
  return `update ${form.value.table} set ${form.value.column}='${form.value.defaultValue}'${whereClause}`
})

// Methods
const showModal = (template = null) => {
  isVisible.value = true
  isEditing.value = !!template
  currentTemplateId.value = template?.id || null
  
  if (template) {
    form.value = { ...template }
  } else {
    resetForm()
  }
}

const closeModal = () => {
  isVisible.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    table: '',
    column: '',
    defaultValue: '',
    whereTemplate: ''
  }
}

const updateExample = () => {
  // Computed property will handle this automatically
}

const saveTemplate = () => {
  if (!canSave.value) return

  try {
    if (isEditing.value) {
      // Update existing template
      const index = templateStore.templates.findIndex(t => t.id === currentTemplateId.value)
      if (index > -1) {
        templateStore.templates[index] = {
          ...templateStore.templates[index],
          ...form.value,
          example: exampleSQL.value
        }
        appStore.showNotification('✅ Template đã được cập nhật!', 'success')
      }
    } else {
      // Add new template
      templateStore.addTemplate(form.value)
      appStore.showNotification('✅ Template đã được thêm thành công!', 'success')
    }
    
    closeModal()
  } catch (error) {
    appStore.showNotification(`❌ Lỗi: ${error.message}`, 'error')
  }
}

// Global methods (can be called from other components)
const openAddModal = () => showModal()
const openEditModal = (template) => showModal(template)

// Expose methods for global access
defineExpose({
  openAddModal,
  openEditModal
})
</script>

<style scoped lang="scss">
@import '../assets/styles/variables.scss';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: $white;
  border-radius: $border-radius-lg;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: $shadow-lg;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  border-bottom: 2px solid $gray-200;

  h3 {
    margin: 0;
    color: $primary-color;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: $gray-600;
    
    &:hover {
      color: $danger-color;
    }
  }
}

.modal-body {
  padding: $spacing-lg;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding: $spacing-lg;
  border-top: 2px solid $gray-200;
}

.example-preview {
  background: $gray-800;
  color: #e2e8f0;
  padding: $spacing-md;
  border-radius: $border-radius;
  font-family: $font-mono;
  font-size: 0.9rem;
  min-height: 50px;
}
</style>