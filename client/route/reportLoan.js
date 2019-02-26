//function
import {CheckRoles} from '../../imports/api/methods/checkRoles';
//template js

// import '../../imports/ui/report/journal/journal';


//import layout render
require("materialize-css-meteor");
import {_Main} from '../libs/_renderLayout';
import {_NoHeaderNoSideBar} from '../libs/_renderLayout';

let loanReport = FlowRouter.group({
    prefix: '/loan-report',
    name: 'loanReport',
    title: "Home",
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['admin', 'super', 'report']})) {
            redirect('wb.home');
        }

        if (!CheckRoles({roles: ['remove', 'super']})) {
            Session.set("canRemove", true);
        } else {
            Session.set("canRemove", false);
        }
        if (!CheckRoles({roles: ['update', 'super']})) {
            Session.set("canUpdate", true);
        } else {
            Session.set("canUpdate", false);
        }
    }]
});


import '../../imports/ui/report/loanRepaymentSchedule/loanRepaymentSchedule';

loanReport.route('/loanRepaymentScheduleReport', {
    name: 'loan.loanRepaymentScheduleReport',
    title: "Repayment Schedule",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('loan_repaymentScheduleReport');
    }

});

import '../../imports/ui/report/loanDisbursement/loanDisbursement';

loanReport.route('/loanDisbursementReport', {
    name: 'loan.loanDisbursementReport',
    title: "Disbursement",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('loan_disbursementReport');
    }

});
import '../../imports/ui/report/loanRepayment/loanRepayment';

loanReport.route('/loanRepaymentReport', {
    name: 'loan.loanRepaymentReport',
    title: "Repayment",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('loan_repaymentReport');
    }

});
