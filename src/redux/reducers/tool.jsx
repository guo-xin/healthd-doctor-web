import * as actions from '../actions/actions';

const tools = (state = {
    result: {}
}, action) => {
    let obj;

    switch (action.type) {
        //将病历未读图片设置为已读
        case actions.SET_INQUIRY_PICTURE_READY + "_SUCCESS":
            obj = Object.assign({}, state, {
                result: action.response.result
            });

            return obj;

        default:
            return state
    }
};

export default tools;