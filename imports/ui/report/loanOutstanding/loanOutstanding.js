import loanOutstandingReport from '/imports/vue/ui/report/loanOutstanding.vue';
import './loanOutstanding.html';

let index = Template.loan_outstandingReport;
index.onRendered(function () {
    new Vue({
        render: h => h(loanOutstandingReport),
        component: loanOutstandingReport
    }).$mount('#loanOutstanding-report')
});

index.onDestroyed(function () {
    $('.loanOutstanding-report').remove();
});