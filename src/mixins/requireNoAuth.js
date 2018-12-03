import axios from 'axios'

export default {
    created() {
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken')
        axios.get('http://localhost:3000/auth/current')
        .then(response => {
          this.$router.push({
            name: 'Tasks'
          })
        })
        .catch(e => {
          // Print all errors except Unauthorized (403)
        });        
    }
}