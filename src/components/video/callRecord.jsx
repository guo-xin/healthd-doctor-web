import React from 'react';
import styles from './callRecord.less';
import * as global from 'util/global';

class CallRecord extends React.Component{
    isHaveSelectedVideo = false;

    state = {
        selectedVideo: {}
    };

    onVideoChange(item) {
        this.setState({
            selectedVideo: Object.assign({}, item)
        });
    }

    onDoubleClick(item) {
        let {togglePlay} = this.props;

        this.setState({
            selectedVideo: Object.assign({}, item)
        });

        togglePlay(true);
    }

    getUrl(){
        let item = this.state.selectedVideo;

        if (!this.isHaveSelectedVideo) {
            let callRecords = this.props.callRecords || [];
            if (callRecords.length > 0) {
                this.state.selectedVideo = callRecords[0];

                item = callRecords[0];
            }
        }

        return item.recordURL;
    }

    
    getCallRecords(callRecords = []) {
        let list;
        let isHaveSelectedVideo = false;
        let flag;
        let {selectedVideo={}} = this.state;

        if (callRecords.length > 0) {
            list = callRecords.map((item, index)=> {
                flag = selectedVideo.recordURL === item.recordURL;

                if(flag){
                    isHaveSelectedVideo = flag;
                }

                return <li key={index} onClick={()=>this.onVideoChange(item)}
                           onDoubleClick={()=>this.onDoubleClick(item)}
                           className={flag?styles.active:''}>
                <span>
                    <span className={styles.recordsLeft + ' ' + (item.callType==2? styles.videoIcon:styles.audioIcon)}>
                    </span>
                    <span className={styles.recordsRight}>
                        <span className={styles.date}>
                            {global.formatDate(item.startTime, 'MM月dd日 HH:mm')}
                        </span>

                        <span className={styles.duration}>
                            时长：{global.formatTime((item.endTime - item.startTime) / 1000)}
                        </span>
                    </span>
                </span>
                </li>
            });

            return <ul className={styles.callRecords}>{list}</ul>
        } else {
            this.state.selectedVideo = {};
        }

        this.isHaveSelectedVideo = isHaveSelectedVideo;

        return null;
    }
    
    
    render(){
        const {callRecords, isShowCallRecords} = this.props;

        let records = this.getCallRecords(callRecords);

        return (
            <div className={styles.recordsContainer} style={{display: isShowCallRecords? 'block': 'none'}}>
                {records}
            </div>
        );
    }
}

export default CallRecord;

