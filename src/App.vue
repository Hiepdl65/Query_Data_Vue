<template>
  <div class="container">
    <TheHeader />
    <TabNavigation :active-tab="activeTab" @tab-change="switchTab" />
    
    <div class="tab-content">
      <!-- Connection Tab -->
      <ConnectionTab v-if="activeTab === 'connection'" />

      <!-- Templates Tab -->
      <TemplatesTab v-else-if="activeTab === 'templates'" />

      <!-- Manual Update Tab -->
      <ManualUpdateTab v-else-if="activeTab === 'manual'" />

      <!-- Batch Update Tab -->
      <BatchUpdateTab v-else-if="activeTab === 'batch'" />
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

const apiStore = useApiStore()
const activeTab = ref('connection')

const switchTab = (tabId) => {
  activeTab.value = tabId
}

onMounted(async () => {
  // Auto test backend connection
  await apiStore.testBackendConnection()
})
</script>