var express = require("express");
var router = express.Router();

const rp = require("request-promise");
const request = require("request");
const ytdl = require("ytdl-core");
const sendSeekable = require("send-seekable");

// Endpoints
router.route("/get_playlist").get(get_playlist);
router.route("/get_audio").get(get_audio);

// Get playlist object from playlist url
async function get_playlist(req, resp) {
    if (decodeURI(req.query.url.length) > 0) {
        console.log(decodeURI(req.query.url));

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

        resp.json({ name: ytdata.metadata.playlistMetadataRenderer.title, playlist: playlist });
    } else {
        resp.json(null);
    }
}

// Pipe audio buffer corresponding to the video ID to the client

// keep user agent up to date with some magic
const DEFAULT_HEADERS = {
    "User-Agent": getFirefoxUserAgent(),
    "Accept-Language": "en-US,en;q=0.5",
};
function getFirefoxUserAgent() {
    let date = new Date();
    let version = (date.getFullYear() - 2018) * 4 + Math.floor(date.getMonth() / 4) + 58 + ".0";
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${version} Gecko/20100101 Firefox/${version}`;
}

async function get_audio(req, resp) {
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

module.exports = router;
