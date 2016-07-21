import React, {Component} from 'react';
import {Icon} from 'antd';
import styles from './describe.less';
import {connect} from 'react-redux';
import * as global from 'util/global';
import {getPatientPicture} from 'redux/actions/tool';

class Describe extends Component {
    state = {
        dialogShow: false,
        imgSrc: "",
        currentIndex: ""
    };

    componentDidMount() {
        this.getDoctorList();
    }

    getDoctorList() {
        const {dispatch, currentCase = {}} = this.props;

        if (currentCase.caseId) {
            dispatch(getPatientPicture(currentCase.caseId));
        }
    }

    //点击图片
    bigPicuure(href, index) {
        //console.log(obj, href, index);
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
        let content = this.props.data;
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
        let content = this.props.data;
        if (index === content.length) {
            index = 0;
        }
        this.setState({
            imgSrc: content[index].savePath,
            currentIndex: index
        })
    }

    render() {
        let {data = [],currentCase = {}} = this.props;
        if(!currentCase.caseId){
            data = [];
        }
        let time = new Date().getTime();
        let createdTime1, createdTime2;
        let pictureList = data.map((item, index)=> {
            if (index === 0) {
                let currentTime = global.formatDate(time, 'yyyy-MM-dd');
                createdTime1 = global.formatDate(item.createdTime, 'yyyy-MM-dd');
                let hourTime = global.formatDate(item.createdTime, 'HH:mm');
                let date = (currentTime === createdTime1) ? "今日" : createdTime1;

                return (<div className={styles.part} key={index}>
                    <div className={styles.date}>{date}</div>
                    <div className={styles.time}>{hourTime}</div>
                    <div className={styles.item}>
                        <div className={styles.pictureList}>
                            <img src={item.savePath+"@80h_80w_0e"} alt=""
                                 onClick={()=>this.bigPicuure(item.savePath,index)}/>
                        </div>
                    </div>
                </div>)

            } else {
                createdTime1 = global.formatDate(data[index].createdTime, 'yyyy-MM-dd-HH-mm');
                createdTime2 = global.formatDate(data[index - 1].createdTime, 'yyyy-MM-dd-HH-mm');
                let hourTime = global.formatDate(item.createdTime, 'HH:mm');

                if (createdTime1 === createdTime2) {
                    return (<div className={styles.item} key={index}>
                        <div className={styles.pictureList}>
                            <img src={item.savePath+"@80h_80w_0e"} alt=""
                                 onClick={()=>this.bigPicuure(item.savePath,index)}/>
                        </div>
                    </div>)
                } else {
                    if (global.formatDate(data[index].createdTime, 'yyyy-MM-dd') === global.formatDate(data[index - 1].createdTime, 'yyyy-MM-dd')) {
                        return (<div className={styles.part} key={index}>
                            <div className={styles.time}>{hourTime}</div>
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
                                className={styles.date}>{global.formatDate(data[index].createdTime, 'yyyy-MM-dd')}</div>
                            <div className={styles.time}>{hourTime}</div>
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
                <div className={styles.panelHead}>
                    <div className={styles.panelElement}>
                        <a href="javascript:;" className={styles.panelTitle}>所 有</a>
                    </div>

                </div>

                <div className={styles.panelBody}>
                    {pictureList}
                    {data.length === 0 && <div>暂无图片</div>}
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
            </div>
        );
    }
}

const mapStateToProps = (globalStore) => {
    const {caseStore, toolStore}  = globalStore;
    const response = (toolStore.picture || []).slice().reverse();
    return {
        data: response,
        currentCase: caseStore.currentCase
    };
};

export default connect(mapStateToProps)(Describe);