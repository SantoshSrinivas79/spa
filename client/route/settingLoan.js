//import func
import {CheckRoles} from '../../imports/api/methods/checkRoles';
//import template js here
import '../../imports/ui/home/home';

import '../../client/layout';
import '../../imports/ui/user/userSetting';

import '../../imports/ui/notFound/notFound';


//import layout render
require("materialize-css-meteor");
import {_Main} from '../libs/_renderLayout';
import {_NoHeaderNoSideBar} from '../libs/_renderLayout';

//not found route
FlowRouter.notFound = {
    action: function () {
        BlazeLayout.render('Wb_notFound');
    }
};


var loanSetting = FlowRouter.group({
    prefix: '/loan-setting',
    name: 'loanSetting',
    title: "Setting",
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['admin', 'setting', 'super']})) {
            redirect('wb.home');
        }
    }]
});

import '../../imports/ui/loan_config/loanConfig';

loanSetting.route('/loanChartAccount', {
    name: 'loan.config',
    title: "Config",
    parent: "wb.home",
    action: function (query, params) {
        _Main('loan_config');
    }
});
import '../../imports/ui/loan_product/loanProduct';

loanSetting.route('/loanProduct', {
    name: 'loan.product',
    title: "Product",
    parent: "wb.home",
    action: function (query, params) {
        _Main('loan_product');
    }
});
import '../../imports/ui/loan_penalty/loanPenalty';

loanSetting.route('/loanPenalty', {
    name: 'loan.penalty',
    title: "Penalty",
    parent: "wb.home",
    action: function (query, params) {
        _Main('loan_penalty');
    }
});
import '../../imports/ui/loan_penaltyClosing/loanPenaltyClosing';

loanSetting.route('/loanPenaltyClosing', {
    name: 'loan.penaltyClosing',
    title: "Penalty Closing",
    parent: "wb.home",
    action: function (query, params) {
        _Main('loan_penaltyClosing');
    }
});
