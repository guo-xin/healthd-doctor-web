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
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/case/pic/list/${caseId}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        })
    };
};



