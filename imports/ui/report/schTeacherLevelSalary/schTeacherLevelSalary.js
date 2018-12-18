import schTeacherLevelSalaryReport from '/imports/vue/ui/report/schTeacherLevelSalary';
import './schTeacherLevelSalary.html';

let index = Template.sch_teacherLevelSalaryReport;
index.onRendered(function () {
    new Vue({
        render: h => h(schTeacherLevelSalaryReport),
        component: schTeacherLevelSalaryReport
    }).$mount('#schTeacherLevelSalary-report')
});

index.onDestroyed(function () {
    $('.schTeacherLevelSalary-report').remove();
});