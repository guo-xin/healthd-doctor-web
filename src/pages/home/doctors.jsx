import styles from './doctors.less';

import React, {Component} from 'react';
import {Button, Modal} from 'antd';
import {Link} from 'react-router';

import {connect} from 'react-redux';
import  * as global from 'util/global'
import socket from 'util/socket.jsx';
import {
    getDoctorAttendance,
    getDoctorStartInquery,
    getDoctorEndInquery
} from 'redux/actions/doctor';

const confirm = Modal.confirm;

class Doctors extends Component {

    showConfirm1() {
        confirm({
            title: '确认要开始出诊吗？',
            content: '出诊开始后，您需要尽量专注在此工作平台上',
            onOk: ()=> {
                const {dispatch} = this.props;
                dispatch(getDoctorStartInquery()).then((action)=> {
                    let result = (action.response || {}).result;
                    if (result === 0) {
                        socket.receiveMessages();
                    }
                });
            },
            onCancel: ()=> {
            }
        });
    }

    showConfirm2() {
        const {doctorId = {}, queue = {}, scheduleList = []}= this.props;
        let dateInfo = global.getDateRange();
        let content = "";
        let time = '';

        scheduleList.slice(0, 7).map((obj, index)=> {
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
                const {dispatch} = this.props;
                dispatch(getDoctorEndInquery()).then((action)=> {
                    let result = (action.response || {}).result;
                    if (result === 0) {
                        socket.seClose();
                    }
                });
            },
            onCancel: ()=> {
            }
        });
    }

    render() {
        const {data = {}} = this.props;
        return (
            <div className={styles.doctor}>
                <div className={styles.top}>
                    <Link activeClassName="active" to="/editDoctor/1">编辑
                        <img src={require('assets/images/edit.png')} alt=""/>
                    </Link>
                </div>
                <div className={styles.head}>
                    <div className={styles.title}>{data.name}</div>
                    <span>{data.department} | {data.jobTitle}</span>
                </div>
                <div className={styles.body}>
                    <p>简介：</p>
                    <span>{data.introduction}</span>
                    <p>擅长：</p>
                    <pre>{data.specialSkill}</pre>
                </div>
                <div className={styles.footer}>
                    {data.workingStatus == 9 ?
                        (<Button className={styles.btnWork} type="primary" size="large"
                                 onClick={()=>this.showConfirm1()}>出诊开始</Button>)
                        :
                        (<Button className={styles.btnWork+" "+ styles.endWork} type="primary" size="large"
                                 onClick={()=>this.showConfirm2()}>出诊结束</Button>)
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (globalStore, ownProps) => {
    const {doctorStore, authStore}  = globalStore;
    return {
        data: doctorStore.data,
        information: doctorStore.information,
        scheduleList: doctorStore.scheduleList,
        queue: doctorStore.queue,
        doctorId: authStore.id
    };
};


export default connect(mapStateToProps)(Doctors);