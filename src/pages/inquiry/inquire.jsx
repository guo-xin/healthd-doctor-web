import styles from './inquire.less';
import React, {Component}from 'react';

export default class Inquire extends Component{
    render(){
        return(
            <div className={styles.wrapper}>
                {this.props.children}
            </div>
        );
    }
}