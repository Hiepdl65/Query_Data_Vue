<template>
  <div class="header">
    <h1>🗄️ ERP Database Update Tool</h1>
    <p>Công cụ cập nhật database ERP với template và điều kiện tùy chỉnh</p>
    <div class="connection-status">
      <span 
        class="status-indicator"
        :class="apiStore.isBackendConnected ? 'connected' : 'disconnected'"
      ></span>
      Backend: {{ apiStore.isBackendConnected ? 'Đã kết nối' : 'Chưa kết nối' }}
      
      <span 
        v-if="apiStore.isDatabaseConnected"
        class="status-indicator connected ml-2"
      ></span>
      <span v-if="apiStore.isDatabaseConnected">Database: Đã kết nối</span>
    </div>
  </div>
</template>

<script setup>
import { useApiStore } from '@/stores/api.js'

const apiStore = useApiStore()
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.header p {
  margin-bottom: 15px;
}

.connection-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.status-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.connected {
  background: #28a745;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
}

.status-indicator.disconnected {
  background: #dc3545;
}

.ml-2 {
  margin-left: 8px;
}
</style>