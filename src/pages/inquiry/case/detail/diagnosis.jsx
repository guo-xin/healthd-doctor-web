import React from 'react';
import ReactDom from 'react-dom';
import {connect} from 'react-redux';
import {Table, Input, Button, Icon, Select, Checkbox, Modal, message} from 'antd';
import {changeDiagnosisTableData, deleteDiagnosisById} from 'redux/actions/case';
import {getICDTen} from 'redux/actions/dictionary';
import * as global from 'util/global';

import styles from './diagnosis.less';

const confirm = Modal.confirm;
const Option = Select.Option;
let tabIndex = 0;
let timeout;
let currentValue;

class InputEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.record.diagnosisDesc,
            isShowCtrl: true
        };
    }

    enableCtrl(flag) {
        this.setState({
            isShowCtrl: flag
        });
    }

    onDoubleClick() {
        return;
        this.enableCtrl(true)
    }

    onPressEnter(e) {
        return;
        this.enableCtrl(false);
        this.refs['container'].focus();
        e.preventDefault();
        e.stopPropagation();
    }

    onBlur() {
        return;
        this.enableCtrl(false);
    }

    onContainerKeyPress(e) {
        return;
        if (e.key === 'Enter') {
            this.enableCtrl(true);
        }
    }

    onChange(e) {
        let value = e.target.value;
        if (value) {
            value = value.substr(0, 100);
        }

        this.setState({value: value});
        this.props.record.diagnosisDesc = value;
    }

    render() {
        return (
            <div className="diagnosisDescWrapper" ref="container" tabIndex={this.props.tabIndex}
                 onSelectStart={()=>{return false}}
                 onDoubleClick={()=>this.onDoubleClick()}
                 onKeyPress={(e)=>this.onContainerKeyPress(e)}>
                {!this.state.isShowCtrl ? (this.state.value) : (<Input
                    ref="inputCtrl"
                    value={this.state.value}
                    onChange={(e)=>this.onChange(e)}
                    onBlur={()=>this.onBlur()}
                    onSelectStart={()=>{return false}}
                    onPressEnter={(e)=>{this.onPressEnter(e)}}/>)}
            </div>
        )
    }
}

class SelectEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.record.diagnosisName,
            isShowCtrl: true,
            data: []
        };
    }

    enableCtrl(flag) {
        this.setState({
            isShowCtrl: flag
        });

        setTimeout(()=> {
            if (flag)
                ReactDom.findDOMNode(this.refs['selectCtrl']).click();
            else
                this.refs['container'].focus();
        }, 100)
    }

    onDoubleClick() {
        return;
        this.enableCtrl(true)
    }

    onBlur() {
        return;
        this.enableCtrl(false);
    }

    onContainerKeyPress(e) {
        return;
        if (e.key === 'Enter' && !this.state.isShowCtrl) {
            this.enableCtrl(true);
        }
    }

    onChange(val) {
        let {data=[]} = this.state;

        let item = data.find((d)=> {
            return d.code === val
        });

        if (item) {
            val = item.diseaseName;
            this.props.record.diagnosisCode = item.code;
        } else {
            this.props.record.diagnosisCode = '';
        }


        let value = val;

        if (value) {
            value = value.substr(0, 100);
        }

        this.setState({
            value: value
        });

        this.props.record.diagnosisName = value;


        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        if (typeof this.props.onDiagnosisChange == 'function') {
            this.props.onDiagnosisChange(val);
        }

        currentValue = val;
        
        if(!val){
            return;
        }

        timeout = setTimeout(()=> {
            this.props.dispatch(getICDTen(val)).then((action)=> {
                if (currentValue === val && this.state.isShowCtrl) {
                    let list = (action.response || {}).data || [];
                    this.setState({
                        data: list
                    });
                }
            });
        }, 300);
    }

    onSelect(value, option) {
        return;
        this.enableCtrl(false);
    }

    onCheckChange(e) {
        this.props.record.status = e.target.checked ? 1 : 0;
    }

    render() {
        const options = this.state.data.map(d => <Option key={d.code} value={d.code}>{d.diseaseName}</Option>);

        return (
            <div className="selectWrapper" ref="container" tabIndex={this.props.tabIndex}
                 onSelectStart={()=>{return false}}
                 onDoubleClick={()=>this.onDoubleClick()}
                 onKeyPress={(e)=>this.onContainerKeyPress(e)}>
                {!this.state.isShowCtrl ? (<span className="text">{this.state.value}</span>) : (
                    <Select combobox
                            notFoundContent=""
                            value={this.state.value}
                            filterOption={false}
                            defaultActiveFirstOption={false}
                            onBlur={()=>this.onBlur()}
                            onSelect={::this.onSelect}
                            onSelectStart={()=>{return false}}
                            onChange={(v)=>this.onChange(v)}
                            placeholder="请输入诊断"
                            ref="selectCtrl">
                        {options}
                    </Select>
                )}
                <Checkbox defaultChecked={this.props.record.status==1} onChange={::this.onCheckChange}>未明确</Checkbox>
            </div>
        )
    }
}

SelectEdit = connect()(SelectEdit);

class Diagnosis extends React.Component {
    columns = [
        {
            title: '序号',
            width: '6%',
            render: function (text, record, index) {
                return record.isFirst == 0 && !record.parentKey ? (index + 1) : '';
            }
        }, {
            title: 'ICD10',
            dataIndex: 'diagnosisCode',
            width: '12%'
        },
        {
            title: '诊断名称',
            dataIndex: 'diagnosisName',
            width: '34%',
            className: 'cell-diagnose',
            render: (text, record, index)=> {
                tabIndex++;
                return <SelectEdit record={record} tabIndex={tabIndex}
                                   onDiagnosisChange={::this.onDiagnosisChange}></SelectEdit>;
            }
        },
        {
            title: '备注',
            dataIndex: 'diagnosisDesc',
            className: 'cell-desc',
            width: '34%',
            render: function (text, record, index) {
                tabIndex++;
                return <InputEdit record={record} tabIndex={tabIndex}></InputEdit>
            }
        },
        {
            title: '操作',
            width: '14%',
            render: (text, record, index)=> {
                let length = this.props.data.length;

                return (
                    <span className="btn-group">
                    <span>
                        {record.isFirst === 0 &&
                        <a className="add" href="javascript:;" onClick={()=>this.addSubRow(text, record, index)}><Icon
                            type="plus-circle-o"/>子诊断</a>}
                    </span>
                    <span>
                        { (!(length === 1 && index === 0 && record.isFirst === 0 && !record.parentKey)) &&
                        <a className="delete" href="javascript:;"
                           onClick={()=>this.deleteRow(text, record, index)}><Icon
                            type="minus-circle-o"/>删除</a>}
                    </span>
               </span>
                );
            }
        }
    ];

    constructor(props) {
        super(props);
    }

    addRow(text, record, index) {
        let {data, count, expandedRowKeys} = this.props;
        let time = new Date().valueOf();

        count++;

        let key = time + count + '';

        expandedRowKeys.push(key);

        data.push({
            key: key,
            isFirst: 0,
            diagnosisCode: '',
            diagnosisDesc: '',
            diagnosisName: '',
            status: 0
        });


        this.props.dispatch(changeDiagnosisTableData({
            data: data,
            count: count,
            expandedRowKeys: expandedRowKeys
        }));
    }

    addSubRow(text, record, index) {
        let {key, children = []} = record;
        let {data, count} = this.props;
        let time = new Date().valueOf();

        count++;

        children.push({
            key: time + count + '',
            parentKey: key,
            isFirst: 1,
            diagnosisCode: '',
            diagnosisDesc: '',
            diagnosisName: '',
            status: 0
        });

        let parent = data.find((item)=> {
            return item.key === key;
        });

        parent.children = children;

        this.props.dispatch(changeDiagnosisTableData({
            data: data,
            count: count
        }));
    }

    deleteRow(text, record, index) {
        let {dispatch} = this.props;
        let {isFirst, parentKey, diagnosisId}=record;

        if (diagnosisId) {
            let text = "删除后将无法恢复，您确定要删除吗？";

            if (isFirst === 0 && !parentKey) {
                text = "删除后将无法恢复，并且子诊断也将一同删除，您确定要删除吗？"
            }

            confirm({
                title: text,
                content: '',
                onOk: ()=> {
                    let hide = message.loading('正在删除...', 0);

                    dispatch(deleteDiagnosisById(diagnosisId)).then(
                        (action)=> {
                            hide();
                            let result = (action.response || {}).result;

                            if (result === 0) {
                                message.success('删除成功');
                                this.deleteTableRow(record);
                            } else {
                                message.error('删除失败');
                            }

                        },
                        ()=> {
                            hide();
                            message.error('删除失败');
                        }
                    );
                },
                onCancel: ()=> {
                }
            });
        } else {
            this.deleteTableRow(record);
        }
    }

    deleteTableRow(record) {
        let {data, dispatch} = this.props;
        let parentIndex, subIndex, children;
        let {isFirst, key, parentKey}=record;


        if (isFirst == 0 && !parentKey) {
            parentIndex = data.findIndex((item)=> {
                return item.key === key;
            });

            data.splice(parentIndex, 1);
        } else {
            parentIndex = data.findIndex((item)=> {
                return item.key === parentKey;
            });

            children = data[parentIndex].children;

            if (children) {
                subIndex = children.findIndex((item)=> {
                    return item.key === key;
                });

                children.splice(subIndex, 1);

                if (children.length == 0) {
                    delete data[parentIndex].children;
                }
            }
        }

        dispatch(changeDiagnosisTableData({
            data: data
        }));
    }

    getChildren(list = []) {
        return list.map((item, index)=> {
            return (
                <tr key={index}>
                    <td></td>
                    <td className={styles.subDiagnosis}>{item.diagnosisName || '--'}</td>
                    <td>{item.diagnosisCode || '--'}</td>
                    <td>{item.creeatedTime && global.formatDate(item.creeatedTime)}</td>
                </tr>
            );
        });
    }

    st = null;
    onDiagnosisChange(val) {
        clearTimeout(this.st);
        this.st = setTimeout(()=>{
            let flag = false;
            if (val) {
                flag = true;
            } else {
                let {data} = this.props;
                if(data && data.length>0){
                    for(let i=0; i<data.length; i++){
                        if (data[i].diagnosisName) {
                            flag = true;
                            break;
                        }
                    }
                }
            }

            if (typeof this.props.setIsHasDiagnosis == 'function') {
                this.props.setIsHasDiagnosis(flag);
            }

            clearTimeout(this.st);
            this.st = null;
        },100);
    }

    render() {
        tabIndex = 0;
        let {data=[], expandedRowKeys, isEditable} = this.props;

        const list = data.map((item, index)=> {
            let children = this.getChildren(item.children);
            return (
                <tbody key={index}>
                <tr>
                    <td>{index + 1}.</td>
                    <td>{item.diagnosisName || '--'}</td>
                    <td>{item.diagnosisCode || '--'}</td>
                    <td>{ item.creeatedTime && global.formatDate(item.creeatedTime)}</td>
                </tr>
                {children}
                </tbody>
            );
        });

        let table;

        if (isEditable) {
            table = <Table ref="table"
                           rowKey={record => record.key}
                           columns={this.columns}
                           expandedRowKeys={expandedRowKeys}
                           dataSource={data}
                           pagination={false}
                           footer={()=>{
                    return (<a href="javascript:;" onClick={()=>this.addRow()}><Icon type="plus-circle-o" />添加主诊断</a>);
                }}
                           bordered/>;
        } else {
            if (list.length > 0) {
                table = <table className={styles.table}>{list}</table>;
            }
        }

        return (
            <div className={styles.wrapper}>
                { table }
            </div>
        );
    }
}

const mapStateToProps = (globalStore) => {
    const {caseStore={}}  = globalStore;
    const {diagnosis={}} = caseStore;

    return {
        count: diagnosis.count,
        expandedRowKeys: diagnosis.expandedRowKeys.slice(),
        data: diagnosis.data.slice()
    };
};


Diagnosis = connect(mapStateToProps)(Diagnosis);

export default Diagnosis;