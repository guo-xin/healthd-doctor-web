import React from 'react';
import {Row, Col, Button, Popover, Spin} from 'antd';
import DisplayMode from './components/displayMode';
import styles from './archive.less';
import Image from 'components/image/image.jsx';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {getTodoCasesByDoctorId, setCurrentCase} from 'redux/actions/case';
import * as global from 'util/global';

class Todo extends React.Component {
    state = {
        loading: true
    };

    componentDidMount() {
        this._isMounted = true;
        const {dispatch, id} = this.props;

        if (id) {
            dispatch(getTodoCasesByDoctorId(id)).then(
                ()=> {
                    this.changeState(false);
                },
                ()=> {
                    this.changeState(false);
                }
            );
        }

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    changeState(flag) {
        if (this._isMounted) {
            this.setState({loading: flag});
        }
    }

    onPerfectCase(item) {
        let {router, dispatch} = this.props;

        dispatch(setCurrentCase({
            inquiryInfoId: item.inquiryInfoId,
            userId: item.userId,
            patientId: item.patientId,
            caseId: item.id,
            inquiryId: item.inquiryId,
            state: 1
        }));

        router.push(`/inquire/case/detail`);
    }

    render() {
        const {todoCases = {}} = this.props;
        let results = todoCases.results || [], list = [];
        Array.isArray(results) && ( list = results.map((item, index) => {
            if(!item.inquiryId){
                return;
            }
            return (
                <Col key={index} span="8" className="item">
                    <div className={styles.card}>
                        <div className={styles.cardBody}>
                            <div className="pic">
                                <span>
                                     <Image src={item.head || global.defaultHead}
                                            defaultImg={global.defaultHead}></Image>
                                </span>
                            </div>
                            <div className="detail">
                                <div className="top">
                                    <span className="name">患者：{item.realName}</span>
                                    <span className="age">{global.getAge(item.birthday, item.createdTime)}</span>
                                    <span className="serial">ID:{global.formatPatientCode(item.patientCode)}</span>
                                    <span className="gender"><img src={global.getGenderUrl(item.sex)} alt=""/></span>
                                </div>
                                <div className="middle clearfix">
                                    <ul>
                                        <li className="patientName">
                                            问诊人：{item.userName || item.userMobilePhone || '--'}</li>
                                        <li>与问诊人关系：{global.getRelationText(item.relation)}</li>
                                        <li>就诊次数：第{item.caseCount || 0}次</li>
                                        <li className="lastInquery">本次诊断：{item.diagnosisName || '--'}</li>
                                    </ul>
                                </div>

                            </div>

                            <div className="bottom">
                                {item.operatorRoleCode == 105 && (
                                    <Popover content={'医助编辑'} title="" overlayClassName="assistant">
                                        <Button type="primary" shape="circle">助</Button>
                                    </Popover>
                                )}
                                <Button type="primary" onClick={()=>this.onPerfectCase(item)}>继续完善</Button>
                            </div>

                        </div>
                        <div className={styles.cardFooter + " clearfix"}>
                            <span
                                className={styles.footText}>问诊时间：{global.formatDate(item.createdTime, 'yyyy-MM-dd HH:mm')}</span>
                            <span
                                className={styles.footTextRight}>保存时间：{global.formatDate(item.updateTime, 'yyyy-MM-dd HH:mm')}</span>
                        </div>
                    </div>
                </Col>
            );
        }));

        return (
            <div>
                <div className={styles.top}>
                    <DisplayMode displayType="1"></DisplayMode>
                </div>

                <Spin spinning={this.state.loading} tip={global.loadingTip} className="panel">
                    <div className={styles.cardList}>
                        {list.length > 0 && (
                            <Row>
                                {list}
                            </Row>
                        )}

                        {(!this.state.loading && list.length == 0) && <div className="noData">{global.noData}</div>}
                    </div>
                </Spin>

            </div>
        );
    }
}


const mapStateToProps = (globalStore) => {
    const {caseStore, authStore}  = globalStore;

    return {
        todoCases: caseStore.todoCases,
        id: authStore.id
    };
};


Todo = connect(mapStateToProps)(Todo);

export default withRouter(Todo);