//function
import {CheckRoles} from '../../imports/api/methods/checkRoles';
//template js

// import '../../imports/ui/report/journal/journal';


//import layout render
require("materialize-css-meteor");
import {_Main} from '../libs/_renderLayout';
import {_NoHeaderNoSideBar} from '../libs/_renderLayout';

let schReport = FlowRouter.group({
    prefix: '/sch-report',
    name: 'schReport',
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

let schReportAdmin = FlowRouter.group({
    prefix: '/sch-report',
    name: 'schReport',
    title: "Home",
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['admin', 'super']})) {
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

let schReportDirector = FlowRouter.group({
    prefix: '/sch-report',
    name: 'schReport',
    title: "Home",
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['admin', 'super', 'director']})) {
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


let schReportNewPage = FlowRouter.group({
    prefix: '/sch-report',
    name: 'schReport',
    title: "Home"/*,
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['admin', 'setting', 'super','payment']})) {
            redirect('wb.home');
        }
    }]*/
});


import '../../imports/ui/report/schRegister/schRegister';

schReport.route('/schRegisterReport', {
    name: 'sch.schRegisterReport',
    title: "Register Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_registerReport');
    }

});
import '../../imports/ui/report/schPayment/schPayment';

schReportAdmin.route('/schPaymentReport', {
    name: 'sch.schPaymentReport',
    title: "Payment Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_paymentReport');
    }

});
import '../../imports/ui/report/schDebtSummary/schDebtSummary';

schReportAdmin.route('/schDebtSummaryReport', {
    name: 'sch.schDebtSummaryReport',
    title: "Debt Summary Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_debtSummaryReport');
    }

});
import '../../imports/ui/report/schDebtDetail/schDebtDetail';

schReportAdmin.route('/schDebtDetailReport', {
    name: 'sch.schDebtDetailReport',
    title: "Debt Detail Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_debtDetailReport');
    }

});
import '../../imports/ui/report/schStudentList/schStudentList';

schReport.route('/schStudentListReport', {
    name: 'sch.schStudentListReport',
    title: "Student List Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_studentListReport');
    }

});

import '../../imports/ui/report/schBusRegister/schBusRegister';

schReportAdmin.route('/schBusRegisterReport', {
    name: 'sch.schBusRegisterReport',
    title: "Bus Register Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_busRegisterReport');
    }

});
import '../../imports/ui/report/schBusRegisterActive/schBusRegisterActive';

schReportAdmin.route('/schBusRegisterActiveReport', {
    name: 'sch.schBusRegisterActiveReport',
    title: "Bus Register Active Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_busRegisterActiveReport');
    }

});

import '../../imports/ui/report/schBusPayment/schBusPayment';

schReportAdmin.route('/schBusPaymentReport', {
    name: 'sch.schBusPaymentReport',
    title: "Bus Payment Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_busPaymentReport');
    }

});

import '../../imports/ui/report/schBusDebtDetail/schBusDebtDetail';

schReportAdmin.route('/schBusDebtDetailReport', {
    name: 'sch.schBusDebtDetailReport',
    title: "Bus Debt Detail Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_busDebtDetailReport');
    }

});

import '../../imports/ui/report/schBusDebtSummary/schBusDebtSummary';

schReportAdmin.route('/schBusDebtSummaryReport', {
    name: 'sch.schBusDebtSummaryReport',
    title: "Bus Debt Summary Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_busDebtSummaryReport');
    }

});

import '../../imports/ui/report/schTeacherActivity/schTeacherActivity';

schReportDirector.route('/schTeacherActivityReport', {
    name: 'sch.schTeacherActivityReport',
    title: "Teacher Activity Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_teacherActivityReport');
    }

});
