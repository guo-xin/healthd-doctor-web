import styles from './header.less';

import React from 'react';
import Nav from './nav';
import Logo from './logo';
import User from  './user';
import Message from  './message';

export default class Header extends React.Component{
    render(){
        return(
            <div className={styles.wrapper}>
                <Logo/>
                <div className={styles.navAndMessage}>
                    <Nav/>
                    <Message/>
                </div>
                <User/>
            </div>
        );
    }
}


