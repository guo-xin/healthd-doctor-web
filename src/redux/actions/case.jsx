import * as actions from './actions';
import fetch from 'isomorphic-fetch';

//显示工具栏
export const toggleTool = actions.create(actions.TOGGLE_CASES_TOOLS);

//显示视频区域
export const toggleVideo = actions.create(actions.TOGGLE_VIDEO, 'isShowVideo');

//自动保存病历
export const autoSaveCase = actions.create(actions.AUTO_SAVE_CASE);

//设置当前操作病历
export const setCurrentCase = actions.create(actions.SET_CURRENT_CASE, 'data');

//修改诊断表格数据
export const changeDiagnosisTableData = actions.create(actions.CHANGE_DIAGNOSIS_TABLE_DATA, 'data');

//创建病历
export const postCase = (params) => {
    let action = actions.POST_CASE;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/case/save`, {
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

//更新病历
export const putCase = (params) => {
    let action = actions.PUT_CASE;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/case/update`, {
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

//根据患者ID查询患者历史病历
export const getCasesByPatientId = (patientId) => {
    let action = actions.GET_CASES_BY_PATIENT_ID;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry/case/list/history?patientId=${patientId}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        }),
        // 在 actions 的开始和结束注入的参数
        payload: { patientId }
    };
};

//根据病历ID查询病历
export const getCaseById = (caseId) => {
    let action = actions.GET_CASE_BY_ID;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/case/query/${caseId}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        }),
        // 在 actions 的开始和结束注入的参数
        payload: { caseId }
    };
};

//根据医生ID查询待归档病历
export const getTodoCasesByDoctorId = (doctorId) => {
    let action = actions.GET_TODO_CASES_BY_DOCTOR_ID;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry/case/page?type=1&doctorId=${doctorId}&offset=0&limit=500`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        }),
        // 在 actions 的开始和结束注入的参数
        payload: { doctorId }
    };
};

//根据医生ID查询已归档病历
export const getDoneCasesByDoctorId = (doctorId, currentPage, pageSize) => {
    let action = actions.GET_DONE_CASES_BY_DOCTOR_ID;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry/case/page?type=2&doctorId=${doctorId}&offset=${currentPage}&limit=${pageSize}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        }),

        // 在 actions 的开始和结束注入的参数
        payload: { doctorId, currentPage, pageSize}
    };
};

//根据诊断ID删除诊断
export const deleteDiagnosisById = (diagnosisId) => {
    let action = actions.DELETE_DIAGNOSIS_BY_ID;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/diagnosis/delete/${diagnosisId}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        }),
        // 在 actions 的开始和结束注入的参数
        payload: { diagnosisId }
    };
};

//文字保存为html文件，上传诊疗意见
export const uploadCaseOpinions = (params)=>{
    let action = actions.UPLOAD_CASE_OPINIONS;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_FILE_URI}/parser/fileToHtml/upload`, {
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


//解析html
export const getCaseOpinions= (url) => {
    let action = actions.GET_CASE_OPINIONS;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_FILE_URI}/parser/html/url?url=${url}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        }),

        // 在 actions 的开始和结束注入的参数
        payload: { url}
    };
};

//保存病历后回调保存上传OSS
export const uploadCaseToOss = (params)=>{
    let action = actions.UPLOAD_CASE_TO_OSS;
    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_FILE_URI}/oss/callback`, {
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


//追加病历调用
export const appendCase = (params) => {
    let action = actions.APPEND_CASE;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/case/append/${params.inquiryId}/${params.inquiryCallType}/${params.callType}`,{
            method: 'GET',
            headers: {
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            }
        }),
        // 在 actions 的开始和结束注入的参数
        payload: params
    };
};

//根据问诊资料ID 更新问诊ID
export const updateInquiryInfoByInquiryId = (params) => {
    let action = actions.UPDATE_INQUIRYINFO_BY_INQUIRYID;

    return {
        // 要在之前和之后发送的 action types
        types: [action + '_REQUEST', action + '_SUCCESS', action + '_FAILURE'],
        // 检查缓存 (可选):
        //shouldCallAPI: (state) => !state.users[userId],
        // 进行取：
        callAPI: (token) => fetch(`${actions.WEB_API_URI}/inquiry-info/${params.inquiryInfoId}`,{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                [actions.HEADER_AUTH_FIELD]: actions.HEADER_AUTH_PREFIX + token
            },
            body: JSON.stringify({
                inquiryId: params.inquiryId
            })
        }),
        // 在 actions 的开始和结束注入的参数
        payload: params
    };
};

