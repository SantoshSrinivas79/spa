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
    posReceivePaymentSummaryReport(params, translate) {
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
                $sort: {
                    "customerDoc.name": 1
                }
            },
            {
                $group: {
                    _id: null,
                    data: {$push: "$$ROOT"},
                    totalPaid: {$sum: "$totalPaid"},
                    totalDiscount: {$sum: "$totalDiscount"},
                    balanceUnPaid: {$sum: "$balanceUnPaid"},
                }
            }
        ]);

        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let receivePaymentHTML = "";
        if (receivePaymentList.length > 0) {
            let ind = 1;
            receivePaymentList[0].data.forEach((obj) => {
                receivePaymentHTML += `
                    <tr>
                                                <td style="text-align: center !important;">${ind}</td>

                            <td style="text-align: left !important;">${obj.customerDoc.name}</td>
                            <td>${formatCurrency(obj.totalPaid, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(obj.totalDiscount, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(obj.balanceUnPaid, companyDoc.baseCurrency)}</td>
                    </tr>
            
            `
                ind++;
            })
            receivePaymentHTML += `
            <tr>
                <th colspan="2">${translate['grandTotal']}</th>
                 <td>${formatCurrency(receivePaymentList[0].totalPaid, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(receivePaymentList[0].totalDiscount, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(receivePaymentList[0].balanceUnPaid, companyDoc.baseCurrency)}</td>
            </tr>
`

        }
        data.receivePaymentHTML = receivePaymentHTML;
        return data;
    }
})
;

