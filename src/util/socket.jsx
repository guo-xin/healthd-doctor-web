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

class Events {
    constructor(name, url) {
        this.ErrorCount = 0;
        this.name = name;
        this.url = url;
        this.createSource();
    }

    createSource(){
        if (typeof(EventSource) != "undefined" && this.url) {
            this.source = new EventSource(this.url);

            this.source.onmessage = this.onMessage;

            this.source.onopen = this.onOpen;

            this.source.onerror = this.onError;

            console.log(this.name + '-'+ '---------------initEvent');
        }else{
            console.log('SSE not supported by browser.');
        }
    }

    onMessage(event){
        console.info(this.name + '-'+ 'Received onmessage event: ' + event.data);
    }

    onOpen(event){
        this.ErrorCount = 0;
        console.info(this.name + '-'+ "event source opened");
    }

    onError(event){
        let ErrorCount = this.ErrorCount;
        if (ErrorCount < 10) {
            setTimeout(()=> {
                //this.createSource();
                ErrorCount++;
            }, 5000);
        } else if (ErrorCount === 10) {
            this.close();
            ErrorCount = 0;
            setTimeout(()=> {
                this.createSource();
            }, 1000);
        }
        console.info(this.name + '-'+ 'Received error event voicecall');
    }

    addEvent(event, fn){
        if(this.source && event && typeof fn === 'function'){
            this.source.addEventListener(event, fn, false);
        }
    }

    close(){
        if(this.source){
            this.source.close();
            this.source = null;
        }
    }

}


let phoneSource, queueSource;

export const receiveMessages = ()=> {
    let doctorId = store.getState().authStore.id;

    function seEvents() {
        phoneSource = new Events('phone', "v2/message/events/" + doctorId);
        phoneSource.addEvent("voicecall/" + doctorId, function (event) {
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
        });


        queueSource = new Events('queue', "v2/queue-message/events/" + doctorId);
        queueSource.addEvent("queue/" + doctorId, function () {
            console.info('Received addEventListener event ' + event.type + ': ' + event.data);

            if (event.data) {
                store.dispatch(setDoctorQueueCount(JSON.parse(event.data)));
                store.dispatch(postCloseSe(doctorId)).then(()=> {
                    console.log('event source closed')
                });
            }
        });
    }

    seEvents();
};

//关闭se消息推送
export const seClose = ()=> {
    if (phoneSource && phoneSource.close) {
        phoneSource.close();
        phoneSource = null;
        console.log('event source closed');
    }
    if (queueSource && queueSource.close) {
        queueSource.close();
        queueSource = null;
        console.log('event source closed');
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
