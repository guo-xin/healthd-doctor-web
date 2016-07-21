import * as actions from '../actions/actions'

const call = (state = {
    isShowCalcDialog: false,
    isShowCallingDialog: false,
    isShowCallbackDialog: false,
    isShowCallbackFromCaseDialog: false,
    userForVideoArea: {},
    incomingUserId: -1,
    incomingUser: {},
    incomingCount: 0,
    incomingCallInfo: {},
    inquiryId: null, //会话Id
    callbackUserId: -1,
    callbackUser: {},
    callState: -1, //0：呼叫中 1：通话中 -1：通话结束,
    callMessage: {}, //通话接口返回的信息
    callType: -1, //呼叫类型，0：音频，1：视频,
    inquiryCallType: -1 // 0：医生（或医助）呼叫用户 1：用户呼叫医生
}, action) => {
    let result, data;
    switch (action.type) {
        case actions.SET_CALL_STATE:
            state.callState = action.state;
            state.callMessage = action.msg || {};
            return Object.assign({}, state);

        //设置正在来电用户
        case actions.SET_INCOMING_USER_ID:
            if (action.userId) {
                state.incomingUserId = action.userId;
                state.incomingUser = action.user;
                state.incomingCount += 1;
                state.userForVideoArea = action.user;

                return Object.assign({}, state);
            }

            return state;
        
        case actions.SET_USER_FOR_VIDEO_AREA:
            state.userForVideoArea = action.user || {};
            return Object.assign({}, state);

        //设置回呼的用户信息
        case actions.SET_CALLBACK_USER_ID:
            if (action.userId) {
                state.callbackUserId = action.userId;
                state.callbackUser = action.user;

                return Object.assign({}, state);
            }

            return state;

        //是否显示来电对话框
        case actions.SHOW_CALLING_DIALOG:
            let info = {};

            state.isShowCallingDialog = action.isShowCallingDialog;

            //来电时隐藏其他窗口
            if(action.isShowCallingDialog){
                state.isShowCalcDialog = false;
                state.isShowCallbackDialog = false;
                state.isShowCallbackFromCaseDialog = false;

                state.callType = action.callType;

                //视频来电
                if(action.callType === 1){
                    data = action.data;
                    state.callState = data.callState;
                    info = data.msg || {};
                    if(info.caller){
                        info = Object.assign({}, info);

                        let list = info.caller.split('$');

                        if (list.length > 0) {
                            info.phone = list[1];
                        }
                    }

                    state.incomingCallInfo = info;
                }

                //音频来电
                if(action.callType === 0){
                    data = action.data;
                    info.workingStatus = data.workingStatus;
                    info.id = data.id;
                    info.type = data.type;

                    info = Object.assign(info, data.data);
                    info.phone = info.tel;
                    info.callType = 0;
                    delete info.tel;

                    state.incomingCallInfo = info;
                }

                state.inquiryCallType = 1;
            }
            
            return Object.assign({}, state);

        //是否显示回呼对话框
        case actions.SHOW_CALLBACK_DIALOG:
            state.isShowCallbackDialog = action.isShowCallbackDialog;
            state.callType = action.callType;
            state.inquiryCallType = 0;
            return Object.assign({}, state);

        //设置病历中回呼对话框是否显示
        case actions.SHOW_CALLBACK_FROM_CASE_DIALOG:
            state.isShowCallbackFromCaseDialog = action.isShowCallbackFromCaseDialog;
            state.callType = action.callType;
            state.inquiryCallType = 0;
            return Object.assign({}, state);

        //是否显示计次对话框
        case actions.SHOW_CALC_DIALOG:
            state.isShowCalcDialog = action.isShowCalcDialog;
            return Object.assign({}, state);

        //添加问诊通话记录
        case actions.ADD_CALL_RECORD + '_SUCCESS':
            result = (action.response || {}).result;

            if(result === 0){
                data = (action.response || {}).data || {};

                return Object.assign({}, state, {
                    inquiryId: data.inquiryId || null
                });
            }else{
                return Object.assign({}, state, {
                    inquiryId: null
                });
            }

            return state;

        //添加问诊通话记录
        case actions.GET_INQUIRY_RECORD + '_SUCCESS':
            result = (action.response || {}).result;

            if(result === 0){
                data = (action.response || {}).data || {};

                return Object.assign({}, state, {
                    inquiryId: data.inquiryId || null
                });
            }else{
                return Object.assign({}, state, {
                    inquiryId: null
                });
            }

            return state;

        default:
            return state
    }
};

export default call