<template>
  <div>
    <v-jsoneditor v-model="viewValue" v-if="!schema || !schema.children"/>
    <div v-if="schema && schema.children">
      <div v-for="(item, index) in viewValue" :key="`item-${index}-${item}`" class="item mb-2">
        <div class="d-flex">
          <component 
            v-bind:is="`${schema.children.type}field`.toLowerCase()" 
            :value="item"
            :schema="schema.children"
            @input="viewValue[index] = $event"
            class="flex-fill"
            :size="'sm'"
          />
          <div class="ml-2">
            <b-button 
              variant="outline-danger"  
              @click="viewValue.splice(index, 1)"
              size="sm"
            >
              <i class="icon-close"></i>
            </b-button>
          </div>
        </div>
      </div>
      <b-button variant="outline-primary" @click="appendRow" size="sm">
        <i class="icon-plus"></i>
      </b-button>
    </div>
  </div>
</template>

<script>

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
      viewValue: []
    }
  },
  methods: {
    loadValue(){     
      if (!this.value)
        return;

      this.viewValue = JSON.parse(JSON.stringify(this.value));
    },
    appendRow(){
      this.viewValue.push(null);
    }
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
.item {
  padding-left: 1em;
}
</style>