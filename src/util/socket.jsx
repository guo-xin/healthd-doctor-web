import * as store from 'redux/store';
import cookie from 'react-cookie';
import {showCallingDialog} from 'redux/actions/call';
import {autoSaveCase} from 'redux/actions/case';

import {
    noticeChangeDoctorState,

    setDoctorQueueCount,
    getDoctorPictureMessage,
    changeDoctorState,
    getDoctorEndInquery,
    setDoctorClose,
    getDoctorAttendance
} from 'redux/actions/doctor';

let atmosphere = require('atmosphere.js');
let socket;

export const receiveMessages = ()=> {
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

    request.onMessage = function (response) {
        if (response.status == 200) {
            let resp = response.responseBody;
            if (resp) {
                try {
                    let obj = JSON.parse(resp);
                    if (obj.data && obj.type) {
                        switch (obj.type) {
                            //声网来电推送
                            case 'appcall':
                                if(obj.data){
                                    let allState = store.getState();
                                    let preWorkingStatus = allState.doctorStore.data.workingStatus;
                                    let isShowCallingDialog = allState.callStore.isShowCallingDialog;

                                    //如果当前有来电阻止弹出下一个来电
                                    if (isShowCallingDialog) {
                                        return;
                                    }
                                    console.log('appcall----------', obj.data);
                                    //接听来电后置为占线状态
                                    store.dispatch(noticeChangeDoctorState({
                                        workingStatus: 1
                                    }));

                                    store.dispatch(showCallingDialog(true, obj.data.callType, Object.assign({workingStatus: preWorkingStatus}, obj.data)));
                                }

                                break;

                            case 'appaccept':

                                if(obj.data){
                                    console.log('appaccept----------', obj.data);
                                }

                                break;

                            case 'apphangup':

                                if(obj.data){
                                    console.log('apphangup----------', obj.data);
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
};

//关闭消息推送
export const seClose = ()=> {
    if (socket && socket.close) {
        socket.close();
        socket = null;
    }
};

//页面相关的监听动作
export const windowListen = ()=> {

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
        store.dispatch(getDoctorEndInquery());
    };
};
