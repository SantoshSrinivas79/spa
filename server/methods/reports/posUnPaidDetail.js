import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_PayBill} from '../../../imports/collection/posPayBill';
import {Pos_Bill} from '../../../imports/collection/posBill';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posUnPaidDetailReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        if (params.locationId != "") {
            parameter.locationId = params.locationId;
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
        parameter2.$or = [
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


        ]

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
                    billNo: 1,
                    billDate: 1
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
                    lastBillNo: {$last: "$billNo"},
                    lastBillDate: {$last: "$billDate"},
                    data: {$addToSet: "$$ROOT"}

                }
            },
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
                    "payBillDoc.payBillDate": 1,
                    "payBillDoc.createdAt": 1
                }
            },
            {
                $group: {
                    _id: {
                        vendorId: "$_id.vendorId",
                        receiveId: "$payBillDoc._id",
                    },
                    billTotal: {$last: "$billTotal"},
                    billDiscount: {$last: "$billDiscount"},
                    billPaid: {$last: "$billPaid"},
                    payBillDoc: {$push: "$payBillDoc"},
                    lastBillNo: {$last: "$lastBillNo"},
                    data: {$last: "$data"},
                    lastBillDate: {$last: "$lastBillDate"},
                    totalPaidFromBill: {$sum: {$cond: [{$ifNull: ["$payBillDoc.billId", true]}, 0, "$payBillDoc.totalPaid"]}},
                    totalDiscountFromBill: {$sum: {$cond: [{$ifNull: ["$payBillDoc.billId", true]}, 0, "$payBillDoc.totalDiscount"]}},
                    isFromBill: {$last: {$cond: [{$ifNull: ["$payBillDoc.billId", true]}, false, true]}},
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
                        vendorId: "$_id.vendorId",
                        receiveId: "$payBillDoc.bill._id",

                    },
                    billTotal: {$last: "$billTotal"},
                    billDiscount: {$last: "$billDiscount"},
                    billPaid: {$last: "$billPaid"},
                    lastBillNo: {$last: "$lastBillNo"},
                    lastBillDate: {$last: "$lastBillDate"},
                    data: {$last: "$data"},
                    totalPaidReceive: {$sum: {$cond: [{$eq: ["$isFromBill", true]}, 0, "$payBillDoc.bill.paid"]}},
                    totalDiscountReceive: {$sum: {$cond: [{$eq: ["$isFromBill", true]}, 0, "$payBillDoc.bill.discount"]}},
                    totalPaidFromBill: {$last: "$totalPaidFromBill"},
                    totalDiscountFromBill: {$last: "$totalDiscountFromBill"}
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
                    lastBillNo: {$last: "$lastBillNo"},
                    lastBillDate: {$last: "$lastBillDate"},
                    data: {$last: "$data"},
                    dataPayment: {$addToSet: "$$ROOT"}

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
                    data: {$addToSet: "$$ROOT"},
                    total: {$sum: "$billTotal"}
                }
            }
        ])
        data.dateHeader = moment(params.date).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let unPaidHTML = "";
        let grandTotal = 0;
        let grandUnpaid = 0;
        let ind = 1;
        if (unPaidList.length > 0) {
            unPaidList[0].data.forEach((obj) => {

                let newUnPaidHtml = "";
                let balanceUnpay = 0;
                obj.data.forEach((ob) => {
                    let findReceiveByBill = function (element) {
                        if (element._id.billId === ob._id) {
                            return element;
                        }
                    }

                    let payDoc = obj.dataPayment.find(findReceiveByBill);

                    if (ob.total - (ob.totalPaidFromBill || 0) - (ob.totalDiscountFromBill || 0)  - (ob.discountValue || 0) - (payDoc && payDoc.totalPaidReceive || 0) - (payDoc && payDoc.totalDiscountReceive || 0) > 0) {


                        ob.billNo = ob && ob.billNo.length > 9 ? parseInt((ob && ob.billNo || "0000000000000").substr(9, 13)) : parseInt(ob && ob.billNo || "0");
                        ob.billNo = pad(ob.billNo, 6);

                        balanceUnpay += ob.total - (ob.totalPaidFromBill || 0) - (ob.totalDiscountFromBill || 0)  - (ob.discountValue || 0) - (payDoc && payDoc.totalPaidReceive || 0) - (payDoc && payDoc.totalDiscountReceive || 0);
                        newUnPaidHtml += `
                        <tr>
                            <td colspan="3" style="text-align: center !important;">${moment(ob.billDate).format("DD/MM/YYYY")}-(#${ob.billNo})</td>
                            <td style="text-align: left !important;">${formatCurrency(ob.total - (ob.totalPaidFromBill || 0) - (ob.totalDiscountFromBill || 0)  - (ob.discountValue || 0) - (payDoc && payDoc.totalPaidReceive || 0) - (payDoc && payDoc.totalDiscountReceive || 0), companyDoc.baseCurrency)}</td>
                        </tr>
                    `;

                    }
                });

                if (balanceUnpay > 0) {
                    unPaidHTML += `
                    <tr>
                            <td style="text-align: left !important;">${ind}</td>
                            <td style="text-align: left !important;">${obj.vendorDoc.name}</td>
                            <td style="text-align: left !important;">${obj.vendorDoc.phoneNumber || ""}</td>
                            <td>${formatCurrency((balanceUnpay), companyDoc.baseCurrency)}</td>
                    </tr>
            
                 `;
                    ind++;

                }

                unPaidHTML += newUnPaidHtml;


                grandTotal += obj.billTotal;
                grandUnpaid += balanceUnpay;
            })

            unPaidHTML += `
            <tr>
                <th colspan="3">${translate['grandTotal']}</th>
                 <td>${formatCurrency(grandUnpaid, companyDoc.baseCurrency)}</td>
            </tr>
`
        }
        data.unPaidHTML = unPaidHTML;
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