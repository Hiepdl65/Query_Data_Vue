#!/bin/bash

echo "🔧 Fixing ERP Updater Frontend setup..."

# Stop any running dev server
echo "⏹️ Stopping any running servers..."
pkill -f "vite"

# Clean up existing files
echo "🧹 Cleaning up..."
rm -rf node_modules package-lock.json

# Create proper directory structure
echo "📁 Creating directory structure..."
mkdir -p src/components/tabs
mkdir -p src/stores
mkdir -p src/assets/styles

# Create fixed package.json
echo "📦 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "erp-updater-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.4",
    "pinia": "^2.1.6",
    "axios": "^1.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.2.3",
    "sass": "^1.66.1",
    "vite": "^4.4.5"
  }
}
EOF

# Create fixed vite.config.js
echo "⚙️ Creating vite.config.js..."
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3001,
    open: true
  }
})
EOF

# Create index.html
echo "🌐 Creating index.html..."
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ERP Database Update Tool</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
EOF

# Create src/main.js
echo "🚀 Creating main.js..."
cat > src/main.js << 'EOF'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/styles/main.scss'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
EOF

# Create minimal SCSS files
echo "🎨 Creating SCSS files..."
cat > src/assets/styles/variables.scss << 'EOF'
// Colors
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$secondary-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
$white: #ffffff;
$gray-50: #f8f9fa;
$gray-200: #e1e5e9;
$gray-700: #333333;
$primary-color: #4facfe;
$success-color: #28a745;
$danger-color: #dc3545;
$font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$spacing-lg: 20px;
$spacing-xl: 30px;
$border-radius-xl: 20px;
$shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.1);
EOF

cat > src/assets/styles/main.scss << 'EOF'
@import './variables.scss';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: $font-family;
  background: $primary-gradient;
  min-height: 100vh;
  padding: $spacing-lg;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: $border-radius-xl;
  box-shadow: $shadow-lg;
  overflow: hidden;
}
EOF

# Create minimal App.vue to test
echo "📄 Creating minimal App.vue..."
cat > src/App.vue << 'EOF'
<template>
  <div class="container">
    <div class="header">
      <h1>🗄️ ERP Database Update Tool</h1>
      <p>Đang load components...</p>
    </div>
  </div>
</template>

<style lang="scss">
.header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 30px;
  text-align: center;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    font-weight: 700;
  }
}
</style>
EOF

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Setup fixed!"
echo ""
echo "🔥 Now run: npm run dev"
echo ""
echo "📝 Next steps:"
echo "1. Copy all Vue component files from the artifacts to their proper locations"
echo "2. Replace the minimal App.vue with the full version"
echo "3. The server should now start without import errors"
