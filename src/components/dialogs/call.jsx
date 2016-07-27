import styles from './call.less';
import React, {Component} from 'react';
import {Modal, Button, message} from 'antd';
import {withRouter} from 'react-router';

import {connect} from 'react-redux';
import {getUserByPhone} from 'redux/actions/user';
import {showCallingDialog, setIncomingUserId, getInquiryRecord, addCallRecord} from 'redux/actions/call';
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
            if (nextProps.phone) {
                this.state.disabled = true;
                dispatch(getUserByPhone(nextProps.phone)).then(
                    (action)=> {
                        let user = (action.response || {}).data || {};
                        let result = (action.response || {}).result;

                        if(result===0){
                            this.setState({
                                disabled: false,
                                user: user
                            });
                        }else{
                            message.info('由于网络异常用户信息获取失败，请挂断');
                        }

                    },
                    ()=>{
                        message.info('由于网络异常用户信息获取失败，请挂断');
                    }
                );
            }

            if (nextProps.callType === 0) {
                this.st = setTimeout(()=> {
                    this.hangUp(nextProps);
                }, 60 * 1000);
            }
        }

        if (nextIsVisible === false && nextIsVisible != isVisible) {
            this.isClickAnswer = false;
        }

        if (nextProps.callType === 0) {
            this.checkCall(nextProps);
        } else {
            this.state.tip = "";
        }
    }

    toSelectPatientPage() {
        let {dispatch, router} = this.props;
        let {user} = this.state;

        this.setVisible(false);

        router.push(`/inquire/case/selectPatient`);

        setTimeout(()=> {
            dispatch(setIncomingUserId(user.userId, user));
        }, 100);
    }

    checkCall(nextProps) {

        if (nextProps.isVisible) {
            //接听
            if (nextProps.callState === 0) {
                this.setState({
                    tip: '接听中。。。'
                });
            }
            else if (nextProps.callState === 1) {
                this.state.tip = '';
                this.toSelectPatientPage();
            }
            else {
                //由呼叫中直接到挂断为呼叫失败
                if (this.props.callState === 0) {
                    this.setState({
                        tip: '接听失败'
                    });
                } else {
                    if (!this.props.isVisible) {
                        this.state.tip = "";
                    }
                }
            }
        }
    }

    //接听
    answer() {
        let {answer, dispatch, router} = this.props;
        let {user} = this.state;

        this.setVisible(false);

        dispatch(getInquiryRecord()).then(
            (action)=> {
                let result = (action.response || {}).result;

                if (result === 0) {
                    router.push(`/inquire/case/selectPatient`);

                    setTimeout(()=> {
                        dispatch(setIncomingUserId(user.userId, user));
                        answer();
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

    //忙碌
    busy() {
        this.setVisible(false);

        let {busy} = this.props;
        if (typeof busy === 'function') {
            busy();
        }
    }

    //挂断
    hangUp(props) {
        clearTimeout(this.st);

        this.setVisible(false);

        let {hangUp, callType, phone, incomingCallInfo} = props || this.props;

        if (typeof hangUp === 'function') {
            hangUp(phone, callType, this.isClickAnswer, incomingCallInfo.workingStatus);
        }

        this.isClickAnswer = false;
    }

    //电话接听实质是电话回呼
    callback() {
        clearTimeout(this.st);

        this.isClickAnswer = true;

        let {callbackFromCall, phone, doctor, incomingCallInfo, dispatch} = this.props;
        let {user} = this.state;

        //回呼前创建会话ID
        dispatch(addCallRecord({
            userGpkgId: incomingCallInfo.userGpkgId,
            gpkgId: incomingCallInfo.gpkgId,
            inquiryCallType: 1,
            phone: phone,
            callType: 1,
            operatorRoleCode: incomingCallInfo.workingStatus === 4 ? 105 : 104
        })).then(
            (action)=> {
                let result = (action.response || {}).result;

                if (result === 0) {
                    dispatch(setIncomingUserId(user.userId, user));

                    if (typeof callbackFromCall === 'function') {
                        callbackFromCall(phone, incomingCallInfo.workingStatus);
                    }
                } else {
                    message.error('接听失败');
                    this.setVisible(false);
                    console.log('呼叫失败-------------创建会话（inquireId）失败');

                }
            },
            ()=> {
                message.error('接听失败');
                this.setVisible(false);
                console.log('呼叫失败-------------创建会话（inquireId）失败');
            }
        );

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

                    {callType===1 && <Button size="large" className="answer-btn" onClick={()=>this.answer()} disabled={disabled} ><img
                        src={require('assets/images/answer.png')} alt=""/>接听</Button>}

                    { (callType===0 && !this.isClickAnswer) && <Button size="large" className="answer-btn" onClick={()=>this.callback()} disabled={disabled} ><img
                    src={require('assets/images/answer.png')} alt=""/>接听</Button>}
                    {/*<Button size="large" type="primary" onClick={()=>this.busy()}><img src={require('assets/images/busy.png')} alt=""/>忙碌</Button>*/}
            </div>
                }>
                <div className={styles.pic}>
                    <span>
                        <Image src={user.headPic || global.defaultHead} defaultImg={global.defaultHead}>
                        </Image>
                    </span>
                </div>
                <div className={styles.detail}>
                    <div className="top">
                        <span className="name">患者：{'--' || user.realName || '--'}</span>
                        <span className="age">{'--' || global.getAge(user.birthday) || '--岁'}</span>
                        <span className="serial">ID:{'--' || global.formatPatientCode(user.patientCode) || '--'}</span>
                        <span className="gender" style={{display:'none'}}>
                             <img src={global.getGenderUrl(user.sex)} alt=""/>
                        </span>
                    </div>
                    <div className="middle clearfix">
                        <ul>
                            <li>问诊人：{user.userName || '--'}</li>
                            <li>与问诊人关系：{'--' || global.getRelationText(user.relation) || '--'}</li>
                            <li>就诊次数：{'--' || (user.inquiryCount || 0)}</li>
                            <li>上次诊断：{'--' || user.diagnosisName || '--'}</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.callTips}>{tip}</div>
            </Modal>
        );
    }
}

const mapStateToProps = (globalStore) => {
    const {callStore, doctorStore} = globalStore;

    let phone = callStore.incomingCallInfo.phone;

    return {
        phone: phone,
        doctor: Object.assign({}, doctorStore.data),
        isVisible: callStore.isShowCallingDialog,
        incomingCallInfo: callStore.incomingCallInfo,
        callType: callStore.callType,
        callState: callStore.callState
    }
};


Call = connect(mapStateToProps)(Call);

export default withRouter(Call);