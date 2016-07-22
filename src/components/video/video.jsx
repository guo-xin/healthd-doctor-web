import React from 'react';
import {Button, message} from 'antd';
import Call from 'components/dialogs/call';
import Callback from 'components/dialogs/callback';
import CallbackFromCase from 'components/dialogs/callbackFromCase';
import {
    setUserForVideoArea,
    showCallingDialog,
    showCallbackFromCaseDialog,
    setCallState,
    queueBack,
    missedCall,
    cancelQueue,
    sendMissedCallMsg,
    reduceService,
    callTimeoutOrReject
} from 'redux/actions/call';
import {getOCXAccount} from 'redux/actions/auth';
import {setDoctorQueueCount, noticeChangeDoctorState, changeDoctorState} from 'redux/actions/doctor';
import {connect} from 'react-redux';
import * as global from 'util/global';
import styles from './video.less';

function RegisterCallBack(obj, name, proc) {
    if (typeof (proc) != "function")
        return;
    if (window.ActiveXObject || "ActiveXObject" in window) {
        if (window.ActiveXObject && obj.attachEvent) {
            obj.attachEvent(name, proc);
        } else {
            AttachIE11Event(obj, name, proc);
        }
    } else {
        obj[name] = proc;
    }
}

function AttachIE11Event(obj, _strEventId, _functionCallback) {
    var nameFromToStringRegex = /^function\s?([^\s(]*)/;
    var paramsFromToStringRegex = /\(\)|\(.+\)/;
    var params = _functionCallback.toString().match(paramsFromToStringRegex)[0];
    var functionName = _functionCallback.name
        || _functionCallback.toString().match(nameFromToStringRegex)[1];
    var handler;
    try {
        handler = document.createElement("script");
        handler.setAttribute("for", obj.id);
    } catch (ex) {
        handler = document.createElement('<script for="' + obj.id + '">');
    }
    handler.event = _strEventId + params;
    handler.appendChild(document.createTextNode(functionName + params + ";"));
    document.body.appendChild(handler);
}

let ringFile = require('assets/ring.wav');

class Video extends React.Component {
    selfPhoneNumber = "01053827382"; //外呼时显示号码

    videoPluginData = {
        //来电信息
        incomingCall: {
            callType: -1, //呼叫类型，0：音频，1：视频
            caller: "", //会话ID，标志此会话
            callId: "", //主叫号码
            nickName: "" //昵称
        },


        timeIndex: -1
    };

    startTime = null; //问诊开始时间

    queueId = null; //排队id

    //Cloopen Client 插件
    ClientOCX = null;

    //视频显示插件
    remoteView = null;

    callState = -1; //0：呼叫中 1：通话中 -1：通话结束,

    callType = 0; //0: 音频 1：视频

    inquiryCallType = 0; // 0医生呼叫用户， 1用户呼叫医生

    phone = ''; //通话的电话号码

    state = {
        isConnecting: false,
        selectedVideo: {},
        isShowVideoCtrl: false,
        isPlay: false
    };

    timer = null;

    loopCallHandler = null;
    loopCallCount = 0;

    //查找摄像头信息并设置视频窗口
    setVideoView() {
        let remoteView = this.remoteView;
        let ClientOCX = this.ClientOCX;

        let local = remoteView.CreateChild();// 创建子窗体
        ClientOCX.CCPsetVideoView(remoteView.HWND, local);
        remoteView.MoveWindow(local, 306, 10, 120, 164);// 移动子窗体到自定位置

        //查询摄像头信息，返回设备数组
        let jsonobj = ClientOCX.CCPgetCameraInfo();
        jsonobj = JSON.parse(jsonobj);

        if (Array.isArray(jsonobj) && jsonobj.length > 0) {
            let cap = jsonobj[0].capability;
            let index_capability = 0;
            let result;

            index_capability = cap.findIndex((item)=> {
                return (item.X == 640 && item.Y == 360)
            });

            result = ClientOCX.CCPselectCamera(0, index_capability, 15, 2, false);
        }
    }

    componentDidMount() {
        let st = setTimeout(()=> {
            clearTimeout(st);
            st = null;

            this.props.dispatch(getOCXAccount()).then(()=> {
                let account = Object.assign({}, this.props.account);

                if (account && account.authToken) {
                    this.initVideoPlugin(account);
                }
            });
        }, 1000);
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

        if (nextProps.isShowCallingDialog && nextProps.isShowCallingDialog != this.props.isShowCallingDialog) {
            if (nextProps.callType === 0) {
                //开始响铃
                this.refs.audio.setAttribute('src', ringFile);
                this.refs.audio.play();
            }
        }

        if (!nextProps.isShowCallingDialog && nextProps.isShowCallingDialog != this.props.isShowCallingDialog) {
            //停止响铃
            this.refs.audio.setAttribute('src', '');
            this.refs.audio.pause();
        }
    }

    //初始化视频插件实例
    initVideoPlugin(account) {
        let ClientOCX = this.ClientOCX = document.createElement("object");
        let remoteView = this.remoteView = document.createElement("object");

        if (window.ActiveXObject || "ActiveXObject" in window) {
            ClientOCX.classid = "CLSID:F20C5A15-A3E3-4375-9A8B-8275489017B8";
            remoteView.classid = "CLSID:68B52885-C989-4C75-A6D3-B054F54E8E8F";
        }
        else {
            ClientOCX.type = "application/yuntongxun-ccpclientsdk-plugin";
            remoteView.type = "application/yuntongxun-agent-video-plugin";
        }

        ClientOCX.width = 0;
        ClientOCX.height = 0;

        remoteView.width = "100%";
        remoteView.height = "100%";
        remoteView.style.background = '#000';

        let container = document.getElementById(styles.plugin);

        container.appendChild(ClientOCX);
        container.appendChild(remoteView);

        // 注册回调事件(RegisterCallBack函数是自定义函数)
        RegisterCallBack(ClientOCX, "OnConnected", (msg)=>this.OnConnected(msg)); //连接成功
        RegisterCallBack(ClientOCX, "OnConnectError", (msg)=>this.OnConnectError(msg));
        RegisterCallBack(ClientOCX, "OnCallProceeding", (msg)=>this.OnCallProceeding(msg));
        RegisterCallBack(ClientOCX, "OnMakeCallFailed", (msg)=>this.OnMakeCallFailed(msg));
        RegisterCallBack(ClientOCX, "OnCallReleased", (msg)=>this.OnCallReleased(msg));
        RegisterCallBack(ClientOCX, "OnCallAnswered", (msg)=>this.OnCallAnswered(msg));
        RegisterCallBack(ClientOCX, "OnIncomingCallReceived", (msg)=>this.OnIncomingCallReceived(msg));
        RegisterCallBack(ClientOCX, "OnResumed", (msg)=>this.OnResumed(msg));

        // 登录
        if (ClientOCX.callid != undefined) {
            if (ClientOCX.CCPinit() == 0) {
                ClientOCX.CCPsetCodecEnabled(0, 0);//禁用iLBC编码
                ClientOCX.CCPsetCodecEnabled(2, 0);//禁用PCMU编码
                ClientOCX.CCPsetCodecEnabled(3, 0);//禁用PCMA编码
                ClientOCX.CCPsetCodecEnabled(4, 0);//禁用VP8编码
                ClientOCX.CCPsetCodecEnabled(6, 0);//禁用SILK 8K编码
                ClientOCX.CCPsetCodecEnabled(7, 0);//禁用SILK 12K编码
                ClientOCX.CCPsetCodecEnabled(8, 0);//禁用SILK 16k编码
                let result = ClientOCX.CCPlogin(
                    account['ip'],
                    account.port,
                    account.acountSid,
                    account.authToken,
                    account.subAccount,
                    account.subAccountPwd,
                    account.voipId,
                    account.voipPwd
                );

                console.log('video--------------初始化成功');
            } else {
                console.log('video--------------初始化失败');
            }

        } else {
            message.warning('请安装ocx控件');
        }
    }

    //客户端连接云通讯平台成功
    OnConnected() {
        //设置铃声
        //var result=ClientOCX.CCPsetRing(videoPluginData.telephoneRing);
        this.setVideoView();
        console.log('video--------------连接成功');
    }

    //客户端连接云通讯平台失败
    OnConnectError(msg) {
        //message.error('连接失败');

        if (this.callState === 1 || this.callState === 0) {
            let {dispatch} = this.props;

            this.callState = -1;
            dispatch(setCallState(-1, JSON.parse(msg)));

            //医生呼叫用户
            if (this.inquiryCallType === 0) {
                //推送未接来电
                dispatch(missedCall({
                    userId: incomingUser.userId,
                    startTime: this.startTime
                }));

                //取消排队
                if (this.queueId) {
                    /*dispatch(cancelQueue({
                     queueId: this.queueId
                     }));*/

                    //排队人数减1
                    dispatch(setDoctorQueueCount({
                        type: -1
                    }));
                }
            }

        }

        console.log('video--------------连接失败', msg);
    }

    //外呼时，服务器如果有回应，触发此事件。外呼失败时，如果没有收到这个事件，表明服务器没有回应，可能本地网络有问题或者服务器地址有问题
    OnCallProceeding(msg) {
        this.videoPluginData.callid = this.ClientOCX.callid;
        this.videoPluginData.process = 0;//0：呼叫中，保存状态
        console.log('video--------------外呼，服务器处理中');
    }

    OnMakeCallFailed(msg) {
        let {dispatch, incomingUser, callbackUser={}} = this.props;
        let userId;

        //医生呼叫用户
        if (this.inquiryCallType === 0) {
            userId = callbackUser.userId;
        } else {
            userId = incomingUser.userId;
        }

        //电话呼叫超时拒接调用接口
        if (this.callType === 0) {
            dispatch(callTimeoutOrReject());

            //医生呼叫用户
            if (this.inquiryCallType === 0) {
                let obj = JSON.parse(msg) || {};

                if (obj.reason && (obj.reason.reason === 175604 || obj.reason.reason === 175480)) {
                    dispatch(sendMissedCallMsg({
                        phone: this.phone,
                        type: 2
                    }));

                    //推送未接来电
                    if (userId) {
                        dispatch(missedCall({
                            userId: userId,
                            startTime: this.startTime || new Date().valueOf()
                        }));
                    }
                }
            }
        }

        //视频呼叫
        if (this.callType === 1) {
            let obj = JSON.parse(msg) || {};

            //视频呼叫时，如果对方不在线，发短信通知
            if (obj.reason && obj.reason.reason === 175404) {
                /*dispatch(sendMissedCallMsg({
                 phone: this.phone,
                 type: this.inquiryCallType === 0 ? 2 : 1
                 }));*/


                //开始循环呼叫30秒，每隔3秒呼叫一次
                if (this.loopCallCount < 10 && this.loopCallCount >= 0) {
                    if (this.loopCallCount === 0) {
                        //推送未接来电
                        if (userId) {
                            dispatch(missedCall({
                                userId: userId,
                                startTime: this.startTime || new Date().valueOf()
                            }));
                        }
                    }

                    this.loopCallHandler = setTimeout(()=> {
                        this.startLoopCall();
                    }, 3000);

                    return;
                }
            } else {
                //视频呼叫拒接或不接，发短信通知
                if (obj.reason && (obj.reason.reason === 175486 || obj.reason.reason === 175408)) {
                    dispatch(sendMissedCallMsg({
                        phone: this.phone,
                        type: 2
                    }));

                    //推送未接来电
                    if (userId) {
                        dispatch(missedCall({
                            userId: userId,
                            startTime: this.startTime || new Date().valueOf()
                        }));
                    }
                }
            }
        }

        //挂断电话后将医生置为之前状态
        if (this.callState === 1 || this.callState === 0) {
            if (this.preWorkingStatus !== null) {

                dispatch(noticeChangeDoctorState({
                    workingStatus: this.preWorkingStatus
                }));
            }
        }

        this.callState = -1;
        dispatch(setCallState(-1, JSON.parse(msg)));
        console.log('video--------------呼叫失败', msg);
    }

    OnResumed(msg) {
        console.log('video--------------取消保持', msg);
    }

    //呼叫释放
    OnCallReleased(msg) {
        let {dispatch, inquiryId} = this.props;

        //如果接听对话框打开，则关闭
        if (this.props.isShowCallingDialog) {
            dispatch(showCallingDialog(false));
        }

        //清空来电信息
        this.videoPluginData.incomingCall = Object.assign({}, {
            callType: -1,
            caller: "",
            callId: "27103526",
            nickName: ""
        });

        this.setState({
            isConnecting: false
        });

        //挂断电话后将医生置为之前状态
        if (this.callState === 1 || this.callState === 0) {
            dispatch(noticeChangeDoctorState({
                workingStatus: this.preWorkingStatus
            }));
        }


        //通话后挂断取消排队
        if (this.callState === 1 && this.inquiryCallType === 0) {
            /*dispatch(cancelQueue({
             queueId: this.queueId
             }));*/

            //排队人数减1
            dispatch(setDoctorQueueCount({
                type: -1
            }));
        }


        this.callState = -1;
        this.props.dispatch(setCallState(-1));

        this.stopTimer();

        console.log('video--------------呼叫释放', msg);
    }

    //进入通话状态。主叫接收到这个事件，表明被叫已经应答；被叫接收到这个事件，表明应答成功
    OnCallAnswered(msg) {
        let ClientOCX = this.ClientOCX;
        let props = this.props;
        let {dispatch} = props;

        this.setState({
            isConnecting: true
        });

        this.callState = 1;
        dispatch(setCallState(1));

        //音频
        if (this.callType === 0) {
            this.startTimer();
        } else {
            this.stopLoopCall();
        }

        //设置音量
        if (ClientOCX) {
            ClientOCX.CCPsetSpeakerVolume(255);
        }

        console.log('video--------------应答', msg);
    }

    //收到呼叫时处理
    OnIncomingCallReceived(msg) {
        let {dispatch, doctor} = this.props;

        this.callType = 1; //视频
        this.inquiryCallType = 1; //用户呼叫医生


        if (msg) {
            msg = JSON.parse(msg);

            let list;

            if (msg.caller) {
                list = msg.caller.split('$');
                if (list.length > 0) {
                    this.phone = list[1];
                }
            }

            this.videoPluginData.incomingCall = Object.assign({}, msg);
        }

        //设置通话状态 呼叫中
        this.callState = 0;

        //接收到呼叫时置医生为占线，记录占线前状态
        this.preWorkingStatus = doctor.workingStatus;
        dispatch(noticeChangeDoctorState({
            workingStatus: 1
        }));

        //显示来电弹窗 0：音频 1：视频
        dispatch(showCallingDialog(true, 1, {
            msg: msg,
            callState: this.callState
        }));

        console.log('video--------------收到呼叫', msg);
    }

    startLoopCall() {
        let ClientOCX = this.ClientOCX;
        let callType = this.callType;
        let phone = '88' + this.phone;

        this.loopCallCount++;

        ClientOCX.CCPmakeCall(callType, phone);
        ClientOCX.CCPsetVideoBitRates(400);
    }

    stopLoopCall() {
        clearTimeout(this.loopCallHandler);
        this.loopCallHandler = null;
    }

    startTimer() {
        this.stopTimer();

        let seconds = -1;
        let container = this.refs.timer;

        //来电时设置用户头像
        if (this.inquiryCallType === 0) {
            let {callbackUser={}} = this.props;
            if (callbackUser.headPic) {
                this.refs.userHeadPic.src = callbackUser.headPic;
            }

        } else {
            let {incomingUser={}} = this.props;
            if (incomingUser.headPic) {
                this.refs.userHeadPic.src = incomingUser.headPic;
            }
        }

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

    //接听视频呼叫
    answer() {

        let {incomingCall} = this.videoPluginData;

        if (incomingCall.callid && ( incomingCall.callType == 0 || incomingCall.callType == 1)) {
            let result, ClientOCX = this.ClientOCX;
            ClientOCX.CCPsetVideoBitRates(400);
            result = ClientOCX.CCPacceptCall(ClientOCX.callid, incomingCall.callType);
        }

        console.log('video--------------正在接听');
    }

    //接听电话呼叫，本质是医生端发起电话回呼
    callbackFromCall(phone, workingStatus) {
        //停止响铃
        this.refs.audio.setAttribute('src', '');
        this.refs.audio.pause();

        let {dispatch, doctor} = this.props;
        let ClientOCX = this.ClientOCX;

        this.callType = 0;
        this.inquiryCallType = 1; //患者电话呼叫医生
        this.phone = phone;
        this.callState = 0;
        //设置通话状态 呼叫中
        dispatch(setCallState(0));

        //外呼时设置对方显示的主叫号码，需要和服务器的配置配合使用
        if (typeof ClientOCX.CCPsetSelfPhoneNumber === 'function') {
            ClientOCX.CCPsetSelfPhoneNumber(this.selfPhoneNumber);
        }

        ClientOCX.CCPmakeCall(0, phone);

        //接收到呼叫时置医生为占线，记录占线前状态
        this.preWorkingStatus = workingStatus;

        dispatch(noticeChangeDoctorState({
            workingStatus: 1
        }));

    }

    //在弹出来电对话框时挂断
    hangUpFromDialog(phone, callType, isClickAnswer, workingStatus) {
        //停止响铃
        this.refs.audio.setAttribute('src', '');
        this.refs.audio.pause();

        let ClientOCX = this.ClientOCX;

        //音频
        if (callType === 0) {
            //未点击接听
            if (!isClickAnswer) {
                let {dispatch} = this.props;

                dispatch(callTimeoutOrReject());

                dispatch(sendMissedCallMsg({
                    phone: phone,
                    type: 1
                }));

                dispatch(changeDoctorState({
                    workingStatus: workingStatus
                }));

            } else {
                ClientOCX.CCPrejectCall(ClientOCX.callid, 3);
            }
        } else {
            ClientOCX.CCPrejectCall(ClientOCX.callid, 3);
        }

        console.log('video--------------挂断', callType);
    }

    //接通视频后或电话后挂断
    hangUpFromVideo() {
        let ClientOCX = this.ClientOCX;
        ClientOCX.CCPrejectCall(ClientOCX.callid, 3);
        console.log('video--------------挂断');
    }

    //忙碌
    busy() {
        let ClientOCX = this.ClientOCX;
        ClientOCX.CCPrejectCall(ClientOCX.callid, 6);
        console.log('video--------------忙碌');
    }

    //回呼
    callback(obj) {
        let {phone, callType, userId, queueId} = obj;

        this.loopCallCount = 0;

        this.startTime = new Date().valueOf();
        this.queueId = queueId;
        this.callType = callType;
        this.inquiryCallType = 0; //医生呼叫用户
        this.phone = phone;

        let ClientOCX = this.ClientOCX;

        if (callType === 1) {
            phone = '88' + phone;
        }

        let {dispatch, doctor} = this.props;

        //设置通话状态 呼叫中
        this.callState = 0;
        dispatch(setCallState(0));

        //排队回呼推送, 只有视频时推送
        if (callType === 1) {
            dispatch(queueBack({
                startTime: this.startTime,
                userId: userId
            }));
        }

        if (callType === 0) {
            //外呼时设置对方显示的主叫号码，需要和服务器的配置配合使用
            ClientOCX.CCPsetSelfPhoneNumber(this.selfPhoneNumber);
        } else {
            ClientOCX.CCPsetSelfPhoneNumber('');
        }

        ClientOCX.CCPmakeCall(callType, phone);

        if (callType === 1) {
            ClientOCX.CCPsetVideoBitRates(400);
        }

        //接收到呼叫时置医生为占线，记录占线前状态
        this.preWorkingStatus = doctor.workingStatus;

        dispatch(noticeChangeDoctorState({
            workingStatus: 1
        }));

        console.log('video--------------回呼');
    }

    //视频区域回呼
    callbackFromVideoArea(obj = {}) {
        let {phone, callType, userId} = obj;
        let {dispatch, doctor} = this.props;

        this.loopCallCount = 0;

        this.callType = callType;
        this.inquiryCallType = 0; //医生呼叫用户
        this.phone = phone;
        this.startTime = new Date().valueOf();

        let ClientOCX = this.ClientOCX;

        if (callType === 1) {
            phone = '88' + phone;
        }

        //设置通话状态 呼叫中
        this.callState = 0;
        dispatch(setCallState(0));

        //待归档回呼推送, 只有视频时推送
        if (callType === 1) {
            dispatch(queueBack({
                startTime: this.startTime,
                userId: userId
            }));
        }

        if (callType === 0) {
            //外呼时设置对方显示的主叫号码，需要和服务器的配置配合使用
            ClientOCX.CCPsetSelfPhoneNumber(this.selfPhoneNumber);
        } else {
            ClientOCX.CCPsetSelfPhoneNumber('');
        }

        ClientOCX.CCPmakeCall(callType, phone);

        if (callType === 1) {
            ClientOCX.CCPsetVideoBitRates(400);
        }

        //接收到呼叫时置医生为占线，记录占线前状态
        this.preWorkingStatus = doctor.workingStatus;

        dispatch(noticeChangeDoctorState({
            workingStatus: 1
        }));
    }

    showCallFromCaseDialog(callType) {
        this.state.isShowVideoCtrl = false;

        this.pause();

        this.props.dispatch(showCallbackFromCaseDialog(true, callType));
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

    onPause(e){
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
        const {isConnecting, isPlay, isShowVideoCtrl} = this.state;
        const {isShowVideo, callRecords, userForVideoArea} = this.props;

        let callType = this.callType;
        let hash = window.location.hash;
        let isCasePage = (hash.indexOf('inquire/case/detail') !== -1);
        let records = this.getCallRecords(callRecords);

        if (!(this.callState === -1 && callRecords.length > 0 && isCasePage && isShowVideoCtrl)) {
            if (this.refs.video) {
                this.refs.video.pause();
            }
        }

        return (
            <div className={isShowVideo?styles.wrapperShow:styles.wrapper}>
                <audio ref="audio" autoPlay={false} loop="loop" src={ringFile} style={{display: "none"}}></audio>

                <Call answer={()=>this.answer()} hangUp={::this.hangUpFromDialog} busy={()=>this.busy()}
                      callbackFromCall={::this.callbackFromCall}/>
                <Callback callback={::this.callback}/>

                <CallbackFromCase callback={::this.callbackFromVideoArea}></CallbackFromCase>

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
                            <div className={styles.right} style={{display: isCasePage? 'block': 'none'}}>
                                <Button type="ghost" onClick={()=>{this.showCallFromCaseDialog(0)}}>电话回呼</Button>
                                <Button onClick={()=>{this.showCallFromCaseDialog(1)}}>视频回呼</Button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.pluginContainer}>
                        <div className={callType===0?styles.audio:styles.video}>
                            <div id={styles.plugin}></div>

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
                                <div className={styles.right} style={{display: 'none'}}>
                                    <Button type="ghost" shape="circle">截图</Button>
                                    <Button shape="circle">打点</Button>
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
    const {callStore, authStore, caseStore, doctorStore} = globalStore;

    return {
        inquiryId: callStore.inquiryId,
        incomingUser: callStore.incomingUser,
        callbackUser: callStore.callbackUser,
        userForVideoArea: callStore.userForVideoArea,
        doctor: Object.assign({}, doctorStore.data),
        callType: callStore.callType,
        isShowVideo: caseStore.isShowVideo,
        isShowCallingDialog: callStore.isShowCallingDialog,
        account: authStore.ocxAccount,
        callRecords: caseStore.callRecords
    }
};

Video = connect(mapStateToProps)(Video);

export default Video;