import * as actions from '../actions/actions';
import cookie from 'react-cookie';

const patient = (state = {
    currentPatient: {
        patientId: null,
        state: -1 //-1：新建 0：查看 1：编辑
    },
    patients:{}, //{patientId:patient}
    relatedCases:{} //{patientId:cases}
}, action) => {
    let obj, data;

    switch (action.type) {
        case actions.SET_CURRENT_PATIENT:
            data = action.data;

            if(data){
                state.currentPatient = Object.assign({}, state.currentPatient, data);
            }

            cookie.save('p', state.currentPatient);

            return state;

        //创建患者
        case actions.POST_PATIENT + "_SUCCESS":
            data = (action.response || {}).data;

            if(data){
                state.patients[data.id] = data;
                obj = Object.assign({}, state);
                return obj;
            }

            return state;
        

        //更新患者
        case actions.PUT_PATIENT + "_SUCCESS":
            data = (action.response || {}).data;

            if(data){
                state.patients[data.id] = data;
                obj = Object.assign({}, state);
                return obj;
            }

            return state;

        //更加患者ID查询患者
        case actions.GET_PATIENT_BY_ID + "_SUCCESS":
            data = (action.response || {}).data;

            if(data){
                state.patients[action.patientId] = data;
                obj = Object.assign({}, state);
                return obj;
            }

            return state;

        //更加患者ID查询患者病历
        case actions.GET_CASES_BY_PATIENT_ID + "_SUCCESS":
            data = (action.response || {}).data;
            if(Array.isArray(data)){
                state.relatedCases[action.patientId] = data;
                obj = Object.assign({}, state);
                return obj;
            }

            return state;

        default:
            return state
    }
};

export default patient;