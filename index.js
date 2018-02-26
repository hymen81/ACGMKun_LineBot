var linebot = require('linebot');
var express = require('express');
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

    console.log('groupID:'+event.source.groupId);


    function isContainsString(str) {
        return event.message.text.toLowerCase().indexOf(str) != -1;
    }


    if (event.source.groupId!='C9f5fe046212c141c9adab227ea81c664' && isContainsString('艦')) {
        pixiv
            .fetch(pixivImages[getRandomWithArray(pixivImages)])
            .then(value => {
                console.log(value); // {name: '62683748_p0.png'}	

        //replyImage('https://linebotbl.herokuapp.com/images/'+value.name);

        var url = 'https://linebotbl.herokuapp.com/images/' + value.name;

        return event.reply({
            type: 'image',
            originalContentUrl: url,
            previewImageUrl: url
        });
    });
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

            //if(event.message.text == 'zxcvb')
            //  for(var i = 0;i<20;i++)
            //    replyImage(data[getRandom()].link);

            switch (event.message.text) {
                case 'Me':
                    /* event.source.profile().then(function (profile) {
						return event.reply('Hello ' + profile.displayName + ' ' + profile.userId);
					}); */
                    break;
                case 'Picture':
                    /* event.reply({
						type: 'image',
						originalContentUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png',
						previewImageUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png'
					}); */
                    break;
                case '?':
                    /* event.reply({
						type: 'image',
						originalContentUrl: 'https://dvblobcdnea.azureedge.net//Content/Upload/Popular/Images/2017-06/e99e6b5e-ca6c-4c19-87b7-dfd63db6381a_m.jpg',
						previewImageUrl: 'https://dvblobcdnea.azureedge.net//Content/Upload/Popular/Images/2017-06/e99e6b5e-ca6c-4c19-87b7-dfd63db6381a_m.jpg'
					}); */
                    break;
                case 'Location':
                    /* event.reply({
						type: 'location',
						title: 'LINE Plus Corporation',
						address: '1 Empire tower, Sathorn, Bangkok 10120, Thailand',
						latitude: 13.7202068,
						longitude: 100.5298698
					}); */
                    break;
                case 'Push':
                    // bot.push('U6350b7606935db981705282747c82ee1', ['Hey!', '?????? ' + String.fromCharCode(0xD83D, 0xDE01)]);
                    break;
                case 'Push2':
                    // bot.push(['U6350b7606935db981705282747c82ee1', 'U6350b7606935db981705282747c82ee1'], ['Hey!', '?????? ' + String.fromCharCode(0xD83D, 0xDE01)]);
                    break;
                case 'Multicast':
                    // bot.push(['U6350b7606935db981705282747c82ee1', 'U6350b7606935db981705282747c82ee1'], 'Multicast!');
                    break;
                case 'Confirm':
                    // event.reply({
                    // 	type: 'template',
                    // 	altText: 'this is a confirm template',
                    // 	template: {
                    // 		type: 'confirm',
                    // 		text: 'Are you sure?',
                    // 		actions: [{
                    // 			type: 'message',
                    // 			label: 'Yes',
                    // 			text: 'yes'
                    // 		}, {
                    // 			type: 'message',
                    // 			label: 'No',
                    // 			text: 'no'
                    // 		}]
                    // 	}
                    // });
                    break;
                case 'Multiple':
                    // return event.reply(['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5']);
                    break;
                case 'Version':
                    //event.reply('linebot@' + require('../package.json').version);
                    break;
                default:
                    /* 	event.reply(event.message.text).then(function (data) {
							console.log('Success', data);
						}).catch(function (error) {
							console.log('Error', error);
						}); */
                    break;
            }
            break;
        /* case 'image':
            event.message.content().then(function (data) {
                const s = data.toString('base64').substring(0, 30);
                return event.reply('Nice picture! ' + s);
            }).catch(function (err) {
                return event.reply(err.toString());
            });
            break;
        case 'video':
            event.reply('Nice movie!');
            break;
        case 'audio':
            event.reply('Nice song!');
            break;
        case 'location':
            event.reply(['That\'s a good location!', 'Lat:' + event.message.latitude, 'Long:' + event.message.longitude]);
            break;
        case 'sticker':
            event.reply({
                type: 'sticker',
                packageId: 1,
                stickerId: 1
            });
            break; */
        /* default:
            event.reply('Unknow message: ' + JSON.stringify(event));
            break; */
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
app.use('/images', express.static(__dirname + '/images'));

var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log('you port is :', port);
});