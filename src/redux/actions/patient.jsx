import * as actions from './actions';
import fetch from 'isomorphic-fetch';

//设置当前操作用户
export const setCurrentPatient = actions.create(actions.SET_CURRENT_PATIENT, 'data');

//根据用户ID查询关联的患者
export const getPatientsByUserId = (userId) => {
    let action = actions.GET_PATIENTS_BY_USER_ID;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/patient/user/${userId}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        }),
        // 在 actions 的开始和结束注入的参数
        payload: {userId}
    };
};

//根据患者ID查询患者信息
export const getPatientById = (patientId) => {
    let action = actions.GET_PATIENT_BY_ID;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/patient/${patientId}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        }),
        // 在 actions 的开始和结束注入的参数
        payload: {patientId}
    };
};

//创建患者
export const postPatient = (params) => {
    let action = actions.POST_PATIENT;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/patient/save`, {
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

//更新患者
export const putPatient = (params) => {
    let action = actions.PUT_PATIENT;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/patient/update`, {
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

