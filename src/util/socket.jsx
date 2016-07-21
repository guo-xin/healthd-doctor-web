import * as store from 'redux/store';
import cookie from 'react-cookie';
import {showCallingDialog} from 'redux/actions/call';
import {autoSaveCase} from 'redux/actions/case';

import {
    setDoctorQueueCount,
    postCloseSe,
    changeDoctorState,
    getDoctorEndInquery,
    getDoctorAttendance
} from 'redux/actions/doctor';

let source,source1;

export const receiveMessages = ()=> {
    let ErrorCount = 0;
    let doctorId = store.getState().authStore.id;

    function seEvents() {
        if (typeof(EventSource) != "undefined") {
            console.info('start listening events from server');

            source = new EventSource("v2/message/events/" + doctorId);
            source1 = new EventSource("v2/queue-message/events/" + doctorId);

            source.onmessage = function (event) {
                console.info('Received onmessage event: ' + event.data);
            };
            source1.onmessage = function (event) {
                console.info('Received onmessage1 event: ' + event.data);
            };

            source.addEventListener("voicecall/" + doctorId, function (event) {
                console.info('Received addEventListener event ' + event.type + ': ' + event.data);

                if (event.data) {
                    let preWorkingStatus = store.getState().doctorStore.data.workingStatus;

                    store.dispatch(changeDoctorState({
                        workingStatus: 1
                    }));
                    store.dispatch(showCallingDialog(true, 0, Object.assign({workingStatus: preWorkingStatus}, JSON.parse(event.data))));

                    store.dispatch(postCloseSe(doctorId)).then(()=> {
                        console.log('event source closed')
                    });
                }

            }, false);

            source1.addEventListener("queue/" + doctorId, function (event) {
                console.info('Received addEventListener event ' + event.type + ': ' + event.data);

                if (event.data) {
                    store.dispatch(setDoctorQueueCount(JSON.parse(event.data)));
                    store.dispatch(postCloseSe(doctorId)).then(()=> {
                        console.log('event source closed')
                    });
                }
            }, false);

            source.onopen = function (event) {
                console.info("event source opened");
                ErrorCount = 0;
            };

            source1.onopen = function (event) {
                console.info("event source opened1");
                ErrorCount = 0;
            };

            source.onerror = function (event) {
                if (ErrorCount < 10) {
                    setTimeout(()=> {
                        //seEvents();
                        ErrorCount++;
                    }, 5000);
                } else if (ErrorCount === 10) {
                    seClose();
                    ErrorCount = 0;
                    setTimeout(()=> {
                        seEvents();
                    }, 1000);
                }
                console.info('Received error event voicecall: ' + ErrorCount);
            };

            source1.onerror = function (event) {
                if (ErrorCount < 10) {
                    setTimeout(()=> {
                        //seEvents();
                        ErrorCount++;
                    }, 5000);
                } else if (ErrorCount === 10) {
                    seClose();
                    ErrorCount = 0;
                    setTimeout(()=> {
                        seEvents();
                    }, 1000);
                }
                console.info('Received error event queue: ' + ErrorCount);
            };

        } else {
            // Sorry! No server-sent events support..
            console.log('SSE not supported by browser.');
        }
    }

    seEvents();
};

//关闭se消息推送
export const seClose = ()=> {
    if (source && source.close) {
        source.close();
        console.log('event source closed');
        source = null;
    }
    if (source1 && source1.close) {
        source1.close();
        console.log('event source closed');
        source1 = null;
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
