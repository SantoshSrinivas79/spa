import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_Invoice} from '../../../imports/collection/posInvoice';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posSaleByCustomerSummaryReport(params, translate) {
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
            $lte: moment(params.date[1]).endOf("day").toDate(),
            $gte: moment(params.date[0]).startOf("day").toDate()
        };


        //Range Date
        let salelList = Pos_Invoice.aggregate([

            {
                $match: parameter
            },
            {
                $group: {
                    _id: {
                        customerId: "$customerId"
                    },
                    total: {$sum: "$total"},
                    discountValue: {$sum: "$discountValue"},
                    netTotal: {$sum: "$netTotal"},
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
                    total: {$sum: "$total"},
                    netTotal: {$sum: "$netTotal"},
                    discountValue: {$sum: "$discountValue"},
                }
            }
        ]);

        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let saleHTML = "";
        if (salelList.length > 0) {
            let ind = 1;
            salelList[0].data.forEach((obj) => {
                saleHTML += `
                    <tr>
                                                <td style="text-align: center !important;">${ind}</td>

                            <td style="text-align: left !important;">${obj.customerDoc.name}</td>
                            <td>${formatCurrency(obj.total, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(obj.discountValue, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(obj.netTotal, companyDoc.baseCurrency)}</td>
                    </tr>
            
            `
                ind++;
            })
            saleHTML += `
            <tr>
                <th colspan="2">${translate['grandTotal']}</th>
                 <td>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(salelList[0].discountValue, companyDoc.baseCurrency)}</td>
                 <td>${formatCurrency(salelList[0].netTotal, companyDoc.baseCurrency)}</td>
            </tr>
`

        }
        data.saleHTML = saleHTML;
        return data;
    }
})
;

