import * as actions from '../actions/actions';
import cookie from 'react-cookie';

const auth = (state = {
    id: '',
    userName: '',
    headPic: '',
    token: '',
    isAuthenticated: false,
    expires: -1,
    ocxAccount: {
        ip: "",
        port: "",
        acountSid: "",
        authToken: "",
        subAccount: "",
        subAccountPwd: "",
        voipId: "",
        voipPwd: ""
    },
    isResetting: true
}, action) => {
    let data, result;

    switch (action.type) {
        //设置登录认证信息
        case actions.SET_AUTH:
            data = action.data || {};
            
            state.userName = data.userName || '';
            state.token = data.token || '';
            state.id = data.id || '';
            state.isAuthenticated = data.isAuthenticated || false;
            state.isResetting = data.isResetting;

            return Object.assign({}, state);

        //登录
        case actions.SIGN_IN + "_SUCCESS":
            result = (action.response || {}).result;

            if (result === 0) {
                data = (action.response || {}).data || {};

                if (data.token) {
                    state.token = data.token['access_token'] || '';
                    state.expires = data.token.expires || -1;
                    state.isAuthenticated = true;

                    state.userName = data.email || '';
                    state.id = data.id || '';
                    state.headPic = data.headPic || '';

                    let exp = new Date();
                    exp.setTime(exp.getTime() + 16 * 60 * 60 * 1000);

                    cookie.save('HEALTHWEB',{
                        id: state.id,
                        t: state.token,
                        u: state.userName,
                        h: state.headPic,
                        j: data.jsessionId
                    }, {expires: exp});
                }
            }

            state.isResetting = false;

            return Object.assign({}, state);

        //重置
        case actions.TOKEN_RESET + "_SUCCESS":
            state.isResetting = false;

            return Object.assign({}, state);

        //退出
        case actions.SIGN_OUT + "_SUCCESS":
            state.userName = '';
            state.token = '';
            state.id = '';
            state.headPic = '';
            state.isAuthenticated = false;

            return Object.assign({}, state);

        //验证token
        case actions.TOKEN_VERIFY + "_SUCCESS":
            result = (action.response || {}).result;

            if (result === 0) {
                let params = action.params;
                state.userName = params.u;
                state.token = params.t;
                state.id = params.id;
                state.isAuthenticated = true;
            } else {
                state.token = '';
                state.isAuthenticated = false;
                state.id = '';
                state.headPic = '';
            }

            return Object.assign({}, state);

        //获取荣联账号
        case actions.GET_OCX_ACCOUNT + "_SUCCESS":
            result = (action.response || {}).result;

            if (result === 0) {
                data = (action.response || {}).data || {};
                state.ocxAccount = data;
            }

            return Object.assign({}, state);

        default:
            return state
    }
};

export default auth