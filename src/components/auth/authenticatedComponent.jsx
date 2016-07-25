import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {verifyToken, resetToken} from 'redux/actions/auth';
import cookie from 'react-cookie';
import * as socket from 'util/socket.jsx';
import {getDoctorStartInquery, changeDoctorState} from 'redux/actions/doctor';
import {Spin} from 'antd';

export function requireAuthentication(Component) {

    class AuthenticatedComponent extends React.Component {

        componentWillMount() {
            this.checkAuth(this.props.isAuthenticated);
        }

        componentWillReceiveProps(nextProps) {
            this.checkAuth(nextProps.isAuthenticated);
        }

        checkAuth(isAuthenticated) {
            if (!isAuthenticated) {
                let data = cookie.load('healthD');
                let {dispatch} = this.props;
                if (data && data.t && data.u) {
                    dispatch(verifyToken(data)).then((action)=> {
                        let result = (action.response || {}).result;

                        if (result !== 0) {
                            this.reLogin();
                        } else {
                            dispatch(resetToken({
                                u: data.u
                            })).then(
                                (action)=> {
                                    this.resetData();
                                },
                                ()=> {
                                    this.resetData();
                                }
                            );
                        }

                    }, ()=> {
                        this.reLogin();
                    });
                } else {
                    this.reLogin();
                }
            }
        }

        resetData() {
            let {dispatch, doctorId} = this.props;

            let doctorS = cookie.load('doctorStatu');
            let workingStatus = doctorS.workingStatus;
            if (doctorS && doctorS.attendance === false) {
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