var express = require("express");
var router = express.Router();

const puppeteer = require("puppeteer");

// Endpoints
router.route("/get_station_times").get(get_station_times);

// Get playlist object from playlist url
async function get_station_times(req, res) {
    var station = req.query.station;

    let info = get_url(station);

    let url = info[1];

    function get_url(input) {
        let station = autocorrect(input);

        let rep = [];
        for (let i = 0; i < bordeaux.length; i++) {
            if (bordeaux[i][0] == station) {
                rep = [station, [bordeaux[i][1]]];
            }
        }
        for (let i = 0; i < pessac.length; i++) {
            if (pessac[i][0] == station) {
                rep[1].push(pessac[i][1]);
            }
        }
        return rep;
    }

    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    let response_all = [];

    for (let dir = 0; dir < 2; dir++) {
        const page = await browser.newPage();
        await page.goto(url[dir]);

        await page.waitForSelector(".waittime");

        let times_temp = await page.evaluate(() => {
            let times = [];
            let trams = document.getElementsByClassName("display-flex justify-space-between align-content-stretch align-items-end");
            for (const tram of trams) {
                let temp = tram.innerText.replaceAll('\n',' ');
                //temp = temp.substring(0, temp.length - 1);
                times.push(temp);
            }
            return times;
        });

        let direction_name;

        if (dir == 0) direction_name = "Bordeaux";
        if (dir == 1) direction_name = "Pessac";

        let response_temp = {
            station: info[0],
            direction: direction_name,
            url: url[dir],
            data: times_temp
        };

        response_all.push(response_temp);
    }

    let response = response_all;

    res.json(response);

    await browser.close();
}

let bordeaux = [
    ["Saige", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3725"],
    ["Unitec", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3727"],
    ["Montaigne - Montesquieu", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3729"],
    ["Doyen Brus", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3733"],
    ["Fran??ois Bordes", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3735"],
    ["Arts & M??tiers", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3737"],
    ["B??thanie", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3739"],
    ["Peixotto", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3741"],
    ["Forum", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3743"],
    ["Roustaing", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3745"],
    ["Barri??re Saint-Gen??s", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3747"],
    ["Bergoni??", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3749"],
    ["Saint-Nicolas", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3751"],
    ["Victoire", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3754"],
    ["Mus??e d'Aquitaine", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3755"],
    ["H??tel de Ville", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3757"],
    ["Gambetta - madd", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3759"],
    ["Grand Th????tre", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3761"],
    ["Quinconces", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A3763"],
    ["Bougnard", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A5244"],
    ["Camponac M??diath??que", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A5245"],
    ["Pessac Centre", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A5247"],
    ["CAPC Mus??e d'Art Contemporain", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A5253"],
    ["Chartrons", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A5255"],
    ["Cours du M??doc", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A5257"],
    ["Les Hangars", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A5259"],
    ["La Cit?? du Vin", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A5261"],
    ["Rue Achard", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A5528"],
    ["New York", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A5530"],
    ["Brandenburg", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A5532"],
    ["Claveau", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A5534"],
    ["Berges de la Garonne", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A7172"],
    ["Chataigneraie", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A7432"],
    ["Cap M??tiers", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A7434"],
    ["H??pital Haut-L??v??que", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A7436"],
    ["Gare Pessac Alouette", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A7438"],
    ["France Alouette", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60/stop_point%3ATBT%3ASP%3A7440"],
];

let pessac = [
    ["Bougnard", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3724"],
    ["Saige", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3726"],
    ["Unitec", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3728"],
    ["Montaigne - Montesquieu", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3730"],
    ["Doyen Brus", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3734"],
    ["Fran??ois Bordes", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3736"],
    ["Arts & M??tiers", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3738"],
    ["B??thanie", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3740"],
    ["Peixotto", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3742"],
    ["Forum", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3744"],
    ["Roustaing", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3746"],
    ["Barri??re Saint-Gen??s", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3748"],
    ["Bergoni??", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3750"],
    ["Saint-Nicolas", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3752"],
    ["Victoire", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3753"],
    ["Mus??e d'Aquitaine", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3756"],
    ["H??tel de Ville", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3758"],
    ["Gambetta - madd", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3760"],
    ["Grand Th????tre", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3762"],
    ["Quinconces", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A3764"],
    ["Camponac M??diath??que", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A5246"],
    ["Pessac Centre", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A5247"],
    ["CAPC Mus??e d'Art Contemporain", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A5252"],
    ["Chartrons", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A5254"],
    ["Cours du M??doc", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A5256"],
    ["Les Hangars", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A5258"],
    ["La Cit?? du Vin", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A5260"],
    ["Rue Achard", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A5529"],
    ["New York", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A5531"],
    ["Brandenburg", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A5533"],
    ["Claveau", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A5535"],
    ["Berges de la Garonne", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A7172"],
    ["Chataigneraie", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A7431"],
    ["Cap M??tiers", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A7433"],
    ["H??pital Haut-L??v??que", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A7435"],
    ["Gare Pessac Alouette", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A7437"],
    ["France Alouette", " https://www.infotbm.com/fr/horaires/detail/60/route%3ATBT%3A60_R/stop_point%3ATBT%3ASP%3A7440"],
];

let dictionary = [
    "Saige",
    "Unitec",
    "Montaigne - Montesquieu",
    "Doyen Brus",
    "Fran??ois Bordes",
    "Arts & M??tiers",
    "B??thanie",
    "Peixotto",
    "Forum",
    "Roustaing",
    "Barri??re Saint-Gen??s",
    "Bergoni??",
    "Saint-Nicolas",
    "Victoire",
    "Mus??e d'Aquitaine",
    "H??tel de Ville",
    "Gambetta - madd",
    "Grand Th????tre",
    "Quinconces",
    "Camponac M??diath??que",
    "Pessac Centre",
    "CAPC Mus??e d'Art Contemporain",
    "Chartrons",
    "Cours du M??doc",
    "Les Hangars",
    "La Cit?? du Vin",
    "rue Achard",
    "New York",
    "Brandenburg",
    "Claveau",
    "Berges de la Garonne",
    "Quinconces Fleuve",
    "Chataigneraie",
    "Cap M??tiers",
    "H??pital Haut-L??v??que",
    "Gare Pessac Alouette",
    "France Alouette",
    "Bougnard",
];

const autocorrect = require("autocorrect")({
    words: dictionary,
});

module.exports = router;
