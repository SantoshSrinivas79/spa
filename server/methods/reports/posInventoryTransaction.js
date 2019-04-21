import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';
import {Pos_Bill} from '../../../imports/collection/posBill';
import {Pos_AverageInventory} from '../../../imports/collection/posAverageInventory';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"
import {Pos_Product} from "../../../imports/collection/posProduct";

Meteor.methods({
    posInventoryTransactionReport(params, translate) {
        let parameter = {};

        if (params.area !== "") {
            parameter.rolesArea = params.area;
        }

        if (params.locationId !== "") {
            parameter.locationId = params.locationId;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});
        if (params.categoryId !== "") {
            if (params.productId != "") {
                parameter.itemId = params.productId;
            } else {
                let productList = Pos_Product.find({categoryId: params.categoryId}).map((obj) => obj._id);
                parameter.itemId = {$in: productList};
            }
        }


        parameter.averageInventoryDate = {
            $lte: moment(params.date[1]).endOf("day").toDate(),
            $gte: moment(params.date[0]).startOf("day").toDate()
        };

        let inventoryTransactionList = Pos_AverageInventory.aggregate([
            {
                $match: parameter
            },
            {
                $sort: {
                    //averageInventoryDate: 1
                    createdAt: 1
                }
            },
            {
                $lookup: {
                    from: 'pos_product',
                    localField: 'itemId',
                    foreignField: '_id',
                    as: 'productDoc'
                }
            },
            {
                $unwind: {
                    path: "$productDoc",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: 'pos_unit',
                    localField: 'productDoc.unitId',
                    foreignField: '_id',
                    as: 'unitDoc'
                }
            }
            ,
            {
                $unwind: {
                    path: "$unitDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        locationId: "$locationId"

                    },
                    data: {$push: "$$ROOT"}

                }
            },
            {
                $lookup: {
                    from: 'pos_location',
                    localField: '_id.locationId',
                    foreignField: '_id',
                    as: 'locationDoc'
                }
            }
            ,
            {
                $unwind: {
                    path: "$locationDoc",
                    preserveNullAndEmptyArrays: true
                }
            },


            {
                $group: {
                    _id: null,
                    data: {$addToSet: "$$ROOT"}
                }
            }
        ]);


        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let inventoryTransactionHTML = "";
        let grandTotal = 0;
        if (inventoryTransactionList.length > 0) {
            inventoryTransactionList[0].data.forEach((obj) => {
                if (obj.data) {
                    let ind = 1;
                    let subTotal = 0;
                    inventoryTransactionHTML += `
                    <tr>
                        <th colspan="12" style="text-align: left !important;">${translate['location']} : ${obj.locationDoc.name}</th>
                    </tr>
                `;

                    obj.data.forEach((ob) => {
                        inventoryTransactionHTML += `
                    <tr>
                            <td style="text-align: left !important;">${ind}</td>
                            <td style="text-align: left !important;">${moment(ob.createdAt).format("DD/MM/YYYY hh:mm:ss")}</td>
                            <td style="text-align: left !important;">${ob.averageInventoryDateName}</td>
                            <td style="text-align: left !important;">${ob.cusVendName || ""}</td>
                            <td style="text-align: left !important;">${ob.productDoc && ob.productDoc.name || ""}</td>
                            <td style="text-align: left !important;">${ob.transactionType}</td>
                            <td style="text-align: left !important;">${ob.qty || ""}</td>
                            <td style="text-align: left !important;">${ob.unitDoc && ob.unitDoc.name || ""}</td>

                            <td>${formatCurrency(ob.price, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(ob.amount, companyDoc.baseCurrency)}</td>
                             <td style="text-align: left !important;">${ob.qtyEnding || ""}</td>
                            <td>${formatCurrency(ob.averageCost, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(ob.amountEnding, companyDoc.baseCurrency)}</td>
                    </tr>
            
                 `
                        ind++;
                    })

                }


            })

        }
        data.inventoryTransactionHTML = inventoryTransactionHTML;
        return data;
    }
})
;

