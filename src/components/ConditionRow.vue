<template>
  <div class="condition-row">
    <input 
      :value="condition.column"
      type="text" 
      placeholder="Tên cột"
      @input="updateField('column', $event.target.value)"
    >
    
    <select 
      :value="condition.operator"
      @change="updateField('operator', $event.target.value)"
    >
      <option value="=">=</option>
      <option value="!=">!=</option>
      <option value="LIKE">LIKE</option>
      <option value=">">&gt;</option>
      <option value="<">&lt;</option>
      <option value=">=">&gt;=</option>
      <option value="<=">&lt;=</option>
    </select>
    
    <input 
      :value="condition.value"
      type="text" 
      placeholder="Giá trị"
      @input="updateField('value', $event.target.value)"
    >
    
    <button 
      type="button" 
      class="btn btn-danger btn-small" 
      @click="$emit('remove', condition.id)"
    >
      &times;
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  condition: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'remove'])

const updateField = (field, value) => {
  emit('update', props.condition.id, field, value)
}
</script>

<style scoped lang="scss">
@import '../assets/styles/variables.scss';

.condition-row {
  display: grid;
  grid-template-columns: 200px 120px 1fr 80px;
  gap: $spacing-md;
  align-items: center;
  padding: $spacing-md;
  background: $gray-50;
  border-radius: $border-radius;

  input, select {
    margin: 0;
  }
}

@media (max-width: 768px) {
  .condition-row {
    grid-template-columns: 1fr;
    gap: $spacing-sm;
  }
}
</style>