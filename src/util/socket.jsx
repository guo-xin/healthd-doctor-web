import * as store from 'redux/store';
import cookie from 'react-cookie';
import {showCallingDialog} from 'redux/actions/call';
import {autoSaveCase} from 'redux/actions/case';

import {
    setDoctorQueueCount,
    changeDoctorState,
    getDoctorEndInquery,
    getDoctorAttendance
} from 'redux/actions/doctor';

class Events {
    constructor(name, url) {
        this.name = name;
        this.url = url;
        this.createSource();
    }

    createSource() {
        if (typeof(EventSource) != "undefined" && this.url) {
            let self = this;
            this.source = new EventSource(this.url);

            /*this.source.onmessage = function (event) {
             self.onMessage.call(self, event);
             };*/

            this.source.onopen = function (event) {
                self.onOpen.call(self, event);
            };

            this.source.onerror = function (event) {
                self.onError.call(self, event);
            };

            console.log(this.name + '-' + 'start listening events from server');
        } else {
            console.log('SSE not supported by browser.');
        }
    }

    onMessage(event) {
        console.info(this.name + '-' + 'Received onmessage event: ' + event.data);
    }

    onOpen(event) {
        console.info(this.name + '-' + "event source opened,");
    }

    onError(event) {
        console.info(this.name + '-' + 'Received error event voicecall', event);
    }

    addEvent(event, fn) {
        if (this.source && event && typeof fn === 'function') {
            this.source.addEventListener(event, fn, false);
        }
    }

    close() {
        if (this.source) {
            this.source.close();
            this.source = null;
        }
    }
}


let phoneSource, queueSource;

export const receiveMessages = ()=> {
    let doctorId = store.getState().authStore.id;

    function seMessage() {
        //电话推送
        phoneSource = new Events('phone', "v2/message/events/" + doctorId);
        phoneSource.addEvent("voicecall/" + doctorId, function (event) {
            console.info('Received addEventListener event ' + event.type + ': ' + event.data);
            if (event.data) {
                let preWorkingStatus = store.getState().doctorStore.data.workingStatus;

                store.dispatch(changeDoctorState({
                    workingStatus: 1
                }));
                store.dispatch(showCallingDialog(true, 0, Object.assign({workingStatus: preWorkingStatus}, JSON.parse(event.data))));
            }

        });

        let SSECheck = setInterval(function () {
            if (phoneSource.source && phoneSource.source.readyState == 2) {
                clearInterval(SSECheck);
                phoneSource.close();
                seMessage();
                console.log('event phoneSource restart');
            }

        }, 1000);
    }

    function seQueueMessage() {

        //排队推送
        queueSource = new Events('queue', "v2/queue-message/events/" + doctorId);
        queueSource.addEvent("queue/" + doctorId, function (event) {
            console.info('Received addEventListener event ' + event.type + ': ' + event.data);
            if (event.data) {
                store.dispatch(setDoctorQueueCount(JSON.parse(event.data)));
            }

        });

        let SSECheck = setInterval(function () {


            if (queueSource.source && queueSource.source.readyState == 2) {
                clearInterval(SSECheck);
                queueSource.close();
                seQueueMessage();
                console.log('event queueSource restart');
            }

        }, 1000);
    }

    seQueueMessage();
    seMessage();
};

//关闭se消息推送
export const seClose = ()=> {
    if (phoneSource && phoneSource.close) {
        phoneSource.close();
        console.log('event phoneSource closed');
    }
    if (queueSource && queueSource.close) {
        queueSource.close();
        console.log('event queueSource closed');
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
