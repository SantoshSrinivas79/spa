import './sch_transfer.html';
import schTransfer from '/imports/vue/ui/schTransfer';

let indexTmpl = Template.sch_transfer;
indexTmpl.onRendered(function () {
    new Vue({
        render: h => h(schTransfer)
    }).$mount('sch_transfer');
});

indexTmpl.onDestroyed(function () {
    $('.sch_transfer').remove();
});

