// Imports the Dialogflow client library
const dialogflow = require("@google-cloud/dialogflow").v2;

// Instantiate a DialogFlow client.
const sessionClient = new dialogflow.SessionsClient();

// Speaker stuff
const Speaker = require("speaker");
const { PassThrough } = require("stream");

// Prompt code
const prompt = require("prompt");
var colors = require("colors/safe");
prompt.message = colors.green("");
prompt.delimiter = colors.green(">>");

const projectId = "jarvis-fbiu";
const sessionId = "1234";
const languageCode = "fr";

process.env.GOOGLE_APPLICATION_CREDENTIALS = "C:/Users/loucassany-adm/Desktop/Perso/Jarvis/private/jarvis-fbiu-c9f15797e41f.json";

// Define session path
const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

async function detectIntentwithTTSResponse(text) {
    return new Promise((resolve) => {
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
        (async () => {
            let responses = await sessionClient.detectIntent(request); //.then((responses) => {
            //console.log(responses[0]);
            console.log(colors.cyan(responses[0].queryResult.fulfillmentText));
            const audioFile = responses[0].outputAudio;

            resolve(audioFile);
        })();
        //});
    });
}

// Utility function to play an audio buffer to the speakers
function playAudio(audioBuffer) {
    return new Promise((resolve) => {
        // Setup the speaker for playing audio
        const speaker = new Speaker({
            channels: 1,
            bitDepth: 16,
            sampleRate: 24000,
        });

        speaker.on("close", () => {
            resolve();
        });

        // Setup the audio stream, feed the audio buffer in
        const audioStream = new PassThrough();
        audioStream.pipe(speaker);
        audioStream.end(audioBuffer);
    });
}

(async () => {
    console.log(colors.cyan("--------------------------------"));
    console.log(colors.cyan("--------------------------------"));
    console.log(colors.cyan("--------------------------------"));
    while (true) {
        prompt.start();
        const text = await prompt.get({
            properties: {
                text: {
                    description: colors.green("Jarvis"),
                },
            },
        });
        let sound = await detectIntentwithTTSResponse(text.text);
        await playAudio(sound);
    }
})();
