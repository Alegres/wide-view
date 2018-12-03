<template>
  <div class="main">
     <!-- Main jumbotron for a primary marketing message or call to action -->
      <div class="jumbotron login">
        <div class="container">
            <h1 class="display-3">Sign in!</h1>
            <p>
                And start organizing yourself today, with the access to tones of useful features.
                It will take only a short moment so do not hesitate.
            </p>
        </div>

        <div v-if="errors && errors.length">
          <div v-for="error in errors">
            <b-alert show>{{error.message}}</b-alert>
          </div>
        </div>

        <form @submit="onSubmit">
        <div class="form-group">
            <input type="email"  v-model.trim="user.email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email">
            <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
        </div>
        <div class="form-group">
            <input type="password"  v-model.trim="user.password" class="form-control" placeholder="Password">
        </div>
        <div class="form-group repeat-password">
            <input type="password" v-model="repeatedPassword" class="form-control" placeholder="Repeat your password">
        </div>
        <button type="submit" class="btn btn-primary submit-form">Submit</button>
        </form>        
      </div>
     
  </div>

</template>

<script>

import axios from 'axios'

export default {
  name: 'Register',
  data () {
    return {
      user: {},
      errors: [],
      repeatedPassword: ''
    }
  },
  created() {
      if(localStorage.getItem('jwtToken'))
        this.$router.push({
            name: 'Main'
        });
  },
  methods: {
    onSubmit (evt) {
        evt.preventDefault();
        if(this.errors.length > 0)
            this.errors = [];

        if(this.user.email && this.user.password) {
            if(this.repeatedPassword === this.user.password) {
                if(this.user.password.length >= 6) {

                    axios.post(`http://localhost:3000/auth`, this.user)
                    .then(response => {
                        if(response.data.success) {
                            alert("You have been registered successfully!");
                            this.$router.push({
                                name: 'Login'
                            })
                        } else {
                            alert(response.data.msg);
                        }
                    })
                    .catch(e => {
                        console.log(e)
                        this.errors.push(e)
                    })
                } else {
                    this.errors.push({ message: "Password is too short, minimum 6 characters!" })           
                }
            } else {
                this.errors.push({ message: "Passwords are not identical!" });
            }
        } else {
            this.errors.push({ message: "You must fill all the fields!" });
        }
    },
  }
}
</script>

<style scoped>
@import '../../src/assets/css/register.css';
</style>