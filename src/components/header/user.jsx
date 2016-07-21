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
import {
    changeDoctorState,
    getDoctorByUserId,
    getDoctorQueueCountByUserId,
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
        const {dispatch, doctorId = {}} = this.props;
        let dateInfo = global.getDateRange();
        dispatch(getDoctorByUserIdDate(doctorId, dateInfo.startTime, dateInfo.endTime));
        dispatch(getDoctorByUserId()).then(()=> {
            const {data = {}} = this.props;
            let doctorS = cookie.load('doctorStatu');
            if ((data.workingStatus || data.workingStatus === 0) && data.workingStatus !== 9 && !doctorS) {
                socket.receiveMessages();
            }
        });
    }

    state = {
        changeState: false,
        menuName: '在线'
    };

    logout() {
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


    onSettingClick(item) {
        if (item.key === '2') {
            this.logout();
        }
    }

    getMenu() {
        if (this.props) {
            let {data} = this.props;
            if (data && (data.workingStatus || data.workingStatus === 0)) {
                this.state.menuName = this.status[data.workingStatus];
                if (!(data.workingStatus === 9)) {
                    return (<Menu onClick={this.onMenuChange}>
                        <Menu.Item key="0" name="在线">
                            在线
                        </Menu.Item>
                        <Menu.Item key="2" name="忙碌">
                            忙碌
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item key="4" name="医助在线">医助在线</Menu.Item>
                    </Menu>);
                }
            }

        }
        return [];
    }

    constructor(props) {
        super(props);

        this.settingMenu = (<Menu onClick={::this.onSettingClick} className={styles.settingMenu}>
            {/* <Menu.Item key="1" name="锁屏">
             锁屏
             </Menu.Item>*/}
            <Menu.Item key="2" name="退出">
                退出
            </Menu.Item>
        </Menu>);
    }

    onMenuChange = ({item})=> {
        const {dispatch, doctorId} = this.props;
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


    };

    render() {
        const {data = {}} = this.props;
        const menu = this.getMenu();
        return (
            <div className={styles.user} id="headerUser">
                <Dropdown overlay={this.settingMenu} getPopupContainer={()=>document.getElementById('headerUser')}>
                    <a className={styles.dropdown} href="javascript:void(0)">
                        <Icon type="setting"/>
                    </a>
                </Dropdown>

                <Link activeClassName={styles.active} to="/editDoctor/0">
                    <span className={styles.avatar}>
                        <Image src={data.headPic+"@46h_46w_0e"} defaultImg={global.defaultDocHead}/>
                    </span></Link>

                {(this.state.menuName === '离线' || this.state.menuName === '占线') ? (
                    <span className={styles.dropOnly} href="javascript:void(0)">
                    {this.state.menuName}</span>)
                    : (<Dropdown overlay={menu} getPopupContainer={()=>document.getElementById('headerUser')}>
                    <a className={styles.dropdown} href="javascript:void(0)">
                        {this.state.menuName} <Icon type="down"/>
                    </a>
                </Dropdown>)}
            </div>
        );
    }
}
const mapStateToProps = (globalStore, ownProps) => {
    const {doctorStore, authStore}  = globalStore;

    return {
        data: Object.assign({}, doctorStore.data),
        doctorId: authStore.id,
        scheduletList: doctorStore.scheduletList,
        queue: doctorStore.queue
    };
};

export default withRouter(connect(mapStateToProps)(User));