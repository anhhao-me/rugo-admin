<template>
  <b-form-group 
    :label="field.label || name"
  >
    <component 
      v-bind:is="`${parseField(field).type}field`" 
      :value="value"
      @input="$emit('input', $event)"
      :schema="parseField(field)"
    />
  </b-form-group>
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
  props: ['field', 'name', 'value'],
  components: {
    ...FieldTypes
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
}
</script>

<style>

</style>