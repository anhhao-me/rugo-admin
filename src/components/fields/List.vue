<template>
  <div class="ListField">
    <DataForm
      :schema="childSchema"
      v-model="localValue"
      @custom="localValue.splice($event, 1)"
    />
    <b-button variant="outline-primary" size="sm" @click="localValue.push(null)">Thêm</b-button>
  </div>
</template>

<script>
export default {
  props: ['value', 'schema'],
  validate(schema){
    return !!schema.children;
  },
  beforeCreate: function () {
    this.$options.components.DataForm = require('../DataForm.vue').default
  },
  data(){
    return {
      localValue: []
    }
  },
  computed: {
    childSchema(){
      return this.localValue.map(() => this.schema.children);
    }
  },
  methods: {
  },
  mounted(){
    this.localValue = this.value || [];
  },
  watch: {
    value: {
      deep: true,
      handler(){
        this.localValue = this.value || [];
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
.ListField {
  .DataForm {
    padding-left: 25px;
    counter-reset: section;

    .form-group {
      position: relative;

      legend {
        display: none;
      }

      &:before, .custom {
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
      }

      .custom {
        top: 25px;
        border: 1px solid darkred;
        background-color: rgba(255, 0, 0, .2);
        padding: 0;
        color: darkred;

        &:before {
          content: "\e054";
          font-family: 'simple-line-icons';
        }
      }

      &:before {
        counter-increment: section;
        content: counter(section);
        top: 0;
      }
    }
  }
}
</style>