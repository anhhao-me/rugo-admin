<template>
  <div>
    <v-jsoneditor v-model="viewValue" v-if="!schema || !schema.schema"/>
    <div v-if="schema && schema.schema" class="subField">
      <div :cols="allFieldTypes[`${field.type}field`.toLowerCase()].expanded ? 12 : 6" v-for="(field, name) in schema.schema" :key="`field-${name}`" class="px-2">
        <b-form-group :label="name">
          <component 
            v-bind:is="`${field.type}field`.toLowerCase()" 
            v-model="viewValue[name]"
            :schema="field"
          />
        </b-form-group>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

const FieldTypes = {};
const req = require.context('./', true, /\.vue$/i)
req.keys()
.forEach(key => {
  const name = key.match(/\w+/)[0];
  FieldTypes[`${name}Field`.toLowerCase()] = req(key).default;
});

export default {
  components: {
    ...FieldTypes
  },
  props: [
    'value',
    'schema'
  ],
  data(){
    return {
      viewValue: {},
      allFieldTypes: Object.assign({}, this.$options.components, Vue.options.components)
    }
  },
  methods: {
    loadValue(){     
      if (!this.value)
        return;

      this.viewValue = JSON.parse(JSON.stringify(this.value));
    },
  },
  mounted(){
    this.loadValue()
  },
  watch: {
    value(){
      if (JSON.stringify(this.value) !== JSON.stringify(this.viewValue))
        this.loadValue();
    },
    viewValue(){
      this.$emit('input', this.viewValue);
    }
  }
}
</script>

<style lang="scss" scoped>
.subField {
  border-left: 3px solid black;
  padding-left: 5px;
}
</style>