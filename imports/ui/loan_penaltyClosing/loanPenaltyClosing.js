import './loanPenaltyClosing.html';
import loanPenaltyClosing from '/imports/vue/ui/loanPenaltyClosing';

let indexTmpl = Template.loan_penaltyClosing;
indexTmpl.onRendered(function () {
    new Vue({
        render: h => h(loanPenaltyClosing)
    }).$mount('loan_penaltyClosing');
});

indexTmpl.onDestroyed(function () {
    $('.loan_penaltyClosing').remove();
});

