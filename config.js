/**
 * Created by perry on 16/10/6.
 */
'use strict';

var path = require('path');
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


module.exports = config;
