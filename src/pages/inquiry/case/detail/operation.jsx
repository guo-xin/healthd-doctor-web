import React from 'react';
import styles from './operation.less';

export default class Operation extends React.Component {

    back() {
        if (typeof this.props.back === 'function') {
            this.props.back();
        }
    }

    save() {
        if (typeof this.props.save === 'function') {
            this.props.save();
        }
    }

    archive() {
        if (typeof this.props.archive === 'function') {
            this.props.archive();
        }
    }

    invalid() {
        if (typeof this.props.invalid === 'function') {
            this.props.invalid();
        }
    }

    free() {
        if (typeof this.props.free === 'function') {
            this.props.free();
        }
    }

    render() {
        const {back, save, archive} = this.props.operationsState || {};

        return (
            <ul className={styles.wrapper}>
                {back && <li>
                    <a href="javascript:;" onClick={()=>this.back()}>
                        <img src={require('assets/images/op1.png')} alt=""/><span>返回目录</span>
                    </a>
                </li>}
                {/*
                 <li><a href="javascript:;"><img src={require('assets/images/op2.png')} alt=""/><span>下一位</span></a></li>
                 <li><a href="javascript:;"><img src={require('assets/images/op3.png')} alt=""/><span>转为排队</span></a></li>
                 */}
                {save &&
                <li><a href="javascript:;" onClick={()=>this.save()}><img src={require('assets/images/op7.png')}
                                                                          alt=""/><span>保存</span></a></li>}
                {archive &&
                <li><a href="javascript:;" onClick={()=>this.archive()}><img src={require('assets/images/op4.png')}
                                                                             alt=""/><span>归档</span></a></li>}
                {/*
                 <li><a href="javascript:;" onClick={()=>this.invalid()}><img src={require('assets/images/op5.png')} alt=""/><span>作废</span></a></li>
                 <li><a href="javascript:;" onClick={()=>this.free()}><img src={require('assets/images/op6.png')} alt=""/><span>免单</span></a></li>
                 */}
            </ul>
        );
    }
}