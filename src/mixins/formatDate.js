export default {
    methods: {
        formatDateWithTime(date, option) {
            let returnDate = date.slice(0, 10);
            let returnTime = date.slice(11, 16);

            if (option == "date") return returnDate;

            return returnTime;
        },
        formatDate(date) {
            return this.formatDateWithTime(date, "date");
        }
    }
}