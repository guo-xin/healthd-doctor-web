import * as actions from './actions';
const fetch = actions.fetch;

//显示工具栏
export const setAuth = actions.create(actions.SET_AUTH, 'data');

//登录
export const signIn = (params) => {
    let action = actions.SIGN_IN;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: () => fetch(`${actions.WEB_API_URI}/auth/signin`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: `u=${params.u}&p=${params.p}`
        }),
        payload: params
    };
};

//退出
export const signOut= (userName) => {
    let action = actions.SIGN_OUT;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: () => fetch(`${actions.WEB_API_URI}/auth/signout?u=${userName}`),
        // 在 actions 的开始和结束注入的参数
        payload: {userName}
    };
};

//token验证
export const verifyToken = (params) => {
    let action = actions.TOKEN_VERIFY;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: () => fetch(`${actions.WEB_API_URI}/auth/verify-token?u=${params.u}`, {
            method: 'GET',
            headers: {
                't': params.t
            }
        }),
        // 在 actions 的开始和结束注入的参数
        payload: {params}
    };
};

//token重置
export const resetToken = (params) => {
    let action = actions.TOKEN_RESET;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/auth/reset-token`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: `u=${params.u}`
        })
    };
};



