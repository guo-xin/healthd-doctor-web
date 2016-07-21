import React, {Component}from 'react';
import {Spin} from 'antd';
import Menu from './components/menu';
import styles from './archive.less';

import {withRouter} from 'react-router';
import {connect} from 'react-redux';

import {getInquireNumber} from 'redux/actions/inquire';

export  default class Archive extends Component {
    state = {
        loading: false
    };

    componentDidMount() {
        const {dispatch, router} = this.props;
        let currentUrl = window.location.hash;

        let regexHash = /\/inquire\/archive\/[waiting|exceptionalInquiry|todo|done]/.test(currentUrl);
        if (regexHash) {

        } else {
            this.setState({
                loading: true
            });
            dispatch(getInquireNumber()).then(
                ()=> {
                    this.setState({
                        loading: false
                    });

                    const {number = {}} = this.props;

                    if (number.waitNum !== 0) {
                        router.replace('/inquire/archive/waiting');
                    } else if (number.exceptionNum !== 0) {
                        router.replace('/inquire/archive/exceptionalInquiry');
                    } else if (number.verifiedNum !== 0) {
                        router.replace('/inquire/archive/todo');
                    } else if (number.archivedNum !== 0) {
                        router.replace('/inquire/archive/done');
                    } else {
                        router.replace('/inquire/archive/waiting');
                    }
                },
                ()=> {
                    this.setState({
                        loading: false
                    });
                    router.replace('/inquire/archive/waiting');
                }
            )
        }
    }

    render() {
        let {loading}=this.state;
        return (
            <div className={styles.wrapper}>
                <Spin spinning={loading}>
                    <div style={{visibility: loading ? "hidden": "visible"}}><Menu/></div>
                    <div className={styles.content}>
                        <div>
                            {this.props.children}
                        </div>
                    </div>
                </Spin>
            </div>

        );
    }
}

const mapStateToProps = (globalStore) => {
    const {inquireStore}  = globalStore;
    return {
        number: inquireStore.number
    };
};

export default withRouter(connect(mapStateToProps)(Archive));
