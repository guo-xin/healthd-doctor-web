import styles from './pictureViewer.less';
import React, {Component} from 'react';
import {Icon} from 'antd';


class PictureViewer extends Component {
    state = {
        isVisible: false,
        index: 0,
        url: '',
        list: []
    };

    setVisible(isVisible) {
        this.setState({
            isVisible: isVisible
        });
    }

    close() {
        this.setVisible(false);
    }

    dialogClick(){
        this.setVisible(false);
    }

    pictureClick(event) {
        event.stopPropagation();
    }

    setData(list=[], isVisible, index){
        if(list.length>0){
            index = index || 0;
            this.setState({
                isVisible: !!isVisible,
                index: index,
                url: list[index],
                list: list
            });
        }
    }

    previous(event) {
        event.stopPropagation();

        let {index, list} = this.state;
        let len = list.length;

        if (len > 0) {
            index = index - 1;
            index = index < 0 ? (len - 1) : index;

            this.setState({
                index: index,
                url: list[index]
            });
        }
    }

    next(event) {
        event.stopPropagation();

        let {index, list} = this.state;
        let len = list.length;

        if (len > 0) {
            index = index + 1;
            index = index > (len - 1) ? 0 : index;

            this.setState({
                index: index,
                url: list[index]
            });
        }
    }

    render() {
        let {isVisible, url} = this.state;
        let img = null;

        if (url) {
            img = <img src={url+"@540h_540w_0e"}/>
        }

        return (
            <div className={styles.wrapper + ' ' + (isVisible?'': styles.hidden)} onClick={()=>this.dialogClick()}>
                <div className={styles.picture} onClick={::this.pictureClick}>
                    <div className={styles.close} onClick={()=>this.close()}>
                        <span><Icon type="cross"/></span>
                    </div>
                    {img}
                    <div className={styles.btnGroup}>
                        <div className={styles.btn} onClick={::this.previous}><img
                            src={require("assets/images/previous.png")}/></div>
                        <div className={styles.btn} onClick={::this.next}><img
                            src={require("assets/images/last.png")}/></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default PictureViewer;
