import styles from './header.less';
import React, {Component} from 'react';
import {Menu, Dropdown, Icon, Modal} from 'antd';
import {Link} from 'react-router';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import {signOut} from 'redux/actions/auth';
import {autoSaveCase} from 'redux/actions/case';

import * as global from 'util/global';
import cookie from 'react-cookie';
import * as socket from 'util/socket.jsx';

import {setCurrentCase} from 'redux/actions/case';
import {
    changeDoctorState,
    getDoctorByUserId,
    getDoctorQueueCountByUserId,
    getDoctorPictureMessage,
    getDoctorByUserIdDate,
    getDoctorEndInquery
} from 'redux/actions/doctor';

import Image from '../image/image';

const confirm = Modal.confirm;

export default class User extends Component {
    status = {
        0: '在线',
        1: '占线',
        2: '忙碌',
        3: '锁定用户',
        4: '医助在线',
        9: '离线'
    };

    componentDidMount() {
        this.getDoctorList();

    }

    getDoctorList() {
        const {dispatch, doctorId = ''} = this.props;
        let dateInfo = global.getDateRange();
        dispatch(getDoctorPictureMessage(doctorId));
        dispatch(getDoctorByUserIdDate(doctorId, dateInfo.startTime, dateInfo.endTime));
        dispatch(getDoctorByUserId()).then((action)=> {
            const {data = {}} = this.props;
            let doctorS = cookie.load('doctorStatu');
            if ((data.workingStatus || data.workingStatus === 0) && data.workingStatus !== 9 && !doctorS) {
                socket.receiveMessages();
            }

            //登录后或者刷新后如果医生状态为占线则自动置为在线
            if(data.workingStatus === 1){
                dispatch(changeDoctorState({
                    id: doctorId,
                    workingStatus: 0
                }));
            }
        });
    }

    state = {
        changeState: false,
        menuName: '离线'
    };

    //退出操作
    logout() {
        if (this.props.callState !== -1) {
            return;
        } else {
            const {dispatch, data = {}, doctorId = {}, queue = {}, scheduletList = {}, router} = this.props;
            let dateInfo = global.getDateRange();
            let content = "";
            let time = '';

            dispatch(autoSaveCase());

            if (data.workingStatus && data.workingStatus === 9) {
                confirm({
                    title: '你确认要退出“我有医生”出诊系统吗？',
                    content: content,
                    onOk: ()=> {
                        router.replace(`/login`);
                        dispatch(signOut(this.props.data.email)).then(()=> {
                        });
                    },
                    onCancel: ()=> {
                    }
                });
            } else {
                dispatch(getDoctorQueueCountByUserId(doctorId));

                scheduletList.slice(0, 7).map((obj, index)=> {
                    if (index === dateInfo.weekday - 1) {
                        obj.schedulingList.map((item)=> {
                            if (Date.parse(dateInfo.date) > item.startTime && Date.parse(dateInfo.date) < item.endTime) {
                                time = global.formatTime((item.endTime - Date.parse(dateInfo.date)) / 1000);
                            }
                        })
                    }
                });
                if (!(queue.queueCount === 0) && time === '') {
                    content = "当前还有 " + queue.queueCount + " 位病人正在排队！";
                } else if (queue.queueCount === 0 && !(time === '')) {
                    content = "距离出诊结束还有 " + time;
                } else if (!(queue.queueCount === 0) && !(time === '')) {
                    content = "还有 " + queue.queueCount + " 位病人正在排队！" + "且距离出诊结束还有 " + time;
                }


                confirm({
                    title: '确认要结束出诊吗？',
                    content: content,
                    onOk: ()=> {
                        const {dispatch, doctorId} = this.props;

                        dispatch(getDoctorEndInquery());
                        socket.seClose();
                        setTimeout(()=> {
                            router.replace(`/login`);
                            dispatch(signOut(this.props.data.email));
                        }, 200);

                    },
                    onCancel: ()=> {
                    }
                });
            }

        }
    }

    //医生状态下拉列表
    getMenu() {
        if (this.props) {
            let {data} = this.props;
            if (data && (data.workingStatus || data.workingStatus === 0)) {
                this.state.menuName = this.status[data.workingStatus];
                if (data.workingStatus === 9 || data.workingStatus === 1) {
                    return (<Menu onClick={this.onMenuChange}>
                        <Menu.Item key="5" name="退出"><Icon type="logout"/>退出</Menu.Item>
                    </Menu>);
                } else {
                    return (<Menu onClick={this.onMenuChange}>
                        <Menu.Item key="0" name="在线"><i className={styles.circle+" "+styles.online}></i>在线</Menu.Item>
                        <Menu.Item key="2" name="忙碌"><i className={styles.circle}></i>忙碌</Menu.Item>
                        <Menu.Item key="4" name="医助在线"><i
                            className={styles.circle+" "+styles.yizhu}></i>医助在线</Menu.Item>
                        <Menu.Divider />
                        <Menu.Item key="5" name="退出"><Icon type="logout"/>退出</Menu.Item>
                    </Menu>);
                }
            }

        }
        return [];
    }

    //点击图片列表
    onSettingClick(menu) {
        if (this.props.callState !== -1) {
            return;
        } else {
            let info = menu.key;
            const {dispatch, router, message=[]} = this.props;
            dispatch(setCurrentCase({
                patientId: message[info].patientId,
                caseId: message[info].historyCaseId,
                inquiryId: message[info].inquiryId,
                inquiryInfoId: message[info].inquiryInfoId,
                state: 1
            }));
            router.push(`/inquire/case/detail`);
        }
    }

    //图片列表
    getInformMenu(message) {
        let menuList;
        if (Array.isArray(message) && message.length > 0) {
            menuList = message.map((item, index)=> {
                return (<Menu.Item key={index}>{item.content}<a
                    className={styles.check}>查看</a></Menu.Item>);
            });
            return (<Menu onClick={::this.onSettingClick} className={styles.informMenu}>
                {menuList}
            </Menu>);

        } else {
            return (<Menu className={styles.informMenu}>
                <Menu.Item key='2' className={styles.informationNull}>暂无新消息</Menu.Item>
            </Menu>);
        }
    }

    //切换医生状态操作，退出操作
    onMenuChange = ({item})=> {
        const {dispatch, doctorId} = this.props;
        if (item.props.eventKey == 5) {
            //退出操作
            this.logout();
        } else {
            let params = {
                id: doctorId,
                workingStatus: item.props.eventKey
            };
            dispatch(changeDoctorState(params)).then(()=> {
                if (this.props.result === 1) {
                    message.error('请求失败');
                }
            }, () => {
                message.error('请求失败');
            });
        }
    };

    render() {
        const {data = {}, message = []} = this.props;
        let newMessage = false;
        if (Array.isArray(message) && message.length > 0) {
            newMessage = true;
        }

        const informMenu = this.getInformMenu(message);
        const menu = this.getMenu();
        return (
            <div className={styles.user} id="headerUser">
                <Dropdown overlay={informMenu} getPopupContainer={()=>document.getElementById('headerUser')}>
                    <a className={styles.dropdown} href="javascript:void(0)">
                        <Icon type="notification"/>
                        {newMessage ? (<span className={styles.circle}></span>) : ""}
                    </a>
                </Dropdown>

                <Link activeClassName={styles.active} to="/editDoctor/0">
                    <span className={styles.avatar}>
                        <Image src={data.headPic+"@46h_46w_0e"} defaultImg={global.defaultDocHead}/>
                    </span></Link>
                <Dropdown overlay={menu} getPopupContainer={()=>document.getElementById('headerUser')}>
                    <a className={styles.dropdown} href="javascript:void(0)">
                        {this.state.menuName} <Icon type="down"/>
                    </a>
                </Dropdown>

            </div>
        );
    }
}
const mapStateToProps = (globalStore, ownProps) => {
    const {doctorStore, authStore, callStore}  = globalStore;

    return {
        data: Object.assign({}, doctorStore.data),
        doctorId: authStore.id,
        scheduletList: doctorStore.scheduletList,
        queue: doctorStore.queue,
        message: doctorStore.message,
        callState: callStore.callState
    };
};

export default withRouter(connect(mapStateToProps)(User));