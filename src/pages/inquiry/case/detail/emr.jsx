import React from 'react';
import {Form, Input, Checkbox, Icon, InputNumber} from 'antd';
import Diagnosis from './Diagnosis';
import styles from './emr.less';

import * as store from 'redux/store';
import {getCaseOpinions} from 'redux/actions/case';

const FormItem = Form.Item;

class Emr extends React.Component {
    state = {
        isInit: false,
        opinionsText: ''
    };

    formData = {};

    componentWillReceiveProps(nextProps) {
        if (!this.state.isInit && nextProps.caseData && nextProps.caseData.id) {
            this.updateFormValues(nextProps.caseData);
            this.state.isInit = true;
        }

        if (!nextProps.isEditable && nextProps.isEditable !== this.props.isEditable) {
            if (this.props.form) {
                this.state.opinionsText = this.props.form.getFieldValue('opinionsText');
            }
        }
    }

    getValue(data, key) {
        if (data[key] && data[key][0]) {
            return data[key][0];
        }
        return {};
    }

    edit(e) {
        if (typeof this.props.edit === 'function') {
            this.props.edit(true);
        }
    }

    setFormData(formData = {}) {
        if (typeof this.props.setFormData === 'function') {
            this.props.setFormData(formData);
        }
    }

    getData(data = {}) {
        let formattedData = {
            pc: data.illnessState,
            hpc: this.getValue(data, 'historyPresentList').remark,
            pmh: this.getValue(data, 'historyPastList').description,
            allergies: this.getValue(data, 'historyPastList').allergies,
            hasDrugAllergyHistory: this.getValue(data, 'historyPastList').status === 1 ? true : false,
            physicalExamination: this.getValue(data, 'physicalExaminationList').userProfile,
            temperature: this.getValue(data, 'physicalExaminationList').temperature,
            lowPressure: this.getValue(data, 'physicalExaminationList').lowPressure,
            highPressure: this.getValue(data, 'physicalExaminationList').highPressure,
            breath: this.getValue(data, 'physicalExaminationList').breath,
            pulse: this.getValue(data, 'physicalExaminationList').pulse,
            auxiliaryExamination: this.getValue(data, 'auxiliaryExaminationsList').resultDesc,
            opinions: data.opinions
        };

        this.formData = Object.assign({}, this.formData, formattedData);

        this.setFormData(this.formData);

        return formattedData;
    }

    updateFormValues(data) {
        let values = this.getData(data);
        this.state.isInit = true;

        this.props.form.setFieldsValue(values);

        if (values.opinions) {
            store.dispatch(getCaseOpinions(values.opinions)).then(
                (action)=> {

                    let result = (action.response || {}).result;
                    let data = (action.response || {}).data;

                    if (result === 0 && data) {
                        this.formData.opinionsText = data;

                        this.setFormData(this.formData);

                        this.setState({
                            opinionsText: data
                        });

                        this.props.form.setFieldsValue({
                            opinionsText: data
                        });
                    }
                },
                ()=> {

                }
            );
        }
    }

    st = null;

    onBlur(field) {
        if (!this.state.isInit) {
            this.state.isInit = true;
        }

        //目前只实现主述失去焦点时保存
        if (field != 'pc') {
            return;
        }

        let {form, save, caseData} = this.props;

        let values = form.getFieldsValue() || {};

        if (!caseData.id && values.pc) {
            if (typeof save === 'function') {
                clearTimeout(this.st);
                this.st = setTimeout(()=> {
                    save(values);
                }, 600);
            }
        }


    }

    render() {
        const {getFieldProps, getFieldValue} = this.props.form;
        const {isEditable, caseData={}} = this.props;
        let {opinionsText='--'} = this.state;

        let {
            pc='--', hpc='--', pmh='--', allergies='--', temperature='--',
            pulse='--', breath='--', lowPressure='--', highPressure='--', physicalExamination='--', auxiliaryExamination='--'
        } = this.getData(caseData);


        return (
            <div className={styles.wrapper}>
                <div className={styles.panelHead}>
                    <div className={styles.panelTitle}>
                        病历编辑 {(!isEditable && caseData.status !== 2 && caseData.status !== 3) &&
                    <a className={styles.edit} href="javascript:;" onClick={::this.edit}><img
                        src={require('assets/images/edit.png')} alt=""/>编辑</a>}
                    </div>
                </div>
                <div className={styles.panelBody}>
                    <Form form={this.props.form}>
                        <FormItem
                            label="主诉">
                            {isEditable ? <Input {...getFieldProps('pc', {
                                rules: [
                                    {required: true, message: "主诉信息不能为空，请录入"},
                                    {max: 100, message: '输入不能超过100字'}
                                ]
                            })} onBlur={()=>this.onBlur('pc')}/> : (pc || '--')}

                        </FormItem>
                        <FormItem
                            label="现病史">
                            {isEditable ? <Input type="textarea" {...getFieldProps('hpc', {
                                rules: [
                                    {max: 5000, message: '输入不能超过5000字'}
                                ]
                            })} onBlur={()=>this.onBlur('hpc')}/> : <pre>{hpc}</pre>}

                        </FormItem>
                        <FormItem>
                            <FormItem
                                label="既往史">
                                {isEditable ?
                                    <Input type="textarea" {...getFieldProps('pmh', {
                                        rules: [
                                            {max: 5000, message: '输入不能超过5000字'}
                                        ]
                                    })} onBlur={()=>this.onBlur('pmh')}/> : <pre>{pmh}</pre>}
                            </FormItem>

                            <div className={styles.pmhDetail}>
                                <span>
                                    药物过敏史:
                                </span>
                                {isEditable ? (
                                    <span>
                                    <Checkbox
                                        {...getFieldProps('hasDrugAllergyHistory', {valuePropName: 'checked'})}
                                        onBlur={()=>this.onBlur('hasDrugAllergyHistory')}>有
                                    </Checkbox>

                                    <FormItem>
                                        <Input {...getFieldProps('allergies', {
                                            rules: [
                                                {max: 500, message: '输入不能超过500字'}
                                            ]
                                        })} disabled={!getFieldValue('hasDrugAllergyHistory')}
                                            onBlur={()=>this.onBlur('allergies')}/>
                                    </FormItem>
                                </span>
                                ) : (getFieldValue('hasDrugAllergyHistory') ?
                                    <span>{allergies}</span> : <span>--</span>)}
                            </div>
                        </FormItem>


                        <FormItem
                            label="体格检查(用户描述)">
                            <div className={styles.physicalExamination}>
                                <FormItem
                                    label="体温">
                                    {isEditable ? (
                                        <InputNumber {...getFieldProps('temperature')} size="default" step={0.1}
                                                                                       min={10}
                                                                                       max={60}
                                                                                       onBlur={()=>this.onBlur('temperature')}/>) : (temperature || '--')}
                                    <span className="ant-form-text"> ℃</span>
                                </FormItem>

                                <FormItem
                                    label="脉搏">
                                    {isEditable ? (<InputNumber size="default" {...getFieldProps('pulse')} min={10}
                                                                max={300}
                                                                onBlur={()=>this.onBlur('pulse')}/>) : (pulse || '--')}

                                    <span className="ant-form-text"> 次/分</span>
                                </FormItem>

                                <FormItem
                                    label="呼吸">
                                    {isEditable ? (<InputNumber size="default" {...getFieldProps('breath')} min={1}
                                                                max={150}
                                                                onBlur={()=>this.onBlur('breath')}/>) : (breath || '--')}


                                    <span className="ant-form-text"> 次/分</span>
                                </FormItem>

                                <FormItem
                                    label="血压">
                                    {isEditable ? (<InputNumber className="pressure"
                                                                size="default" {...getFieldProps('lowPressure')}
                                                                min={10}
                                                                max={200}
                                                                onBlur={()=>this.onBlur('lowPressure')}/>) : (lowPressure || '--')}
                                    /
                                    {isEditable ? (<InputNumber className="pressure"
                                                                size="default" {...getFieldProps('highPressure')}
                                                                min={10}
                                                                max={300}
                                                                onBlur={()=>this.onBlur('highPressure')}/>) : (highPressure || '--')}

                                    <span className="ant-form-text"> mmHg</span>
                                </FormItem>
                            </div>

                            {isEditable ? <Input
                                type="textarea" {...getFieldProps('physicalExamination')}
                                onBlur={()=>this.onBlur('physicalExamination')}/> :
                                <pre>{physicalExamination || '--'}</pre>}

                            <div style={{display:'none'}}>
                                {isEditable &&
                                <a className={styles.addFile} href="javascrip:;"><Icon type="plus-circle-o"/>添加图片资料</a>}
                            </div>
                        </FormItem>
                        <FormItem
                            label="辅助检查结果">

                            {isEditable ? <Input
                                type="textarea" {...getFieldProps('auxiliaryExamination', {
                                rules: [
                                    {max: 5000, message: '输入不能超过5000字'}
                                ]
                            })} onBlur={()=>this.onBlur('auxiliaryExamination')}/> : <pre>{auxiliaryExamination}</pre>}
                            <div style={{display:'none'}}>
                                {isEditable &&
                                <a className={styles.addFile} href="javascrip:;"><Icon type="plus-circle-o"/>添加图片资料</a>}
                            </div>

                        </FormItem>
                        <FormItem
                            label="诊断">
                            <Diagnosis isEditable={isEditable}></Diagnosis>
                            {isEditable && <Input {...getFieldProps('diagnosisInfo', {
                                rules: [
                                    {required: true, message: "诊断信息不能为空，请录入"}
                                ]
                            })} style={{display: 'none'}}/>}
                        </FormItem>
                        <FormItem
                            label="诊疗意见">
                            {isEditable ? <Input type="textarea" {...getFieldProps('opinionsText', {
                                rules: [
                                    {required: true, message: "诊疗意见不能为空，请录入"},
                                    {max: 5000, message: '输入不能超过5000字'}
                                ]
                            })} onBlur={()=>this.onBlur('opinionsText')}/> : (<pre>{opinionsText || '--'}</pre>)}

                            <Input type="text" {...getFieldProps('opinions')} style={{display: 'none'}}/>
                        </FormItem>
                    </Form>
                </div>
            </div>
        );
    }
}

Emr = Form.create()(Emr);

export default Emr;