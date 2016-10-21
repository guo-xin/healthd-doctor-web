let pubSub = require('pubsub-js');

let topic = {
    APP_HANGUP: 'APP_HANGUP',
    SHOW_CALL_DIALOG: 'SHOW_CALL_DIALOG',
    SHOW_CALLBACK_DIALOG_IN_CASE: 'SHOW_CALLBACK_DIALOG_IN_CASE'
};

//显示来电对话框
function showCallDialog(data) {
    pubSub.publish(topic.SHOW_CALL_DIALOG, data)
}

function subShowCallDialog(fn) {
    if(typeof fn === 'function'){
        pubSub.subscribe(topic.SHOW_CALL_DIALOG, fn)
    }
}

//显示回呼对话框
function showCallbackDialog(data) {
    pubSub.publish(topic.SHOW_CALLBACK_DIALOG, data)
}

function subShowCallbackDialog(fn) {
    if(typeof fn === 'function'){
        pubSub.subscribe(topic.SHOW_CALLBACK_DIALOG, fn)
    }
}

//病历中回呼
function showCallbackDialogInCase(data) {
    pubSub.publish(topic.SHOW_CALLBACK_DIALOG_IN_CASE, data)
}

function subShowCallbackDialogInCase(fn) {
    if(typeof fn === 'function'){
        pubSub.subscribe(topic.SHOW_CALLBACK_DIALOG_IN_CASE, fn)
    }
}

//app端挂断
function appHangUp(data) {
    pubSub.publish(topic.APP_HANGUP, data)
}

function subAppHangUp(fn) {
    if(typeof fn === 'function'){
        pubSub.subscribe(topic.APP_HANGUP, fn)
    }
}

//取消订阅
function unSubscribe(token ) {
    if(token){
        pubSub.unsubscribe(token);
    }
}

module.exports = {
    unSubscribe,
    showCallDialog,
    subShowCallDialog,
    showCallbackDialog,
    subShowCallbackDialog,
    showCallbackDialogInCase,
    subShowCallbackDialogInCase,
    appHangUp,
    subAppHangUp
};

