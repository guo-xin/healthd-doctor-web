import * as actions from './actions';
const fetch = actions.fetch;

//将未读图片设置为已读
export const setInquiryPictureRead = (messageInfoId) => {
    let action = actions.SET_INQUIRY_PICTURE_READY;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：https://test.d.healthdoc.cn/v2/message-info/is-read?id=1
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/message-info/is-read?id=${messageInfoId}`, {
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//患者所有图片
export const getPatientAllPicture = (patientId) => {
    let action = actions.GET_PATIENT_ALL_PICTURE;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：https://test.d.healthdoc.cn/v2/inquiry-info-attachment/list?patientId=4
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry-info-attachment/list?patientId=${patientId}&size=20`, {
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};


//本次问诊所有图片
export const getInquiryAllPicture = (caseId, inquiryInfoId) => {
    let action = actions.GET_INQUIRY_ALL_PICTURE;
    let params = [];

    if (caseId) {
        params.push('historyCaseId=' + caseId);
    }

    if (inquiryInfoId) {
        params.push('inquiryInfoId=' + inquiryInfoId);
    }

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：http://localhost:8080/healthd-api/v2/inquiry-info-attachment/list-history-case-pre?historyCaseId=1678&inquiryInfoId=10
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry-info-attachment/list-history-case-pre?` + params.join('&'), {
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//向用户发送短信
export const sendMessageByDoctor = (params) => {
    let action = actions.SEND_MESSAGE_BY_DOCTOR;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/doctor-sms/send`, {
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

//根据短信记录Id向用户重新发送短信
export const sendMessageByRecordId = (params) => {
    let action = actions.SEND_MESSAGE_BY_DOCTOR;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/doctor-sms/resend`, {
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


//根据病历ID查询短信
export const getMessageByCaseId = (caseId) => {
    let action = actions.GET_MESSAGE_BY_CASE_ID;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/doctor-sms/list/${caseId}`, {
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};



