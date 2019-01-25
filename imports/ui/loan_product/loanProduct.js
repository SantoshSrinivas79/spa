import './loanProduct.html';
import loanProduct from '/imports/vue/ui/loanProduct';

let indexTmpl = Template.loan_product;
indexTmpl.onRendered(function () {
    new Vue({
        render: h => h(loanProduct)
    }).$mount('loan_product');
});

indexTmpl.onDestroyed(function () {
    $('.loan_product').remove();
});

