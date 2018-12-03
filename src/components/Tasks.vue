<template>
    <div class="workspace">
      <div class="toggle" v-on:click="toggle" ><v-icon name="bars" class="toggle-ico"/></div>

        <div class="workspace-wrapper">
          <div class="left-wrapper" v-if="show">
            <!-- Header -->
            
            

              <div class="side-bar">
                <div class="picker" v-if="showPicker" v-click-outside="togglePicker">
                  <div v-for="color in colors" class="colors-element" @click="pickColor(color)" v-bind:style="{ 'background-color': color }"></div>
                </div>

                <div class="welcome-header">
                  <v-icon name="user" class="user-ico"/>
                  <span class="user">{{ authenticatedUser.email }}</span>
                </div>

                <!-- Built-in menu -->
                <div class="categories-workspace">
                    <div class="categories-header default">
                      <div class="folder"><v-icon name="book" class="folder-ico" /></div>
                      <span class="default-category-name" @click="loadWorkspaceForDefault('all')">All tasks</span>
                    </div>
                    <div class="categories-header default">
                      <div class="folder"><v-icon name="calendar" class="folder-ico" /></div>
                      <span class="default-category-name" @click="loadWorkspaceForDefault('calendar')">Calendar</span>
                    </div>
                    <div class="categories-header default">
                      <div class="folder"><v-icon name="archive" class="folder-ico" /></div>
                      <span class="default-category-name" @click="loadWorkspaceForDefault('archive')">Archive</span>
                    </div>                    
                </div>

                <div class="categories-workspace user-categories">                  
                  <div class="categories-header">
                    <div class="folder"><v-icon name="folder" class="folder-ico" /></div>
                    <span>Categories</span>
                    <div class="categories-toggle" v-on:click="categoriesFormToggle"><v-icon name="plus" class="categories-ico" /></div>
                    <div class="categories-form" v-if="categoriesForm">
                      <form @submit="addCategory">
                        <div class="form-group">
                            <input type="name" v-model.trim="newCategory.name" ref="catName" class="form-control" aria-describedby="categoryHelp" placeholder="Enter category name">
                            
                            <div class="color-picker-wrapper">
                              <div class="color-picker" v-on:click="togglePicker" v-bind:style="{ 'background-color': newCategory.color }"></div>
                            </div>

                            <small id="emailHelp" class="form-text text-muted">Group your tasks into intuitive categories.</small> 
                        </div>
                      </form> 
                    </div>
                    <div v-if="categoriesErrors && categoriesErrors.length">
                      <div v-for="error in categoriesErrors">
                        <b-alert show>{{error.message}}</b-alert>
                      </div>
                    </div>                     
                  </div>
                  <div v-if="categories.length == 0">
                    <p>No categories yet.</p>
                  </div>                                    
                  <ul class="categories-list">
                    <li class="categories-list-element" v-for="category in categories">
                      <div class="category-color" v-bind:style="{ 'background-color': category.color }"></div>
                      <span class="category-name" @click="loadWorkspaceForCategory(category)">{{ category.name }}</span>
                    </li>
                  </ul>
                </div>
              </div>
          </div>

          <div class="tasks-view" ref="workspaceElement">
            <router-view :key="$route.fullPath"></router-view>

            <div v-if="errors && errors.length">
              <div v-for="error in errors">
                <b-alert show>{{error.message}}</b-alert>
              </div>
            </div>


          </div>
        </div>
  </div>


</template>

<script>
import axios from "axios";
import requireAuth from "@/mixins/requireAuth";
import ClickOutside from "vue-click-outside";
import Category from "@/components/Category";
import AddTask from "@/components/AddTask";

export default {
  name: "Tasks",
  mixins: [requireAuth],
  data() {
    return {
      colors: [
        "OliveDrab",
        "green",
        "PaleTurquoise",
        "Maroon",
        "BurlyWood",
        "CadetBlue",
        "Coral",
        "DarkCyan",
        "DarkOrchid",
        "DarkSlateGray",
        "GoldenRod",
        "GreenYellow",
        "IndianRed",
        "LightGreen",
        "SaddleBrown",
        "SlateBlue",
        "Violet",
        "Turquoise",
        "Tomato",
        "Thistle",
        "Tan"
      ],
      categoriesForm: false,
      window: {
        width: 0,
        height: 0
      },
      workspaceFloat: "",
      show: true,
      showPicker: false,
      categories: [],
      allTasks: [],
      tasks: [],
      archiveTasks: [],
      pausedTasks: [],
      errors: [],
      categoriesErrors: [],
      newCategory: {},
      newLocality: {},
      currentPickerSource: "",
      calendarEvents: []
    };
  },
  created() {
    // Set the Authroization token, to prove ourselves to the server
    axios.defaults.headers.common["Authorization"] = localStorage.getItem(
      "jwtToken"
    );

    // Get categories from the server
    this.loadCategories();

    // Set default color for category picker
    this.newCategory.color = "OliveDrab";

    // Get tasks from the server
    this.reloadTasks();

    // Get calendar events
    this.reloadCalendarEvents();

    // Add window listener to get the current screen height and resize the workspace
    window.addEventListener("resize", this.handleResize);
    this.handleResize();

    // Push to the default route
    this.$router.push({
      name: "AddTasks"
    });
  },
  destroyed() {
    // Remove the window listener
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    reloadCalendarEvents() {
      console.log("GETTING EVENTS")

      // Clear the array
      this.calendarEvents = [];
      
      // Get task calendar elements from the server
       axios
        .get("http://localhost:3000/tasks/calendar")
        .then(response => {
          const calendarTasks = response.data;

          console.log("TASKS")
          console.log(calendarTasks)

          // Push task calendar elements
          for (let element of calendarTasks) this.calendarEvents.push(element);
        })
        .catch(e => {
          console.log("ERROR");
          console.log(e);
        }); 

      // Get subtask calendar elements from the server
       axios
        .get("http://localhost:3000/subtasks/calendar")
        .then(response => {
          const calendarSubtasks = response.data;

          console.log("SUBS")
          console.log(calendarSubtasks)

          // Push subtask calendar elements
          for (let element of calendarSubtasks)
            this.calendarEvents.push(element);
        })
        .catch(e => {
          console.log("ERROR");
          console.log(e);
        }); 

      // Get recurring calendar elements from the server
      axios
        .get("http://localhost:3000/events/calendar")
        .then(response => {
          const calendarEvents = response.data;

          console.log("RECUR")
          console.log(calendarEvents)

          // Push subtask calendar elements
          for (let element of calendarEvents)
            this.calendarEvents.push(element);
        })
        .catch(e => {
          console.log("ERROR");
          console.log(e);
        });
    },
    reloadTasks() {
      // Save the context
      let self = this;

      // Clear all arrays
      this.allTasks = [];
      this.tasks = [];
      this.archiveTasks = [];
      this.pausedTasks = [];

      this.loadTasks().then(function(res) {
        self.allTasks = res;

        self.loadOpenTasks();
        self.loadArchiveTasks();
        self.loadPausedTasks();
      });
    },
    // Load workspace for default category
    loadWorkspaceForDefault(category) {
      this.$router.push({
        path: "/tasks/" + category
      });
    },
    // Load the specific task
    loadTask(task) {
      this.$router.push({
        name: "ShowTask",
        params: { name: task.name, taskId: task._id }
      });
    },
    // Load workspace for selected category
    loadWorkspaceForCategory(category) {
      this.$router.push({
        name: "Category",
        params: { name: category.name, categoryId: category._id }
      });
    },
    loadTasks() {
      // Get all categories from server
      return new Promise(function(resolve, reject) {
        axios
          .get("http://localhost:3000/tasks")
          .then(response => {
            resolve(response.data);
          })
          .catch(e => {
            this.errors.push(e);
            reject();
          });
      });
    },
    // Load open tasks
    loadOpenTasks() {
      let self = this;

      this.allTasks.forEach(function(element) {
        if (element.state == "OPEN") self.tasks.push(element);
      });
    },
    // Load archive tasks
    loadArchiveTasks() {
      let self = this;

      this.allTasks.forEach(function(element) {
        if (element.state == "DONE") self.archiveTasks.push(element);
      });
    },
    // Load paused tasks
    loadPausedTasks() {
      let self = this;

      this.allTasks.forEach(function(element) {
        if (element.state == "PAUSED") self.pausedTasks.push(element);
      });
    },
    // Load categories from server
    loadCategories() {
      // Get all categories from server
      axios
        .get("http://localhost:3000/categories")
        .then(response => {
          this.categories = response.data.categories;
        })
        .catch(e => {
          this.errors.push(e);
        });
    },
    togglePicker() {
      this.showPicker = !this.showPicker;
      this.$refs.catName.focus();
    },
    pickColor(color) {
      this.newCategory.color = color;
      this.togglePicker();
    },
    categoriesFormToggle() {
      this.categoriesForm = !this.categoriesForm;
      this.categoriesErrors = [];
    },
    // Clears the add category form
    clearCategory() {
      (this.newCategory.name = ""), (this.newCategory.color = "OliveDrab");
    },
    addCategory(evt) {
      evt.preventDefault();

      if (this.categoriesErrors.length > 0) this.categoriesErrors = [];

      if (this.newCategory.name) {
        if (this.newCategory.name.length <= 15) {

          axios
            .post(`http://localhost:3000/categories`, this.newCategory)
            .then(response => {
              if (response.data.success) {
                this.loadCategories();
                this.clearCategory();
                // Clear the add category form
              } else {
                this.categoriesErrors.push({
                  message: "Category already exists!"
                });
              }
            })
            .catch(e => {
              console.log(e);
              this.categoriesErrors.push(e);
            });

          this.loadCategories();
        } else {
          this.categoriesErrors.push({
            message:
              "Name of the category must not be longer than 15 characters"
          });
        }
      } else {
        this.categoriesErrors.push({
          message: "You must provide the category name!"
        });
      }
    },
    handleResize() {
      this.window.width = screen.width;
      this.window.height = screen.height;
      console.log(this.window.height + "/" + this.window.width);
    },
    toggle() {
      if (this.show) {
        // Hide navbar and set the workspace float
        this.show = false;
        this.workspaceFloat = "none";
      } else {
        // Show navbar and set the workspace float
        this.show = true;
        this.workspaceFloat = "left";
      }
    }
  },
  directives: {
    ClickOutside
  },
  components: {
    AddTask
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
@import "../../src/assets/css/tasks.css";
</style>