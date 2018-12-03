<template>
  <div class="main">
    <h2>Calendar</h2>
    <!--<p>This is your workspace. You can start adding your tasks!</p>-->
    
    <div v-if="errors && errors.length">
        <div v-for="error in errors">
            <b-alert show>{{error.message}}</b-alert>
        </div>
    </div>

  <p v-if="!isLoaded">Loading...</p>
  <div v-else>
    <full-calendar :events="events" :config="config"></full-calendar>
  </div>
  </div>

</template>

<script>
import ClickOutside from "vue-click-outside";
import LoadingComponent from "@/components/LoadingComponent";
import moment from 'moment';
import axios from "axios";
import { loadavg } from 'os';

export default {
  name: "Calendar",
  loading: LoadingComponent,
  data() {
    return {
      moment: moment,
      isLoaded: false,
      errors: [],
      config: {},
    };
  },
  methods: {

  },
  created() {

  },
  computed: {
    
  },
  directives: {
    ClickOutside
  },
  mounted() {
    this.isLoaded = true;
    let self = this;

    this.config = {
        defaultView: "month",
        header: {
          left: "prev,next today",
          center: "title",
          right: "month, agendaDay"
        },
        eventStartEditable: false,
        eventDurationEditable: false,
        eventRender: function(event, element){
            if(!event.ranges) {
              return element;
            }

            return (event.ranges.filter(function(range){ // test event against all the ranges

                return (event.start.isBefore(range.end) &&
                        event.end.isAfter(range.start));

            }).length)>0; //if it isn't in one of the ranges, don't render it (by returning false)
        },
        eventClick(event, jssEvent, view) {
          self.$router.push({
            name: "ShowTask",
            params: { name: event.task.name, taskId: event.task._id }
          });
        },
        events: this.$parent.calendarEvents,
      }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import "../../src/assets/css/all-tasks.css";
</style>