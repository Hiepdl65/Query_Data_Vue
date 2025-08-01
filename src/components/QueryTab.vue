<template>
  <div class="query-tab">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h2>🔍 Data Query & Export</h2>
        <p>Truy vấn dữ liệu tùy chỉnh với khả năng xuất Excel</p>
      </div>
    </div>

    <!-- Query Input Section -->
    <div class="query-section">
      <div class="section-header">
        <h3>📝 SQL Query</h3>
        <div class="query-actions">
          <button class="btn btn-small" @click="formatQuery" :disabled="!sqlQuery.trim()">
            ✨ Format
          </button>
          <button class="btn btn-small" @click="clearQuery" :disabled="!sqlQuery.trim()">
            🗑️ Clear
          </button>
        </div>
      </div>
      
      <div class="query-input-container">
        <textarea 
          v-model="sqlQuery"
          rows="10"
          class="sql-textarea"
          :class="{ 'has-content': sqlQuery.trim() }"
          placeholder="Nhập câu SQL SELECT của bạn...

Ví dụ:
SELECT TOP 100 * FROM PURTC WHERE TC030 = '1'

SELECT t1.TC001, t1.TC002, t2.TD004 
FROM PURTC t1 
LEFT JOIN PURTD t2 ON t1.TC001 = t2.TD001 AND t1.TC002 = t2.TD002 
WHERE t1.TC030 = '1'
ORDER BY t1.TC001, t1.TC002"
        ></textarea>
        
        <div v-if="sqlQuery.trim()" class="query-footer">
          <div class="query-info">
            <span class="info-item">📏 {{ sqlQuery.length }} characters</span>
            <span class="info-item">📄 {{ sqlQuery.split('\n').length }} lines</span>
            <span v-if="queryValidation.isValid" class="info-item valid">✅ Valid SELECT</span>
            <span v-if="!queryValidation.isValid && queryValidation.error" class="info-item invalid">❌ {{ queryValidation.error }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Query Controls -->
    <div class="controls-section">
      <div class="controls-card">
        <div class="controls-header">
          <h3>🚀 Execute Query</h3>
        </div>
        
        <div class="controls-actions">
          <button 
            class="btn btn-primary btn-large"
            @click="executeQuery"
            :disabled="!canExecuteQuery"
            :class="{ 'btn-loading': isExecuting }"
          >
            <span v-if="isExecuting" class="loading-icon">🔄</span>
            <span v-else>🔍</span>
            {{ isExecuting ? 'Executing...' : 'Execute Query' }}
          </button>
          
          <button 
            class="btn btn-success btn-large"
            @click="exportToExcel"
            :disabled="!canExport"
            :class="{ 'btn-loading': isExporting }"
          >
            <span v-if="isExporting" class="loading-icon">🔄</span>
            <span v-else>📊</span>
            {{ isExporting ? 'Exporting...' : 'Export to Excel' }}
          </button>
        </div>
        
        <div class="status-checks">
          <div class="check-item" :class="{ valid: apiStore.isDatabaseConnected }">
            <span class="check-icon">{{ apiStore.isDatabaseConnected ? '✅' : '❌' }}</span>
            <span class="check-text">Database Connected</span>
          </div>
          <div class="check-item" :class="{ valid: queryValidation.isValid }">
            <span class="check-icon">{{ queryValidation.isValid ? '✅' : '❌' }}</span>
            <span class="check-text">Valid SQL Query</span>
          </div>
          <div class="check-item" :class="{ valid: paginatedResults.length > 0 }">
            <span class="check-icon">{{ paginatedResults.length > 0 ? '✅' : '❌' }}</span>
            <span class="check-text">Has Results ({{ totalRows }} rows)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="queryResults.length > 0 || executionInfo" class="results-section">
      <div class="results-header">
        <div class="results-title">
          <h3>📊 Query Results</h3>
          <div class="results-stats" v-if="executionInfo">
            <span class="stat-badge">📄 {{ totalRows }} rows</span>
            <span class="stat-badge">📋 {{ queryColumns.length }} columns</span>
            <span class="stat-badge">⏱️ {{ executionInfo.executionTime }}ms</span>
          </div>
        </div>
        
        <!-- Table Controls -->
        <div class="table-controls" v-if="queryResults.length > 0">
          <div class="search-box">
            <input 
              v-model="searchTerm" 
              type="text" 
              placeholder="🔍 Search in results..."
              class="search-input"
            >
          </div>
          
          <div class="page-size-control">
            <label>Rows per page:</label>
            <select v-model="pageSize" @change="currentPage = 1">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Enhanced Data Table -->
      <div class="enhanced-table-container">
        <div class="table-wrapper" v-if="paginatedResults.length > 0">
          <table class="enhanced-results-table">
            <thead class="table-header-fixed">
              <tr>
                <th 
                  v-for="(column, index) in queryColumns" 
                  :key="column" 
                  class="table-header-cell"
                  :class="{ 'sortable': true }"
                  @click="sortBy(column)"
                >
                  <div class="header-content">
                    <span class="column-name">{{ column }}</span>
                    <span class="sort-indicator" v-if="sortColumn === column">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </div>
                  <div class="column-resizer"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(row, rowIndex) in paginatedResults" 
                :key="rowIndex" 
                class="table-row"
                :class="{ 'row-even': rowIndex % 2 === 0 }"
              >
                <td 
                  v-for="column in queryColumns" 
                  :key="column" 
                  class="table-cell"
                  :title="formatCellValue(row[column])"
                >
                  <div class="cell-content">
                    {{ formatCellValue(row[column]) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-container">
          <div class="pagination-info">
            Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredResults.length }} results
            <span v-if="searchTerm">(filtered from {{ totalRows }} total)</span>
          </div>
          
          <div class="pagination-controls">
            <button 
              class="pagination-btn" 
              @click="goToPage(1)" 
              :disabled="currentPage === 1"
            >
              ⏮️
            </button>
            <button 
              class="pagination-btn" 
              @click="previousPage" 
              :disabled="currentPage === 1"
            >
              ◀️
            </button>
            
            <div class="page-numbers">
              <span 
                v-for="page in visiblePages" 
                :key="page"
                class="page-number"
                :class="{ active: page === currentPage }"
                @click="goToPage(page)"
              >
                {{ page }}
              </span>
            </div>
            
            <button 
              class="pagination-btn" 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
            >
              ▶️
            </button>
            <button 
              class="pagination-btn" 
              @click="goToPage(totalPages)" 
              :disabled="currentPage === totalPages"
            >
              ⏭️
            </button>
          </div>
        </div>
        
        <div v-if="queryResults.length >= 5000" class="table-footer">
          <div class="limit-info">
            <div class="info-badge warning">
              ⚠️ Results limited to 5,000 rows for display performance
            </div>
            <div class="info-text">
              Use <strong>Export to Excel</strong> to get complete dataset without limits
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!queryResults.length && !isExecuting && !executionInfo" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>Ready to Query</h3>
      <p>Enter your SQL SELECT statement above and click Execute Query to see results</p>
    </div>

    <!-- Result Messages -->
    <div v-if="resultMessage" class="result-message" :class="resultMessage.type">
      <div class="message-icon">
        {{ resultMessage.type === 'success' ? '✅' : resultMessage.type === 'error' ? '❌' : 'ℹ️' }}
      </div>
      <div class="message-content">{{ resultMessage.text }}</div>
      <button class="message-close" @click="resultMessage = null">&times;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useApiStore } from '@/stores/api.js'

const apiStore = useApiStore()

// State
const sqlQuery = ref('')
const queryResults = ref([])
const queryColumns = ref([])
const executionInfo = ref(null)
const isExecuting = ref(false)
const isExporting = ref(false)
const resultMessage = ref(null)

// Pagination & Search
const currentPage = ref(1)
const pageSize = ref(25)
const searchTerm = ref('')
const sortColumn = ref('')
const sortDirection = ref('asc')

// Computed
const queryValidation = computed(() => {
  if (!sqlQuery.value.trim()) {
    return { isValid: false, error: 'Query is required' }
  }
  
  const trimmed = sqlQuery.value.trim().toUpperCase()
  if (!trimmed.startsWith('SELECT')) {
    return { isValid: false, error: 'Only SELECT statements allowed' }
  }
  
  const dangerous = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'EXEC']
  if (dangerous.some(keyword => trimmed.includes(keyword))) {
    return { isValid: false, error: 'Dangerous keywords detected' }
  }
  
  return { isValid: true, error: null }
})

const canExecuteQuery = computed(() => 
  apiStore.isDatabaseConnected && 
  queryValidation.value.isValid && 
  !isExecuting.value
)

const canExport = computed(() => 
  canExecuteQuery.value && 
  queryResults.value.length > 0 && 
  !isExporting.value
)

const filteredResults = computed(() => {
  if (!searchTerm.value) return sortedResults.value
  
  const term = searchTerm.value.toLowerCase()
  return sortedResults.value.filter(row => {
    return queryColumns.value.some(column => {
      const value = row[column]
      return value && value.toString().toLowerCase().includes(term)
    })
  })
})

const sortedResults = computed(() => {
  if (!sortColumn.value) return queryResults.value
  
  return [...queryResults.value].sort((a, b) => {
    const aVal = a[sortColumn.value]
    const bVal = b[sortColumn.value]
    
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    
    const comparison = aVal.toString().localeCompare(bVal.toString(), undefined, { numeric: true })
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

const totalRows = computed(() => queryResults.value.length)
const totalPages = computed(() => Math.ceil(filteredResults.value.length / pageSize.value))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredResults.value.length))

const paginatedResults = computed(() => {
  return filteredResults.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const visible = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) visible.push(i)
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) visible.push(i)
      visible.push('...', total)
    } else if (current >= total - 3) {
      visible.push(1, '...')
      for (let i = total - 4; i <= total; i++) visible.push(i)
    } else {
      visible.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) visible.push(i)
      visible.push('...', total)
    }
  }
  
  return visible
})

// Methods
const executeQuery = async () => {
  if (!canExecuteQuery.value) return
  
  isExecuting.value = true
  resultMessage.value = null
  
  try {
    const response = await apiStore.executeCustomQuery({
      sql: sqlQuery.value,
      limit: 5000 // Fixed limit for backend, pagination handles display
    })
    
    if (response.success) {
      queryResults.value = response.data.data || []
      queryColumns.value = response.data.columns || []
      executionInfo.value = {
        executionTime: response.data.executionTime,
        rowCount: response.data.rowCount,
        query: response.data.query
      }
      
      // Reset pagination
      currentPage.value = 1
      searchTerm.value = ''
      
      resultMessage.value = {
        type: 'success',
        text: `Query executed successfully! Retrieved ${queryResults.value.length} rows in ${response.data.executionTime}ms`
      }
    } else {
      queryResults.value = []
      queryColumns.value = []
      executionInfo.value = null
      resultMessage.value = {
        type: 'error',
        text: response.message
      }
    }
  } catch (error) {
    queryResults.value = []
    queryColumns.value = []
    executionInfo.value = null
    resultMessage.value = {
      type: 'error',
      text: `Query failed: ${error.message}`
    }
  } finally {
    isExecuting.value = false
    
    setTimeout(() => {
      if (resultMessage.value?.type === 'success') {
        resultMessage.value = null
      }
    }, 5000)
  }
}

const exportToExcel = async () => {
  if (!canExport.value) return
  
  isExporting.value = true
  resultMessage.value = null
  
  try {
    const filename = `query_results_${new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')}`
    
    const response = await apiStore.exportQueryToExcel({
      sql: sqlQuery.value,
      filename: filename
    })
    
    resultMessage.value = {
      type: 'success',
      text: `Excel file exported successfully! File: ${filename}.xlsx`
    }
  } catch (error) {
    resultMessage.value = {
      type: 'error',
      text: `Export failed: ${error.message}`
    }
  } finally {
    isExporting.value = false
    
    setTimeout(() => {
      if (resultMessage.value?.type === 'success') {
        resultMessage.value = null
      }
    }, 5000)
  }
}

// Pagination methods
const goToPage = (page) => {
  if (page !== '...' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Sorting
const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

const formatQuery = () => {
  let formatted = sqlQuery.value
    .replace(/\s+/g, ' ')
    .replace(/SELECT/gi, 'SELECT')
    .replace(/FROM/gi, '\nFROM')
    .replace(/WHERE/gi, '\nWHERE')
    .replace(/ORDER BY/gi, '\nORDER BY')
    .replace(/GROUP BY/gi, '\nGROUP BY')
    .replace(/LEFT JOIN/gi, '\nLEFT JOIN')
    .replace(/INNER JOIN/gi, '\nINNER JOIN')
    .replace(/AND/gi, '\n  AND')
    .replace(/OR/gi, '\n  OR')
  
  sqlQuery.value = formatted.trim()
}

const clearQuery = () => {
  sqlQuery.value = ''
  queryResults.value = []
  queryColumns.value = []
  executionInfo.value = null
  resultMessage.value = null
  currentPage.value = 1
  searchTerm.value = ''
}

const formatCellValue = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 50) + '...'
  }
  return value
}

// Watch for search term changes
watch(searchTerm, () => {
  currentPage.value = 1
})

watch(pageSize, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.query-tab {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Page Header */
.page-header {
  margin-bottom: 8px;
}

.header-content h2 {
  margin: 0 0 8px 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
}

.header-content p {
  margin: 0;
  font-size: 1rem;
  color: #6b7280;
}

/* Query Section */
.query-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.section-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%);
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.query-actions {
  display: flex;
  gap: 8px;
}

.query-input-container {
  padding: 24px;
}

.sql-textarea {
  width: 100%;
  min-height: 250px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  background: #fafafa;
  transition: all 0.2s ease;
}

.sql-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.sql-textarea.has-content {
  background: white;
}

.query-footer {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.query-info {
  display: flex;
  gap: 16px;
  font-size: 0.8rem;
}

.info-item {
  color: #6b7280;
}

.info-item.valid {
  color: #10b981;
  font-weight: 600;
}

.info-item.invalid {
  color: #ef4444;
  font-weight: 600;
}

/* Controls Section */
.controls-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.controls-card {
  padding: 24px;
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.controls-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.controls-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.btn-large {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
}

.btn-loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.status-checks {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 0.8rem;
}

.check-item.valid {
  background: #ecfdf5;
  color: #065f46;
}

/* Results Section */
.results-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.results-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%);
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.results-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.results-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.results-stats {
  display: flex;
  gap: 12px;
}

.stat-badge {
  font-size: 0.8rem;
  color: #1f2937;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.page-size-control {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.page-size-control label {
  color: #6b7280;
}

.page-size-control select {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

/* Enhanced Table */
.enhanced-table-container {
  padding: 24px;
}

.table-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.enhanced-results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  background: white;
}

.table-header-fixed {
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table-header-cell {
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  white-space: nowrap;
  position: relative;
  min-width: 120px;
}

.table-header-cell.sortable {
  cursor: pointer;
  user-select: none;
}

.table-header-cell.sortable:hover {
  background: #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.column-name {
  font-weight: 600;
  color: #1f2937;
}

.sort-indicator {
  font-size: 0.75rem;
  color: #3b82f6;
  font-weight: bold;
}

.column-resizer {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
}

.column-resizer:hover {
  background: #3b82f6;
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row.row-even {
  background: #fafafa;
}

.table-row.row-even:hover {
  background: #f3f4f6;
}

.table-cell {
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  max-width: 200px;
  min-width: 80px;
  position: relative;
}

.cell-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Pagination */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  min-width: 32px;
  text-align: center;
}

.page-number:hover {
  background: #f3f4f6;
}

.page-number.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.table-footer {
  margin-top: 16px;
  padding: 16px;
  background: #fef3cd;
  border: 1px solid #fde68a;
  border-radius: 8px;
}

.limit-info {
  text-align: center;
}

.info-badge.warning {
  background: #d97706;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.info-text {
  margin-top: 8px;
  font-size: 0.875rem;
  color: #92400e;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #1f2937;
}

/* Result Message */
.result-message {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.result-message.success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.result-message.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.result-message.info {
  background: #eff6ff;
  border: 1px solid #93c5fd;
  color: #1e40af;
}

.message-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.message-content {
  font-size: 0.875rem;
  line-height: 1.4;
  flex: 1;
}

.message-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-close:hover {
  opacity: 1;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  background: white;
}

.btn-outline {
  border-color: #d1d5db;
  color: #6b7280;
}

.btn-outline:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.btn-small {
  padding: 4px 8px;
  font-size: 0.8rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .controls-actions {
    flex-direction: column;
  }
  
  .table-controls {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .query-tab {
    gap: 16px;
  }
  
  .section-header, .controls-card, .query-input-container, .enhanced-table-container {
    padding: 16px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .query-actions {
    justify-content: flex-end;
  }
  
  .controls-header {
    margin-bottom: 16px;
  }
  
  .status-checks {
    flex-direction: column;
  }
  
  .results-title {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .results-stats {
    justify-content: center;
  }
  
  .sql-textarea {
    min-height: 200px;
    font-size: 0.8rem;
  }
  
  .table-wrapper {
    overflow-x: auto;
  }
  
  .enhanced-results-table {
    min-width: 600px;
  }
  
  .page-numbers {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .query-input-container {
    padding: 12px;
  }
  
  .sql-textarea {
    padding: 12px;
    font-size: 0.75rem;
  }
  
  .btn-large {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .results-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .table-cell, .table-header-cell {
    padding: 6px 4px;
    font-size: 0.8rem;
    min-width: 60px;
  }
  
  .result-message {
    position: static;
    margin-bottom: 16px;
    max-width: none;
  }
}
</style>