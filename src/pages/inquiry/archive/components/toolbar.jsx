import React, {Component} from 'react';
import { Form, Input, Select, Button } from 'antd';
import DisplayMode from './displayMode';
import styles from './toolbar.less';

const FormItem = Form.Item;

class Toolbar extends Component{
    constructor(props){
        super(props);
    }

    handleSubmit=(e) =>{
        e.preventDefault();
        console.log('收到表单值：', this.props.form.getFieldsValue());
    }

    render(){
        const { getFieldProps } = this.props.form;
        return(
            <Form className={styles.wrapper} inline onSubmit={this.handleSubmit}>
                <FormItem label="ID：">
                    <Input type="text" placeholder="10000" value="111" {...getFieldProps('id', {initialValue: '' })} />

                </FormItem>
                <FormItem label="姓名：">
                    <Input type="text" placeholder="张三" {...getFieldProps('id', {initialValue: '' })}  />
                </FormItem>
                <FormItem label="排序方式：">
                    <Select {...getFieldProps('order', { initialValue: '0' })}>
                        <Option value="0">等待时间</Option>
                        <Option value="1">就诊次数</Option>
                        <Option value="2">用户等级</Option>
                    </Select>
                </FormItem>

                <FormItem label="是否首诊：">
                    <Select {...getFieldProps('order', { initialValue: '0' })}>
                        <Option value="0">全部</Option>
                        <Option value="1">是</Option>
                        <Option value="2">否</Option>
                    </Select>
                </FormItem>

                <FormItem>
                    <Button type="primary" htmlType="submit">查询</Button>
                </FormItem>

                <FormItem>
                    <DisplayMode/>
                </FormItem>
            </Form>
        );
    }
}

Toolbar = Form.create()(Toolbar);

export default Toolbar;