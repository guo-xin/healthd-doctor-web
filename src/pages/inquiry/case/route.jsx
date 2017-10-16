import Case from './case';
import EditPatient from './patient/editPatient';
import Detail from './detail/detail';
import * as store from 'redux/store';
import {toggleVideo} from 'redux/actions/case';

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
            path: 'detail', component: Detail, onLeave: ()=> {}
        },
        {path: 'patient', component: EditPatient},
        {path: 'viewPatient', component: EditPatient}
    ]
};