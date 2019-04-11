import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_Bill} from '../../../imports/collection/posBill';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posPurchaseByVendorSummaryReport(params, translate) {
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
            $lte: moment(params.date[1]).endOf("day").toDate(),
            $gte: moment(params.date[0]).startOf("day").toDate()
        };


        //Range Date
        let purchaseList = Pos_Bill.aggregate([

            {
                $match: parameter
            },
            {
                $group: {
                    _id: {
                        vendorId: "$vendorId"
                    },
                    total: {$sum: "$total"},
                    discountValue: {$sum: "$discountValue"},
                    netTotal: {$sum: "$netTotal"},
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
                    total: {$sum: "$total"},
                    netTotal: {$sum: "$netTotal"},
                    discountValue: {$sum: "$discountValue"},
                }
            }
        ]);

        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let purchaseHTML = "";
        if (purchaseList.length > 0) {
            let ind = 1;
            purchaseList[0].data.forEach((obj) => {
                purchaseHTML += `
                    <tr>
                                                <td style="text-align: center !important;">${ind}</td>

                            <td style="text-align: left !important;">${obj.vendorDoc.name}</td>
                            <td>${formatCurrency(obj.total, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(obj.discountValue, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(obj.netTotal, companyDoc.baseCurrency)}</td>
                    </tr>
            
            `
                ind++;
            })
            purchaseHTML += `
            <tr>
                <th colspan="2">${translate['grandTotal']}</th>
                 <td>${formatCurrency(purchaseList[0].total, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(purchaseList[0].discountValue, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(purchaseList[0].netTotal, companyDoc.baseCurrency)}</td>
            </tr>
`

        }
        data.purchaseHTML = purchaseHTML;
        return data;
    }
})
;

