import React, {Component} from 'react';
import {Tree, Button} from 'antd';
const TreeNode = Tree.TreeNode;
import styles from './template.less';

export default class Template extends Component {
    state = {
        gData: [
            {
                key: '0',
                title: '主诉',
                children: [
                    {
                        key: '01',
                        title: '主诉1'
                    }
                ]
            },
            {
                key: '1',
                title: '全身性症状',
                children: [
                    {
                        key: '11',
                        title: '全身性症状1'
                    }
                ]
            },
            {
                key: '2',
                title: '呼吸系统',
                children: [
                    {
                        key: '21',
                        title: '呼吸系统2'
                    }
                ]
            },
            {
                key: '3',
                title: '循环系统',
                children: [
                    {
                        key: '31',
                        title: '循环系统1'
                    }
                ]
            },
            {
                key: '4',
                title: '消化系统',
                children: [
                    {
                        key: '41',
                        title: '消化系统1'
                    }
                ]
            },
        ],
        expandedKeys: ['0', '1'],
    };

    render() {
        const loop = data => data.map((item) => {
            if (item.children) {
                return <TreeNode key={item.key} title={item.title}>{loop(item.children)}</TreeNode>;
            }
            return <TreeNode key={item.key} title={item.title}/>;
        });

        return (
            <div className={styles.wrapper}>
                <div className={styles.panelHead}>
                    <div className={styles.panelTitle}>
                        系统
                    </div>
                </div>
                <div className={styles.panelBody}>

                    <Tree defaultExpandedKeys={this.state.expandedKeys} openAnimation={{}}>
                        {loop(this.state.gData)}
                    </Tree>
                </div>
                <div className={styles.panelHead}>
                    <Button className={styles.applyBtn}>调用</Button>
                </div>
                <div className={styles.panelBodyDetail}>
                    <dl>
                        <dt>主诉：</dt>
                        <dd>咽痛5小时</dd>
                        <dt>现病史：</dt>
                        <dd>患者因着凉，今天晨起时自觉咽部疼痛。2小时前患者感到咽痛加剧，1小时前患者并感到咽部有球状物阻塞感，同时感到乏力，畏寒。没有发热，没有呼吸困难。</dd>
                        <dt>既往史：</dt>
                        <dd>既往有慢性肾病史，有家族性高血压。</dd>
                        <dt>体格检查：</dt>
                        <dd>PE：T 380 C P100次/分 R34次/分 B.P 130/80mmHg</dd>
                        <dt>
                            辅助检查结果：
                        </dt>
                        <dd>
                            呼吸平稳。 鼓膜无充血无穿孔，标志清晰。各鼻甲无肿胀，双中鼻道无脓涕无新生物。
                            张口无受限，口臭明显，口腔较多分泌物畜流。扁桃体I度大，表面无伪膜。咽后壁轻度充血少量淋巴滤泡增生。无声嘶，无喉鸣。会厌充血，高度肿胀呈球形。声门无法窥及。颈部各区未触及肿大淋巴结，颈部各区无肿胀压痛。
                        </dd>
                        <dt>
                            诊断：
                        </dt>
                        <dd>
                            <ol>
                                <li>急性会厌炎 <br/>G60.92 2014-5-6</li>
                                <li>发烧 <br/>G02.002 2016-3-3</li>
                            </ol>
                        </dd>
                        <dt>
                            诊疗意见：
                        </dt>
                        <dd>
                            <ol>
                                <li>留观，密切观察呼吸及生命体征</li>
                                <li>向上级医师汇报</li>
                                <li>静脉点滴抗生素及激素</li>
                                <li>床旁备气管切开包 5． 病情平稳后行血常规检查</li>
                            </ol>
                        </dd>
                    </dl>
                </div>
            </div>
        );
    }
}