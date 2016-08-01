import React, {Component} from 'react';
import {Tabs, Icon} from 'antd';
import styles from './describe.less';
import {connect} from 'react-redux';
import * as global from 'util/global';
import {
    getPatientAllPicture,
    getCurrentInquiryPicture,
    setInquiryPictureRead,
    getInquiryForwardPicture
} from 'redux/actions/tool';
import {getDoctorPictureMessage} from 'redux/actions/doctor';

const TabPane = Tabs.TabPane;

class Describe extends Component {
    state = {
        dialogShow: false,
        imgSrc: "",
        currentIndex: "",
        currentTab: true,
        messageId: ''
    };

    componentDidMount() {
        this.getDoctorList();
    }

    getDoctorList() {
        const {dispatch, currentCase = {}} = this.props;

        if (currentCase.caseId) {
            dispatch(getCurrentInquiryPicture(currentCase.caseId));
        }
        if (currentCase.inquiryId) {
            dispatch(getInquiryForwardPicture(currentCase.inquiryId));
        }

    }

    //本次图片与所有图片的切换
    onTabChange(key) {
        if (key == 2) {
            this.state.currentTab = false;
            this.getPictureList2();
        } else {
            this.state.currentTab = true;
        }
    }

    //获取患者全部图片列表
    getPictureList2() {
        const {currentCase={}} = this.props;
        if (currentCase.patientId) {
            this.props.dispatch(getPatientAllPicture(currentCase.patientId));
        }
    }

    //点击图片
    bigPicuure(href, index, messageInfoId, status) {
        //console.log(href, index);
        if (this.state.currentTab) {
            if (status === 0) {
                this.props.picture[index].status = 1;
                const {dispatch, doctorId={}} = this.props;
                dispatch(setInquiryPictureRead(messageInfoId)).then(()=> {
                    this.state.messageId = messageInfoId;
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
        let index = this.state.currentIndex - 1;
        let content;
        if (this.state.currentTab) {
            content = this.props.picture;
            if (index < 0) {
                index = content.length - 1;
            }
            let messageInfoId = content[index].messageInfoId;
            if (this.state.messageId !== messageInfoId && content[index].status === 0) {
                content[index].status = 1;
                const {dispatch, doctorId={}} = this.props;
                dispatch(setInquiryPictureRead(messageInfoId)).then(()=> {
                    this.state.messageId = messageInfoId;
                    dispatch(getDoctorPictureMessage(doctorId));
                });
            } else if (this.state.messageId === messageInfoId && content[index].status === 0) {
                content[index].status = 1;
            }
        } else {
            content = this.props.pictureList;
            if (index < 0) {
                index = content.length - 1;
            }
        }
        this.setState({
            imgSrc: content[index].savePath,
            currentIndex: index
        })
    }

    //下一张
    last() {
        let index = this.state.currentIndex + 1;
        let content;
        if (this.state.currentTab) {
            content = this.props.picture;
            if (index === content.length) {
                index = 0;
            }
            let messageInfoId = content[index].messageInfoId;
            if (this.state.messageId !== messageInfoId && content[index].status === 0) {
                content[index].status = 1;
                const {dispatch, doctorId={}} = this.props;
                dispatch(setInquiryPictureRead(messageInfoId)).then(()=> {
                    this.state.messageId = messageInfoId;
                    dispatch(getDoctorPictureMessage(doctorId));
                });
            } else if (this.state.messageId === messageInfoId && content[index].status === 0) {
                content[index].status = 1;
            }
        } else {
            content = this.props.pictureList;
            if (index === content.length) {
                index = 0;
            }
        }
        this.setState({
            imgSrc: content[index].savePath,
            currentIndex: index
        })
    }

    render() {
        let {picture = [], pictureList=[], pictureForward=[], currentCase = {}} = this.props;

        let time = new Date().getTime();
        let createdTime, currentMessage, forwardMessage;

        let pictureList1, forwardList, pictureList2;

        if (Array.isArray(picture) && picture.length > 0) {
            pictureList1 = picture.map((item, index)=> {
                let flag = false;
                if (this.state.messageId) {
                    if (item.status === 0) {
                        if (this.state.messageId !== item.messageInfoId) {
                            flag = true;
                        } else {
                            item.status = 1;
                        }
                    }
                } else {
                    if (item.status === 0) {
                        flag = true;
                    }
                }
                if (index === 0) {
                    let currentTime = global.formatDate(time, 'yyyy-MM-dd');
                    createdTime = global.formatDate(item.createdTime, 'yyyy-MM-dd');
                    let hourTime = global.formatDate(item.createdTime, 'HH:mm');
                    let date = (currentTime === createdTime) ? "今日" : createdTime;
                    return (<div className={styles.part} key={index}>
                        <div className={styles.date}>{date}</div>
                        <div className={styles.time}>{hourTime}{flag ? (
                            <span className={styles.read}>新</span>) : ""}</div>
                        <div className={styles.description}>{item.description}</div>
                        <div className={styles.item}>
                            <div className={styles.pictureList}>
                                {item.savePath && <img src={item.savePath+"@80h_80w_0e"} alt=""
                                                       onClick={()=>this.bigPicuure(item.savePath,index,item.messageInfoId,item.status)}/>}
                            </div>
                        </div>
                    </div>)

                } else {
                    currentMessage = picture[index].inquiryInfoId;
                    forwardMessage = picture[index - 1].inquiryInfoId;
                    let hourTime = global.formatDate(item.createdTime, 'HH:mm');

                    if (currentMessage === forwardMessage) {
                        return (<div className={styles.item} key={index}>
                            <div className={styles.pictureList}>
                                <img src={item.savePath+"@80h_80w_0e"} alt=""
                                     onClick={()=>this.bigPicuure(item.savePath,index,item.messageInfoId,item.status)}/>
                            </div>
                        </div>)
                    } else {
                        if (global.formatDate(picture[index].createdTime, 'yyyy-MM-dd') === global.formatDate(picture[index - 1].createdTime, 'yyyy-MM-dd')) {
                            return (<div className={styles.part} key={index}>
                                <div className={styles.time}>{hourTime}{flag ? (
                                    <span className={styles.read}>新</span>) : ""}</div>
                                <div className={styles.description}>{item.description}</div>
                                <div className={styles.item}>
                                    <div className={styles.pictureList}>
                                        <img src={item.savePath+"@80h_80w_0e"} alt=""
                                             onClick={()=>this.bigPicuure(item.savePath,index,item.messageInfoId,item.status)}/>
                                    </div>
                                </div>
                            </div>)
                        } else {
                            return (<div className={styles.part+" "+styles.partDay} key={index}>
                                <div
                                    className={styles.date}>{global.formatDate(picture[index].createdTime, 'yyyy-MM-dd')}</div>
                                <div className={styles.time}>{hourTime}{flag ? (
                                    <span className={styles.read}>新</span>) : ""}</div>
                                <div className={styles.description}>{item.description}</div>
                                <div className={styles.item}>
                                    <div className={styles.pictureList}>
                                        <img src={item.savePath+"@80h_80w_0e"} alt=""
                                             onClick={()=>this.bigPicuure(item.savePath,index,item.messageInfoId,item.status)}/>
                                    </div>
                                </div>
                            </div>)
                        }
                    }
                }
            });
        }

        if (Array.isArray(pictureForward) && pictureForward.length > 0) {
            forwardList = pictureForward.map((item, index)=> {
                if (index === 0) {
                    let currentTime = global.formatDate(time, 'yyyy-MM-dd');
                    createdTime = global.formatDate(item.createdTime, 'yyyy-MM-dd');
                    let hourTime = global.formatDate(item.createdTime, 'HH:mm');
                    let date = (currentTime === createdTime) ? "今日" : createdTime;

                    return (<div className={styles.part} key={index}>
                        <div className={styles.date}>{date}</div>
                        <div className={styles.time}>{hourTime}</div>
                        <div className={styles.description}>{item.description}</div>
                        <div className={styles.item}>
                            <div className={styles.pictureList}>
                                {item.savePath && <img src={item.savePath+"@80h_80w_0e"} alt=""
                                                       onClick={()=>this.bigPicuure(item.savePath,index)}/>}
                            </div>
                        </div>
                    </div>)

                } else {
                    currentMessage = pictureForward[index].inquiryInfoId;
                    forwardMessage = pictureForward[index - 1].inquiryInfoId;
                    let hourTime = global.formatDate(item.createdTime, 'HH:mm');

                    if (currentMessage === forwardMessage) {
                        return (<div className={styles.item} key={index}>
                            <div className={styles.pictureList}>
                                {item.savePath && <img src={item.savePath+"@80h_80w_0e"} alt=""
                                                       onClick={()=>this.bigPicuure(item.savePath,index)}/>}
                            </div>
                        </div>)
                    } else {
                        if (global.formatDate(pictureForward[index].createdTime, 'yyyy-MM-dd') === global.formatDate(pictureForward[index - 1].createdTime, 'yyyy-MM-dd')) {
                            return (<div className={styles.part} key={index}>
                                <div className={styles.time}>{hourTime}</div>
                                <div className={styles.description}>{item.description}</div>
                                <div className={styles.item}>
                                    <div className={styles.pictureList}>
                                        {item.savePath && <img src={item.savePath+"@80h_80w_0e"} alt=""
                                                               onClick={()=>this.bigPicuure(item.savePath,index)}/>}
                                    </div>
                                </div>
                            </div>)
                        } else {
                            return (<div className={styles.part+" "+styles.partDay} key={index}>
                                <div
                                    className={styles.date}>{global.formatDate(pictureForward[index].createdTime, 'yyyy-MM-dd')}</div>
                                <div className={styles.time}>{hourTime}</div>
                                <div className={styles.description}>{item.description}</div>
                                <div className={styles.item}>
                                    <div className={styles.pictureList}>
                                        {item.savePath && <img src={item.savePath+"@80h_80w_0e"} alt=""
                                                               onClick={()=>this.bigPicuure(item.savePath,index)}/>}
                                    </div>
                                </div>
                            </div>)
                        }
                    }
                }
            });
        }

        if (Array.isArray(pictureList) && pictureList.length > 0) {
            pictureList2 = pictureList.map((item, index)=> {
                if (index === 0) {
                    let currentTime = global.formatDate(time, 'yyyy-MM-dd');
                    createdTime = global.formatDate(item.createdTime, 'yyyy-MM-dd');
                    let hourTime = global.formatDate(item.createdTime, 'HH:mm');
                    let date = (currentTime === createdTime) ? "今日" : createdTime;

                    return (<div className={styles.part} key={index}>
                        <div className={styles.date}>{date}</div>
                        <div className={styles.time}>{hourTime}</div>
                        <div className={styles.description}>{item.description}</div>
                        <div className={styles.item}>
                            <div className={styles.pictureList}>
                                {item.savePath && <img src={item.savePath+"@80h_80w_0e"} alt=""
                                                       onClick={()=>this.bigPicuure(item.savePath,index)}/>}
                            </div>
                        </div>
                    </div>)

                } else {
                    currentMessage = pictureList[index].inquiryInfoId;
                    forwardMessage = pictureList[index - 1].inquiryInfoId;
                    let hourTime = global.formatDate(item.createdTime, 'HH:mm');

                    if (currentMessage === forwardMessage) {
                        return (<div className={styles.item} key={index}>
                            <div className={styles.pictureList}>
                                {item.savePath && <img src={item.savePath+"@80h_80w_0e"} alt=""
                                                       onClick={()=>this.bigPicuure(item.savePath,index)}/>}
                            </div>
                        </div>)
                    } else {
                        if (global.formatDate(pictureList[index].createdTime, 'yyyy-MM-dd') === global.formatDate(pictureList[index - 1].createdTime, 'yyyy-MM-dd')) {
                            return (<div className={styles.part} key={index}>
                                <div className={styles.time}>{hourTime}</div>
                                <div className={styles.description}>{item.description}</div>
                                <div className={styles.item}>
                                    <div className={styles.pictureList}>
                                        {item.savePath && <img src={item.savePath+"@80h_80w_0e"} alt=""
                                                               onClick={()=>this.bigPicuure(item.savePath,index)}/>}
                                    </div>
                                </div>
                            </div>)
                        } else {
                            return (<div className={styles.part+" "+styles.partDay} key={index}>
                                <div
                                    className={styles.date}>{global.formatDate(pictureList[index].createdTime, 'yyyy-MM-dd')}</div>
                                <div className={styles.time}>{hourTime}</div>
                                <div className={styles.description}>{item.description}</div>
                                <div className={styles.item}>
                                    <div className={styles.pictureList}>
                                        {item.savePath && <img src={item.savePath+"@80h_80w_0e"} alt=""
                                                               onClick={()=>this.bigPicuure(item.savePath,index)}/>}
                                    </div>
                                </div>
                            </div>)
                        }
                    }
                }
            });
        }

        return (
            <div className={styles.wrapper}>
                <Tabs defaultActiveKey="1" onChange={::this.onTabChange}>
                    <TabPane tab="本 次" key="1">
                        <div className={styles.panelBody}>
                            {pictureList1}
                            {forwardList}
                            {picture.length === 0 && pictureForward.length === 0 && <div>暂无图片</div>}
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
    const {authStore, caseStore, toolStore, doctorStore}  = globalStore;
    return {
        doctorId: authStore.id,
        picture: toolStore.picture || undefined,
        pictureList: toolStore.pictureList || undefined,
        pictureForward: toolStore.forwardPicture || undefined,
        currentCase: caseStore.currentCase
    };
};

export default connect(mapStateToProps)(Describe);