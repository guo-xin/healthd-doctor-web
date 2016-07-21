import React from 'react';
import styles from './case.less';
import * as store from 'redux/store';
import { withRouter } from 'react-router';

class Case extends React.Component{
    componentWillMount() {
        this.props.router.setRouteLeaveHook(
            this.props.route,
            this.routerWillLeave
        )
    }

    routerWillLeave() {
        let {callStore} = store.getState();

        //通话中禁止离开病历页面（/inquire/case）
        if(callStore.callState==-1){
            return true;
        }else{
            return false;
        }
    }

    render(){
        return(
            <div className={styles.wrapper}>
                <div className={styles.video}>
                </div>


                <div className={styles.content}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default withRouter(Case);