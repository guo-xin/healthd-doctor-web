import * as actions from '../actions/actions';

const tools = (state = {picture: []}, action) => {
    let obj;

    switch (action.type) {
        ////将描述图片设为空
        case actions.CLEAR_PATIENT_PICS:
            obj = Object.assign({}, state, {
                picture: []
            });

            return obj;

        //查询将描述图片设为空
        case actions.GET_PATIENT_PICTURE + "_REQUEST":
            obj = Object.assign({}, state, {
                picture: []
            });

            return obj;

        //根据病历ID查询病历
        case actions.GET_PATIENT_PICTURE + "_SUCCESS":
            obj = Object.assign({}, state, {
                picture: action.response.data
            });

            return obj;

        default:
            return state
    }
};

export default tools;