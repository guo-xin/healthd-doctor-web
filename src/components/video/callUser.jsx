import React from 'react';
import styles from './callUser.less';
import * as global from 'util/global';

class CallUser extends React.Component{
    timer = null;

    setHead(url){
        this.refs.head.src = url || global.defaultHead;
    }

    startTimer() {
        this.stopTimer();

        let seconds = -1;
        let container = this.refs.timer;
        let {callUser={}} = this.props;

        this.refs.timerWrapper.style.display = 'block';

        //来电时设置用户头像
        this.setHead(callUser.headPic);

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
        this.setHead(userForVideoArea.headPic);
        this.refs.timerWrapper.style.display = 'none';
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
                        代主诉人：{userForVideoArea.userName || '--'}
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

