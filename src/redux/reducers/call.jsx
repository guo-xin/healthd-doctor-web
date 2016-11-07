import * as actions from '../actions/actions'

const call = (state = {
    isShowCallDialog: false,
    isShowCallbackDialog: false,
    isShowCallbackInCaseDialog: false,
    isShowCalcDialog: false,
    userForVideoArea: {},
    callUser: {}, //通话的用户
    callState: -1, //0：呼叫中 1：通话中 -1：通话结束,
    callType: -1, //呼叫类型，1：音频，2：视频,
    inquiryCallType: -1 // 0：医生（或医助）呼叫用户 1：用户呼叫医生
}, action) => {
    let result, data;
    switch (action.type) {
        case actions.SET_CALL_INFO:
            return Object.assign({}, state, action.data);
        
        case actions.SET_USER_FOR_VIDEO_AREA:
            state.userForVideoArea = action.user || {};
            return Object.assign({}, state);


        //是否显示来电对话框
        case actions.SHOW_CALL_DIALOG:
            state.isShowCallDialog = action.isShowCallDialog;

            if( state.isShowCallDialog){
                state.isShowCallbackDialog = false;
                state.isShowCallbackInCaseDialog = false;
                state.isShowCalcDialog = false;
            }

            return Object.assign({}, state);

        //是否显示回呼对话框
        case actions.SHOW_CALLBACK_DIALOG:
            state.isShowCallbackDialog = action.isShowCallbackDialog;
            return Object.assign({}, state);

        //是否显示病历中回呼对话框
        case actions.SHOW_CALLBACK_IN_CASE_DIALOG:
            state.isShowCallbackInCaseDialog = action.isShowCallbackInCaseDialog;
            return Object.assign({}, state);

        //是否显示计次对话框
        case actions.SHOW_CALC_DIALOG:
            state.isShowCalcDialog = action.isShowCalcDialog;
            return Object.assign({}, state);

        default:
            return state
    }
};

export default call