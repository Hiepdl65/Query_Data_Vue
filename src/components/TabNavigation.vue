<template>
  <div class="tabs">
    <div 
      v-for="tab in tabs" 
      :key="tab.id"
      class="tab"
      :class="{ active: activeTab === tab.id }"
      @click="$emit('tab-change', tab.id)"
    >
      {{ tab.label }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

defineEmits(['tab-change'])

const tabs = [
  { id: 'connection', label: '🔗 Kết nối' },
  { id: 'templates', label: '📋 Templates' },
  { id: 'manual', label: '✏️ Manual Update' },
  { id: 'batch', label: '📊 Batch Update' }
]
</script>

<style scoped>
.tabs {
  display: flex;
  background: white;
  border-bottom: 2px solid #e1e5e9;
}

.tab {
  flex: 1;
  padding: 20px;
  text-align: center;
  cursor: pointer;
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
</style>