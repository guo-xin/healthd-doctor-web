import React, {Component} from 'react';
import {Tabs, Icon} from 'antd';
import styles from './describe.less';
import {connect} from 'react-redux';
import * as global from 'util/global';
import {
    getPatientAllPicture,
    setInquiryPictureRead,
    getInquiryAllPicture
} from 'redux/actions/tool';
import {getDoctorPictureMessage} from 'redux/actions/doctor';

const TabPane = Tabs.TabPane;

class Describe extends Component {
    state = {
        dialogShow: false,
        imgSrc: "",
        currentIndex: "",
        currentTab: true,
        pictureList: [],
        allList: [],
        pictureViewList: [],
        currentViewList: []
    };

    componentDidMount() {
        this.getDoctorList();
    }

    //页面加载时调用，默认加载本地图片
    getDoctorList(props) {
        const {dispatch, currentCase = {}} = props || this.props;

        if (currentCase.caseId || currentCase.inquiryInfoId) {
            dispatch(getInquiryAllPicture(currentCase.caseId, currentCase.inquiryInfoId)).then((action)=> {
                let currentList = action.response.data || {};
                let list = [];

                if (currentList.historyCaseList && currentList.historyCaseList.length > 0) {
                    list = list.concat(currentList.historyCaseList.slice());
                }

                if (currentList.preList && currentList.preList.length > 0) {
                    list = list.concat(currentList.preList.slice());
                }


                this.setState({
                    allList: list
                })
            });
        }
    }

    //页面重新渲染
    componentWillReceiveProps(nextProps) {
        if (nextProps.toolType === 2) {
            if (nextProps.currentCase && this.props.currentCase && (nextProps.currentCase.caseId != this.props.currentCase.caseId
                || nextProps.currentCase.inquiryInfoId != this.props.currentCase.inquiryInfoId)) {

                this.setState({
                    pictureList: [],
                    allList: []
                });

                if (this.state.currentTab) {
                    this.getDoctorList(nextProps);
                } else {
                    this.getPictureList2(nextProps);
                }
            }
        }
    }

    //本次图片与所有图片的切换
    onTabChange(key) {
        if (key == 2) {
            this.state.currentTab = false;
            this.getPictureList2();
        } else {
            this.getDoctorList();
            this.state.currentTab = true;
        }
    }

    //获取患者全部图片列表
    getPictureList2(nextProps) {
        const {currentCase={}} = nextProps || this.props;
        if (currentCase.patientId) {
            this.props.dispatch(getPatientAllPicture(currentCase.patientId)).then((action)=> {
                this.setState({
                    pictureList: action.response.data || []
                })
            });
        }
    }

    //点击图片,放大功能
    bigPicture(href, index, msgIndex) {
        if (this.state.currentTab) {
            let {dispatch, doctorId} = this.props;
            let item = this.state.allList[msgIndex];

            if (item.inquiryType !== 1 && item.status === 0) {
                item.status = 1;
                dispatch(setInquiryPictureRead(item.messageInfoId)).then(()=> {
                    dispatch(getDoctorPictureMessage(doctorId));
                });
            }

        }

        this.setState({
            dialogShow: true,
            imgSrc: href,
            currentIndex: index
        });
    }

    //点击弹出层
    dialogClick() {
        this.setState({
            dialogShow: false
        });
    }

    //点击图片区域,防止冒泡事件
    pictureClick(event) {
        event.stopPropagation();
    }

    //关闭按钮
    dialogClose() {
        this.setState({
            dialogShow: false
        });
    }

    //上一张
    previous() {
        let {pictureViewList=[], currentViewList=[], currentTab} = this.state;
        let list = currentTab ? currentViewList : pictureViewList;
        let index = this.state.currentIndex - 1;

        if (index < 0) {
            index = list.length - 1;
        }

        let item = list[index];

        if (currentTab) {
            let {dispatch, doctorId} = this.props;
            let msg = this.state.allList[item.msgIndex];

            if (msg.inquiryType !== 1 && msg.status === 0) {
                msg.status = 1;
                dispatch(setInquiryPictureRead(msg.messageInfoId)).then(()=> {
                    dispatch(getDoctorPictureMessage(doctorId));
                });
            }
        }

        this.setState({
            imgSrc: item.url,
            currentIndex: index
        });
    }

    //下一张
    last() {
        let {pictureViewList=[], currentViewList=[], currentTab} = this.state;
        let list = currentTab ? currentViewList : pictureViewList;
        let index = this.state.currentIndex + 1;


        if (index > list.length - 1) {
            index = 0;
        }

        let item = list[index];

        if (currentTab) {
            let {dispatch, doctorId} = this.props;
            let msg = this.state.allList[item.msgIndex];

            if (msg.inquiryType !== 1 && msg.status === 0) {
                msg.status = 1;
                dispatch(setInquiryPictureRead(msg.messageInfoId)).then(()=> {
                    dispatch(getDoctorPictureMessage(doctorId));
                });
            }
        }

        this.setState({
            imgSrc: item.url,
            currentIndex: index
        });
    }

    //图片列表
    imgList(data, msgIndex, tab) {
        let list = data.attachments;
        let viewList = tab === 0 ? this.state.currentViewList : this.state.pictureViewList;

        if (list && list.length > 0) {
            let imgList = list.map((item, index)=> {
                if (item.savePath) {
                    viewList.push({
                        url: item.savePath,
                        msgIndex: msgIndex
                    });

                    let imgIndex = viewList.length - 1;

                    return (
                        <img key={index} src={item.savePath+"@80h_80w_0e"} alt=""
                             onClick={()=>this.bigPicture(item.savePath, imgIndex, msgIndex)}/>)
                } else {
                    return null;
                }

            });

            return <div className={styles.pictureList}>{imgList}</div>
        }
        else {
            return null;
        }
    }

    //图片信息列表
    formatMessage(list = [], tab) {
        let pictureList;
        let createdTime;
        let time = new Date().getTime();
        let preTime;
        let currentTime = global.formatDate(time, 'yyyy-MM-dd');

        if (tab == 0) {
            this.state.currentViewList = [];
        }

        if (tab == 1) {
            this.state.pictureViewList = [];
        }

        if (Array.isArray(list) && list.length > 0) {
            pictureList = list.map((item, index)=> {


                let flag = false;
                let isSameDay = false;

                if (item.inquiryType !== 1 && item.status === 0) {
                    flag = true;
                }

                createdTime = global.formatDate(item.updateTime, 'yyyy-MM-dd');
                let hourTime = global.formatDate(item.updateTime, 'HH:mm');

                if (createdTime === preTime) {
                    isSameDay = true;
                }

                preTime = createdTime;

                let date = (index == 0 && currentTime === createdTime) ? "今日" : createdTime;
                let formattedList = this.imgList(item, index, tab);

                return (
                    <div className={styles.part} key={index}>
                        {!isSameDay && <div className={styles.date}>{date}</div>}
                        <div className={styles.time}>{hourTime}{flag ? (
                            <span className={styles.read}>新</span>) : ""}</div>
                        <div className={styles.description}>{item.description}</div>
                        {formattedList}
                    </div>
                );

            });
        }

        return pictureList;
    }

    render() {
        let {allList = {}, pictureList=[]} = this.state;

        let pictureList1 = this.formatMessage(allList, 0);
        let pictureList2 = this.formatMessage(pictureList, 1);

        return (
            <div className={styles.wrapper}>
                <Tabs defaultActiveKey="1" onChange={::this.onTabChange}>
                    <TabPane tab="本 次" key="1">
                        <div className={styles.panelBody}>
                            {pictureList1}
                            {allList.length === 0 && <div>暂无图片</div>}
                        </div>
                        {this.state.dialogShow ? (<div className={styles.dialogModal} onClick={()=>this.dialogClick()}>
                            <div className={styles.dialogPicture} onClick={(e)=>this.pictureClick(e)}>
                                <div className={styles.dialogClose} onClick={()=>this.dialogClose()}>
                                    <span><Icon type="cross"/></span>
                                </div>
                                <img src={this.state.imgSrc+"@540h_540w_0e"}/>
                                <div className={styles.dialogButton}>
                                    <div className={styles.dialogFonter} onClick={()=>this.previous()}><img
                                        src={require("assets/images/previous.png")}/></div>
                                    <div className={styles.dialogFonter} onClick={()=>this.last()}><img
                                        src={require("assets/images/last.png")}/></div>
                                </div>
                            </div>
                        </div>) : ""}
                    </TabPane>

                    <TabPane tab="所 有" key="2">
                        <div className={styles.panelBody}>
                            {pictureList2}
                            {pictureList.length === 0 && <div>暂无图片</div>}
                        </div>
                        {this.state.dialogShow ? (<div className={styles.dialogModal} onClick={()=>this.dialogClick()}>
                            <div className={styles.dialogPicture} onClick={(e)=>this.pictureClick(e)}>
                                <div className={styles.dialogClose} onClick={()=>this.dialogClose()}>
                                    <span><Icon type="cross"/></span>
                                </div>
                                <img src={this.state.imgSrc+"@540h_540w_0e"}/>
                                <div className={styles.dialogButton}>
                                    <div className={styles.dialogFonter} onClick={()=>this.previous()}><img
                                        src={require("assets/images/previous.png")}/></div>
                                    <div className={styles.dialogFonter} onClick={()=>this.last()}><img
                                        src={require("assets/images/last.png")}/></div>
                                </div>
                            </div>
                        </div>) : ""}
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

const mapStateToProps = (globalStore) => {
    const {authStore, caseStore}  = globalStore;

    return {
        doctorId: authStore.id,
        currentCase: caseStore.currentCase
    };
};

export default connect(mapStateToProps)(Describe);