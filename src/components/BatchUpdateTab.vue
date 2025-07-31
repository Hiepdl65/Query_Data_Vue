<template>
  <div>
    <h2>📊 Batch Update từ danh sách</h2>
    
    <div class="form-group">
      <label>📋 Template:</label>
      <select v-model="selectedTemplateId">
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

    <div class="form-group">
      <label>📝 Danh sách điều kiện (mỗi dòng 1 bộ điều kiện):</label>
      <textarea 
        v-model="batchConditions" 
        rows="10" 
        placeholder="Ví dụ với template PURMI07:
A331,220506002
A342,210129003
B224,210222005,0002

Format: value1,value2,value3 (theo thứ tự điều kiện trong template)"
      ></textarea>
    </div>

    <button 
      class="btn btn-success btn-full" 
      :disabled="!canExecute || isExecuting"
      @click="executeBatchUpdate"
    >
      {{ isExecuting ? '🔄 Đang thực hiện...' : '🚀 Thực hiện Batch Update' }}
    </button>

    <div v-if="result" class="result" :class="result.type">
      <div v-html="result.message"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTemplatesStore } from '@/stores/templates.js'
import { useApiStore } from '@/stores/api.js'

const templatesStore = useTemplatesStore()
const apiStore = useApiStore()

// Form data
const selectedTemplateId = ref('')
const batchConditions = ref('')
const result = ref(null)
const isExecuting = ref(false)

// Computed
const canExecute = computed(() => 
  selectedTemplateId.value && 
  batchConditions.value.trim() && 
  apiStore.isBackendConnected && 
  apiStore.isDatabaseConnected
)

// Methods
const executeBatchUpdate = async () => {
  if (!canExecute.value) return

  const template = templatesStore.templateById(selectedTemplateId.value)
  if (!template) {
    result.value = {
      type: 'error',
      message: '❌ Template không tìm thấy'
    }
    return
  }

  isExecuting.value = true
  result.value = null

  try {
    // Parse batch data
    const lines = batchConditions.value.split('\n').filter(line => line.trim())
    const results = []
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const values = line.split(',').map(v => v.trim())
      
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
          results.push(`✅ Line ${i + 1}: ${response.data.rowsAffected} rows updated`)
          successCount++
        } else {
          results.push(`❌ Line ${i + 1}: ${response.message}`)
          errorCount++
        }

      } catch (error) {
        results.push(`❌ Line ${i + 1}: ${error.message}`)
        errorCount++
      }
    }

    result.value = {
      type: successCount > errorCount ? 'success' : 'error',
      message: `
        <strong>📊 Batch Update Hoàn thành!</strong><br><br>
        <strong>Thành công:</strong> ${successCount}<br>
        <strong>Lỗi:</strong> ${errorCount}<br><br>
        <strong>Chi tiết:</strong><br>
        ${results.join('<br>')}
      `
    }

  } catch (error) {
    result.value = {
      type: 'error',
      message: `❌ Batch update thất bại: ${error.message}`
    }
  } finally {
    isExecuting.value = false
  }
}
</script>

// Form data
const selectedTemplateId = ref('')
const batchConditions = ref('')
const result = ref(null)
const isExecuting = ref(false)

// Computed
const canExecute = computed(() => 
  selectedTemplateId.value && 
  batchConditions.value.trim() && 
  apiStore.isBackendConnected && 
  apiStore.isDatabaseConnected
)

// Methods
const executeBatchUpdate = async () => {
  if (!canExecute.value) return

  const template = templatesStore.templateById(selectedTemplateId.value)
  if (!template) {
    result.value = {
      type: 'error',
      message: '❌ Template không tìm thấy'
    }
    return
  }

  isExecuting.value = true
  result.value = null

  try {
    // Parse batch data
    const lines = batchConditions.value.split('\n').filter(line => line.trim())
    const results = []
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const values = line.split(',').map(v => v.trim())
      
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
          results.push(`✅ Line ${i + 1}: ${response.data.rowsAffected} rows updated`)
          successCount++
        } else {
          results.push(`❌ Line ${i + 1}: ${response.message}`)
          errorCount++
        }

      } catch (error) {
        results.push(`❌ Line ${i + 1}: ${error.message}`)
        errorCount++
      }
    }

    result.value = {
      type: successCount > errorCount ? 'success' : 'error',
      message: `
        <strong>📊 Batch Update Hoàn thành!</strong><br><br>
        <strong>Thành công:</strong> ${successCount}<br>
        <strong>Lỗi:</strong> ${errorCount}<br><br>
        <strong>Chi tiết:</strong><br>
        ${results.join('<br>')}
      `
    }

  } catch (error) {
    result.value = {
      type: 'error',
      message: `❌ Batch update thất bại: ${error.message}`
    }
  } finally {
    isExecuting.value = false
  }
}
</script>