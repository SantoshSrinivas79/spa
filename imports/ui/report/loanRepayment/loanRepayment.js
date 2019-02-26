import loanRepaymentReport from '/imports/vue/ui/report/loanRepayment.vue';
import './loanRepayment.html';

let index = Template.loan_repaymentReport;
index.onRendered(function () {
    new Vue({
        render: h => h(loanRepaymentReport),
        component: loanRepaymentReport
    }).$mount('#loanRepayment-report')
});

index.onDestroyed(function () {
    $('.loanRepayment-report').remove();
});