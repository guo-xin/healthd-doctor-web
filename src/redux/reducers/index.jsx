import { combineReducers } from 'redux'
import call from './call';
import inquire from './inquire';
import patient from './patient';
import user from './user';
import doctor from './doctor';
import dictionary from './dictionary';
import cases from './case';
import auth from './auth';
import tools from './tool';

const reducers = combineReducers({
    userStore:user,
    callStore: call,
    inquireStore: inquire,
    patientStore: patient,
    dictionary: dictionary,
    doctorStore:doctor,
    caseStore: cases,
    authStore: auth,
    toolStore: tools
});

export default reducers