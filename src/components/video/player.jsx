import React from 'react';
import styles from './player.less';
import {message} from 'antd';

class Player extends React.Component{
    url = '';

    onPause(e) {
        let {togglePlayState} = this.props;
        togglePlayState(false);
    }

    onSeeked(e) {
        let {togglePlayState} = this.props;
        togglePlayState(true);
    }

    onError(e) {
        let {togglePlayState} = this.props;
        togglePlayState(false);


        if (this.refs.video.getAttribute('src')) {
            message.error('播放出错');
        }
    }

    onEnd(e) {
        let {togglePlayState} = this.props;
        togglePlayState(false);
    }

    play(url) {
        let {togglePlayState} = this.props;
        togglePlayState(true);

        if(url != this.url){
            this.url = url;
            this.refs.video.setAttribute('src', url);
        }

        this.refs.video.play();
    }

    pause() {
        let {togglePlayState} = this.props;
        togglePlayState(false);

        this.refs.video.pause();
    }

    render(){
        let {isShowCallRecords, isShowVideoCtrl} = this.props;

        return (
            <div className={styles.videoContainer}
                 style={{display: isShowCallRecords && isShowVideoCtrl ? 'block': 'none'}}>
                <video
                    ref="video"
                    controls="controls"
                    preload="none"
                    onPause={::this.onPause}
                    onSeeked={::this.onSeeked}
                    onEnded={::this.onEnd}
                    onError={::this.onError}>
                    您的浏览器不支持 video 标签。
                </video>
            </div>
        );
    }
}

export default Player;

