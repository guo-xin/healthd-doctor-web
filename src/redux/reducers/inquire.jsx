import * as actions from '../actions/actions'

const inquire = (state = {
    queue: [],
    queueException: [],
    number: {}
}, action) => {
    let data, result;

    switch (action.type) {
        //点击问诊优先进入有内容模块
        case actions.GET_INQUIRE_NUMBER + '_SUCCESS':
            result = (action.response || {}).result;

            if (result === 0) {
                data = (action.response || {}).data || {};
                state.number = data;
            }

            return Object.assign({}, state);


        //等待问诊
        case actions.GET_INQUIRE_QUEUE + '_SUCCESS':
            result = (action.response || {}).result;

            if (result === 0) {
                data = (action.response || {}).data || [];
                state.queue = data;
            }

            return Object.assign({}, state);

        //异常问诊
        case actions.GET_INQUIRE_QUEUE_EXCEPTION + '_SUCCESS':
            result = (action.response || {}).result;

            if (result === 0) {
                data = (action.response || {}).data || [];
                state.queueException = data;
            }

            return Object.assign({}, state);

        default:
            return state
    }
};

export default inquire