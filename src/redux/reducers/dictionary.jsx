import * as actions from '../actions/actions';
const dictionary = (state = {
    nation: [],
    icd: []
}, action) => {
    let list;

    switch (action.type) {

        //获取民族列表
        case actions.GET_NATION_LIST + "_SUCCESS":
            list = (action.response || {}).data || [];

            return Object.assign({}, state, {
                nation: list
            });

        //查询ICD
        case actions.GET_ICD_TEN + "_SUCCESS":
            list = (action.response || {}).data || [];

            return Object.assign({}, state, {
                icd: list
            });


        default:
            return state
    }
};

export default dictionary;