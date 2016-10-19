import * as actions from './actions';
const fetch = actions.fetch;

export const showCallingDialog = actions.create(actions.SHOW_CALLING_DIALOG, 'isShowCallingDialog', 'callType', 'data');
export const showCallbackDialog = actions.create(actions.SHOW_CALLBACK_DIALOG, 'isShowCallbackDialog', 'callType');
export const showCallbackFromCaseDialog = actions.create(actions.SHOW_CALLBACK_FROM_CASE_DIALOG, 'isShowCallbackFromCaseDialog', 'callType');
export const showCalcDialog = actions.create(actions.SHOW_CALC_DIALOG, 'isShowCalcDialog');

export const setIncomingUserId = actions.create(actions.SET_INCOMING_USER_ID, 'userId', 'user');
export const setCallbackUserId = actions.create(actions.SET_CALLBACK_USER_ID, 'userId', 'user');
export const setCallState = actions.create(actions.SET_CALL_STATE, 'state', 'msg');
export const setUserForVideoArea = actions.create(actions.SET_USER_FOR_VIDEO_AREA, 'user');


//WEB回呼APP接口-统一接口
export const agoraCall = (params)=>{
    let action = 'agoraCall';
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/agora/call`,{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            },
            body: JSON.stringify(params)
        })
    };

};

//WEB收到呼叫之后-统一接口
export const agoraAccept = (params)=>{
    let action = 'agoraAccept';
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/agora/accept`,{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            },
            body: JSON.stringify(params)
        })
    };

};

//WEB医生挂断(接听后)
export const agoraVoipInviteBye = (params)=>{
    let action = 'agoraVoipInviteBye';
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/agora/voip-invite-bye`,{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            },
            body: JSON.stringify(params)
        })
    };

};


//WEB医生拒接接听
export const agoraVoipInviteRefuse = (params)=>{
    let action = 'agoraVoipInviteRefuse';
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/agora/voip-invite-refuse`,{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            },
            body: JSON.stringify(params)
        })
    };

};

//WEB订阅服务端账号事件
export const subscribeServerEvent = (doctorId) => {
    let action = 'subscribeServerEvent';

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/agora/start-server/${doctorId}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};












//查询通话计划
export const getCallRecords = (inquiryId) => {
    let action = actions.GET_CALL_RECORD;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/ocx/record/list/${inquiryId}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//挂掉通话后删除缓存
export const deleteCallCache = () => {
    let action = actions.DELETE_CALL_CACHE;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/ocx/record/delete`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//电话呼叫超时拒接调用接口
export const callTimeoutOrReject = () => {
    let action = actions.CALL_TIMEOUT_REJECT;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/ocx/voicecall/delete`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//排队回呼推送
export const queueBack = (params) => {
    let action = actions.QUEUE_BACK;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/ocx/queue/back/${params.userId}/${params.startTime}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//取消排队
export const cancelQueue = (params) => {
    let action = actions.QUEUE_CANCEL;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/queue/cancel/${params.queueId}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//未读问诊推送
export const unReadInquiry = (params) => {
    let action = actions.UNREAD_INQUIRY;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/ocx/unread/inquiries/${params.caseId}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//未接来电
export const missedCall = (params) => {
    let action = actions.MISSED_CALL;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/ocx/missed/calls/${params.userId}/${params.startTime}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//未接来电短信通知
export const sendMissedCallMsg = (params) => {
    let action = actions.SEND_MISSED_CALL_MSG;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/ocx/sms/missed-calls/${params.phone}/${params.type}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//挂断扣次
export const reduceService = (params) => {
    let action = actions.REDUCE_SERVICE;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry/service/reduce`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            },
            body: JSON.stringify(params)
        })
    };
};

//挂断后查询服务包次数
export const queryService = (inquiryId) => {
    let action = actions.QUERY_SERVICE;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/ocx/pkg/query/${inquiryId}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        }),
        payload: { inquiryId }
    };
};


//电话预约之后医生挂断和超时未接调用更新通话记录状态接口
export const addRecordForTimeoutAndHangup = (params) => {
    let action = actions.PHONE_TIMEOUT_AND_HANGUP;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/ocx/communication-record/update`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            },
            body: JSON.stringify(params)
        })
    };
};