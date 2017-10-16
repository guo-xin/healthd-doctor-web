import React, {Component}from 'react';
import {Radio, Icon} from 'antd';
import styles from './displayMode.less'

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

export default class DisplayMode extends Component {
    render() {
        return (
            <span className={styles.wrapper}>
                <RadioGroup defaultValue={this.props.displayType || "0"}>
                    <RadioButton value="0" disabled={this.props.displayType=='1'}><Icon type="bars"/>列表</RadioButton>
                    <RadioButton value="1" disabled={this.props.displayType!=='1'}><Icon type="appstore"/>标签</RadioButton>
                </RadioGroup>
            </span>
        )
    }
}