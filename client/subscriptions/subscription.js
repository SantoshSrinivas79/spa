Tracker.autorun(() => {
    Meteor.subscribe('manageModule');
    Meteor.subscribe('wb_waterBillingSetup');
    Meteor.subscribe('Acc_ExchangeActive', Session.get('area'));
    Meteor.subscribe('pos_invoiceExpired', Meteor.userId(), Session.get('area'));
    Meteor.subscribe('pos_inventoryNonStock', Meteor.userId(), Session.get('area'), Session.get("transactionActionNumber"));

});
Meteor.subscribe('loginSetup');
// Meteor.subscribe('overdueCustomerCount');
