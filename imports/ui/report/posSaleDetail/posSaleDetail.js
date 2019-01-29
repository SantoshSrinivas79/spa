import posSaleDetailReport from '/imports/vue/ui/report/posSaleDetail';
import './posSaleDetail.html';

let index = Template.pos_saleDetailReport;
index.onRendered(function () {
    new Vue({
        render: h => h(posSaleDetailReport),
        component: posSaleDetailReport
    }).$mount('#posSaleDetail-report')
});

index.onDestroyed(function () {
    $('.posSaleDetail-report').remove();
});