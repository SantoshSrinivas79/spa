import './loanPenalty.html';
import loanPenalty from '/imports/vue/ui/loanPenalty';

let indexTmpl = Template.loan_penalty;
indexTmpl.onRendered(function () {
    new Vue({
        render: h => h(loanPenalty)
    }).$mount('loan_penalty');
});

indexTmpl.onDestroyed(function () {
    $('.loan_penalty').remove();
});

