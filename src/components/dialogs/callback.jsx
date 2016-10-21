import styles from './callback.less';
import React, {Component} from 'react';
import {Modal, Button, message} from 'antd';
import {withRouter} from 'react-router';

import {connect} from 'react-redux';
import {
    agoraCall,

    showCallbackDialog,
    setIncomingUserId,
    setCallbackUserId,
    addCallRecord
} from 'redux/actions/call';
import {setCurrentCase} from 'redux/actions/case';
import {getMaterialBeforeCase} from 'redux/actions/inquire';
import {noticeChangeDoctorState} from 'redux/actions/doctor';
import Image from '../image/image.jsx';
import * as global from 'util/global';

let pubSub = require('pubsub-js');

class Callback extends Component {
    state = {
        isVisible: false,
        disabled: false,
        user: {},
        description: '',
        tip: '您是否需要回呼患者'
    };

    constructor(props) {
        super(props);
    }

    toCasePage() {
        let {dispatch, callbackUser={}, router} = this.props;

        this.setVisible(false);

        dispatch(setCurrentCase({
            description: this.state.description,
            inquiryInfoId: callbackUser.inquiryInfoId,
            inquiryId: callbackUser.inquiryId,
            userId: callbackUser.userId,
            patientId: callbackUser.patientId,
            caseId: null,
            state: -1
        }));

        router.push(`/inquire/case/detail`);

        setTimeout(()=> {
            dispatch(setIncomingUserId(callbackUser.userId, callbackUser));
        }, 200);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isVisible && nextProps.isVisible != this.props.isVisible) {
            this.state.description = '';
            this.getPatientDesc(nextProps);
        }
    }

    componentDidMount(){
        pubSub.subscribe('apphangup', ()=>{
            this.setVisible(false);
        })
    }

    getPatientDesc(props) {
        let {dispatch, callbackUser} = props;

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

    //回呼
    onOk() {
        let {dispatch, doctor={}} = this.props;

        let {callbackUser={}, callType} = this.props;

        let doctorId = doctor.id;

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
            doctorId: doctorId,
            operatorRoleCode: doctor.workingStatus === 4 ? 105 : 104
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

        //回呼前创建会话ID
        dispatch(agoraCall(params)).then(
            (action)=> {
                let result = (action.response || {}).result;
                let data = (action.response || {}).data;

                if (result === 0) {
                    this._callback(params, data, doctor.workingStatus);
                } else {
                    console.log('呼叫失败-------------创建会话（inquireId）失败');
                    this.setState({
                        tip: '呼叫失败，请重新呼叫',
                        disabled: false
                    });

                    //将医生状态置为占线前的状态
                    dispatch(noticeChangeDoctorState({
                        workingStatus: doctor.workingStatus
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
                    workingStatus: doctor.workingStatus
                }));
            }
        );
    }

    //回呼
    _callback(params, data, workingStatus) {
        let {dispatch, joinChannel, doctor} = this.props;
        let doctorId = doctor.id;

        if (typeof joinChannel == 'function') {
            joinChannel({
                recordingKey: data.recordingKey,
                key: data.dynamicKey,
                channel: data.channelName,
                id: doctorId,
                workingStatus: workingStatus,
                phone: params.phone,
                callType: params.callType
            });

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
