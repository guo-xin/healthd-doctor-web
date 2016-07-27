import React, {Component} from 'react';
import {Icon} from 'antd';
import styles from './toolbar.less';
import Template from '../tools/template';
import Message from '../tools/message';
import Describe from '../tools/describe';

export default class Toolbar extends Component {
    state = {
        toolType: 2
    };

    constructor(props) {
        super(props);
    }

    onClick() {
        this.props.onToggleTool();
    }

    changeNav(value) {
        this.setState({
            toolType: value
        });
    }

    render() {
        const {showTool} = this.props;
        let toolType = this.state.toolType;

        let wrapperClass = showTool ? styles.showTool : "";

        return (
            <div className={wrapperClass+" "+styles.wrapper}>
                <a href="javascript:;" onClick={()=>this.onClick()}>
                    <Icon type={showTool?"double-right":"double-left"}/>
                    {
                        !showTool && (
                            <span>
                                <img src={require('../../../../assets/images/tool2.png')} alt=""/>
                                <span>工具栏</span>
                            </span>
                        )
                    }
                </a>
                {
                    showTool && (<ul className={"clearfix "+styles.topTool}>
                        {/*<li>
                            <a href="javascript:;">
                                <img src={require('../../../../assets/images/tool1.png')} alt=""/>
                                <span>元素库</span>
                            </a>
                        </li>
                        <li className={toolType === 1?'active':''} onClick={()=>this.changeNav(1)}>
                            <a href="javascript:;">
                                <img src={require('../../../../assets/images/tool2.png')} alt=""/>
                                <span>模版库</span>
                            </a>
                        </li>
                        <li>
                            <a href="javascript:;">
                                <img src={require('../../../../assets/images/tool3.png')} alt=""/>
                                <span>历史纪录</span>
                            </a>
                        </li>*/}
                        <li className={toolType === 3?'active':''} onClick={()=>this.changeNav(3)}>
                            <a href="javascript:;">
                                <img src={require('../../../../assets/images/tool6.png')} alt=""/>
                                <span>发短信</span>
                            </a>
                        </li>
                        <li className={toolType === 2?'active':''}  onClick={()=>this.changeNav(2)}>
                            <a href="javascript:;">
                                <img src={require('../../../../assets/images/tool4.png')} alt=""/>
                                <span>患者描述</span>
                            </a>
                        </li>

                        {/*<li>
                            <a href="javascript:;">
                                <img src={require('../../../../assets/images/tool5.png')} alt=""/>
                                <span>知识库</span>
                            </a>
                        </li>*/}
                    </ul>)
                }
                {
                    showTool && (<div className={styles.toolBody}>
                        {/*{toolType === 1 && <Template/>}*/}
                        {toolType === 2 && <Describe/>}
                        {toolType === 3 && <Message/>}
                    </div>)
                }
            </div>
        );
    }
}