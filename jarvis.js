const fs = require("fs");
const util = require("util");
const { Transform, pipeline } = require("stream");
const { struct } = require("pb-util");

const record = require("node-record-lpcm16");

// Speaker stuff
const Speaker = require("speaker");
const { PassThrough } = require("stream");

const pump = util.promisify(pipeline);
// Imports the Dialogflow library
const dialogflow = require("@google-cloud/dialogflow");

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();

// The path to the local file on which to perform speech recognition, e.g.
// /path/to/audio.raw
const filename = "C:/Users/loucassany-adm/Desktop/Perso/Jarvis/myOutput.wav";

// The encoding of the audio file, e.g. 'AUDIO_ENCODING_LINEAR_16'
const encoding = "AUDIO_ENCODING_LINEAR_16";

// The sample rate of the audio file in hertz, e.g. 16000
const sampleRateHertz = 16000;

// The BCP-47 language code to use, e.g. 'en-US'
const languageCode = "en-US";
const sessionPath = sessionClient.projectAgentSessionPath("jarvis-fbiu", 1234);

process.env.GOOGLE_APPLICATION_CREDENTIALS = "C:/Users/loucassany-adm/Desktop/Perso/Jarvis/private/jarvis-fbiu-c9f15797e41f.json";

const initialStreamRequest = {
    session: sessionPath,
    queryInput: {
        audioConfig: {
            audioEncoding: encoding,
            sampleRateHertz: sampleRateHertz,
            languageCode: languageCode,
        },
        singleUtterance: true,
    },
    outputAudioConfig: {
        audioEncoding: "OUTPUT_AUDIO_ENCODING_LINEAR_16",
        sampleRateHertz: 24000,
    },
};

function getAudio() {
    return new Promise((resolve) => {
        let silent = true;
        // 1. Create a stream for the streaming request.
        const detectStream = sessionClient
            .streamingDetectIntent()
            .on("error", console.error)
            .on("data", (data) => {
                if (data.recognitionResult) {
                    console.log(`Intermediate transcript: ${data.recognitionResult.transcript}`);
                    silent = false;
                    if (data.recognitionResult.isFinal) {
                        console.log("Result Is Final");
                        recording.stop();
                        detectStream.end();
                        //console.log(data.outputAudio);
                    }
                } else {
                    //console.log("Detected intent:");
                    if (data.outputAudio && data.outputAudio.length) {
                        resolve(data.outputAudio);
                    }
                }
            });

        // 2. Write the initial stream request to config for audio input.
        detectStream.write(initialStreamRequest);

        // 3. Create a mic to record
        const recording = record.record({
            sampleRateHertz: 16000,
            threshold: 0,
            verbose: false,
            recordProgram: "arecord", // Try also "arecord" or "sox"
            silence: "10.0",
        });

        // 4. Create a recording stream
        const recordingStream = recording.stream().on("error", console.error);

        // 5. Pump the mic stream to the dialogFlow detectStream
        const pumpStream = pump(
            //fs.ReadStream(recordingStream),
            recordingStream,
            // Format the audio stream into the request format.
            new Transform({
                objectMode: true,
                transform: (obj, _, next) => {
                    next(null, { inputAudio: obj });
                },
            }),
            detectStream
        );

        setTimeout(() => {
            if (silent) {
                console.log("Resolving because of silence");
                recording.stop();
                resolve({});
            }
        }, 5000);
    });
}

// Utility function to play an audio buffer to the speakers (must be called in async function)
function playAudio(audioBuffer) {
    return new Promise((resolve) => {
        // Setup the speaker for playing audio
        const speaker = new Speaker({
            channels: 1,
            bitDepth: 16,
            sampleRate: 22000,
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

async function loop() {
    while (true) {
        let audio = await getAudio();
        if (audio.length) {
            await playAudio(audio);
        }
    }
}

loop();
