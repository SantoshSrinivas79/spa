import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';
import {Pos_Bill} from '../../../imports/collection/posBill';
import {Pos_AverageInventory} from '../../../imports/collection/posAverageInventory';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient, formatNumber} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"
import {Pos_Product} from "../../../imports/collection/posProduct";

Meteor.methods({
    posInventoryEndingReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;
        }

        if (params.locationId != "") {
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
            $lte: moment(params.date).endOf("day").toDate(),
        };

        let inventoryEndingList = Pos_AverageInventory.aggregate([
            {
                $match: parameter
            },
            {
                $sort: {
                    createdAt: 1
                }
            },
            {
                $group: {
                    _id: {
                        itemId: "$itemId",
                        locationId: "$locationId"

                    },
                    qtyEnding: {$last: "$qtyEnding"},
                    averageCost: {$last: "$averageCost"},
                    amountEnding: {$last: "$amountEnding"},
                }
            },
            {
                $lookup: {
                    from: 'pos_product',
                    localField: '_id.itemId',
                    foreignField: '_id',
                    as: 'productDoc'
                }
            }
            ,
            {
                $unwind: {
                    path: "$productDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: {
                    "productDoc.name": 1
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
                        locationId: "$_id.locationId"

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
                    data: {$addToSet: "$$ROOT"},
                    totalAmount: {$sum: "$amountEnding"}
                }
            }
        ]);


        data.dateHeader = moment(params.date).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let inventoryEndingHTML = "";
        let grandTotal = 0;
        if (inventoryEndingList.length > 0) {
            inventoryEndingList[0].data.forEach((obj) => {
                if (obj.data) {
                    let ind = 1;
                    let subTotal = 0;
                    inventoryEndingHTML += `
                    <tr>
                        <th colspan="6" style="text-align: left !important;">${translate['location']} : ${obj.locationDoc.name}</th>
                    </tr>
                `;
                    obj.data.forEach((ob) => {
                        inventoryEndingHTML += `
                    <tr>
                            <td style="text-align: left !important;">${ind}</td>
                            <td style="text-align: left !important;">${ob.productDoc && ob.productDoc.name || ""}</td>
                            <td style="text-align: left !important;">${formatNumber(ob.qtyEnding)}</td>
                            <td style="text-align: left !important;">${ob.unitDoc && ob.unitDoc.name || ""}</td>

                            <td>${formatCurrency(ob.averageCost, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(ob.amountEnding, companyDoc.baseCurrency)}</td>
                    </tr>
            
                 `;
                        grandTotal += ob.amountEnding;
                        subTotal += ob.amountEnding;
                        ind++;
                    });

                    inventoryEndingHTML += `
            <tr>
                <th colspan="5" style="text-align: left !important;">${translate['grandTotal']}  : ${obj.locationDoc.name}</th>
                 <td>${formatCurrency(subTotal, companyDoc.baseCurrency)}</td>
            </tr>
`
                }


            });

            inventoryEndingHTML += `
            <tr>
                <th colspan="5">${translate['grandTotal']}</th>
                 <td>${formatCurrency(grandTotal, companyDoc.baseCurrency)}</td>
            </tr>
`
        }
        data.inventoryEndingHTML = inventoryEndingHTML;
        return data;
    }
})
;

