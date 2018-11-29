const express = require('express')
const request = require('request')
const path = require('path')
const app = express()
var alimama = require('./alimama')

// Global consts
const KEY_QINGTAOKE = '4h1EZTru'
const URL_QINGTAOKE = 'http://openapi.qingtaoke.com'
const URL_TAOBAO_DETAIL = 'https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdetail/6.0/?data=%7B%22itemNumId%22%3A%22'
const URL_TAOBAO_DESC = 'http://hws.m.taobao.com/d/modulet/v5/WItemMouldDesc.do?'
const URL_TAOBAO_COUPON = 'https://pub.alimama.com/common/code/getAuctionCode.json?adzoneid=63092300043&siteid=230450350&scenes=1&auctionid='

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

app.get('/taobao/detail', function (req, res, next) {
  var options = {url: URL_TAOBAO_DETAIL+req.query['goods_id']+'%22%7D'}

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      res.setHeader('Content-Type', 'application/json');
      res.send(body)
    }
  })
});

app.get('/taobao/desc', function (req, res, next) {
  var options = {url: URL_TAOBAO_DESC+req.query['goods_id']}
  request(options, function(error, response, body) {
    var imageArray = []
    if (!error && response.statusCode == 200) {
      imageArray = JSON.parse(body).data.children.filter(obj => {
        return (obj.ID.includes('detail_pic') && typeof obj.children === "undefined")
      }).map(obj => {
        return obj.params.picUrl
      })
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(imageArray))
    }
  })
});

app.get('/taobao/coupon', function (req, res, next) {
  //&t=1489238018764&auctionid=570867197044

  let timestamp = + new Date()
  let cookies = 'cna=0wGwE7YsujgCAXAUdsLn3l6L; t=e20c642f654e26ffd2d577e1097b9f3e; account-path-guide-s1=true; 33712550_yxjh-filter-1=true; cookie2=1766941b4cc77a646e24fb1fa937e93d; v=0; _tb_token_=e115f3ebe4119; alimamapwag=TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTRfMSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzcwLjAuMzUzOC4xMTAgU2FmYXJpLzUzNy4zNg%3D%3D; cookie32=11a65b896c617d67fe463fd280ee6e58; alimamapw=RQMdC2cOCBM9BFNWBFdTUQcAUFdTXAoBB1ZXB1EBAwMDUQFWBlMAAFo%3D; cookie31=MzM3MTI1NTAsd2F5bl9saXUsd2F5bl9saXVAeWVhaC5uZXQsVEI%3D; login=U%2BGCWk%2F75gdr5Q%3D%3D; JSESSIONID=42AB7D04AA89C8EB2FEE3800BDB110D4; rurl=aHR0cHM6Ly9wdWIuYWxpbWFtYS5jb20v; isg=BG5ut3vhuaaPs81bRCBIdBABv8Lwx_W54kQSnZg1bXG9ewrVAPyaeDUyN6cyoyqB; apush4244a320499bbf881946adce89940f11=%7B%22ts%22%3A1543504139111%2C%22parentId%22%3A1543502386753%7D'
  var options = {url: URL_TAOBAO_COUPON + req.query['goods_id'] + '&t=' + timestamp, headers:{Cookie:cookies}}
  console.log(options)
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
