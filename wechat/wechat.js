/**
 * Created by perry on 16/10/5.
 */
'use strict';

var Promise = require('bluebird'),
    request = Promise.promisify(require('request')),  // 用了bluebird的promise化的request请求
    prefix = 'https://api.weixin.qq.com/cgi-bin/',
    api = {
        accessToken: prefix+'token?grant_type=client_credential'
    };

function Wechat(opts){
    var that = this;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    this.getAccessToken()
        .then(function(data){
            try{
                data = JSON.parse(data);
            }
            catch(e){
                return that.updateAccessToken();
            }

            if(that.isValidAccessToken(data)){
                return Promise.resolve(data);
            }else{
                return that.updateAccessToken();
            }
        })
        .then(function(data){
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;

            that.saveAccessToken(data);
        });
}

/**
 * 判断票据是否过期了
 * @param data
 * @returns {boolean}
 */
Wechat.prototype.isValidAccessToken = function(data){
    if(!data || !data.access_token || !data.expires_in){
        return false;
    }

    var access_token = data.access_token;
    var expires_in = data.expires_in; // 过期时间
    var now = (new Date().getTime());

    if (now < expires_in) {
        return true;
    }else{
        return false;
    }
};

/**
 * 更新票据
 */
Wechat.prototype.updateAccessToken = function() {
    var appID = this.appID,
        appSecret = this.appSecret,
        url = api.accessToken + '&appid='+appID + '&secret='+appSecret;
    return new Promise(function(resolve,reject){
        request({url: url, json: true})
            .then(function(response){
                var data = response.body;
                var now = (new Date().getTime());
                var expires_in = now + (data.expires_in - 20) * 1000; // -20 让票据提前20秒进行刷新（考虑请求的延迟）
                data.expires_in = expires_in;

                resolve(data);
            });
    });
};
module.exports = Wechat;