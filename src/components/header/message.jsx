import styles from './header.less';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getDoctorQueueCountByUserId, getDoctorInquiryCountByUserId} from 'redux/actions/doctor';

class Message extends Component {
    componentDidMount() {
    this.getDoctorList();
}

    getDoctorList() {
        const {dispatch, doctorId} = this.props;
        dispatch(getDoctorQueueCountByUserId(doctorId));
        dispatch(getDoctorInquiryCountByUserId(doctorId));
    }

    render() {
        const {queue = {}, inquiry={}} = this.props;
        return (
            <div className={styles.message}>
                <span>排队人数：{queue.queueCount}</span>
                <span>今日已就诊：{inquiry.inquiryCount}</span>
            </div>
        );
    }
}

const mapStateToProps = (globalStore, ownProps) => {
    const {doctorStore, authStore}  = globalStore;
    return {
        queue: doctorStore.queue,
        inquiry: doctorStore.inquiry,
        doctorId: authStore.id
    };
};

export default connect(mapStateToProps)(Message);