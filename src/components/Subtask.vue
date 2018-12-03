<template>
  <div>
    <div v-if="serverErrors && serverErrors.length > 0">
      <div v-for="error in serverErrors">
        <b-alert show>{{error.message}}</b-alert>
      </div>
    </div>

    <div v-if="!subTask">
      <p>Please select or create a new subtask.</p>
    </div>

    <div v-else>
      <!-- Subtask name -->
      <div class="edit-subtask-main">
        <div class="subtask-header">
          <div v-if="editable">
            <h3 @dblclick="edit.name = true" v-if="!edit.name">{{ subTask.name }}</h3>
            <input
              type="text"
              class="form-control"
              v-model="newSubtask.name"
              v-click-outside="performEdit"
              v-else
            >
          </div>
          <div v-else>
            <h3>{{ subTask.name }}</h3>
          </div>
        </div>

        <div class="action-icos" v-if="editable">
          <div class="trash-ico" @click="removeSubtaskModal = true">
            <v-icon name="trash"/>
          </div>
          <div class="clock-ico" @click="setTime = !setTime">
            <v-icon name="clock"/>
          </div>
          <div class="recurring-ico" @click="setRecurring = true" v-if="subTask.date">
            <v-icon name="calendar"/>
          </div>
        </div>

        <!-- Delete modal window -->
        <modal v-if="removeSubtaskModal" @close="removeSubtaskModal = false" v-click-outside="closeRemoveModal">
          <h3 slot="header" class="modal-header-custom">Delete</h3>
          <p slot="body">Are you sure you want to delete this subtask?</p>
          <div slot="footer" class="confirm">
            <button class="btn btn-primary" @click="removeSubtask">Yes</button>
            <button class="btn btn-secondary" @click="closeRemoveModal">No</button>
          </div>
        </modal>
      </div>

      <!-- Description -->
      <div class="description">
        <div v-if="editable">
          <p v-if="!edit.description">
            <em @dblclick="edit.description = true">{{ subTask.description }}</em>
          </p>
          <textarea
            class="form-control"
            v-model="newSubtask.description"
            v-click-outside="performEdit"
            v-else
          ></textarea>
        </div>
        <div v-else>
          <p>
            <strong>Description:</strong>
            <em>{{ subTask.description }}</em>
          </p>
        </div>
      </div>
      <div class="time">
        <div v-if="subTask.date && !subTask.time">
          <p>
            <strong>Date:</strong>
            {{ formatDate(subTask.date) }}
          </p>
        </div>
        <div v-if="subTask.date && subTask.time">
          <p>
            <strong>Date:</strong>
            {{ formatDateWithTime(subTask.date, "date") }}, {{ formatDateWithTime(subTask.date, "time") }}
          </p>
        </div>
      </div>

      <!-- Set recurring window -->
      <modal v-if="setTime" @close="setTime = false">
        <div slot="wrapper" class="recurring-wrapper" v-click-outside="closeTimeModal">
          <div v-if="errors && errors.length > 0">
            <div v-for="error in errors">
              <b-alert show>{{error.message}}</b-alert>
            </div>
          </div>
          <h3 slot="header" class="modal-header-custom">Set time for this Subtask</h3>
          <div slot="body">
            <form @submit="setSubtaskTime">
              <div class="row date-picker">
                <div class="col-md-12">
                  <date-picker v-model="date" :config="calendarOptions"></date-picker>
                </div>
              </div>

              <div class="form-group check">
                <div class="form-check all-day">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    v-model="allDay"
                    id="allDayCheck"
                    @click="toggleAllDay"
                  >
                  <label class="form-check-label" for="allDayCheck">All day</label>
                </div>
              </div>

              <div class="row time-picker" v-if="!allDay">
                <div class="col-md-12">
                  <date-picker v-model="time" :config="timeOptions"></date-picker>
                </div>
              </div>
              <button type="submit" class="btn btn-primary submit-form button">Submit</button>
            </form>
          </div>
          <div slot="footer" class="confirm"></div>
        </div>
      </modal>

      <!-- Recurring event exists -->
      <div class="recurring" v-if="recurringEvent">
        <p>
          <strong>Recurring:</strong>
          every {{ recurringEvent.distance }} {{ recurringEvent.cyclePeriod.toLowerCase() }} until {{ formatDate(recurringEvent.endOfCycle) }}
        </p>
        <div v-if="recurringEvent.days">[
          <span v-for="(day, index) in recurringEvent.days">
            {{ daysMapper[day] }}
            <span v-if="index < recurringEvent.days.length - 1">,</span>
          </span>]
        </div>
      </div>

      <div class="recurring">
        <!-- Set recurring window -->
        <modal v-if="setRecurring" @close="setRecurring = false">
          <div slot="wrapper" class="recurring-wrapper" v-click-outside="closeRecurringModal">
            <div v-if="errors && errors.length > 0">
              <div v-for="error in errors">
                <b-alert show>{{error.message}}</b-alert>
              </div>
            </div>
            <h3 slot="header" class="modal-header-custom">Create a recurring event</h3>
            <div slot="body">
              <form @submit="addRecurringEvent">
                <div class="custom-cycle">
                  <span>Every</span>
                  <div class="number-picker">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      v-model="cycleAmount"
                      class="form-control form-number"
                      aria-describedby="cycleNumber"
                      placeholder="1"
                    >
                  </div>
                  <div class="form-group period-picker">
                    <select class="form-control" v-model="customPeriod">
                      <option>days</option>
                      <option>weeks</option>
                      <option>months</option>
                      <option>years</option>
                    </select>
                  </div>
                  <br>
                  <span class="until">Untill</span>

                  <div class="col-md-12 until-picker">
                    <date-picker v-model="cycleEnd" :config="calendarOptions"></date-picker>
                  </div>

                  <div class="days-selector" v-if="customPeriod=='weeks'">
                    <div class="form-group">
                      <label for="daysSelector">Pick up days</label>
                      <select
                        multiple
                        class="form-control big-selector"
                        id="daysSelector"
                        v-model="cycleDays"
                      >
                        <option class="day-option" value="1">Monday</option>
                        <option class="day-option" value="2">Tuesday</option>
                        <option class="day-option" value="3">Wednesday</option>
                        <option class="day-option" value="4">Thursday</option>
                        <option class="day-option" value="5">Friday</option>
                        <option class="day-option" value="6">Saturday</option>
                        <option class="day-option" value="7">Sunday</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary submit-form button">Submit</button>
              </form>
            </div>
            <div slot="footer" class="confirm"></div>
          </div>
        </modal>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ClickOutside from "vue-click-outside";
import Modal from "@/components/Modal";
import DateFormatter from "@/mixins/formatDate";

export default {
  name: "Subtask",
  mixins: [DateFormatter],
  props: {
    subTaskInput: { type: String, required: true },
    editable: { type: Boolean }
  },
  created() {
    this.errors = [];

    this.subTask = { created: true }
    this.loadSubtask(this.subTaskInput);
  },
  data() {
    return {
      newSubtask: {},
      removeSubtaskModal: false,
      subTask: {},
      daysMapper: {
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
        7: "Sunday"
      },
      edit: { name: false, description: false },
      allDay: false,
      date: new Date(),
      cycleAmount: 1,
      cycleEnd: new Date(),
      cycleDays: [],
      time: "00:00",
      timeOptions: {
        format: "HH:mm",
        useCurrent: true
      },
      serverErrors: [],
      errors: [],
      customPeriod: "weeks",
      setTime: false,
      setRecurring: false,
      errors: [],
      calendarOptions: {
        format: "YYYY/MM/DD",
        useCurrent: true,
        collapse: false
      },
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
      recurringEvent: false
    };
  },
  watch: {
    customPeriod: function(newVal, oldVal) {
      if (this.customPeriod == "weeks") {
      } else {
        this.cycleDays = [];
      }
    }
  },
  methods: {
    closeRemoveModal() {
      this.removeSubtaskModal = false;
    },
    removeSubtask() {
      // Send request to the server
      axios
        .delete("http://localhost:3000/subtasks/" + this.subTask._id)
        .then(response => {
          // Reload subtasks for parent
          this.$parent.loadSubtasks();

          // Clear subtask for the component
          this.subTask = null;  

          this.$parent.currentSubTask = null;
          
          // Close modal window
          this.closeRemoveModal();

          // Reload calendar events
          this.$parent.$parent.reloadCalendarEvents();
        })
        .catch(e => {
          this.errors.push(e);
        });
    },
    performEdit() {
      // Escape edit mode
      for (let key in this.edit) {
        this.edit[key] = false;
      }

      if (_.isEqual(this.subTask, this.newSubtask)) return;
      else {
        // Update task
        axios
          .put(
            "http://localhost:3000/subtasks/" + this.subTask._id,
            this.newSubtask
          )
          .then(response => {
            if (response.data.success) {
              // Reload subtasks for parent
              this.$parent.loadSubtasks();

              // Reload subtask for child
              this.loadSubtask(this.subTask._id);

              // Reload parent calendar events
              this.$parent.$parent.reloadCalendarEvents();
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
    toggleAllDay() {
      this.allDay = true;
    },
    setSubtaskTime(evt) {
      evt.preventDefault();
      let timeObject = {};

      if (this.errors.length > 0) this.errors = [];
      if (this.date && (this.time || this.allDay)) {
        if (this.allDay) {
          timeObject.time = false;
          timeObject.date = new Date(this.date);
          console.log(timeObject.date);
          timeObject.date.setDate(timeObject.date.getDate() + 1);
          console.log(timeObject.date);
        } else {
          console.log("No all");
          timeObject.date = new Date(this.date);
          timeObject.time = true;

          const hours = parseInt(this.time.slice(0, 2));
          const minutes = parseInt(this.time.slice(3, 5));

          timeObject.date.setHours(hours + 1, minutes);

          console.log(timeObject.date);
          console.log(timeObject.time);
        }

        axios
          .put("http://localhost:3000/subtasks/" + this.subTask._id, timeObject)
          .then(response => {
            if (response.data.success) {
              console.log("AFTER POST");
              console.log(timeObject);

              this.loadSubtask(this.subTask._id);
              this.closeTimeModal();

              // Reload parent calendar events
              this.$parent.$parent.reloadCalendarEvents();
            } else {
              this.errors.push({
                message: "Error!"
              });
            }
          })
          .catch(e => {
            this.errors.push(e);
          });
      } else {
        this.errors.push({ message: "You must fill all of the fields!" });
      }
    },
    loadSubtask(id) {
      // Load subtask
      if(this.subTask != null) {
        axios
          .get("http://localhost:3000/subtasks/" + id)
          .then(response => {
            this.subTask = response.data;
            console.log("MY SUB");
            console.log(this.subTask);

            this.newSubtask = _.clone(this.subTask);
          })
          .catch(e => {
            this.serverErrors.push(e);
          });

        // Load recurring event
          axios
            .get("http://localhost:3000/subtasks/" + id + "/recurring")
            .then(response => {
              this.recurringEvent = response.data;
            })
            .catch(e => {
              this.serverErrors.push(e);
            });
      }
    },
    addRecurringEvent(evt) {
      // Prevent form from being sent
      evt.preventDefault();

      // Clear errors if any
      if (this.errors.length > 0) this.errors = [];

      // Create new JSON object
      let recurringEvent = {};

      // Set data for the object
      recurringEvent.distance = this.cycleAmount;
      recurringEvent.endOfCycle = new Date(this.cycleEnd);
      recurringEvent.endOfCycle.setDate(
        recurringEvent.endOfCycle.getDate() + 1
      );
      recurringEvent.days = this.cycleDays;
      recurringEvent.cyclePeriod = this.customPeriodMapper[this.customPeriod];

      // Set reference
      recurringEvent.user = this.subTask.user;
      recurringEvent.subtask = this.subTask._id;

      // Send request to the server (POST - new recurring event)
      axios
        .post("http://localhost:3000/events", recurringEvent)
        .then(response => {
          if (response.data.success) {
            this.subTask.recurringEvent = response.data.createdEventId;

            // Send request to the server (PUT - update subtask so it refers to the new event)
            axios
              .put(
                "http://localhost:3000/subtasks/" +
                  this.subTask._id +
                  "/recurring",
                {
                  recurringEvent: this.subTask.recurringEvent
                }
              )
              .then(response => {
                if (response.data.success) {
                  this.loadSubtask(this.subTask._id);

                  // Close the modal window
                  this.closeRecurringModal();                  

                  // Reload parent calendar events
                  this.$parent.$parent.reloadCalendarEvents();
                } else {
                  this.errors.push({
                    message: "Error!"
                  });
                }
              })
              .catch(e => {
                this.errors.push(e);
              });
          } else {
            this.errors.push({
              message: "Recurring event already exists!"
            });
          }
        })
        .catch(e => {
          this.errors.push(e);
        });
    },
    closeRecurringModal() {
      this.setRecurring = false;
    },
    closeTimeModal() {
      this.setTime = false;
    }
  },
  directives: {
    ClickOutside
  },
  components: {
    Modal
  }
};
</script>


<style scoped>
@import "../../src/assets/css/sub-task.css";
</style>