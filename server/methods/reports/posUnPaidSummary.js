import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';
import {Pos_Bill} from '../../../imports/collection/posBill';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posUnPaidSummaryReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        if (params.locationId != "") {
            parameter.locationId = params.locationId;
        }
        if (params.vendorId != "") {
            parameter.vendorId = params.vendorId;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});


        parameter.billDate = {
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
                "payBillDoc.payBillDate": {
                    $exists: false
                }
            },
            {
                "payBillDoc.payBillDate": {
                    $lt: moment(params.date).endOf("day").toDate()
                }
            }


        ];*/

        let unPaidList = Pos_Bill.aggregate([
            {
                $match: parameter
            },
            {
                $sort: {
                    billDate: 1,
                    createdAt: 1
                }
            },
            {
                $project: {
                    vendorId: 1,
                    total: 1,
                    discountValue: 1,
                    paid: 1,

                }
            },
            {
                $group: {
                    _id: {
                        vendorId: "$vendorId"

                    },
                    billTotal: {$sum: "$total"},
                    billDiscount: {$sum: "$discountValue"},
                    billPaid: {$sum: "$paid"},
                    billList: {$push: "$_id"},

                }
            }
            ,
            {
                $lookup: {
                    from: 'pos_payBill',
                    let: {vendorId: "$_id.vendorId"},
                    pipeline: [
                        {
                            $match:
                                {
                                    $expr:
                                        {
                                            $and:
                                                [
                                                    {$eq: ["$vendorId", "$$vendorId"]},
                                                    {$lte: ["$payBillDate", moment(params.date).endOf("day").toDate()]}
                                                ]
                                        }
                                }

                        },
                        //{$project: {_id: 0}}
                    ],
                    as: 'payBillDoc'
                }
            },

            {
                $unwind: {
                    path: "$payBillDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: parameter2
            },
            {
                $sort: {
                    "payBillDoc.createdAt": 1,
                    "payBillDoc.payBillDate": 1
                }
            },
            {
                $group: {
                    _id: {
                        payBillId: "$payBillDoc._id",
                        vendorId: "$_id.vendorId",

                    },
                    billTotal: {$last: "$billTotal"},
                    billDiscount: {$last: "$billDiscount"},
                    billPaid: {$last: "$billPaid"},
                    billList: {$last: "$billList"},
                    payBillDocBillId: {$last: "$payBillDoc.billId"},
                    totalPaidFromBill: {$last: {$cond: [{$eq: [{$ifNull: ["$payBillDoc.billId", "UnSpecify"]}, "UnSpecify"]}, 0, "$payBillDoc.totalPaid"]}},
                    totalDiscountFromBill: {$last: {$cond: [{$eq: [{$ifNull: ["$payBillDoc.billId", "UnSpecify"]}, "UnSpecify"]}, 0, "$payBillDoc.totalDiscount"]}},
                    payBillDoc: {$last: "$payBillDoc"},
                    isFromBill: {$last: {$cond: [{$eq: [{$ifNull: ["$payBillDoc.billId", "UnSpecify"]}, "UnSpecify"]}, false, true]}},


                }
            },
            {
                $unwind: {
                    path: "$payBillDoc.bill",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        vendorId: "$_id.vendorId"
                    },
                    billTotal: {$last: "$billTotal"},
                    billDiscount: {$last: "$billDiscount"},
                    billPaid: {$last: "$billPaid"},
                    billDoc: {$push: "$payBillDoc.bill"},
                    billList: {$last: "$billList"},
                    totalPaidFromBill: {$sum: {$cond: [{$and: [{$or: [{$eq: ["$payBillDoc.bill._id", "$payBillDocBillId"]}, {$eq: [{$ifNull: ["$payBillDoc.bill._id", "UnSpecify"]}, "UnSpecify"]}]}, {$in: ["$payBillDocBillId", "$billList"]}]}, "$totalPaidFromBill", 0]}},
                    totalDiscountFromBill: {$sum: {$cond: [{$and: [{$or: [{$eq: ["$payBillDoc.bill._id", "$payBillDocBillId"]}, {$eq: [{$ifNull: ["$payBillDoc.bill._id", "UnSpecify"]}, "UnSpecify"]}]}, {$in: ["$payBillDocBillId", "$billList"]}]}, "$totalDiscountFromBill", 0]}},
                }
            },

            {
                $lookup:
                    {
                        from: "pos_vendor",
                        localField: "_id.vendorId",
                        foreignField: "_id",
                        as: "vendorDoc"
                    }
            },
            {
                $unwind: {
                    path: "$vendorDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: {
                    "vendorDoc.name": 1
                }
            },
            {
                $group: {
                    _id: null,
                    data: {$push: "$$ROOT"},
                    total: {$sum: "$billTotal"}
                }
            }
        ]);


        data.dateHeader = moment(params.date).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let unPaidHTML = "";
        let grandTotal = 0;
        let grandDiscount = 0;
        let grandUnpaid = 0;
        let grandPaid = 0;
        let ind = 1;
        if (unPaidList.length > 0) {
            unPaidList[0].data.forEach((obj) => {
                let toPaid = 0;
                let toDiscount = 0;
                if (obj.billDoc.length > 0) {
                    obj.billDoc.forEach((inv) => {
                        if (obj.billList.indexOf(inv._id) > -1) {
                            toPaid += inv.paid + inv.discount;
                            toDiscount += inv.discount;
                        }
                    })
                }
                toPaid += obj.totalPaidFromBill;
                toPaid += obj.totalDiscountFromBill;

                if ((obj.billTotal - obj.billDiscount - toPaid) > 0) {
                    unPaidHTML += `
                    <tr>
                            <td style="text-align: left !important;">${ind}</td>
                            <td style="text-align: left !important;">${obj.vendorDoc.name}</td>
                            <td style="text-align: left !important;">${obj.vendorDoc.phoneNumber || ""}</td>
                            <td>${formatCurrency(obj.billTotal, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(obj.billDiscount + toDiscount, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(toPaid, companyDoc.baseCurrency)}</td>

                            <td>${formatCurrency((obj.billTotal - obj.billDiscount - toPaid), companyDoc.baseCurrency)}</td>
                    </tr>
            
                 `
                    grandTotal += obj.billTotal;
                    grandPaid += toPaid;
                    grandDiscount += obj.billDiscount + toDiscount;
                    grandUnpaid += (obj.billTotal - obj.billDiscount - toPaid);
                    ind++;
                }
            })

            unPaidHTML += `
            <tr>
                <th colspan="3">${translate['grandTotal']}</th>
                 <td>${formatCurrency(grandTotal, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(grandDiscount, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(grandPaid, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(grandUnpaid, companyDoc.baseCurrency)}</td>
            </tr>
`
        }
        data.unPaidHTML = unPaidHTML;
        return data;
    }
})
;

