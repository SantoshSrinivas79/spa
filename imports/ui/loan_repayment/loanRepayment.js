import './loanRepayment.html';
import loanRepayment from "/imports/vue/ui/loanRepayment.vue"
let indexTmpl = Template.loan_repayment;
indexTmpl.onRendered(function () {
    new Vue({
        render: h => h(loanRepayment)
    }).$mount('loan_repayment');
});
indexTmpl.onDestroyed(function () {
    $('.loan_repayment').remove();
});

