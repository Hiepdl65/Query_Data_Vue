<template>
  <div class="tabs-container">
    <!-- Mobile Menu Toggle -->
    <button 
      class="mobile-menu-toggle"
      @click="toggleMobileMenu"
      :class="{ active: showMobileMenu }"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
    
    <!-- Tabs -->
    <div class="tabs" :class="{ 'mobile-open': showMobileMenu }">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @click="selectTab(tab.id)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </div>
    </div>
    
    <!-- Mobile Overlay -->
    <div 
      v-if="showMobileMenu" 
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['tab-change'])

const showMobileMenu = ref(false)

const tabs = [
  { id: 'connection', icon: '🔗', label: 'Connect Databases' },
  { id: 'templates', icon: '📋', label: 'Templates' },
  { id: 'manual', icon: '✏️', label: 'Manual Update' },
  { id: 'batch', icon: '📊', label: 'Batch Update' },
  { id: 'query', icon: '🔍', label: 'Query Data' }
]

const selectTab = (tabId) => {
  emit('tab-change', tabId)
  closeMobileMenu()
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}
</script>

<style scoped>
.tabs-container {
  position: relative;
  background: white;
  border-bottom: 2px solid #e1e5e9;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  position: absolute;
  top: 15px;
  right: 20px;
  z-index: 1001;
}

.mobile-menu-toggle span {
  width: 100%;
  height: 3px;
  background: #4facfe;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.mobile-menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(8px, -8px);
}

.tabs {
  display: flex;
  background: white;
}

.tab {
  flex: 1;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 70px;
}

.tab:hover {
  background: #f8f9fa;
}

.tab.active {
  border-bottom-color: #4facfe;
  background: #f8f9fa;
  color: #4facfe;
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-label {
  font-size: 1rem;
}

.mobile-overlay {
  display: none;
}

/* ========== RESPONSIVE STYLES ========== */

/* Tablet */
@media (max-width: 991px) {
  .tab {
    padding: 15px 8px;
    font-size: 0.9rem;
  }
  
  .tab-icon {
    font-size: 1.1rem;
  }
  
  .tab-label {
    font-size: 0.85rem;
  }
}

/* Mobile Large */
@media (max-width: 767px) {
  .mobile-menu-toggle {
    display: flex;
  }
  
  .tabs {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    background: white;
    flex-direction: column;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    transition: right 0.3s ease;
    padding-top: 60px;
  }
  
  .tabs.mobile-open {
    right: 0;
  }
  
  .tab {
    flex: none;
    padding: 20px;
    border-bottom: 1px solid #e1e5e9;
    border-left: 3px solid transparent;
    justify-content: flex-start;
    text-align: left;
  }
  
  .tab.active {
    border-bottom-color: #e1e5e9;
    border-left-color: #4facfe;
  }
  
  .mobile-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
}

/* Mobile Small */
@media (max-width: 575px) {
  .mobile-menu-toggle {
    top: 12px;
    right: 15px;
    width: 25px;
    height: 25px;
  }
  
  .tabs {
    width: 250px;
    padding-top: 50px;
  }
  
  .tab {
    padding: 15px;
  }
  
  .tab-icon {
    font-size: 1rem;
  }
  
  .tab-label {
    font-size: 0.8rem;
  }
}

/* Desktop styles for larger screens */
@media (min-width: 1200px) {
  .tab {
    padding: 25px 20px;
  }
  
  .tab-icon {
    font-size: 1.3rem;
  }
  
  .tab-label {
    font-size: 1rem;
  }
}
</style>