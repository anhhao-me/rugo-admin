<template>
  <div v-if="viewValue">
    {{ viewValue.substr(0, 197) + (viewValue.length > 197 ? '...' : '') }}
  </div>
</template>

<script>
export default {
  props: ['value'],
  computed: {
    viewValue(){
      if (this.value === undefined || this.value === null)
        return '';

      if (typeof this.value === 'object')
        return JSON.stringify(this.value);

      return this.value.toString();
    }
  }
}
</script>

<style>

</style>