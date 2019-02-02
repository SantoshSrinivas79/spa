import './loanRepaymentForm.html';
import loanRepaymentForm from "/imports/vue/ui/loanRepaymentForm.vue"

let indexTmpl = Template.loan_repaymentForm;
indexTmpl.onRendered(function () {
    new Vue({
        render: h => h(loanRepaymentForm)
    }).$mount('loan_repaymentForm');
});
indexTmpl.onDestroyed(function () {
    $('.loan_repaymentForm').remove();
});

