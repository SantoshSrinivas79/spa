//function 
import {CheckRoles} from '../../imports/api/methods/checkRoles';
//template js 


//import layout render
require("materialize-css-meteor");
import {_Main} from '../libs/_renderLayout';
import {_NoHeaderNoSideBar} from '../libs/_renderLayout';

var posData = FlowRouter.group({
    prefix: '/pos-data',
    name: 'posData',
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['super', 'admin', 'data']})) {
            redirect('wb.home');
        }

        if (!CheckRoles({roles: ['remove', 'super']})) {
            Session.set("canRemove", true);
        } else {
            Session.set("canRemove", false);
        }
        if (!CheckRoles({roles: ['update', 'super']})) {
            Session.set("canUpdate", true);
        } else {
            Session.set("canUpdate", false);
        }
    }]
});


var posPurchase = FlowRouter.group({
    prefix: '/pos-purchase',
    name: 'posPurchase',
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['super', 'admin', 'purchase']})) {
            redirect('wb.home');
        }

        if (!CheckRoles({roles: ['remove', 'super']})) {
            Session.set("canRemove", true);
        } else {
            Session.set("canRemove", false);
        }
        if (!CheckRoles({roles: ['update', 'super']})) {
            Session.set("canUpdate", true);
        } else {
            Session.set("canUpdate", false);
        }
    }]
});


var posSale = FlowRouter.group({
    prefix: '/pos-sale',
    name: 'posSale',
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['super', 'admin', 'sale']})) {
            redirect('wb.home');
        }

        if (!CheckRoles({roles: ['remove', 'super']})) {
            Session.set("canRemove", true);
        } else {
            Session.set("canRemove", false);
        }
        if (!CheckRoles({roles: ['update', 'super']})) {
            Session.set("canUpdate", true);
        } else {
            Session.set("canUpdate", false);
        }
    }]
});
var posDirector = FlowRouter.group({
    prefix: '/pos-sale',
    name: 'posSale',
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['super', 'admin', 'director']})) {
            redirect('wb.home');
        }

        if (!CheckRoles({roles: ['remove', 'super']})) {
            Session.set("canRemove", true);
        } else {
            Session.set("canRemove", false);
        }
        if (!CheckRoles({roles: ['update', 'super']})) {
            Session.set("canUpdate", true);
        } else {
            Session.set("canUpdate", false);
        }
    }]
});

// home
posData.route('/', {
    name: 'wb.homeData',
    title: "Home",
    action: function (query, params) {
        _Main('wb_home');
    }
});

import "../../imports/ui/pos_Bill/posBill";
// Bill
posPurchase.route('/posBill', {
    name: 'pos.bill',
    parent: 'wb.homeData',
    title: "Bill",
    action: function (query, params) {
        _Main('pos_Bill');
    }
});

import "../../imports/ui/pos_invoice/posInvoice";
// Invoice
posSale.route('/posInvoice', {
    name: 'pos.invoice',
    parent: 'wb.homeData',
    title: "Invoice",
    action: function (query, params) {
        _Main('pos_Invoice');
    }
});

import "../../imports/ui/pos_saleCoffee/posSaleCoffee";
// Invoice
posSale.route('/posSaleCoffee', {
    name: 'pos.saleCoffee',
    parent: 'wb.homeData',
    title: "Sale Coffee",
    action: function (query, params) {
        _NoHeaderNoSideBar('pos_SaleCoffee');
    }
});

import "../../imports/ui/pos_saleRestaurant/posSaleRestaurant";
// Invoice
posSale.route('/posSaleRestaurant', {
    name: 'pos.saleRestaurant',
    parent: 'wb.homeData',
    title: "Sale Restaurant",
    action: function (query, params) {
        _NoHeaderNoSideBar('pos_SaleRestaurant');
    }
});

import "../../imports/ui/pos_receivePayment/posReceivePayment";
// Invoice
posSale.route('/posReceivePayment', {
    name: 'pos.receivePayment',
    parent: 'wb.homeData',
    title: "Receive Payment",
    action: function (query, params) {
        _Main('pos_receivePayment');
    }
});
import "../../imports/ui/pos_payBill/pos_payBill";
// Invoice
posPurchase.route('/posPayBill', {
    name: 'pos.payBill',
    parent: 'wb.homeData',
    title: "Pay Bill",
    action: function (query, params) {
        _Main('pos_payBill');
    }
});


import '../../imports/ui/report/posInvoicePrintA4/posInvoicePrintA4';

posData.route('/posInvoice/print', {
    name: 'pos.posInvoice-print',
    action: function (params, queryParams) {
        BlazeLayout.render('PrintLayout', {printLayout: 'pos_invoicePrintA4Report'});
    }

});

import '../../imports/ui/report/posInvoicePrintSmall/posInvoicePrintSmall';

posData.route('/posInvoiceSmall/print', {
    name: 'pos.posInvoiceSmall-print',
    action: function (params, queryParams) {
        BlazeLayout.render('PrintLayout', {printLayout: 'pos_invoicePrintSmallReport'});
    }

});
import '../../imports/ui/report/posInvoicePrintSmallRestaurant/posInvoicePrintSmallRestaurant';

posData.route('/posInvoiceSmallRestaurant/print', {
    name: 'pos.posInvoiceSmallRestaurant-print',
    action: function (params, queryParams) {
        BlazeLayout.render('PrintLayout', {printLayout: 'pos_invoicePrintSmallRestaurantReport'});
    }

});
import '../../imports/ui/report/posSaleOrderPrintA4/posSaleOrderPrintA4';

posData.route('/posSaleOrder/print', {
    name: 'pos.posSaleOrder-print',
    action: function (params, queryParams) {
        BlazeLayout.render('PrintLayout', {printLayout: 'pos_saleOrderPrintA4Report'});
    }

});

import '../../imports/ui/report/posInvoiceReceiveItemPrintA4/posInvoiceReceiveItemPrintA4';

posData.route('/posInvoiceReceiveItem/print', {
    name: 'pos.posInvoiceReceiveItem-print',
    action: function (params, queryParams) {
        BlazeLayout.render('PrintLayout', {printLayout: 'pos_invoiceReceiveItemPrintA4Report'});
    }

});

import '../../imports/ui/report/posInvoiceReceivePaymentPrintA4/posInvoiceReceivePaymentPrintA4';

posData.route('/posInvoiceReceivePayment/print', {
    name: 'pos.posInvoiceReceivePayment-print',
    action: function (params, queryParams) {
        BlazeLayout.render('PrintLayout', {printLayout: 'pos_invoiceReceivePaymentPrintA4Report'});
    }

});

import '../../imports/ui/report/posInvoiceReceivePaymentFromSaleOrderPrintA4/posInvoiceReceivePaymentFromSaleOrderPrintA4';

posData.route('/posInvoiceReceivePaymentFromSaleOrder/print', {
    name: 'pos.posInvoiceReceivePaymentFromSaleOrder-print',
    action: function (params, queryParams) {
        BlazeLayout.render('PrintLayout', {printLayout: 'pos_invoiceReceivePaymentFromSaleOrderPrintA4Report'});
    }

});


//Vendor
posPurchase.route('/posVendor', {
    name: 'pos.vendor',
    title: "Vendor",
    parent: "wb.home",
    action: function (query, params) {
        _Main('pos_vendor');
    }
});
//Customer
posSale.route('/posCustomer', {
    name: 'pos.customer',
    title: "Customer",
    parent: "wb.home",
    action: function (query, params) {
        _Main('pos_customer');
    }
});

import "../../imports/ui/pos_saleOrder/posSaleOrder";
// Invoice
posSale.route('/posSaleOrder', {
    name: 'pos.saleOrder',
    parent: 'wb.homeData',
    title: "SaleOrder",
    action: function (query, params) {
        _Main('pos_SaleOrder');
    }
});

import "../../imports/ui/pos_convertInventory/posConvertInventory";
// Invoice
posData.route('/posConvertInventory', {
    name: 'pos.convertInventory',
    parent: 'wb.homeData',
    title: "Convert Inventory",
    action: function (query, params) {
        _Main('pos_convertInventory');
    }
});

import "../../imports/ui/pos_production/posProduction";
// Invoice
posData.route('/posProduction', {
    name: 'pos.production',
    parent: 'wb.homeData',
    title: "Production",
    action: function (query, params) {
        _Main('pos_production');
    }
});

import "../../imports/ui/pos_productionBoard/posProductionBoard";
// Invoice
posData.route('/posProductionBoard', {
    name: 'pos.productionBoard',
    parent: 'wb.homeData',
    title: "Production Board",
    action: function (query, params) {
        _Main('pos_productionBoard');
    }
});
import "../../imports/ui/pos_productionResult/posProductionResult";
// Invoice
posData.route('/posProductionResult', {
    name: 'pos.productionResult',
    parent: 'wb.homeData',
    title: "Production Result",
    action: function (query, params) {
        _Main('pos_productionResult');
    }
});


import "../../imports/ui/pos_tableBoard/posTableBoard";
// Table Board
posSale.route('/posTableBoard', {
    name: 'pos.tableBoard',
    parent: 'wb.homeData',
    title: "Production Board",
    action: function (query, params) {
        _NoHeaderNoSideBar('pos_tableBoard');
    }
});

import "../../imports/ui/pos_dashboard/posDashBoard";
import {Manage_Module} from "../../imports/collection/manageModule";
import {WB_waterBillingSetup} from "../../imports/collection/waterBillingSetup";
// Dash Board
posDirector.route('/posDashboard', {
    name: 'pos.dashBoard',
    parent: 'wb.homeData',
    title: "Dashboard",
    action: function (query, params) {
        _NoHeaderNoSideBar('pos_dashBoard');
    }
});
