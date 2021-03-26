var express = require("express");
var router = express.Router();
var rp = require("request-promise");
var rqst = require("request");

const action = require("actions-on-google");
const { WebhookClient } = require("dialogflow-fulfillment");

// Endpoints
router.post("/fulfillment", express.json(), fulfillment);

let flag = false;
let tata;
let data;

// Get playlist object from playlist url
async function fulfillment(req, resp) {
    const agent = new WebhookClient({ request: req, response: resp });

    function welcome(agent) {
        agent.add("Bienvenue sur jarvis");
    }

    function defaultFallback(agent) {
        agent.add("Désolé, jarvis n'a pas compris");
    }

    async function get_tram_times(agent) {
        //console.log("Starting initial itent");
        //console.log(new Date());
        //console.log("--");

        let station = agent.parameters.tram_stops;
        let direction = agent.parameters.direction;
        agent.add("Hello");
        flag = false;
        request_times(station, direction);

        await new Promise((r) => setTimeout(r, 3500));
        agent.setFollowupEvent("customEvent1");
    }

    async function follow_one(agent) {
        //console.log("Starting follow up");
        //console.log(new Date());
        //console.log("--");

        await new Promise((r) => setTimeout(r, 3500));
        if (!flag) {
            agent.setFollowupEvent("customEvent1");
        }

        if (flag) {
            agent.add("Direction " + data.data[0].toLowerCase());
            flag = false;
            console.log("Done");
            console.log(new Date());
        } else {
            agent.add("Désolé, une erreur s'est produite...");
        }
    }

    async function request_times(station, direction) {
        let url = "https://" + req.get("Host") + "/tramAPI/get_station_times?station=" + station;

        let toto = await rp(url);

        tata = JSON.parse(toto);

        console.log(direction);

        if (direction == "Bordeaux") {
            data = tata[0];
        } else {
            data = tata[1];
        }

        flag = true;

        //console.log("Tram done");
        //console.log(new Date());
        //console.log("--");
    }

    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Default Fallback Intent", defaultFallback);
    intentMap.set("get_tram_times", get_tram_times);
    intentMap.set("follow_one", follow_one);

    agent.handleRequest(intentMap);
}

module.exports = router;
