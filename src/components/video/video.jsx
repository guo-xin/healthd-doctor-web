require("file?name=assets/js/[name].js!../../assets/js/AgoraRtcAgentSDK.js");
import styles from './video.less';
import React from 'react';
import {Button, message} from 'antd';
import Call from 'components/dialogs/call';
import {connect} from 'react-redux';

import Callback from 'components/dialogs/callback';
import CallbackFromCase from 'components/dialogs/callbackFromCase';
import CallRecord from './callRecord';
import Player from './player';
import CallUser from './callUser';

import {
    subscribeServerEvent,
    agoraVoipInviteBye,
    setCallInfo,
    setUserForVideoArea
} from 'redux/actions/call';
import {getOCXAccount} from 'redux/actions/auth';
import {setDoctorQueueCount, noticeChangeDoctorState} from 'redux/actions/doctor';

import pubSub from 'util/pubsub';

class Video extends React.Component {
    state = {
        isConnecting: false,
        isShowVideoCtrl: false,
        isPlay: false
    };

    /*声网*/
    key = '';
    recordingKey = '';
    appId = '7eca1d509eaa4075bcfa068032a19ee0';
    client = null;
    localStream = null;
    lastLocalStreamId = null;
    videoProfile = '480P_2';
    remoteStreamList = [];

    componentDidMount() {
        let {dispatch, doctorId} = this.props;

        let st = setTimeout(()=> {
            clearTimeout(st);
            st = null;

            //订阅服务端账号事件
            dispatch(subscribeServerEvent(doctorId)).then(
                (action)=> {
                    let res = action.response || {};
                    if (res.result === 0) {
                        this.init();
                    }
                }
            );
        }, 1000);

        pubSub.subAppHangUp(()=>{
            this.clearAllStream();
        });

        //订阅app呼叫来电事件
        pubSub.subShowCallDialog((topic, data)=>{
            this.state.isShowVideoCtrl = false;
            this.togglePlay(false);
        });
    }

    componentWillUnmount() {
        this.refs.callUser.stopTimer();
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.isShowVideo && nextProps.isShowVideo !== this.props.isShowVideo) {
            this.state.isShowVideoCtrl = false;
            this.togglePlay(false);
            nextProps.dispatch(setUserForVideoArea({}));
        }

        if(this.props.isShowVideo && nextProps.currentCase.caseId !== this.props.currentCase.caseId){
            this.state.isShowVideoCtrl = false;
            this.togglePlay(false);
        }
    }

    //初始化声网控件
    init() {
        let client = AgoraRTC.createRtcClient();
        this.client = client;

        if (client) {
            client.init(this.appId, ()=> {
                console.log("AgoraRTC client 创建成功");
                if (this.secret) {
                    client.setEncryptionSecret(this.secret);
                }
            }, (err) => {
                if (err) {
                    console.log("AgoraRTC client 创建失败", err);
                }
            });
        }

        this.subscribeStreamEvents();

    }

    //订阅流监听事件
    subscribeStreamEvents() {
        let client = this.client;

        client.on('stream-added', (evt)=> {
            var stream = evt.stream;
            console.log("New stream added: " + stream.getId());
            //console.log("Timestamp: " + Date.now());
            //console.log("Subscribe ", stream);
            client.subscribe(stream, function (err) {
                console.log("Subscribe stream failed", err);
            });
        });

        client.on('peer-leave', (evt)=> {
            console.log("Peer has left: " + evt.uid);
            this.showStreamOnPeerLeave(evt.uid);
            //updateRoomInfo();
        });

        client.on('stream-subscribed', (evt)=> {
            var stream = evt.stream;
            console.log("Subscribe remote stream successfully: " + stream.getId());
            this.showStreamOnPeerAdded(stream);
            //updateRoomInfo();
        });

        client.on("stream-removed", (evt)=> {
            console.log("Stream removed: " + evt.stream.getId());
            this.showStreamOnPeerLeave(evt.stream.getId());
            //updateRoomInfo();
        });
    }

    showStreamOnPeerAdded(stream) {
        let list = this.remoteStreamList;
        let {callType} = this.props;

        if (list.length == 0) {
            if (stream) {
                stream.play('agora-remote');
                list.push({
                    id: stream.getId(),
                    stream: stream,
                    videoEnabled: callType==2,
                    audioEnabled: true
                });
            }
        }
    }

    showStreamOnPeerLeave(streamId) {
        this.clearAllStream();
    }

    //加入频道
    joinChannel(params) {
        let client = this.client;
        let {dispatch} = this.props;

        if (client) {
            dispatch(setCallInfo({
                callState: 1
            }));

            this.key = params.key;
            this.recordingKey = params.recordingKey;

            this.hangupParams = {
                doctorId:  params.id,
                userPhone: params.phone,
                channelName: params.channel
            };

            //记录医生通信前的状态
            this.workingStatus = params.workingStatus;

            client.join(params.key, params.channel, params.id, (uid) => {
                this.setState({
                    callState: 1,
                    isConnecting: true
                });

                client.startRecording(params.recordingKey, function () {
                    console.log("开始录音");
                }, function (err) {
                    console.log("启动录音失败", err);
                });

                console.log("用户 " + uid + " 加入频道成功");
                let localStream = this.initLocalStream(uid);

                this.localStream = localStream;
                this.lastLocalStreamId = localStream.getId();

            }, function (error) {
                console.log("加入频道失败", error);
            });

            if(params.callType == 1){
                this.refs.callUser.startTimer();
            }
        }
    }

    //初始化本地流
    initLocalStream(id) {
        let uid = id;
        let localStream = this.localStream;
        let client = this.client;
        let {callType} = this.props;

        if (localStream) {
            // local stream exist already
            client.unpublish(localStream, function (err) {
                console.log("Unpublish localStream failed with error: ", err);
            });
            localStream.close();
        }

        localStream = AgoraRTC.createStream({
            streamID: uid,
            audio: true,
            video: callType == 2,
            screen: false,
            local: true
        });

        localStream.setVideoProfile(this.videoProfile);

        localStream.init(function () {
            console.log("Get UserMedia successfully");

            localStream.play('agora-local');


            client.publish(localStream, function (err) {
                console.log("Publish local stream error: " + err);
            });

            client.on('stream-published');

        }, function (err) {
            console.log("Local stream init failed.", err);
        });
        return localStream;
    }

    clearAllStream() {
        let localStream = this.localStream;
        let remoteStreamList = this.remoteStreamList;
        let client = this.client;

        this.refs.callUser.stopTimer();

        if(!localStream){
            return;
        }

        if (localStream) {
            localStream.close();
        }

        for (let index = 0, length = remoteStreamList.length; index < length; index += 1) {
            remoteStreamList[index].stream.close();
        }

        client.stopRecording(this.recordingKey, function () {
            console.log("结束录音");
        }, function () {
            console.log("结束录音失败");
        });

        if(client){
            client.leave();
        }

        document.getElementById('agora-remote').innerHTML = '';
        document.getElementById('agora-local').innerHTML = '';


        this.localStream = null;
        this.remoteStreamList = [];

        this.resetState();
    }

    resetState(){
        let {dispatch} = this.props;

        this.setState({
            callState: -1,
            isConnecting: false
        });

        dispatch(setCallInfo({
            callState: -1
        }));
        dispatch(noticeChangeDoctorState({
            workingStatus:this.workingStatus
        }));
    }
    
    hangup(){
        let {dispatch} = this.props;

        dispatch(agoraVoipInviteBye(this.hangupParams));
    }

    //接通视频后或电话后挂断
    hangUpFromVideo() {
        this.clearAllStream();

        this.hangup();
    }

    showCallFromCaseDialog(callType) {
        let {doctor, dispatch} = this.props;

        if (doctor.workingStatus == 2 || doctor.workingStatus == 9) {
            message.error('离线或忙碌状态不可以呼叫患者！');
            return;
        }

        this.state.isShowVideoCtrl = false;

        this.togglePlay(false);

        //设置通话信息
        dispatch(setCallInfo({
            callType: callType,
            inquiryCallType: 0,
            callState: -1
        }));

        //显示回呼对话框
        pubSub.showCallbackDialogInCase({
            callType: callType
        });
    }

    togglePlayState(flag){
        this.setState({
            isPlay: !!flag
        });
    }

    togglePlay(flag){
        let player = this.refs.player;
        let callRecord = this.refs.callRecord;

        if(flag){
            this.state.isShowVideoCtrl = true;
            player.play(callRecord.getUrl());
        }else{
            player.pause();
        }
    }

    render() {
        let {isConnecting, isPlay, isShowVideoCtrl} = this.state;
        const {isShowVideo, userForVideoArea, patients={}, currentCase, callRecords, callState, callUser, callType} = this.props;

        let hash = window.location.hash;
        let isCasePage = (hash.indexOf('inquire/case/detail') !== -1);
        let patient = patients[currentCase.patientId];
        let isShowCallRecords = callState===-1 && callRecords.length>0 && isCasePage;

        return (
            <div className={isShowVideo?styles.wrapperShow:styles.wrapper}>
                <Call joinChannel={(data)=>this.joinChannel(data)}/>
                <Callback joinChannel={(data)=>this.joinChannel(data)}/>
                <CallbackFromCase joinChannel={(data)=>this.joinChannel(data)}></CallbackFromCase>
                <div className={isConnecting?styles.connect:styles.disconnect}>

                    <CallUser ref="callUser" userForVideoArea={userForVideoArea} callUser={callUser}></CallUser>
                    
                    <div className={styles.mask}>
                        <div className={styles.media}>
                            <Player ref="player" togglePlayState={::this.togglePlayState} isShowCallRecords={isShowCallRecords} isShowVideoCtrl={isShowVideoCtrl}></Player>
                        </div>
                        <div className={styles.actions}>
                            <div className={styles.left}>
                                <Button type="ghost"
                                        className={isPlay?styles.pause: styles.play}
                                        icon={isPlay?'pause': 'caret-right'}
                                        style={{display: isShowCallRecords? 'inline-block': 'none'}}
                                        shape="circle" onClick={()=>{this.togglePlay(!isPlay)}}></Button>
                            </div>
                            <div className={styles.right} style={{display: isCasePage && patient? 'block': 'none'}}>
                                <Button type="ghost" onClick={()=>{this.showCallFromCaseDialog(1)}}>电话回呼</Button>
                                <Button onClick={()=>{this.showCallFromCaseDialog(2)}}>视频回呼</Button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.pluginContainer}>
                        <div id={styles.plugin}>
                            <div style={{display: callType==2 && callState == 1 ?'block': 'none'}}>
                                <div id="agora-remote" className={styles.agoraRemote}></div>
                                <div id="agora-local" className={styles.agoraLocal}></div>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <div className={styles.left}>
                                <Button type="primary" shape="circle"
                                        onClick={()=>{this.hangUpFromVideo()}}>挂断</Button>
                            </div>
                        </div>
                    </div>
                    
                </div>
                <CallRecord ref="callRecord"
                            togglePlay={::this.togglePlay}
                            callRecords={callRecords} 
                            isShowCallRecords={isShowCallRecords}></CallRecord>
            </div>
        );
    }
}

const mapStateToProps = (globalStore) => {
    const {callStore, authStore, caseStore, doctorStore, patientStore} = globalStore;

    return {
        patients: Object.assign({}, patientStore.patients),
        currentCase: caseStore.currentCase,
        callUser: callStore.callUser,
        userForVideoArea: callStore.userForVideoArea,
        doctorId: authStore.id,
        doctor: Object.assign({}, doctorStore.data),
        callType: callStore.callType,
        callState: callStore.callState,
        isShowVideo: caseStore.isShowVideo,
        callRecords: caseStore.callRecords
    }
};

Video = connect(mapStateToProps)(Video);

export default Video;