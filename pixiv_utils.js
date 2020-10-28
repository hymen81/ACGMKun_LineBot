// pixiv_utils.js

// pixiv features in encapsulation~


const PixivApi = require('pixiv-api-client');
const pixivImg = require("pixiv-img")
const pixiv = new PixivApi();

async function pixivInitAndDrawPopularImage(key) {
    try {
        const word = 'R-18 ' + key;
        var res;
        await pixiv.login('hymen81', '0806449').then(() => {
            var dateNow = new Date();
            var dateBefore180Days = dateNow.setDate(dateNow.getDate() - 720);
            var dateBefore2Days = dateNow.setDate(dateNow.getDate() - 2);
            var options = {
                sort: 'date_desc',
                start_date: randomDate(new Date(dateBefore2Days), new Date(dateBefore180Days))
            };
            return pixiv.searchIllustPopularPreview(word, options).then(json => {

                var img_url = json.illusts[Math.floor(Math.random() * json.illusts.length)].image_urls.medium
                //var img_url = json.illusts[0].image_urls.medium
                res = saveImageFromPixivUrl(img_url);
                // console.log(randomDate(new Date(), new Date(dateBefore180Days)));          


            })
        });
        return res;
    } catch (err) {
        console.log(err);
    }
}

async function pixivInitAndDrawPRankingImage() {
    try {
        const word = 'R-18';
        var res;
        await pixiv.login('hymen81', '0806449').then(() => {
            var dateNow = new Date();
            var dateBefore180Days = dateNow.setDate(dateNow.getDate() - 17);
            dateNow = new Date();
            var dateBefore2Days = dateNow.setDate(dateNow.getDate() - 2);
            var options = {
                date: randomDate(new Date(dateBefore2Days), new Date(dateBefore180Days)),
                mode: 'day_r18'

            }
            return pixiv.illustRanking(options).then(json => {

                var img_url = json.illusts[Math.floor(Math.random() * json.illusts.length)].image_urls.medium
                res = saveImageFromPixivUrl(img_url);
            })
        });
        return res;
    } catch (err) {
        console.log(err);
    }
}


async function saveImageFromPixivUrl(url) {
    try {
        var res;
        var arr = url.split('/')
        await pixivImg(url, "images/" + arr[arr.length - 1]).then(output => {
            //console.log(output);
            res = output;
        });
        return res;
    } catch (err) {
        console.log(err);
    }
}

function randomDate(start, end) {
    var d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

module.exports.pixivInitAndDrawPopularImage = pixivInitAndDrawPopularImage;
module.exports.saveImageFromPixivUrl = saveImageFromPixivUrl;
module.exports.pixivInitAndDrawPRankingImage = pixivInitAndDrawPRankingImage;