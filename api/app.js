const express = require('express')
const request = require('request')
const path = require('path')
const fs = require('fs')
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer();
const app = express()

app.use(express.static('public'));

// Global consts
const KEY_QINGTAOKE = '4h1EZTru'
const URL_QINGTAOKE = 'http://openapi.qingtaoke.com'
const URL_TAOBAO_DETAIL = 'https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdetail/6.0/?data=%7B%22itemNumId%22%3A%22'
const URL_TAOBAO_DESC = 'http://hws.m.taobao.com/d/modulet/v5/WItemMouldDesc.do?'
const URL_TAOBAO_COUPON = 'https://pub.alimama.com/common/code/getAuctionCode.json?adzoneid=63092300043&siteid=230450350&scenes=1&auctionid='
const URL_TAOBAO_SEARCH = 'https://pub.alimama.com/items/search.json?perPageSize=200&dpyhq=1&freeShipment=1&shopTag=yxjh%2Cdpyhq'
const URL_HAODANKU_DETAIL = 'http://v2.api.haodanku.com/item_detail/apikey/livefudaoio/itemid/'
const URL_HAODANKU_SEARCH = 'http://v2.api.haodanku.com/supersearch/apikey/livefudaoio/keyword/'
const URL_HAODANKU_DESERVE = 'http://v2.api.haodanku.com/get_deserve_item/apikey/livefudaoio'
const URL_HAODANKU_BAOKUAN = 'http://v2.api.haodanku.com/sales_list/apikey/livefudaoio/sale_type/1'

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

// 爆款
app.get('/baokuan', function (req, res, next) {
  request({url: URL_HAODANKU_BAOKUAN}, function(error, response, body) {
    if (!error && response.statusCode == 200) {
        res.setHeader('Content-Type', 'application/json')
        var list = JSON.parse(body).data.map(obj => {
            var goods = {}
            goods.goods_id = obj.itemid
            goods.goods_pic = obj.itempic+'_310x310.jpg'
            goods.goods_title = obj.itemtitle.replace(/<\/?[^>]+(>|$)/g, "")
            goods.goods_short_title = obj.itemshorttitle
            goods.goods_price = obj.itemprice
            goods.coupon_price = obj.couponmoney
            goods.goods_introduce = obj.guide_article
            goods.coupon_start_time = new Date(obj.couponstarttime*1000).toISOString()
            goods.coupon_end_time = new Date(obj.couponendtime*1000).toISOString()
            goods.goods_sales = obj.itemsale
            return goods
        })
        res.send({'er_code': 10000, 'er_msg': '', 'data': list})
    }
})
});

app.get('/taobao/deserve', function (req, res, next) {
    request({url: URL_HAODANKU_DESERVE}, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.setHeader('Content-Type', 'application/json')
            var list = JSON.parse(body).item_info.map(obj => {
                var goods = {}
                goods.goods_id = obj.itemid
                goods.goods_pic = obj.itempic+'_310x310.jpg'
                goods.goods_title = obj.itemtitle.replace(/<\/?[^>]+(>|$)/g, "")
                goods.goods_short_title = obj.itemshorttitle
                goods.goods_price = obj.itemprice
                goods.coupon_price = obj.couponmoney
                goods.goods_introduce = obj.guide_article
                goods.coupon_start_time = new Date(obj.couponstarttime*1000).toISOString()
                goods.coupon_end_time = new Date(obj.couponendtime*1000).toISOString()
                goods.goods_sales = obj.itemsale
                return goods
            })
            res.send({'er_code': 10000, 'er_msg': '', 'data': list})
        }
    })
});

// 列表，分类
app.get('/taobao/list', function (req, res, next) {
  var qs = req.query
  var options = {url: URL_QINGTAOKE+'/qingsoulist?v=1.0&app_key='+KEY_QINGTAOKE, qs: qs}

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      res.setHeader('Content-Type', 'application/json');
      res.send(body)
    }
  })

});

// 搜索
app.get('/taobao/search/o', function (req, res, next) {
  var qs = req.query
  var options = {url: URL_QINGTAOKE+'/search?s_type=1&v=1.0&app_key='+KEY_QINGTAOKE, qs: qs}

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      res.setHeader('Content-Type', 'application/json');
      res.send(body)
    }
  })
});

app.get('/taobao/search', function (req, res, next) {
  let filePath = path.join(__dirname, 'cookie')
  var cookies = fs.readFileSync(filePath).toString()
  var qs = req.query

  var sort = req.query.sort
  var queryType = 2
  var sortType = 0
  if (sort == 1) {
    queryType = 2
  }
  else if (sort == 8) {
    queryType = 0
  }
  else if (sort == 2) {
    sortType = 1
  }
  else if (sort == 3) {
    sortType = 5
  }
  else if (sort == 9) {
    sortType = 7
  }
  else if (sort == 4) {
    sortType = 4
  }
  else if (sort == 7) {
    sortType = 3
  }
  qs.queryType = queryType
  qs.sortType = sortType
  qs.toPage = parseInt(qs.toPage)
  delete qs.sort
  var options = {url: URL_TAOBAO_SEARCH, qs: qs, headers:{Cookie:cookies}}
  console.log(qs);
  request(options, function(error, response, body) {
      console.log(options);
    if (!error && response.statusCode == 200) {
      res.setHeader('Content-Type', 'application/json')
      if (!JSON.parse(body).data || (typeof JSON.parse(body).data === "undefined") || JSON.parse(body).data.pageList == null || JSON.parse(body).data.pageList.length == 0) {
        res.send({'er_code': 10000, 'er_msg': '', 'data': {'total':0, 'list': []}})
        return
      }
      var list = JSON.parse(body).data.pageList.filter(obj => {
        return (obj.couponEffectiveEndTime.length != 0 && obj.couponLeftCount != 0)
      }).map(obj => {
        var goods = {}
        goods.goods_id = obj.auctionId
        goods.goods_pic = obj.pictUrl
        goods.goods_title = obj.title.replace(/<\/?[^>]+(>|$)/g, "")
        goods.goods_short_title = goods.goods_title
        goods.goods_price = obj.zkPrice
        goods.coupon_price = obj.couponAmount
        goods.coupon_start_time = obj.couponEffectiveStartTime
        goods.coupon_end_time = obj.couponEffectiveEndTime
        goods.goods_sales = obj.biz30day
        return goods
      })
      res.send({'er_code': 10000, 'er_msg': '', 'data': {'total':list.length, 'list': list}})
    }
  })
});

// 热搜词
app.get('/taobao/hot', function (req, res, next) {
  var options = {url: URL_QINGTAOKE+'/hot?v=1.0&app_key='+KEY_QINGTAOKE}

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      res.setHeader('Content-Type', 'application/json');
      res.send(body)
    }
  })
});

app.get('/taobao/detail', function (req, res, next) {
  var p1 = new Promise(function(resolve, reject) {
    request({url: URL_TAOBAO_DETAIL+req.query['goods_id']+'%22%7D'}, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body)
      }
    })
  });

  var p2 = new Promise(function(resolve, reject) {

    if (req.query['reload'] == '1') {
      request({url: URL_HAODANKU_DETAIL+req.query['goods_id']}, function(error, response, body) {
        console.log(body);
        if (!error && response.statusCode == 200 && JSON.parse(body).code != 0) {
          p2 = resolve(body)
        }
        else {
          resolve('[]')
        }
      })
    }
    else {
      resolve('[]')
    }
  });

  Promise.all([p1, p2]).then(values => {
    res.setHeader('Content-Type', 'application/json');
    var body1 = JSON.parse(values[0])
    console.log('=================');
    console.log(values[1]);
    var body2 = JSON.parse(values[1])
    if (typeof body2.data != "undefined") {
      body1.data.item.goods_price = body2.data.itemprice
      body1.data.item.coupon_price = body2.data.couponmoney
      body1.data.item.coupon_start_time = new Date(body2.data.couponstarttime*1000).toISOString()
      body1.data.item.coupon_end_time = new Date(body2.data.couponendtime*1000).toISOString()
      body1.data.item.goods_introduce = body2.data.guide_article
      body1.data.item.goods_sales = body2.data.itemsale
    }

    res.send(JSON.stringify(body1))
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
  let timestamp = + new Date()
  let filePath = path.join(__dirname, 'cookie')
  var cookies = fs.readFileSync(filePath).toString()
  var options = {url: URL_TAOBAO_COUPON + req.query['goods_id'] + '&t=' + timestamp, headers:{Cookie:cookies}}
  request(options, function(error, response, body) {
    console.log(response.headers['set-cookie'])
    if (!error && response.statusCode == 200) {
      res.setHeader('Content-Type', 'application/json');
      res.send(body)
    }
  })
});

app.post('/taobao/cookies',upload.array(), function (req, res, next) {
  console.log(req.body)
  let cookies = req.body['cookies']
  fs.writeFile('cookie', cookies, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    res.send('Lyric saved!')
  });
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

app.use(bodyParser.json());

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
