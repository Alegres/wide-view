import axios from 'axios'

export default {
    methods: {
        notifyCreatedTask(task) {
            // Notify server that the task has been created
            axios.post("http://localhost:3000/task/created", task).catch(err, function(err) {
                console.log(err);
            });
        },
        notifyUpdatedTask(task, fieldType, oldValue, newValue) {
            let postElement = {
                fieldType : fieldType,
                oldState : oldValue,
                newState : newValue,
                task : task
            }
            // Notify server that the task has been created
            axios.post("http://localhost:3000/task/updated", task).catch(err, function(err) {
                console.log(err);
            });
        },
    }
}