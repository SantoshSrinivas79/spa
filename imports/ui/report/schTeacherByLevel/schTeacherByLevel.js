import schTeacherByLevelReport from '/imports/vue/ui/report/schTeacherByLevel';
import './schTeacherByLevel.html';

let index = Template.sch_teacherByLevelReport;
index.onRendered(function () {
    new Vue({
        render: h => h(schTeacherByLevelReport),
        component: schTeacherByLevelReport
    }).$mount('#schTeacherByLevel-report')
});

index.onDestroyed(function () {
    $('.schTeacherByLevel-report').remove();
});