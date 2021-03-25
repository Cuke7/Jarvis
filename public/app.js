// Init vue (to access data : vue.drawer = true)
let vue = new Vue({
    el: "#app",
    vuetify: new Vuetify({
        theme: {
            themes: {
                light: {
                    primary: "#000080",
                    secondary: "#d1b83d",
                    tertiary: "#c9720e",
                    grey: "#faf7f7",
                    accent: "#3557bd",
                },
                dark: {
                    primary: "#000080",
                    grey: "#292828",
                },
            },
        },
    }),
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
        // Chat stuff
        input: "Hello",
        messages: [],
        // Map stuff
        map_init: { lat: 44.816976, lon: -0.58569 },
        map: null,
        chatHeight: 300,
        musicHeight: 300,
        // Music stuff
        playlists: [{ name: "Guitars", url: "https://www.youtube.com/playlist?list=PLY80CRqvcxEXtmbMSJDqIK4uk_FB3j5I8" }],
        time: 0,
        isPlaying: false,
        duration: "300",
        show_player: true,
        shuffle: { state: 1, icon: "mdi-shuffle-disabled" }, // 1 normal, 2 shuffle, 3 repeat
        current_loaded_song: null,
        current_loading_song: { loading: false },
        song_index: null,
        liste_lecture: { list: [], name: "", loading: false },
    }),
    watch: {
        // Music stuff
        time(time) {
            if (Math.abs(time - this.$refs.audio.currentTime) > 0.5) {
                this.$refs.audio.currentTime = time;
            }
        },
        isPlaying(isPlaying) {
            if (isPlaying) {
                this.play();
            } else {
                this.pause();
            }
        },
    },
    methods: {
        // Chat stuff
        ask_jarvis: function (query) {
            this.messages.push({ sender: 0, text: query });

            get_jarvis(query).then((data) => {
                this.messages.push({ sender: 1, text: data.text });

                this.$refs.jarvis_audio.src = "/jarvisAPI/get_last_response_audio";
            });
            this.input = "";
        },
        reset_src: function () {
            this.$refs.jarvis_audio.src = "";
        },
        setHeight: function () {
            this.chatHeight = 700 - vue.$refs.text_input.clientHeight;
            this.$refs.messages.scrollTop = 10000;

            this.musicHeight = 700 - vue.$refs.player.clientHeight;
        },
        // Map stuff
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
        // Music stuff
        change_shuffle() {
            if (this.shuffle.state == 3) {
                this.shuffle.state = 1;
                this.shuffle.icon = "mdi-shuffle-disabled";
                return;
            }

            if (this.shuffle.state == 2) {
                this.shuffle.state = 3;
                this.shuffle.icon = "mdi-shuffle-variant";
            }

            if (this.shuffle.state == 1) {
                this.shuffle.state = 2;
                this.shuffle.icon = "mdi-repeat";
            }
        },
        play() {
            this.show_player = true;
            this.isPlaying = true;
            this.$refs.audio.play();
        },
        pause() {
            this.isPlaying = false;
            this.$refs.audio.pause();
        },
        change_song(forward) {
            if (this.current_loading_song.title) {
                // Normal
                if (this.shuffle.state == 1) {
                    console.log("Normal, before", this.song_index);
                    if (forward) {
                        this.song_index = Math.min(this.song_index + 1, this.liste_lecture.list.length - 1);
                    } else {
                        this.song_index = Math.max(this.song_index - 1, 0);
                    }
                    this.load_song(this.liste_lecture.list[this.song_index]);
                    console.log("Normal, after", this.song_index);
                }

                // Repeat
                if (this.shuffle.state == 2) {
                    if (forward) {
                    } else {
                        this.song_index = Math.max(this.song_index - 1, 0);
                    }
                    this.load_song(this.liste_lecture.list[this.song_index]);
                }

                // Shuffle
                if (this.shuffle.state == 3) {
                    if (forward) {
                        this.song_index = Math.floor(Math.random() * this.liste_lecture.list.length);
                    } else {
                        this.song_index = Math.max(this.song_index - 1, 0);
                    }
                    this.load_song(this.liste_lecture.list[this.song_index]);
                }
            }
        },
        load_playlist(playlist) {
            //this.liste_lecture.loading = true;
            get_playlist(playlist.url).then((data) => {
                if (data != null) {
                    if (data.playlist.length > 1) {
                        let index = -1;
                        let playlist_temp = data.playlist;
                        for (const song of playlist_temp) {
                            index++;
                            song.loading = false;
                            song.loaded = false;
                            song.index = index;
                        }
                        this.liste_lecture.list = playlist_temp;
                        this.liste_lecture.name = data.name;
                        this.liste_lecture.loading = false;
                        this.search_loading = false;
                        this.current_loading_song = this.liste_lecture.list[0];
                        this.load_song(this.liste_lecture.list[0]);
                    }
                } else {
                    console.log("Loading playlist failed.");
                }
            });
        },
        load_song(song) {
            // Reset all the others items in the liste_lecture
            for (const song_temp of this.liste_lecture.list) {
                song_temp.loaded = false;
                song_temp.loading = false;
            }

            // Only the clicked song is showing the loading button
            this.current_loading_song = song;
            this.current_loading_song.loading = true;
            this.$forceUpdate();
            this.song_index = song.index;
            this.$refs.audio.src = "/musicAPI/get_audio?id=" + encodeURI(song.id);
        },
        player_is_ready() {
            this.play();
            this.current_loaded_song = this.current_loading_song;
            this.current_loaded_song.loaded = true;
            this.current_loaded_song.loading = false;
        },
    },
});

// Music stuff
function get_playlist(url) {
    return fetch("/musicAPI/get_playlist?url=" + encodeURI(url))
        .then((response) => {
            return response.json();
        })
        .catch(() => {
            return null;
        });
}

// Map stuff
vue.init_map();

// Chat stuff
function get_jarvis(query) {
    return fetch("/jarvisAPI/get_jarvis?" + "query=" + encodeURI(query))
        .then((response) => {
            return response.json();
        })
        .catch(() => {
            return null;
        });
}
