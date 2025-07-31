<template>
  <div 
    class="template-card"
    :class="{ selected: isSelected }"
    @click="$emit('select', template)"
  >
    <button 
      v-if="template.id.startsWith('CUSTOM_')"
      class="delete-btn" 
      @click.stop="$emit('delete', template.id)"
    >
      &times;
    </button>
    
    <div class="template-title">{{ template.name }}</div>
    <div class="template-description">{{ template.description }}</div>
    <div class="template-example">{{ template.example }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTemplateStore } from '../stores/template'

const props = defineProps({
  template: {
    type: Object,
    required: true
  }
})

defineEmits(['select', 'delete'])

const templateStore = useTemplateStore()

const isSelected = computed(() => 
  templateStore.selectedTemplate?.id === props.template.id
)
</script>

<style scoped lang="scss">
@import '../assets/styles/variables.scss';

.template-card {
  background: $white;
  border: 2px solid $gray-200;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  cursor: pointer;
  transition: $transition;
  position: relative;

  &:hover {
    border-color: $primary-color;
    transform: translateY(-5px);
    box-shadow: $shadow-md;
  }

  &.selected {
    border-color: $primary-color;
    background: $info-gradient;
  }
}

.template-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: $spacing-sm;
}

.template-description {
  color: $gray-600;
  margin-bottom: $spacing-md;
  font-size: 0.9rem;
}

.template-example {
  background: $gray-50;
  padding: $spacing-sm;
  border-radius: 8px;
  font-family: $font-mono;
  font-size: 0.8rem;
  color: $gray-700;
  border-left: 4px solid $primary-color;
}

.delete-btn {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  background: $danger-color;
  color: $white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1.2rem;
  display: none;
}

.template-card:hover .delete-btn {
  display: block;
}
</style>