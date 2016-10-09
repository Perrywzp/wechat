/**
 * Created by perry on 16/10/6.
 */
'use strict';

var config = require('./config');
var Wechat = require('./wechat/wechat');
var path = require('path');
var wechatApi = new Wechat(config.wechat); //初始化一个wechatApi实例


exports.reply = function*(next) {
    var message = this.weixin;
    if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            if (message.EventKey) {
                console.log('扫二维码进来：' + message.EventKey + ' ' + message.Ticket);
            }

            this.body = '哈哈，你订阅了罗幕公众号\r\n' + ' 消息ID： ' + message.MsgId;
        }
        else if (message.Event === 'unsubscribe') {
            console.log('无情取消关注！');
            this.body = '';
        }
        else if (message.Event === 'LOCATION') {
            this.body = '您上报的位置是：  ' + message.Laitude + '/' + message.Longtitude +
                '-' + message.Precision;
        }
        else if (message.Event === 'CLICK') {
            this.body = '您点击了菜单:  ' + message.EventKey;
        }
        else if (message.Event === 'SCAN') {
            console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket);
            this.body = '看到你扫了一下哦！'
        }
        else if (message.Event === 'VIEW') {
            this.body = '您点击了菜单中连接： ' + message.EventKey // 菜单中的url地址
        }
    }
    else if (message.MsgType === 'text') {
        var content = message.Content;
        var reply = '查无此人 ' + message.Content;
        // 回复的策略
        if (content === '1') {
            reply = '原来是你，逗逼！';
        }
        else if (content === '2') {
            reply = '好久不见，傻帽!';
        }
        else if (content === '3') {
            reply = '怎么又是你个二百五！';
        }
        else if (content === '4') {  // 数组是图文信息
            reply = [{
                title: '我就玩玩',
                description: '不要太当真',
                picUrl: 'http://pic.nipic.com/2007-11-09/2007119122637650_2.jpg',
                url: 'https://github.com/'
            }, {
                title: '这是我的地址',
                description: '可以来see see',
                picUrl: 'http://pic1a.nipic.com/2008-10-08/2008108191359851_2.jpg',
                url: 'http://www.masoga.cn'
            }]
        }
        else if (content === '5') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname + '/material/6.jpg'));
            console.log(path.join(__dirname + '/material/6.jpg'));
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        }
        else if (content === '6') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname + '/material/6.jpg'));
            console.log(data);
            reply = {
                type: 'video',
                title: '回复视频内容',
                description: 'just play for fun',
                mediaId: data.media_id
            }

        }
        else if (content === '7') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname + '/material/6.jpg'));
            console.log(data);
            reply = {
                type: 'music',
                title: '速度与激情',
                description: 'high一下',
                musicUrl: 'http://yinyueshiting.baidu.com/data2/music/134375021/117570561200128.mp3?xcode=6460dd18e6f686fe84b505fb6b038464',
                thumbMediaId: data.media_id,
            }
        }
        else if (content === '8'){
            var data = yield wechatApi.uploadMaterial('image',__dirname + '/material/6.jpg',{type:'image'});
            reply = {
                type:'image',
                mediaId:data.media_id
            }
        }
        else if (content === '9'){
            var data = yield wechatApi.uploadMaterial('video',__dirname + '/material/4.mp4',{type:'video',description:'{"title":"Really a nice place","introduction":"hehe"}'});
            reply = {
                type:'video',
                mediaId:data.media_id
            }
        }
        this.body = reply;
    }

    yield next;
};
