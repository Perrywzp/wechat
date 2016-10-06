/**
 * Created by perry on 16/10/5.
 */
'use strict';

var xml2js = require('xml2js');
var Promise = require('bluebird');

exports.parseXMLAsync = function(xml){
    return new Promise(function(resolve, reject){
        xml2js.parseString(xml, {trim:true},function(err, content){
            if(err) {
                reject(err);
            }
            else {
                resolve(content);
            }
        })
    });
};


function formatMessage(result){
    var message = {};

    if(typeof result === 'object'){
        var keys = Object.keys(result); // 拿到对象的所有的key，返回的是个数组

        for(var i = 0; i< keys.length ; i++){
            var item = result[keys[i]];
            var key = keys[i];

            if(!(item instanceof Array) || item.length === 0){ // 判断不是一个数组，或者长度为0，就跳过当前循环，否则继续向下执行
                continue;
            }

            if(item.length === 1){ // 如果其是一个长度为1的数组
                var val = item[0];

                if(typeof val === 'object'){ // 判断该元素是否是对象，是则继续调用格式化函数（递归）
                    message[key] = formatMessage(val);
                }else{
                    message[key] = (val || '').trim(); //否则就直接赋值去首位空字符
                }
            }else{
                message[key] = [];

                for(var j = 0, k = item.length; j < k; j++){  //循环遍历各数组元素进行格式化
                    message[key].push(formatMessage(item[j]))
                }
            }
        }
    }

    return message;
}

exports.formatMessage = formatMessage;
