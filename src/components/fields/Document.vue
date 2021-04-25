<template>
  <div class="DocumentField">
    <DataForm
      :schema="schema.schema"
      v-model="localValue"
    />
  </div>
</template>

<script>
export default {
  props: ['value', 'schema'],
  validate(schema){
    return !!schema.schema;
  },
  beforeCreate: function () {
    this.$options.components.DataForm = require('../DataForm.vue').default
  },
  data(){
    return {
      localValue: {}
    }
  },
  mounted(){
    this.localValue = this.value || {};
  },
  watch: {
    value: {
      deep: true,
      handler(){
        this.localValue = this.value || {};
      }
    },
    localValue: {
      deep: true,
      handler(){
        if (JSON.stringify(this.value) !== JSON.stringify(this.localValue)){
          this.$emit('input', this.localValue);
        }
      }
    }
  }
}
</script>