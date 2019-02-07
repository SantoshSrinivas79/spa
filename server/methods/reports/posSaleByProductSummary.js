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
import {Pos_Product} from "../../../imports/collection/posProduct";

Meteor.methods({
    posSaleByProductSummaryReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        if (params.locationId != "") {
            parameter.locationId = params.locationId;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});

        let newParams = {};
        if (params.categoryId !== "") {
            if (params.productId != "") {
                newParams["item.itemId"] = params.productId;
            } else {
                let productList = Pos_Product.find({categoryId: params.categoryId}).map((obj) => obj._id);
                newParams["item.itemId"] = {$in: productList};
            }
        }
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
                $unwind: {
                    path: "$item",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: newParams
            },
            {
                $project: {
                    itemId: "$item.itemId",
                    itemName: "$item.itemName",
                    amount: "$item.amount",
                    qty: "$item.qty",
                    item: {
                        $let: {
                            vars: {parts: {$split: ["$item.itemName", " : "]}},
                            in: {
                                $arrayElemAt: ["$$parts", 1]
                            }
                        }
                    },
                }
            },
            {
                $group: {
                    _id: {
                        itemId: "$itemId",
                        itemName: "$itemName",
                        item: "$item"
                    },
                    total: {$sum: "$amount"},
                    totalQty: {$sum: "$qty"},
                }
            },
            {
                $sort: {
                    "_id.item": 1
                }
            },
            {
                $group: {
                    _id: null,
                    data: {$push: "$$ROOT"},
                    total: {$sum: "$total"}
                }
            }
        ]);

        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let saleHTML = "";
        let ind = 1;
        if (salelList.length > 0) {
            salelList[0].data.forEach((obj) => {
                if (obj.total > 0) {
                    saleHTML += `
                    <tr>
                            <td style="text-align: center !important;">${ind}</td>
                            <td style="text-align: left !important;">${obj._id.itemName && obj._id.itemName.split(":")[1] || ""}</td>
                            <td style="text-align: left !important;">${obj.totalQty}</td>
                            <td>${formatCurrency(obj.total, companyDoc.baseCurrency)}</td>
                    </tr>
            
            `
                    ind++;
                }
            })
            saleHTML += `
            <tr>
                <th colspan="3">${translate['grandTotal']}</th>
                 <td>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</td>
            </tr>
`

        }
        data.saleHTML = saleHTML;
        return data;
    }
})
;

