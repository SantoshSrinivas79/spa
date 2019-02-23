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

let schReportTeacher = FlowRouter.group({
    prefix: '/sch-report',
    name: 'schReport',
    title: "Home",
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['super', 'teacher']})) {
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

let schReportPayment = FlowRouter.group({
    prefix: '/sch-report',
    name: 'schReport',
    title: "Home",
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['super', 'payment']})) {
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
import '../../imports/ui/report/schReExam/schReExam';

schReport.route('/schReExamReport', {
    name: 'sch.schReExamReport',
    title: "ReExam Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_reExamReport');
    }

});
import '../../imports/ui/report/schResult/schResult';

schReport.route('/schResultReport', {
    name: 'sch.schResultReport',
    title: "Result Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_resultReport');
    }

});
import '../../imports/ui/report/schPayment/schPayment';

schReportPayment.route('/schPaymentReport', {
    name: 'sch.schPaymentReport',
    title: "Payment Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_paymentReport');
    }

});
import '../../imports/ui/report/schDebtSummary/schDebtSummary';

schReportPayment.route('/schDebtSummaryReport', {
    name: 'sch.schDebtSummaryReport',
    title: "Debt Summary Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_debtSummaryReport');
    }

});
import '../../imports/ui/report/schDebtDetail/schDebtDetail';

schReportPayment.route('/schDebtDetailReport', {
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

schReportTeacher.route('/schTeacherActivityReport', {
    name: 'sch.schTeacherActivityReport',
    title: "Teacher Activity Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_teacherActivityReport');
    }

});

import '../../imports/ui/report/schTeacherSalary/schTeacherSalary';

schReportTeacher.route('/schTeacherSalaryReport', {
    name: 'sch.schTeacherSalaryReport',
    title: "Teacher Salary Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_teacherSalaryReport');
    }

});

import '../../imports/ui/report/schTeacherByLevel/schTeacherByLevel';

schReportTeacher.route('/schTeacherByLevelReport', {
    name: 'sch.schTeacherByLevelReport',
    title: "Teacher ByLevel Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_teacherByLevelReport');
    }

});
import '../../imports/ui/report/schTeacherDevelopment/schTeacherDevelopment';

schReportTeacher.route('/schTeacherDevelopmentReport', {
    name: 'sch.schTeacherDevelopmentReport',
    title: "Teacher Development Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_teacherDevelopmentReport');
    }

});

import '../../imports/ui/report/schTeacherLevelSalary/schTeacherLevelSalary';

schReportTeacher.route('/schTeacherLevelSalaryReport', {
    name: 'sch.schTeacherLevelSalaryReport',
    title: "Teacher LevelSalary Report",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('sch_teacherLevelSalaryReport');
    }

});
