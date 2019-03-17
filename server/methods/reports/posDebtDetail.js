import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';
import {Pos_Invoice} from '../../../imports/collection/posInvoice';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posDebtDetailReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        if (params.locationId != "") {
            parameter.locationId = params.locationId;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});


        parameter.invoiceDate = {
            $lte: moment(params.date).endOf("day").toDate(),
        };

        parameter.$or = [
            {
                closeDate: {
                    $exists: false
                }
            },
            {
                status: {$ne: "Complete"}
            },
            {
                closeDate: {
                    $gt: moment(params.date).endOf("day").toDate()
                }
            }
        ];


        let parameter2 = {};
        /*parameter2.$or = [
            {
                "receiveDoc.receivePaymentDate": {
                    $exists: false
                }
            },
            {
                "receiveDoc.receivePaymentDate": {
                    $lt: moment(params.date).endOf("day").toDate()
                }
            }
        ];*/


        let debtList = Pos_Invoice.aggregate([
            {
                $match: parameter
            },
            {
                $sort: {
                    invoiceDate: 1,
                    createdAt: 1
                }
            },
            {
                $project: {
                    _id: 1,
                    customerId: 1,
                    total: 1,
                    discountValue: 1,
                    paid: 1,
                    netTotal: 1,
                    invoiceNo: 1,
                    dueDate: 1,
                    invoiceDate: 1
                }
            },
            {
                $group: {
                    _id: {
                        customerId: "$customerId"

                    },
                    invoiceTotal: {$sum: "$total"},
                    invoiceDiscount: {$sum: "$discountValue"},
                    invoicePaid: {$sum: "$paid"},
                    lastInvoiceNo: {$last: "$invoiceNo"},
                    lastInvoiceDate: {$last: "$invoiceDate"},
                    data: {$addToSet: "$$ROOT"}
                }
            },
            {
                $lookup: {
                    from: 'pos_receivePayment',
                    let: {customerId: "$_id.customerId"},
                    pipeline: [
                        {
                            $match:
                                {
                                    $expr:
                                        {
                                            $and:
                                                [
                                                    {$eq: ["$customerId", "$$customerId"]},
                                                    {$lte: ["$receivePaymentDate", moment(params.date).endOf("day").toDate()]}
                                                ]
                                        }
                                }

                        },
                        //{$project: {_id: 1}}
                    ],
                    as: 'receiveDoc'
                }
            },
            {
                $unwind: {
                    path: "$receiveDoc",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $match: parameter2
            },
            {
                $sort: {
                    "receiveDoc.createdAt": 1,
                    "receiveDoc.receivePaymentDate": 1
                }
            },


            {
                $group: {
                    _id: {
                        customerId: "$_id.customerId",
                        receiveId: "$receiveDoc._id",

                    },
                    invoiceTotal: {$last: "$invoiceTotal"},
                    invoiceDiscount: {$last: "$invoiceDiscount"},
                    invoicePaid: {$last: "$invoicePaid"},
                    lastInvoiceNo: {$last: "$lastInvoiceNo"},
                    lastInvoiceDate: {$last: "$lastInvoiceDate"},
                    data: {$last: "$data"},
                    receiveDocInvoiceId: {$last: "$receiveDoc.invoiceId"},
                    totalPaidFromInvoice: {$last: {$cond: [{$eq: [{$ifNull: ["$receiveDoc.invoiceId", "UnSpecify"]}, "UnSpecify"]}, 0, "$receiveDoc.totalPaid"]}},
                    totalDiscountFromInvoice: {$last: {$cond: [{$eq: [{$ifNull: ["$receiveDoc.invoiceId", "UnSpecify"]}, "UnSpecify"]}, 0, "$receiveDoc.totalDiscount"]}},
                    receiveDoc: {$last: "$receiveDoc"},
                    isFromInvoice: {$last: {$cond: [{$eq: [{$ifNull: ["$receiveDoc.invoiceId", "UnSpecify"]}, "UnSpecify"]}, false, true]}},
                }
            },
            {
                $unwind: {
                    path: "$receiveDoc.invoice",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        customerId: "$_id.customerId",
                        invoiceId: "$receiveDoc.invoice._id",

                    },
                    invoiceTotal: {$last: "$invoiceTotal"},
                    invoiceDiscount: {$last: "$invoiceDiscount"},
                    invoicePaid: {$last: "$invoicePaid"},
                    lastInvoiceNo: {$last: "$lastInvoiceNo"},
                    lastInvoiceDate: {$last: "$lastInvoiceDate"},
                    data: {$last: "$data"},
                    totalPaidReceive: {$sum: {$cond: [{$eq: ["$isFromInvoice", true]}, 0, "$receiveDoc.invoice.paid"]}},
                    totalDiscountReceive: {$sum: {$cond: [{$eq: ["$isFromInvoice", true]}, 0, "$receiveDoc.invoice.discount"]}},
                    totalPaidFromInvoice: {$sum: {$cond: [{$eq: ["$receiveDoc.invoice._id", "$receiveDocInvoiceId"]}, "$totalPaidFromInvoice", 0]}},
                    totalDiscountFromInvoice: {$sum: {$cond: [{$eq: ["$receiveDoc.invoice._id", "$receiveDocInvoiceId"]}, "$totalDiscountFromInvoice", 0]}},
                }
            },
            {
                $group: {
                    _id: {
                        customerId: "$_id.customerId"
                    },
                    invoiceTotal: {$last: "$invoiceTotal"},
                    invoiceDiscount: {$last: "$invoiceDiscount"},
                    invoicePaid: {$last: "$invoicePaid"},
                    lastInvoiceNo: {$last: "$lastInvoiceNo"},
                    lastInvoiceDate: {$last: "$lastInvoiceDate"},
                    data: {$last: "$data"},
                    dataReceivePayment: {$addToSet: "$$ROOT"}

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
                $sort: {
                    "customerDoc.name": 1
                }
            },
            {
                $group: {
                    _id: null,
                    data: {$addToSet: "$$ROOT"},
                    total: {$sum: "$invoiceTotal"}
                }
            }
        ])
        data.dateHeader = moment(params.date).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let debtHTML = "";
        let grandTotal = 0;
        let grandUnpaid = 0;
        let ind = 1;
        if (debtList.length > 0) {
            debtList[0].data.forEach((obj) => {

                let newDebtHtml = "";
                let balanceUnpay = 0;


                obj.data.forEach((ob) => {
                    let findReceiveByInvoice = function (element) {
                        if (element._id.invoiceId === ob._id) {
                            return element;
                        }
                    }


                    let receiveDoc = obj.dataReceivePayment.find(findReceiveByInvoice);
                    if (ob.total - (receiveDoc && receiveDoc.totalPaidFromInvoice || 0) - (receiveDoc && receiveDoc.totalDiscountFromInvoice || 0) - (ob.discountValue || 0) - (receiveDoc && receiveDoc.totalPaidReceive || 0) - (receiveDoc && receiveDoc.totalDiscountReceive || 0) > 0) {

                        ob.invoiceNo = ob && ob.invoiceNo.length > 9 ? parseInt((ob && ob.invoiceNo || "0000000000000").substr(9, 13)) : parseInt(ob && ob.invoiceNo || "0");
                        ob.invoiceNo = pad(ob.invoiceNo, 6);

                        balanceUnpay += ob.total - (receiveDoc && receiveDoc.totalPaidFromInvoice || 0) - (receiveDoc && receiveDoc.totalDiscountFromInvoice || 0) - (ob.discountValue || 0) - (receiveDoc && receiveDoc.totalPaidReceive || 0) - (receiveDoc && receiveDoc.totalDiscountReceive || 0);
                        if (ob.dueDate.getTime() >= params.date.getTime()) {
                            newDebtHtml += `
                        <tr>
                            <td colspan="3" style="text-align: center !important;">${moment(ob.invoiceDate).format("DD/MM/YYYY")}-(#${ob.invoiceNo})</td>
                            <td style="text-align: left !important;">${formatCurrency(ob.total - (receiveDoc && receiveDoc.totalPaidFromInvoice || 0) - (receiveDoc && receiveDoc.totalDiscountFromInvoice || 0) - (ob.discountValue || 0) - (receiveDoc && receiveDoc.totalPaidReceive || 0) - (receiveDoc && receiveDoc.totalDiscountReceive || 0), companyDoc.baseCurrency)}</td>
                        </tr>
                    
                    `;
                        } else {
                            newDebtHtml += `
                        <tr>
                            <td colspan="3" style="text-align: center !important;">${moment(ob.invoiceDate).format("DD/MM/YYYY")}-(#${ob.invoiceNo})</td>
                            <td style="text-align: left !important;color: red !important;">${formatCurrency(ob.total - (receiveDoc && receiveDoc.totalPaidFromInvoice || 0) - (receiveDoc && receiveDoc.totalDiscountFromInvoice || 0) - (ob.discountValue || 0) - (receiveDoc && receiveDoc.totalPaidReceive || 0) - (receiveDoc && receiveDoc.totalDiscountReceive || 0), companyDoc.baseCurrency)}</td>
                        </tr>
                    
                    `;
                        }
                    }
                });

                if (balanceUnpay > 0) {
                    debtHTML += `
                    <tr>
                            <td style="text-align: left !important;">${ind}</td>
                            <td style="text-align: left !important;">${obj.customerDoc.name}</td>
                            <td style="text-align: left !important;">${obj.customerDoc.phoneNumber || ""}</td>
                            <td>${formatCurrency((balanceUnpay), companyDoc.baseCurrency)}</td>
                    </tr>
            
                 `;
                    ind++;

                }

                debtHTML += newDebtHtml;


                grandTotal += obj.invoiceTotal;
                grandUnpaid += balanceUnpay;
            });

            debtHTML += `
            <tr>
                <th colspan="3">${translate['grandTotal']}</th>
                 <td>${formatCurrency(grandUnpaid, companyDoc.baseCurrency)}</td>
            </tr>
`
        }
        data.debtHTML = debtHTML;
        return data;
    }
})
;

function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}