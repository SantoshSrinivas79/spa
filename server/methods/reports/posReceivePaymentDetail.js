import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posReceivePaymentDetailReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        if (params.locationId != "") {
            parameter.locationId = params.locationId;
        }
        if (params.customerId != "") {
            parameter.customerId = params.customerId;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});


        parameter.receivePaymentDate = {
            $lte: moment(params.date[1]).endOf("day").toDate(),
            $gte: moment(params.date[0]).startOf("day").toDate()
        };

        parameter.totalPaid = {$gt: 0};


        //Range Date
        let receivePaymentList = Pos_ReceivePayment.aggregate([

            {
                $match: parameter
            },
            {
                $sort: {
                    receivePaymentDate: 1,
                    createdAt: 1,
                }
            },
            {
                $group: {
                    _id: {
                        customerId: "$customerId"
                    },

                    data: {$push: "$$ROOT"},
                    totalPaid: {$sum: "$totalPaid"},
                    totalDiscount: {$sum: "$totalDiscount"},
                    balanceUnPaid: {$last: "$balanceUnPaid"},
                }
            },
            {
                $lookup:
                    {
                        from: "pos_customer",
                        localField: "_id.customerId",
                        foreignField: "_id",
                        as: "customerDoc"
                    }
            },
            {
                $unwind: {
                    path: "$customerDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: null,
                    data: {$addToSet: "$$ROOT"},
                    totalPaid: {$sum: "$totalPaid"},
                    totalDiscount: {$sum: "$totalDiscount"},
                    balanceUnPaid: {$sum: "$balanceUnPaid"},
                }
            }
        ])

        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let receivePaymentHTML = "";
        if (receivePaymentList.length > 0) {
            receivePaymentList[0].data.forEach((obj) => {
                if (obj.totalPaid > 0) {
                    let ind = 1;

                    receivePaymentHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="3">${obj.customerDoc.name}</th>
                            <td>${formatCurrency(obj.totalPaid, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(obj.totalDiscount, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(obj.balanceUnPaid, companyDoc.baseCurrency)}</td>
                            <td></td>
                    </tr>
            `
                    obj.data.forEach((ob) => {
                            if (ob.invoiceId) {
                                receivePaymentHTML += `
                    <tr>
                                                <td style="text-align: center !important;">${ind}</td>

                            <td style="text-align: right !important;">${ob.receivePaymentDateName}</td>
                            <td style="text-align: center !important;">${getVoucherSubString(ob.invoiceNo || "")}</td>
                            <td>${formatCurrency(ob.totalPaid, companyDoc.baseCurrency)}</td>
                            <td></td>
                            <td></td>
                            <td>0</td>
                            
                    </tr>     
            `
                                ind++;

                            }
                            else {

                                ob.invoice.forEach((o) => {

                                        if (o.paid > 0) {
                                            receivePaymentHTML += `
                    <tr>
                                                <td style="text-align: center !important;">${ind}</td>

                            <td style="text-align: right !important;">${ob.receivePaymentDateName}</td>
                            <td style="text-align: center !important;">${getVoucherSubString(o.invoiceNo)}</td>
                            <td>${formatCurrency(o.paid, companyDoc.baseCurrency)}</td>
                            <td></td>
                            <td></td>
                            <td>${o.dayOverDue}</td>
                            
                    </tr>     
            `
                                            ind++;

                                        }
                                    }
                                )

                            }

                        }
                    )
                }
            })
            receivePaymentHTML += `
            <tr>
                <th colspan="3">${translate['grandTotal']}</th>
                 <td>${formatCurrency(receivePaymentList[0].totalPaid, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(receivePaymentList[0].totalDiscount, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(receivePaymentList[0].balanceUnPaid, companyDoc.baseCurrency)}</td>
                 <td></td>
            </tr>
`

        }
        data.receivePaymentHTML = receivePaymentHTML;
        return data;
    }
})
;

function getVoucherSubString(invoiceNo) {
    let newInvoice = invoiceNo.length > 9 ? parseInt((invoiceNo || "0000000000000").substr(9, 13)) : parseInt(invoiceNo || "0");
    return pad(newInvoice, 6);
}

function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}