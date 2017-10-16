import * as actions from '../actions/actions';
import cookie from 'react-cookie';

const cases = (state = {
    autoSaveCount: 0,
    currentCase: {
        caseId: null,
        patientId: null,
        inquiryId: null,
        inquiryInfoId: null,
        userId: null,
        description: '',
        state: -1 // -1：新建， 1：已存在
    },
    showTool: true,
    isShowVideo: false,
    diagnosis: {
        count: 0,
        expandedRowKeys: ['0'],
        data: [{
            key: '0',
            diagnosisCode: '',
            diagnosisDesc: '',
            diagnosisName: '',
            isFirst: 0,
            sequenceNumber: 0,
            status: 0
        }]
    },
    cases: {},
    todoCases: [],
    doneCases: {
        data: [],
        pagination: {}
    },
    callRecords: []
}, action) => {
    let obj, data, results;

    switch (action.type) {
        //打开工具栏
        case actions.TOGGLE_CASES_TOOLS:

            return Object.assign({}, state, {
                showTool: !state.showTool
            });

        case actions.TOGGLE_VIDEO:
            return Object.assign({}, state, {
                isShowVideo: action.isShowVideo
            });

        //自动保存病历
        case actions.AUTO_SAVE_CASE:
            let autoSaveCount = state.autoSaveCount + 1;

            return Object.assign({}, state, {
                autoSaveCount: autoSaveCount
            });

        //修改诊断表格数据
        case actions.CHANGE_DIAGNOSIS_TABLE_DATA:
            state.diagnosis = Object.assign(state.diagnosis, action.data);

            return Object.assign({}, state);

        //设置当前操作的病历
        case actions.SET_CURRENT_CASE:
            data = action.data;

            if(data){
                let flag = false;

                if(!(data.caseId && data.caseId === state.currentCase.caseId)){
                    flag = true;
                }

                state.currentCase.inquiryInfoId = null;
                state.currentCase.description = null;
                state.currentCase = Object.assign({}, state.currentCase, data);

                if(flag){
                    state.diagnosis =  Object.assign({},{
                        count: 0,
                        expandedRowKeys: ['0'],
                        data: [{
                            key: '0',
                            diagnosisCode: '',
                            diagnosisDesc: '',
                            diagnosisName: '',
                            isFirst: 0,
                            sequenceNumber: 0,
                            status: 0
                        }]
                    });
                }

                if(data.inquiryId!==state.currentCase.inquiryId){
                    state.callRecords = [];
                }
            }

            cookie.save('c', state.currentCase);

            return Object.assign({},state);
        
        //根据病历ID查询病历
        case actions.GET_CASE_BY_ID + "_SUCCESS":
            state.cases[action.caseId] = (action.response || {}).data || {};
            return Object.assign({}, state);

        //待归档病历
        case actions.GET_TODO_CASES_BY_DOCTOR_ID + "_SUCCESS":
            obj = Object.assign({}, state, {
                todoCases: (action.response || {}).data
            });
            return obj;

        //已归档病历
        case actions.GET_DONE_CASES_BY_DOCTOR_ID + "_REQUEST":
            state.doneCases.pagination.current = action.currentPage;

            obj = Object.assign({}, state);
            return obj;

        //已归档病历
        case actions.GET_DONE_CASES_BY_DOCTOR_ID + "_SUCCESS":
            let data = (action.response || {}).data || {};
            results = data.results || [];
            
            state.doneCases.data = results.map((item, index)=>{
                item.key = index;
                return item;
            });

            state.doneCases.pagination.total = data.total;

            obj = Object.assign({}, state);
            return obj;

        //根据诊断ID删除诊断
        case actions.DELETE_DIAGNOSIS_BY_ID + "_SUCCESS":
            return state;

        //获取通话记录
        case actions.GET_CALL_RECORD + '_SUCCESS':
            return Object.assign({}, state, {
                callRecords: (action.response || {}).data || []
            });

        default:
            return state
    }
};

export default cases;