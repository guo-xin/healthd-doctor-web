import * as store from 'redux/store';
import cookie from 'react-cookie';
import {showCallingDialog} from 'redux/actions/call';
import {autoSaveCase} from 'redux/actions/case';

import {
    setDoctorQueueCount,
    getDoctorPictureMessage,
    changeDoctorState,
    getDoctorEndInquery,
    setDoctorClose,
    getDoctorAttendance
} from 'redux/actions/doctor';

class Events {
    constructor(name, url, events = []) {
        this.name = name;
        this.url = url;
        this.events = events;
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

            this.addEvents();

            console.log(this.name + '-' + 'start listening events from server');
        } else {
            console.log('SSE not supported by browser.');
        }
    }

    addEvents() {
        let events = this.events || [];
        let source = this.source;
        let item;

        if (events.length > 0) {
            for (let i = 0; i < events.length; i++) {
                item = events[i] || {};

                if (item.event && typeof item.fn == 'function') {
                    source.addEventListener(item.event, item.fn, false);
                }

            }
        }
    }

    onMessage(event) {
        console.info(this.name + '-' + 'Received onmessage event: ' + event.data);
    }

    onOpen(event) {
        console.info(this.name + '-' + "event source opened,");
    }

    onError(event) {
        console.info(this.name + '-' + 'Received error event voicecall');
        if (!this.isClose) {
            this.close();
        }
    }

    addEvent(event, fn) {
        if (this.source && event && typeof fn === 'function') {
            this.source.addEventListener(event, fn, false);
        }
    }

    close(isClose) {
        this.isClose = isClose;
        if (this.source) {
            console.info(this.name + '-' + "event source closed,");

            if (this.isClose) {
                this.source.close();
                //this.source = null;
            } else {
                let doctorId = store.getState().authStore.id;
                store.dispatch(setDoctorClose(this.name, doctorId)).then(()=> {
                    this.source.close();
                    this.createSource();
                });
            }
        }
    }
}


let phoneSource, queueSource, infoSource;

export const receiveMessages = ()=> {
    let doctorId = store.getState().authStore.id;

    //电话推送
    function seMessage() {
        phoneSource = new Events('message', "v2/message/events/" + doctorId, [
            {
                event: "voicecall/" + doctorId,
                fn: function (event) {
                    console.info('Received addEventListener event ' + event.type + ': ' + event.data);
                    if (event.data) {
                        let preWorkingStatus = store.getState().doctorStore.data.workingStatus;

                        store.dispatch(changeDoctorState({
                            workingStatus: 1
                        }));
                        store.dispatch(showCallingDialog(true, 0, Object.assign({workingStatus: preWorkingStatus}, JSON.parse(event.data))));
                    }

                }
            }
        ]);
    }

    //排队推送
    function seQueueMessage() {
        queueSource = new Events('queue-message', "v2/queue-message/events/" + doctorId, [
            {
                event: "queue/" + doctorId,
                fn: function (event) {
                    console.info('Received addEventListener event ' + event.type + ': ' + event.data);
                    if (event.data) {
                        store.dispatch(setDoctorQueueCount(JSON.parse(event.data)));
                    }

                }
            }
        ]);
    }

    //图片新消息推送
    function seMessageInfo() {
        infoSource = new Events('message-info-push', "v2/message-info-push/events/" + doctorId, [
            {
                event: "messageInfo/" + doctorId,
                fn: function (event) {
                    console.info('Received addEventListener event ' + event.type + ': ' + event.data);
                    if (event.data) {
                        store.dispatch(getDoctorPictureMessage(doctorId));
                    }
                }
            }
        ]);
    }


    seMessage();
    seQueueMessage();
    seMessageInfo();
};

//关闭se消息推送
export const seClose = ()=> {
    if (phoneSource && phoneSource.close) {
        phoneSource.close(true);
        console.log('event phoneSource closed');
    }
    if (queueSource && queueSource.close) {
        queueSource.close(true);
        console.log('event queueSource closed');
    }

    if (infoSource && infoSource.close) {
        infoSource.close(true);
        console.log('event infoSource closed');
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
