<template>
  <div class="header">
    <div class="header-content">
      <h1>🗄️ ERP Database Update Tool</h1>
      <p>Công cụ cập nhật database ERP với template và điều kiện tùy chỉnh</p>
      <div class="connection-status">
        <div class="status-item">
          <span 
            class="status-indicator"
            :class="apiStore.isBackendConnected ? 'connected' : 'disconnected'"
          ></span>
          <span class="status-text">
            Backend: {{ apiStore.isBackendConnected ? 'Đã kết nối' : 'Chưa kết nối' }}
          </span>
        </div>
        
        <div v-if="apiStore.isDatabaseConnected" class="status-item">
          <span class="status-indicator connected"></span>
          <span class="status-text">Database: Đã kết nối</span>
        </div>
      </div>
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

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
  line-height: 1.2;
}

.header p {
  margin-bottom: 15px;
  font-size: 1.1rem;
  opacity: 0.9;
}

.connection-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
}

.status-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.connected {
  background: #28a745;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
}

.status-indicator.disconnected {
  background: #dc3545;
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.3);
}

.status-text {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

/* ========== RESPONSIVE STYLES ========== */

/* Tablet */
@media (max-width: 991px) {
  .header {
    padding: 25px 20px;
  }
  
  .header h1 {
    font-size: 2.2rem;
  }
  
  .header p {
    font-size: 1rem;
  }
  
  .connection-status {
    gap: 15px;
  }
  
  .status-item {
    padding: 6px 12px;
  }
}

/* Mobile Large */
@media (max-width: 767px) {
  .header {
    padding: 20px 15px;
  }
  
  .header h1 {
    font-size: 1.8rem;
    margin-bottom: 8px;
  }
  
  .header p {
    font-size: 0.95rem;
    margin-bottom: 12px;
  }
  
  .connection-status {
    flex-direction: column;
    gap: 10px;
  }
  
  .status-item {
    justify-content: center;
    padding: 8px 16px;
    min-width: 200px;
  }
  
  .status-text {
    font-size: 0.85rem;
  }
}

/* Mobile Small */
@media (max-width: 575px) {
  .header {
    padding: 15px 10px;
  }
  
  .header h1 {
    font-size: 1.5rem;
    line-height: 1.3;
  }
  
  .header p {
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .status-item {
    min-width: 180px;
    padding: 6px 12px;
  }
  
  .status-text {
    font-size: 0.8rem;
  }
  
  .status-indicator {
    width: 10px;
    height: 10px;
  }
}
</style>