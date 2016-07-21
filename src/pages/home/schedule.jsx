import React, {Component} from 'react';
import {Row, Col, Icon, Carousel} from 'antd';
import styles from './schedule.less';
import {connect} from 'react-redux';
import * as global from 'util/global';

import {getDoctorByUserIdDate} from 'redux/actions/doctor';

class Schedule extends Component {
    state = {
        isCurrentWeek: false
    };

    componentDidMount() {
        this.getScheduleList();
    }


    getFormattedTitle(startDate, endDate) {
        let title = '工作计划：';

        if (startDate && endDate) {
            let start = new Date(startDate);
            let end = new Date(endDate);

            title += global.formatDate(start, 'yyyy年MM月');

            if (start.getMonth() !== end.getMonth()) {
                if (start.getFullYear() === end.getFullYear()) {
                    title += global.formatDate(end, '-MM月');
                } else {
                    title += global.formatDate(end, '-yyyy年MM月');
                }

            }
        }

        return title;
    }

    getScheduleList() {
        const {dispatch, doctorId = {}} = this.props;
        let dateInfo = global.getDateRange();
        dispatch(getDoctorByUserIdDate(doctorId, dateInfo.startTime, dateInfo.endTime));
    }

    getPlans(plans) {
        if (Array.isArray(plans) && plans.length > 0) {
            let list = plans.map((plan, index)=> {
                let startTime = global.formatDate(plan.startTime, 'HH') + ":" + global.formatDate(plan.startTime, 'mm');
                let endTime = global.formatDate(plan.endTime, 'HH') + ":" + global.formatDate(plan.endTime, 'mm');

                return (<li key={index}>{plan.worktimeDesc} {startTime + "-" + endTime}</li>);
            });
            return (
                <ul>
                    {list}
                </ul>
            );
        } else {
            return (<div className={styles.action}><p>无计划</p></div>);
        }
    }

    changePlans(plans) {
        let num = false;
        if (Array.isArray(plans) && plans.length > 0) {
            let list = plans.map((plan, index)=> {
                if (plan.content.indexOf("增加") < 0) {
                    num = true;
                    return (<li key={index}>{plan.content}工作计划</li>);
                } else {
                    return;
                }

            });

            if (num) {
                return (
                    <ul>
                        {list}
                    </ul>
                );
            } else {
                return (<div className={styles.action}><p>暂无计划变更</p></div>);
            }

        } else {
            return (<div className={styles.action}><p>暂无计划变更</p></div>);
        }
    }

    render() {
        const {data = []} = this.props;
        const week = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

        let curTitle, nextTitle;

        if (data && data[0] && data[6]) {
            curTitle = this.getFormattedTitle(data[0].currentDay, data[6].currentDay);
        }

        if (data && data[7] && data[13]) {
            nextTitle = this.getFormattedTitle(data[7].currentDay, data[13].currentDay);
        }

        let scheduleList1 = data.slice(0, 7).map((item, index)=> {
            let currentDay = item.currentDay.split("-")[1] + "月" + item.currentDay.split("-")[2] + "日";
            let dateInfo = global.getDateRange();

            if (index === dateInfo.weekday - 1) {
                return <Col className={styles.current+" "+styles.item} key={index}>
                    <div>
                        <div className={styles.date}><p className={styles.week}>{week[index]}</p><p>今天</p></div>
                        <div className={styles.schedule}>
                            {this.getPlans(item.schedulingList)}
                        </div>
                        <div className={styles.change}>
                            {this.changePlans(item.schedulingHistoryList)}
                        </div>
                    </div>
                </Col>
            } else {
                return <Col className={styles.item} key={index}>
                    <div>
                        <div className={styles.date}><p className={styles.week}>{week[index]}</p><p>{currentDay}</p>
                        </div>
                        <div className={styles.schedule}>
                            {this.getPlans(item.schedulingList)}
                        </div>
                        <div className={styles.change}>
                            {this.changePlans(item.schedulingHistoryList)}
                        </div>
                    </div>
                </Col>
            }
        });
        let scheduleList2 = data.slice(7, 14).map((item, index)=> {
            let currentDay = item.currentDay.split("-")[1] + "月" + item.currentDay.split("-")[2] + "日";
            let schedulingFlag = (item.schedulingFlag === 1 ? "" : "无计划");

            return <Col className={styles.item} key={index}>
                <div>
                    <div className={styles.date}><p className={styles.week}>{week[index]}</p><p>{currentDay}</p></div>
                    <div className={styles.schedule}>
                        {this.getPlans(item.schedulingList)}
                    </div>
                    <div className={styles.change}>
                        {this.changePlans(item.schedulingHistoryList)}
                    </div>
                </div>
            </Col>
        });

        return (
            <div className={styles.panel}>
                <div className={styles.panelTitle}>
                    {this.state.isCurrentWeek ? <span>{nextTitle}</span> : <span>{curTitle}</span>}
                    <a href="javascript:;" className={styles.next} onClick={e=>{
                        this.setState({
                            isCurrentWeek: !this.state.isCurrentWeek
                        });
                    }}>
                        {this.state.isCurrentWeek ? <span><Icon type='arrow-left'/>返回</span> :
                            <span><Icon type='arrow-right'/>查看下一周</span>}
                    </a>
                </div>
                <div className={styles.panelBody}>
                    <Carousel type="flex" dots={false} slickGoTo={this.state.isCurrentWeek?1:0} initialSlide={0} swipe={false}>
                        <div>
                            <Row type="flex">
                                {scheduleList1}
                            </Row>
                        </div>
                        <div>
                            <Row type="flex">
                                {scheduleList2}
                            </Row>
                        </div>
                    </Carousel>

                </div>
            </div>
        );
    }
}

const mapStateToProps = (globalStore, ownProps) => {
    const {doctorStore, authStore}  = globalStore;
    return {
        data: doctorStore.scheduletList,
        doctorId: authStore.id
    };
};


export default connect(mapStateToProps)(Schedule);