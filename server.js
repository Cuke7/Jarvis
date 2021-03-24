// http-server -p8000 -c-1

const express = require("express");
const app = express();
const rp = require('request-promise');
const request = require("request");
const ytdl = require("ytdl-core");
const sendSeekable = require("send-seekable");

app.listen(process.env.PORT || 8000, () => {
    console.log("Listening to requests on" + process.env.PORT);
});

app.use(sendSeekable);
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

const { Readable } = require("stream");
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

// ---------------------------MUSIC STUFF----------------------------
//
app.get("/get_playlist", return_playlist);
app.get("/get_playlist", return_playlist);

function return_playlist(req, resp) {
    (async () => {
        let results = await get_playlist(req);
        resp.json(results);
    })().catch((err) => resp.json(err));
}

async function get_playlist(req) {
    if (decodeURI(req.query.url.length) > 0) {
        console.log(decodeURI(req.query.url))

        let body = await rp(decodeURI(req.query.url));
        
        let start = body.indexOf("var ytInitialData = ");
        let end = body.indexOf("</script>", start);
        let obj = body.substring(start + 20, end - 1);

        let ytdata = JSON.parse(obj);

        let data = ytdata.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;

        let playlist = [];

        for (const item of data) {
            playlist.push({
                title: item.playlistVideoRenderer.title.runs[0].text,
                thumbnail: item.playlistVideoRenderer.thumbnail.thumbnails[0].url,
                id: item.playlistVideoRenderer.videoId,
                duration: item.playlistVideoRenderer.lengthText.simpleText,
                artist: item.playlistVideoRenderer.shortBylineText.runs[0].text,
            });
        }

        return { name: ytdata.metadata.playlistMetadataRenderer.title, playlist: playlist };
    } else {
        return null;
    }
}

app.get("/get_link", get_mp3_link);
app.get("/get_link", get_mp3_link);

const DEFAULT_HEADERS = {
    "User-Agent": getFirefoxUserAgent(),
    "Accept-Language": "en-US,en;q=0.5",
};

// keep user agent up to date with some magic
function getFirefoxUserAgent() {
    let date = new Date();
    let version = (date.getFullYear() - 2018) * 4 + Math.floor(date.getMonth() / 4) + 58 + ".0";
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${version} Gecko/20100101 Firefox/${version}`;
}

async function get_mp3_link(req, resp) {
    let id = decodeURI(req.query.id);
    let url = "https://www.youtube.com/watch?v=" + id;

    let info = await ytdl.getInfo(id);
    let format = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });
    let type = "audio/mpeg";
    let size = format.contentLength;

    let stream = ytdl(url, {
        format: format,
        requestOptions: {
            headers: DEFAULT_HEADERS,
        },
    });
    resp.sendSeekable(stream, {
        type: type,
        length: size,
    });
}
