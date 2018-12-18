import schTeacherDevelopmentReport from '/imports/vue/ui/report/schTeacherDevelopment';
import './schTeacherDevelopment.html';

let index = Template.sch_teacherDevelopmentReport;
index.onRendered(function () {
    new Vue({
        render: h => h(schTeacherDevelopmentReport),
        component: schTeacherDevelopmentReport
    }).$mount('#schTeacherDevelopment-report')
});

index.onDestroyed(function () {
    $('.schTeacherDevelopment-report').remove();
});