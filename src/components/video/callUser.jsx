import React from 'react';
import styles from './callUser.less';
import * as global from 'util/global';

class CallUser extends React.Component{
    timer = null;

    setUser(url, name){
        this.refs.head.src = url || global.defaultHead;
        this.refs.name.innerHTML = name || '--';
    }

    showTimer(isShow){
        this.refs.timerWrapper.style.display = isShow ? 'block':'none';
    }

    startTimer() {
        this.stopTimer();

        let seconds = -1;
        let container = this.refs.timer;
        let {callUser={}} = this.props;

        this.showTimer(true);

        //来电时设置用户头像
        this.setUser(callUser.headPic, callUser.userName);

        changeTime();

        this.timer = setInterval(()=> {
            changeTime();
        }, 1000);


        function changeTime() {
            seconds += 1;
            container.innerHTML = [parseInt(seconds / 60 / 60), parseInt(seconds / 60 % 60), seconds % 60].join(":")
                .replace(/\b(\d)\b/g, "0$1");
        }
    }

    stopTimer() {
        let {userForVideoArea} = this.props;
        this.setUser(userForVideoArea.headPic, userForVideoArea.userName);
        this.showTimer(false);
        clearInterval(this.timer);
    }

    render(){
        let {userForVideoArea} = this.props;

        return (
            <div className={styles.userWrapper}>
               <div>
                    <span className={styles.head}>
                        <img ref="head" src={userForVideoArea.headPic || global.defaultHead} alt=""/>
                    </span>
                    <span className={styles.userName}>
                        代主诉人：<span ref="name">{userForVideoArea.userName || '--'}</span>
                    </span>
               </div>
                <div ref="timerWrapper" style={{display:'none'}}>
                    <span className={styles.process}>正在通话中</span>
                    <span className={styles.timer} ref="timer"></span>
                </div>
            </div>
        );
    }
}

export default CallUser;
