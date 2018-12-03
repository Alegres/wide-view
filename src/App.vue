<template>
  <div id="app">
<b-navbar id="main-menu" toggleable="md" variant="info">

  <div class="menu-wrapper">
    <b-navbar-toggle target="nav_collapse" class="toggle-main-nav"></b-navbar-toggle>

    <b-navbar-brand class="brand">Wide</b-navbar-brand>

    <b-collapse is-nav id="nav_collapse" class="menu-links">

      <b-navbar-nav>
        <b-nav-item class="nav-item" href="/" v-if="!this.token">Main page</b-nav-item>
        <b-nav-item class="nav-item" href="/#/tasks" v-if="this.token">Add task</b-nav-item>
        <b-nav-item-dropdown class="dropdown">

          <template slot="button-content">
            <span class="actions">Actions</span>
          </template>

          <div class="dropdown-items">
            <div v-if="!this.token">
              <b-dropdown-item class="dropdown-item" href="#/login">Login</b-dropdown-item>
              <hr>
              <b-dropdown-item class="dropdown-item" href="#/register">Register</b-dropdown-item>
            </div>

            <div v-if="this.token">
              <b-dropdown-item class="dropdown-item" @click="logout()">Logout</b-dropdown-item>
            </div>
            
          </div>
        </b-nav-item-dropdown>
      </b-navbar-nav>

    </b-collapse>
  </div>
</b-navbar>
  
    <router-view/>

    <footer class="footer">
      <hr>
      <div id="copyrights">Copyrights &copy; Wide 2018</div>
    </footer>
  </div>

</template>

<script>
import { EventBus } from './event-bus.js';

export default {
  name: 'App',
  created() {
    EventBus.$on('login', clickCount => {
      this.token = localStorage.getItem('jwtToken');
    });
  },
  data() {
    return {
      token: localStorage.getItem('jwtToken'),
    }
  },
  methods: {
    logout () {
      localStorage.removeItem('jwtToken');
      this.token = 0;

      this.$router.push({
        path: '/'
      })
    }
  }
}
</script>

<style>
#app {
  font-family: 'Ubuntu', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.footer {
  clear: both;
  text-align: center;
}

</style>

<style>
@import '../src/assets/css/app.css';
</style>