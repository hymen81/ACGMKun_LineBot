var linebot = require('linebot');
var express = require('express');
var serveIndex = require('serve-index');
var file = require('fs');
var http = require("https");



var config = JSON.parse(file.readFileSync('config.config', 'utf8'));

var linebot_config = config.linebot_config;
var imgur_config = config.imgur_config;

var bot = linebot({
    channelId: linebot_config.channelId,
    channelSecret: linebot_config.channelSecret,
    channelAccessToken: linebot_config.channelAccessToken
});

var data = [];

const pixiv = require('pixiv-img-dl');
const url = 'https://i.pximg.net/img-original/img/2017/05/01/23/42/02/62683748_p0.png';

var rimraf = require('rimraf');



var pixivImages = file.readFileSync('FlanchanRanking.txt').toString().split("\n");
var pixivTirpitzImages = file.readFileSync('TirpitzFlanchanRanking.txt').toString().split("\n");
//for(i in pixivImages) {
//  console.log(pixivImages[i]);
//}


function getImageListFromImgur() {
    for (var i = 0; i < 21; i++) {
        var options = {
            hostname: imgur_config.host_name,
            path: imgur_config.path + i,
            headers: imgur_config.headers,
            method: imgur_config.method
        };
        var req = http.request(options, function (res) {
            var chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function () {
                var body = Buffer.concat(chunks);
                var obj = JSON.parse(body.toString());
                console.log(obj.data.length);
                data = data.concat(obj.data);
            });
        });
        req.end();
    }
}

getImageListFromImgur();

var userTextToResponseResultMapping =
    {
        /* '血月大大': ['https://i.imgur.com/hvQhIw7.jpg', 'https://i.imgur.com/Tv8EuUr.jpg'],
         '替身': ['https://i.imgur.com/hccZeuC.jpg', 'https://i.imgur.com/wrKZyui.png', 'https://i.imgur.com/6TeLBoM.jpg'],
         '買': ['https://i.imgur.com/k8IZqXI.jpg', 'https://i.imgur.com/1C6vzkW.jpg', 'https://i.imgur.com/jDQFnGA.jpg', 'https://i.imgur.com/BG9pFSQ.jpg', 'https://i.imgur.com/KOlS7vU.jpg'],
         '怕': ['https://i.imgur.com/NyH6G89.jpg'],
         '吉': ['https://i.imgur.com/RBnAvGq.jpg'],
         '廢球': ['https://i.imgur.com/d5l6IHB.jpg'],
         'the world': ['https://i.imgur.com/2IZODco.jpg', 'https://i.imgur.com/URsVJ3m.jpg'],
         '吃': ['https://i.imgur.com/SU4uea8.jpg', 'https://i.imgur.com/HxenSJR.png', 'https://i.imgur.com/pEcfeO7.gif',
         'https://i.imgur.com/jNUAuAp.jpg', 'https://i.imgur.com/0GECLoM.jpg'],
         '53': ['53大雞雞', '53逼母'],
         '快思考,想想': ['https://i.imgur.com/FIC2CK8.jpg'],
         '童貞,統真': ['https://i.imgur.com/63D07no.jpg'],
         '白白熊,泓任': ['https://i.imgur.com/w3ClWm4.jpg']*/
    };

var update_success_msg_string = '梗圖快取更新完成!';


//else if (isContainsString('抽') || isContainsString('ドロ') || isContainsString('doro'))
//  return replyImage(data[getRandom()].link);


function getRandom() {
    return Math.floor((Math.random() * data.length));
}

function getRandomWithArray(arr) {
    return Math.floor((Math.random() * arr.length));
}

function getRandomWithSize(size) {
    return Math.floor((Math.random() * size));
}

bot.on('message', function (event) {

    console.log('groupID:' + event.source.groupId);


    function isContainsString(str) {
        return event.message.text.toLowerCase().indexOf(str) != -1;
    }

    userTextToResponseResultMapping['抽,ドロ,doro'] = [data[getRandom()].link];

    function replyImage(url) {
        // console.log(getRandom());
        event.reply({
            type: 'image',
            originalContentUrl: url,
            previewImageUrl: url
        }).then(function (data) {
            // success
        }).catch(function (error) {
            // error
        });
    }

    function replyVideo(url) {
        // console.log(getRandom());
        event.reply({
            type: 'video',
            originalContentUrl: url,
            previewImageUrl: url
        });
    }

    function replayMessage(msg) {
        event.reply(msg);
    }

    switch (event.message.type) {
        case 'text':

            // console.log(event.source.userId);

            
			var acgmAzurGroup = 'Cc9ac44ec441958449f9091ebe252661e';
			var acgmShitGameGroup = 'C9f5fe046212c141c9adab227ea81c664';
			

            if ((event.source.groupId == acgmAzurGroup 		
			|| event.source.groupId == acgmShitGameGroup)
			&& isContainsString('艦')) {
                pixiv
                    .fetch(pixivImages[getRandomWithArray(pixivImages)])
                    .then(value => {
                        console.log(value); // {name: 'xxx.png'}	
                        var url = 'https://linebotbl.herokuapp.com/images/' + value.name;
                        return event.reply({
                            type: 'image',
                            originalContentUrl: url,
                            previewImageUrl: url
                        });
                    });
            }

            if (event.source.userId == 'U5cbf07ca3d09531a79e8ab7eb250ae01' && isContainsString('抽老婆')) {
                pixiv
                    .fetch(pixivTirpitzImages[getRandomWithArray(pixivTirpitzImages)])
                    .then(value => {
                        console.log(value); // {name: 'xxx.png'}	
                        var url = 'https://linebotbl.herokuapp.com/images/' + value.name;
                        return event.reply({
                            type: 'image',
                            originalContentUrl: url,
                            previewImageUrl: url
                        });
                    });
            }

            if (event.source.groupId != acgmShitGameGroup)
                return;

            if (isContainsString('update')) {
                getImageListFromImgur();
                return replayMessage(update_success_msg_string);
            }
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
    rimraf('./images/', function () { console.log('clear done done!!'); });
});

app.use(express.static('public'));
//Serves all the request which includes /images in the url from Images folder
app.use('/images', express.static(__dirname + '/images'), serveIndex('images', {'icons': true}));


var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log('you port is :', port);
});