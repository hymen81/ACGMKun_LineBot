
const PixivAppApi = require('pixiv-app-api')
const pixivImg = require('pixiv-img')
const pixiv = new PixivAppApi('hymen81', '0806449')
 


var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
 
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');


  pixiv
  .searchIllust('艦これ10000users入り')
  .then(json => {
    console.log(`downloading ${json.illusts[0].title}`)
    return pixivImg(json.illusts[0].image_urls.large)
  })
  .then(() => {
    console.log('finish')
  }).catch(error => console.log(error.message));


});
