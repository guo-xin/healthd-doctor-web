import React, {Component} from 'react';
import {Tabs, Button, Input, message} from 'antd';
import styles from './message.less';
import {connect} from 'react-redux';
import * as global from 'util/global';
import {getMessageByCaseId, sendMessageByDoctor} from 'redux/actions/tool';

const TabPane = Tabs.TabPane;

class Message extends Component {
    state = {
        msg: "",
        disableSendBtn: false,
        list: []
    };

    componentDidMount() {

    }

    onChange(e) {
        let val = e.target.value;

        val = val.substring(0, 60);

        this.setState({
            msg: val
        });
    }

    _sendMsg(val) {
        const {patients={}, currentCase={}} = this.props;
        let patient = patients[currentCase.patientId] || {};

        return this.props.dispatch(sendMessageByDoctor({
            historyCaseId: currentCase.caseId,
            phone: patient.userPhoneNumber,
            content: val
        }));
    }

    //点击确定发送消息
    sendMsg() {
        let msg = this.state.msg;
        if (msg) {
            this.setState({
                disableSendBtn: true
            });
            this._sendMsg(msg).then(
                (action)=>{
                    let result = (action.response || {}).result;

                    if(result === 0){
                        this.setState({
                            msg: '',
                            disableSendBtn: false
                        });

                        message.success('发送成功');
                    }else{
                        this.setState({
                            disableSendBtn: false
                        });

                        message.error('发送失败');
                    }
                },
                ()=>{
                    this.setState({
                        disableSendBtn: false
                    });
                    message.error('发送失败');
                }
            );
        }
    }

    onTabChange(key) {
        if(key == 2){
            this.getMessageList();
        }
    }

    getMessageList(){
        const {currentCase={}} = this.props;
        if(currentCase.caseId){
            this.props.dispatch(getMessageByCaseId(currentCase.caseId)).then(
                (action)=>{
                    let result = (action.response || {}).result;

                    if(result === 0){
                        let data = (action.response || {}).data || [];
                        this.setState({
                            list: data
                        });
                    }
                }
            );
        }
    }

    getRelation(relation) {
        if (relation == 1) {
            relation = 2;
        } else if (relation == 2) {
            relation = 1;
        }

        return global.getRelationText(relation);
    }

    getFormattedList(list=[]){
        if(list.length > 0){
            let date = new Date().valueOf();
            let data = list.map((item, index)=>{

                return (
                    <li key={date + index}>
                        <span className="date">{global.formatDate(+item.startTime, 'yyyy-MM-dd HH:mm')}</span>
                        <span className="msg">{item.content}</span>
                    </li>
                )
            });

            return (
                <ul className={styles.msgList}>
                    {data}
                </ul>
            );
        }else{
            return null;
        }
    }

    render() {
        const {patients={}, currentCase={}, doctor={}} = this.props;

        let {msg, list} = this.state;


        let patient = patients[currentCase.patientId] || {};
        let relation = this.getRelation(patient.relation);
        let userInfo = (
            <ul className={styles.userInfo}>
                <li>用户姓名：{patient.userName}</li>
                <li className={styles.even}>电话号码：{patient.userPhoneNumber}</li>
                <li>与患者关系：{relation}</li>
            </ul>
        );

        let msgList = this.getFormattedList(list);

        return (
            <div className={styles.wrapper}>
                <Tabs defaultActiveKey="1" onChange={::this.onTabChange}>
                    <TabPane tab="发短信" key="1">
                        {userInfo}
                        <p className={styles.msgTemplate}>
                            短信内容：[我有医生]尊敬的用户，{doctor.name}医生向您发来一条消息
                        </p>

                        <Input className={styles.msgContent} type="textarea" value={msg} onChange={::this.onChange}/>

                        <p className={styles.wish}>
                            祝您/您的家人早日康复
                        </p>

                        <div className={styles.actions}>
                            <Button type="primary" onClick={::this.sendMsg}>发送</Button>
                        </div>

                    </TabPane>

                    <TabPane tab="短信记录" key="2">
                        <div  className={styles.listWrapper}>
                            {userInfo}
                            <div>
                                {msgList}
                            </div>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

const mapStateToProps = (globalStore) => {
    const {caseStore, patientStore, doctorStore, toolStore}  = globalStore;
    return {
        patients: Object.assign({}, patientStore.patients),
        currentCase: caseStore.currentCase,
        doctor: doctorStore.data
    };
};

export default connect(mapStateToProps)(Message);