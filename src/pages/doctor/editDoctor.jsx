import React from 'react';
import {Form, Input, Button, message, Modal} from 'antd';
import styles from './editDoctor.less';

import Information from './information';
import Safe from './safe';

import {connect} from 'react-redux';
import {postDoctorCheckPwd, postDoctorChangeIntroduce, getDoctorByUserId} from 'redux/actions/doctor';


class EditDoctor extends React.Component {

    componentDidMount() {
        this.getDoctorList();
    }

    getDoctorList() {
        const {dispatch} = this.props;
        dispatch(getDoctorByUserId());
    }

    state = {
        flag: 0
    };

    constructor(props) {
        super(props);
        this.state.flag = +this.props.params.flag;
    }

    onChangeTag(flag) {
        if (flag === this.state.flag) {
            return;
        }
        this.setState({
            flag: flag
        });
    }

    render() {
        let {flag} = this.state;
        const {data = {}, doctorId = {}} = this.props;

        return (
            <div className={styles.wrapper}>
                <div>
                    <div className={styles.panel}>
                        <div className={styles.left}>
                            <div >
                                <div className={styles.panelTitle}>基本信息</div>
                                <ul>
                                    <li className={flag==0? styles.active:""} onClick={()=>this.onChangeTag(0)}><a
                                        href="javascript:;">帐户安全</a></li>
                                    <li className={flag==1? styles.active:""} onClick={()=>this.onChangeTag(1)}><a
                                        href="javascript:;">基本信息与个人说明</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className={styles.right}>
                            <div style={{"display":(flag===0?"block":"none")}}>
                                <Safe data={data} doctorId={doctorId}/>
                            </div>
                            <div style={{"display":(flag!== 0?"block":"none")}}>
                                <Information data={data} doctorId={doctorId}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (globalStore, ownProps) => {
    const {doctorStore, authStore}  = globalStore;

    return {
        data: Object.assign({}, doctorStore.data),
        doctorId: authStore.id
    };
};

export default connect(mapStateToProps)(EditDoctor);