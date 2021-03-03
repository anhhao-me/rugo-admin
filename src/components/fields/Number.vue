<template>
  <div>
    <b-form-input 
      type="number" 
      :value="value" 
      @input="$emit('input', $event)" 
      v-if="realMode === 'input'"
    />
    <div v-if="realMode === 'preview'">{{ value }}</div>
  </div>
</template>

<script>
export default {
  allowModes: ['input', 'preview'],
  props: ['value', 'mode'],
  data(){
    return {
      realMode: this.mode || 'input'
    }
  }
}
</script>

<style>

</style>