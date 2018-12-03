<template>
  <div class="main">
    <div v-if="!serverErrors.length">
        <h2 class="category-title" v-if="!editable">{{ categoryName }} ({{ filteredTasks.length }})</h2>
        <div class="edit-category" v-else>
            <form @submit="updateCategory">
                <div class="form-group">
                    <input type="text" class="form-control" v-click-outside="finishEdit" v-model="category.name" />
                </div>
            </form>
        </div>

        <!-- Delete modal window -->
        <modal v-if="removeCategoryModal" @close="removeCategoryModal = false">
            <h3 slot="header" class="modal-header-custom">Delete</h3>
            <p slot="body">Are you sure you want to delete this category? All of its tasks will land in the general category.</p>
            <div slot="footer" class="confirm">
              <button class="btn btn-primary" @click="deleteCategory">
                Yes
              </button>
              <button class="btn btn-secondary" @click="closeModal">
                No
              </button>                   
            </div>
        </modal>

        <div class="remove-category" @click="removeCategoryModal = true"><v-icon name="trash" class="trash-ico"/></div>
        <div class="edit-category" @click="editCategory"><v-icon name="edit" class="edit-ico"/></div>

        <div class="no-tasks" v-if="$parent.tasks.length == 0">
            <p>This category is empty.</p>
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

              <tr class="no-matches" v-if="filteredTasks.length == 0">
                <td>No matches</td>
              </tr>
          </tbody>
      </table>
    </div>

        <div v-if="errors && errors.length">
            <div v-for="error in errors">
                <b-alert show>{{error.message}}</b-alert>
            </div>
        </div>
    </div>
    <div v-else>
        <p>Category does not exist.</p>
    </div>
  </div>

</template>

<script>
import axios from "axios";
import ClickOutside from "vue-click-outside";
import Modal from "@/components/Modal";
import ShowTask from "@/components/ShowTask";
import FilteredTasks from "@/mixins/filteredTasks";

export default {
  name: "Category",
  mixins: [FilteredTasks],
  created() {
    this.categoryName = this.$route.params.name;
    this.filteredCategory = this.categoryName;
    this.categoryId = this.$route.params.categoryId;
    this.category.name = this.categoryName;

    // Load data
    this.loadDataForCategory();
  },
  data() {
    return {
      categoryName: "",
      categoryId: "",
      errors: [],
      serverErrors: [],
      editable: false,
      category: {},
      removeCategoryModal: false,
      filteredCategory: "",
    };
  },
  methods: {
    loadTask(task) {
      this.$router.push({
        name: "ShowTask",
        params: { name: task.name, taskId: task._id }
      });
    },
    // Delete current category
    deleteCategory() {
      axios
        .delete("http://localhost:3000/categories/" + this.categoryId)
        .then(response => {
          // Reload categories for parent and push to the new category
          this.$parent.loadCategories();

          this.$router.push({
            name: "AddTasks"
          });
        })
        .catch(e => {
          this.errors.push(e);
        });
    },
    closeModal() {
      this.removeCategoryModal = false;
    },
    updateCategory(e) {
      e.preventDefault();

      if (this.errors.length > 0) this.errors = [];

      if (this.category.name) {
        axios
          .put(
            "http://localhost:3000/categories/" + this.categoryId,
            this.category
          )
          .then(response => {
            console.log(response);
            if (response.data.success) {
              // Reload categories for parent and push to the new category
              this.$parent.getCategories();

              this.$router.push({
                name: "Category",
                params: {
                  name: this.category.name,
                  categoryId: this.categoryId
                }
              });
            } else {
              this.errors.push({
                message: "Category with this name already exists."
              });
            }
          })
          .catch(e => {
            this.errors.push(e);
          });
      } else {
        this.errors.push({ message: "Category must have a name!" });
      }
    },
    // Quit edit mode
    finishEdit() {
      this.editable = !this.editable;
    },
    // Load data for selected category
    loadDataForCategory() {
    },
    editCategory() {
      this.editable = true;
    },
    removeCategory() {}
  },
  directives: {
    ClickOutside
  },
  components: {
    Modal
  },
  watch: {
    // Push the user away, in case category does not exist
    serverErrors: function(newErrors, oldErrors) {
      if (!this.categoryId) {
        this.$router.push({
          path: "/tasks"
        });
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

<style scoped>
@import "../../src/assets/css/category.css";
</style>