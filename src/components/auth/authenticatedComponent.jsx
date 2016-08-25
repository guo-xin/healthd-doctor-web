import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import cookie from 'react-cookie';
import * as socket from 'util/socket.jsx';

import {setAuth} from "redux/actions/auth";
import {getDoctorStartInquery, changeDoctorState, getDoctorQueueCountByUserId} from 'redux/actions/doctor';
import {setCurrentCase} from 'redux/actions/case';
import {setCurrentPatient} from 'redux/actions/patient';
import {Spin} from 'antd';

function parseCookie(val) {
    if(val){
        val = val.replace(/\\"/gi, '"');
        return JSON.parse(val);
    }else{
        return null;
    }
}

export function requireAuthentication(Component) {

    class AuthenticatedComponent extends React.Component {

        componentWillMount() {
            let {dispatch, isAuthenticated} = this.props;

            //设置刷新前最近一次操作的病历和病人
            dispatch(setCurrentCase(cookie.load('c')));
            dispatch(setCurrentPatient(cookie.load('p')));

            this.checkAuth(isAuthenticated);
        }

        componentWillReceiveProps(nextProps) {
            this.checkAuth(nextProps.isAuthenticated);
        }

        checkAuth(isAuthenticated) {
            let data = parseCookie(cookie.load('healthD'));
            let {dispatch} = this.props;
            if (!isAuthenticated) {
                if (data && data.token && data.id) {
                    dispatch(setAuth({
                        userName: data.userName,
                        token: data.token,
                        id: data.id,
                        isResetting: true
                    }));

                    //刷新后进入系统前掉任一接口验证登录是否过期
                    dispatch(getDoctorQueueCountByUserId(data.id)).then((action)=> {
                        let result = (action.response || {}).result;

                        if (result !== 0) {
                            this.reLogin();
                        } else {
                            dispatch(setAuth({
                                userName: data.userName,
                                token: data.token,
                                id: data.id,
                                isAuthenticated: true,
                                isResetting: false
                            }));

                            this.resetData();
                        }
                    }, ()=> {
                        this.reLogin();
                    });
                } else {
                    this.reLogin();
                }
            }else{
                dispatch(getDoctorQueueCountByUserId(data.id));
            }
        }

        resetData() {
            let {dispatch, doctorId} = this.props;

            //根据刷新前记住的医生状态进行改变
            let doctorS = cookie.load('doctorStatu');
            let workingStatus;

            if(doctorS){
                workingStatus = doctorS.workingStatus;
                if (doctorS.attendance === false) {
                    dispatch(getDoctorStartInquery());
                    socket.receiveMessages();

                    if (workingStatus === 1) {
                        workingStatus = 0;
                    }
                    let params = {
                        id: doctorId,
                        workingStatus: workingStatus
                    };
                    dispatch(changeDoctorState(params));
                } else {
                    if (workingStatus === 1) {
                        workingStatus = 9;
                        let params = {
                            id: doctorId,
                            workingStatus: workingStatus
                        };
                        dispatch(changeDoctorState(params));
                    }
                }
            }
        }

        reLogin() {
            let {router} = this.props;
            let redirectAfterLogin = this.props.location.pathname;

            if (redirectAfterLogin.indexOf('/login') == -1) {
                router.replace(`/login?next=${redirectAfterLogin}`);
            } else {
                router.replace(`/login`);
            }
        }

        render() {
            let {isAuthenticated, isResetting} = this.props;
            let data =  (isAuthenticated === true && !isResetting)
                ? <Component {...this.props}/>
                : <Spin><div style={{height: document.body.clientHeight}}/></Spin>;

            return data;

        }
    }

    const mapStateToProps = (state) => ({
        doctorId: state.authStore.id,
        token: state.authStore.token,
        isResetting: state.authStore.isResetting,
        isAuthenticated: state.authStore.isAuthenticated
    });

    return withRouter(connect(mapStateToProps)(AuthenticatedComponent));

}