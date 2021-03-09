<template>
  <div>
    <b-form-checkbox v-model="checked" v-if="!mode || mode === 'input'" @input="$emit('input', $event)"></b-form-checkbox>
    <div class="custom-control custom-control-inline custom-checkbox" v-if="mode === 'preview'">
      <input type="checkbox" class="custom-control-input" :checked="checked">
      <label class="custom-control-label"></label>
    </div>
  </div>
</template>

<script>
export default {
  allowModes: ['input', 'preview'],
  props: ['value', 'mode'],
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