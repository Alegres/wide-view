<template>
  <div class="main">
     <!-- Main jumbotron for a primary marketing message or call to action -->
      <div class="jumbotron login">
        <div class="container">
          <h1 class="display-3">Sign up!</h1>
        </div>

        <div v-if="errors && errors.length">
          <div v-for="error in errors">
            <b-alert show>{{error.message}}</b-alert>
          </div>
        </div>

        <form @submit="onSubmit">
        <div class="form-group">
            <input type="email" v-model.trim="login.email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email">
            <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
        </div>
        <div class="form-group">
            <input type="password" v-model.trim="login.password" class="form-control" id="exampleInputPassword1" placeholder="Password">
        </div>
        <button type="submit" class="btn btn-primary submit-form">Submit</button>
        <p class="register">
          Don't have an account yet? <a href="#/register">Register</a> here!
        </p>
        </form>        
      </div>
     
  </div>

</template>

<script>
import axios from "axios";
import { EventBus } from "../event-bus.js";

export default {
  name: "Login",
  created() {
    if (localStorage.getItem("jwtToken")) {
      this.$router.push({
        name: "Main"
      });
    }
  },
  data() {
    return {
      login: {},
      errors: []
    };
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      if (this.errors.length > 0) this.errors = [];

      if (this.login.email && this.login.password) {
        const request = {
          user: {
            email: this.login.email,
            password: this.login.password
          }
        };
        axios
          .post(`http://localhost:3000/auth/login`, request)
          .then(response => {
            if (response.data.success) {
              localStorage.setItem("jwtToken", response.data.token);

              EventBus.$emit("login", 0);

              this.$router.push({
                name: "Tasks"
              });
            } else {
              alert(response.data.msg);
            }
          })
          .catch(e => {
            this.errors.push({ message: "Wrong data!" });
          });
      } else {
        this.errors.push({ message: "You must fill all the fields!" });
      }
    },
    register() {
      this.$router.push({
        name: "Register"
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

<style scoped>
@import "../../src/assets/css/login.css";
</style>