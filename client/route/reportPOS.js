//function
import {CheckRoles} from '../../imports/api/methods/checkRoles';
//template js

// import '../../imports/ui/report/journal/journal';


//import layout render
require("materialize-css-meteor");
import {_Main} from '../libs/_renderLayout';
import {_NoHeaderNoSideBar} from '../libs/_renderLayout';

let posReport = FlowRouter.group({
    prefix: '/pos-report',
    name: 'posReport',
    title: "Home",
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['admin', 'super', 'report']})) {
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

let posReportVendor = FlowRouter.group({
    prefix: '/pos-report',
    name: 'posReport',
    title: "Home",
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['super', 'reportVendor']})) {
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

let posReportCustomer = FlowRouter.group({
    prefix: '/pos-report',
    name: 'posReport',
    title: "Home",
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['super', 'reportCustomer']})) {
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

let posReportNewPage = FlowRouter.group({
    prefix: '/pos-report',
    name: 'posReport',
    title: "Home"/*,
    triggersEnter: [function (context, redirect) {
        if (!CheckRoles({roles: ['admin', 'setting', 'super']})) {
            redirect('wb.home');
        }
    }]*/
});


import '../../imports/ui/report/posSaleByCustomerSummary/posSaleByCustomerSummary';

posReportCustomer.route('/posSaleByCustomerSummaryReport', {
    name: 'pos.posSaleByCustomerSummaryReport',
    title: "Sale By Customer Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_saleByCustomerSummaryReport');
    }

});

import '../../imports/ui/report/posSaleByCustomerDetail/posSaleByCustomerDetail';

posReportCustomer.route('/posSaleByCustomerDetailReport', {
    name: 'pos.posSaleByCustomerDetailReport',
    title: "Sale By Customer Detail",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_saleByCustomerDetailReport');
    }

});
import '../../imports/ui/report/posSaleByProductDetail/posSaleByProductDetail';

posReportCustomer.route('/posSaleByProductDetailReport', {
    name: 'pos.posSaleByProductDetailReport',
    title: "Sale By Product Detail",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_saleByProductDetailReport');
    }

});


import '../../imports/ui/report/posSaleByProductSummary/posSaleByProductSummary';

posReportCustomer.route('/posSaleByProductSummaryReport', {
    name: 'pos.posSaleByProductSummaryReport',
    title: "Sale By Product Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_saleByProductSummaryReport');
    }

});

import '../../imports/ui/report/posProductList/posProductList';

posReport.route('/posProdcutListReport', {
    name: 'pos.posProdcutListReport',
    title: "Product List",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_productListReport');
    }

});
import '../../imports/ui/report/posReceivePaymentSummary/posReceivePaymentSummary';

posReportCustomer.route('/posReceivePaymentSummaryReport', {
    name: 'pos.posReceivePaymentSummaryReport',
    title: "Receive Payment Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_receivePaymentSummaryReport');
    }

});

import '../../imports/ui/report/posReceivePaymentDetail/posReceivePaymentDetail';

posReportCustomer.route('/posReceivePaymentDetailReport', {
    name: 'pos.posReceivePaymentDetailReport',
    title: "Receive Payment Detail",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_receivePaymentDetailReport');
    }

});
import '../../imports/ui/report/posSaleDetail/posSaleDetail';

posReportCustomer.route('/posSaleDetailReport', {
    name: 'pos.posSaleDetailReport',
    title: "Sale Detail",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_saleDetailReport');
    }

});

import '../../imports/ui/report/posDebtSummary/posDebtSummary';

posReportCustomer.route('/posDebtSummaryReport', {
    name: 'pos.posDebtSummaryReport',
    title: "Debt Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_debtSummaryReport');
    }

});

import '../../imports/ui/report/posDebtDetail/posDebtDetail';

posReportCustomer.route('/posDebtDetailReport', {
    name: 'pos.posDebtDetailReport',
    title: "Debt Detail",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_debtDetailReport');
    }

});
import '../../imports/ui/report/posCollectionSheetSummary/posCollectionSheetSummary';

posReportCustomer.route('/posCollectionSheetSummaryReport', {
    name: 'pos.posCollectionSheetSummaryReport',
    title: "Collection Sheet Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_collectionSheetSummaryReport');
    }

});
import '../../imports/ui/report/posCollectionSheetDetail/posCollectionSheetDetail';

posReportCustomer.route('/posCollectionSheetDetailReport', {
    name: 'pos.posCollectionSheetDetailReport',
    title: "Collection Sheet Detail",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_collectionSheetDetailReport');
    }

});
import '../../imports/ui/report/posTransactionListByCustomer/posTransactionListByCustomer';

posReport.route('/posTransactionListByCustomerReport', {
    name: 'pos.posTransactionListByCustomerReport',
    title: "Transaction List By Customer",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_transactionListByCustomerReport');
    }

});


import '../../imports/ui/report/posPurchaseByVendorSummary/posPurchaseByVendorSummary';

posReportVendor.route('/posPurchaseByVendorSummaryReport', {
    name: 'pos.posPurchaseByVendorSummaryReport',
    title: "Purchase By Vendor Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_purchaseByVendorSummaryReport');
    }

});

import '../../imports/ui/report/posPurchaseByVendorDetail/posPurchaseByVendorDetail';

posReportVendor.route('/posPurchaseByVendorDetailReport', {
    name: 'pos.posPurchaseByVendorDetailReport',
    title: "Purchase By Vendor Detail",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_purchaseByVendorDetailReport');
    }

});

import '../../imports/ui/report/posPurchaseByProductDetail/posPurchaseByProductDetail';

posReportVendor.route('/posPurchaseByProductDetailReport', {
    name: 'pos.posPurchaseByProductDetailReport',
    title: "Purchase By Product Detail",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_purchaseByProductDetailReport');
    }

});
import '../../imports/ui/report/posPurchaseByProductSummary/posPurchaseByProductSummary';

posReportVendor.route('/posPurchaseByProductSummaryReport', {
    name: 'pos.posPurchaseByProductSummaryReport',
    title: "Purchase By Product Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_purchaseByProductSummaryReport');
    }

});

import '../../imports/ui/report/posPayBillDetail/posPayBillDetail';

posReportVendor.route('/posPayBillDetailReport', {
    name: 'pos.posPayBillDetailReport',
    title: "Paid Payment Detail",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_payBillDetailReport');
    }

});

import '../../imports/ui/report/posPayBillSummary/posPayBillSummary';

posReportVendor.route('/posPayBillSummaryReport', {
    name: 'pos.posPayBillSummaryReport',
    title: "Paid Payment Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_payBillSummaryReport');
    }

});
import '../../imports/ui/report/posUnPaidSummary/posUnPaidSummary';

posReportVendor.route('/posUnPaidSummaryReport', {
    name: 'pos.posUnPaidSummaryReport',
    title: "UnPaid Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_unPaidSummaryReport');
    }

});
import '../../imports/ui/report/posUnPaidDetail/posUnPaidDetail';

posReportVendor.route('/posUnPaidDetailReport', {
    name: 'pos.posUnPaidDetailReport',
    title: "UnPaid Detail",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_unPaidDetailReport');
    }

});


import '../../imports/ui/report/posPurchaseSaleByProductSummary/posPurchaseSaleByProductSummary';

posReport.route('/posPurchaseSaleByProductSummaryReport', {
    name: 'pos.posPurchaseSaleByProductSummaryReport',
    title: "Purchase Sale By Product Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_purchaseSaleByProductSummaryReport');
    }

});

import '../../imports/ui/report/posInventoryEnding/posInventoryEnding';

posReport.route('/posInventoryEndingReport', {
    name: 'pos.posInventoryEndingReport',
    title: "Inventory Ending",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_inventoryEndingReport');
    }

});


import '../../imports/ui/report/posInventoryTransaction/posInventoryTransaction';

posReport.route('/posInventoryTransactionReport', {
    name: 'pos.posInventoryTransactionReport',
    title: "Inventory Transaction",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_inventoryTransactionReport');
    }

});

import '../../imports/ui/report/posTransferLocation/posTransferLocation';

posReport.route('/posTransferLocationReport', {
    name: 'pos.posTransferLocationReport',
    title: "Transfer Location",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_transferLocationReport');
    }

});
import '../../imports/ui/report/posTransferLocationSummary/posTransferLocationSummary';

posReport.route('/posTransferLocationSummaryReport', {
    name: 'pos.posTransferLocationSummaryReport',
    title: "Transfer Location Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_transferLocationSummaryReport');
    }

});


import '../../imports/ui/report/posSaleOrderByCustomerDetail/posSaleOrderByCustomerDetail';

posReport.route('/posSaleOrderByCustomerDetailReport', {
    name: 'pos.posSaleOrderByCustomerDetailReport',
    title: "Sale Order By Customer Detail",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_saleOrderByCustomerDetailReport');
    }

});

import '../../imports/ui/report/posStockDebt/posStockDebt';

posReport.route('/posStockDebtReport', {
    name: 'pos.posStockDebtReport',
    title: "Stock Debt",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_stockDebtReport');
    }

});
import '../../imports/ui/report/posStockReceive/posStockReceive';

posReport.route('/posStockReceiveReport', {
    name: 'pos.posStockReceiveReport',
    title: "Stock Receive",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_stockReceiveReport');
    }

});
import '../../imports/ui/report/posConvertInventory/posConvertInventory';

posReport.route('/posConvertInventoryReport', {
    name: 'pos.posConvertInventoryReport',
    title: "Convert Inventory",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_convertInventoryReport');
    }

});
import '../../imports/ui/report/posConvertInventorySummary/posConvertInventorySummary';

posReport.route('/posConvertInventorySummaryReport', {
    name: 'pos.posConvertInventorySummaryReport',
    title: "Convert Inventory Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_convertInventorySummaryReport');
    }

});

import '../../imports/ui/report/posProduction/posProduction';

posReport.route('/posProductionReport', {
    name: 'pos.posProductionReport',
    title: "Production",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_productionReport');
    }

});
import '../../imports/ui/report/posProductionSummary/posProductionSummary';

posReport.route('/posProductionSummaryReport', {
    name: 'pos.posProductionSummaryReport',
    title: "Production Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_productionSummaryReport');
    }

});
import '../../imports/ui/report/posProductionResult/posProductionResult';

posReport.route('/posProductionResultReport', {
    name: 'pos.posProductionResultReport',
    title: "Production Result",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_productionResultReport');
    }

});
import '../../imports/ui/report/posProductionResultSummary/posProductionResultSummary';

posReport.route('/posProductionResultSummaryReport', {
    name: 'pos.posProductionResultSummaryReport',
    title: "Production Result Summary",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_productionResultSummaryReport');
    }

});

import '../../imports/ui/report/posSaleReceivePaymentByCustomerDetail/posSaleReceivePaymentByCustomerDetail';

posReport.route('/posSaleReceivePaymentByCustomerDetailReport', {
    name: 'pos.posSaleReceivePaymentByCustomerDetailReport',
    title: "Sale Receive Payment By Customer Detail",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_saleReceivePaymentByCustomerDetailReport');
    }

});

import '../../imports/ui/report/posInvoiceByImei/posInvoiceByImei';

posReport.route('/posInvoiceByImeiReport', {
    name: 'pos.posInvoiceByImeiReport',
    title: "Invoice By Imei",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_invoiceByImeiReport');
    }

});
import '../../imports/ui/report/posImeiExpired/posImeiExpired';

posReport.route('/posImeiExpiredReport', {
    name: 'pos.posImeiExpiredReport',
    title: "Imei Expired",
    parent: 'wb.home',
    action: function (query, params) {
        _Main('pos_imeiExpiredReport');
    }

});