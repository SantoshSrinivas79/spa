import './posReceivePayment.html';
import posReceivePayment from '/imports/vue/ui/posReceivePayment.vue';
let indexTmpl = Template.pos_receivePayment;


indexTmpl.onRendered(function () {
    new Vue({
        render: h => h(posReceivePayment)
    }).$mount('pos_receivePayment');
});
indexTmpl.onDestroyed(function () {
    $('.pos_receivePayment').remove();
});
