<template>
  <b-form-input
    v-model="localValue"
    :state="state"
    :placeholder="format"
    :aria-invalid="true"
    v-b-tooltip.hover 
    :title="format"
  />
</template>

<script>
import moment from 'moment';

export default {
  props: ['value'],
  data(){
    return {
      localValue: '',
      format: 'YYYY-MM-DD HH:mm:ss'
    }
  },
  computed: {
    state(){
      if (!this.localValue)
        return null;

      if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{2}:[0-9]{2}:[0-9]{2}$/gm.test(this.localValue.trim()))
        return false;

      return moment(this.localValue.trim(), this.format).isValid();
    }
  },
  mounted(){
    if (this.value)
      this.localValue = moment(this.value).format(this.format);
  },
  watch: {
    value(){
      const viewValue = moment(this.value).format(this.format);
      if (viewValue !== this.localValue)
        this.localValue = viewValue;
    },
    localValue(){
      if (this.state)
        this.$emit('input', this.localValue);
    }
  }
}
</script>

<style lang="scss" scoped>
.danger {
  box-shadow: 0 0 0 0.2rem rgba(255, 0, 0, 0.2) !important;
  border: 1px solid rgba(255, 0, 0, .5);
  color: darkred;
}
</style>