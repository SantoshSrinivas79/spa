import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_Invoice} from '../../../imports/collection/posInvoice';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posInvoicePrintSmallReport(invoiceId, translate) {
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});


        //Range Date
        let invoiceList = Pos_Invoice.aggregate([
            {$match: {_id: invoiceId}},
            {
                $lookup: {
                    from: 'pos_customer',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customerDoc'
                }
            }, {
                $unwind: {
                    path: "$customerDoc",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);

        let printInvoiceSmallHtml = "";
        let ind = 1;
        if (invoiceList.length > 0) {
            invoiceList[0].invoiceNo = invoiceList[0].invoiceNo && invoiceList[0].invoiceNo.length > 9 ? parseInt((invoiceList[0].invoiceNo && invoiceList[0].invoiceNo || "0000000000000").substr(9, 13)) : parseInt(invoiceList[0].invoiceNo && invoiceList[0].invoiceNo || "0");
            invoiceList[0].invoiceNo = pad(invoiceList[0].invoiceNo, 6);
            invoiceList[0].item.forEach((obj) => {
                printInvoiceSmallHtml += `
                    <tr style="padding: 2px !important;">
                            <td style="border: 0px !important;">${ind}</td>
                            <td style="text-align: left !important;border: 0px !important;">${obj.itemName.split(":")[1] && obj.itemName.split(":")[1].trim() || obj.itemName}</td>
                            <td style="border: 0px !important;">${obj.totalUnit}</td>
                            <td style="border: 0px !important;">${formatCurrency(obj.price, companyDoc.baseCurrency)}</td>
                            <td style="border: 0px !important;">${formatCurrency(obj.amount, companyDoc.baseCurrency)}</td>
                    </tr>
            
            `
                ind++;
            })

            let returnAmount = "";

            let remainAmount = "";
            if (companyDoc.baseCurrency === "KHR") {
                if (invoiceList[0].remainKHR < 0) {
                    returnAmount = translate['returnKHR'];
                    remainAmount = formatCurrency(Math.abs(invoiceList[0].remainKHR), "KHR") + getCurrencySymbolById("KHR");
                }
            } else if (companyDoc.baseCurrency === "USD") {
                if (invoiceList[0].remainKHR < 0) {
                    returnAmount = translate['returnUSD'];
                    remainAmount = formatCurrency(Math.abs(invoiceList[0].remainUSD), "USD") + getCurrencySymbolById("USD");
                }
            } else if (companyDoc.baseCurrency === "THB") {
                if (invoiceList[0].remainKHR < 0) {
                    returnAmount = translate['returnTHB'];
                    remainAmount = formatCurrency(Math.abs(invoiceList[0].remainTHB), "THB") + getCurrencySymbolById("THB");
                }
            }
            printInvoiceSmallHtml += `
                <tr>
                    <td colspan="2" style="border-left: 0px !important;border-bottom: 0px !important;border-right: 0px !important;text-align: right;padding-bottom: 0px !important;">${translate['total']} :</td>
                    <td colspan="3" style="border-left: 0px !important;border-bottom: 0px !important;border-right: 0px !important;padding-bottom: 0px !important;text-align: right !important;">${formatCurrency(invoiceList[0].total, companyDoc.baseCurrency)} ${getCurrencySymbolById(companyDoc.baseCurrency)}</td>
                </tr>
                `;

            if (invoiceList[0].discountValue > 0) {
                printInvoiceSmallHtml += `
                <tr>  
                    <td colspan="2" style="border: 0px !important;text-align: right;padding-bottom: 0px !important;">${translate['discount']} :</td>
                    <td colspan="3" style="border: 0px !important;padding-bottom: 0px !important;text-align: right !important;">${formatCurrency(invoiceList[0].discountValue, companyDoc.baseCurrency)} ${getCurrencySymbolById(companyDoc.baseCurrency)}</td>
                </tr>
                <tr>
                
                    <td colspan="2" style="border: 0px !important;text-align: right;padding-bottom: 0px !important;">${translate['netTotal']} :</td>
                    <td colspan="3" style="border: 0px !important;padding-bottom: 0px !important;text-align: right !important;">${formatCurrency(invoiceList[0].netTotal, companyDoc.baseCurrency)} ${getCurrencySymbolById(companyDoc.baseCurrency)}</td>
                </tr>`;
            }


            if (invoiceList[0].paidUSD > 0) {
                printInvoiceSmallHtml += `
                  <tr>
                    <td colspan="2" style="border: 0px !important;text-align: right;padding-bottom: 0px !important;">${translate['paidUSD']} :</td>
                    <td colspan="3" style="border: 0px !important;padding-bottom: 0px !important;text-align: left !important;">${formatCurrency(invoiceList[0].paidUSD, "USD")} ${getCurrencySymbolById("USD")}</td>
                </tr>
                `;
            }
            if (invoiceList[0].paidTHB > 0) {
                printInvoiceSmallHtml += `
                  <tr>
                    <td colspan="2" style="border: 0px !important;text-align: right;padding-bottom: 0px !important;">${translate['paidTHB']} :</td>
                    <td colspan="3" style="border: 0px !important;padding-bottom: 0px !important;text-align: left !important;">${formatCurrency(invoiceList[0].paidTHB, "THB")} ${getCurrencySymbolById("THB")}</td>
                </tr>
                `;
            }

            if (invoiceList[0].paidKHR > 0) {
                printInvoiceSmallHtml += `
                  <tr>
                    <td colspan="2" style="border: 0px !important;text-align: right;padding-bottom: 0px !important;">${translate['paidKHR']} :</td>
                    <td colspan="3" style="border: 0px !important;padding-bottom: 0px !important;text-align: left !important;">${formatCurrency(invoiceList[0].paidKHR, "KHR")} ${getCurrencySymbolById("KHR")}</td>
                </tr>
                `;
            }

            let noteLabel = "";
            let note = "";
            if (invoiceList[0].note && invoiceList[0].note !== "") {
                noteLabel = translate['note'] + " : ";
                note = invoiceList[0].note;
            } else {
                note = translate["pleaseCheck"];
            }


            printInvoiceSmallHtml += `
                <tr>
                    <th colspan="2" style="border: 0px !important;text-align: right;padding-bottom: 0px !important;">${translate['paid']} :</th>
                    <th colspan="3" style="border: 0px !important;padding-bottom: 0px !important;text-align: right !important;">${formatCurrency(invoiceList[0].paid, companyDoc.baseCurrency)} ${getCurrencySymbolById(companyDoc.baseCurrency)}</th>
                </tr>
                <tr>
                    <td colspan="2" style="border: 0px !important;text-align: right;padding-bottom: 0px !important;">${translate['totalDue']} :</td>
                    <td colspan="3" style="border: 0px !important;padding-bottom: 0px !important;text-align: right !important;">${formatCurrency(invoiceList[0].netTotal - invoiceList[0].paid, companyDoc.baseCurrency)} ${getCurrencySymbolById(companyDoc.baseCurrency)}</td>
                </tr>
            `;

            if (invoiceList[0].remainKHR < 0) {
                printInvoiceSmallHtml += `<tr>
                <td colspan="2" style="border-left: 0px !important;border-top: 0px !important;border-bottom: 0px !important;border-right: 0px !important;text-align: right;padding-bottom: 0px !important;">${returnAmount}</td>
                <td colspan="3" style="border-left: 0px !important;border-top: 0px !important;border-bottom: 0px !important;border-right: 0px !important;text-align: right;padding-bottom: 0px !important;text-align: left !important;">${remainAmount}</td>

                </tr>`;
            }

            printInvoiceSmallHtml += `
                <tr>
                    <td colspan="5" style="border: 0px !important;text-align: center;padding-bottom: 0px !important;padding-top: 0px !important;">&nbsp;</td>

                </tr>
                 <tr>
                    <td colspan="5" style="border: 0px !important;text-align: center;padding-bottom: 0px !important;padding-top: 0px !important;">${translate['thankYou']}</td>

                </tr>
                <tr>
                <td colspan="5" style="border: 0px !important; text-align: center !important;font-size: 8px !important;">${translate['forQuestion']} ${companyDoc && companyDoc.phoneNumber || ""}</td>
                </tr>   
            `;


        }
        data.invoiceDoc = invoiceList[0];
        data.printInvoiceSmallHtml = printInvoiceSmallHtml;
        return data;
    }
});

function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}
