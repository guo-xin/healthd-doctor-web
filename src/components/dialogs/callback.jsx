import styles from './callback.less';
import React, {Component} from 'react';
import {Modal, Button, message} from 'antd';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import {
    showCallbackDialog,
    agoraCall,
    setCallInfo,
    agoraVoipInviteBye,
    missedCall,
    sendMissedCallMsg
} from 'redux/actions/call';
import {setCurrentCase} from 'redux/actions/case';
import {getMaterialBeforeCase} from 'redux/actions/inquire';
import {noticeChangeDoctorState} from 'redux/actions/doctor';
import Image from '../image/image.jsx';
import * as global from 'util/global';

import pubSub from 'util/pubsub';

class Callback extends Component {
    state = {
        disabled: false,
        callbackUser: {},
        description: '',
        tip: '您是否需要回呼患者'
    };

    st = null;

    joinChannelData = {};

    inquiryId = null;

    toCasePage() {
        let {dispatch, router} = this.props;
        let {callbackUser={}} = this.state;

        this.setVisible(false);

        dispatch(setCurrentCase({
            description: this.state.description,
            inquiryInfoId: callbackUser.inquiryInfoId,
            inquiryId: this.inquiryId,
            userId: callbackUser.userId,
            patientId: callbackUser.patientId,
            caseId: null,
            state: -1
        }));

        dispatch(setCallInfo({
            callUser: callbackUser
        }));

        router.push(`/inquire/case/detail`);
    }

    componentDidMount(){
        //订阅显示回呼对话框
        pubSub.subShowCallbackDialog((topic, data)=>{
            this.state.tip = '您是否需要回呼患者';
            this.state.description = '';
            this.state.callbackUser = data.callbackUser;
            this.state.callType = data.callType;
            this.state.disabled = false;

            this.inquiryId = (data.callbackUser || {}).inquiryId;

            this.getPatientDesc();
            this.setVisible(true);
        });

        //订阅app接听事件
        pubSub.subAppAccept(()=>{
            clearTimeout(this.st);
            if(this.props.isVisible){
                this._callback();
            }
        });

        //订阅app挂断事件
        pubSub.subAppHangUp(()=>{
            clearTimeout(this.st);
            this.appHangUp();
        });
    }

    appHangUp(){
        let {dispatch, isVisible} = this.props;
        if(isVisible){
            let {workingStatus, phone} = this.joinChannelData;

            //将医生状态置为占线前的状态
            dispatch(noticeChangeDoctorState({
                workingStatus: workingStatus
            }));

           this.sendMissedCall(phone, true);

            this.setState({
                tip: '对方忙碌，请稍后再试',
                disabled: false
            });
        }
    }

    getPatientDesc() {
        let {dispatch} = this.props;
        let {callbackUser={}} = this.state;

        if (callbackUser.inquiryInfoId && callbackUser.patientId) {
            this.setState({
                disabled: true
            });
            dispatch(getMaterialBeforeCase({
                inquiryInfoId: callbackUser.inquiryInfoId
            })).then(
                (action)=> {
                    let data = (action.response || {}).data || {};
                    let description = data.description;

                    this.setState({
                        description: description,
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

        this.inquiryId = this.inquiryId || data.inquiryId;

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

    sendMissedCall(phone, flag){
        let {dispatch} = this.props;
        let {userId} = this.state.callbackUser;

        //呼叫拒接或不接，发短信通知
        if(phone && flag){
            dispatch(sendMissedCallMsg({
                phone: phone,
                type: 2
            }));
        }

        //推送未接来电
        if (userId) {
            dispatch(missedCall({
                userId: userId,
                startTime: new Date().valueOf()
            }));
        }
    }

    //回呼
    onOk() {
        let {dispatch, doctor={}} = this.props;

        let {callbackUser={}, callType} = this.state;

        let doctorId = doctor.id;

        this.setState({
            tip: '呼叫中。。。',
            disabled: true
        });

        let preWorkingStatus = doctor.workingStatus;

        let params = {
            inquiryCallType: 0,
            phone: callbackUser.userMobilePhone,
            userGpkgId: callbackUser.userGpkgId,
            gpkgId: callbackUser.gpkgId,
            callType: callType,
            doctorId: doctorId,
            operatorRoleCode: preWorkingStatus === 4 ? 105 : 104
        };

        if (callbackUser.patientId) {
            params.patientId = callbackUser.patientId;
        }

        if (callbackUser.inquiryInfoId) {
            params.inquiryInfoId = callbackUser.inquiryInfoId;
        }

        //将医生状态置为占线
        dispatch(noticeChangeDoctorState({
            workingStatus: 1
        }));


        let tip = '呼叫失败，请重新呼叫';

        //回呼前创建会话ID
        dispatch(agoraCall(params)).then(
            (action)=> {
                let result = (action.response || {}).result;
                let data = (action.response || {}).data;
                let code = (action.response || {}).code;

                if (result === 0) {
                    this.setJoinChannelData(params, data, doctorId, preWorkingStatus);
                } else {
                    console.log('呼叫失败-------------创建会话（inquireId）失败', code);

                    if(code === -13002){
                        tip = '对方不在线，请稍后再试';
                        this.sendMissedCall(params.phone);
                    }

                    this.setState({
                        tip: tip,
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
                    tip: tip,
                    disabled: false
                });

                //将医生状态置为占线前的状态
                dispatch(noticeChangeDoctorState({
                    workingStatus: preWorkingStatus
                }));
            }
        );
    }

    //回呼
    _callback() {
        let {joinChannel} = this.props;

        if (typeof joinChannel == 'function') {
            joinChannel(this.joinChannelData);
            this.toCasePage();
        }
    }

    //取消
    onCancel() {
        this.setVisible(false);
    }

    setVisible(isVisible) {
        this.props.dispatch(showCallbackDialog(isVisible));
    }

    render() {
        let {disabled, tip, callbackUser={}} = this.state;
        let {isVisible} = this.props;
        let user = callbackUser || {};

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
                        <Image src={user.head || global.defaultHead}
                               defaultImg={global.defaultHead}>
                        </Image>
                    </span>
                </div>
                <div className={styles.detail}>
                    <div className="top">
                        <span className="name">患者：{user.realName || '--'}</span>
                        <span className="age">{global.getAge(user.birthday) || '--岁'}</span>
                        <span className="serial">ID:{global.formatPatientCode(user.patientCode) || '--'}</span>
                        <span className="gender">
                             <img src={global.getGenderUrl(user.sex)} alt=""/>
                        </span>
                    </div>
                    <div className="middle clearfix">
                        <ul>
                            <li>问诊人：{user.userName || user.userMobilePhone || '--'}</li>
                            <li>与问诊人关系：{global.getRelationText(user.relation) || '--'}</li>
                            <li style={{width:"100%"}}>上次诊断：{user.diagnosisName || '--'}</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.callTips}>{tip}</div>
            </Modal>
        );
    }
}

const mapStateToProps = (globalStore) => {
    const {doctorStore, callStore} = globalStore;

    return {
        isVisible: callStore.isShowCallbackDialog,
        doctor: Object.assign({}, doctorStore.data)
    }
};

Callback = connect(mapStateToProps)(Callback);

export default withRouter(Callback);
