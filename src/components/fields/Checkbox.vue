<template>
  <b-form-checkbox 
    v-model="checked" 
    @input="$emit('input', $event)"
  ></b-form-checkbox>
</template>

<script>
export default {
  props: ['value'],
  data() {
    return {
      checked: this.value || false
    }
  },
  watch: {
    value(){
      this.checked = this.value;
    }
  }
}
</script>

<style>

</style>