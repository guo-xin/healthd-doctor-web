import React from 'react';
import {Row, Col, Button, message, Spin, Icon} from 'antd';
import DisplayMode from './components/displayMode';
import styles from './archive.less';
import Image from 'components/image/image.jsx';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {getInquireQueue, getMaterialBeforeCase} from 'redux/actions/inquire';
import {showCallbackDialog, setCallbackUserId} from 'redux/actions/call';
import * as global from 'util/global';
import PictureViewer from 'components/dialogs/pictureViewer';

class Waiting extends React.Component {
    state = {
        loading: true,
        selectedCardId: null
    };

    componentWillMount() {
        const {dispatch} = this.props;

        dispatch(getInquireQueue()).then(
            ()=> {
                if (this._isMounted) {
                    this.setState({loading: false});
                }
            },
            ()=> {
                if (this._isMounted) {
                    this.setState({loading: false});
                }
            }
        );
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isShowCallingDialog && nextProps.isShowCallingDialog !== this.props.isShowCallingDialog) {
            let comp = this.refs.picViewer;
            if (comp) {
                comp.setVisible(false);
            }
        }
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onCallBack(data, callType) {
        let item = Object.assign({}, data);

        if (item.userMobilePhone) {
            let {dispatch, doctor} = this.props;

            if (doctor.workingStatus == 2 || doctor.workingStatus == 9) {
                message.error('离线或忙碌状态不可以呼叫患者！');
                return;
            }
            
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

    toggleMaterial(item) {
        let selectedCardId = this.state.selectedCardId;
        if (item.id != selectedCardId) {
            if (item.isLoading === undefined && item.inquiryInfoId) {
                item.isLoading = true;
                this.getMaterial(item);
            }

            this.setState({
                selectedCardId: item.id
            });

        } else {
            this.setState({
                selectedCardId: null
            });
        }
    }

    getMaterial(item) {
        this.props.dispatch(getMaterialBeforeCase({
            inquiryInfoId: item.inquiryInfoId
        })).then(
            (action)=> {
                let data = (action.response || {}).data;

                item.isLoading = false;

                if (data) {
                    item.material = data;
                }

                if (this._isMounted) {
                    this.setState({
                        timestamp: new Date().valueOf()
                    });
                }
            },
            ()=> {
                item.isLoading = false;

                if (this._isMounted) {
                    this.setState({
                        timestamp: new Date().valueOf()
                    });
                }
            }
        );
    }

    formatMaterial(item) {
        if (item.isLoading === true) {
            return <span className="loading">数据加载中...</span>
        } else {
            let material = item.material;
            if (material) {
                let des = material.description;
                let paths = material.savePath || [];

                if (des) {
                    let pics = paths.map((item, index)=> {
                        if (item) {
                            return <img key={index} src={item+"@80h_80w_0e"} alt=""
                                        onClick={()=>this.checkPics(material.savePath, index)}/>;
                        } else {
                            return null;
                        }
                    });

                    return (
                        <div>
                            <p>{des}</p>
                            {pics.length > 0 && <div className="picList">
                                {pics}
                            </div>}
                        </div>
                    );
                } else {
                    return <span className="empty">暂无描述</span>
                }
            } else {
                return <span className="empty">暂无描述</span>
            }
        }
    }

    checkPics(list = [], index) {
        let comp = this.refs.picViewer;

        if (comp) {
            comp.setData(list, true, index);
        }
    }

    render() {
        let selectedCardId = this.state.selectedCardId;
        let listMap = {
            list0: [],
            list1: [],
            list2: []
        };

        let list = this.props.list.map((data, index)=> {
            let item = data;
            let material = this.formatMaterial(item);
            let rt = <div key={index} className={"item columnItem" + (item.id==selectedCardId?(' '+styles.active):'')}>
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
                                <span className="age">{global.getAge(item.birthday) || '--岁'}</span>
                                    <span
                                        className="serial">ID:{global.formatPatientCode(item.patientCode) || '--'}</span>
                                    <span className="gender">
                                        <img src={global.getGenderUrl(item.sex)} alt=""/>
                                    </span>
                            </div>
                            <div className="middle clearfix">
                                <ul>
                                    <li className="patientName">问诊人：{data.userName || item.userMobilePhone || '--'}</li>
                                    <li>与问诊人关系：{global.getRelationText(item.relation) || '--'}</li>
                                    <li className="lastInquery" style={{width:"100%"}}>
                                        上次诊断：{item.diagnosisName || '--'}</li>
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
                                className={styles.footTextOrange}>等待{global.formatTime((item.currentTime - item.startTime) / 1000) || '--'}</span>
                    </div>

                    <div className={styles.material}>
                        <div className="title">
                            <a href="javascript: void(0)" onClick={()=>{this.toggleMaterial(item)}}>患者描述<Icon
                                type={item.id==selectedCardId?'up':'down'}/></a>
                        </div>
                        <div className="detail">
                            {material}
                        </div>
                    </div>
                </div>
            </div>

            listMap['list' + index % 3].push(rt);
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
                                <Col span="8">{listMap.list0}</Col>
                                <Col span="8">{listMap.list1}</Col>
                                <Col span="8">{listMap.list2}</Col>
                            </Row>
                        )}

                        {(!this.state.loading && list.length == 0) && <div className="noData">{global.noData}</div>}
                    </div>
                </Spin>

                <PictureViewer ref="picViewer"></PictureViewer>
            </div>
        );
    }
}


const mapStateToProps = (globalStore) => {
    const {inquireStore, callStore, doctorStore}  = globalStore;


    return {
        doctor: Object.assign({}, doctorStore.data),
        isShowCallingDialog: callStore.isShowCallingDialog,
        list: inquireStore.queue
    };
};


export default withRouter(connect(mapStateToProps)(Waiting));