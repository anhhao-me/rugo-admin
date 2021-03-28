<template>
  <div>
    {{ viewValue }}
  </div>
</template>

<script>
import moment from 'moment';

export default {
  props: ['value'],
  computed: {
    viewValue(){
      if (!this.value)
        return '';

      return moment(this.value).format('YYYY-MM-DD HH:mm:ss');
    }
  }
}
</script>

<style>

</style>