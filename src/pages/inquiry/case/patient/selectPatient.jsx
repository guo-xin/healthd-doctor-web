import React, {Component} from 'react';
import {Select, Icon, Timeline, Button, Spin} from 'antd';
import {withRouter} from 'react-router';
import styles from './selectPatient.less';

import {connect} from 'react-redux';
import Image from 'components/image/image.jsx';
import {getPatientsByUserId, setCurrentPatient} from 'redux/actions/patient';
import {getCasesByPatientId, setCurrentCase, appendCase} from 'redux/actions/case';
import * as global from 'util/global';

const Option = Select.Option;

class SelectPatient extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showTimeline: false,
            selectedPatient: {},
            loadingPatient: false,
            loadingCase: false
        };
    }

    componentDidMount() {
        let {userId, callState} = this.props;

        if (callState === 0) {
            if (userId && userId !== -1) {
                this.getPatientsList(userId);
            }
        }
    }

    //属性改变前调用
    componentWillReceiveProps(nextProps) {
        let nextUserId = nextProps.userId;
        let nextCallState = nextProps.callState;
        let count = nextProps.count;

        if (count !== this.props.count && nextCallState !== -1) {
            this.getPatientsList(nextUserId);
        }
    }

    getPatientsList(userId) {
        this.setState({
            loadingPatient: true
        });
        this.props.dispatch(getPatientsByUserId(userId)).then(
            ()=> {
                this.setState({
                    loadingPatient: false
                });
            },
            ()=> {
                this.setState({
                    loadingPatient: false
                });
            }
        );
    }

    getPatientHistoryCase(patient) {
        const {dispatch} = this.props;

        this.setState({
            loadingCase: true
        });

        dispatch(getCasesByPatientId(patient.id)).then(
            ()=> {
                this.setState({
                    loadingCase: false,
                    showTimeline: true
                });
            },
            ()=> {
                this.setState({
                    loadingCase: false,
                    showTimeline: true
                });
            }
        );
    }

    handleChange(value) {
        //新建患者
        if (value == 'new') {
            this.props.dispatch(setCurrentPatient({
                patientId: null,
                state: -1
            }));
            this.props.router.push('/inquire/case/patient');
        } else {
            let {patientList = []} = this.props;
            let len = patientList.length, item;

            for (let i = 0; i < len; i++) {
                if (patientList[i].id === value) {
                    item = patientList[i];
                    break;
                }
            }

            this.state.selectedPatient = item;

            //是否存在历史病历
            if (item && item.historyCaseCount && item.historyCaseCount !== 0) {
                this.getPatientHistoryCase(item);
            } else {
                this.addNewCase();
            }
        }

    }

    addNewCase() {
        let {selectedPatient} = this.state;
        let {dispatch, router}= this.props;

        dispatch(setCurrentCase({
            userId: selectedPatient.userId,
            caseId: null,
            patientId: selectedPatient.id,
            state: -1 // -1：新建， 1：已存在
        }));

        router.push(`/inquire/case/detail`);
    }

    appendCase(item) {
        let {selectedPatient} = this.state;
        let {inquiryCallType, dispatch, router, callType} = this.props;
        
        dispatch(setCurrentCase({
            caseId: item.id,
            userId: selectedPatient.userId,
            patientId: selectedPatient.id,
            inquiryId: item.inquiryId,
            state: item.status // -1：新建， 1：已存在
        }));

        dispatch(appendCase({
            inquiryId: item.inquiryId,
            inquiryCallType: inquiryCallType,
            callType: callType + 1
        }));

        router.push(`/inquire/case/detail`);
    }

    getDiagnosis(list = []) {
        const diagnosis = list.map((item, index)=> {
            let children = item.children, subList;

            if (children) {
                subList = children.map((subItem, subIndex)=> {
                    return <span key={subIndex}>{subItem.diagnosisName || '--'}</span>
                });
            }

            return (
                <li key={index}>
                    <span>
                        {item.diagnosisName || '--'}
                    </span>
                    {subList}
                </li>
            );
        });

        return (
            <ol>
                {diagnosis}
            </ol>
        );
    }

    render() {
        let cases = [];
        const {user, patientList, relatedCases, doctorId} = this.props;
        const {showTimeline, selectedPatient} = this.state;

        if (Array.isArray(relatedCases[selectedPatient.id])) {
            cases = relatedCases[selectedPatient.id];
        }

        let lineData = [], len, timeLine;
        if (cases.length > 0) {
            lineData = cases.concat([{}]);
            len = lineData.length;

            timeLine = (<Timeline>
                {lineData.map((item, index)=> {
                    return (index < len - 1 ?
                            (<Timeline.Item key={index}>
                                <div className={styles.pointText}>第{len - index - 1}次问诊</div>
                                <div className="point-content">
                                    <div className={styles.card}>
                                        <div className={styles.cardBody}>
                                            <div className="pic">
                                            <span> <Image src={item.head || global.defaultHead}
                                                          defaultImg={global.defaultHead}></Image></span>
                                            </div>
                                            <div className="detail">
                                                <div className="top">
                                                    <span className="name">患者：{selectedPatient.realName}</span>
                                                    <span
                                                        className="age">{global.getAge(selectedPatient.birthday, item.createdTime)}</span>
                                                    <span
                                                        className="serial">ID:{global.formatPatientCode(item.patientCode)}</span>
                                                <span className="gender"><img
                                                    src={global.getGenderUrl(item.sex)} alt=""/></span>
                                                </div>
                                                <div className="middle">
                                                    <ul>
                                                        <li>主诉：{item.illnessState || '--'}</li>
                                                        <li>诊断：{this.getDiagnosis(item.caseDiagnosisTree)}</li>
                                                    </ul>
                                                </div>
                                                {
                                                    (item.status === 1 && item.doctorId === doctorId ) &&
                                                    <div className="bottom">
                                                        <Button type="primary"
                                                                onClick={()=>this.appendCase(item)}>追加问诊</Button>
                                                    </div>
                                                }

                                            </div>
                                        </div>
                                        <div className={styles.cardFooter + " clearfix"}>
                                        <span
                                            className={styles.footText}>问诊时间：{global.formatDate(item.createdTime, 'yyyy-MM-dd HH:mm')}</span>
                                        <span
                                            className={styles.footTextRight}>{item.status === 2 ? '归档' : '保存'}时间：{global.formatDate(item.updateTime, 'yyyy-MM-dd HH:mm')}</span>
                                        </div>
                                    </div>
                                </div>
                            </Timeline.Item>)
                            :
                            (<Timeline.Item key={index}>
                                <div className={styles.pointText}>添加信息</div>
                            </Timeline.Item>)
                    );
                })}
            </Timeline>);
        }

        const options = patientList.map((item)=> {
            return (
                <Option key={item.id} value={item.id}>
                    <span className="name">{item.realName}</span>
                    <span className="age">{global.getAge(item.birthday)}</span>
                    <span className="relationship">{global.getRelationText(item.relation)}</span>
                    <span className="gender">
                        <img src={global.getGenderUrl(item.sex)} alt=""/>
                    </span>
                </Option>
            );
        });

        if (patientList.length < 5) {
            options.push(
                <Option key="new" value="new"><Icon type="plus"/>添加患者</Option>
            );
        }

        return (
            <div className={styles.wrapper}>
                <div className="panel">
                    <div className={styles.panelHead}>
                        <div className={styles.panelTitle}>
                            <img className="icon"
                                 src={require('assets/images/text.png')}
                                 alt=""/>用户信息
                        </div>
                    </div>
                    <div className={styles.panelBody}>
                        <Spin spinning={this.state.loadingPatient}>
                            <div className={styles.pic}>
                            <span>
                                <Image src={user.headPic || global.defaultHead} defaultImg={global.defaultHead}></Image>
                            </span>
                            </div>
                            <div className={styles.detail}>
                                <div>
                                    <span className="name">用户姓名：{user.userName || '--'}</span>
                                    <span className="age">{user.age || '--'}岁</span>
                                    <span className="serial">ID:{user.userId || '--'}</span>
                                <span className="gender">
                                    <img src={global.getGenderUrl(user.sex)} alt=""/>
                                </span>
                                </div>
                                <div>用户问诊次数：{user.inquiryCount || '--'}次</div>
                                <div id="selectCtrlPatient" className={styles.selectCtrlPatient}>
                                    选择患者信息：<Select style={{ width: 300 }} defaultValue="请选择"
                                                   onChange={(v)=>this.handleChange(v)}
                                                   className="select-ctrl-patient"
                                                   getPopupContainer={()=>document.getElementById("selectCtrlPatient")}>
                                    {options}
                                </Select>
                                </div>
                            </div>
                        </Spin>

                    </div>
                    <div className={styles.panelHead}>
                        <div className={styles.panelTitle}><img src={require('assets/images/text.png')}
                                                                alt=""/>问诊记录
                        </div>
                    </div>

                    <div className={styles.panelBody}>
                        <Spin spinning={this.state.loadingCase}>
                            {showTimeline ? <Button className={styles.addCase} type="primary" size="large"
                                                    onClick={()=>this.addNewCase()}>新加问诊</Button> :
                                <p className={styles.tip}>请选择患者信息</p> }
                            {showTimeline && timeLine}
                        </Spin>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (globalStore) => {
    const {patientStore, callStore, userStore, authStore}  = globalStore;

    let patientList,
        callState = callStore.callState,
        userId = callStore.incomingUserId,
        user = callStore.incomingUser,
        count = callStore.incomingCount,
        relatedPatients = userStore.relatedPatients,
        relatedCases = Object.assign({}, patientStore.relatedCases);

    patientList = relatedPatients[userId] || [];

    return {
        doctorId: authStore.id,
        count: count,
        userId: userId,
        user: user,
        callState: callState,
        callType: callStore.callType,
        inquiryCallType: callStore.inquiryCallType,
        patientList: patientList,
        relatedCases: relatedCases
    };
};


SelectPatient = connect(mapStateToProps)(SelectPatient);

export default withRouter(SelectPatient);

