<template>
  <div v-if="inputHistory.length == 0">No history for this task.</div>
  <div class="task-history" v-else>
    <table class="table">
      <thead>
        <tr>
          <th>Revision</th>
          <th>Date</th>
          <th>Action</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr class="task" v-for="element in inputHistory">
          <td>{{ element.revision }}</td>
          <td>{{ element.date }}</td>
          <td>{{ element.actionType }}</td>
          <td>
            <div v-for="(value, key) in element.value">
              <div v-if="element.subTask != null">
                <div v-if="subtaskPropertiesMapper[key]">
                  <strong>{{ subtaskPropertiesMapper[key] }}</strong>
                  : <span v-if="!value">-</span> <span v-else>{{ value }}</span>
                </div>                  
              </div>
              <div v-else>
                <div v-if="taskPropertiesMapper[key]">
                  <strong>{{ taskPropertiesMapper[key] }}</strong>
                  : <span v-if="!value">-</span> <span v-else>{{ value }}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";
import ClickOutside from "vue-click-outside";
import Modal from "@/components/Modal";
import DateFormatter from "@/mixins/formatDate";

export default {
  name: "History",
  props: {
    inputHistory: { type: Array }
  },
  mixins: [DateFormatter],
  created() {},
  data() {
    return {
      taskPropertiesMapper: {
        name: "Name",
        state: "State",
        finalCriterion: "Final criterion",
        nextStep: "Next step",
        date: "Date",
        priority: "Priority"
      },
      subtaskPropertiesMapper: {
        name: "Name",
        description: "Description",
        date: "Date",
        priority: "Priority",
      }
    };
  },
  watch: {},
  methods: {}
};
</script>


<style scoped>
@import "../../src/assets/css/history.css";
</style>