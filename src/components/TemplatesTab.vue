.result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 10px;
  font-weight: 500;
  text-align: center;
}

.result.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.result.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.result.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}.template-card.selected {
  border-color: #4facfe;
  background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
  box-shadow: 0 10px 25px rgba(79, 172, 254, 0.15);
}

.template-card.selected::before {
  opacity: 1;
}<template>
  <div class="templates-tab">
    <div class="templates-header">
      <h2>📋 ERP Update Templates</h2>
      <div class="templates-count">
        <span class="count-badge">{{ templatesStore.allTemplates.length }} Templates</span>
      </div>
    </div>

    <div class="template-grid">
      <div 
        v-for="template in templatesStore.allTemplates" 
        :key="template.id"
        class="template-card"
      >
        <div class="template-header">
          <div class="template-title">{{ template.name }}</div>
          <div class="template-id">{{ template.id }}</div>
        </div>
        
        <div class="template-description">{{ template.description }}</div>
        
        <div class="template-details">
          <div class="detail-row">
            <span class="detail-label">🗄️ Table:</span>
            <span class="detail-value">{{ template.table }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">📊 Column:</span>
            <span class="detail-value">{{ template.column }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">💾 Value:</span>
            <span class="detail-value">{{ template.defaultValue }}</span>
          </div>
        </div>
        
        <div class="template-example">
          <div class="example-label">📝 Example:</div>
          <div class="example-code">{{ template.example }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTemplatesStore } from '@/stores/templates'

// Stores
const templatesStore = useTemplatesStore()
</script>

<style scoped>
.templates-tab {
  max-width: 1200px;
}

.templates-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e1e5e9;
}

.templates-header h2 {
  margin: 0;
  color: #4facfe;
}

.templates-count {
  display: flex;
  align-items: center;
}

.count-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
}

.template-card {
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 15px;
  padding: 25px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.template-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.template-card:hover {
  border-color: #4facfe;
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(79, 172, 254, 0.2);
}

.template-card:hover::before {
  opacity: 1;
}

.template-card.selected {
  border-color: #4facfe;
  background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
  box-shadow: 0 10px 25px rgba(79, 172, 254, 0.15);
}

.template-card.selected::before {
  opacity: 1;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.template-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #4facfe;
  line-height: 1.2;
}

.template-id {
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.template-description {
  color: #666;
  margin-bottom: 20px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.template-details {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 600;
}

.detail-value {
  font-family: 'Courier New', monospace;
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #495057;
  font-weight: 500;
}

.template-example {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 12px;
}

.example-label {
  font-size: 0.8rem;
  color: #856404;
  font-weight: 600;
  margin-bottom: 8px;
}

.example-code {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: #856404;
  word-break: break-all;
  line-height: 1.3;
}

.result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 10px;
  font-weight: 500;
  text-align: center;
}

.result.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.result.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.result.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .template-grid {
    grid-template-columns: 1fr;
  }
  
  .templates-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
    text-align: center;
  }
  
  .template-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .template-id {
    align-self: flex-start;
  }
}
</style>