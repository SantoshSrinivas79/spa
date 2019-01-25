import './loanConfig.html';
import loanConfig from '/imports/vue/ui/loanConfig';

let indexTmpl = Template.loan_config;
indexTmpl.onRendered(function () {
    new Vue({
        render: h => h(loanConfig)
    }).$mount('loan_config');
});

indexTmpl.onDestroyed(function () {
    $('.loan_config').remove();
});

