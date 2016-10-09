/**
 * Created by perry on 16/10/5.
 */
'use strict';

var Promise = require('bluebird'),
    _ = require('loadsh'), // 类似underscore，据说性能更强劲
    request = Promise.promisify(require('request')),  // 用了bluebird的promise化的request请求
    util = require('./util'),
    fs = require('fs'),
    prefix = 'https://api.weixin.qq.com/cgi-bin/',
    api = {
        accessToken: prefix + 'token?grant_type=client_credential',
        temporary: {
            upload: prefix + 'media/upload?'
        },
        permanent: {
            upload: prefix + 'material/add_material?',
            uploadNews: prefix + 'material/add_news?',
            uploadNewsPic: prefix + 'media/uploadimg?'
        }
    };

function Wechat(opts) {
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    // this.fetchAccessToken();

}

/**
 * 判断票据是否过期了
 * @param data
 * @returns {boolean}
 */
Wechat.prototype.isValidAccessToken = function (data) {
    if (!data || !data.access_token || !data.expires_in) {
        return false;
    }

    var access_token = data.access_token;
    var expires_in = data.expires_in; // 过期时间
    var now = new Date().getTime();

    return now < expires_in;
};

/**
 * 更新票据
 */
Wechat.prototype.updateAccessToken = function () {
    var appID = this.appID,
        appSecret = this.appSecret,
        url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;
    return new Promise(function (resolve, reject) {
        request({url: url, json: true})
            .then(function (response) {
                var data = response.body;
                var now = (new Date().getTime());
                var expires_in = now + (data.expires_in - 20) * 1000; // -20 让票据提前20秒进行刷新（考虑请求的延迟）
                data.expires_in = expires_in;
                console.log('更新后' + data);
                resolve(data);
            });
    });
};


// wechat 请求响应方法
Wechat.prototype.reply = function () {
    var content = this.body;
    var message = this.weixin;

    var xml = util.tpl(content, message);
    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
};

Wechat.prototype.fetchAccessToken = function (data) {
    var that = this;

    if (this.access_token && this.expires_in) {
        if (this.isValidAccessToken(this)) {  // 这里理解有点问题，一直都是false
            return Promise.resolve(this);
        }
    }

    return this.getAccessToken()
        .then(function (data) {
            console.log('getAccess');
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                return that.updateAccessToken();
            }

            if (that.isValidAccessToken(data)) {
                return Promise.resolve(data);
            } else {
                return that.updateAccessToken();
            }
        })
        .then(function (data) {
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;

            that.saveAccessToken(data);

            return Promise.resolve(data);
        });
};

// uploadMaterial方法
Wechat.prototype.uploadMaterial = function (type, material, permanent) {// material，如果是图文时，传的是数组，是图片或视频的时候，传的是字符串
    var that = this;
    var form = {};
    var uploadUrl = api.temporary.upload;
    if (permanent) {
        uploadUrl = api.permanent.upload;

        _.extend(form, permanent)
    }

    if (type === 'pic') {
        uploadUrl = api.permanent.uploadNewsPic;
    }

    if (type === 'news') {
        uploadUrl = api.permanent.uploadNews;
        form = material;
    } else {
        form.media = fs.createReadStream(material);
    }
    return new Promise(function (resolve, reject) {
        that.fetchAccessToken()
            .then(function (data) {
                console.log('此处是调用了uploadMaterial:' + data);
                var url = uploadUrl + '&access_token=' + data.access_token;

                if (!permanent) {
                    url += '&type=' + type;
                }else{
                    form.access_token = data.access_token;
                }

                var options = {
                    method:'POST',
                    url: url,
                    json: true
                };

                if (type === 'news'){
                    options.body = form;
                }
                else{
                    options.formData = form;
                }

                request(options)
                    .then(function (response) {
                        var _data = response.body;
                        console.log(_data);
                        if (_data) {
                            resolve(_data);
                        } else {
                            throw new Error('Upload material fails');
                        }
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            });
    });
};

module.exports = Wechat;
