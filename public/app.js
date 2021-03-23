// Init vue (to access data : vue.drawer = true)
let vue = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: () => ({
        input: "Hello",
        messages: [
            { sender: 0, text: "Hello Jarvis" },
            { sender: 1, text: "Bonjour Monsieur" },
            { sender: 1, text: "Que-puis je pour vous ?" },
        ],
    }),
    methods: {
        ask_jarvis: function (query) {
            this.messages.push({ sender: 0, text: query });
            get_jarvis(query).then((data) => {
                this.messages.push({ sender: 1, text: data.text });
                this.$refs.jarvis_audio.src = "/get_last_response_audio";
            });
            this.input = "";
        },
        reset_src: function () {
            this.$refs.jarvis_audio.src = "";
        },
    },
});

// Get data from the server
function get_jarvis(query) {
    return fetch("/get_jarvis?" + "query=" + encodeURI(query))
        .then((response) => {
            return response.json();
        })
        .catch(() => {
            return null;
        });
}
