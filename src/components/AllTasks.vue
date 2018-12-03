<template>
  <div class="main">
    <h2>All of your tasks ({{ filteredTasks.length }})</h2>
    <!--<p>This is your workspace. You can start adding your tasks!</p>-->
    <p v-if="!isLoaded">Loading...</p>
    <div v-if="errors && errors.length">
        <div v-for="error in errors">
            <b-alert show>{{error.message}}</b-alert>
        </div>
    </div>

    <!-- List all tasks if any -->
    <div class="no-tasks" v-if="$parent.tasks.length == 0 && $parent.pausedTasks.length == 0">
        <p>... but currently there are no open tasks.</p>
        <router-link to="/tasks"><a class="btn btn-primary">Add a new task!</a></router-link>
    </div>

    <div v-else>
      <div class="filters">
        <input type="text" class="form-control" placeholder="Search task by name or use filter" v-model="search">
        <div class="flask-filters">
          <div class="flask-icon" @click="performFilters"><v-icon name="flask" /></div>
        </div>

        <div class="filter-options" v-if="filterOptions" v-click-outside="closeFilters">
          <strong>Priority filters:</strong> 
          [<span class="filter-element" @click="filteredPriority = 'HIGH'"><em>HIGH</em>, </span>
          <span class="filter-element" @click="filteredPriority = 'NORMAL'"><em>NORMAL</em>, </span>
          <span class="filter-element" @click="filteredPriority = 'MEDIUM'"><em>MEDIUM</em>, </span>
          <span class="filter-element" @click="filteredPriority = 'LOW'"><em>LOW</em></span>]
          
          <div class="remove-filters" @click="removePriorityFilters"><v-icon class="remove-ico" name="window-close" /></div>
          <br />
          <em class="filter-element" @click="showPausedTasks = true" v-if="!showPausedTasks">Show paused tasks</em>
          <em class="filter-element" @click="showPausedTasks = false" v-if="showPausedTasks">Hide paused tasks</em>
        </div>
      </div>
      <table class="table">
          <thead>
              <tr>
                <th>Task name</th>
                <th>Priority</th>
              </tr>
          </thead>
          <tbody>
              <tr class="task" v-for="(task, index) in filteredTasks" @click="$parent.loadTask(task)">
                  <td>{{ task.name }}</td>
                  <td>{{ task.priority }}</td>
              </tr>

              <tr class="no-matches" v-if="(filteredTasks.length == 0 && !showPausedTasks) || (showPausedTasks && filteredPausedTasks.length == 0)">
                <td v-if="!showPausedTasks"><em>No matches</em></td>
                <td v-else><em>No paused tasks</em></td>
              </tr>

              <tr class="task" v-if="showPausedTasks" v-for="task in filteredPausedTasks" @click="$parent.loadTask(task)">
                  <td>{{ task.name }}</td>
                  <td>{{ task.priority }}</td>              
              </tr>
          </tbody>
      </table>
    </div>
  </div>

</template>

<script>
import ClickOutside from "vue-click-outside";
import LoadingComponent from "@/components/LoadingComponent";
import FilteredTasks from "@/mixins/filteredTasks";
import axios from "axios";

export default {
  name: "AllTasks",
  loading: LoadingComponent,
  mixins: [FilteredTasks],
  data() {
    return {
      showPausedTasks: false,
      isLoaded: false,
      errors: [],
      tasks: {}
    };
  },
  created() {
  },
  methods: {

  },
  directives: {
    ClickOutside
  },
  mounted() {
    this.isLoaded = true;
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import "../../src/assets/css/all-tasks.css";
</style>