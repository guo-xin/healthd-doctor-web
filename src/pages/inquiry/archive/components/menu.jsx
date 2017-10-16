import React, {Component}from 'react';
import {Link} from 'react-router';
import styles from './menu.less'

export default class Menu extends Component{
    render(){
        return(<ul className={styles.wrapper}>
            <li>
                <Link activeClassName={styles.active} to="/inquire/archive/waiting">等待问诊</Link>
            </li>
            <li>
                <Link activeClassName={styles.active} to="/inquire/archive/exceptionalInquiry">异常问诊</Link>
            </li>
            <li>
                <Link activeClassName={styles.active} to="/inquire/archive/todo">待归档问诊</Link>
            </li>
            <li>
                <Link activeClassName={styles.active} to="/inquire/archive/done">已归档问诊</Link>
            </li>
        </ul>)
    }
}