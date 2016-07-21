import React from 'react';
import {Form, Input, Button, message, Modal} from 'antd';
import styles from './editDoctor.less';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';

import {postDoctorCheckPwd, postDoctorCheckPhone, postDoctorCheckCode, postDoctorChangePwd} from 'redux/actions/doctor';
const createForm = Form.create;
const FormItem = Form.Item;

class ChangePhone extends React.Component {
    state = {
        visible: false,
        loading: false,
        modalState: true,
        send: true,
        sendAgin: false,
        showSecond: ''
    };
    timeCount = null;
    /*显示弹出层*/
    showModal() {
        this.setState({
            visible: true
        });
    }

    /*密码确认按钮*/
    pwdOk() {
        const {dispatch, doctorId = {}, form} = this.props;
        let params = {
            id: doctorId,
            doctorPass: form.getFieldsValue().pass
        };
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            } else {
                this.setState({
                    loading: true
                });
                let hide = message.loading('正在加载...', 0);
                dispatch(postDoctorCheckPwd(params)).then(()=> {
                    if (this.props.result === 1) {
                        let {setFields, getFieldValue} = this.props.form;
                        setFields({
                            pass: {
                                value: getFieldValue('pass'),
                                errors: ['密码输入不正确']
                            }
                        });
                    } else {
                        this.setState({
                            modalState: false
                        });
                    }
                    hide();
                }, () => {
                    hide();
                    message.error('请求失败！');
                });
                this.setState({
                    loading: false
                });
            }
        });
    }

    /*电话号码确认，发送验证码按钮*/
    checkPhone() {
        const {dispatch} = this.props;
        let params = {
            phone: this.props.form.getFieldsValue().phone
        };
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            } else {
                this.setState({
                    loading: true
                });
                let hide = message.loading('正在加载...', 0);
                dispatch(postDoctorCheckPhone(params)).then(()=> {
                    if (this.props.result.result === 1) {
                        let {setFields, getFieldValue} = this.props.form;
                        if (this.props.result.message) {
                            setFields({
                                phone: {
                                    value: getFieldValue('phone'),
                                    errors: ['30秒内不能重复发送']
                                }
                            });
                        } else {
                            setFields({
                                phone: {
                                    value: getFieldValue('phone'),
                                    errors: ['该号码已被占用']
                                }
                            });
                        }

                    } else {
                        this.setState({
                            send: false
                        });
                        this.countTime(120);
                    }
                    hide();
                }, () => {
                    hide();
                    message.error('请求失败！');
                });
                this.setState({
                    loading: false
                });
            }
        });
    }

    /*验证电话号码和验证码按钮*/
    checkCode() {
        const {dispatch, doctorId = {}} = this.props;
        let authCode;
        if (this.props.form.getFieldsValue().check) {
            authCode = this.props.form.getFieldsValue().check;
        } else {
            authCode = this.props.form.getFieldsValue().check1;
        }
        let params = {
            id: doctorId,
            phone: this.props.form.getFieldsValue().phone,
            authCode: authCode
        };
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            } else {
                this.setState({
                    loading: true
                });
                let hide = message.loading('正在加载...', 0);
                dispatch(postDoctorCheckCode(params)).then(()=> {
                    if (this.props.result === 1) {
                        let {setFields, getFieldValue} = this.props.form;
                        if (this.props.form.getFieldsValue().check) {
                            setFields({
                                check: {
                                    value: getFieldValue('check'),
                                    errors: ['验证码不正确，请重新输入']
                                },
                                phone: {
                                    value: getFieldValue('phone'),
                                    info: ['']
                                }
                            });
                        } else {
                            setFields({
                                check1: {
                                    value: getFieldValue('check1'),
                                    errors: ['验证码不正确，请重新输入']
                                },
                                phone: {
                                    value: getFieldValue('phone'),
                                    info: ['']
                                }
                            });
                        }

                    } else {
                        this.setState({
                            visible: false
                        });
                        setTimeout(()=> {
                            this.setState({
                                send: true,
                                showSecond: ''
                            });
                            clearTimeout(this.timeCount);

                            this.state.modalState = true;
                            this.props.form.resetFields();
                        }, 100);
                        message.success('更改成功！');
                    }
                    hide();
                }, () => {
                    hide();
                    message.error('请求失败！');
                });
                this.setState({
                    loading: false
                });
            }
        });
    }

    /*倒计时*/
    countTime(count) {
        if (count === 0) {
            this.setState({
                send: true,
                sendAgin: true,
                showSecond: ''
            });
            clearTimeout(this.timeCount);
            return;
        } else {
            count--;
            this.setState({
                showSecond: count
            });
           this.timeCount = setTimeout(()=> {
                this.countTime(count);
            }, 1000);
        }
    }



    /*点击取消关闭弹出层*/
    handleCancel() {
        this.setState({
            visible: false
        });

        clearTimeout(this.timeCount);
        setTimeout(()=> {
            this.setState({
                send: true,
                showSecond: ''
            });
            this.state.modalState = true;
            this.state.sendAgin = false;
            this.props.form.resetFields();
        }, 100);
    }

    render() {
        const {getFieldProps, getFieldValue} = this.props.form;

        return (
            <div className="col safeBotton">
                <div className={styles.action}>
                    <Button type="ghost" size="large" onClick={()=>this.showModal()}>替换安全手机</Button>
                    <Modal wrapClassName={styles.safeModal} title="更换手机号"
                           visible={this.state.visible}
                           maskClosable={false} onCancel={()=>this.handleCancel()}
                           footer={ this.state.modalState?([
                                                <Button key={1} type="ghost" size="large" onClick={()=>this.handleCancel()}>取  消</Button>,
                                                <Button key={2} type="primary" size="large" loading={this.state.loading} onClick={()=>this.pwdOk()}>
                                                  确  认
                                                </Button>
                                              ]) :
                                              ([
                                                <Button key={3} type="ghost" size="large" onClick={()=>this.handleCancel()}>取  消</Button>,
                                                <Button key={4} type="primary" disabled={(getFieldValue('check') && getFieldValue('check').length === 6) || (getFieldValue('check1') && getFieldValue('check1').length === 6)?false:true} size="large" loading={this.state.loading} onClick={()=>this.checkCode()}>
                                                  确  认
                                                </Button>
                                              ])
                                              }>
                        <Form form={this.props.form}>
                            {this.state.modalState ?
                                (<div>
                                    <span>为确认你的有效身份，请输入您的登录密码</span>
                                    <div className="row">
                                        <div className="col">
                                            <FormItem label="输入密码：">
                                                <Input {...getFieldProps('pass', {
                                                    rules: [
                                                        {
                                                            required: true,
                                                            min: 6,
                                                            max: 16,
                                                            whitespace: true,
                                                            message: '密码是6～16位数字或字母'
                                                        }
                                                    ]
                                                })} placeholder="请输入密码" type="password"/>
                                            </FormItem>
                                        </div>
                                    </div>
                                </div>)
                                :
                                (<div className="row">
                                    <div className="col">
                                        <FormItem label="新手机号：">
                                            <Input {...getFieldProps('phone', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        pattern: /^1[3|4|5|7|8]\d{9}$/,
                                                        whitespace: true,
                                                        message: '您输入的不是有效手机号'
                                                    }
                                                ]
                                            })} placeholder="请输入手机号码" type="text"/>
                                        </FormItem>
                                    </div>
                                    {this.state.send ?
                                        (<div className="col check">
                                            <FormItem label="验证码：">
                                                <Input {...getFieldProps('check1')} placeholder="请输入验证码" type="text"/>
                                            </FormItem>
                                            <Button type="ghost" size="large"
                                                    onClick={()=>this.checkPhone()}>{!this.state.sendAgin ? "获取" : "重新获取"}</Button>
                                        </div>)
                                        :
                                        (<div>
                                            <div className="col send">
                                                <FormItem label="验证码：">
                                                    <Input  {...getFieldProps('check', {
                                                        rules: [
                                                            {
                                                                required: true,
                                                                whitespace: true,
                                                                message: '请输入验证码'
                                                            }
                                                        ]
                                                    })} placeholder="请输入验证码" type="text"/>
                                                </FormItem>
                                                <Button type="ghost" size="large"
                                                        disabled>{this.state.showSecond}</Button>
                                            </div>
                                            <div className="col ant-form-explain has-info">
                                                验证码有效期十五分钟,过期需要重新获取
                                            </div>
                                        </div>)
                                    }
                                </div>)}
                        </Form>
                    </Modal>
                </div>
            </div>
        );
    }
}

class ChangePwd extends React.Component {
    state = {
        visible: false,
        loading: false
    };
    /*显示弹出层*/
    showModal() {
        this.setState({
            visible: true
        });
    }

    /*密码确认按钮*/
    pwdOk() {
        const {dispatch, doctorId = {}, form} = this.props;
        let params = {
            id: doctorId,
            doctorPass: form.getFieldsValue().change
        };
        let param = {
            id: doctorId,
            doctorPass: form.getFieldsValue().newPwd
        };
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            } else {
                this.setState({
                    loading: true
                });
                let hide = message.loading('正在加载...', 0);
                dispatch(postDoctorCheckPwd(params)).then(()=> {
                    if (this.props.result === 1) {
                        let {setFields, getFieldValue} = this.props.form;
                        setFields({
                            change: {
                                value: getFieldValue('change'),
                                errors: ['密码输入不正确']
                            },
                            newPwd: {
                                value: getFieldValue('newPwd'),
                                info: ['']
                            },
                            newPwd2: {
                                value: getFieldValue('newPwd2'),
                                info: ['']
                            }
                        });
                    } else {
                        dispatch(postDoctorChangePwd(param)).then(()=> {
                            if (this.props.result === 1) {
                                let {setFields, getFieldValue} = this.props.form;
                                setFields({
                                    change: {
                                        value: getFieldValue('change'),
                                        info: ['']
                                    },
                                    newPwd: {
                                        value: getFieldValue('newPwd'),
                                        info: ['']
                                    },
                                    newPwd2: {
                                        value: getFieldValue('newPwd2'),
                                        errors: ['新密码与旧密码相同']
                                    }
                                });
                            } else {
                                hide();
                                this.state.loading = false;
                                this.state.visible = false;
                                message.success('更改成功！');
                                this.props.router.replace(`/login`);
                            }
                            hide();
                        }, () => {
                            hide();
                            message.error('请求失败！');
                        });
                    }
                    hide();
                }, () => {
                    hide();
                    message.error('请求失败！');
                });
                this.setState({
                    loading: false
                });
            }
        });
    }


    checkPass(rule, value, callback) {
        const {validateFields} = this.props.form;
        if (value) {
            validateFields(['newPwd2'], {force: true});
        }
        callback();
    }

    checkPass2(rule, value, callback) {
        const {getFieldValue} = this.props.form;
        if (value && value !== getFieldValue('newPwd')) {
            callback('两次输入密码不一致！');
        } else {
            callback();
        }
    }

    /*点击取消关闭弹出层*/
    handleCancel() {
        this.setState({
            visible: false
        });
        setTimeout(()=> {
            this.props.form.resetFields();
        }, 100);
    }

    render() {
        const {getFieldProps, getFieldValue} = this.props.form;

        return (
            <div className="col safeBotton">
                <div className={styles.action}>
                    <Button type="ghost" size="large" onClick={()=>this.showModal()}>修改密码</Button>
                    <Modal wrapClassName={styles.safeModal} title="账号管理"
                           visible={this.state.visible} maskClosable={false}
                           onCancel={()=>this.handleCancel()}
                           footer={[
                                                <Button key={3} type="ghost" size="large" onClick={()=>this.handleCancel()}>取  消</Button>,
                                                <Button key={4} type="primary" disabled={(getFieldValue('change') && getFieldValue('change').length>5)?false:true} size="large" onClick={()=>this.pwdOk()}>
                                                  确  认
                                                </Button>
                                              ]}>
                        <Form form={this.props.form}>
                            <div className="row">
                                <div className="col">
                                    <FormItem label="旧密码：">
                                        <Input {...getFieldProps('change', {
                                            rules: [
                                                {
                                                    required: true,
                                                    whitespace: true,
                                                    message: '请输入旧密码'
                                                }
                                            ]
                                        })} placeholder="请输入旧密码" type="password"/>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="新密码：">
                                        <Input {...getFieldProps('newPwd', {
                                            rules: [
                                                {
                                                    required: true,
                                                    min: 6,
                                                    max: 16,
                                                    whitespace: true,
                                                    message: '密码是6～16位数字或字母'
                                                },
                                                {validator: (rule, value, callback)=>this.checkPass(rule, value, callback)},
                                            ]
                                        })} placeholder="请输入新密码" type="password"/>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="重复密码：">
                                        <Input {...getFieldProps('newPwd2', {
                                            rules: [
                                                {
                                                    required: true,
                                                    whitespace: true,
                                                    message: '请输入重复密码'
                                                },
                                                {validator: (rule, value, callback)=>this.checkPass2(rule, value, callback)},
                                            ]
                                        })} placeholder="6-16位数字或英文字符" type="password"/>
                                    </FormItem>
                                </div>
                            </div>
                        </Form>
                    </Modal>
                </div>
            </div>
        );
    }
}

ChangePwd = createForm()(ChangePwd);
ChangePwd = withRouter(connect()(ChangePwd));
ChangePhone = createForm()(ChangePhone);
ChangePhone = withRouter(connect()(ChangePhone));


class Safe extends React.Component {
    render() {
        let telphone = '';
        if (this.props.data.phone) {
            telphone = this.props.data.phone.substring(0, 3) + "****" + this.props.data.phone.substring(7, 11);
        }

        return (
            <div className={styles.safe}>
                <div className={styles.panelHead}>
                    <div className={styles.panelTitle}>
                        账号管理<span>(忘记密码修改，请及时联系管理员)</span>
                    </div>
                </div>
                <div className={styles.panelBody}>
                    <Form>
                        <div className="row">
                            <div className="col">
                                <FormItem label="您的帐号：">
                                    <label className={styles.labelContent}>{this.props.data.name}</label>
                                </FormItem>
                            </div>
                            <ChangePwd result={this.props.result} doctorId={this.props.doctorId}/>
                            <div className="col">
                            </div>
                            <div className="col">
                            </div>
                        </div>
                    </Form>
                </div>
                <div className={styles.panelHead}>
                    <div className={styles.panelTitle}>
                        手机管理<span>(忘记手机号，请及时联系管理员)</span>
                    </div>
                </div>
                <div className={styles.panelBody}>
                    <Form>
                        <div className="row">
                            <div className="col">
                                <FormItem label="手机号码：">
                                    <label className={styles.labelContent}>{telphone}</label>
                                </FormItem>
                            </div>
                            <ChangePhone result={this.props.result} doctorId={this.props.doctorId}/>
                        </div>
                    </Form>
                </div>
                <div className={styles.panelHead}></div>
            </div>
        );
    }
}

export default withRouter(connect()(Safe));
