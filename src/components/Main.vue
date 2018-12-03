<template>
  <div class="main">
     <!-- Main jumbotron for a primary marketing message or call to action -->
      <div class="jumbotron">
        <div class="container">
          <h1 class="display-3">Organize yourself!</h1>
          <p>Everyday tasks can be challenging. With Wide work becomes easier, much more organized & fun! Wide is completely free and easy-to-use, so the only thing you need to start is to create an account! Trust us, you won't regret.</p>
          <!--<p><a class="btn btn-primary btn-lg" href="#" role="button">Learn more</a></p>-->
        </div>
      </div>
      <div v-if="errors && errors.length">
        <div v-for="error in errors">
          <b-alert show>{{error.message}}</b-alert>
        </div>
      </div>   
      <div class="container posts">
          <div class="post" v-for="entry in entries">
            <h2 class="post-title">{{ entry.title }}</h2>
            <p class="post-meta">{{ entry.date }}</p>

            <p>{{ entry.content }}</p>
          </div>
      </div>      
  </div>


</template>

<script>
import axios from "axios";
import requireNoAuth from "@/mixins/requireNoAuth.js";

export default {
  name: "Main",
  mixins: [requireNoAuth],
  data() {
    return {
      entries: [],
      errors: []
    };
  },
  created() {
    axios
      .get("http://localhost:3000/entries")
      .then(response => {
        this.entries = response.data;

        this.entries.forEach(function(obj) {
          var cutDate = obj.date.slice(0, 10);
          obj.date = cutDate;
        });
      })
      .catch(e => {
        this.errors.push(e);
      });
  },
  methods: {
    details(entry) {
      this.$router.push({
        name: "ShowEntry",
        params: { id: entry._id }
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
@import "../../src/assets/css/main.css";
</style>