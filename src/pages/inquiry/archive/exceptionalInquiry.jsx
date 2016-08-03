import React from 'react';
import {Row, Col, Button, message, Spin, Icon} from 'antd';
import DisplayMode from './components/displayMode';
import styles from './archive.less';
import Image from 'components/image/image.jsx';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {getInquireQueueException, getMaterialBeforeCase} from 'redux/actions/inquire';
import {showCallbackDialog, setCallbackUserId} from 'redux/actions/call';
import * as global from 'util/global';
import PictureViewer from 'components/dialogs/pictureViewer';

class ExceptionalInquiry extends React.Component {
    state = {
        loading: true,
        callTime: false,
        selectedCardId: null
    };

    componentWillMount() {
        const {dispatch} = this.props;

        dispatch(getInquireQueueException()).then(
            ()=> {
                this.setState({loading: false});
            },
            ()=> {
                this.setState({loading: false});
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

                this.setState({
                    timestamp: new Date().valueOf()
                });
            },
            ()=> {
                item.isLoading = false;

                this.setState({
                    timestamp: new Date().valueOf()
                });
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
                let pics = paths.map((item, index)=> {
                    if (item) {
                        return <img key={index} src={item+"@80h_80w_0e"} alt=""  onClick={()=>this.checkPics(material.savePath, index)}/>;
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
        }
    }

    checkPics(list=[], index){
        let comp = this.refs.picViewer;
        
        if(comp){
            comp.setData(list, true, index);
        }
    }

    render() {
        let status = {
            '1': '挂断',
            '2': '挂断',
            '3': '挂断',
            '4': '挂断',
            '-1': '挂断',
            '-2': '未呼通',
            '-3': '挂断',
            '-4': '拒接',
            '-5': '拒接',
            '-8': '未呼通',
            '-9': '拒接',
            '-10': '挂断',
            '-12': '未呼通',
            '-14': '挂断'
        };

        let selectedCardId = this.state.selectedCardId;
        let listMap = {
            list0: [],
            list1: [],
            list2: []
        };
        let list = this.props.list.map((item, index)=> {
            let callStatus = status[item.byeType + ''];
            let inqueryType = '';
            if (item.inquiryCallType === 1) {
                if (item.byeType === -3 || item.byeType === -5 || item.byeType > 0) {
                    inqueryType = <Icon type="arrow-down"/>;
                    this.state.callTime = true;
                } else {
                    inqueryType = <Icon type="arrow-down" className={styles.textRed}/>;
                    this.state.callTime = false;
                }
            } else {
                if (item.byeType === -3 || item.byeType === -5 || item.byeType > 0) {
                    inqueryType = <Icon type="arrow-up"/>;
                    this.state.callTime = true;
                } else {
                    inqueryType = <Icon type="arrow-up" className={styles.textRed}/>;
                    this.state.callTime = false;
                }
            }

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
                                    <li className="patientName">问诊人：{item.userName || item.userMobilePhone || '--'}</li>
                                    <li>与问诊人关系：{global.getRelationText(item.relation) || '--'}</li>
                                    <li className="lastInquery" style={{width:"100%"}}>
                                        上次诊断：{item.diagnosisName || '--'}</li>
                                </ul>
                            </div>
                            <div className="bottom">
                                <Button type="ghost" onClick={()=>this.onCallBack(item, 0)}>电话回呼</Button>
                                <Button type="primary" onClick={()=>this.onCallBack(item, 1)}>视频回呼</Button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.cardFooter}>
                            <span className={styles.footText}>
                                {inqueryType}
                                {item.callType === 1 ? ("电话问诊：") : ("视频问诊：")}{item.startTime && global.formatDate(item.startTime, 'yyyy-MM-dd HH:mm')}
                            </span>
                        <span className={styles.footTextRed}>{callStatus}</span>
                        {this.state.callTime ? (<span
                            className={styles.footTextRed}>{item.callType === 1 ? ("通话") : ("视频")}{global.formatTime((item.endTime - item.startTime) / 1000) + "　"}</span>) : ""}
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
            </div>;

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
    const {inquireStore, callStore}  = globalStore;

    return {
        isShowCallingDialog: callStore.isShowCallingDialog,
        list: inquireStore.queueException
    };
};


ExceptionalInquiry = connect(mapStateToProps)(ExceptionalInquiry);

export default withRouter(ExceptionalInquiry);