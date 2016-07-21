import styles from './header.less';
import React from 'react';
import {Link} from 'react-router';

class Nav extends React.Component {
    onNavChange(e, url) {
        if (url == "/inquire") {
            let hash = window.location.hash;

            if (hash.indexOf("/inquire/archive") !== -1) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }

    }

    render() {
        return (
            <ul className={styles.nav}>
                <li><Link activeClassName={styles.active} to="/home">首页</Link></li>
                <li><Link activeClassName={styles.active} onClick={(e)=>this.onNavChange(e,"/inquire")}
                          to="/inquire">问诊</Link></li>
                {/*<li><Link activeClassName={styles.active} to="/callback">回访</Link></li>
                 <li><Link activeClassName={styles.active} to="/toolbar">工具栏设置</Link></li>
                 <li><Link activeClassName={styles.active} to="/addPatient">添加新患者</Link></li>*/}
            </ul>
        );
    }
}

export default Nav;