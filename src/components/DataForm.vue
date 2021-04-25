<template>
  <div class="DataForm">
    <div v-for="(field, name) in viewSchema" :key="`field-${name}`">
      <DataFormInner :field="field" :name="name" v-model="data[name]"/>
    </div>
  </div>
</template>

<script>
import DataFormInner from './DataFormInner';

export default {
  props: ['schema', 'value'],
  components: { DataFormInner },
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

<style lang="scss" scoped>
.custom {
  display: none;
}
</style>

<style lang="scss">
.DataForm {
  legend {
    display: table;
    float: left;
    margin: 0;
    padding: 0;
    width: 100%;

    + * {
      clear: both;
    }
  }

  fieldset {
    border: 0;
    padding: 0.01em 0 0 0;
    margin: 0;
    min-width: 0;
  }

  .form-group {
    background-color: rgba(200, 200, 200, .1);
    padding: 10px;
    display: block;
    border-radius: .2em;
    margin-bottom: 10px;
    border: 1px solid rgba(200, 200, 200, .3);

    legend {
      display: block;
      font-size: .9em;
      margin-bottom: 10px;
      padding-bottom: 0;
      line-height: 1em;
    }
  }
}
</style>