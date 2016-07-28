import React, {Component} from 'react';
import {Tabs, Icon} from 'antd';
import styles from './describe.less';
import {connect} from 'react-redux';
import * as global from 'util/global';
import {
    getPatientAllPicture,
    getCurrentInqueryPicture,
    setInqueryPictureRead
} from 'redux/actions/tool';

const TabPane = Tabs.TabPane;

class Describe extends Component {
    state = {
        dialogShow: false,
        imgSrc: "",
        currentIndex: "",
        currentTab: true
    };

    componentDidMount() {
        this.getDoctorList();
    }

    getDoctorList() {
        const {dispatch, currentCase = {}} = this.props;

        if (currentCase.caseId) {
            dispatch(getCurrentInqueryPicture(currentCase.caseId));
        }
    }

    //本地与所有图片的切换
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
    bigPicuure(href, index) {
        //console.log(href, index);
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
        } else {
            content = this.props.pictureList;
        }
        if (index < 0) {
            index = content.length - 1;
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
        } else {
            content = this.props.pictureList;
        }
        if (index === content.length) {
            index = 0;
        }
        this.setState({
            imgSrc: content[index].savePath,
            currentIndex: index
        })
    }

    render() {
        let {picture = [], pictureList=[], message = [], currentCase = {}} = this.props;

        if (!currentCase.caseId) {
            picture = [];
        }

        if (!currentCase.patientId) {
            pictureList = [];
        }
        let time = new Date().getTime();
        let createdTime1, createdTime2;
        let pictureList1 = picture.map((item, index)=> {
            if (index === 0) {
                let currentTime = global.formatDate(time, 'yyyy-MM-dd');
                createdTime1 = global.formatDate(item.createdTime, 'yyyy-MM-dd');
                let hourTime = global.formatDate(item.createdTime, 'HH:mm');
                let date = (currentTime === createdTime1) ? "今日" : createdTime1;

                let unread = false;
                for (var i = 0; i < message.length; i++) {
                    if (message[i].inquiryInfoId === item.inquiryInfoId) {
                        unread = true;
                    }
                }

                return (<div className={styles.part} key={index}>
                    <div className={styles.date}>{date}</div>
                    <div className={styles.time}>{hourTime}<span className={styles.read}>新</span></div>
                    <div className={styles.description}>{item.description}</div>
                    <div className={styles.item}>
                        <div className={styles.pictureList}>
                            <img src={item.savePath+"@80h_80w_0e"} alt=""
                                 onClick={()=>this.bigPicuure(item.savePath,index)}/>
                        </div>
                    </div>
                </div>)

            } else {
                createdTime1 = global.formatDate(picture[index].createdTime, 'yyyy-MM-dd-HH-mm');
                createdTime2 = global.formatDate(picture[index - 1].createdTime, 'yyyy-MM-dd-HH-mm');
                let hourTime = global.formatDate(item.createdTime, 'HH:mm');

                if (createdTime1 === createdTime2) {
                    return (<div className={styles.item} key={index}>
                        <div className={styles.pictureList}>
                            <img src={item.savePath+"@80h_80w_0e"} alt=""
                                 onClick={()=>this.bigPicuure(item.savePath,index)}/>
                        </div>
                    </div>)
                } else {
                    if (global.formatDate(picture[index].createdTime, 'yyyy-MM-dd') === global.formatDate(picture[index - 1].createdTime, 'yyyy-MM-dd')) {
                        return (<div className={styles.part} key={index}>
                            <div className={styles.time}>{hourTime}</div>
                            <div className={styles.description}>{item.description}</div>
                            <div className={styles.item}>
                                <div className={styles.pictureList}>
                                    <img src={item.savePath+"@80h_80w_0e"} alt=""
                                         onClick={()=>this.bigPicuure(item.savePath,index)}/>
                                </div>
                            </div>
                        </div>)
                    } else {
                        return (<div className={styles.part+" "+styles.partDay} key={index}>
                            <div
                                className={styles.date}>{global.formatDate(picture[index].createdTime, 'yyyy-MM-dd')}</div>
                            <div className={styles.time}>{hourTime}</div>
                            <div className={styles.description}>{item.description}</div>
                            <div className={styles.item}>
                                <div className={styles.pictureList}>
                                    <img src={item.savePath+"@80h_80w_0e"} alt=""
                                         onClick={()=>this.bigPicuure(item.savePath,index)}/>
                                </div>
                            </div>
                        </div>)
                    }
                }
            }
        });

        let createdTime3, createdTime4;
        let pictureList2 = pictureList.map((item, index)=> {
            if (index === 0) {
                let currentTime = global.formatDate(time, 'yyyy-MM-dd');
                createdTime1 = global.formatDate(item.createdTime, 'yyyy-MM-dd');
                let hourTime = global.formatDate(item.createdTime, 'HH:mm');
                let date = (currentTime === createdTime1) ? "今日" : createdTime1;

                return (<div className={styles.part} key={index}>
                    <div className={styles.date}>{date}</div>
                    <div className={styles.time}>{hourTime}</div>
                    <div className={styles.description}>{item.description}</div>
                    <div className={styles.item}>
                        <div className={styles.pictureList}>
                            <img src={item.savePath+"@80h_80w_0e"} alt=""
                                 onClick={()=>this.bigPicuure(item.savePath,index)}/>
                        </div>
                    </div>
                </div>)

            } else {
                createdTime1 = global.formatDate(pictureList[index].createdTime, 'yyyy-MM-dd-HH-mm');
                createdTime2 = global.formatDate(pictureList[index - 1].createdTime, 'yyyy-MM-dd-HH-mm');
                let hourTime = global.formatDate(item.createdTime, 'HH:mm');

                if (createdTime1 === createdTime2) {
                    return (<div className={styles.item} key={index}>
                        <div className={styles.pictureList}>
                            <img src={item.savePath+"@80h_80w_0e"} alt=""
                                 onClick={()=>this.bigPicuure(item.savePath,index)}/>
                        </div>
                    </div>)
                } else {
                    if (global.formatDate(pictureList[index].createdTime, 'yyyy-MM-dd') === global.formatDate(pictureList[index - 1].createdTime, 'yyyy-MM-dd')) {
                        return (<div className={styles.part} key={index}>
                            <div className={styles.time}>{hourTime}</div>
                            <div className={styles.description}>{item.description}</div>
                            <div className={styles.item}>
                                <div className={styles.pictureList}>
                                    <img src={item.savePath+"@80h_80w_0e"} alt=""
                                         onClick={()=>this.bigPicuure(item.savePath,index)}/>
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
                                    <img src={item.savePath+"@80h_80w_0e"} alt=""
                                         onClick={()=>this.bigPicuure(item.savePath,index)}/>
                                </div>
                            </div>
                        </div>)
                    }
                }
            }
        });


        return (
            <div className={styles.wrapper}>
                <Tabs defaultActiveKey="1" onChange={::this.onTabChange}>
                    <TabPane tab="本 次" key="1">
                        <div className={styles.panelBody}>
                            {pictureList1}
                            {picture.length === 0 && <div>暂无图片</div>}
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
    const {caseStore, toolStore, doctorStore}  = globalStore;
    return {
        picture: toolStore.picture,
        pictureList: toolStore.pictureList,
        currentCase: caseStore.currentCase,
        message: doctorStore.message
    };
};

export default connect(mapStateToProps)(Describe);