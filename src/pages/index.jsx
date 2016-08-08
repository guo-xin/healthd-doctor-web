import '../assets/style/antd.less';
import styles from './layout.less';
import Video from '../components/video/video';

import React from 'react';
import {message} from 'antd';
import Header from '../components/header';
import * as socket from '../util/socket.jsx';
import * as store from 'redux/store';
import {resetToken} from 'redux/actions/auth';


class App extends React.Component {
    timer = null;

    constructor(props) {
        super(props)
    }

    componentDidMount(){
        message.config({
            duration: 2
        });

        this.resetToken();
        socket.windowListen();
    }

    resetToken(){
        clearTimeout(this.timer);
        this.timer = setTimeout(()=>{
            let data = store.getState().authStore || {};

            if(data.userName){
                store.dispatch(resetToken({
                    u:data.userName
                }));
            }

            this.resetToken();
        },3*60*60*1000);
    }

    render() {
        return (
            <div>
                <Video></Video>

                <Header></Header>
                <div className={styles.container}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}


module.exports = App;