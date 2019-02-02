//function 
import {CheckRoles} from '../../imports/api/methods/checkRoles';
//template js 


//import layout render
require("materialize-css-meteor");
import {_Main} from '../libs/_renderLayout';
import {_NoHeaderNoSideBar} from '../libs/_renderLayout';

var loanData = FlowRouter.group({
    prefix: '/loan-data',
    name: 'loanData',
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['super', 'admin', 'data']})) {
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


// home
loanData.route('/', {
    name: 'wb.homeData',
    title: "Home",
    action: function (query, params) {
        _Main('wb_home');
    }
});

import "../../imports/ui/loan_creditOfficer/loanCreditOfficer";
// Bill
loanData.route('/loanCreditOfficer', {
    name: 'loan.creditOfficer',
    parent: 'wb.homeData',
    title: "Credit Officer",
    action: function (query, params) {
        _Main('loan_creditOfficer');
    }
});
import "../../imports/ui/loan_disbursement/loanDisbursement";
// Bill
loanData.route('/loanDisbursement', {
    name: 'loan.disbursement',
    parent: 'wb.homeData',
    title: "Disbursement",
    action: function (query, params) {
        _Main('loan_disbursement');
    }
});


import "../../imports/ui/loan_repayment/loanRepayment";
// Repayment
loanData.route('/loanRepayment', {
    name: 'loan.repayment',
    parent: 'wb.homeData',
    title: "Repayment",
    action: function (query, params) {
        _Main('loan_repayment');
    }
});
