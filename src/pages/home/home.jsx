import React from 'react';
import Schedule from './schedule';
import Doctors from './doctors';
import Image from 'components/image/image';

import {Carousel} from 'antd'
import {connect} from 'react-redux';

import styles from './home.less'
class Home extends React.Component {
    render() {
        const {data = {}} = this.props;
        return (
            <div className={styles.wrapper}>
                <div className={styles.top}>
                    <div className={styles.right}>
                        <Carousel autoplay effect="fade" speed="300" autoplaySpeed="5000">
                            <div><img src={require('./images/right1.jpg')} alt=""/></div>
                            <div><img src={require('./images/right2.jpg')} alt=""/></div>
                        </Carousel>
                    </div>
                    <div className={styles.left}>
                        <Image src={data.photoShow+"@324w_0e"} defaultImg={require("./images/doctor.png")}/>
                        <Doctors/>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <Schedule/>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (globalStore, ownProps) => {
    const {doctorStore, authStore}  = globalStore;

    return {
        data: doctorStore.data
    };
};

export default connect(mapStateToProps)(Home);