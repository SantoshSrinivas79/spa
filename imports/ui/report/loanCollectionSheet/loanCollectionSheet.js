import loanCollectionSheetReport from '/imports/vue/ui/report/loanCollectionSheet.vue';
import './loanCollectionSheet.html';

let index = Template.loan_collectionSheetReport;
index.onRendered(function () {
    new Vue({
        render: h => h(loanCollectionSheetReport),
        component: loanCollectionSheetReport
    }).$mount('#loanCollectionSheet-report')
});

index.onDestroyed(function () {
    $('.loanCollectionSheet-report').remove();
});