const express = require('express')
const request = require('request')
const path = require('path')
const app = express()

// Global consts
const KEY_QINGTAOKE = '4h1EZTru'
const URL_QINGTAOKE = 'http://openapi.qingtaoke.com'

/***
TEXT: 【三只松鼠_氧气吐司面包800g/整箱】夹心吐司口袋面包早餐多口味
URL: https://uland.taobao.com/coupon/edetail?e=PjXkzpk+n4kGQASttHIRqT83qkL+uzZj5LBodTDpKut/wsNNVVNSqmQfE4B7+TbcjYnInZ0eTbJCib4hd+Eis7DgrwtX2alf7w9v818T2zNzQzL/HTq+PBemP0hpIIPvjDppvlX+ob8NlNJBuapvQ2MDg9t1zp0R8pjV3C9qcwTBBGsP6l4bbAVJif1kcVhy
traceId: 0b14653015433256513892446e51e9
union_lens: lensId:0b156441_0bfe_167556091dc_194b
***/

/***
https://pub.alimama.com/common/code/getAuctionCode.json?auctionid=570867197044&adzoneid=63092300043&siteid=230450350&scenes=1&t=1489238018764
auctionid:goods_id
adzoneid:63092300043
siteid:230450350
scenes:1
t:timestamp
***/

// Get daily photos api
app.get('/baokuan', function (req, res, next) {
  var options = {url: URL_QINGTAOKE+'/baokuan?v=1.0&app_key='+KEY_QINGTAOKE}

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      res.setHeader('Content-Type', 'application/json');
      res.send(body)
    }
  })
});

app.get('/config/index', function (req, res, next) {
  res.header("Content-Type",'application/json');
  res.sendFile(path.join(__dirname, '/static/index.json'));
});

app.get('/config/goods', function (req, res, next) {
  res.header("Content-Type",'application/json');
  res.sendFile(path.join(__dirname, '/static/goods.json'));
});


// middleware with an arity of 4 are considered
// error handling middleware. When you next(err)
// it will be passed through the defined middleware
// in order, but ONLY those with an arity of 4, ignoring
// regular middleware.
app.use(function(err, req, res, next){
  // whatever you want here, feel free to populate
  // properties on `err` to treat it differently in here.
  res.status(err.status || 500);
  res.send({ error: err.message });
});

// our custom JSON 404 middleware. Since it's placed last
// it will be the last middleware called, if all others
// invoke next() and do not respond.
app.use(function(req, res){
  res.status(404);
  res.send({ error: "Lame, can't find that" });
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3001);
  console.log('Express started on port 3001');
}
