import schReExamReport from '/imports/vue/ui/report/schReExam';
import './schReExam.html';

let index = Template.sch_reExamReport;
index.onRendered(function () {
    new Vue({
        render: h => h(schReExamReport),
        component: schReExamReport
    }).$mount('#schReExam-report')
});

index.onDestroyed(function () {
    $('.schReExam-report').remove();
});