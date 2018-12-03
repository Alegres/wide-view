<template>
  <div class="main">
    <!--<p>This is your workspace. You can start adding your tasks!</p>-->
    <p v-if="!isLoaded">Loading...</p>
    <div v-if="errors && errors.length">
        <div v-for="error in errors">
            <b-alert show>{{error.message}}</b-alert>
        </div>
    </div>
    <form @submit="addTask" v-if="isLoaded">
        <h2 class="add-task">Add a new task</h2>
        <h3 class="required-fields"><strong>Required fields</strong></h3>
        <div class="form-group">
            <input type="text" v-model.trim="task.name" class="form-control" aria-describedby="nameHelp" placeholder="Task name">
            <small id="nameHelp" class="form-text text-muted">Shortly name your task.</small>
        </div>
        <div class="form-group">
            <input type="text" v-model.trim="task.finalCriterion" class="form-control" aria-describedby="finalCriterionHelp" placeholder="Final criterion">
            <small id="finalCriterionHelp" class="form-text text-muted">What is the expected result of your task?</small>
        </div>
        <div class="form-group">
            <input type="text" v-model.trim="task.nextStep" class="form-control" aria-describedby="nextStepHelp" placeholder="Next step">
            <small id="nextStepHelp" class="form-text text-muted">What should be the next step to <strong>move on</strong> with this task?</small>
        </div>
        <h3 class="optional-fields"><strong>Optional fields</strong></h3>
        <div class="form-group">
            <input type="text" v-model="task.category" @click="toggleCategoryList" class="form-control" aria-describedby="categoryHelp" placeholder="Category" readonly>
            <small id="categoryHelp" class="form-text text-muted">Select a category for your task</small>

            <div class="category-list" v-if="categoryList" v-click-outside="toggleCategoryList">
                <div class="category-search">
                    <div class="form-group">
                        <input type="text" class="form-control" v-model="searchFilter" placeholder="Search category" />
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
                  <span class="category-name" @click="clearCategory">Clear category</span>
                </div>
            </div>
        </div>
        <div class="form-group">
            <input type="text" v-model.trim="taskOptionals.priority" @click="togglePriorityList" class="form-control" aria-describedby="priorityHelp" placeholder="Priority" readonly>
            <small id="priorityHelp" class="form-text text-muted">Select a priority for your task</small>

            <div class="priority-list" v-if="priorityList" v-click-outside="togglePriorityList">
                <div class="category-element" v-for="priority in prioritiesMapper">
                    <span class="category-name" @click="selectPriority(priority)">{{ priority.name }}</span>
                </div>
            </div>
        </div>
        <div class="form-group check">
          <div class="form-check">
            <input type="checkbox" class="form-check-input" v-model="taskOptionals.withDate" id="dateConfigCheck" @click="showDateConfig">
            <label class="form-check-label" for="dateConfigCheck">Task with date</label>
          </div>
        </div>
        <div class="form-group" v-if="dateConfig">

          <div class="row date-picker">
            <div class="col-md-12">
              <date-picker v-model="taskOptionals.date" :config="options"></date-picker>
            </div>
          </div>
        </div>       
        <button type="submit" class="btn btn-primary submit-form">Submit</button>
    </form> 
  </div>

</template>

<script>
import ClickOutside from "vue-click-outside";
import LoadingComponent from "@/components/LoadingComponent";
import axios from "axios";

export default {
  name: "AddTask",
  loading: LoadingComponent,
  created() {
    // Set default event data
    this.taskOptionals.date = new Date();
    this.taskOptionals.time = "00:00";
    this.taskOptionals.cycleAmount = 1;
    this.taskOptionals.cycleEnd = new Date();
    this.taskOptionals.customPeriod = "weeks";
  },
  data() {
    return {
      // Period for custom cycle
      customPeriodMapper: {
        days: "DAYS",
        weeks: "WEEKS",
        months: "MONTHS",
        years: "YEARS"
      },
      prioritiesMapper: [
        { name: "High", value: "HIGH" },
        { name: "Medium", value: "MEDIUM" },
        { name: "Low", value: "LOW" },
        { name: "Normal", value: "NORMAL" }
      ],
      // Show / hide priority list
      priorityList: false,
      // Should the task be created as the all day task?
      allDay: false,
      options: {
        format: "YYYY/MM/DD",
        useCurrent: true,
        collapse: false
      },
      timeOptions: {
        format: "HH:mm",
        useCurrent: true
      },
      // Show / hide date config
      repeatConfig: false,
      dateConfig: false,
      isLoaded: false,
      // Show / hide category list
      categoryList: false,
      task: {},
      taskOptionals: {},
      errors: [],
      categories: this.$parent.categories,
      searchFilter: "",
      searchFilterLocality: "",
      localityList: false,
      localities: this.$parent.localityCategories,
      // Property for displaying the custom cycle configuration
      customCycle: false,
    };
  },
  computed: {
    filteredCategories: function() {
      var matcher = new RegExp(this.searchFilter, "i");
      return this.$parent.categories.filter(function(category) {
        return matcher.test(category.name);
      });
    },
    filteredLocalities: function() {
      var matcher = new RegExp(this.searchFilterLocality, "i");
      return this.$parent.localityCategories.filter(function(category) {
        return matcher.test(category.name);
      });
    }
  },
  methods: {
    clearCategory() {
      this.task.category = "";
      this.categoryList = false;
    },
    // Show hide priority list
    togglePriorityList() {
      this.priorityList = !this.priorityList;
    },
    // Toggle the all day option
    toggleAllDay() {
      this.allDay = !this.allDay;
    },
    // Show the repeat config
    showRepeatConfig() {
      this.repeatConfig = !this.repeatConfig;
    },
    // Show the date config
    showDateConfig() {
      this.dateConfig = !this.dateConfig;
    },
    // Selecting priority
    selectPriority(priority) {
      this.taskOptionals.priority = priority.name;
      this.taskOptionals.priorityId = priority.value;
      this.priorityList = false;
    },
    // Method for selecting category from categories list
    selectCategory(category) {
      this.task.category = category.name;
      this.task.categoryId = category._id;
      this.categoryList = false;
    },
    selectLocality(category) {
      this.task.localityName = category.name;
      this.task.localityId = category._id;
      this.localityList = false;
    },
    // Toggle the list with the categories
    toggleCategoryList() {
      this.categoryList = !this.categoryList;
    },
    toggleLocalityList() {
      this.localityList = !this.localityList;
    },
    // Clear the tasks form
    clearForm() {
      this.task = {};
      this.taskOptionals = {};
      this.dateConfig = false;
      this.repeatConfig = false;
    },
    // Add task functionality
    addTask(e) {
      e.preventDefault();

      if (this.errors.length > 0) this.errors = [];

      if (this.task.name && this.task.finalCriterion && this.task.nextStep) {
        if (this.taskOptionals.withDate) {
          this.task.date = new Date(this.taskOptionals.date);
        } else {
          this.task.date = null;
        }

        if(this.taskOptionals.priority) {
          let priorityElement;

          for(let priorityElement of this.prioritiesMapper) {
            if(priorityElement.name == this.taskOptionals.priority)
              this.task.priority = priorityElement.value
          }
        }
        else
          this.task.priority = 'NORMAL'

        console.log(this.task);
        axios
          .post("http://localhost:3000/tasks", this.task)
          .then(response => {
            if (response.data.success) {
              this.errors.push({ message: "Task added correctly!" });

              // Reload parent tasks data
              this.$parent.reloadTasks();

              // Reload calendar events
              this.$parent.reloadCalendarEvents();

              // Push to the task
              this.$router.push({
                name: "ShowTask",
                params: { name: this.task.name, taskId: response.data.createdTask._id }                
              })
            } else {
              this.errors.push({ message: "Task already exists!" });
            }
          })
          .catch(e => {
            this.errors.push(e);
          });
      } else {
        this.errors.push({
          message: "You must fill all of the required fields!"
        });
      }
    }
  },
  directives: {
    ClickOutside
  },
  mounted() {
    this.isLoaded = true;
  },
  watch: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import "../../src/assets/css/add-tasks.css";
</style>