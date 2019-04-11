import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_PayBill} from '../../../imports/collection/posPayBill';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posPayBillSummaryReport(params, translate) {
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


        parameter.payBillDate = {
            $lte: moment(params.date[1]).endOf("day").toDate(),
            $gte: moment(params.date[0]).startOf("day").toDate()
        };
        parameter.totalPaid = {$gt: 0};

        //Range Date
        let payBillList = Pos_PayBill.aggregate([

            {
                $match: parameter
            },
            {
                $sort: {
                    payBillDate: 1,
                    createdAt: 1,
                }
            },
            {
                $group: {
                    _id: {
                        vendorId: "$vendorId"
                    },
                    totalPaid: {$sum: "$totalPaid"},
                    totalDiscount: {$sum: "$totalDiscount"},
                    balanceUnPaid: {$last: "$balanceUnPaid"},
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
                    vendorDoc: -1,
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
        let payBillHTML = "";
        if (payBillList.length > 0) {
            let ind = 1;
            payBillList[0].data.forEach((obj) => {
                payBillHTML += `
                    <tr>
                                                                                        <td style="text-align: center !important;">${ind}</td>

                            <td style="text-align: left !important;">${obj.vendorDoc.name}</td>
                            <td>${formatCurrency(obj.totalPaid, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(obj.totalDiscount, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(obj.balanceUnPaid, companyDoc.baseCurrency)}</td>
                    </tr>
            
            `
                ind++;
            })
            payBillHTML += `
            <tr>
                <th colspan="2">${translate['grandTotal']}</th>
                 <td>${formatCurrency(payBillList[0].totalPaid, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(payBillList[0].totalDiscount, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(payBillList[0].balanceUnPaid, companyDoc.baseCurrency)}</td>
            </tr>
`

        }
        data.payBillHTML = payBillHTML;
        return data;
    }
})
;

