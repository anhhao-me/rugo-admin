<template>
  <div>
    <b-form-input 
      :value="value"
      @input="$emit('input', $event)" 
      v-if="realMode === 'input'"
      :size="size || ''"
    />
    <div v-if="realMode === 'preview'">{{ value }}</div>
  </div>
</template>

<script>
export default {
  allowModes: ['input', 'preview'],
  props: ['value', 'mode', 'size'],
  data(){
    return {
      realMode: this.mode || 'input'
    }
  }
}
</script>

<style>

</style>