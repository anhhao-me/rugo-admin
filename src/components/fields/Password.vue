<template>
  <div>
    <b-form-input 
      type="password" 
      :value="value" 
      @input="$emit('input', $event)" 
      v-if="realMode === 'input'"
    />
    <div v-if="realMode === 'preview'">{{ value }}</div>
  </div>
</template>

<script>
export default {
  allowModes: ['input'],
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