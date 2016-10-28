import styles from './call.less';
import React, {Component} from 'react';
import {Modal, Button, message} from 'antd';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import {getUserByMPTV} from 'redux/actions/user';
import {
    agoraAccept,
    agoraVoipInviteRefuse,
    setCallInfo
} from 'redux/actions/call';
import {setCurrentCase} from 'redux/actions/case';
import {getMaterialBeforeCase} from 'redux/actions/inquire';
import {noticeChangeDoctorState} from 'redux/actions/doctor';
import Image from '../image/image.jsx';
import * as global from 'util/global';

import pubSub from 'util/pubsub';

let ringFile = require('assets/ring.wav');

class Call extends Component {
    state = {
        incomingCallInfo: {}, //app来电消息推送内容
        isVisible: false,
        user: {}, //当前来电用户详细信息
        disabled: false,
        tip: ''
    };

    constructor(props) {
        super(props);
    }

    st = null; //句柄，电话超过一分钟直接关闭

    componentDidMount(){
        //订阅app挂掉事件
        pubSub.subAppHangUp(()=>{
            this.setVisible(false);
            this.resetDocState();
        });

        //订阅app呼叫来电事件
        pubSub.subShowCallDialog((topic, data)=>{
            this.state.incomingCallInfo = data;
            this.state.user = {};
            this.getUser();
            this.setVisible(true);

            //超过一分钟未接听直接挂断
            this.st = setTimeout(()=> {
                this.hangUp(true);
            }, 60 * 1000);
        });
    }

    //查询用户信息
    getUser() {
        let {dispatch} = this.props;
        let {incomingCallInfo={}} = this.state;

        if (incomingCallInfo.tel) {
            this.state.disabled = true;
            dispatch(getUserByMPTV({
                mobilephone: incomingCallInfo.tel,
                callType: incomingCallInfo.callType,
                voipId: incomingCallInfo.doctorId,
                patientId: incomingCallInfo.patientId,
                inquiryInfoId: incomingCallInfo.inquiryInfoId
            })).then(
                (action)=> {
                    let user = (action.response || {}).data || {};
                    let result = (action.response || {}).result;

                    if (result === 0) {
                        this.getPatientDesc(user);

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

    getPatientDesc(user) {
        let {dispatch} = this.props;
        let {incomingCallInfo={}} = this.state;
        let inquiryInfoId = user.inquiryInfoId || incomingCallInfo.inquiryInfoId;
        let patientId = user.patientId || incomingCallInfo.patientId;

        if (inquiryInfoId && patientId) {
            dispatch(getMaterialBeforeCase({
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

    toCasePage(data) {
        let {dispatch, router} = this.props;
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

        dispatch(setCallInfo({
            callUser: user
        }));

        router.push(`/inquire/case/detail`);
    }

    //接听
    answer() {
        clearTimeout(this.st);

        let {dispatch} = this.props;
        let {incomingCallInfo} = this.state;
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
                    this.toCasePage({
                        inquiryInfoId: incomingCallInfo.inquiryInfoId,
                        patientId:incomingCallInfo.patientId,
                        inquiryId: data.inquiryId
                    });

                    setTimeout(()=> {
                        this._answer(data, incomingCallInfo);
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
    _answer(data, incomingCallInfo){
        let {joinChannel} = this.props;

        if(typeof joinChannel == 'function'){
            joinChannel({
                key: data.dynamicKey,
                recordingKey: data.recordingKey,
                channel: data.channelName,
                id: incomingCallInfo.doctorId,
                workingStatus: incomingCallInfo.workingStatus,
                phone: incomingCallInfo.tel,
                callType: incomingCallInfo.callType
            });
        }
    }

    //挂断, isTimeout:是否超时挂断
    hangUp(isTimeout) {
        clearTimeout(this.st);

        this.setVisible(false);

        let {dispatch} = this.props;
        let {incomingCallInfo} = this.state;

        //拒绝接听时调用
        dispatch(agoraVoipInviteRefuse({
            doctorId: incomingCallInfo.doctorId,
            channelName: incomingCallInfo.channelName,
            userPhone: incomingCallInfo.tel
        }));

        dispatch(setCallInfo({
            callState: -1
        }));

        this.resetDocState();
    }

    resetDocState(){
        let {dispatch} = this.props;
        let {incomingCallInfo} = this.state;

        //挂断后将医生置为原来的状态
        dispatch(noticeChangeDoctorState({
            workingStatus: incomingCallInfo.workingStatus
        }));
    }

    setVisible(isVisible) {
        let audio = this.refs.audio;
        if(!isVisible){
            clearTimeout(this.st);
        }

        if(audio){
            if(isVisible){
                audio.setAttribute('src', ringFile);
                audio.play();
            }else{
                audio.setAttribute('src', '');
                audio.pause();
            }
        }

        this.setState({
            isVisible: isVisible
        });
    }

    render() {
        let {isVisible, user={}, tip, disabled} = this.state;

        return (
            <div>
                <audio ref="audio" autoPlay={false} loop="loop" src={ringFile} style={{display: "none"}}></audio>
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

            </div>
        );
    }
}

const mapStateToProps = (globalStore) => {
    const {} = globalStore;
    return {}
};

Call = connect(mapStateToProps)(Call);

export default withRouter(Call);
