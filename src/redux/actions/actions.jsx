export const WEB_API_URI = window.baseApi;
export const WEB_API_FILE_URI = window.fileApi;
export const HEADER_AUTH_FIELD = "T";
export const HEADER_AUTH_PREFIX = "";

/* ---------- 字典表相关 start ---------- */
export const GET_NATION_LIST = "GET_NATION_LIST";
export const GET_ICD_TEN = "GET_ICD_TEN";
/* ---------- 字典表相关 end ---------- */



/* ---------- 通话相关 start ---------- */
export const SET_CALL_STATE = "SET_CALL_STATE"; //设置通话状态
export const SET_INCOMING_USER_ID = "SET_INCOMING_USER_ID"; //设置当前来电用户Id
export const SET_CALLBACK_USER_ID = "SET_CALLBACK_USER_ID"; //设置回呼的用户Id
export const SET_USER_FOR_VIDEO_AREA = "SET_USER_FOR_VIDEO_AREA"; //设置视频区域用户信息
export const SET_INCOMING_CALL_INFO = "SET_INCOMING_CALL_INFO"; //设置来电用户信息
export const SHOW_CALLING_DIALOG = "SHOW_CALLING_DIALOG"; //设置来电对话框是否显示
export const SHOW_CALLBACK_DIALOG = "SHOW_CALLBACK_DIALOG"; //设置回呼确认对话框是否显示
export const SHOW_CALC_DIALOG = "SHOW_CALC_DIALOG"; //设置扣次对话框是否显示
export const SHOW_CALLBACK_FROM_CASE_DIALOG = "SHOW_CALLBACK_FROM_CASE_DIALOG"; //设置病历中回呼对话框是否显示

export const ADD_CALL_RECORD = "ADD_CALL_RECORD"; //创建问诊会话
export const ADD_CALLBACK_RECORD = "ADD_CALLBACK_RECORD"; //病历回呼创建问诊会话
export const GET_INQUIRY_RECORD = "GET_INQUIRY_RECORD"; //查询问诊会话
export const DELETE_CALL_CACHE = "DELETE_CALL_CACHE"; //挂掉通话后删除缓存
export const GET_CALL_RECORD = "GET_CALL_RECORD"; //查询通话记录
export const CALL_TIMEOUT_REJECT = "CALL_TIMEOUT_REJECT"; //电话呼叫超时拒接调用接口
export const QUEUE_BACK = "QUEUE_BACK";//排队回呼推送
export const QUEUE_CANCEL = "QUEUE_CANCEL";//取消排队
export const UNREAD_INQUIRY = "UNREAD_INQUIRY";//未读问诊推送
export const MISSED_CALL = "MISSED_CALL";//未接来电

export const REDUCE_SERVICE = "REDUCE_SERVICE";//挂断扣次
export const QUERY_SERVICE = "QUERY_SERVICE";//挂断后查询服务包次数
export const SEND_MISSED_CALL_MSG = "SEND_MISSED_CALL_MSG"; //未接来电短信通知


/* ---------- 通话相关 end ---------- */


/* ---------- 登录认证相关操作 start ---------- */
export const SIGN_IN = "SIGN_IN";//登录
export const SIGN_OUT = "SIGN_OUT";//退出
export const TOKEN_VERIFY = "TOKEN_VERIFY";//token验证
export const TOKEN_RESET = "TOKEN_RESET";//token重置
export const GET_OCX_ACCOUNT = "GET_OCX_ACCOUNT"; //获取荣联账号
/* ---------- 登录认证相关操作 end ---------- */


/* ---------- 医生相关操作 start ---------- */
export const SET_DOCTOR_QUEUE_COUNT = "SET_DOCTOR_QUEUE_COUNT";//推送医生排队人数

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

export const GET_PATIENT_PICTURE = "GET_PATIENT_PICTURE"; //根据患者Id查询患者全部图片
export const GET_INQUERY_PICTURE = "GET_INQUERY_PICTURE"; //根据病历Id查询当前病历患者图片

export const UPLOAD_CASE_TO_OSS = "UPLOAD_CASE_TO_OSS"; //保存病历后回调保存上传OSS

export const APPEND_CASE = "APPEND_CASE"; //追加病历调用

export const AUTO_SAVE_CASE = "AUTO_SAVE_CASE"; //自动保存病历操作

export const CLEAR_PATIENT_PICS = "CLEAR_PATIENT_PICS";

export const SEND_MESSAGE_BY_DOCTOR = "SEND_MESSAGE_BY_DOCTOR"; //医生向用户发送短信
export const SEND_MESSAGE_BY_RECORD_ID = "SEND_MESSAGE_BY_RECORD_ID"; //根据短信记录ID重新发送短信
export const GET_MESSAGE_BY_CASE_ID = "GET_MESSAGE_BY_CASE_ID"; //根据病历ID查询相关短信
/* ---------- 病历相关操作 end ---------- */



/* ---------- 问诊相关 start ---------- */
export const GET_INQUIRE_NUMBER = "GET_INQUIRE_NUMBER"; //点击问诊优先进入有内容模块
export const GET_INQUIRE_QUEUE = "GET_INQUIRE_QUEUE"; //等待问诊
export const GET_INQUIRE_QUEUE_EXCEPTION = "GET_INQUIRE_QUEUE_EXCEPTION"; //异常问诊
export const GET_INQUIRE_CALLBACK_NUMBER = 'GET_INQUIRE_CALLBACK_NUMBER';
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
