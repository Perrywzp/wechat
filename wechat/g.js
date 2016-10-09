'use strict';

var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Wechat = require('./wechat');
var util = require('./util');
module.exports = function (opts, handler) {

    var wechat = new Wechat(opts); // 管理票据的更新和检查

    return function *(next) {
        var that = this;
        var token = opts.token,
            signature = this.query.signature,
            nonce = this.query.nonce,
            timestamp = this.query.timestamp,
            echostr = this.query.echostr,
            str = [token, timestamp, nonce].sort().join(''),
            sha = sha1(str);

        if (this.method === 'GET') {
            if (sha === signature) {
                this.body = echostr + '';
                console.log(echostr);
                console.log(sha + "1");
            } else {
                console.log(sha + "0");
                this.body = 'wrong';
            }
        }

        if (this.method === 'POST') { // 微信公众号将用户的事件信息推送过来

            if (sha !== signature) {
                this.body = 'wrong';

                return false;
            }
            //raw-body模块， 可以把这个this上的request对象，其实也就是http模块中
            // 的request对象，去拼装它的数据，最终可以拿到一个buffer的xml数据


            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            });

            var content = yield util.parseXMLAsync(data);
            var message = util.formatMessage(content.xml);

            this.weixin = message;
            yield handler.call(this, next);

            wechat.reply.call(this);


        }

    };
};

