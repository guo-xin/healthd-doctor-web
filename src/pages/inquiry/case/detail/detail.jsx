import React from 'react';
import Operation from './operation';
import Patient from './patient';
import Emr from './emr';
import Toolbar from '../tools/toolbar';
import {message, Modal} from 'antd';
import styles from './detail.less';
import Calc from 'components/dialogs/calc';

import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {
    toggleTool,
    postCase,
    putCase,
    getCaseById,
    setCurrentCase,
    changeDiagnosisTableData,
    updateInquiryInfoByInquiryId,
    uploadCaseOpinions,
    uploadCaseToOss
} from 'redux/actions/case';
import {getPatientById} from 'redux/actions/patient';
import {getDoctorInquiryCountByUserId} from 'redux/actions/doctor';
import {
    unReadInquiry,
    queryService,
    reduceService,
    showCalcDialog,
    getCallRecords,
    setUserForVideoArea
} from 'redux/actions/call';

const confirm = Modal.confirm;

function isHaveValue(obj) {
    let flag = false;
    if (obj) {
        for (let key in obj) {
            if (obj[key]) {
                flag = true;
                break;
            }
        }
    }

    return flag;
}

function pad(num, n) {
    return Array(n - ('' + num).length + 1).join(0) + num;
}

class Detail extends React.Component {
    diagnosis = {
        data: [],
        isHasDiagnosis: false
    };

    opinionsUrl = '';


    constructor(props) {
        super(props);
        this.locationHash = window.location.hash;
        this.initState();
    }

    initState() {
        this.state = {
            caseId: null,
            patientId: null,
            caseData: {},
            caseState: -1,
            isEditable: false,
            operationsState: {}
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.callState === 1 && nextProps.callState !== this.props.callState) {
            this.setOperationsState(nextProps);
        }

        if (this.props.callState === 1 && nextProps.callState === -1) {
            this.setOperationsState(nextProps);
            this.hangUp(nextProps);
        }

        if (nextProps.autoSaveCount != this.props.autoSaveCount) {
            if (window.location.hash.indexOf('inquire/case/detail') !== -1) {
                if (!this.isSaving) {
                    this.autoSave(this.refs.emr.getFieldsValue());
                }
            }
        }

        //病历或者病人变更后重置数据
        if (this.locationHash.indexOf('inquire/case/detail') !== -1) {
            if (this.locationHash !== window.location.hash) {
                this.locationHash = window.location.hash;

                let preCase = this.props.currentCase || {};
                let curCase = nextProps.currentCase || {};

                if (!(curCase.caseId && curCase.caseId === preCase.caseId)) {
                    this.initState();
                    this.refs.emr.resetFields();
                    this.resetData(nextProps);
                }
            }
        }
    }

    componentWillMount() {
        this.props.router.setRouteLeaveHook(
            this.props.route,
            (route)=> {
                this.routerWillLeave(route)
            }
        )
    }

    componentDidMount() {
        this.resetData();
    }

    resetData(props) {
        let {dispatch, currentCase={}} = props || this.props;

        if (currentCase.patientId && currentCase.patientId !== null) {
            this.state.patientId = currentCase.patientId;
            dispatch(getPatientById(currentCase.patientId)).then(
                (action)=> {
                    let data = (action.response || {}).data || {};

                    dispatch(setUserForVideoArea({
                        userId: data.userId,
                        userName: data.userName,
                        headPic: data.userHead
                    }));
                },
                ()=> {
                    dispatch(setUserForVideoArea({}));
                }
            );
        }

        if (currentCase.caseId && currentCase.caseId !== null) {
            this.state.caseId = currentCase.caseId;
            dispatch(getCaseById(currentCase.caseId)).then(
                (action)=> {
                    let data = (action.response || {}).data;

                    if (data) {
                        this.state.caseData = data;
                        this.state.caseState = data.status || -1;
                        this.state.isEditable = this.state.caseState !== 2 ? true : false;

                        this.initDiagnosisList(data.diagnosisList);
                    }

                    this.setOperationsState();
                }
            );
        } else {
            this.state.isEditable = currentCase.state == -1 ? true : false;
            this.setOperationsState();
        }

        if (currentCase.inquiryId) {
            dispatch(getCallRecords(currentCase.inquiryId));
        }

        if (!currentCase.caseId) {
            this.refs.emr.setFieldsValue({
                pc: currentCase.description || ''
            });
        }
    }

    initDiagnosisList(data = []) {
        let count = -1, children, expandedRowKeys = [];
        let list = data.slice();
        let time = new Date().valueOf();

        for (let i = 0; i < list.length; i++) {
            list[i] = Object.assign({}, list[i]);

            count++;

            list[i].key = time + count + '';
            expandedRowKeys.push(list[i].key);

            children = list[i].children;

            if (children) {
                for (let j = 0; j < children.length; j++) {
                    count++;
                    children[j].parentKey = list[i].key;
                    children[j].key = time + count + '';
                }
            }
        }

        if (list.length > 0) {
            this.props.dispatch(changeDiagnosisTableData({
                count: count,
                expandedRowKeys: expandedRowKeys,
                data: list
            }));
        }
    }

    //格式化诊断数据
    formatDiagnosis(props) {
        let diagnosis = props.diagnosis.data.slice();

        let children, isHasDiagnosis = false, list = [], item, subItem, subList = [], count = 0;

        for (let i = 0; i < diagnosis.length; i++) {
            item = Object.assign({}, diagnosis[i]);
            item.sequenceNumber = ++count;

            delete item.key;
            delete item.parentKey;
            delete item.indexForSort;

            if (item.diagnosisName) {
                isHasDiagnosis = true;
            }

            children = item.children;

            subList = [];
            if (children) {
                for (let j = 0; j < children.length; j++) {
                    subItem = Object.assign({}, children[j]);
                    subItem.sequenceNumber = ++count;

                    delete subItem.key;
                    delete subItem.parentKey;
                    delete subItem.indexForSort;

                    subList.push(subItem);
                }
            }

            if (subList.length === 0) {
                delete item.children;
            } else {
                item.children = subList;
            }

            list.push(item);
        }

        return {
            data: list,
            isHasDiagnosis: isHasDiagnosis
        };
    }

    //格式病历表单数据
    formatFieldValues(props, values) {
        let {caseData = {}} = this.state;
        let params = caseData;

        let fieldValues = values || {};

        //主诉
        params.illnessState = (fieldValues.pc === null || fieldValues.pc === undefined) ? "" : fieldValues.pc;

        //诊疗意见
        params.opinions = (fieldValues.opinions === null || fieldValues.opinions === undefined) ? "" : fieldValues.opinions;
        params.opinions = this.opinionsUrl;

        //现病史
        if (params.historyPresentList) {
            params.historyPresentList[0] = Object.assign({}, params.historyPresentList[0], {remark: fieldValues.hpc});
        } else {
            if (fieldValues.hpc) {
                params.historyPresentList = [{remark: fieldValues.hpc}];
            }
        }

        //既往史
        let historyPastList = {};

        if (fieldValues.pmh) {
            historyPastList.description = fieldValues.pmh;
        }

        if (fieldValues.hasDrugAllergyHistory && fieldValues.allergies) {
            historyPastList.status = 1;
            historyPastList.allergies = fieldValues.allergies;
        } else {
            historyPastList.status = 0;
            historyPastList.allergies = '';
        }

        if (params.historyPastList) {
            params.historyPastList = [Object.assign({}, params.historyPastList[0], historyPastList)];
        } else {
            if (fieldValues.pmh || historyPastList.status === 1) {
                params.historyPastList = [historyPastList];
            }
        }

        //体格检查
        let physicalExaminationList = {
            temperature: fieldValues.temperature,
            pulse: fieldValues.pulse,
            breath: fieldValues.breath,
            lowPressure: fieldValues.lowPressure,
            highPressure: fieldValues.highPressure,
            userProfile: fieldValues.physicalExamination
        };

        if (params.physicalExaminationList) {
            params.physicalExaminationList = [Object.assign({}, params.physicalExaminationList[0], physicalExaminationList)];
        } else {
            if (isHaveValue(physicalExaminationList)) {
                params.physicalExaminationList = [physicalExaminationList];
            }
        }


        //辅助检查
        if (params.auxiliaryExaminationsList) {
            params.auxiliaryExaminationsList[0] = Object.assign({},
                params.auxiliaryExaminationsList[0],
                {resultDesc: fieldValues.auxiliaryExamination});
        } else {
            if (fieldValues.auxiliaryExamination) {
                params.auxiliaryExaminationsList = [{resultDesc: fieldValues.auxiliaryExamination}];
            }
        }

        params.diagnosisList = this.diagnosis.data;

        delete params.opinionsText;

        return params;
    }

    //获取提交的病历数据
    getCaseData(props, values, status) {
        let params = this.formatFieldValues(props, values);
        let {patients, inquiryId, currentCase} = props;
        let {patientId, caseId} = this.state;
        let patient = patients[patientId] || {};

        //1-保存（未归档），2-归档，3-作废
        params.status = status;
        params.userId = patient.userId;
        params.patientId = patientId;

        if (caseId !== null && caseId != undefined) {
            params.id = caseId;
            params.inquiryId = currentCase.inquiryId;
        } else {
            params.inquiryId = inquiryId;
            this.state.caseData.inquiryId = inquiryId;
        }

        delete params.isServiceCount;

        return params;
    }

    //设置操作权限
    setOperationsState(nextProps) {
        let {isEditable, caseState} = this.state;
        let callState;

        if (nextProps) {
            callState = nextProps.callState;
        } else {
            callState = this.props.callState;
        }

        let operationsState = {
            back: false,
            save: false,
            archive: false
        };

        //接听和通话中
        if (callState === -1) {
            operationsState.back = true;
        }

        //可编辑
        if (isEditable) {

            //为归档
            if (caseState !== 2) {
                operationsState.save = true;

                if (callState == -1) {
                    operationsState.archive = true;
                }

            }
        }

        this.setState({
            operationsState: operationsState
        });
    }

    //挂断
    hangUp(props) {
        let {currentCase={}} = props;

        if (currentCase.inquiryId) {
            setTimeout(()=> {
                if (window.location.hash.indexOf('inquire/case/detail') !== -1) {
                    props.dispatch(getCallRecords(currentCase.inquiryId));
                }
            }, 2000);
        }
    }

    //扣次
    reduceService(isServiceCount) {
        let {dispatch} = this.props;
        let {caseData} = this.state;

        dispatch(reduceService({
            historyCaseId: caseData.id,
            isServiceCount: isServiceCount
        }));
    }

    //计次
    calc() {
        this._archive(1);
    }

    //免单
    free() {
        this._archive(0);
    }

    //设置是否可编辑
    edit(flag) {
        this.state.isEditable = flag;
        this.setOperationsState();
    }

    //返回问诊
    back() {
        this.props.router.goBack();
    }

    //保存
    _save(props, formData) {
        this.diagnosis = this.formatDiagnosis(props);
        let values = formData || this.refs.emr.getFieldsValue();
        let params = this.getCaseData(props, values, 1);
        let caseState = this.state.caseState;

        //新建调用postCase， 更新调用putCase
        return this.props.dispatch((this.state.caseState === -1 ? postCase : putCase)(params)).then(
            (action)=> {
                let result = (action.response || {}).result;
                let data = (action.response || {}).data;

                if (result === 0) {
                    if (data) {
                        this.state.caseData = data;
                    }

                    if (caseState === -1 && data) {
                        let {currentCase={}}=props;
                        this.state.caseState = 1;
                        this.state.caseId = data.id;
                        this.state.patientId = data.patientId;

                        this.reduceService(0);

                        props.dispatch(setCurrentCase({
                            inquiryInfoId: currentCase.inquiryInfoId,
                            userId: data.userId,
                            caseId: data.id,
                            patientId: data.patientId,
                            inquiryId: props.inquiryId,
                            state: 1
                        }));
                    }

                    if (data) {
                        data.diagnosisList && this.initDiagnosisList(data.diagnosisList);
                    }

                    //创建病历时更新诊前资料信息
                    if (caseState === -1) {
                        let {currentCase={}}=props;
                        if (props.inquiryId && currentCase.inquiryInfoId) {
                            props.dispatch(updateInquiryInfoByInquiryId({
                                inquiryId: props.inquiryId,
                                inquiryInfoId: currentCase.inquiryInfoId
                            }));
                        }
                    }

                    props.dispatch(getDoctorInquiryCountByUserId(props.doctorId));
                }

                return action;
            }
        );
    };

    isSaving = false;

    save() {
        if (this.isSaving) {
            return;
        }

        this.isSaving = true;

        let hide = message.loading('正在保存...', 0);
        let values = this.refs.emr.getFieldsValue();
        let obj = this.isFormChanged(values);

        if (values.opinionsText && obj.isOpinionChanged) {
            let {patientId} = this.state;
            let {doctorId, dispatch} = this.props;
            let num = pad(Math.floor(Math.random() * 10000), 4);
            let folder = 'opinions_' + (new Date()).valueOf() + '_' + num + '_' + doctorId + '_' + patientId;

            //先上传诊疗意见获取url后再保存病历
            dispatch(uploadCaseOpinions({
                input: values.opinionsText,
                folder: folder
            })).then(
                (action)=> {
                    let result = (action.response || {}).result;
                    let url = (action.response || {}).data || '';

                    if (result === 0 && url) {
                        this.opinionsUrl = url;
                        _submit.apply(this);

                    } else {
                        this.isSaving = false;
                        hide();
                        message.error('保存失败');
                    }
                },
                ()=> {
                    this.isSaving = false;
                    hide();
                    message.error('保存失败');
                }
            );
        } else {
            if (values.opinionsText) {
                this.opinionsUrl = this.state.caseData.opinions;
            } else {
                this.opinionsUrl = '';
            }

            _submit.apply(this);
        }


        function _submit() {
            this._save(this.props).then(
                (action)=> {
                    this.isSaving = false;
                    hide();
                    let result = (action.response || {}).result;
                    if (result === 0) {
                        message.success('保存成功');
                    } else {
                        message.error('保存失败');
                    }
                },
                ()=> {
                    this.isSaving = false;
                    hide();
                    message.error('保存失败');
                }
            );
        }
    }

    //表单变更前数据
    proFormData = {};

    isDiagnosisChanged() {
        let {caseData = {}} = this.state;
        let {diagnosis = {}} = this.props;
        let flag = false;

        let oldList = caseData.diagnosisList || [];
        let newList = diagnosis.data || [];

        if (!caseData.id) {
            if (newList.length == 1) {
                if (!newList[0].diagnosisName && !newList[0].diagnosisDesc) {
                    let children = newList[0].children || [];

                    if (children.length < 1) {
                        return false;
                    }
                }
            }
        }


        if (newList.length !== oldList.length) {
            flag = true;
        } else {
            outerLoop:
                for (let i = 0; i < newList.length; i++) {
                    let oldItem = oldList[i];
                    let newItem = newList[i];

                    if (oldItem.diagnosisName != newItem.diagnosisName || oldItem.diagnosisDesc != newItem.diagnosisDesc || oldItem.status != newItem.status) {
                        flag = true;
                        break;
                    } else {
                        let oldChildren = oldItem.children || [];
                        let newChildren = newItem.children || [];

                        if (oldChildren.length != newChildren.length) {
                            flag = true;
                            break;
                        } else {
                            innerLoop:
                                for (let j = 0; j < newChildren.length; j++) {
                                    let oldChild = oldChildren[j];
                                    let newChild = newChildren[j];
                                    if (oldChild.diagnosisName != newChild.diagnosisName || oldChild.diagnosisDesc != newChild.diagnosisDesc || oldChild.status != newChild.status) {
                                        flag = true;
                                        break outerLoop;
                                    }
                                }
                        }
                    }
                }
        }
        return flag;
    }

    //验证表单数据是否更改
    isFormChanged(values) {
        let formData = this.proFormData;
        let flag = false;
        let isEmpty = true;
        let isDiagnosisChanged = this.isDiagnosisChanged();

        for (let key in values) {
            if (values[key]) {
                if (key == 'hasDrugAllergyHistory') {
                    if (values.allergies) {
                        isEmpty = false;
                    }
                } else if (key == 'allergies') {
                    if (values.hasDrugAllergyHistory) {
                        isEmpty = false;
                    }
                }
                else {
                    isEmpty = false;
                }
            }

            if (values[key] != formData[key]) {
                flag = true;
            }
        }

        return {
            isDiagnosisChanged: isDiagnosisChanged,
            isEmpty: isEmpty,
            isOpinionChanged: values['opinionsText'] != formData['opinionsText'],
            isFormChanged: flag || isDiagnosisChanged
        };
    }

    //设置表单数据
    setFormData(formData = {}) {
        this.proFormData = formData;
    }

    //离开病历页前调用
    routerWillLeave(route) {
        let pathname = (route || {}).pathname + '';

        //除了退出，跳转到其他路由时自动保存
        if (pathname.indexOf('/login') === -1) {
            this.autoSave(this.refs.emr.getFieldsValue());
        }
    }

    autoSave(formData) {
        if (this.isSaving || this.isArchive || this.state.caseState == 2) {
            return;
        } else {
            let obj = this.isFormChanged(formData);

            if (obj.isFormChanged) {
                let {caseData} = this.state;
                this.opinionsUrl = caseData.opinions;

                //新建病历并且为空
                if (!caseData.id && obj.isEmpty && !obj.isDiagnosisChanged) {
                    return;
                }

                if (obj.isOpinionChanged) {
                    let {patientId} = this.state;
                    let {doctorId, dispatch} = this.props;
                    let values = formData || {};
                    let num = pad(Math.floor(Math.random() * 10000), 4);

                    let folder = 'opinions_' + (new Date()).valueOf() + '_' + num + '_' + doctorId + '_' + patientId;

                    //先上传诊疗意见获取url后再保存病历
                    dispatch(uploadCaseOpinions({
                        input: values.opinionsText,
                        folder: folder
                    })).then(
                        (action)=> {
                            let result = (action.response || {}).result;
                            let url = (action.response || {}).data || '';

                            if (result === 0 && url) {
                                this.opinionsUrl = url;
                                this._save(this.props, formData);

                            } else {
                                this._save(this.props, formData);
                            }
                        },
                        ()=> {
                            this._save(this.props, formData);
                        }
                    );

                } else {
                    this._save(this.props, formData);
                }
            }
        }
    }

    //归档
    _archive(num) {
        if (this.isSaving) {
            return;
        }

        let caseState = this.state.caseState;
        this.isSaving = true;
        this.state.caseState = 2;

        let hide = message.loading('正在归档...', 0);

        let props = this.props;
        let values = this.refs.emr.getFieldsValue();
        let obj = this.isFormChanged(values);

        if (values.opinionsText && obj.isOpinionChanged) {
            let {patientId} = this.state;
            let {doctorId} = props;
            let rNum = pad(Math.floor(Math.random() * 10000), 4);
            let folder = 'opinions_' + (new Date()).valueOf() + '_' + rNum + '_' + doctorId + '_' + patientId;

            //先上传诊疗意见获取url后再保存病历
            props.dispatch(uploadCaseOpinions({
                input: values.opinionsText,
                folder: folder
            })).then(
                (action)=> {
                    let result = (action.response || {}).result;
                    let url = (action.response || {}).data || '';

                    if (result === 0 && url) {
                        this.opinionsUrl = url;
                        _submit.apply(this);
                    } else {
                        this.isSaving = false;
                        this.state.caseState = caseState;
                        hide();
                        message.error('归档失败');
                    }
                },
                ()=> {
                    this.isSaving = false;
                    this.state.caseState = caseState;
                    hide();
                    message.error('归档失败');
                }
            );
        } else {
            if (values.opinionsText) {
                this.opinionsUrl = this.state.caseData.opinions;
            } else {
                this.opinionsUrl = '';
            }
            _submit.apply(this);
        }

        function _submit() {
            let params = this.getCaseData(props, values, 2);

            //新建调用postCase， 更新调用putCase
            props.dispatch((caseState === -1 ? postCase : putCase)(params)).then(
                (action)=> {
                    this.isSaving = false;
                    hide();

                    let result = (action.response || {}).result;
                    let data = (action.response || {}).data;

                    if (result === 0 && data) {
                        message.success('归档成功');

                        this.state.isEditable = false;
                        this.state.caseState = 2;

                        if (data) {
                            this.state.caseData = data;
                        }

                        if (caseState === -1) {
                            let {currentCase={}}=props;

                            this.state.caseData.inquiryId = this.props.inquiryId;
                            this.state.caseId = data.id;
                            this.state.patientId = data.patientId;

                            props.dispatch(setCurrentCase({
                                inquiryInfoId: currentCase.inquiryInfoId,
                                userId: data.userId,
                                caseId: data.id,
                                patientId: data.patientId,
                                inquiryId: props.inquiryId,
                                state: 2
                            }));

                            //创建病历时更新诊前资料信息

                            if (props.inquiryId && currentCase.inquiryInfoId) {
                                props.dispatch(updateInquiryInfoByInquiryId({
                                    inquiryId: props.inquiryId,
                                    inquiryInfoId: currentCase.inquiryInfoId
                                }));
                            }
                        }

                        //未读问诊推送
                        props.dispatch(unReadInquiry({
                            caseId: data.id
                        }));

                        props.dispatch(getDoctorInquiryCountByUserId(props.doctorId));

                        this.reduceService(num);

                        this.setOperationsState();

                        if (data) {
                            data.diagnosisList && this.initDiagnosisList(data.diagnosisList);

                            //保存病历后回调保存上传OSS
                            if (data.opinions) {
                                props.dispatch(uploadCaseToOss({
                                    type: 1,
                                    url: data.opinions
                                }));
                            }
                        }

                    } else {
                        this.state.caseState = caseState;
                        message.error('归档失败');
                    }

                },
                ()=> {
                    this.isSaving = false;
                    this.state.caseState = caseState;
                    hide();
                    message.error('归档失败');
                }
            );
        }
    }

    isArchive = false;

    archive() {
        if (this.isArchive) {
            return;
        }

        this.isArchive = true;

        let props = this.props;
        let form = this.refs.emr;
        this.diagnosis = this.formatDiagnosis(props);

        
        form.setFieldsValue({
            diagnosisInfo: this.diagnosis.isHasDiagnosis ? 'value' : ''
        });

        form.validateFieldsAndScroll((errors, values) => {
            if (!!errors) {
                this.isArchive = false;
                return;
            } else {
                props.dispatch(showCalcDialog(true));
                this.isArchive = false;
            }
        });
    }

    render() {

        const {dispatch, showTool, patients} = this.props;
        const {patientId, caseData = {}, caseState=-1, isEditable, operationsState={}} = this.state;
        let patient = patients[patientId] || {};

        let wrapperClass = showTool ? styles.showTool : styles.wrapper;

        return (
            <div className={wrapperClass}>
                <Calc free={::this.free} calc={::this.calc}/>
                <div className={styles.operations}>
                    <Operation back={::this.back} save={::this.save} archive={::this.archive} caseState={caseState}
                               operationsState={operationsState}/>
                </div>

                <div className={styles.edit}>
                    <Patient patient={patient} caseState={caseState}/>
                    <Emr ref="emr" edit={::this.edit} caseData={caseData} isEditable={isEditable} save={::this.autoSave}
                         setFormData={::this.setFormData}/>
                </div>

                <div className={styles.tools}>
                    <div className={styles.toolbar}>
                        <Toolbar showTool={showTool} onToggleTool={()=>dispatch(toggleTool())}/>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (globalStore) => {
    const {caseStore, patientStore, authStore, callStore}  = globalStore;

    return {
        doctorId: authStore.id,
        inquiryId: callStore.inquiryId,
        showTool: caseStore.showTool,
        patients: Object.assign({}, patientStore.patients),
        diagnosis: caseStore.diagnosis,
        callState: callStore.callState,
        currentCase: caseStore.currentCase,
        autoSaveCount: caseStore.autoSaveCount
    };
};


Detail = connect(mapStateToProps)(Detail);

export default withRouter(Detail);