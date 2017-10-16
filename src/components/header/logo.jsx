import styles from './header.less';
import React, {Component} from 'react';

export default class Logo extends Component{
    render(){
        return(
            <div className={styles.logo}>
                <a href="javascript:void(0)">
                    <img src={require('./images/logo.png')} alt=""/>
                </a>
            </div>
        );
    }
}