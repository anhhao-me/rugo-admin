<template>
  <div class="DataForm">
    <div v-for="(field, name) in viewSchema" :key="`field-${name}`">
      <b-form-group :label="field.label || name">
        <component 
          v-bind:is="`${parseField(field).type}field`" 
          v-model="data[name]"
          :schema="parseField(field)"
        />
      </b-form-group>
    </div>
  </div>
</template>

<script>
const FieldTypes = {};
const req = require.context('./fields', true, /\.vue$/i)
req.keys()
.forEach(key => {
  const name = key.match(/\w+/)[0];
  FieldTypes[`${name}Field`.toLowerCase()] = req(key).default;
});

export default {
  props: ['schema', 'value'],
  components: {
    ...FieldTypes
  },
  data(){
    return {
      data: this.value || {}
    }
  },
  computed: {
    viewSchema(){
      if (!this.schema)
        return {};

      const newSchema = {};
      for (let key in this.schema){
        if (this.schema[key].type)
          newSchema[key] = this.schema[key];
      }
      return newSchema;
    }
  },
  methods: {
    parseField(fieldSchema){
      const validSchema = {};

      for (let key in fieldSchema){
        validSchema[key.toLowerCase()] = fieldSchema[key];
      }

      validSchema.type = (validSchema.type || '').toLowerCase();

      if (!FieldTypes[`${validSchema.type}field`]){
        validSchema.type = 'text';
        validSchema.editor = 'code';
      }

      const field = FieldTypes[`${validSchema.type}field`];

      if (field.validate && !field.validate(fieldSchema)){
        validSchema.type = 'text';
        validSchema.editor = 'code';
      }

      return Object.assign({}, validSchema)
    }
  },
  watch: {
    data: {
      deep: true,
      handler(){
        this.$emit('input', this.data);
      }
    },
    value(){
      if (JSON.stringify(this.value) !== JSON.stringify(this.data)){
        this.data = this.value;
      }
    }
  }
}
</script>