<template>
  <div id="app">
    <div class="loader" v-if="isLoad">
    </div>
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
    ...mapState(['isLoad']),
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

<style lang="scss" scoped>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loader {
  position: fixed;
  bottom: 1em;
  left: 1em;
  z-index: 2000;

  border: 5px solid #e0e0e0; /* Light grey */
  border-top: 5px solid #424242; /* Blue */
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin .5s linear infinite;
}
</style>