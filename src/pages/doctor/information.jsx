import React from 'react';
import {Form, Input, Button, message, Modal} from 'antd';
import styles from './editDoctor.less';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';

import {postDoctorChangeIntroduce} from 'redux/actions/doctor';
const FormItem = Form.Item;


class Information extends React.Component {
    state = {
        specialSkill: '',
        introduction: ''
    };

    status = {
            1:'小于3年',
            2:'3至5年',
            3:'5至10年',
            4:'大于10年'
    }

    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            specialSkill: nextProps.data.specialSkill,
            introduction: nextProps.data.introduction
        });
    }
    /*擅长字数限制*/
    onSkillChange(e) {
        if(e.target.value.length > 300){
            this.setState({
                specialSkill: e.target.value.substring(0,300)
            })
        }else{
            this.setState({
                specialSkill: e.target.value
            })
        }
    }
    /*简介字数限制*/
    onIntroductionChange(e) {
        if(e.target.value.length > 500){
            this.setState({
                introduction: e.target.value.substring(0,500)
            })
        }else{
            this.setState({
                introduction: e.target.value
            })
        }
    }

    /*确认*/
    onOK(e) {
        e.preventDefault();
        const {dispatch,doctorId = {}} = this.props;
        let params = {
            id: doctorId,
            introduction: this.state.introduction,
            specialSkill: this.state.specialSkill
        };

        let hide = message.loading('正在保存...', 0);

        dispatch(postDoctorChangeIntroduce(params)).then(()=> {
            hide();
            message.success('更改成功！');
            this.props.router.replace('/home');
        }, () => {
            hide();
            message.error('保存失败！');
        });
    }

    /*取消*/
    onCancel() {
        this.props.router.replace('/home');
    }

    render() {
        let {data = {}} = this.props;
        let workYears = '';
        if(data.workYears){
            workYears = this.status[data.workYears];
        }
        return (
            <div>
                <div className={styles.panelHead}>
                    <div className={styles.panelTitle}>
                        基本信息<span>(如需修改，请联系行政人员)</span>
                    </div>
                </div>
                <div className={styles.panelBody}>
                    <Form>
                        <div className="row">
                            <div className="col">
                                <FormItem label="姓名：">
                                    <Input placeholder="" disabled value={data.name}/>
                                </FormItem>
                            </div>
                            <div className="col">
                                <FormItem label="科室：">
                                    <Input placeholder="" disabled value={data.department}/>
                                </FormItem>
                            </div>
                            <div className="col">
                                <FormItem label="执业年限：">
                                    <Input placeholder="" disabled value={workYears}/>
                                </FormItem>
                            </div>
                            <div className="col">
                                <FormItem label="职称证书：">
                                    <Input placeholder="" disabled value={data.jobTitle}/>
                                </FormItem>
                            </div>
                            <div className="col">
                                <FormItem label="医院：">
                                    <Input placeholder="" disabled value={this.props.data.hospitalName}/>
                                </FormItem>
                            </div>
                        </div>
                    </Form>
                </div>
                <div className={styles.panelHead}>
                    <div className={styles.panelTitle}>个人说明</div>
                </div>
                <div className={styles.panelBody}>
                    <div className={styles.panelTitle+" "+styles.panelTitle1}>简介</div>
                    <Form>
                        <div className={styles.textarea + " row"}>
                            <FormItem label="">
                                <Input type="textarea" rows="5" value={this.state.introduction}
                                       onChange={(e)=>this.onIntroductionChange(e)}/>
                                <div className={styles.wordTip}><span>{500-(this.state.introduction?this.state.introduction.length:0)}</span><span>/500</span></div>
                            </FormItem>
                        </div>
                    </Form>
                </div>
                <div className={styles.panelBody}>
                    <div className={styles.panelTitle+" "+styles.panelTitle1}>擅长</div>
                    <Form>
                        <div className={styles.textarea + " row"}>
                            <FormItem label="">
                                <Input type="textarea" rows="5" value={this.state.specialSkill}
                                       onChange={(e)=>this.onSkillChange(e)}/>
                                <div className={styles.wordTip}><span>{300-(this.state.specialSkill?this.state.specialSkill.length:0)}</span><span>/300</span></div>
                            </FormItem>
                        </div>
                    </Form>
                </div>

                <div className={styles.action}>
                    <Button type="primary" size="large" onClick={(e)=>this.onOK(e)}>确定</Button>
                    <Button type="ghost" size="large" onClick={()=>this.onCancel()}>取消</Button>
                </div>
            </div>
        );
    }
}

export default withRouter(connect()(Information));