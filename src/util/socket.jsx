import * as store from 'redux/store';
import cookie from 'react-cookie';
import {setCallInfo} from 'redux/actions/call';
import {autoSaveCase} from 'redux/actions/case';
import {notification} from 'antd';

import {
    noticeChangeDoctorState,
    setDoctorQueueCount,
    getDoctorPictureMessage,
    getDoctorEndInquery,
    setDoctorClose,
    getDoctorAttendance
} from 'redux/actions/doctor';

import pubSub from 'util/pubsub';

let atmosphere = require('atmosphere.js');
let socket;
let isShowTip = true;
function showTip(){
    if(isShowTip){
        isShowTip = false;
        notification.warning({
            message: '系统提示',
            description: '网络不给力。',
            duration: null,
            onClose: function () {
                isShowTip = true;
            }
        });
    }
}

function receiveMessages() {
    let doctorId = store.getState().authStore.id;

    if (socket && socket.close) {
        socket.close();
    }

    let api = window.msgApi || '';
    let url = (api[api.length - 1] === '/' ? api : (api + '/')) + 'pubsub/doctor:' + doctorId;

    let request = {
        url: url,
        trackMessageLength: true,
        transport: 'websocket'
    };

    request.onError = function (response) {
        showTip();
        console.log('An error happen in web socket', response);
    };

    request.onMessage = function (response) {
        if (response.status == 200) {
            let resp = response.responseBody;
            if (resp) {
                try {
                    let obj = JSON.parse(resp);
                    if (obj.data && obj.type) {
                        switch (obj.type) {
                            //app呼叫推送
                            case 'appcall':
                                if(obj.data){
                                    let allState = store.getState();
                                    let preWorkingStatus = allState.doctorStore.data.workingStatus;

                                    //如果当前有来电阻止弹出下一个来电
                                    if (preWorkingStatus == 1) {
                                        return;
                                    }

                                    //设置通话信息
                                    store.dispatch(setCallInfo({
                                        callType: obj.data.callType,
                                        inquiryCallType: 1,
                                        callState: 0
                                    }));

                                    //显示来电对话框
                                    pubSub.showCallDialog(Object.assign({workingStatus: preWorkingStatus}, obj.data));


                                    //接听来电后置为占线状态
                                    store.dispatch(noticeChangeDoctorState({
                                        workingStatus: 1
                                    }));
                                }

                                break;

                            //app接听推送
                            case 'appaccept':

                                if(obj.data){
                                    pubSub.appAccept(Object.assign({},obj.data));
                                }

                                break;

                            //app挂断推送
                            case 'apphangup':

                                //设置通话状态
                                store.dispatch(setCallInfo({
                                    callState: -1
                                }));

                                if(obj.data){
                                    pubSub.appHangUp();
                                }

                                break;

                            //排队推送
                            case 'queue':
                                store.dispatch(setDoctorQueueCount(obj));
                                break;

                            //图片新消息推送
                            case 'messageInfo':
                                store.dispatch(getDoctorPictureMessage(doctorId));
                                break;
                        }
                    }
                } catch (e) {

                }

            }

        }
    };

    socket = atmosphere.subscribe(request);
}

//关闭消息推送
function seClose() {
    if (socket && socket.close) {
        socket.close();
        socket = null;
    }
}

//页面相关的监听动作
function windowListener() {

    window.onbeforeunload = function () {
        store.dispatch(autoSaveCase());

        return '数据可能会丢失!';
    };

    //当页面刷新或者关闭之前的提示
    window.onunload = function () {
        let state = store.getState();
        let attendance = true;
        let workingStatus = state.doctorStore.data.workingStatus;
        if ((workingStatus || workingStatus === 0) && workingStatus !== 9) {
            attendance = false;
        }
        let exp = new Date();
        exp.setTime(exp.getTime() + 24 * 60 * 60 * 1000);
        cookie.save('doctorStatu', {
            attendance: attendance,
            workingStatus: workingStatus
        }, {expires: exp});

        seClose();
        store.dispatch(getDoctorEndInquery(true));
    };
}

export default {
    receiveMessages,
    seClose,
    windowListener
};
