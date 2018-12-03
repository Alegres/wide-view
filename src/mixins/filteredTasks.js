export default {
    data() {
        return {
            filterOptions: false,
            search: "",
            filteredPriority: "",
            filteredStatus: "",
            filteredFilter: "",
            filteredCategory: "",
            showPausedTasks: false,           
        }
    },
    methods: {
        removePriorityFilters() {
            this.filteredPriority = "";
          },
          removeCategoryFilters() {
            this.filteredCategory = "";
          },
          // Perform filters
          performFilters() {
            if(this.filterOptions) {
              this.removePriorityFilters();
              this.showPausedTasks = false;
            }
      
            this.filterOptions = !this.filterOptions;
          },
          closeFilters() {
            this.filterOptions = false;
          },
    },
    computed: {
        filteredTasks() {
            return this.$parent.tasks.filter(item => {
               return (
                 item.name.includes(this.search) && item.priority.includes(this.filteredPriority) && ((item.category) ? item.category.name.includes(this.filteredCategory) : ((this.filteredCategory == "") ? true : false))
               )
            })
          },
          filteredArchiveTasks() {
            return this.$parent.archiveTasks.filter(item => {
              return (
                item.name.includes(this.search) && ((item.category) ? item.category.name.includes(this.filteredCategory) : ((this.filteredCategory == "") ? true : false))
              )
           })
          },
          filteredPausedTasks() {
            return this.$parent.pausedTasks.filter(item => {
               return (
                 item.name.includes(this.search) && item.priority.includes(this.filteredPriority)
               )
            })
          } 
    }
}