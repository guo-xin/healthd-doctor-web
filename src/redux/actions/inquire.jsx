import * as actions from './actions';

//点击问诊优先进入有内容模块
export const getInquireNumber = () => {
    let action = actions.GET_INQUIRE_NUMBER;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry/query/number`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};


//等待问诊
export const getInquireQueue = () => {
    let action = actions.GET_INQUIRE_QUEUE;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry/queue`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};


//异常问诊
export const getInquireQueueException = () => {
    let action = actions.GET_INQUIRE_QUEUE_EXCEPTION;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry/queueexception`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//查询挂断后，患者第几次问诊次数
export const getInquireCallbackNumber = (params) => {
    let action = actions.GET_INQUIRE_CALLBACK_NUMBER;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry/callback/number?inquiryId=${params.inquiryId}&patientId=${params.patientId}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};


//查询挂断后，患者第几次问诊次数
export const getMaterialBeforeCase = (params) => {
    let action = actions.GET_MATERIAL_BEFORE_CASE;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry/query/beforecase-pic?inquiryInfoId=${params.inquiryInfoId}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};