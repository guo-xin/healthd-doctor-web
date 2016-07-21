import * as actions from '../actions/actions';
const patient = (state = {
    users: {}, //{userId:user}
    relatedPatients: { } //{userId:relatedPatients}
}, action) => {
    let obj, data;

    switch (action.type) {

        //根据用户ID查询用户
        case actions.GET_USER_BY_ID + "_SUCCESS":
            data = (action.response || {}).data;

            if (data) {
                state.users[action.userId] = data;
            }

            obj = Object.assign({}, state);

            return obj;

        //根据手机查询用户
        case actions.GET_USER_BY_PHONE + "_SUCCESS":
            data = (action.response || {}).data;

            if (data) {
                state.users[data.userId] = data;
            }

            obj = Object.assign({}, state);

            return obj;

        //根据用户ID查询关联的患者
        case actions.GET_PATIENTS_BY_USER_ID + "_SUCCESS":
            data = (action.response || {}).data;

            if(data){
                state.relatedPatients[action.userId] = data;
            }else{
                state.relatedPatients[action.userId] = [];
            }

            obj = Object.assign({}, state);

            return obj;
        
        default:
            return state
    }
};

export default patient;