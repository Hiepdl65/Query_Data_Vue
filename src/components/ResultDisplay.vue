<template>
  <div class="result" :class="type" v-html="message"></div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'error'].includes(value)
  }
})

defineEmits(['close'])
</script>

<style scoped>
.result {
  margin-top: 20px;
  padding: 20px;
  border-radius: 15px;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
}

.result.success {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #155724;
  border: 2px solid #c3e6cb;
}

.result.error {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #721c24;
  border: 2px solid #f5c6cb;
}

.result.info {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  color: #0c5460;
  border: 2px solid #bee5eb;
}
</style>