'use strict';

// koa框架，代码可以更精简，更易懂，对于反反复复的异步交互更适合用这个框架实现
var Koa = require('koa');
var wechat = require('./wechat/g');
var config = require('./config');
var weixin = require('./weixin');

var app = new Koa();

app.use(wechat(config.wechat, weixin.reply));

app.listen(3000);
console.log("listening: 3000");
