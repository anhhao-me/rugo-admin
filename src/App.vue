<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  data(){
    return {
      isPushing: false
    }
  },
  computed: {
    ...mapState('notice', ['isNotice'])
  },
  methods: {
    ...mapMutations('auth', ['shiftError']),
    pushNotice(){
      if (!this.isNotice)
        return;

      const messages = this.$store.getters['notice/messages'];

      for (let message of messages){
        this.$bvToast.toast(message.text, {
          title: message.title || 'Notice',
          autoHideDelay: 2000,
          variant: message.type,
          appendToast: true,
          toaster: 'b-toaster-bottom-right'
        }); 
      }
    }
  },
  watch: {
    isNotice(){
      this.pushNotice();
    }
  }
}
</script>

<style lang="scss">
</style>
