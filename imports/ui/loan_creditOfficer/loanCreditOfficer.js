import './loanCreditOfficer.html';
import loanCreditOfficer from '/imports/vue/ui/loanCreditOfficer';

let indexTmpl = Template.loan_creditOfficer;
indexTmpl.onRendered(function () {
    new Vue({
        render: h => h(loanCreditOfficer)
    }).$mount('loan_creditOfficer');
});

indexTmpl.onDestroyed(function () {
    $('.loan_creditOfficer').remove();
});

