// http-server -p8000 -c-1

const express = require("express");
const app = express();

app.listen(process.env.PORT || 8000, () => {
    console.log("Listening to requests on" + process.env.PORT);
});

app.use(express.static("public"));

const allowedOrigins = ["http://127.0.0.1"];

app.get("/get_data", get_data);

async function get_data(req, resp) {
    let query = decodeURI(req.query.query);
    resp.json("Your query was : " + query);
}

// ---------------------------JARVIS TEXT CODE----------------------------
//
// Imports the Dialogflow client library
const dialogflow = require("@google-cloud/dialogflow").v2;

// Instantiate a DialogFlow client.
const sessionClient = new dialogflow.SessionsClient();

const projectId = "jarvis-fbiu";
const sessionId = "1234";
const languageCode = "fr";

process.env.GOOGLE_APPLICATION_CREDENTIALS = "C:/Users/loucassany-adm/Desktop/Perso/Jarvis/private/jarvis-fbiu-c9f15797e41f.json";

// Define session path
const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

// Store the response from dialogflow {text: text response (string), audio: binary audio buffer}
let last_response;

app.get("/get_jarvis", get_jarvis);

async function get_jarvis(req, resp) {
    let text = decodeURI(req.query.query);
    // The audio query request
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: text,
                languageCode: languageCode,
            },
        },
        outputAudioConfig: {
            audioEncoding: "OUTPUT_AUDIO_ENCODING_LINEAR_16",
        },
    };
    sessionClient.detectIntent(request).then((responses) => {
        const audioFile = responses[0].outputAudio;
        last_response = { text: responses[0].queryResult.fulfillmentText, audio: audioFile };
        resp.json({ text: last_response.text });
    });
}

const { Readable } = require('stream');
app.get("/get_last_response_audio", get_audio);

async function get_audio(req, resp) {
    resp.writeHead(200, {
        "Content-Type": "audio/mpeg",
    });
    //bufferToStream(last_response.audio).pipe(resp);
    new Readable({
        read() {
            this.push(last_response.audio);
            this.push(null);
        },
    }).pipe(resp);
}
