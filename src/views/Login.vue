<template>
  <b-container class="LoginView d-flex align-items-center justify-content-center">
    <b-form @submit="onSubmit">
      <h1>Login</h1>
      <b-alert variant="danger" show v-if="error">{{ error }}</b-alert>
      <b-form-group label="Email">
        <b-input id="email" type="email" v-model="form.email"></b-input>
      </b-form-group>
      <b-form-group label="Password">
        <b-input id="password" type="password" v-model="form.password"></b-input>
      </b-form-group>
      <b-form-group>
        <b-button type="submit" variant="primary">Login</b-button>
      </b-form-group>
    </b-form>
  </b-container>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  data(){
    return {
      form: {
        email: '',
        password: ''
      },
      error: ''
    }
  },
  computed: {
    ...mapState(['apiUrl']),
  },
  mounted(){
    
  },
  methods: {
    ...mapActions('auth', ['login']),
    async onSubmit(event){
      event.preventDefault()
      if (await this.login(this.form)){
        this.form.password = '';
        this.$router.push('/private/dashboard');
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.LoginView {
  height: 100vh;

  form {
    max-width: 320px;
    width: 100%;
  }
}
</style>