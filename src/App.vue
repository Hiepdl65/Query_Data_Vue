<template>
  <div class="app-wrapper">
    <div class="app-container">
      <TheHeader />
      <TabNavigation :active-tab="activeTab" @tab-change="switchTab" />
      
      <main class="main-content">
        <div class="content-wrapper">
          <!-- Connection Tab -->
          <ConnectionTab v-if="activeTab === 'connection'" />

          <!-- Templates Tab -->
          <TemplatesTab v-else-if="activeTab === 'templates'" />

          <!-- Manual Update Tab -->
          <ManualUpdateTab v-else-if="activeTab === 'manual'" />

          <!-- Batch Update Tab -->
          <BatchUpdateTab v-else-if="activeTab === 'batch'" />

          <!-- Query Data Tab -->
          <QueryTab v-else-if="activeTab === 'query'" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApiStore } from './stores/api.js'

import TheHeader from './components/TheHeader.vue'
import TabNavigation from './components/TabNavigation.vue'
import ConnectionTab from './components/ConnectionTab.vue'
import TemplatesTab from './components/TemplatesTab.vue'
import ManualUpdateTab from './components/ManualUpdate.vue'
import BatchUpdateTab from './components/BatchUpdateTab.vue'
import QueryTab from './components/QueryTab.vue'

console.log('🔄 App.vue loading...')

const apiStore = useApiStore()
const activeTab = ref('connection')

const switchTab = (tabId) => {
  activeTab.value = tabId
  console.log(`📍 Switched to tab: ${tabId}`)
}

onMounted(async () => {
  console.log('🚀 App mounted, testing backend connection...')
  // Auto test backend connection
  await apiStore.testBackendConnection()
})
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  margin: 0;
}

.app-container {
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

.content-wrapper {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* Responsive */
@media (max-width: 1440px) {
  .app-container {
    margin: 0 20px;
    border-radius: 20px;
  }
}

@media (max-width: 768px) {
  .app-wrapper {
    padding: 0;
  }
  
  .app-container {
    margin: 0;
    border-radius: 0;
  }
  
  .content-wrapper {
    padding: 20px 16px;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 16px 12px;
  }
}
</style>