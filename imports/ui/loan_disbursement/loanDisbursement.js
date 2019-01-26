import './loanDisbursement.html';
import loanDisbursement from '/imports/vue/ui/loanDisbursement';

let indexTmpl = Template.loan_disbursement;
indexTmpl.onRendered(function () {
    new Vue({
        render: h => h(loanDisbursement)
    }).$mount('loan_disbursement');
});

indexTmpl.onDestroyed(function () {
    $('.loan_disbursement').remove();
});

