import loanDisbursementReport from '/imports/vue/ui/report/loanDisbursement.vue';
import './loanDisbursement.html';

let index = Template.loan_disbursementReport;
index.onRendered(function () {
    new Vue({
        render: h => h(loanDisbursementReport),
        component: loanDisbursementReport
    }).$mount('#loanDisbursement-report')
});

index.onDestroyed(function () {
    $('.loanDisbursement-report').remove();
});