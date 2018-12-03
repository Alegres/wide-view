import axios from 'axios'

export default {
    data() {
      return {
        authorized: false,
        authenticatedUser: null
      }
    },
    created() {
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken')
        axios.get('http://localhost:3000/auth/current')
        .then(response => {
          this.authorized = true;
          this.authenticatedUser = response.data.user;
        })
        .catch(e => {
          this.$router.push({
            name: 'Login'
          })
        });        
    }
}