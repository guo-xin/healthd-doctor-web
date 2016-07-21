import styles from './addPatient.less';
import React from 'react';
import { Form, Input, Button, Select } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

export default class AddPatient extends React.Component{
    render(){
        return(
            <div className={styles.wrapper}>
                <div className={styles.panel}>
                    <div className={styles.panelHead}>
                        <div className={styles.panelTitle}>
                            基本信息
                        </div>
                    </div>
                    <div className={styles.panelBody}>
                        <Form>
                            <div className="row">
                                <div className="col">
                                    <FormItem label="ID：">
                                        <Input placeholder="" />
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="姓名：" required>
                                        <Input placeholder="" />
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="性别：" required>
                                        <Input placeholder="" />
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="出生日期：" required>
                                        <Input placeholder="" />
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="年龄：">
                                        <Input placeholder="" />
                                    </FormItem>
                                </div>
                            </div>
                            <div className={styles.line}></div>
                            <div className="row">
                                <div className="col">
                                    <FormItem label="身份证号：">
                                        <Input placeholder="" />
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="手机：">
                                        <Input placeholder="" />
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="民族：">
                                        <Select defaultValue="0" >
                                            <Option value="0">汉族</Option>
                                            <Option value="1">其他</Option>
                                        </Select>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="身高（cm）：">
                                        <Input placeholder="" />
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="体重（kg）：">
                                        <Input placeholder="" />
                                    </FormItem>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <FormItem label="婚姻情况：">
                                        <Select defaultValue="0">
                                            <Option value="0">已婚</Option>
                                            <Option value="1">未婚</Option>
                                        </Select>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="文化程度：">
                                        <Select defaultValue="0">
                                            <Option value="0">本科</Option>
                                            <Option value="1">硕士</Option>
                                        </Select>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="宗教信仰：">
                                        <Select defaultValue="0">
                                            <Option value="0">无</Option>
                                            <Option value="1">佛教</Option>
                                        </Select>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="血型：">
                                        <Select defaultValue="0">
                                            <Option value="0">A型</Option>
                                            <Option value="1">B型</Option>
                                        </Select>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="国籍：">
                                        <Select defaultValue="0">
                                            <Option value="0">中国</Option>
                                            <Option value="1">其他</Option>
                                        </Select>
                                    </FormItem>
                                </div>
                            </div>
                            <div className={styles.textarea + " row"}>
                                <FormItem label="备注：">
                                    <Input type="textarea" rows="3" />
                                </FormItem>
                            </div>
                        </Form>
                    </div>
                    <div className={styles.panelHead}>
                        <div className={styles.panelTitle}>
                            联系人信息
                        </div>
                    </div>
                    <div className={styles.panelBody}>
                        <Form>
                            <div className="row">
                                <div className="col">
                                    <FormItem label="联系人：">
                                        <Input placeholder="" />
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="与问诊人关系：">
                                        <Select defaultValue="0">
                                            <Option value="0">亲戚</Option>
                                            <Option value="1">朋友</Option>
                                        </Select>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="手机号：">
                                        <Input placeholder="" />
                                    </FormItem>
                                </div>
                            </div>
                        </Form>
                    </div>

                    <div className={styles.action}>
                        <Button type="primary" size="large">确定</Button>
                        <Button type="ghost" size="large">取消</Button>
                    </div>
                </div>
            </div>
        );
    }
}