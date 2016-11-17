import * as actions from '../actions/actions'

const doctor = (state = {
    information: {}, //医生出诊状态
    data: {
        workingStatus: 9
    }, //医生个人信息，
    scheduleList: [], //医生排班
    queue: {
        queueCount: 0
    },  //排队人数
    inquiry: {
        inquiryCount: 0
    }, //问诊人数
    message: []//图片消息通知
}, action) => {
    let obj, result = (action.response || {}).result;
    switch (action.type) {
        
        case actions.DOCTOR_START_INQUERY + "_SUCCESS":
            if(result===0){
                state.data = Object.assign({}, state.data, {workingStatus:0});
            }

            return Object.assign({}, state);

        case actions.DOCTOR_END_INQUERY + "_SUCCESS":
            if(result===0){
                state.data = Object.assign({}, state.data, {workingStatus:9});
            }

            return Object.assign({}, state);

        case actions.DOCTOR_ATTENDANCE + "_SUCCESS":
            obj = Object.assign({}, state, {
                information: action.response.data
            });
            return obj;

        case actions.DOCTOR_BY_USER_ID_DATE + "_SUCCESS":
            obj = Object.assign({}, state, {
                scheduleList: action.response.data
            });
            return obj;

        case actions.DOCTOR_BY_USER_ID + "_SUCCESS":
            obj = Object.assign({}, state, {
                data: action.response.data
            });
            //workingStatus:'',//医生状态：0-空闲，1-占线，2-忙碌，3-锁定用户，4-医助在线，9-离线
            return obj;

        case actions.SET_DOCTOR_QUEUE_COUNT:
            let data = action.queue || {};

            if (data.type && data.type === -1) {
                let num = 0;
                if (state.queue.queueCount) {
                    num = state.queue.queueCount - 1;

                    state.queue = {
                        queueCount: num < 0 ? 0 : num
                    };
                }

            } else {
                if (data.data) {
                    state.queue = {
                        queueCount: data.data.queueCount
                    };
                }
            }

            return Object.assign({}, state);

        case actions.GET_DOCTOR_PICTURE_MESSAGE + "_SUCCESS":
            obj = Object.assign({}, state, {
                message: action.response.data || []
            });
            return obj;

        case actions.DOCTOR_BY_USER_ID_QUEUE + "_SUCCESS":
            obj = Object.assign({}, state, {
                queue: action.response.data
            });
            return obj;

        case actions.DOCTOR_BY_USER_ID_INQUIRY + "_SUCCESS":
            obj = Object.assign({}, state, {
                inquiry: action.response.data
            });
            return obj;


        case actions.POST_DOCTOR_CHECK_CODE + "_SUCCESS":
            if (result === 0) {
                state.data.phone = action.phone;
            }

            return Object.assign({}, state);

        case actions.CHANGE_DOCTOR_STATE + "_SUCCESS":
            if (result === 0) {
                state.data.workingStatus = +action.workingStatus;
            }

            return Object.assign({}, state);

        case actions.NOTICE_CHANGE_DOCTOR_STATE + "_REQUEST":
            if (action) {
                state.data.workingStatus = +action.workingStatus;

                return Object.assign({}, state);
            }

            return state;

        default:
            return state
    }
};

export default doctor;