<template>
  <div>{{ content }}</div>
</template>

<script>
export default {
  props: ['data'],
  computed: {
    content(){
      if (!this.data)
        return '';

      const b64 = this.data.split(',')[1];

      if (!b64)
        return '';

      return atob(b64);
    }
  }
}
</script>

<style>

</style>