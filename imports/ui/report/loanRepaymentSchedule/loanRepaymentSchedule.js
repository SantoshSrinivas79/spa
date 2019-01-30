import loanRepaymentScheduleReport from '/imports/vue/ui/report/loanRepaymentSchedule.vue';
import './loanRepaymentSchedule.html';

let index = Template.loan_repaymentScheduleReport;
index.onRendered(function () {
    new Vue({
        render: h => h(loanRepaymentScheduleReport),
        component: loanRepaymentScheduleReport
    }).$mount('#loanRepaymentSchedule-report')
});

index.onDestroyed(function () {
    $('.loanRepaymentSchedule-report').remove();
});