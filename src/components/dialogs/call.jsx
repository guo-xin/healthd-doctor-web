import styles from './call.less';
import React, {Component} from 'react';
import {Modal, Button, message} from 'antd';
import {withRouter} from 'react-router';

import {connect} from 'react-redux';
import {getUserByMPTV} from 'redux/actions/user';
import {
    agoraAccept,
    agoraVoipInviteRefuse,

    showCallingDialog,
    setIncomingUserId,
    addRecordForTimeoutAndHangup
} from 'redux/actions/call';
import {setCurrentCase} from 'redux/actions/case';
import {getMaterialBeforeCase} from 'redux/actions/inquire';
import {noticeChangeDoctorState} from 'redux/actions/doctor';
import Image from '../image/image.jsx';
import * as global from 'util/global';

class Call extends Component {
    state = {
        isVisible: false,
        user: {},
        disabled: false,
        tip: ''
    };

    constructor(props) {
        super(props);
    }

    st = null; //句柄，电话超过一分钟直接关闭

    //属性改变前调用
    componentWillReceiveProps(nextProps) {
        let {dispatch, isVisible} = this.props;
        let nextIsVisible = nextProps.isVisible;

        if (nextIsVisible === true && nextIsVisible != isVisible) {
            this.state.user = {};
            this.getUser(nextProps);

            //超过一分钟未接听直接挂断
            this.st = setTimeout(()=> {
                this.hangUp(nextProps, true);
            }, 60 * 1000);
        }

        if (nextIsVisible === false && nextIsVisible != isVisible) {
            setTimeout(()=> {
                this.isClickAnswer = false;
            }, 50);
        }
    }

    getUser(props) {
        let {incomingCallInfo={}, doctorId} = props;

        if (incomingCallInfo.tel) {

            this.state.disabled = true;
            props.dispatch(getUserByMPTV({
                mobilephone: incomingCallInfo.tel,
                callType: incomingCallInfo.callType + 1,
                voipId: doctorId,
                patientId: incomingCallInfo.patientId,
                inquiryInfoId: incomingCallInfo.inquiryInfoId
            })).then(
                (action)=> {
                    let user = (action.response || {}).data || {};
                    let result = (action.response || {}).result;

                    if (result === 0) {
                        this.getPatientDesc(props, user);

                    } else {
                        message.info('由于网络异常用户信息获取失败，请挂断');
                    }

                },
                ()=> {
                    message.info('由于网络异常用户信息获取失败，请挂断');
                }
            );
        }
    }

    getPatientDesc(props, user) {
        let {incomingCallInfo={}} = props;
        let inquiryInfoId = user.inquiryInfoId || incomingCallInfo.inquiryInfoId;
        let patientId = user.patientId || incomingCallInfo.patientId;

        if (inquiryInfoId && patientId) {
            props.dispatch(getMaterialBeforeCase({
                inquiryInfoId: inquiryInfoId
            })).then(
                (action)=> {
                    let data = (action.response || {}).data || {};
                    let description = data.description;

                    this.setState({
                        user: user,
                        description: description,
                        disabled: false
                    });
                },
                ()=> {
                    this.setState({
                        user: user,
                        disabled: false
                    });
                }
            );
        } else {
            this.setState({
                user: user,
                disabled: false
            });
        }
    }

    toCasePage(props, data) {
        let {dispatch, router} = props;
        let {user, description} = this.state;

        this.setVisible(false);

        dispatch(setCurrentCase({
            description: description,
            inquiryInfoId: data.inquiryInfoId,
            inquiryId: data.inquiryId,
            userId: user.userId,
            patientId: data.patientId,
            caseId: null,
            state: -1
        }));

        router.push(`/inquire/case/detail`);

        setTimeout(()=> {
            dispatch(setIncomingUserId(user.userId, user));
        }, 100);
    }

    //接听
    answer() {
        let props = this.props;
        let {dispatch, incomingCallInfo} = props;
        let doctorId = incomingCallInfo.doctorId;

        this.setVisible(false);

        dispatch(agoraAccept({
            channelName: incomingCallInfo.channelName,
            doctorId: doctorId
        })).then(
            (action)=> {
                let result = (action.response || {}).result;
                let data = (action.response || {}).data || {};

                if (result === 0) {
                    this.toCasePage(props, {
                        inquiryInfoId: incomingCallInfo.inquiryInfoId,
                        patientId:incomingCallInfo.patientId,
                        inquiryId: data.inquiryId
                    });

                    setTimeout(()=> {
                        this._answer(data, doctorId, incomingCallInfo.tel, incomingCallInfo.workingStatus);
                    }, 100);

                } else {
                    message.error('接听失败');
                    console.log('呼叫失败-------------查询会话（inquireId）失败');
                    this.hangUp();
                }
            },
            ()=> {
                message.error('接听失败');
                console.log('呼叫失败-------------查询会话（inquireId）失败');
                this.hangUp();
            }
        );
    }

    //加入频道
    _answer(data, doctorId, phone, workingStatus){
        let {joinChannel, callType} = this.props;

        if(typeof joinChannel == 'function'){
            joinChannel({
                key: data.dynamicKey,
                recordingKey: data.recordingKey,
                channel: data.channelName,
                id: doctorId,
                workingStatus: workingStatus,
                phone: phone,
                callType: callType
            });
        }
    }

    //挂断, isTimeout:是否超时挂断
    hangUp(props, isTimeout) {
        clearTimeout(this.st);

        this.setVisible(false);

       // let {hangUp, callType, phone, incomingCallInfo, dispatch} = props || this.props;

        //电话预约之后医生挂断和超时未接调用更新通话记录状态
        /*if (callType === 0 && !this.isClickAnswer && incomingCallInfo.recordId) {
            dispatch(addRecordForTimeoutAndHangup({
                id: incomingCallInfo.recordId,
                byeType: isTimeout ? -2 : -8
            }));
        }*/


        let {dispatch, incomingCallInfo} = props || this.props;

        //拒绝接听时调用
        dispatch(agoraVoipInviteRefuse({
            doctorId: incomingCallInfo.doctorId,
            channelName: incomingCallInfo.channelName,
            userPhone: incomingCallInfo.tel
        }));

        //挂断后将医生置为原来的状态
        dispatch(noticeChangeDoctorState({
            workingStatus: incomingCallInfo.workingStatus
        }));

        this.isClickAnswer = false;
    }


    setVisible(isVisible) {
        this.props.dispatch(showCallingDialog(isVisible));
    }

    render() {
        let {isVisible, callType} = this.props;
        let {user={}, tip, disabled} = this.state;

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
                    <Button size="large" type="ghost" onClick={()=>this.hangUp()}><img
                        src={require('assets/images/hangup-gray.png')} alt=""/>挂断</Button>

                   <Button size="large" className="answer-btn" onClick={()=>this.answer()} disabled={disabled} ><img
                        src={require('assets/images/answer.png')} alt=""/>接听</Button>
            </div>
                }>
                <div className={styles.pic}>
                    <span>
                        <Image src={user.head || global.defaultHead} defaultImg={global.defaultHead}>
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
    const {callStore, authStore} = globalStore;

    return {
        doctorId: authStore.id,
        isVisible: callStore.isShowCallingDialog,
        incomingCallInfo: callStore.incomingCallInfo,
        callType: callStore.callType,
        callState: callStore.callState
    }
};


Call = connect(mapStateToProps)(Call);

export default withRouter(Call);
