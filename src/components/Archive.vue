<template>
  <div class="main">
    <h2>Archive ({{ filteredArchiveTasks.length }})</h2>
    <!--<p>This is your workspace. You can start adding your tasks!</p>-->
    <p v-if="!isLoaded">Loading...</p>
    <div v-if="errors && errors.length">
        <div v-for="error in errors">
            <b-alert show>{{error.message}}</b-alert>
        </div>
    </div>

    <!-- List all tasks if any -->
    <div class="no-tasks" v-if="$parent.archiveTasks.length == 0">
        <p>... but currently there are no done tasks.</p>
    </div>

    <div v-else>
      <div class="filters">
        <input type="text" class="form-control" placeholder="Search task by name or use filter" v-model="search">
        <div class="flask-filters">
          <div class="flask-icon" @click="performFilters"><v-icon name="flask" /></div>
        </div>

        <div class="filter-options" v-if="filterOptions" v-click-outside="closeFilters">
          <strong>Category filters:</strong> [{{ this.filteredCategory }}]

            <div class="category-list">
                <div class="category-search">
                    <div class="form-group">
                        <input type="text" class="form-control no-indent" v-model="searchFilter" placeholder="Search category" />
                    </div>
                </div>
                <div v-if="filteredCategories.length == 0">
                  <p>No categories yet.</p>
                </div>
                <div class="category-element" v-for="category in filteredCategories">
                    <div class="category-color" v-bind:style="{ 'background-color': category.color }"></div>
                    <span class="category-name" @click="selectCategory(category)">{{ category.name }}</span>
                </div>
                <div class="category-element">
                  <span class="category-name clear-category" @click="clearCategory">Clear category</span>
                </div>
            </div>           

          <div class="remove-filters" @click="removeCategoryFilters"><v-icon class="remove-ico" name="window-close" /></div>
        </div>
      </div>

       <table class="table">
          <thead>
              <tr>
                <th>Task name</th>
                <th>Category</th>
              </tr>
          </thead>
          <tbody>
              <tr class="task" v-for="(task, index) in filteredArchiveTasks" @click="$parent.loadTask(task)">
                  <td>{{ task.name }}</td>
                  <td v-if="task.category">{{ task.category.name }}</td>
                  <td v-else>-</td>
              </tr>

              <tr class="no-matches" v-if="filteredArchiveTasks.length == 0">
                <td>No matches</td>
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
  name: "Archive",
  loading: LoadingComponent,
  mixins: [FilteredTasks],
  data() {
    return {
      searchFilter: "",
      filteredStatus: "",
      isLoaded: false,
      errors: []
    };
  },
  computed: {
    filteredCategories: function() {
      var matcher = new RegExp(this.searchFilter, "i");
      return this.$parent.categories.filter(function(category) {
        return matcher.test(category.name);
      });
    }    
  },
  methods: {
    selectCategory(category) {
      this.filteredCategory = category.name;
    },
    clearCategory() {
      this.filteredCategory = "";
      this.searchFilter = "";
    }
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