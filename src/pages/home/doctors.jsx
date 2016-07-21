import styles from './doctors.less';

import React, {Component} from 'react';
import {Button, Modal} from 'antd';
import {Link} from 'react-router';

import {connect} from 'react-redux';
import cookie from 'react-cookie';
import  * as global from 'util/global'
import * as socket from 'util/socket.jsx';
import {
    getDoctorQueueCountByUserId,
    getDoctorAttendance,
    getDoctorByUserIdDate,
    getDoctorStartInquery,
    getDoctorEndInquery,
    getDoctorByUserId
} from 'redux/actions/doctor';

const confirm = Modal.confirm;

class Doctors extends Component {
    state = ({
        toggleInquery: true
    });

    componentDidMount() {
        this.getDoctorInquery();
    }

    getDoctorInquery() {
        let doctorS = cookie.load('doctorStatu');
        if (doctorS && doctorS.attendance === false) {
            this.setState({
                toggleInquery: false
            });
        } else {
            const {dispatch} = this.props;
            dispatch(getDoctorByUserId()).then(()=> {
                const {data = {}} = this.props;
                if ((data.workingStatus || data.workingStatus === 0) && data.workingStatus !== 9) {
                    this.setState({
                        toggleInquery: false
                    });
                }
            });
        }

    };
    

    showConfirm1() {
        confirm({
            title: '确认要开始出诊吗？',
            content: '出诊开始后，您需要尽量专注在此工作平台上',
            onOk: ()=> {
                const {dispatch} = this.props;
                dispatch(getDoctorStartInquery()).then(()=> {
                    if (this.props.result === 0) {
                        this.setState({
                            toggleInquery: false
                        });
                        socket.receiveMessages();
                        dispatch(getDoctorByUserId());
                    }
                });
            },
            onCancel: ()=> {
            }
        });
    }

    showConfirm2() {
        const {dispatch, doctorId = {}, queue = {}, scheduletList = []}= this.props;
        let dateInfo = global.getDateRange();
        let content = "";
        let time = '';
        dispatch(getDoctorByUserIdDate(doctorId, dateInfo.startTime, dateInfo.endTime));
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
                const {dispatch} = this.props;
                dispatch(getDoctorEndInquery()).then(()=> {
                    if (this.props.result === 0) {
                        this.setState({
                            toggleInquery: true
                        });

                        socket.seClose();
                        dispatch(getDoctorByUserId());
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
                    {this.state.toggleInquery ?
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
        result: doctorStore.result,
        scheduletList: doctorStore.scheduletList,
        queue: doctorStore.queue,
        doctorId: authStore.id
    };
};


export default connect(mapStateToProps)(Doctors);