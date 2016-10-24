require("file?name=assets/js/[name].js!../../assets/js/AgoraRtcAgentSDK.js");

import React from 'react';
import {Button, message} from 'antd';
import Call from 'components/dialogs/call';
import Callback from 'components/dialogs/callback';
import CallbackFromCase from 'components/dialogs/callbackFromCase';
import {
    subscribeServerEvent,
    agoraVoipInviteBye,
    setCallInfo,

    setUserForVideoArea,
    queueBack,
    missedCall,
    cancelQueue,
    sendMissedCallMsg,
    reduceService,
    callTimeoutOrReject
} from 'redux/actions/call';
import {getOCXAccount} from 'redux/actions/auth';
import {setDoctorQueueCount, noticeChangeDoctorState} from 'redux/actions/doctor';
import {connect} from 'react-redux';
import * as global from 'util/global';
import styles from './video.less';

import pubSub from 'util/pubsub';

class Video extends React.Component {
    queueId = null; //排队id


    callState = -1; //0：呼叫中 1：通话中 -1：通话结束,

    callType = 1; //1: 音频 2：视频

    inquiryCallType = 0; // 0医生呼叫用户， 1用户呼叫医生

    phone = ''; //通话的电话号码

    state = {
        isConnecting: false,
        selectedVideo: {},
        isShowVideoCtrl: false,
        isPlay: false
    };

    timer = null;

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
    }

    componentWillUnmount() {
        this.stopTimer();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isShowVideo && nextProps.isShowVideo !== this.props.isShowVideo) {
            this.state.selectedVideo = {};
            this.refs.video.setAttribute('src', '');
            this.refs.video.load();
        }

        if (!nextProps.isShowVideo && nextProps.isShowVideo !== this.props.isShowVideo) {
            this.state.isPlay = false;
            this.refs.video.pause();
            this.state.isShowVideoCtrl = false;
            nextProps.dispatch(setUserForVideoArea({}));
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

        if (list.length == 0) {
            if (stream) {
                stream.play('agora-remote');
                list.push({
                    id: stream.getId(),
                    stream: stream,
                    videoEnabled: true,
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
        }
    }

    //初始化本地流
    initLocalStream(id) {
        let uid = id;
        let localStream = this.localStream;
        let client = this.client;

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
            video: true,
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

        this.pause();

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
    
    
    
    
    
    
    
    

    startTimer() {
        this.stopTimer();

        let seconds = -1;
        let container = this.refs.timer;
        let {callUser={}} = this.props;

        //来电时设置用户头像
        this.refs.userHeadPic.src = callUser.headPic;

        changeTime();

        this.timer = setInterval(()=> {
            changeTime();
        }, 1000);


        function changeTime() {
            seconds += 1;
            container.innerHTML = [parseInt(seconds / 60 / 60), parseInt(seconds / 60 % 60), seconds % 60].join(":")
                .replace(/\b(\d)\b/g, "0$1");
        }
    }

    stopTimer() {
        this.refs.userHeadPic.src = global.defaultHead;
        clearInterval(this.timer);
    }

    selectVideo = {};

    onVideoChange(item, index) {
        this.setState({
            selectedVideo: Object.assign({}, {
                item: item,
                index: index
            })
        });
    }

    onDoubleClick(item, index) {
        this.setState({
            selectedVideo: Object.assign({}, {
                item: item,
                index: index
            })
        });

        this.togglePlay();
    }

    _togglePlay() {
        if (this.state.isPlay) {
            this.pause();
        } else {
            this.state.isShowVideoCtrl = true;
            this.play();
        }
    }

    play() {
        this.refs.video.play();
        this.setState({
            isPlay: true
        });
    }

    pause() {
        this.refs.video.pause();
        this.setState({
            isPlay: false
        });
    }

    togglePlay() {
        let item = this.state.selectedVideo.item;

        if (!this.state.isPlay) {
            let callRecords = this.props.callRecords || [];

            if (!item) {
                if (callRecords.length > 0) {
                    this.state.selectedVideo = {
                        item: callRecords[0],
                        index: 0
                    };

                    item = callRecords[0];
                }
            }
        }

        if (this.refs.video.getAttribute('src') !== item.recordURL) {
            this.refs.video.setAttribute('src', item.recordURL);
        }

        this._togglePlay();
    }

    onPause(e) {
        this.state.isPlay = false;
    }

    onError(e) {
        this.setState({
            isPlay: false
        });


        if (this.refs.video.getAttribute('src')) {
            message.error('播放出错');
        }
    }

    onEnd(e) {
        this.setState({
            isPlay: false
        });
    }

    getCallRecords(callRecords = []) {
        let list;
        if (callRecords.length > 0) {
            list = callRecords.map((item, index)=> {
                return <li key={index} onClick={()=>this.onVideoChange(item, index)}
                           onDoubleClick={()=>this.onDoubleClick(item, index)}
                           className={this.state.selectedVideo.index === index?styles.active:''}>
                <span>
                    <span className={styles.recordsLeft + ' ' + (item.callType==2? styles.videoIcon:styles.audioIcon)}>
                    </span>
                    <span className={styles.recordsRight}>
                        <span className={styles.date}>
                            {global.formatDate(item.startTime, 'MM月dd日 HH:mm')}
                        </span>

                        <span className={styles.duration}>
                            时长：{global.formatTime((item.endTime - item.startTime) / 1000)}
                        </span>
                    </span>
                </span>
                </li>
            });

            return <ul className={styles.callRecords}>{list}</ul>
        } else {
            this.state.selectedVideo = {};
        }

        return null;
    }

    render() {
        let {isConnecting, isPlay, isShowVideoCtrl} = this.state;
        const {isShowVideo, callRecords, userForVideoArea, patients={}, currentCase, callType} = this.props;

        let hash = window.location.hash;
        let isCasePage = (hash.indexOf('inquire/case/detail') !== -1);
        let records = this.getCallRecords(callRecords);
        let patient = patients[currentCase.patientId];

        if (!(this.callState === -1 && callRecords.length > 0 && isCasePage && isShowVideoCtrl)) {
            if (this.refs.video) {
                this.refs.video.pause();
            }
        }

        return (
            <div className={isShowVideo?styles.wrapperShow:styles.wrapper}>

                <Call joinChannel={(data)=>this.joinChannel(data)}/>
                <Callback joinChannel={(data)=>this.joinChannel(data)}/>

                <CallbackFromCase joinChannel={(data)=>this.joinChannel(data)}></CallbackFromCase>

                <div className={isConnecting?styles.connect:styles.disconnect}>
                    <div className={styles.mask}>
                        <div className={styles.media}>
                            <span className={styles.head}>
                                <img ref="patientHeadPic" src={userForVideoArea.headPic || global.defaultHead} alt=""/>
                            </span>
                            <span className={styles.userName}>
                                代主诉人：{userForVideoArea.userName || '--'}
                            </span>

                            <div className={styles.videoContainer}
                                 style={{display: this.callState===-1 && callRecords.length>0 && isCasePage && isShowVideoCtrl ? 'block': 'none'}}>
                                <video
                                    ref="video"
                                    controls="controls"
                                    preload="none"
                                    onPause={::this.onPause}
                                    onEnded={::this.onEnd}
                                    onError={::this.onError}>
                                    您的浏览器不支持 video 标签。
                                </video>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <div className={styles.left}>
                                <Button type="ghost"
                                        className={isPlay?styles.pause: styles.play}
                                        icon={isPlay?'pause': 'caret-right'}
                                        style={{display: this.callState===-1 && callRecords.length>0 && isCasePage? 'inline-block': 'none'}}
                                        shape="circle" onClick={()=>{this.togglePlay()}}></Button>
                            </div>
                            <div className={styles.right} style={{display: isCasePage && patient? 'block': 'none'}}>
                                <Button type="ghost" onClick={()=>{this.showCallFromCaseDialog(1)}}>电话回呼</Button>
                                <Button onClick={()=>{this.showCallFromCaseDialog(2)}}>视频回呼</Button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.pluginContainer}>
                        <div className={callType===1?styles.audio:styles.video}>
                            <div id={styles.plugin}>
                                <div id="agora-remote" className={styles.agoraRemote}>

                                </div>

                                <div id="agora-local" className={styles.agoraLocal}>

                                </div>
                            </div>

                            <div id={styles.phone}>
                                <span className={styles.head}>
                                    <img ref="userHeadPic" src={global.defaultHead} alt=""/>
                                </span> <span className={styles.userName}>
                                代主诉人：{userForVideoArea.userName || '--'}
                            </span>
                                <span className={styles.process}>正在通话中</span>
                                <span className={styles.timer} ref="timer"></span>
                            </div>

                            <div className={styles.actions}>
                                <div className={styles.left}>
                                    <Button type="primary" shape="circle"
                                            onClick={()=>{this.hangUpFromVideo()}}>挂断</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.recordsContainer}
                     style={{display: this.callState===-1 && callRecords.length>0 && isCasePage? 'block': 'none'}}>
                    {records}
                </div>
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
        isShowVideo: caseStore.isShowVideo,
        callRecords: caseStore.callRecords
    }
};

Video = connect(mapStateToProps)(Video);

export default Video;