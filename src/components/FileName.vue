<template>
  <div v-if="file">
    <i :class="`icon-${icon} mr-1`"></i>
    <strong v-if="file.dir">
      {{ file.name }}
    </strong>
    <span v-if="!file.dir">
      {{ file.name }}
    </span>
  </div>
</template>

<script>
export default {
  props: ['file'],
  computed: {
    icon(){
      if (this.file.dir)
        return 'folder';

      if (this.file.type && this.file.type.indexOf('image') === 0)
        return 'picture';

      return 'doc';
    }
  }
}
</script>

<style>

</style>