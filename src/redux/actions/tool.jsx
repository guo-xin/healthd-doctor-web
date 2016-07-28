import * as actions from './actions';
import fetch from 'isomorphic-fetch';

export const clearPatientPics = actions.create(actions.CLEAR_PATIENT_PICS);


//患者描述图片
export const getPatientPicture = (caseId) => {
    let action = actions.GET_PATIENT_PICTURE;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/case/pic/list/${caseId}`, {
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//将未读图片设置为已读
export const setInqueryPictureRead = (pictureId) => {
    let action = actions.SET_INQUERY_PICTURE_READY;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：https://test.d.healthdoc.cn/v2/message-info/is-read?id=1
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/message-info/is-read?id=${pictureId}`, {
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//本次问诊的患者所有图片
export const getPatientAllPicture = (patientId) => {
    let action = actions.GET_PATIENT_ALL_PICTURE;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：https://test.d.healthdoc.cn/v2/inquiry-info-attachment/list?patientId=4
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry-info-attachment/list?patientId=${patientId}`, {
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};

//本次问诊患者描述图片
export const getCurrentInqueryPicture = (caseId) => {
    let action = actions.GET_CURRENT_INQUERY_PICTURE;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：https://test.d.healthdoc.cn/v2/inquiry-info-attachment/list-history-case?historyCaseId=443
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry-info-attachment/list-history-case?historyCaseId=${caseId}`, {
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



