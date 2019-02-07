import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_Invoice} from '../../../imports/collection/posInvoice';
import {Pos_Bill} from '../../../imports/collection/posBill';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"
import {Pos_Vendor} from "../../../imports/collection/posVendor";
import {Pos_Product} from "../../../imports/collection/posProduct";

Meteor.methods({
    posInvoiceByImeiReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        if (params.locationId != "") {
            parameter.locationId = params.locationId;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});
        let reg = new RegExp(params.imei);
        parameter['item.desc'] = {$regex: reg, $options: 'mi'}
        if (params.categoryId !== "") {
            if (params.productId != "") {
                parameter["item.itemId"] = params.productId;
            } else {
                let productList = Pos_Product.find({categoryId: params.categoryId}).map((obj) => obj._id);
                parameter["item.itemId"] = {$in: productList};
            }
        }

        //Range Date
        let saleList = Pos_Invoice.find(parameter).fetch();

        data.currencyHeader = companyDoc.baseCurrency;
        let saleHTML = "";
        let purchaseHTML = "";
        let ind = 1;
        if (saleList.length > 0) {
            saleList.forEach((saleObj) => {
                let totalAm = 0;
                if (saleObj) {
                    saleObj.item.forEach((obj) => {
                        saleHTML += `
                    <tr>
                            <td style="text-align: center !important;">${ind}</td>
                            <td style="text-align: left !important;">${obj.itemName}</td>
                            <td style="text-align: left !important;">${saleObj.invoiceDateName || ""}</td>
                            <td style="text-align: left !important;">${saleObj.invoiceNo || ""}</td>
                            <td style="text-align: left !important;">${obj.desc || ""}</td>
                            <td style="text-align: left !important;">${convertToString(obj.imei)}</td>
                            <td style="text-align: left !important;">${obj.price}</td>
                            <td>${formatCurrency(obj.amount, companyDoc.baseCurrency)}</td>
                    </tr>
            
            `
                        ind++;
                        totalAm += obj.amount;
                    })
                    saleHTML += `
            <tr>
                <th colspan="5" style="text-align: left !important;">${translate['note']} : ${saleObj.note || ""}</th>
                <th colspan="2">${translate['grandTotal']}</th>
                 <td>${formatCurrency(totalAm, companyDoc.baseCurrency)}</td>
            </tr>
`
                    data.imei = params.imei;
                    data.invoiceId = saleObj.invoiceNo;
                }
            })
        }


        let purchaseList = Pos_Bill.find(parameter).fetch();
        if (purchaseList.length > 0) {
            let ind = 1;
            purchaseList.forEach((purObj) => {
                let vendorDoc = Pos_Vendor.findOne({_id: purObj.vendorId});
                purchaseHTML += `<tr>
                           <td colspan="6" style="text-align: left !important;">${translate['vendor']} : ${vendorDoc.name || ""} (${vendorDoc.phoneNumber || ""})</td>
                    </tr>`;
                purObj.item.forEach((obj) => {
                    purchaseHTML += `
                    <tr>
                            <td style="text-align: center !important;">${ind}</td>
                            <td style="text-align: left !important;">${obj.itemName}</td>
                            <td style="text-align: left !important;">${purObj.billDateName || ""}</td>
                            <td style="text-align: left !important;">${purObj.billNo || ""}</td>
                            <td style="text-align: left !important;">${convertToString(obj.imei)}</td>
                            <td style="text-align: left !important;">${obj.qty}</td>
                    </tr>
            
            `
                    ind++;
                })
            })
        }


        data.purchaseHTML = purchaseHTML;
        data.saleHTML = saleHTML;
        return data;
    }
});

let convertToString = function (arr) {
    let list = "";
    if (arr && arr.length > 0) {
        arr.forEach((o) => {
            list += `
            <p>${o.name}</p>
        `;
        })
    }
    return list;
}
