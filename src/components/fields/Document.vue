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

<style lang="scss">
.DocumentField {
  .DataForm {
    padding-left: 25px;
    counter-reset: section;

    .form-group {
      position: relative;

      &:before {
        display: block !important;
        position: absolute;
        left: -25px;
        background-color: #e0e0e0;
        width: 20px;
        text-align: center;
        border-radius: .2em;
        border: 1px solid #aaa;
        font-size: .7em;
        line-height: 1.7em;
        height: 20px;
        counter-increment: section;
        content: counter(section);
        top: 0;
      }
    }
  }
}
</style>