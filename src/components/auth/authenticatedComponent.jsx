import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {verifyToken} from 'redux/actions/auth';
import cookie from 'react-cookie';
import * as socket from 'util/socket.jsx';

import {getDoctorStartInquery, changeDoctorState} from 'redux/actions/doctor';

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
                let {dispatch, doctorId} = this.props;
                if (data && data.t && data.u) {
                    dispatch(verifyToken(data)).then((action)=> {
                        let result = (action.response || {}).result;

                        if (result !== 0) {
                            this.reLogin();
                        } else {
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

                    }, ()=> {
                        this.reLogin();
                    });
                } else {
                    this.reLogin();
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
            return (
                <div>
                    {this.props.isAuthenticated === true
                        ? <Component {...this.props}/>
                        : null
                    }
                </div>
            )

        }
    }

    const mapStateToProps = (state) => ({
        doctorId: state.authStore.id,
        token: state.authStore.token,
        isAuthenticated: state.authStore.isAuthenticated
    });

    return withRouter(connect(mapStateToProps)(AuthenticatedComponent));

}