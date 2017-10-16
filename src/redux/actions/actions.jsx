import {default as fetchData} from 'isomorphic-fetch';
import cookie from 'react-cookie';

export const WEB_API_URI = window.baseApi;
export const WEB_API_FILE_URI = window.fileApi;
export const HEADER_AUTH_FIELD = "T";
export const HEADER_AUTH_PREFIX = "";

/* ---------- 字典表相关 start ---------- */
export const GET_NATION_LIST = "GET_NATION_LIST";
export const GET_ICD_TEN = "GET_ICD_TEN";
/* ---------- 字典表相关 end ---------- */



/* ---------- 通话相关 start ---------- */
export const AGORA_CALL = "AGORA_CALL";
export const AGORA_ACCEPT = "AGORA_ACCEPT";
export const AGORA_VOIP_INVITE_BYE = "AGORA_VOIP_INVITE_BYE";
export const AGORA_VOIP_INVITE_REFUSE = "AGORA_VOIP_INVITE_REFUSE";
export const SUBSCRIBE_SERVER_EVENT = "SUBSCRIBE_SERVER_EVENT";

export const SHOW_CALL_DIALOG = "SHOW_CALL_DIALOG"; //设置来电对话框是否显示
export const SHOW_CALLBACK_DIALOG = "SHOW_CALLBACK_DIALOG"; //设置回呼对话框是否显示
export const SHOW_CALLBACK_IN_CASE_DIALOG = "SHOW_CALLBACK_IN_CASE_DIALOG"; //设置病历中回呼对话框是否显示
export const SET_CALL_INFO = "SET_CALL_INFO"; //设置通话信息
export const SET_USER_FOR_VIDEO_AREA = "SET_USER_FOR_VIDEO_AREA"; //设置视频区域用户信息
export const GET_CALL_RECORD = "GET_CALL_RECORD"; //查询通话记录
export const UNREAD_INQUIRY = "UNREAD_INQUIRY";//未读问诊推送
export const MISSED_CALL = "MISSED_CALL";//未接来电
export const REDUCE_SERVICE = "REDUCE_SERVICE";//挂断扣次
export const QUERY_SERVICE = "QUERY_SERVICE";//挂断后查询服务包次数
export const SEND_MISSED_CALL_MSG = "SEND_MISSED_CALL_MSG"; //未接来电短信通知
/* ---------- 通话相关 end ---------- */


/* ---------- 登录认证相关操作 start ---------- */
export const SET_AUTH = "SET_AUTH"; //刷新时设置登录认证信息
export const SIGN_IN = "SIGN_IN";//登录
export const SIGN_OUT = "SIGN_OUT";//退出
export const TOKEN_VERIFY = "TOKEN_VERIFY";//token验证
export const TOKEN_RESET = "TOKEN_RESET";//token重置
/* ---------- 登录认证相关操作 end ---------- */


/* ---------- 医生相关操作 start ---------- */
export const SET_DOCTOR_QUEUE_COUNT = "SET_DOCTOR_QUEUE_COUNT";//推送医生排队人数

export const SET_DOCTOR_CLOSE = "SET_DOCTOR_CLOSE";//结束出诊时的关闭消息推送

export const GET_DOCTOR_PICTURE_MESSAGE = "GET_DOCTOR_PICTURE_MESSAGE";//图片消息通知
export const GET_DOCTOR_RESET_PWD = "GET_DOCTOR_RESET_PWD";//医生忘记密码验证邮箱发送密码
export const DOCTOR_START_INQUERY = "DOCTOR_START_INQUERY";//医生开始出诊
export const DOCTOR_END_INQUERY = "DOCTOR_END_INQUERY";//医生结束出诊
export const DOCTOR_ATTENDANCE = "DOCTOR_ATTENDANCE";//首页医生出诊状态
export const CHANGE_DOCTOR_STATE = "CHANGE_DOCTOR_STATE";//修改医生在线状态
export const DOCTOR_BY_USER_ID = "DOCTOR_BY_USER_ID";//医生用户ID获取自己相关的信息
export const DOCTOR_BY_USER_ID_DATE = "DOCTOR_BY_USER_ID_DATE";//医生用户ID获取自己排班
export const POST_DOCTOR = "POST_DOCTOR";//医生修改简介和擅长
export const DOCTOR_BY_USER_ID_QUEUE = "DOCTOR_BY_USER_ID_QUEUE";//查询问诊人数
export const DOCTOR_BY_USER_ID_INQUIRY = "DOCTOR_BY_USER_ID_INQUIRY";//查询医生排队人数
export const POST_DOCTOR_CHECK_PWD = "POST_DOCTOR_CHECK_PWD";//医生校验密码
export const POST_DOCTOR_CHECK_PHONE = "POST_DOCTOR_CHECK_PHONE";//医生校验电话号码并发送验证码
export const POST_DOCTOR_CHECK_CODE = "POST_DOCTOR_CHECK_CODE";//校验医生手机号码和验证码
export const POST_DOCTOR_CHANGE_PWD = "POST_DOCTOR_CHANGE_PWD";//医生修改密码
export const NOTICE_CHANGE_DOCTOR_STATE = "NOTICE_CHANGE_DOCTOR_STATE"; //通知PHP改变医生状态
/* ---------- 医生相关操作 end ---------- */




/* ---------- 用户相关操作 start ---------- */
export const GET_USER_BY_ID = "GET_USER_BY_ID"; //根据用户ID获取用户信息
export const GET_USER_BY_PHONE = "GET_USER_BY_PHONE"; //根据用户手机号获取用户信息
export const GET_USER_BY_MPTV = "GET_USER_BY_MPTV"; //根据用户手机号、患者ID、呼叫类型、获取用户信息
/* ---------- 用户相关操作 end ---------- */




/* ---------- 患者相关操作 start ---------- */
export const SET_CURRENT_PATIENT = "SET_CURRENT_PATIENT";//设置当前正在操作的病人，页面路由：/inquire/case/editPatient
export const GET_PATIENTS_BY_USER_ID = "GET_PATIENTS_BY_USER_ID"; //根据用户ID获取相关的病人信息
export const POST_PATIENT = "POST_PATIENT"; //创建患者
export const PUT_PATIENT = "PUT_PATIENT"; //更新患者
export const GET_PATIENT_BY_ID = "GET_PATIENT_BY_ID"; //根据患者ID获取患者信息
/* ---------- 患者相关操作 end ---------- */




/* ---------- 病历相关操作 start ---------- */
export const TOGGLE_CASES_TOOLS = "TOGGLE_CASES_TOOLS"; //是否显示工具栏
export const TOGGLE_VIDEO = "TOGGLE_VIDEO"; //是否显示视频区域

export const CHANGE_DIAGNOSIS_TABLE_DATA = "CHANGE_DIAGNOSIS_TABLE_DATA"; //修改诊断表格

export const SET_CURRENT_CASE = "SET_CURRENT_CASE"; //设置当前正在操作的病历 页面路由：/inquire/case/detail
export const POST_CASE = "POST_CASE"; //创建病历
export const PUT_CASE = "PUT_CASE"; //更新病历
export const GET_CASE_BY_ID = "GET_CASE_BY_ID"; //根据病历ID查询病历
export const GET_CASES_BY_PATIENT_ID = "GET_CASES_BY_PATIENT_ID"; //根据患者ID获取患者病历
export const GET_TODO_CASES_BY_DOCTOR_ID = "GET_TODO_CASES_BY_DOCTOR_ID"; //获取待归档病历
export const GET_DONE_CASES_BY_DOCTOR_ID = "GET_DONE_CASES_BY_DOCTOR_ID"; //获取已归档病历

export const DELETE_DIAGNOSIS_BY_ID = "DELETE_DIAGNOSIS_BY_ID"; //根据诊断ID删除诊断
export const UPLOAD_CASE_OPINIONS = "UPLOAD_CASE_OPINIONS";
export const GET_CASE_OPINIONS = "GET_CASE_OPINIONS";

export const GET_PATIENT_ALL_PICTURE = "GET_PATIENT_ALL_PICTURE"; //根据患者Id查询患者全部图片
export const GET_INQUIRY_ALL_PICTURE = "GET_INQUIRY_ALL_PICTURE"; //查询本次问诊所有图片

export const SET_INQUIRY_PICTURE_READY = "SET_INQUIRY_PICTURE_READY"; //将病历未读图片设置为已读

export const UPLOAD_CASE_TO_OSS = "UPLOAD_CASE_TO_OSS"; //保存病历后回调保存上传OSS

export const APPEND_CASE = "APPEND_CASE"; //追加病历调用

export const AUTO_SAVE_CASE = "AUTO_SAVE_CASE"; //自动保存病历操作

export const SEND_MESSAGE_BY_DOCTOR = "SEND_MESSAGE_BY_DOCTOR"; //医生向用户发送短信
export const SEND_MESSAGE_BY_RECORD_ID = "SEND_MESSAGE_BY_RECORD_ID"; //根据短信记录ID重新发送短信
export const GET_MESSAGE_BY_CASE_ID = "GET_MESSAGE_BY_CASE_ID"; //根据病历ID查询相关短信

export const UPDATE_INQUIRYINFO_BY_INQUIRYID = "UPDATE_INQUIRYINFO_BY_INQUIRYID"; //根据问诊资料ID 更新问诊ID
/* ---------- 病历相关操作 end ---------- */



/* ---------- 问诊相关 start ---------- */
export const GET_INQUIRE_NUMBER = "GET_INQUIRE_NUMBER"; //点击问诊优先进入有内容模块
export const GET_INQUIRE_QUEUE = "GET_INQUIRE_QUEUE"; //等待问诊
export const GET_INQUIRE_QUEUE_EXCEPTION = "GET_INQUIRE_QUEUE_EXCEPTION"; //异常问诊
export const GET_INQUIRE_CALLBACK_NUMBER = 'GET_INQUIRE_CALLBACK_NUMBER';
export const GET_MATERIAL_BEFORE_CASE = "GET_MATERIAL_BEFORE_CASE"; //查询患者资料
/* ---------- 问诊相关 end ---------- */


export function create(type, ...argNames) {
    return function (...args) {
        let action = {type};
        argNames.forEach((arg, index) => {
            action[argNames[index]] = args[index]
        });
        return action;
    }
}

export function fetch(url, ...params) {
    if (!/\/(sign|signout)/gi.test(url)) {
        let healthWEB = cookie.load('HEALTHWEB') || {};
        let list = url.split('?');
        let first = "";

        if (list.length > 0) {
            //first = list.shift() + ';jsessionid=' + (healthWEB.j || '');
            first = list.shift();
        }

        url = first + (list.length > 0 ? ('?' + list.join('?') ) : '');
    }

    return fetchData(url, ...params);
}
