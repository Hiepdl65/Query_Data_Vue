import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTemplatesStore = defineStore('templates', () => {
  // State
  const templates = ref([
    {
      id: 'PURMI07',
      name: 'PURMI07 - Update trạng thái duyệt TC030',
      description: 'Cập nhật trạng thái duyệt cho phiếu mua hàng',
      table: 'PURTC',
      column: 'TC030',
      defaultValue: '1',
      whereTemplate: "TC001='{TC001}' and TC002='{TC002}'",
      example: "update PURTC set TC030='1' where TC001='A331' and TC002='220506002'"
    },
    {
      id: 'PURMI09',
      name: 'PURMI09 - Update trạng thái duyệt TG042',
      description: 'Cập nhật trạng thái duyệt TG042',
      table: 'PURTG',
      column: 'TG042',
      defaultValue: 'N',
      whereTemplate: "TG001='{TG001}' and TG002='{TG002}'",
      example: "update PURTG set TG042='N' where TG001='A342' and TG002='210129003'"
    },
    {
      id: 'COPMI07',
      name: 'COPMI07 - Update trạng thái duyệt TE044',
      description: 'Cập nhật trạng thái duyệt TE044',
      table: 'COPTE',
      column: 'TE044',
      defaultValue: '1',
      whereTemplate: "TE001='{TE001}' and TE002='{TE002}' and TE003='{TE003}'",
      example: "update COPTE set TE044='1' where TE001='B224' and TE002='210222005' and TE003='0002'"
    },
    {
      id: 'COPMI06',
      name: 'COPMI06 - Update trạng thái duyệt TC048',
      description: 'Cập nhật trạng thái duyệt TC048',
      table: 'COPTC',
      column: 'TC048',
      defaultValue: '1',
      whereTemplate: "TC001='{TC001}' and TC002='{TC002}'",
      example: "update COPTC set TC048='1' where TC001='A224' and TC002='210304001'"
    },
    {
      id: 'PURI05',
      name: 'PURI05 - Update trạng thái duyệt TA016',
      description: 'Cập nhật trạng thái duyệt TA016',
      table: 'PURTA',
      column: 'TA016',
      defaultValue: '1',
      whereTemplate: "TA001='{TA001}' and TA002='{TA002}'",
      example: "update PURTA set TA016='1' where TA001='A311' and TA002='250716005'"
    }
  ])

  const selectedTemplate = ref(null)

  // Computed
  const allTemplates = computed(() => templates.value)
  
  const customTemplates = computed(() => 
    templates.value.filter(t => t.id.startsWith('CUSTOM_'))
  )

  const templateOptions = computed(() => 
    templates.value.map(t => ({ value: t.id, label: t.name }))
  )

  // Actions
  const templateById = (id) => {
    return templates.value.find(t => t.id === id)
  }

  const selectTemplate = (templateId) => {
    selectedTemplate.value = templateById(templateId)
    return selectedTemplate.value
  }

  const addTemplate = (templateData) => {
    const newTemplate = {
      ...templateData,
      id: `CUSTOM_${Date.now()}`,
      example: `update ${templateData.table} set ${templateData.column}='${templateData.defaultValue}' where ${templateData.whereTemplate}`
    }
    templates.value.push(newTemplate)
    return newTemplate
  }

  const updateTemplate = (templateId, templateData) => {
    const index = templates.value.findIndex(t => t.id === templateId)
    if (index > -1) {
      templates.value[index] = {
        ...templates.value[index],
        ...templateData,
        example: `update ${templateData.table} set ${templateData.column}='${templateData.defaultValue}' where ${templateData.whereTemplate}`
      }
      return templates.value[index]
    }
    return null
  }

  const removeTemplate = (templateId) => {
    const index = templates.value.findIndex(t => t.id === templateId)
    if (index > -1) {
      templates.value.splice(index, 1)
      if (selectedTemplate.value?.id === templateId) {
        selectedTemplate.value = null
      }
      return true
    }
    return false
  }

  const parseWhereTemplate = (whereTemplate) => {
    // Parse conditions like "TC001='{TC001}' and TC002='{TC002}'"
    const conditionParts = whereTemplate.split(' and ')
    const conditions = []
    
    conditionParts.forEach(part => {
      const match = part.trim().match(/(\w+)='{(\w+)}'/)
      if (match) {
        const [, column, placeholder] = match
        conditions.push({
          id: `condition_${Date.now()}_${Math.random()}`,
          column,
          operator: '=',
          value: '',
          placeholder
        })
      }
    })
    
    return conditions
  }

  return {
    // State
    templates,
    selectedTemplate,
    
    // Computed
    allTemplates,
    customTemplates,
    templateOptions,
    
    // Actions
    templateById,
    selectTemplate,
    addTemplate,
    updateTemplate,
    removeTemplate,
    parseWhereTemplate
  }
})