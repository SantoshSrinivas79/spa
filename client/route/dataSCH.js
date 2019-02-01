//function 
import {CheckRoles} from '../../imports/api/methods/checkRoles';
//template js 


//import layout render
require("materialize-css-meteor");
import {_Main} from '../libs/_renderLayout';

let schData = FlowRouter.group({
    prefix: '/sch-data',
    name: 'schData',
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

let schPayment = FlowRouter.group({
    prefix: '/sch-data',
    name: 'schData',
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['super', 'admin', 'payment']})) {
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

let schAdmin = FlowRouter.group({
    prefix: '/sch-data',
    name: 'schData',
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['super', 'admin', "teacher"]})) {
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

let schRegister = FlowRouter.group({
    prefix: '/sch-data',
    name: 'schData',
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['super', 'register', "student"]})) {
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
let schBoard = FlowRouter.group({
    prefix: '/sch-data',
    name: 'schData',
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['super', 'board', "student"]})) {
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
let schTeacher = FlowRouter.group({
    prefix: '/sch-data',
    name: 'schData',
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


// home
schData.route('/', {
    name: 'wb.homeData',
    title: "Home",
    action: function (query, params) {
        _Main('wb_home');
    }
});

import "../../imports/ui/sch_student/sch_student";
//Student
schData.route('/schStudent', {
    name: 'sch.student',
    title: "Student",
    parent: "wb.home",
    action: function (query, params) {
        _Main('sch_student');
    }
});


import '../../imports/ui/report/schTranscript/schTranscript';

schAdmin.route('/schTranscript/print', {
    name: 'sch.schTranscript-print',
    action: function (params, queryParams) {
        BlazeLayout.render('PrintLayout', {printLayout: 'sch_transcriptReport'});
    }

});


import "../../imports/ui/sch_class/sch_class";
//Student
schAdmin.route('/schClass', {
    name: 'sch.class',
    title: "Class",
    parent: "wb.home",
    action: function (query, params) {
        _Main('sch_class');
    }
});
import "../../imports/ui/sch_teacher/sch_teacher";
//Student
schData.route('/schTeacher', {
    name: 'sch.teacher',
    title: "Teacher",
    parent: "wb.home",
    action: function (query, params) {
        _Main('sch_teacher');
    }
});

import "../../imports/ui/sch_register/sch_register";
//Student
schRegister.route('/schRegister', {
    name: 'sch.register',
    title: "Register",
    parent: "wb.home",
    action: function (query, params) {
        _Main('sch_register');
    }
});

import "../../imports/ui/sch_class/sch_classBoard";
//Student
schBoard.route('/schClassBoard', {
    name: 'sch.classBoard',
    title: "Class Board",
    parent: "wb.home",
    action: function (query, params) {
        _Main('sch_classBoard');
    }
});

import "../../imports/ui/sch_payment/schPayment";
//Student
schPayment.route('/schPayment', {
    name: 'sch.payment',
    title: "Payment",
    parent: "wb.home",
    action: function (query, params) {
        _Main('sch_payment');
    }
});

import '../../imports/ui/report/schPaymentPrintA4/schPaymentPrintA4';

schPayment.route('/schPayment/print', {
    name: 'sch.schPayment-print',
    action: function (params, queryParams) {
        BlazeLayout.render('PrintLayout', {printLayout: 'sch_paymentPrintA4Report'});
    }

});


import "../../imports/ui/sch_busRegister/sch_busRegister";
//Student
schRegister.route('/schBusRegister', {
    name: 'sch.busRegister',
    title: "Bus Register",
    parent: "wb.home",
    action: function (query, params) {
        _Main('sch_busRegister');
    }
});

import "../../imports/ui/sch_busPayment/schBusPayment";
//Student
schPayment.route('/schBusPayment', {
    name: 'sch.busPayment',
    title: "Bus Receive Payment",
    parent: "wb.home",
    action: function (query, params) {
        _Main('sch_busPayment');
    }
});


import '../../imports/ui/report/schBusPaymentPrintA4/schBusPaymentPrintA4';

schPayment.route('/schBusPayment/print', {
    name: 'sch.schBusPayment-print',
    action: function (params, queryParams) {
        BlazeLayout.render('PrintLayout', {printLayout: 'sch_busPaymentPrintA4Report'});
    }

});


import "../../imports/ui/sch_teacherActivity/sch_teacherActivity";
//Student
schTeacher.route('/schTeacherActivity', {
    name: 'sch.teacherActivity',
    title: "Teacher Activity",
    parent: "wb.home",
    action: function (query, params) {
        _Main('sch_teacherActivity');
    }
});
