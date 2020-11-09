var linebot = require('linebot');
var express = require('express');
var serveIndex = require('serve-index');
var file = require('fs');
var https = require("https");
var http = require('http');
const pixivUtils = require('./pixiv_utils');


//var data = [];
const pixiv = require('pixiv-img-dl');
const url = 'https://i.pximg.net/img-original/img/2017/05/01/23/42/02/62683748_p0.png';
var rimraf = require('rimraf');

const keyowrd = ['メガネ', 'ポニ', 'ロリ', 'ストッキング'];
const keyowrdCN = ['眼鏡', '馬尾', '蘿莉', '絲襪'];





var config = JSON.parse(file.readFileSync('config.config', 'utf8'));

var linebot_config = config.linebot_config;
var imgur_config = config.imgur_config;

var bot = linebot({
    channelId: linebot_config.channelId,
    channelSecret: linebot_config.channelSecret,
    channelAccessToken: linebot_config.channelAccessToken
});

var imgur_list = [];

var update_success_msg_string = '梗圖快取更新完成!';
var azure_maintains_msg_string = '維修中';
var max_image_page_cache_count = 25;

getImageListFromImgur();

function getImageListFromImgur() {
    for (var i = 0; i < max_image_page_cache_count; i++) {
        var options = {
            hostname: imgur_config.host_name,
            path: imgur_config.path + i,
            headers: imgur_config.headers,
            method: imgur_config.method
        };
        var req = https.request(options, function (res) {
            var chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function () {
                var body = Buffer.concat(chunks);
                var obj = JSON.parse(body.toString());
                console.log(obj.data.length);
                imgur_list = imgur_list.concat(obj.data);
            });
        });
        req.end();
    }
}

function getRandom() {
    return Math.floor((Math.random() * imgur_list.length));
}

function getRandomEx(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function getRandomWithArray(arr) {
    return Math.floor((Math.random() * arr.length));
}

function getRandomWithSize(size) {
    return Math.floor((Math.random() * size));
}

bot.on('message', function (event) {

    console.log('groupID:' + event.source.groupId);
    console.log('userId:' + event.source.userId);

    function isContainsString(str) {
        return event.message.text.toLowerCase().indexOf(str) != -1;
    }
    var userTextToResponseResultMapping = [];
    userTextToResponseResultMapping['抽,ドロ,doro'] = [imgur_list[getRandom()].link];

    function replyImage(url) {
        event.reply({
            type: 'image',
            originalContentUrl: url,
            previewImageUrl: url
        }).then(function (success) {
            // success
        }).catch(function (error) {
            replayMessage('Error')
        });
    }

    function replyVideo(url) {
        event.reply({
            type: 'video',
            originalContentUrl: url,
            previewImageUrl: url
        });
    }

    function replayMessage(msg) {
        event.reply(msg);
    }

    function drawPopularImage(key) {
        pixivUtils.pixivInitAndDrawPopularImage(key)
            .then(value => {
                console.log(value); // {name: 'xxx.png'}	
                if(value == 'not_found')
                     {return replayMessage('找不到');
                    
            }




            
                var url = 'https://linebotbl.herokuapp.com/' + value;
                return event.reply({
                    type: 'image',
                    originalContentUrl: url,
                    previewImageUrl: url
                });
            }).catch(error => { console.log('caught', error.message); });
    }

    switch (event.message.type) {
        case 'text':
            var acgmAzurGroup = 'Cc9ac44ec441958449f9091ebe252661e';
            var acgmShitGameGroup = 'C9f5fe046212c141c9adab227ea81c664';

            if (
                // event.source.groupId == acgmAzurGroup 		
                isContainsString('髒圖')
            ) {
                var s = event.message.text.toLowerCase();
                if (s.indexOf('[') >= 0 && s.indexOf(']') > s.indexOf('[')) {
                    var key = s.substr(s.indexOf('[') + 1, s.indexOf(']') - s.indexOf('[') - 1);
                    return drawPopularImage(key);
                }

                for (var i = 0; i < keyowrdCN.length; i++) {
                    if (isContainsString(keyowrdCN[i])) {
                        return drawPopularImage(keyowrd[i]);
                    }
                }

                pixivUtils.pixivInitAndDrawPRankingImage()
                    .then(value => {
                        console.log(value); // {name: 'xxx.png'}	
                        var url = 'https://linebotbl.herokuapp.com/' + value;
                        return event.reply({
                            type: 'image',
                            originalContentUrl: url,
                            previewImageUrl: url
                        });
                    }).catch(error => { console.log('caught', error.message); });

            }

            if (isContainsString('update')) {
                getImageListFromImgur();
                return replayMessage(update_success_msg_string);
            }

            if (isContainsString('社辦')) {
                var fullUrl = 'http://hotdoghotgogogo.myqnapcloud.com/pixmicat/src/acgm.jpg';
                var random = getRandomEx(1, 10000);
                var image_file = file.createWriteStream('/app/node_modules/' + random + '.jpg');
                var request = http.get(fullUrl, function (response) {
                    response.pipe(image_file);
                });
                return replyImage('https://linebotbl.herokuapp.com/node_modules/' + random + '.jpg');
            }

            if (isContainsString('大頭貼')) {
                //getImageListFromImgur();
                /*
            var CreateNewImage = function (url, value) {
                        var img = new Image;
                    img.src = url;
                    img.width = img.width * (value / 100);
                    img.height = img.height * (value / 100);
                    var container = document.getElementById ("container");
                    container.appendChild (img);
                    }
            */
                var totalImages = 100000;
                var totalTexts = totalImages;
                id = Math.floor(Math.random() * totalImages);


                var fullUrl = 'https://www.thiswaifudoesnotexist.net/example-' + id + '.jpg';
                var image_file = file.createWriteStream('/app/images');
                var request = https.get(fullUrl, function (response) {
                    response.pipe(image_file);
                });

                return replyImage('https://www.thiswaifudoesnotexist.net/example-' + id + '.jpg');
            }

            // if (event.source.groupId != acgmShitGameGroup)
            //   return;
            //Only for shit game group, that is reply image randomly    
            for (var e in userTextToResponseResultMapping) {
                var resArray = userTextToResponseResultMapping[e];
                var keyArray = e.split(",");
                for (var index in keyArray)
                    if (isContainsString(keyArray[index])) {
                        var valueInUserTextToResponseResultMapping = resArray[getRandomWithSize(resArray.length)];
                        if (valueInUserTextToResponseResultMapping.indexOf("https") == -1)
                            return replayMessage(valueInUserTextToResponseResultMapping);
                        else
                            return replyImage(valueInUserTextToResponseResultMapping);
                    } else if (isContainsString('大頭貼')) {
                        //getImageListFromImgur();
                        var totalImages = 100000;
                        var totalTexts = totalImages;
                        id = Math.floor(Math.random() * totalImages);

                        var fullUrl = 'https://www.thiswaifudoesnotexist.net/example-' + id + '.jpg';
                        var image_file = file.createWriteStream('/app/images');
                        var request = https.get(fullUrl, function (response) {
                            response.pipe(image_file);
                            //sharp.resize({ height: 200, width: 200 }).toFile('/app/des_images');
                        });

                        return replyImage('https://www.thiswaifudoesnotexist.net/example-' + id + '.jpg');
                    }
            }
    }
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

app.get('/refreshImageList', function (req, res) {
    getImageListFromImgur();
    res.send('refresh image!');
    //rimraf('./images/', function () { console.log('clear done done!!'); });
});

app.get('/test', function (req, res) {
    console.log('groupID:');
    res.send('test');
    var fullUrl = 'http://hotdoghotgo.dlinkddns.com/pixmicat/src/acgm.jpg';
    var image_file = file.createWriteStream('/app/node_modules/acgm.jpg');
    var request = http.get(fullUrl, function (response) {
        response.pipe(image_file);
    });
});

app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
app.use(express.static('files'));
//Serves all the request which includes /images in the url from Images folder
app.use('/images', express.static(__dirname + '/images'), serveIndex('images', { 'icons': true }));
app.use('/node_modules', express.static(__dirname + '/node_modules'), serveIndex('node_modules', { 'icons': true }));

var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log('Port :', port);
});
