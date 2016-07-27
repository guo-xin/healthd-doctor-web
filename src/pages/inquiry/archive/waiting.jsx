import React from 'react';
import {Row, Col, Button, message, Spin} from 'antd';
import DisplayMode from './components/displayMode';
import styles from './archive.less';
import Image from 'components/image/image.jsx';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {getInquireQueue} from 'redux/actions/inquire';
import {showCallbackDialog, setCallbackUserId} from 'redux/actions/call';
import * as global from 'util/global';

class Waiting extends React.Component {
    state = {
        loading: true
    };

    componentWillMount() {
        const {dispatch} = this.props;

        dispatch(getInquireQueue()).then(
            ()=> {
                this.setState({loading: false});
            },
            ()=> {
                this.setState({loading: false});
            }
        );
    }

    onMouseEnter(e) {
        // console.log(e.target.className);

    }

    onCallBack(data, callType) {
        let item = Object.assign({}, data);

        if (item.userMobilePhone) {
            let {dispatch} = this.props;
            dispatch(setCallbackUserId(item.userId, item));

            let st = setTimeout(()=> {
                clearTimeout(st);
                st = null;
                dispatch(showCallbackDialog(true, callType));
            }, 50);

        }
        else {
            message.error('患者信息有误，请联系运营人员。');
        }
    }

    render() {
        let list = this.props.list.map((data, index)=> {
            let item = data;
            return (
                <Col key={index} span="8" className="item" onMouseEnter={(e)=>this.onMouseEnter(e)}>
                    <div className={styles.card}>
                        <div className={styles.cardBody}>
                            <div className="pic">
                                <span>
                                    <Image src={item.head || global.defaultHead} defaultImg={global.defaultHead}/>
                                </span>
                            </div>
                            <div className="detail">
                                <div className="top">
                                    <span className="name">患者：{item.realName || '--'}</span>
                                    <span className="age">{global.getAge(item.birthday)|| '--'}岁</span>
                                    <span
                                        className="serial">ID:{global.formatPatientCode(item.patientCode) || '--'}</span>
                                    <span className="gender" style={{display:'none'}}>
                                        <img src={global.getGenderUrl(item.sex)} alt=""/>
                                    </span>
                                </div>
                                <div className="middle clearfix">
                                    <ul>
                                        <li className="patientName">问诊人：{data.userName || '--'}</li>
                                        <li>与问诊人关系：{global.getRelationText(item.relation) || '--'}</li>
                                        <li className="lastInquery">上次诊断：{item.diagnosisName || '--'}</li>
                                    </ul>
                                </div>
                                <div className="bottom">
                                    <Button type="ghost" onClick={()=>this.onCallBack(data, 0)}>电话回呼</Button>
                                    <Button type="primary" onClick={()=>this.onCallBack(data, 1)}>视频回呼</Button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.cardFooter}>
                            <span
                                className={styles.footText}>上次问诊：{item.diagnosisName ? (item.createdTime && global.formatDate(item.createdTime, 'yyyy-MM-dd HH:mm') || '--') : '--'}</span>
                            <span
                                className={styles.footTextOrange}>等待{global.formatTime(item.timeCount) || '--'}</span>
                        </div>
                    </div>
                </Col>
            );
        });

        return (
            <div>
                <div className={styles.top}>
                    <DisplayMode displayType="1"/>
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
    const {inquireStore}  = globalStore;


    return {
        list: inquireStore.queue
    };
};


export default withRouter(connect(mapStateToProps)(Waiting));