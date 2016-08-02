import React, {Component} from 'react';
import {Form, Input, Button, Modal, message} from 'antd';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {signIn, resetToken} from 'redux/actions/auth';
import cookie from 'react-cookie';
import Image from '../../components/image/image.jsx';
import styles from './index.less';

import {getDoctorResetPwd} from 'redux/actions/doctor';

const FormItem = Form.Item;

function noop() {
    return false;
}
class SendEmail extends Component {
    state = {
        visible: false,
        loading: false
    };

    sendEmail() {
        const {dispatch, form} = this.props;
        let email = form.getFieldsValue().change;

        form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            } else {
                this.setState({
                    loading: true
                });
                let hide = message.loading('正在加载...', 0);
                dispatch(getDoctorResetPwd(email)).then(()=> {
                    if (this.props.result === 1) {
                        let {setFields, getFieldValue} = this.props.form;
                        setFields({
                            change: {
                                value: getFieldValue('change'),
                                errors: ['邮箱未注册！']
                            }
                        });
                    } else {
                        hide();
                        message.success('密码已发送至邮箱。');
                        this.handleCancel();
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

    /*点击取消关闭弹出层*/
    handleCancel() {
        this.setState({
            visible: false
        });
        setTimeout(()=> {
            this.props.form.resetFields();
        }, 100);
    }

    showModal() {
        this.setState({
            visible: true
        });
    }

    render() {
        const {getFieldProps, getFieldValue} = this.props.form;

        return (
            <div>
                <a className={styles.forgetPwd} onClick={()=>this.showModal()}>忘记密码?</a>
                <Modal wrapClassName={styles.safeModal} title="找回密码" visible={this.state.visible}
                       maskClosable={false} onCancel={()=>this.handleCancel()} onOk={()=>this.sendEmail()}>
                    <Form form={this.props.form}>
                        <div className="row">
                            <div className="col">
                                <FormItem label="邮箱：">
                                    <Input {...getFieldProps('change', {
                                        rules: [
                                            {
                                                required: true,
                                                pattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
                                                whitespace: true,
                                                message: '请输入正确的邮箱地址'
                                            }
                                        ]
                                    })} placeholder="请输入正确的邮箱地址" type="text"/>
                                </FormItem>
                            </div>
                        </div>
                    </Form>
                </Modal>
            </div>
        );
    }
}

SendEmail = Form.create()(SendEmail);
SendEmail = withRouter(connect()(SendEmail));

class Login extends Component {
    state = {
        disabled: false,
        result: 0,
        code: undefined
    };

    componentWillMount() {
        cookie.remove('doctorStatu');
        let cookieData = cookie.load('healthD');
        this.state.data = cookieData || {};
    }

    checkAuth() {
        let {isAuthenticated}=this.props;
        if (isAuthenticated) {
            let {router, location} = this.props;

            let next = location.query.next || '/';

            router.replace(next);
        }
    }

    signIn(values){
        this.setState({disabled: true});
        this.props.dispatch({
            type: 'RESET'
        });
        this.props.dispatch(signIn(values)).then(
            (action)=> {
                let result = (action.response || {}).result;
                let code = (action.response || {}).code;

                this.setState({
                    disabled: false,
                    result: result,
                    code: code
                });

                if (result == 0) {
                    this.checkAuth();
                } else {
                    let {setFields, getFieldValue} = this.props.form;

                    setFields({
                        u: {
                            value: getFieldValue('u'),
                            errors: ['']
                        },
                        p: {
                            value: getFieldValue('p'),
                            errors: ['用户名或者密码错误']
                        }
                    });
                }

            },
            (response)=> {
                this.setState({
                    disabled: false
                });
            }
        );
    }

    handleSubmit(e) {
        e.preventDefault();

        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            } else {
                this.signIn(values);
            }

        });
    }

    render() {
        const {getFieldProps, getFieldError} = this.props.form;
        const {data} = this.state;

        return (
            <div className={styles.wrapper}>
                <div>
                    <Form horizontal form={this.props.form} onSubmit={(e)=>this.handleSubmit(e)}>
                        <FormItem >
                            <div className={styles.avatar}>
                                <span>
                                    <Image src={data.h || require('assets/images/defaultDocHead.png')}
                                           defaultImg={require('assets/images/defaultDocHead.png')} />
                                </span>
                            </div>
                        </FormItem>
                        <FormItem >
                            <Input autoComplete="off"
                                   onContextMenu={noop}
                                   onPaste={noop}
                                   placeholder="请输入账户名"
                                {...getFieldProps('u', {
                                    initialValue: data.u || '',
                                    rules: [
                                        {required: true, message: '请输入账户名'}
                                    ]
                                })} />
                        </FormItem>
                        <FormItem>
                            <Input autoComplete="off"
                                   onContextMenu={noop}
                                   onPaste={noop}
                                   type="password"
                                   placeholder="请输入密码"
                                {...getFieldProps('p', {
                                    initialValue: '',
                                    rules: [
                                        {required: true, message: '请输入密码'}
                                    ]
                                })} />
                            <SendEmail result={this.props.response}/>
                        </FormItem>

                        <FormItem>
                            <Button disabled={this.state.disabled} type="primary" size="small"
                                    htmlType="submit">登录</Button>
                        </FormItem>
                    </Form>

                    <p>您好，欢迎您使用“我有医生”医生服务端</p>
                    <p>祝您一天好心情</p>
                </div>
            </div>
        );
    }
}

Login = Form.create()(Login);


const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.authStore.isAuthenticated,
        response: state.doctorStore.response
    };
};

export default withRouter(connect(mapStateToProps)(Login));