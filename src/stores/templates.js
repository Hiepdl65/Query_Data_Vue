import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTemplateStore = defineStore('template', () => {
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
    },
    {
      id: 'PURI08',
      name: 'PURI08 - Update trạng thái duyệt TE025',
      description: 'Cập nhật trạng thái duyệt TE025',
      table: 'PURTE',
      column: 'TE025',
      defaultValue: '1',
      whereTemplate: "TE001='{TE001}' and TE002='{TE002}' and TE003='{TE003}'",
      example: "update PURTE set TE025='1' where TE001='A331' and TE002='220223006' and TE003='0001'"
    },
    {
      id: 'PURI13',
      name: 'PURI13 - Update trạng thái duyệt TH058',
      description: 'Cập nhật trạng thái duyệt TH058',
      table: 'PURTH',
      column: 'TH058',
      defaultValue: '1',
      whereTemplate: "TH001='{TH001}' and TH002='{TH002}' and TH003='{TH003}'",
      example: "update PURTH set TH058='1' where TH001='A341' and TH002='201228010' and TH003='0005'"
    },
    {
      id: 'INVMI08',
      name: 'INVMI08 - Update trạng thái duyệt TA017',
      description: 'Cập nhật trạng thái duyệt TA017 cho inventory',
      table: 'INVTA',
      column: 'TA017',
      defaultValue: '1',
      whereTemplate: "TA001='{TA001}' and TA002='{TA002}'",
      example: "update INVTA set TA017='1' where TA001='1202' and TA002='250716018'"
    },
    {
      id: 'INVMI05',
      name: 'INVMI05 - Update trạng thái duyệt TA017',
      description: 'Cập nhật trạng thái duyệt TA017 cho inventory',
      table: 'INVTA',
      column: 'TA017',
      defaultValue: '1',
      whereTemplate: "TA001='{TA001}' and TA002='{TA002}'",
      example: "update INVTA set TA017='1' where TA001='1101' and TA002='210211002'"
    },
    {
      id: 'ACPMI02',
      name: 'ACPMI02 - Update trạng thái duyệt TA044',
      description: 'Cập nhật trạng thái duyệt TA044',
      table: 'ACPTA',
      column: 'TA044',
      defaultValue: '1',
      whereTemplate: "TA001='{TA001}' and TA002='{TA002}'",
      example: "update ACPTA set TA044='1' where TA001='A716' and TA002='220531055'"
    },
    {
      id: 'PCMI07',
      name: 'PCMI07 - Update trạng thái duyệt TF019',
      description: 'Cập nhật trạng thái duyệt TF019',
      table: 'PCMTF',
      column: 'TF019',
      defaultValue: '1',
      whereTemplate: "TF001='{TF001}' and TF002='{TF002}'",
      example: "update PCMTF set TF019='1' where TF001='I41' and TF002='220425001'"
    }
  ])

  const selectedTemplate = ref(null)

  // Computed
  const templateOptions = computed(() => 
    templates.value.map(t => ({ value: t.id, label: t.name }))
  )

  // Actions
  const addTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: `CUSTOM_${Date.now()}`,
      example: `update ${template.table} set ${template.column}='${template.defaultValue}' where ${template.whereTemplate}`
    }
    templates.value.push(newTemplate)
    return newTemplate
  }

  const deleteTemplate = (templateId) => {
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

  const getTemplateById = (id) => {
    return templates.value.find(t => t.id === id)
  }

  const selectTemplate = (templateId) => {
    selectedTemplate.value = getTemplateById(templateId)
    return selectedTemplate.value
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
    templateOptions,
    
    // Actions
    addTemplate,
    deleteTemplate,
    getTemplateById,
    selectTemplate,
    parseWhereTemplate
  }
})