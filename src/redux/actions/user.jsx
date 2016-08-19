import * as actions from './actions';
const fetch = actions.fetch;

//根据用户ID查询用户
export const getUserById = (userId) => {
    let action = actions.GET_USER_BY_ID;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/user/${userId}`, {
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        }),
        // 在 actions 的开始和结束注入的参数
        payload: {userId}
    };
};

//根据手机查询用户
export const getUserByPhone = (phone) => {
    let action = actions.GET_USER_BY_PHONE;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/user/phone/${phone}`, {
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        }),
        // 在 actions 的开始和结束注入的参数
        payload: {phone}
    };
};

//根据用户手机号、患者ID、呼叫类型、获取用户信息
export const getUserByMPTV = (params) => {
    let action = actions.GET_USER_BY_MPTV;
    let queryList = [];
    for (let key in params) {
        if (params[key]) {
            queryList.push(key + '=' + params[key]);
        }
    }

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/user/find/info?` + queryList.join('&'), {
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        }),
        // 在 actions 的开始和结束注入的参数
        payload: params
    };
};

