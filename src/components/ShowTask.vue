<template>
  <div class="main">
    <div v-if="!serverErrors.length">
      <!-- MODALS -->
        <modal v-if="setNextStep" @close="setNextStep = false">
            <div slot="wrapper" class="recurring-wrapper" v-click-outside="closeStepModal">
                <div v-if="modalErrors && modalErrors.length > 0">
                        <div v-for="error in modalErrors">
                            <b-alert show>{{error.message}}</b-alert>
                        </div>                    
                </div>
                <h3 slot="header" class="modal-header-custom">Mark this step as done!</h3>
                <div slot="body">
                    <form @submit="nextStepSubmit">
                      <div class="form-group">
                        <input type="text" class="form-control" v-model="newStep" placeholder="Enter the new next step" />
                      </div>
                       
                        <div class="next-step-buttons">
                          <button type="submit" class="btn btn-primary submit-form button">Submit</button>
                        </div>
                    </form>
                </div>
                <div slot="footer" class="confirm">                  
                </div>
            </div>
        </modal>

        <!-- SET DATE MODAL -->
        <modal v-if="setDateModal" @close="setDateModal = false">
            <div slot="wrapper" class="recurring-wrapper" v-click-outside="closeDateModal">
                <div v-if="errors && errors.length > 0">
                        <div v-for="error in errors">
                            <b-alert show>{{error.message}}</b-alert>
                        </div>                    
                </div>
                <h3 slot="header" class="modal-header-custom">Set the date</h3>
                <div slot="body">
                    <form @submit="dateSubmit">
                      <div class="form-group">
                        <date-picker v-model="newDate" :config="options"></date-picker>
                      </div>

                      <button type="submit" class="btn btn-primary submit-date button">Submit</button>

                    </form>
                </div>
                <div slot="footer" class="confirm">                  
                </div>
            </div>
        </modal>

        <!-- SELECT STATE -->
        <modal v-if="setStateModal" @close="setStateModal = false">
            <div slot="wrapper" class="recurring-wrapper" v-click-outside="closeStateModal">
                <div v-if="modalErrors && modalErrors.length > 0">
                        <div v-for="error in modalErrors">
                            <b-alert show>{{error.message}}</b-alert>
                        </div>                    
                </div>
                <h3 slot="header" class="modal-header-custom">Select the state</h3>
                <div slot="body">
                  <div class="states">
                    <div class="btn btn-success state" @click="selectState('OPEN')">OPEN</div>
                    <div class="btn btn-warning state" @click="selectState('PAUSED')">PAUSED</div>
                    <div class="btn btn-danger state" @click="selectState('DONE')">DONE</div>
                  </div>
                </div>
                <div slot="footer" class="confirm">                  
                </div>
            </div>
        </modal>

        <!-- SELECT PRIORITY -->
        <modal v-if="setPriorityModal" @close="setPriorityModal = false">
            <div slot="wrapper" class="recurring-wrapper" v-click-outside="closePriorityModal">
                <div v-if="modalErrors && modalErrors.length > 0">
                        <div v-for="error in modalErrors">
                            <b-alert show>{{error.message}}</b-alert>
                        </div>                    
                </div>
                <h3 slot="header" class="modal-header-custom">Select the priority</h3>
                <div slot="body">
                  <div class="states">
                    <div class="priority-element" @click="selectPriority('HIGH')">HIGH</div>
                    <div class="priority-element" @click="selectPriority('MEDIUM')">MEDIUM</div>
                    <div class="priority-element" @click="selectPriority('NORMAL')">NORMAL</div>
                  </div>
                </div>
                <div slot="footer" class="confirm">                  
                </div>
            </div>
        </modal>

        <!-- CHANGE CATEGORY -->
        <modal v-if="edit.category" @close="edit.category = false">
            <div slot="wrapper" class="recurring-wrapper" v-click-outside="closeCategoryModal">
                <div v-if="modalErrors && modalErrors.length > 0">
                        <div v-for="error in modalErrors">
                            <b-alert show>{{error.message}}</b-alert>
                        </div>                    
                </div>
                <h3 slot="header" class="modal-header-custom">Select category</h3>
                <div slot="body">
                <div class="category-list">
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
                    <div class="category-element clear">
                      <span class="category-name clear-category" @click="selectCategory()"><strong>Clear category</strong></span>
                    </div>
                </div>
                </div>
                <div slot="footer" class="confirm">                  
                </div>
            </div>
        </modal>

        <!-- Delete material modal window -->
        <modal v-if="removeMaterialModal" @close="removeMaterialModal = false" v-click-outside="closeRemoveModal">
            <h3 slot="header" class="modal-header-custom">Delete</h3>
            <p slot="body">Are you sure you want to delete this material?</p>
            <div slot="footer" class="confirm">
              <button class="btn btn-primary" @click="removeMaterial(selectedMaterial._id)">
                Yes
              </button>
              <button class="btn btn-secondary" @click="closeRemoveModal">
                No
              </button>                   
            </div>
        </modal>

        <!-- Deletetask modal window -->
        <modal v-if="removeTaskModal" @close="removeTaskModal = false" v-click-outside="closeTaskModal">
            <h3 slot="header" class="modal-header-custom">Delete</h3>
            <p slot="body">Are you sure you want to delete this task with all its data?</p>
            <div slot="footer" class="confirm">
              <button class="btn btn-primary" @click="removeTask">
                Yes
              </button>
              <button class="btn btn-secondary" @click="closeTaskModal">
                No
              </button>                   
            </div>
        </modal>

      <!-- Task data -->
        <div class="task-data">

          <!-- Task name -->       
          <div class="task-name">  
            <div v-if="editable">
              <h2 @dblclick="edit.name = true" v-if="!edit.name" class="edit-field">{{ task.name }}</h2>

              <div class="edit-div-h2" v-else>
                <input type="text" class="edit-input-h2" ref="taskNameInput" v-model="newTask.name" v-click-outside="performEdit" />
              </div>                            
            </div>
            <div v-else>
              <h2>{{ task.name }}</h2>
            </div>
          </div>

          <div class="remove-task" @click="removeTaskModal = true" v-if="editable"><v-icon name="trash" class="trash-ico"/></div>

            <div class="task-state">
              <div class="btn btn-success state-static" v-if="task.state == 'OPEN'" @click="setStateModal = true">{{ task.state }}</div>
              <div class="btn btn-danger state-static" v-if="task.state == 'DONE'"  @click="setStateModal = true">{{ task.state }}</div>
              <div class="btn btn-warning state-static" v-if="task.state == 'PAUSED'"  @click="setStateModal = true">{{ task.state }}</div>
            </div>

          <br class="clear" />          

          <!-- Categories -->
          <div v-if="editable">
            <div class="category" >
              <strong class="inline-block">Category:</strong>
              <div v-if="task.category" class="inline-block">
                <span @dblclick="edit.category = true" class="pointer">{{ task.category.name }}</span>
                <div class="category-rect" v-bind:style="{ 'background-color' : task.category.color }"></div>
              </div>
              <span @dblclick="edit.category = true" v-else>No category</span>
            </div>
          </div>
          <div class="category" v-else>
              <strong>Category:</strong>

              <div v-if="task.category" class="inline-block">
                <span @dblclick="edit.category = true">{{ task.category.name }}</span>
                <div class="category-rect" v-bind:style="{ 'background-color' : task.category.color }"></div>
              </div>
             <span v-else>No category</span>
          </div>

          <!-- PRIORITY -->
          <div v-if="editable">
            <div class="priority">
              <strong>Priority:</strong>

              <span @dblclick="setPriorityModal = true" v-if="task.priority" class="pointer">{{ task.priority }}</span>
              <span @dblclick="setPriorityModal = true" v-else><em>Click to set priority</em></span>
            </div>
          </div>
          <div class="priority" v-else>
              <strong>Priority:</strong>

              {{ task.priority }}
          </div>

            <table class="table">
                <thead>
                    <tr>
                    <th>Final criterion</th>
                    <th>Next step</th>
                    <th>Deadline</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <div v-if="editable">
                          <td @dblclick="edit.finalCriterion = true;" v-if="!edit.finalCriterion" class="criterion-edit">{{ task.finalCriterion }}</td>
                          <td v-else><input type="text" class="short-input" ref="criterionInput" v-model="newTask.finalCriterion" v-click-outside="performEdit" /></td>
                        </div>   
                        <div v-else>
                          <td>{{ task.finalCriterion }}</td>
                        </div>
                        <td v-if="editable">{{ task.nextStep }} <span @click="setNextStep = true"><v-icon class="next-step" name="feather-alt" /></span></td>
                        <td v-else>{{ task.nextStep }}</td>

                        <td v-if="editable">
                            <span v-if="task.date" @dblclick="setDateModal = true" class="pointer">{{ formatDate(task.date) }}</span>
                            <span v-else @dblclick="setDateModal = true">Click to set date</span>
                        </td>
                        <td v-else>
                            <span v-if="task.date">{{ formatDate(task.date) }}</span>
                            <span v-if="!task.date && task.state != 'DONE'">Click to set date</span>
                            <span v-if="!task.date && task.state == 'DONE'">-</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <ul class="nav nav-tabs" id="myTab" role="tablist">
                <li v-if="subtasksNav" class="nav-item selected">
                    <a class="nav-link" @click="toggleSubtasks()">Subtasks</a>
                </li>
                <li v-else class="nav-item">
                    <a class="nav-link" @click="toggleSubtasks()">Subtasks</a>
                </li>
                <li v-if="materialsNav" class="nav-item selected">
                    <a class="nav-link" @click="toggleMaterials()">Materials</a>
                </li>
                <li v-else class="nav-item">
                    <a class="nav-link" @click="toggleMaterials()">Materials</a>
                </li>
                <li v-if="historyNav" class="nav-item selected">
                    <a class="nav-link" @click="toggleHistory()">History</a>
                </li>
                <li v-else class="nav-item">
                    <a class="nav-link" @click="toggleHistory()">History</a>
                </li>
            </ul>

            <div class="nav-data subtasks" v-if="subtasksNav">
                <button class="btn btn-info sub-nav-btn" @click="toggleSubtaskForm()" v-if="editable">
                    <span v-if="subtaskForm">Show Subtasks</span>
                    <span v-if="!subtaskForm">Add Subtask</span>
                </button>

                <div class="subtask-details" v-if="subtaskDetails && !subtaskForm">
                  <div v-if="currentSubTask != null">
                    <Subtask :editable="editable" :subTaskInput="currentSubTask._id" :key="currentSubTask._id"></Subtask>
                  </div>
                  <div v-else>
                    Please select a subtask first.
                  </div>
                </div>                

                <div class="inside-nav">
                    <div class="subtask-list" v-if="!subtaskForm">
                        <div v-if="subTasks.length == 0">
                            <em>No subtasks yet!</em>
                        </div>

                        
                            <draggable class="draggable" v-model="subTasks" @start="drag" @end="drop">
                              <div class="subtasks-block" v-for="(element, index) in subTasks" :key="element._id">
                                <h2 class="subtask-header" @dblclick="loadSubtaskDetails(element)">{{ element.name }}</h2>
                              </div>
                            </draggable> 
                        

          
                    </div>

                </div>


                <div class="subtask-form" v-if="subtaskForm">
                    <div class="errors" v-if="subTaskFormErrors && subTaskFormErrors.length">
                        <div v-for="error in subTaskFormErrors">
                            <b-alert show>{{error.message}}</b-alert>
                        </div>
                    </div>
                    <form @submit="addSubTask">
                        <h2>Add subtask</h2>
                        <div class="form-group">
                            <input type="text" v-model.trim="subTask.name" class="form-control" aria-describedby="nameHelp" placeholder="Subtask name">
                            <small id="nameHelp" class="form-text text-muted">Shortly name your subtask.</small>
                        </div>
                        <div class="form-group">
                            <textarea v-model.trim="subTask.description" class="form-control textarea" aria-describedby="descriptionHelp" placeholder="Description"></textarea>
                            <small id="descriptionHelp" class="form-text text-muted">Shortly describe your subtask.</small>
                        </div>

                        <div class="form-group check">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" v-model="subTask.withDate" id="dateConfigCheck">
                                <label class="form-check-label" for="dateConfigCheck">Subtask with date</label>
                            </div>
                        </div>

                        <div class="row date-picker" v-if="subTask.withDate">
                            <div class="col-md-12">
                            <date-picker v-model="subTask.date" :config="options"></date-picker>
                            </div>
                        </div>

                        <div class="form-group check" v-if="subTask.withDate">
                            <div class="form-check all-day">
                            <input type="checkbox" class="form-check-input" v-model="subTask.allDay" id="allDayCheck">
                            <label class="form-check-label" for="allDayCheck">All day</label>
                            </div>
                        </div>

                        <div class="row time-picker" v-if="!subTask.allDay && subTask.withDate">
                            <div class="col-md-12">
                            <date-picker v-model="subTask.timeValue" :config="timeOptions"></date-picker>
                            </div>
                        </div>

   
                        <button type="submit" class="btn btn-primary submit-form button">Submit</button>
                    </form>
                </div>
            </div>

            <div class="nav-data materials" v-if="materialsNav">
                     <button class="btn btn-info sub-nav-btn" @click="toggleMaterialsForm()" v-if="editable">
                        <span v-if="materialsForm">Show materials</span>
                        <span v-if="!materialsForm">Add material</span>
                    </button>  

                <div class="inside-nav">
                    <div class="material-list" v-if="!materialsForm">
                        <div v-if="materials.length == 0">
                            <em>No materials.</em>
                        </div>
                        <div v-else>
                          <div class="material" v-for="material in materials">
                            <div class="material-name">
                              {{ material.name }}

                              <div class="material-remove-ico" @click="materialToRemove(material)" v-if="editable"><v-icon name="trash" class="small-ico" /></div>
                            </div>
                            
                            <div v-if="editable">
                              <div class="material-content" @dblclick="editMaterial(material)" v-if="!edit.material">
                                <vue-markdown>{{ material.content }}</vue-markdown>
                              </div>
                              <div class="material-content" v-if="edit.material && selectedMaterial._id == material._id">
                                <textarea class="form-control big-textarea" v-model="material.content" v-click-outside="performMaterialEdit"></textarea>
                                <small class="form-text text-muted">You can use markdown here!</small>
                              </div>
                            </div>
                            <div v-else>
                              <div class="material-content">
                                <vue-markdown>{{ material.content }}</vue-markdown>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>

                    <div v-if="materialsForm">
                      <div class="material-form">
                        <div class="errors" v-if="materialFormErrors && materialFormErrors.length">
                            <div v-for="error in materialFormErrors">
                                <b-alert show>{{error.message}}</b-alert>
                            </div>
                        </div>

                        <h2>Add material</h2>
                        <form @submit="addMaterial">
                          <div class="form-group">
                            <input type="text" class="form-control" v-model="material.name" placeholder="Name your materials" />
                          </div>
                          <div class="form-group">
                            <textarea v-model="material.content" class="form-control big-textarea" placeholder="Here write your content"></textarea>
                            <small class="form-text text-muted">You can use markdown here!</small>
                          </div>
                          <button type="submit" class="btn btn-primary submit-form">Submit</button>
                        </form>
                      </div>
                    </div>
                </div>             
            </div>

            <div class="nav-data history" v-if="historyNav">
                <History :inputHistory="taskHistory"></History>
            </div>
        </div>
        <!--<p>This is your workspace. You can start adding your tasks!</p>-->
        <p v-if="!isLoaded">Loading...</p>
        <div class="errors" v-if="errors && errors.length">
            <div v-for="error in errors">
                <b-alert show>{{error.message}}</b-alert>
            </div>
        </div>
    </div>

    <div v-else>
        <p>Task does not exist.</p>
    </div>

  </div>

</template>

<script>
import ClickOutside from "vue-click-outside";
import LoadingComponent from "@/components/LoadingComponent";
import axios from "axios";
import draggable from "vuedraggable";
import Modal from "@/components/Modal";
import Subtask from "@/components/Subtask";
import History from "@/components/History";
import DateFormatter from "@/mixins/formatDate";
import VueMarkdown from 'vue-markdown'

export default {
  name: "ShowTask",
  loading: LoadingComponent,
  mixins: [DateFormatter],
  data() {
    return {
      removeTaskModal: false,
      newTask : {},
      setPriorityModal: false,
      selectedCategory: {},
      searchFilter: "",
      selectedMaterial: {},
      removeMaterialModal: false,
      material: {},
      editable: true,
      setStateModal: false,
      modalErrors: [],
      newDate: new Date(),
      setDateModal: false,
      newStep: "",
      setNextStep: false,
      edit: {
        finalCriterion: false,
        name: false,
        date: false,
        material: false,
        category: false
      },
      currentSubTask: {},
      myArray: [{ id: 1, name: "Test" }, { id: 2, name: "Aba" }],
      customPeriodMapper: {
        days: "DAYS",
        weeks: "WEEKS",
        months: "MONTHS",
        years: "YEARS"
      },
      periodMapper: {
        1: "DAYS",
        2: "WEEKS",
        3: "MONTHS",
        4: "YEARS"
      },
      recurringEvent: {},
      subTaskFormErrors: [],
      materialFormErrors: [],
      timeOptions: {
        format: "HH:mm",
        useCurrent: true
      },
      customPeriod: "weeks",
      options: {
        format: "YYYY/MM/DD",
        useCurrent: true,
        collapse: false
      },
      isLoaded: false,
      subtasksNav: true,
      historyNav: false,
      materialsNav: false,
      subtaskDetails: false,
      subtaskForm: false,
      materialsForm: false,
      materials: [],
      errors: [],
      serverErrors: [],
      task: {},
      subTask: {},
      subTasks: [],
      movedSubTask: {},
      list: [
        { id: 1, name: "tet" },
        { id: 2, name: "bet" },
        { id: 3, name: "oka" }
      ],
      taskHistory: [],
      movingSubTask: false
    };
  },
  created() {
    this.task.name = this.$route.params.name;
    this.task.id = this.$route.params.taskId;

    this.subTask.cycleAmount = 1;
    this.subTask.cycleEnd = new Date();
    this.subTask.date = new Date();
    this.subTask.customPeriod = "days";
    this.subTask.timeValue = "00:00";

    // Load data
    this.loadDataForTask();
    this.loadSubtasks();
    this.loadMaterials();
    this.loadHistory();
  },
  computed: {
    orderedSubTasks: function() {
      return _.orderBy(this.subTasks, "priority");
    },
    filteredCategories: function() {
      var matcher = new RegExp(this.searchFilter, "i");
      return this.$parent.categories.filter(function(category) {
        return matcher.test(category.name);
      });
    }
  },
  watch: {},
  methods: {
    loadHistory() {
      axios
        .get("http://localhost:3000/history/task/" + this.task.id)
        .then(response => {
          this.taskHistory = response.data;
          console.log("GOT HISTORY")
          console.log(this.taskHistory);
        })
        .catch(e => {
          this.serverErrors.push(e);
        });      
    },
    closeTaskModal() {
      this.removeTaskModal = false;
    },
    goToCategory() {
      this.$router.push({
        name: "Category",
        params: {
          name: this.task.category.name,
          categoryId: this.task.category._id
        }
      });
    },
    closePriorityModal() {
      this.setPriorityModal = false;
    },
    selectCategory(category) {
      if (!category) this.newTask.category = null;
      else this.newTask.category = category._id;

      this.performEdit();
      this.closeCategoryModal();
    },
    closeCategoryModal() {
      this.edit.category = false;
    },
    editMaterial(material) {
      this.selectedMaterial = material;
      this.edit.material = true;
    },
    removeMaterial(id) {
      axios
        .delete("http://localhost:3000/materials/" + id)
        .then(response => {
          this.selectedMaterial = {};

          // Reload materials
          this.loadMaterials();

          // Close modal window
          this.closeRemoveModal();
        })
        .catch(e => {
          this.errors.push(e);
        });
    },
    removeTask() {
      axios
        .delete("http://localhost:3000/tasks/" + this.task._id)
        .then(response => {
          // Close modal window
          this.closeTaskModal();

          // Reload parent
          this.$parent.reloadTasks();
          this.$parent.reloadCalendarEvents();

          this.$router.push({
            path: '/tasks/all'
          })
        })
        .catch(e => {
          this.errors.push(e);
        });
    },    
    materialToRemove(material) {
      this.selectedMaterial = material;
      this.removeMaterialModal = true;
    },
    closeRemoveModal() {
      this.removeMaterialModal = false;
    },
    loadMaterials() {
      axios
        .get("http://localhost:3000/materials/task/" + this.task.id)
        .then(response => {
          this.materials = response.data;
        })
        .catch(e => {
          this.serverErrors.push(e);
        });
    },
    addMaterial(evt) {
      evt.preventDefault();

      if (this.materialFormErrors.length > 0) this.materialFormErrors = [];

      if (this.material.name && this.material.content) {
        this.material.task = this.task._id;

        axios
          .post("http://localhost:3000/materials", this.material)
          .then(response => {
            if (response.data.success) {
              this.materialFormErrors.push({
                message: "Material added correctly!"
              });
              this.loadMaterials();
              this.material = {};
            } else {
              this.materialFormErrors.push({
                message: "Material already exists!"
              });
            }
          })
          .catch(e => {
            this.materialFormErrors.push(e);
          });
      } else {
        this.materialFormErrors.push({
          message:
            "You must fill all the fields in order to add a new material!"
        });
      }
    },
    selectPriority(priority) {
      this.newTask.priority = priority;
      this.performEdit();

      this.setPriorityModal = false;
    },
    selectState(state) {
      this.newTask.state = state;
      this.performEdit();

      this.setStateModal = false;
    },
    dateSubmit(evt) {
      evt.preventDefault();
      let date = new Date(this.newDate);

      date.setDate(date.getDate() + 1);
      this.newTask.date = date;

      this.performEdit();
      this.setDateModal = false;
    },
    clearForm() {
      this.subTask = {};
    },
    nextStepSubmit(evt) {
      evt.preventDefault();

      if (this.modalErrors.length > 0) this.modalErrors = [];

      if (this.newStep) {
        axios
          .put("http://localhost:3000/tasks/" + this.task._id, {
            nextStep: this.newStep
          })
          .then(response => {
            if (response.data.success) {
              // Load task
              this.loadDataForTask();

              // Reload parent tasks
              this.$parent.reloadTasks();

              // Close step modal
              this.closeStepModal();
              this.newStep = "";
            } else {
              this.modalErrors.push({
                message: "Error!"
              });
            }
          })
          .catch(e => {
            console.log(e);
            this.modalErrors.push(e);
          });
      } else {
        this.modalErrors.push({ message: "Please set the next step first!" });
      }
    },
    closeStepModal() {
      this.setNextStep = false;
    },
    closeDateModal() {
      this.setDateModal = false;
    },
    closeStateModal() {
      this.setStateModal = false;
    },
    performEdit(evt) {
      if (evt) evt.preventDefault();

      // Escape edit mode
      for (let key in this.edit) {
        this.edit[key] = false;
      }

      console.log("PERFORM")

      // If no changes, no request to the server
      if(_.isEqual(this.newTask, this.task)) {
        return;
      } else {
      // Update task
      axios
        .put("http://localhost:3000/tasks/" + this.task._id, this.newTask)
        .then(response => {
          if (response.data.success) {
            // Reload task
            this.loadDataForTask();

            // Reload parent tasks
            this.$parent.reloadTasks();

            // Reload parent calendar events
            this.$parent.reloadCalendarEvents();
          } else {
            this.errors.push({
              message: "Error!"
            });
          }
        })
        .catch(e => {
          this.errors.push(e);
        });
      }
    },
    performMaterialEdit() {
      // Escape edit mode
      for (let key in this.edit) {
        this.edit[key] = false;
      }

      // Update material
      axios
        .put(
          "http://localhost:3000/materials/" + this.selectedMaterial._id,
          this.selectedMaterial
        )
        .then(response => {
          if (response.data.success) {
            // Reload materials
            this.loadMaterials();

            this.selectedMaterial = {};
          } else {
            this.errors.push({
              message: "Error!"
            });
          }
        })
        .catch(e => {
          this.errors.push(e);
        });
    },
    // Close Subtask details modal
    closeModal() {
      this.subtaskDetails = false;
    },
    // Load Subtask details
    loadSubtaskDetails(subTask) {
      this.subtaskDetails = true;
      this.currentSubTask = subTask;
    },
    drag() {},
    drop(evt) {
      // Dropping the subtask
      let counter = 1;

      // Set new subtask priorities
      this.subTasks.forEach(element => {
        element.priority = counter;
        counter++;
      });

      // Check if the previous moving action is done
      if (!this.movingSubTask) {
        this.movingSubTask = true;

        // Send the request to the server
        axios
          .post("http://localhost:3000/subtasks/move", this.subTasks)
          .then(response => {
            this.loadSubtasks();
            this.movingSubTask = false;
          })
          .catch(e => {
            this.subTaskFormErrors.push(e);
          });
      }
    },
    addSubTask(e) {
      e.preventDefault();

      if (this.subTaskFormErrors.length > 0) this.subTaskFormErrors = [];

      if (this.subTask.name && this.subTask.description) {
        this.subTask.priority = this.subTasks.length + 1;
        this.subTask.task = this.task.id;

        if (this.subTask.withDate) {
          if (this.subTask.allDay) {
            this.subTask.subTaskDate = new Date(this.subTask.date);
            this.subTask.time = false;
          } else {
            this.subTask.subTaskDate = new Date(this.subTask.date);

            const hours = parseInt(this.subTask.timeValue.slice(0, 2));
            const minutes = parseInt(this.subTask.timeValue.slice(3, 5));

            this.subTask.subTaskDate.setHours(hours + 1, minutes);
            this.subTask.time = true;
          }
        } else {
          this.subTask.subTaskDate = null;
          this.subTask.time = false;
        }

        this.subTask.user = this.task.user;

        axios
          .post("http://localhost:3000/subtasks", this.subTask)
          .then(response => {
            if (response.data.success) {
              this.subTaskFormErrors.push({
                message: "Subtask added correctly!"
              });
              this.loadSubtasks();
              this.clearForm();

              // Reload calendar events
              this.$parent.reloadCalendarEvents();
            } else {
              this.subTaskFormErrors.push({
                message: "Subtask already exists!"
              });
            }
          })
          .catch(e => {
            this.subTaskFormErrors.push(e);
          });
      } else {
        this.subTaskFormErrors.push({ message: "Fill all the fields!" });
      }
    },
    toggleMaterialsForm() {
      this.materialsForm = !this.materialsForm;
      this.materialFormErrors = [];
    },
    toggleSubtaskForm() {
      this.subtaskForm = !this.subtaskForm;
      this.subTaskFormErrors = [];
    },
    toggleSubtasks() {
      this.subtasksNav = true;
      this.historyNav = false;
      this.materialsNav = false;
    },
    toggleMaterials() {
      this.subtasksNav = false;
      this.historyNav = false;
      this.materialsNav = true;
    },
    toggleHistory() {
      this.subtasksNav = false;
      this.historyNav = true;
      this.materialsNav = false;
    },
    loadDataForTask() {
      axios
        .get("http://localhost:3000/tasks/" + this.task.id)
        .then(response => {
          this.task = response.data;
          this.newTask = _.cloneDeep(this.task);

          // Disable edit mode if needed
          if (this.task.state == "DONE" || this.task.state == "PAUSED")
            this.editable = false;
          else 
            this.editable = true;
        })
        .catch(e => {
          this.serverErrors.push(e);
        });
    },
    loadSubtasks() {
      axios
        .get("http://localhost:3000/subtasks/task/" + this.task.id)
        .then(response => {
          this.subTasks = response.data;
        })
        .catch(e => {
          this.serverErrors.push(e);
        });
    }
  },
  directives: {
    ClickOutside
  },
  mounted() {
    this.isLoaded = true;

    if (this.task.state == "DONE" || this.task.state == "PAUSED")
      this.editable = false;
  },
  components: {
    draggable,
    Modal,
    Subtask,
    VueMarkdown,
    History
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import "../../src/assets/css/show-task.css";
</style>