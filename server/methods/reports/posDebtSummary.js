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
    posDebtSummaryReport(params, translate) {
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
                    customerId: 1,
                    total: 1,
                    discountValue: 1,
                    paid: 1,
                    invoiceDate: 1,
                    _id: 1
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
                    invoiceList: {$push: "$_id"},
                    invoiceDate: {$first: "$invoiceDate"}
                }
            },
            {
                $lookup: {
                    from: 'pos_receivePayment',
                    let: {customerId: "$_id.customerId", invoiceList: "$invoiceList"},
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
                        //{$project: {_id: 0}}
                    ],
                    as: 'receiveDoc'
                }
            }
            ,
            {
                $unwind: {
                    path: "$receiveDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: {
                    "receiveDoc.createdAt": 1,
                    "receiveDoc.receivePaymentDate": 1,
                }
            },

            {
                $group: {
                    _id: {
                        receiveId: "$receiveDoc._id",
                        customerId: "$_id.customerId",
                    },
                    invoiceTotal: {$last: "$invoiceTotal"},
                    invoiceDiscount: {$last: "$invoiceDiscount"},
                    invoicePaid: {$last: "$invoicePaid"},
                    invoiceList: {$last: "$invoiceList"},
                    invoiceDate: {$last: "$invoiceDate"},

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
                        customerId: "$_id.customerId"
                    },
                    invoiceTotal: {$last: "$invoiceTotal"},
                    invoiceDiscount: {$last: "$invoiceDiscount"},
                    invoicePaid: {$last: "$invoicePaid"},
                    invoiceDoc: {$push: "$receiveDoc.invoice"},
                    invoiceList: {$last: "$invoiceList"},
                    invoiceDate: {$last: "$invoiceDate"},
                    totalPaidFromInvoice: {$sum: {$cond: [{$and: [{$or: [{$eq: ["$receiveDoc.invoice._id", "$receiveDocInvoiceId"]}, {$eq: [{$ifNull: ["$receiveDoc.invoice._id", "UnSpecify"]}, "UnSpecify"]}]}, {$in: ["$receiveDocInvoiceId", "$invoiceList"]}]}, "$totalPaidFromInvoice", 0]}},
                    totalDiscountFromInvoice: {$sum: {$cond: [{$or: [{$eq: ["$receiveDoc.invoice._id", "$receiveDocInvoiceId"]}, {$eq: [{$ifNull: ["$receiveDoc.invoice._id", "UnSpecify"]}, "UnSpecify"]}]}, "$totalDiscountFromInvoice", 0]}},


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
                    data: {$push: "$$ROOT"},
                    total: {$sum: "$invoiceTotal"}
                }
            }
        ]);


        data.dateHeader = moment(params.date).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let debtHTML = "";
        let grandTotal = 0;
        let grandDiscount = 0;
        let grandUnpaid = 0;
        let grandPaid = 0;
        let ind = 1;
        if (debtList.length > 0) {
            debtList[0].data.forEach((obj) => {
                let toPaid = 0;
                let toDiscount = 0;
                if (obj.invoiceDoc.length > 0) {

                    obj.invoiceDoc.forEach((inv) => {
                        if (obj.invoiceList.indexOf(inv._id) > -1) {
                            toPaid += inv.paid + inv.discount;
                            toDiscount += inv.discount;
                        }
                    })
                }
                toPaid += obj.totalPaidFromInvoice;
                toPaid += obj.totalDiscountFromInvoice;

                if ((obj.invoiceTotal - obj.invoiceDiscount - toPaid) > 0) {
                    debtHTML += `
                    <tr>
                            <td style="text-align: left !important;">${ind}</td>
                            <td style="text-align: left !important;">${obj.customerDoc.name}</td>
                            <td style="text-align: left !important;">${obj.customerDoc && obj.customerDoc.phoneNumber || ""}</td>
                            <td>${formatCurrency(obj.invoiceTotal, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(obj.invoiceDiscount + (obj.receiveDoc && obj.receiveDoc.totalDiscount) || 0, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(toPaid, companyDoc.baseCurrency)}</td>

                            <td>${formatCurrency((obj.invoiceTotal - obj.invoiceDiscount - toPaid), companyDoc.baseCurrency)}</td>
                    </tr>
            
                 `
                    grandTotal += obj.invoiceTotal;
                    grandPaid += toPaid;
                    grandDiscount += obj.invoiceDiscount + (toDiscount) || 0;
                    grandUnpaid += (obj.invoiceTotal - obj.invoiceDiscount - toPaid);
                    ind++;
                }
            })

            debtHTML += `
            <tr>
                <th colspan="3">${translate['grandTotal']}</th>
                 <td>${formatCurrency(grandTotal, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(grandDiscount, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(grandPaid, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(grandUnpaid, companyDoc.baseCurrency)}</td>
            </tr>
`
        }
        data.debtHTML = debtHTML;
        return data;
    }
})
;

