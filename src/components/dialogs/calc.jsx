import styles from './calc.less';
import React, {Component} from 'react';
import {Modal, Button} from 'antd';
import {withRouter} from 'react-router';

import {connect} from 'react-redux';
import {showCalcDialog} from 'redux/actions/call';
import {getInquireCallbackNumber} from 'redux/actions/inquire';
import Image from '../image/image.jsx';
import * as global from 'util/global';

class Calc extends Component {
    state = {
        isVisible: false,
        user: {},
        data: {}
    };

    constructor(props) {
        super(props);

        this.footer = (
            <div>
                <Button size="large" type="ghost" onClick={()=>this.cancel()}>取消</Button>
                <Button size="large" type="ghost" onClick={()=>this.free()}>免单</Button>
                <Button size="large" className="answer-btn" onClick={()=>this.calc()}>计次</Button>
            </div>
        );
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isVisible && nextProps.isVisible !== this.props.isVisible) {
            let currentCase = nextProps.currentCase;
            nextProps.dispatch(getInquireCallbackNumber({
                patientId: currentCase.patientId,
                inquiryId: currentCase.inquiryId
            })).then(
                (action)=> {
                    let data = (action.response || {}).data || {};

                    this.setState({
                        inquiryNumber: data.inquiryNumber,
                        diagnosisName: data.diagnosisName
                    });
                }
            );
        }
    }

    //取消
    cancel() {
        this.setVisible(false);
    }


    //免单
    free() {
        this.setVisible(false);

        let {free} = this.props;
        if (typeof free === 'function') {
            free();
        }
    }

    //计次
    calc() {
        this.setVisible(false);

        let {calc} = this.props;
        if (typeof calc === 'function') {
            calc();
        }
    }

    setVisible(isVisible) {
        this.props.dispatch(showCalcDialog(isVisible));
    }

    getDiagnosisName(){
        let diagnosis = this.props.diagnosis || {};
        let data = diagnosis.data || [];

        if(data.length>0){
            return data[0].diagnosisName;
        }

        return null;
    }

    render() {
        let {isVisible, currentCase={}, patients={}} = this.props;
        let {inquiryNumber} = this.state;
        let diagnosisName = this.getDiagnosisName();

        let patient = patients[currentCase.patientId] || {};

        return (
            <Modal
                wrapClassName={styles.dialog + " vertical-center-modal"}
                closable={false}
                maskClosable={false}
                style={{ top: "-20px" }}
                visible={isVisible}
                onCancel={() => this.setVisible(false)}
                footer={this.footer}>
                <div className={styles.pic}>
                    <span>
                        <Image src={patient.head || global.defaultHead}
                               defaultImg={global.defaultHead}>
                        </Image>
                    </span>
                </div>
                <div className={styles.detail}>
                    <div className="top">
                        <span className="name">患者：{patient.realName || '--'}</span>
                        <span className="age">{global.getAge(patient.birthday) || '--岁'}</span>
                        <span className="serial">ID:{global.formatPatientCode(patient.patientCode) || '--'}</span>
                        <span className="gender">
                             <img src={global.getGenderUrl(patient.sex)} alt=""/>
                        </span>
                    </div>
                    <div className="middle clearfix">
                        <ul>
                            <li>问诊人：{patient.userName}</li>
                            <li>与问诊人关系：{global.getRelationText(patient.relation) || '--'}</li>
                            <li>就诊次数：第{inquiryNumber || 0}次</li>
                            <li>本次诊断：{diagnosisName || '--'}</li>
                        </ul>
                    </div>
                </div>
            </Modal>
        );
    }
}

const mapStateToProps = (globalStore) => {
    const {callStore, patientStore, caseStore} = globalStore;

    return {
        isVisible: callStore.isShowCalcDialog,
        patients: Object.assign({}, patientStore.patients),
        currentCase: caseStore.currentCase,
        diagnosis: caseStore.diagnosis
    }
};


Calc = connect(mapStateToProps)(Calc);

export default withRouter(Calc);
