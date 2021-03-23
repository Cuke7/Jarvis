// Init vue (to access data : vue.drawer = true)
let vue = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    updated: function () {
        this.$nextTick(function () {
            this.setHeight();
        });
    },
    mounted: function () {
        this.$nextTick(function () {
            this.setHeight();
        });
    },
    data: () => ({
        input: "Hello",
        messages: [],
        map_init: { lat: 44.816976, lon: -0.58569 },
        map: null,
        messageBoxHeigh: 300,
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
        init_map: function () {
            this.map = L.map("map").setView([this.map_init.lat, this.map_init.lon], 18);
            //L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.map);
            L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY3VrZTciLCJhIjoiY2ttbWJ0Nmc0MGU5azJwbHdpZGRlY29tMCJ9.aKm7FB5v9A0_1C_p8Y6RAQ", {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: "mapbox/streets-v11",
                tileSize: 512,
                zoomOffset: -1,
                accessToken: "pk.eyJ1IjoiY3VrZTciLCJhIjoiY2ttbWJ0Nmc0MGU5azJwbHdpZGRlY29tMCJ9.aKm7FB5v9A0_1C_p8Y6RAQ",
            }).addTo(this.map);
            var marker = L.marker([this.map_init.lat, this.map_init.lon]).addTo(this.map);
            marker.bindPopup("➡️ Bordeaux : 3 min<br>➡️ Pessac 4 min ").openPopup();
        },
        setHeight: function () {
            this.messageBoxHeigh = 500 - vue.$refs.text_input.clientHeight;
            this.$refs.messages.scrollTop = 10000;
        },
    },
});
vue.init_map();

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
