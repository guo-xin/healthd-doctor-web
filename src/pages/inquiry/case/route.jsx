import Case from './case';
import SelectPatient from './patient/selectPatient';
import EditPatient from './patient/editPatient';
import Detail from './detail/detail';
import * as store from 'redux/store';
import {toggleVideo} from 'redux/actions/case';
import {clearPatientPics} from 'redux/actions/tool';

module.exports = {
    path: 'case',
    component: Case,
    onEnter: ()=> {
        store.dispatch(toggleVideo(true))
    },

    onLeave: ()=> {
        store.dispatch(toggleVideo(false));
    },
    childRoutes: [
        {
            path: 'detail', component: Detail, onLeave: ()=> {
            store.dispatch(clearPatientPics());
            }
        },
        {
            path: 'selectPatient', component: SelectPatient, onEnter: (nextState, replace)=> {
            let {callStore} = store.getState();

            //非通话中禁止进入患者选择页
            if (callStore.callState === -1) {
                store.dispatch(toggleVideo(false));
                replace('/inquire/archive/waiting');
            }
        }
        },
        {path: 'patient', component: EditPatient},
        {path: 'viewPatient', component: EditPatient}
    ]
}