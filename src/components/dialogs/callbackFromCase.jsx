import styles from './callback.less';
import React, {Component} from 'react';
import {Modal, Button, message} from 'antd';
import {withRouter} from 'react-router';

import {connect} from 'react-redux';
import {getUserById} from 'redux/actions/user';
import {getInquireCallbackNumber} from 'redux/actions/inquire';
import {showCallbackFromCaseDialog, setCallbackUserId, addCallbackRecord} from 'redux/actions/call';

import Image from '../image/image.jsx';
import * as global from 'util/global';

class CallbackFromCase extends Component {
    state = {
        isVisible: false,
        disabled: false,
        userId: null,
        user: {},
        tip: '您是否需要回呼患者'
    };

    constructor(props) {
        super(props);
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.isVisible) {
            //呼叫中
            if (nextProps.callState === 0) {
                this.setState({
                    disabled: true,
                    tip: '呼叫中。。。'
                });
            }
            else if (nextProps.callState === 1) {
                this.state.disabled = false;
                this.state.tip = '';
                this.setVisible(false);
            }
            else {
                //由呼叫中直接到挂断为呼叫失败
                if (this.props.callState === 0) {
                    let tip = '信号不稳，请刷新后重试。';
                    let callMessage = nextProps.callMessage;
                    let callType = nextProps.callType;

                    if (callType == 1) {
                        if (callMessage.reason === 175001) {
                            tip = '未响应，请稍后再试。';
                        }
                        else if (callMessage.reason && callMessage.reason.reason) {
                            let reason = callMessage.reason.reason;

                            switch (+reason) {
                                case 175404:
                                    tip = '对方不在线，请选择电话呼叫。';
                                    break;

                                case 175486:
                                    tip = '对方忙碌，请稍后再试。';
                                    break;

                                case 175408:
                                    tip = '对方忙碌，请稍后再试。';
                                    break;

                                case 175001:
                                    tip = '未响应，请检查网络，稍后再试。';
                                    break;

                                default:

                            }

                        }
                    }


                    this.setState({
                        disabled: false,
                        tip: tip
                    });
                } else {
                    if (!this.props.isVisible) {
                        this.state.tip = "你是否需要回呼患者";
                    }
                }
            }
        }


        if (nextProps.isVisible && nextProps.isVisible !== this.props.isVisible) {
            let {patientId, inquiryId} = nextProps.currentCase;

            if (patientId) {
                let patients = nextProps.patients;
                let patient = patients[patientId];

                this.getUser(nextProps, patient.userId);

                nextProps.dispatch(getInquireCallbackNumber({
                    patientId: patientId,
                    inquiryId: inquiryId
                })).then(
                    (action)=> {
                        let data = (action.response || {}).data || {};

                        this.setState({
                            inquiryNumber: data.inquiryNumber,
                            diagnosisName: data.diagnosisName
                        });
                    }
                );
            }
        }


        let currentCase = nextProps.currentCase;

    }

    getUser(props, id) {
        this.state.userId = id;

        this.setState({
            userId: id,
            user: {},
            disabled: true
        });

        props.dispatch(getUserById(id)).then(
            (action)=> {
                let user = (action.response || {}).data || {};
                props.dispatch(setCallbackUserId(user.userId, user));

                this.setState({
                    user: user,
                    disabled: false
                });
            },
            ()=> {
                this.setState({
                    disabled: false
                });
            }
        );
    }

    //接听
    onOk() {
        let {userId} = this.state;
        let {users = {}, callType, currentCase={}} = this.props;
        let user = users[userId];

        this.setState({
            tip: '呼叫中。。。',
            disabled: true
        });

        if (user && user.mobilePhone) {
            let {callback, dispatch, doctor={}} = this.props;

            if (typeof callback === 'function') {
                let params = {
                    inquiryCallType: 0,
                    phone: user.mobilePhone,
                    callType: callType + 1,
                    inquiryId: currentCase.inquiryId,
                    operatorRoleCode: doctor.workingStatus === 4 ? 105 : 104
                };

                if(currentCase.patientId){
                    params.patientId = currentCase.patientId;
                }

                if(currentCase.inquiryInfoId){
                    params.inquiryInfoId = currentCase.inquiryInfoId;
                }

                //回呼前创建会话ID
                dispatch(addCallbackRecord(params)).then(
                    (action)=> {
                        let result = (action.response || {}).result;

                        if (result === 0) {
                            callback({
                                phone: user.mobilePhone,
                                callType: callType,
                                userId: userId
                            });
                        } else {
                            console.log('呼叫失败-------------创建会话（inquireId）失败');
                            this.setState({
                                tip: '信号不稳，请刷新后重试。',
                                disabled: false
                            });
                        }
                    },
                    ()=> {
                        console.log('呼叫失败-------------创建会话（inquireId）失败');
                        this.setState({
                            tip: '信号不稳，请刷新后重试。',
                            disabled: false
                        });
                    }
                );
            }
        } else {
            console.log('呼叫失败-------------用户信息获取错误');
            this.setState({
                tip: '信号不稳，请刷新后重试。',
                disabled: false
            });
        }
    }

    //取消
    onCancel() {
        this.setVisible(false);
    }

    setVisible(isVisible) {
        this.props.dispatch(showCallbackFromCaseDialog(isVisible));
    }

    getDiagnosisName() {
        let diagnosis = this.props.diagnosis || {};
        let data = diagnosis.data || [];

        if (data.length > 0) {
            return data[0].diagnosisName;
        }

        return null;
    }

    render() {
        let {currentCase={}, patients={}, isVisible} = this.props;

        let {disabled, tip, inquiryNumber, user={}} = this.state;

        let diagnosisName = this.getDiagnosisName();
        let patient = patients[currentCase.patientId] || {};


        return (
            <Modal
                wrapClassName={styles.dialog + " vertical-center-modal"}
                closable={false}
                maskClosable={false}
                style={{ top: "-20px" }}
                visible={isVisible}
                onCancel={() => this.setVisible(false)}
                footer={
                    <div>
                        <Button size="large" type="ghost" disabled={disabled} onClick={()=>this.onCancel()}>取消</Button>
                        <Button size="large" type="primary" disabled={disabled} onClick={()=>this.onOk()}>确定</Button>
                    </div>
                }>
                <div className={styles.pic}>
                    <span>
                        <Image src={patient.head || global.defaultHead}
                               defaultImg={global.defaultHead}>
                        </Image>
                    </span>
                </div>
                <div className={styles.detail}>
                    <div className="top">
                        <span className="name">患者：{patient.realName || '--'}</span>
                        <span className="age">{global.getAge(patient.birthday) || '--岁'}</span>
                        <span className="serial">ID:{global.formatPatientCode(patient.patientCode) || '--'}</span>
                        <span className="gender">
                             <img src={global.getGenderUrl(patient.sex)} alt=""/>
                        </span>
                    </div>
                    <div className="middle clearfix">
                        <ul>
                            <li>问诊人：{user.userName || user.mobilePhone || patient.userName || patient.userMobilePhone || '--'}</li>
                            <li>与问诊人关系：{global.getRelationText(patient.relation) || '--'}</li>
                            <li style={{width:"100%"}}>本次诊断：{diagnosisName || '--'}</li>
                        </ul>
                    </div>
                </div>
                
                <div className={styles.callTips}>{tip}</div>
            </Modal>
        );
    }
}

const mapStateToProps = (globalStore) => {
    const {callStore, doctorStore, caseStore, patientStore, userStore} = globalStore;

    return {
        doctor: Object.assign({}, doctorStore.data),
        patients: Object.assign({}, patientStore.patients),
        users: Object.assign({}, userStore.users),
        currentCase: caseStore.currentCase,
        diagnosis: caseStore.diagnosis,
        isVisible: callStore.isShowCallbackFromCaseDialog,
        callType: callStore.callType,
        callState: callStore.callState,
        callMessage: callStore.callMessage
    }
};


CallbackFromCase = connect(mapStateToProps)(CallbackFromCase);

export default withRouter(CallbackFromCase);
