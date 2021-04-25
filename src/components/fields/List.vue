<template>
  <div class="ListField">
    <div 
      class="item"
      v-for="item in localValue"
      :key="item.id"
    >
      <DataFormInner 
        class="inner"
        :field="schema.children" 
        v-model="item.value"
      />
      <button type="button" class="custom" @click="removeValue(item.id)"></button>
    </div>
    <b-button variant="outline-primary" size="sm" @click="addValue()">Thêm</b-button>
  </div>
</template>

<script>
export default {
  props: ['value', 'schema'],
  validate(schema){
    return !!schema.children;
  },
  beforeCreate: function () {
    this.$options.components.DataFormInner = require('../DataFormInner.vue').default
  },
  data(){
    return {
      localValue: [],
      currentId: 0,
    }
  },
  computed: {
    childSchema(){
      return this.localValue.map(() => this.schema.children);
    }
  },
  methods: {
    addValue(value = null){
      this.localValue.push({
        id: this.currentId++,
        value
      });
    },
    removeValue(id){
      for (let i = 0; i < this.localValue.length; i++)
        if (this.localValue[i].id === id){
          this.localValue.splice(i, 1);
          return;
        }
    }
  },
  mounted(){
    this.localValue = [];
    for (let val of (this.value || [])){
      this.addValue(val);
    }
  },
  watch: {
    value: {
      deep: true,
      handler(){
        this.localValue = [];
        for (let val of (this.value || [])){
          this.addValue(val);
        }
      }
    },
    localValue: {
      deep: true,
      handler(){
        const actualValue = this.localValue.map(item => item.value);
        if (JSON.stringify(this.value) !== JSON.stringify(actualValue)){
          this.$emit('input', actualValue);
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ListField {
  counter-reset: section;

  .item {
    padding-left: 25px;
    position: relative;

    .inner {
      padding: 0;
      background-color: transparent;
      border: none;
      margin-bottom: 0;
    }

    &:before, .custom {
      display: block !important;
      position: absolute;
      left: 0px;
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
      top: 0px;
    }
  }
}
</style>