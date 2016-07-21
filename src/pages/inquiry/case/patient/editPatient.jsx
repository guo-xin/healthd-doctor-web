import React from 'react';
import {Form, Input, Button, Select, Checkbox, Radio, Icon, DatePicker, message, Spin} from 'antd';
import styles from './editPatient.less';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import {getNation} from 'redux/actions/dictionary';
import {postPatient, putPatient, getPatientById} from 'redux/actions/patient';
import {setCurrentCase} from 'redux/actions/case';

import * as global from 'util/global';

const FormItem = Form.Item;
const createForm = Form.create;
const Option = Select.Option;
const RadioGroup = Radio.Group;

function checkIDCard(card) {
    var city = {
        11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古",
        21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏",
        33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南",
        42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆",
        51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃",
        63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外"
    };

    //检查号码是否符合规范，包括长度，类型
    var isCardNo = function (card) {
        //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X  
        var reg = /(^\d{15}$)|(^\d{17}(\d|X)$)/;
        if (reg.test(card) === false) {
            return false;
        }

        return true;
    };

    //取身份证前两位,校验省份
    var checkProvince = function (card) {
        var province = card.substr(0, 2);
        if (city[province] == undefined) {
            return false;
        }
        return true;
    };

    //检查生日是否正确
    var checkBirthday = function (card) {
        var len = card.length;
        //身份证15位时，次序为省（3位）市（3位）年（2位）月（2位）日（2位）校验位（3位），皆为数字  
        if (len == '15') {
            var re_fifteen = /^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/;
            var arr_data = card.match(re_fifteen);
            var year = arr_data[2];
            var month = arr_data[3];
            var day = arr_data[4];
            var birthday = new Date('19' + year + '/' + month + '/' + day);
            return verifyBirthday('19' + year, month, day, birthday);
        }
        //身份证18位时，次序为省（3位）市（3位）年（4位）月（2位）日（2位）校验位（4位），校验位末尾可能为X  
        if (len == '18') {
            var re_eighteen = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/;
            var arr_data = card.match(re_eighteen);
            var year = arr_data[2];
            var month = arr_data[3];
            var day = arr_data[4];
            var birthday = new Date(year + '/' + month + '/' + day);
            return verifyBirthday(year, month, day, birthday);
        }
        return false;
    };

    //校验日期
    var verifyBirthday = function (year, month, day, birthday) {
        var now = new Date();
        var now_year = now.getFullYear();
        //年月日是否合理  
        if (birthday.getFullYear() == year && (birthday.getMonth() + 1) == month && birthday.getDate() == day) {
            //判断年份的范围（3岁到100岁之间)  
            var time = now_year - year;
            if (time >= 3 && time <= 100) {
                return true;
            }
            return false;
        }
        return false;
    };

    //校验位的检测
    var checkParity = function (card) {
        //15位转18位  
        card = changeFivteenToEighteen(card);
        var len = card.length;
        if (len == '18') {
            var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
            var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
            var cardTemp = 0, i, valnum;
            for (i = 0; i < 17; i++) {
                cardTemp += card.substr(i, 1) * arrInt[i];
            }
            valnum = arrCh[cardTemp % 11];
            if (valnum == card.substr(17, 1)) {
                return true;
            }
            return false;
        }
        return false;
    };

    //15位转18位身份证号  
    var changeFivteenToEighteen = function (card) {
        if (card.length == '15') {
            var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
            var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
            var cardTemp = 0, i;
            card = card.substr(0, 6) + '19' + card.substr(6, card.length - 6);
            for (i = 0; i < 17; i++) {
                cardTemp += card.substr(i, 1) * arrInt[i];
            }
            card += arrCh[cardTemp % 11];
            return card;
        }
        return card;
    };

    //是否为空
    if (card === '' || card === null || card === undefined) {
        return true;
    }
    //校验长度，类型
    if (isCardNo(card) === false) {
        return false;
    }
    //检查省份
    if (checkProvince(card) === false) {
        return false;
    }
    //校验生日
    if (checkBirthday(card) === false) {
        return false;
    }
    //检验位的检测
    if (checkParity(card) === false) {
        return false;
    }

    return true;
}


class EditPatient extends React.Component {
    static propTypes = {
        nation: React.PropTypes.array.isRequired
    };
    state = {
        age: '',
        isShowMore: false,
        optState: this.props.currentPatient.state,
        loading: true,
        isDisableDate: false
    };

    patient = {};

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.getNationList();

        this.getPatient();
    }

    updateFormValues(patientId) {
        let {form, patients} = this.props;
        let patient = this.patient = Object.assign({}, patients[patientId]);
        patient.birthday = patient.birthday ? new Date(patient.birthday) : null;
        patient.patientCode = global.formatPatientCode(patient.patientCode);
        form.setFieldsValue(patient);

        this.setState({
            age: global.getAge(patient.birthday)
        });
    }

    getPatient() {
        let {currentPatient={}, dispatch} = this.props;

        //-1：新建 0：查看 1：编辑
        if (currentPatient.state !== -1) {
            let patientId = currentPatient.patientId;

            if (patientId) {
                dispatch(getPatientById(patientId)).then(
                    () => {
                        this.updateFormValues(patientId);
                        this.setState({
                            loading: false
                        });
                    },
                    ()=> {
                        this.setState({
                            loading: false
                        });
                    }
                );
            }
        } else {
            this.setState({
                loading: false
            });
        }


    }

    getNationList() {
        this.props.dispatch(getNation()).then(
            ()=> {
                this.setState({
                    loading: false
                });
            },
            ()=> {
                this.setState({
                    loading: false
                });
            }
        );
    }

    submit() {
        const {dispatch, router, user} = this.props;
        const {optState} = this.state;
        const patient = this.patient;


        let fieldValues = this.props.form.getFieldsValue();

        let {id, realName, identityNumber, sex, birthday, phoneNumber, head, createdTime, creater, patientCode, updateTime, relation}= fieldValues;


        if (birthday) {
            birthday = birthday.getFullYear() + '-' + (birthday.getMonth() + 1) + '-' + birthday.getDate();
        }

        let params = {
            id,
            realName,
            identityNumber,
            sex,
            birthday,
            phoneNumber,
            head,
            createdTime,
            creater,
            patientCode,
            updateTime,
            relation
        };

        if (optState === -1) {
            params.userId = user.userId;
            params.userName = user.userName;
            params.userPhoneNumber = user.mobilePhone;
        } else {
            params.userId = patient.userId;
            params.userName = patient.userName;
            params.userPhoneNumber = patient.userPhoneNumber;
        }

        let {educationLevel="", maritalStatus="", nationId="", country="", weight="", height="", bloodType="", religion="", remark=""} = fieldValues;

        let patientExt = {
            educationLevel,
            maritalStatus,
            nationId,
            country,
            weight,
            height,
            bloodType,
            religion,
            remark
        };
        
        for (let key in patientExt) {
            if (patientExt[key] === undefined || patientExt[key] === "") {
                patientExt[key] = null;
            }
        }

        params.patientExt = patientExt;

        let hide = message.loading('正在保存...', 0);

        this.setState({
            loading: true
        });

        delete params.patientCode;

        dispatch(optState === -1 ? postPatient(params) : putPatient(params)).then((action)=> {
            hide();
            let result = (action.response || {}).result;
            if (result !== 0) {
                let code = (action.response || {}).code;

                if (code === -4004) {
                    message.error('本人患者已经存在');
                } else {
                    message.error('保存失败');
                }

                this.setState({
                    loading: false
                });
            } else {
                let id = (action.response.data || {}).id;

                if (optState === -1) {
                    dispatch(setCurrentCase({
                        caseId: null,
                        patientId: id,
                        state: -1 // -1：新建， 1：已存在
                    }));
                }

                this.setState({
                    loading: false
                });
                router.replace(`/inquire/case/detail`);
            }

        }, () => {
            hide();
            this.setState({
                loading: false
            });
            message.error('保存失败');
        });
    }

    onOK(e) {
        e.preventDefault();

        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            } else {
                this.submit();
            }

        });
    }

    onCancel() {
        this.props.router.goBack();
    }

    toggleShowMore(e) {
        this.setState({
            isShowMore: !this.state.isShowMore
        });
    }

    onDateChange(val) {
        let age = global.getAge(val);
        this.setState({
            age: age
        });
    }

    setBirthdayFromID(value) {
        if (!value) {
            return;
        }

        let tmpStr = '';
        if (value.length == 15) {
            tmpStr = value.substring(6, 12);
            tmpStr = "19" + tmpStr;
            tmpStr = tmpStr.substring(0, 4) + "-" + tmpStr.substring(4, 6) + "-" + tmpStr.substring(6);
        }
        else {
            tmpStr = value.substring(6, 14);
            tmpStr = tmpStr.substring(0, 4) + "-" + tmpStr.substring(4, 6) + "-" + tmpStr.substring(6);
        }

        let d = new Date(tmpStr);

        this.props.form.setFieldsValue({
            birthday: d
        });

        clearTimeout(this.st);
        this.setState({
            age: global.getAge(d),
            isDisableDate: true
        });

        return new Date(tmpStr);
    }

    st = null;

    checkID(rule, value, callback) {
        if (checkIDCard(value)) {
            this.setBirthdayFromID(value);
            callback();
        } else {
            clearTimeout(this.st);
            this.st = setTimeout(()=> {
                this.setState({
                    isDisableDate: false
                });
            }, 300);
            callback('请输入正确的身份证号码');
        }
    }

    disabledDate(current) {
        // can not select days after today
        return current && current.getTime() > Date.now();
    };

    render() {
        const {nation=[], form} = this.props;
        const {getFieldProps} = form;
        const {isShowMore, optState, isDisableDate} = this.state;

        const relationList = global.RELATION_LIST.map((item)=> {
            return <Option key={item.value} value={item.value}>{item.text}</Option>
        });

        const genderList = global.GENDER_LIST.map((item)=> {
            return <Option key={item.value} value={item.value}>{item.text}</Option>
        });

        const marriageList = global.MARRIAGE_LIST.map((item)=> {
            return <Option key={item.value} value={item.value}>{item.text}</Option>
        });

        const educationList = global.EDUCATION_LIST.map((item)=> {
            return <Option key={item.value} value={item.value}>{item.text}</Option>
        });

        const bloodTypes = global.BLOOD_TYPES.map((item)=> {
            return <Option key={item.value} value={item.value}>{item.text}</Option>
        });


        const nationList = nation.map((item)=> {
            return <Option key={item.id} value={item.id}>{item.nationName}</Option>
        });

        const countries = global.COUNTRY_LIST.map((item)=> {
            return <Option key={item.value} value={item.value}>{item.text}</Option>
        });

        const religions = global.RELIGION_LIST.map((item)=> {
            return <Option key={item.value} value={item.value}>{item.text}</Option>
        });

        return (
            <div className={optState=== 0? styles.check:styles.wrapper}>
                <Spin spinning={this.state.loading} className="panel">
                    <div className={styles.panelHead}>
                        <div className={styles.panelTitle}>
                            <img src={require('assets/images/text.png')} alt=""/>基本信息
                        </div>
                    </div>
                    <div className={styles.panelBody}>
                        <Form form={this.props.form}>
                            <div className="ant-row">
                                {
                                    optState !== -1 && <div className="col">
                                        <FormItem label="ID：">
                                            <Input placeholder="" {...getFieldProps('id')} style={{display:'none'}}
                                                   disabled={true}/>
                                            <Input placeholder="" {...getFieldProps('patientCode')} disabled={true}/>
                                        </FormItem>
                                    </div>
                                }

                                <div className="col">
                                    <FormItem label="姓名：" required>
                                        <Input placeholder="" {...getFieldProps('realName', {
                                            rules: [
                                                {required: true, message: '请输入姓名'},
                                                {max: 20, message: '最多输入20字'},
                                                {pattern: /^[\u2E80-\u9FFF]+$/, message: '只能输入中文'}
                                            ]
                                        })} disabled={optState=== 0}/>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="身份证号：">
                                        <Input placeholder="" {...getFieldProps('identityNumber', {
                                            rules: [
                                                {validator: ::this.checkID}
                                            ]
                                        })} disabled={optState=== 0}/>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="性别：" required>
                                        <Select {...getFieldProps('sex', {
                                            rules: [
                                                {required: true, type: 'number', message: '请选择性别'}
                                            ]
                                        })} disabled={optState=== 0}>
                                            {genderList}
                                        </Select>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="出生日期：" required>
                                        <DatePicker {...getFieldProps('birthday', {
                                            rules: [
                                                {required: true, type: 'date', message: '请选择日期'}
                                            ],
                                            onChange: (val)=>this.onDateChange(val)
                                        })} format="yyyy-MM-dd" disabledDate={::this.disabledDate}
                                            disabled={optState=== 0 || isDisableDate}/>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="年龄：">
                                        <Input placeholder=""
                                               value={this.state.age} disabled={true}/>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="手机：">
                                        <Input placeholder="" {...getFieldProps('phoneNumber', {
                                            rules: [
                                                {pattern: /^1[3|4|5|7|8]\d{9}$/, message: '请输入正确的手机号码'}
                                            ]
                                        })} disabled={optState=== 0}/>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="与问诊人关系：" required>
                                        <Select {...getFieldProps('relation', {
                                            rules: [
                                                {required: true, type: 'number', message: '请选择与问诊人关系'}
                                            ]
                                        })} disabled={optState=== 0}>
                                            {relationList}
                                        </Select>
                                    </FormItem>
                                </div>
                            </div>

                            <div className={styles.switch}>
                                <Button
                                    onClick={(e)=>this.toggleShowMore(e)}>
                                    <span>更多信息</span>
                                    <span>
                                        {isShowMore ? " 收起" : " 展开"}
                                        <Icon type={isShowMore ? "up" : "down"}></Icon>
                                    </span>
                                </Button>
                            </div>

                            <div className="ant-row" style={{display:isShowMore?"block":"none" }}>
                                <div className="col">
                                    <FormItem label="婚姻情况：">
                                        <Select  {...getFieldProps('maritalStatus')} disabled={optState=== 0}>
                                            {marriageList}
                                        </Select>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="文化程度：">
                                        <Select  {...getFieldProps('educationLevel')} disabled={optState=== 0}>
                                            {educationList}
                                        </Select>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="宗教信仰：">
                                        <Select {...getFieldProps('religion')} disabled={optState=== 0}>
                                            {religions}
                                        </Select>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="血型：">
                                        <Select {...getFieldProps('bloodType')} disabled={optState=== 0}>
                                            {bloodTypes}
                                        </Select>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="国籍：">
                                        <Select {...getFieldProps('country')} disabled={optState=== 0}>
                                            {countries}
                                        </Select>
                                    </FormItem>
                                </div>

                                <div className="col">
                                    <FormItem label="民族：">
                                        <Select {...getFieldProps('nationId')} disabled={optState=== 0}>
                                            {nationList}
                                        </Select>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="身高（cm）：">
                                        <Input type="number" placeholder="" {...getFieldProps('height')}
                                               disabled={optState=== 0}/>
                                    </FormItem>
                                </div>
                                <div className="col">
                                    <FormItem label="体重（kg）：">
                                        <Input type="number" placeholder="" {...getFieldProps('weight')}
                                               disabled={optState=== 0}/>
                                    </FormItem>
                                </div>
                            </div>

                            {this.state.isShowMore && <div className="row textarea">
                                <FormItem label="备注：">
                                    <Input type="textarea" rows="3" {...getFieldProps('remark',{
                                        rules: [
                                            {max: 100, message: '输入不能超过100字'}
                                        ]
                                    })}
                                           disabled={optState=== 0}/>
                                </FormItem>
                            </div>}
                        </Form>
                        <div className={styles.action}>
                            {optState !== 0 &&
                            <Button type="primary" size="large" onClick={(e)=>this.onOK(e)}>确定</Button>}

                            {optState !== 0 &&
                            <Button type="ghost" size="large"
                                    onClick={()=>this.onCancel()}>取消</Button>}

                            {optState === 0 &&
                            <Button type="primary" size="large"
                                    onClick={()=>this.onCancel()}>返回</Button>}
                        </div>
                    </div>
                </Spin>
            </div>
        );
    }
}

EditPatient = createForm()(EditPatient);

const mapStateToProps = (globalStore) => {
    const {dictionary, patientStore, callStore}  = globalStore;

    return {
        nation: dictionary.nation,
        patients: patientStore.patients || {},
        user: callStore.incomingUser || {},
        currentPatient: patientStore.currentPatient
    };
};

export default withRouter(connect(mapStateToProps)(EditPatient));