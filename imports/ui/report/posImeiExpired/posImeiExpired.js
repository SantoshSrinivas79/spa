import posImeiExpiredReport from '/imports/vue/ui/report/posImeiExpired';
import './posImeiExpired.html';

let index = Template.pos_imeiExpiredReport;
index.onRendered(function () {
    new Vue({
        render: h => h(posImeiExpiredReport),
        component: posImeiExpiredReport
    }).$mount('#posImeiExpired-report')
});

index.onDestroyed(function () {
    $('.posImeiExpired-report').remove();
});