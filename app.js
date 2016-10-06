'use strict';

// koa框架，代码可以更精简，更易懂，对于反反复复的异步交互更适合用这个框架实现
var Koa = require('koa');
var path = require('path');
var wechat = require('./wechat/g');
var util = require('./libs/util');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var config = {
    wechat: {
        appID: 'wxb59d8244cb0accbe',
        appSecret: 'e88c6ba29578fdc3f1d3d1039ad341cd',
        token: 'yesterday',
        getAccessToken:function(){
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken:function(data){
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file,data);
        }
    }
};

var app = new Koa();

app.use(wechat(config.wechat));

app.listen(3000);
console.log("listening: 3000");
