<template>
  <div class="container">
    <div class="header">
      <h1>🗄️ ERP Database Update Tool</h1>
      <p>Công cụ cập nhật database ERP với template và điều kiện tùy chỉnh</p>
      <div class="status">
        <span class="status-indicator" :class="{ 
          'status-connected': apiStore.isBackendConnected,
          'status-disconnected': !apiStore.isBackendConnected 
        }"></span>
        Backend: {{ apiStore.isBackendConnected ? 'Đã kết nối' : 'Chưa kết nối' }}
        <span v-if="apiStore.isDatabaseConnected" class="status-indicator status-connected ml-20"></span>
        <span v-if="apiStore.isDatabaseConnected">Database: Đã kết nối</span>
      </div>
    </div>
    
    <div class="tabs">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @click="switchTab(tab.id)"
      >
        {{ tab.label }}
      </div>
    </div>
    
    <div class="tab-content-container">
      <!-- Connection Tab -->
      <ConnectionTab v-if="activeTab === 'connection'" />
      
      <!-- Templates Tab -->
      <TemplatesTab v-if="activeTab === 'templates'" @template-selected="onTemplateSelected" />
      
      <!-- Manual Update Tab -->
      <ManualUpdateTab v-if="activeTab === 'manual'" :selected-template-id="selectedTemplateFromTemplates" />
      
      <!-- Batch Update Tab -->
      <BatchUpdateTab v-if="activeTab === 'batch'" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApiStore } from '@/stores/api'
import { useTemplatesStore } from '@/stores/templates'
import ConnectionTab from '@/components/ConnectionTab.vue'
import TemplatesTab from '@/components/TemplatesTab.vue'
import ManualUpdateTab from '@/components/ManualUpdateTab.vue'
import BatchUpdateTab from '@/components/BatchUpdateTab.vue'

// Stores
const apiStore = useApiStore()
const templatesStore = useTemplatesStore()

// State
const activeTab = ref('connection')
const selectedTemplateFromTemplates = ref('')

const tabs = [
  { id: 'connection', label: '🔗 Kết nối' },
  { id: 'templates', label: '📋 Templates' },
  { id: 'manual', label: '✏️ Manual Update' },
  { id: 'batch', label: '📊 Batch Update' }
]

// Methods
const switchTab = (tabId) => {
  activeTab.value = tabId
  console.log(`🔄 Switched to tab: ${tabId}`)
}

const onTemplateSelected = (templateId) => {
  selectedTemplateFromTemplates.value = templateId
  // Auto switch to manual tab when template is selected
  activeTab.value = 'manual'
  console.log(`📋 Template selected: ${templateId}, switching to manual tab`)
}

// Lifecycle
onMounted(() => {
  console.log('🚀 ERP Database Update Tool - Modular Version loaded!')
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 30px;
  text-align: center;
  border-radius: 20px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.status {
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-connected {
  background: #28a745;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
}

.status-disconnected {
  background: #dc3545;
}

.ml-20 {
  margin-left: 20px;
}

.tabs {
  display: flex;
  background: white;
  border-radius: 15px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.tab {
  flex: 1;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background: white;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-weight: 600;
}

.tab:hover {
  background: #f8f9fa;
}

.tab.active {
  border-bottom-color: #4facfe;
  background: #f8f9fa;
  color: #4facfe;
}

.tab-content-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-content-container {
    padding: 20px;
  }
  
  .status {
    flex-direction: column;
    gap: 10px;
  }
}
</style>