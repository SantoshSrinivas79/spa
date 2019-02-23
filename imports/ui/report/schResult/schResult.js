import schResultReport from '/imports/vue/ui/report/schResult';
import './schResult.html';

let index = Template.sch_resultReport;
index.onRendered(function () {
    new Vue({
        render: h => h(schResultReport),
        component: schResultReport
    }).$mount('#schResult-report')
});

index.onDestroyed(function () {
    $('.schResult-report').remove();
});