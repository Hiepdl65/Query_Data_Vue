<template>
  <div class="container">
    <TheHeader />
    <TabNavigation />
    
    <div v-if="appStore.activeTab === 'connection'" class="tab-content">
      <ConnectionTab />
    </div>

    <div v-if="appStore.activeTab === 'templates'" class="tab-content">
      <h2>📋 Templates sẽ được thêm sau</h2>
    </div>

    <div v-if="appStore.activeTab === 'manual'" class="tab-content">
      <h2>✏️ Manual Update sẽ được thêm sau</h2>
    </div>

    <div v-if="appStore.activeTab === 'batch'" class="tab-content">
      <h2>📊 Batch Update sẽ được thêm sau</h2>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'
import { useConnectionStore } from './stores/connection'

import TheHeader from './components/TheHeader.vue'
import TabNavigation from './components/TabNavigation.vue'
import ConnectionTab from './components/tabs/ConnectionTab.vue'

const appStore = useAppStore()
const connectionStore = useConnectionStore()

onMounted(async () => {
  await connectionStore.testBackendConnection()
})
</script>