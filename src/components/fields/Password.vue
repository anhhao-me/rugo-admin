<template>
  <b-form-input 
    type="password" 
    :value="value" 
    @input="$emit('input', $event)" 
  />
</template>

<script>
export default {
  props: ['value']
}
</script>

<style>

</style>