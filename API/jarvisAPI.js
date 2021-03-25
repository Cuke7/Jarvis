var express = require("express");
var router = express.Router();

const dialogflow = require("@google-cloud/dialogflow").v2;
const { Readable } = require("stream");

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

// Endpoints
router.route("/get_jarvis").get(get_jarvis);
router.route("/get_last_response_audio").get(get_last_response_audio);

// Call dialogflow API (input text, output text)
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

// Call dialogflow API (input text, output audio stream)
async function get_last_response_audio(req, resp) {
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

module.exports = router;
