import React from 'react';
import {Form, Select} from 'antd';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import {setCurrentPatient} from 'redux/actions/patient';
import styles from './patient.less';
import * as global from 'util/global';
import Image from 'components/image/image.jsx';

const Option = Select.Option;
const FormItem = Form.Item;

class Patient extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    edit() {
        let {patient, dispatch, router} = this.props;

        dispatch(setCurrentPatient({
            patientId: patient.id,
            state: 1
        }));

        router.push(`/inquire/case/patient`);
    }

    check() {
        let {patient, dispatch, router} = this.props;

        dispatch(setCurrentPatient({
            patientId: patient.id,
            state: 0
        }));

        router.push(`/inquire/case/viewPatient`);
    }

    render() {
        let {patient = {}, caseState} = this.props;

        return (
            <div className={styles.patientInfo}>
                <div className={styles.panelHead}>
                    {caseState!==2?<a href="javascript:;" onClick={::this.edit}><img src={require('assets/images/edit.png')} alt=""/>编辑</a>
                    :<a href="javascript:;"  onClick={::this.check}>查看</a>}
                </div>
                <div className={styles.panelBody}>
                    <div className="pic">
                        <span>
                            <Image src={patient.head || global.defaultHead} defaultImg={global.defaultHead}></Image>
                        </span>
                    </div>
                    <div className="info">
                        <Select style={{ width: 120 }} value={patient.id || -1}>
                            <Option value={patient.id || -1}>{patient.realName || '--'}</Option>
                        </Select>

                        <Form inline>
                            <FormItem label="性别：">{global.getGenderText(patient.sex) || '--'}</FormItem>
                            <FormItem label="年龄：">{global.getAge(patient.birthday) || '--'}</FormItem>
                            <FormItem label="电话号码：">{patient.phoneNumber || '--'}</FormItem>
                            <FormItem label="与用户关系：">{global.getRelationText(patient.relation) || '--'}</FormItem>
                            <FormItem label="就诊次数：" style={{display:'none'}}>第{patient.historyCaseCount || 0}次</FormItem>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(connect()(Patient));