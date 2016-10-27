import styles from './callback.less';
import React, {Component} from 'react';
import {Modal, Button, message} from 'antd';
import {withRouter} from 'react-router';

import {connect} from 'react-redux';
import {getUserById} from 'redux/actions/user';
import {
    agoraCall,
    setCallInfo,
    agoraVoipInviteBye,
    missedCall,
    sendMissedCallMsg
} from 'redux/actions/call';
import {noticeChangeDoctorState} from 'redux/actions/doctor';
import Image from '../image/image.jsx';
import * as global from 'util/global';

import pubSub from 'util/pubsub';

class CallbackFromCase extends Component {
    state = {
        isVisible: false,
        disabled: false,
        userId: null,
        user: {},
        tip: '您是否需要回呼患者'
    };

    st = null;

    joinChannelData = {};

    constructor(props) {
        super(props);
    }

    componentDidMount(){
        //订阅病历中回呼事件
        pubSub.subShowCallbackDialogInCase((topic, data)=>{
            this.state.tip = '您是否需要回呼患者';
            this.state.callType = data.callType;
            this.state.disabled = false;

            let {currentCase, patients} = this.props;
            let {patientId} = currentCase;

            if (patientId) {
                let patient = patients[patientId];

                this.getUser(patient.userId);
            }


            this.setVisible(true);
        });

        //订阅app接听事件
        pubSub.subAppAccept(()=>{
            clearTimeout(this.st);
            if(this.state.isVisible){
                this._callback();
            }
        });

        //订阅app挂断事件
        pubSub.subAppHangUp(()=>{
            clearTimeout(this.st);
            this.appHangUp();
        });
    }

    getUser(id) {
        let {dispatch} = this.props;
        this.state.userId = id;

        this.setState({
            userId: id,
            user: {},
            disabled: true
        });

        dispatch(getUserById(id)).then(
            (action)=> {
                let user = (action.response || {}).data || {};
                dispatch(setCallInfo({
                    callUser: user
                }));

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

    appHangUp(){
        if(this.state.isVisible){
            let {dispatch} = this.props;
            let {workingStatus, phone} = this.joinChannelData;
            let {userId} = this.state;

            //将医生状态置为占线前的状态
            dispatch(noticeChangeDoctorState({
                workingStatus: workingStatus
            }));

            //呼叫拒接或不接，发短信通知
            dispatch(sendMissedCallMsg({
                phone: phone,
                type: 2
            }));

            //推送未接来电
            if (userId) {
                dispatch(missedCall({
                    userId: userId,
                    startTime: new Date().valueOf()
                }));
            }

            this.setState({
                tip: '对方忙碌，请稍后再试',
                disabled: false
            });
        }
    }

    setJoinChannelData(params, data, doctorId, workingStatus){
        this.joinChannelData = {
            recordingKey: data.recordingKey,
            key: data.dynamicKey,
            channel: data.channelName,
            id: doctorId,
            workingStatus: workingStatus,
            phone: params.phone,
            callType: params.callType
        };

        this.st = setTimeout(()=>{
            //超时时调用
            this.props.dispatch(agoraVoipInviteBye({
                doctorId: doctorId,
                channelName: data.channelName,
                userPhone: params.phone
            }));

            this.appHangUp();
        }, 60*1000);
    }

    //回呼
    onOk() {
        let {userId, callType} = this.state;
        let {users = {}, currentCase={}} = this.props;
        let user = users[userId];

        this.setState({
            tip: '呼叫中。。。',
            disabled: true
        });

        if (user && user.mobilePhone) {
            let {dispatch, doctor={}} = this.props;

            let preWorkingStatus = doctor.workingStatus;

            let params = {
                inquiryCallType: 0,
                phone: user.mobilePhone,
                callType: callType,
                inquiryId: currentCase.inquiryId,
                doctorId: doctor.id,
                operatorRoleCode: preWorkingStatus === 4 ? 105 : 104
            };

            if(currentCase.patientId){
                params.patientId = currentCase.patientId;
            }

            if(currentCase.inquiryInfoId){
                params.inquiryInfoId = currentCase.inquiryInfoId;
            }

            //将医生状态置为占线
            dispatch(noticeChangeDoctorState({
                workingStatus: 1
            }));

            //回呼前创建会话ID
            dispatch(agoraCall(params)).then(
                (action)=> {
                    let result = (action.response || {}).result;
                    let data = (action.response || {}).data;

                    if (result === 0) {
                        this.setJoinChannelData(params, data, doctor.id, preWorkingStatus);
                    } else {
                        console.log('呼叫失败-------------创建会话（inquireId）失败');
                        this.setState({
                            tip: '呼叫失败，请重新呼叫',
                            disabled: false
                        });

                        //将医生状态置为占线前的状态
                        dispatch(noticeChangeDoctorState({
                            workingStatus: preWorkingStatus
                        }));
                    }
                },
                ()=> {
                    console.log('呼叫失败-------------创建会话（inquireId）失败');
                    this.setState({
                        tip: '呼叫失败，请重新呼叫',
                        disabled: false
                    });

                    //将医生状态置为占线前的状态
                    dispatch(noticeChangeDoctorState({
                        workingStatus: preWorkingStatus
                    }));
                }
            );
        } else {
            console.log('呼叫失败-------------用户信息获取错误');
            this.setState({
                tip: '呼叫失败，请重新呼叫',
                disabled: false
            });
        }
    }

    //回呼
    _callback() {
        let {joinChannel} = this.props;

        if (typeof joinChannel == 'function') {
            joinChannel(this.joinChannelData);
            this.setVisible(false);
        }
    }

    //取消
    onCancel() {
        this.setVisible(false);
    }

    setVisible(isVisible) {
        this.setState({
            isVisible: isVisible
        });
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
        let {currentCase={}, patients={}} = this.props;

        let {isVisible, disabled, tip, user={}} = this.state;

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
    const {doctorStore, caseStore, patientStore, userStore} = globalStore;

    return {
        doctor: Object.assign({}, doctorStore.data),
        patients: Object.assign({}, patientStore.patients),
        users: Object.assign({}, userStore.users),
        currentCase: caseStore.currentCase,
        diagnosis: caseStore.diagnosis
    }
};


CallbackFromCase = connect(mapStateToProps)(CallbackFromCase);

export default withRouter(CallbackFromCase);
