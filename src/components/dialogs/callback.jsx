import styles from './callback.less';
import React, {Component} from 'react';
import {Modal, Button, message} from 'antd';
import {withRouter} from 'react-router';

import {connect} from 'react-redux';
import {getUserById} from 'redux/actions/user';
import {showCallbackDialog, setIncomingUserId, setCallbackUserId, addCallRecord} from 'redux/actions/call';
import {setCurrentCase} from 'redux/actions/case'

import Image from '../image/image.jsx';
import * as global from 'util/global';

class Callback extends Component {
    state = {
        isVisible: false,
        disabled: false,
        user: {},
        tip: '您是否需要回呼患者'
    };

    constructor(props) {
        super(props);
    }

    toNextPage() {
        let {dispatch, callbackUser={}, router} = this.props;

        this.setVisible(false);

        /*dispatch(getUserById(callbackUser.userId)).then((action)=> {
            let user = (action.response || {}).data || {};
            dispatch(setIncomingUserId(user.userId, user));
        });*/

        if(callbackUser.patientId){
            dispatch(setCurrentCase({
                inquiryInfoId: callbackUser.inquiryInfoId,
                userId: callbackUser.userId,
                patientId: callbackUser.patientId,
                caseId: null,
                state: -1
            }));
            router.push(`/inquire/case/detail`);
        }else{
            router.push(`/inquire/case/selectPatient`);
        }

        setTimeout(()=>{
            dispatch(setIncomingUserId(callbackUser.userId, callbackUser));
        }, 200);
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
                this.toNextPage();
            }
            else {
                //由呼叫中直接到挂断为呼叫失败
                if (this.props.callState === 0) {
                    let tip = '呼叫失败，请重新呼叫。';
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
    }

    //接听
    onOk() {
        let {callback, dispatch, doctor={}} = this.props;

        if (typeof callback === 'function') {
            let {callbackUser={}, callType} = this.props;

            this.setState({
                tip: '呼叫中。。。',
                disabled: true
            });

            let params = {
                inquiryCallType: 0,
                phone: callbackUser.userMobilePhone,
                userGpkgId: callbackUser.userGpkgId,
                gpkgId: callbackUser.gpkgId,
                callType: callType + 1,
                operatorRoleCode: doctor.workingStatus === 4 ? 105 : 104
            };

            if(callbackUser.patientId){
                params.patientId = callbackUser.patientId;
            }

            if(callbackUser.inquiryInfoId){
                params.inquiryInfoId = callbackUser.inquiryInfoId;
            }

            //回呼前创建会话ID
            dispatch(addCallRecord(params)).then(
                (action)=> {
                    let result = (action.response || {}).result;

                    if (result === 0) {
                        callback({
                            phone: callbackUser.userMobilePhone,
                            callType: callType,
                            userId: callbackUser.userId,
                            startTime: callbackUser.createdTime,
                            queueId: callbackUser.id
                        });
                    } else {
                        console.log('呼叫失败-------------创建会话（inquireId）失败');
                        this.setState({
                            tip: '呼叫失败，请重新呼叫',
                            disabled: false
                        });
                    }
                },
                ()=> {
                    console.log('呼叫失败-------------创建会话（inquireId）失败');
                    this.setState({
                        tip: '呼叫失败，请重新呼叫',
                        disabled: false
                    });
                }
            );


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
        let {callbackUser={}, isVisible} = this.props;
        let user = callbackUser || {};
        let {disabled, tip} = this.state;

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
    const {callStore, doctorStore} = globalStore;

    return {
        doctor: Object.assign({}, doctorStore.data),
        callbackUser: Object.assign({}, callStore.callbackUser),
        isVisible: callStore.isShowCallbackDialog,
        callType: callStore.callType,
        callState: callStore.callState,
        callMessage: callStore.callMessage
    }
};


Callback = connect(mapStateToProps)(Callback);

export default withRouter(Callback);
