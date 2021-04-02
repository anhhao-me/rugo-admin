<template>
  <div class="RelationshipField">
    <model-select 
      :options="options"
      v-model="localValue"
      placeholder="select item"
      @searchchange="doSearch"
    />
  </div>
</template>

<script>
import { ModelSelect } from 'vue-search-select'

export default {
  props: ['value', 'schema'],
  validate(schema){
    return schema.ref && schema.with;
  },
  components: { 
    ModelSelect 
  },
  data(){
    return {
      localValue: null,
      options: []
    }
  },
  methods: {
    async doSearch(value){
      const { data } = await this.$api.list(this.schema.ref, 
        { [this.schema.with]: { $regex: value } }
      );
      this.options = data.map(item => ({
        value: item._id.toString(),
        text: item[this.schema.with]
      }));

      await this.preprocess();
    },
    rawToString(raw){
      if (!raw)
        return '';

      return raw.toString();
    },
    async preprocess(){
      if (!this.localValue)
        return;

      const doc = await this.$api.get(this.schema.ref, this.localValue);
      if (!doc)
        return;
      
      let isExists = false;
      for (let option of this.options)
        if (option.value.toString() === doc._id.toString())
          isExists = true;

      if (!isExists)
        this.options.push({
          value: doc._id.toString(),
          text: doc[this.schema.with]
        });
    }
  },
  async mounted(){
    this.localValue = this.rawToString(this.value);
    await this.doSearch('');
  },
  watch: {
    async localValue(){
      this.$emit('input', this.localValue || null);
    },
    async value(){
      const strValue = this.rawToString(this.value);
      if (this.localValue !== strValue){
        await this.preprocess();
        this.localValue = strValue;
      }
    }
  }
}
</script>

<style>

</style>