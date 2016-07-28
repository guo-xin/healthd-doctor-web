import * as actions from '../actions/actions';

const tools = (state = {
    result: {},
    picture: [],
    pictureList: [],
    forwardPicture: []
}, action) => {
    let obj;

    switch (action.type) {
        //将描述图片设为空
        case actions.CLEAR_PATIENT_PICS:
            obj = Object.assign({}, state, {
                picture: []
            });

            return obj;

        //将当前病历图片设为空
        case actions.GET_CURRENT_INQUIRY_PICTURE + "_REQUEST":
            obj = Object.assign({}, state, {
                picture: []
            });

            return obj;

        //根据病历ID查询当前病历图片
        case actions.GET_CURRENT_INQUIRY_PICTURE + "_SUCCESS":
            obj = Object.assign({}, state, {
                picture: action.response.data
            });

            return obj;

        //根据病历ID查询当前病历诊前图片
        case actions.GET_INQUIRY_FORWARD_PICTURE + "_SUCCESS":
            obj = Object.assign({}, state, {
                forwardPicture: action.response.data
            });

            return obj;

        //根据患者ID查询当前患者所有图片
        case actions.GET_PATIENT_ALL_PICTURE + "_SUCCESS":
            obj = Object.assign({}, state, {
                pictureList: action.response.data
            });

            return obj;

        //将病历未读图片设置为已读
        case actions.SET_INQUIRY_PICTURE_READY + "_SUCCESS":
            obj = Object.assign({}, state, {
                result: action.response
            });

            return obj;

        default:
            return state
    }
};

export default tools;