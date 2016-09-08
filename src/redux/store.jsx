import {compose, createStore, applyMiddleware} from 'redux';
import reduxReset from 'redux-reset';
import thunkMiddleware from 'redux-thunk'
import reducers from './reducers';
import {message} from 'antd';

//处理异步动作中间件
function callAsyncActionsMiddleware({dispatch, getState}) {
    return (next) => (action) => {
        const {types, callAPI, shouldCallAPI = () => true, payload = {}} = action;

        if (!types) {
            // 普通 action：传递
            return next(action);
        }

        if (
            !Array.isArray(types) ||
            types.length !== 3 || !types.every(type => typeof type === 'string')
        ) {
            throw new Error('Expected an array of three string types.');
        }

        if (typeof callAPI !== 'function') {
            throw new Error('Expected fetch to be a function.');
        }

        if (!shouldCallAPI(getState())) {
            return;
        }

        const [requestType, successType, failureType] = types;

        dispatch(Object.assign({}, payload, {
            type: requestType
        }));

        let token = getState().authStore.token;


        return callAPI(token || '').then(response=> {
            if (response.status >= 400) {
                dispatch(Object.assign({}, payload, {
                    type: failureType
                }));
            }

            return response.json();
        }).then(json => {
            let rt = (json || {}).code;

            if(rt === -14 || rt === -17){
                let isResetting = getState().authStore.isResetting;

                if(!isResetting){
                    let obj = Object.assign({}, payload);
                    if(!obj.isHideAuthTip){
                        message.warning('登录超时，请重新登录');
                    }
                }
            }

            return dispatch(Object.assign({}, payload, {
                response: json,
                type: successType
            }));
        });
    };
}


const enHanceCreateStore = compose(
    applyMiddleware(callAsyncActionsMiddleware, thunkMiddleware),
    reduxReset()  // Will use 'RESET' as default action.type to trigger reset
)(createStore);

const store = enHanceCreateStore(reducers);

/*let store = createStore(
    reducers,
    applyMiddleware(callAsyncActionsMiddleware, thunkMiddleware)
);*/

module.exports  = store;