import React from 'react';
import Toolbar from './components/toolbar';
import DisplayMode from './components/displayMode';
import {Table} from 'antd';
import styles from './archive.less';

import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {getDoneCasesByDoctorId, setCurrentCase} from 'redux/actions/case';
import * as global from 'util/global';

class Done extends React.Component {
    columns = [
        {
            title: 'ID',
            dataIndex: 'patientId',
            render: (text, record, index)=> {
                return global.formatPatientCode(record.patientCode) || '--';
            }
        },
        {
            title: '姓名',
            dataIndex: 'realName',
            render: (text, record, index)=> {
                //return <a href="javascript:;" onClick={()=>this.goToDetail(text,record, index)}>{text}</a>;
                return text;
            }
        },
        {
            title: '性别',
            dataIndex: 'sex',
            render(text) {
                return global.getGenderText(text);
            }
        },
        {
            title: '年龄',
            dataIndex: 'age',
            render(text, record, index) {
                return global.getAge(record.birthday, record.createdTime);
            }
        },
        {
            title: '就诊次数',
            dataIndex: 'caseCount',
            render(text) {
                if (text) {
                    return '第' + text + '次';
                } else {
                    return '--';
                }

            }
        },
        {
            title: '诊断',
            dataIndex: 'diagnosisName'
        },
        {
            title: '与用户关系',
            dataIndex: 'relation',
            render(text) {
                return global.getRelationText(text);
            }
        },
        {
            title: '问诊时长',
            dataIndex: 'timeCount',
            render(text, record) {
                return global.formatTime((record.endTime - record.startTime) / 1000) || '--';
            }
        },
        {
            title: '问诊时间',
            dataIndex: 'createdTime',
            render(text) {
                return global.formatDate(text, 'yyyy-MM-dd HH:mm');
            }
        },
        {
            title: '归档时间',
            dataIndex: 'updateTime',
            render(text) {
                return global.formatDate(text, 'yyyy-MM-dd HH:mm');
            }
        },
        {
            title: '操作',
            dataIndex: 'operations',
            render: (text, record, index)=> {
                return <a href="javascript:;" onClick={()=>this.goToDetail(text,record, index)}>查看</a>;
            }
        }
    ];

    state = {
        loading: true
    };

    goToDetail(text, record, index) {
        let {router, dispatch} = this.props;
        dispatch(setCurrentCase({
            patientId: record.patientId,
            caseId: record.id,
            inquiryId: record.inquiryId,
            state: 1
        }));

        router.push(`/inquire/case/detail`);
    }

    handleTableChange(pagination, filters, sorter) {
        this.fetch({
            pageSize: pagination.pageSize,
            currentPage: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    }

    fetch(params = {}) {
        const {dispatch, id} = this.props;

        if (id) {
            this.setState({loading: true});
            dispatch(getDoneCasesByDoctorId(id, params.currentPage, params.pageSize)).then(
                ()=> {
                    this.setState({loading: false});
                },
                ()=> {
                    this.setState({loading: false});
                }
            );
        }

    }

    componentDidMount() {
        this.fetch({
            pageSize: 10,
            currentPage: 1
        });
    }

    render() {
        const {doneCases} = this.props;

        let {data, pagination} = doneCases;

        return (
            <div>
                <div className={styles.top}>
                    <DisplayMode displayType="0"/>
                </div>
                <div className="panel">
                    {
                        /* <div className={styles.panelHead}>
                         <Toolbar displayType="0"></Toolbar>
                         </div>*/
                    }
                    <div className={styles.panelBody}>
                        <Table
                            rowKey={(record, index)=>{return record.key}}
                            columns={this.columns}
                            dataSource={data}
                            pagination={pagination}
                            loading={this.state.loading}
                            onChange={::this.handleTableChange}
                            bordered/>
                    </div>
                </div>
            </div>

        );
    }
}

const mapStateToProps = (globalStore) => {
    const {authStore, caseStore}  = globalStore;
    return {
        doneCases: caseStore.doneCases,
        id: authStore.id
    };
};


export default withRouter(connect(mapStateToProps)(Done));