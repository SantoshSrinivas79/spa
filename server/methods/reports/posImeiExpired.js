import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';
import {Pos_Bill} from '../../../imports/collection/posBill';
import {Pos_ImeiBill} from '../../../imports/collection/posImeiBill';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient, formatNumber} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"
import {Pos_Product} from "../../../imports/collection/posProduct";

Meteor.methods({
    posImeiExpiredReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;
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

        parameter.expiredDate = {
            $lte: moment(params.date).endOf("day").toDate(),
        };

        let imeiExpiredList = Pos_ImeiBill.aggregate([
            {
                $match: parameter
            },
            {
                $group: {
                    _id: {
                        itemId: "$itemId"

                    },
                    totalQty: {$sum: 1},
                    data: {$push: "$$ROOT"}
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
            }
        ]);

        data.dateHeader = moment(params.date).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let imeiExpiredHTML = "";
        let ind = 1;
        if (imeiExpiredList.length > 0) {
            imeiExpiredList.forEach((obj) => {
                let lengthData = obj.data.length;
                if (lengthData > 0) {

                    let imInd = 1;
                    obj.data.forEach((ob) => {
                        if (imInd === 1) {


                            imeiExpiredHTML += `
                    <tr>
                            <td style="text-align: left !important;" rowspan="${lengthData}">${ind}</td>
                            <td style="text-align: left !important;" rowspan="${lengthData}">${obj.productDoc && obj.productDoc.name || ""}</td>
                            <td style="text-align: left !important;" rowspan="${lengthData}">${formatNumber(obj.totalQty)}</td>
                            <td style="text-align: left !important;" rowspan="${lengthData}">${obj.unitDoc && obj.unitDoc.name || ""}</td>
                            <td style="text-align: center !important;">${ob.name}</td>
                            <td>${moment(ob.billDate).format("DD-MM-YYYY")}</td>
                            <td>${moment(ob.expiredDate).format("DD-MM-YYYY")}</td>
                    </tr>
            
                 `;
                        } else {

                            imeiExpiredHTML += `
                    <tr>
                            <td style="text-align: center !important;">${ob.name}</td>
                            <td>${moment(ob.billDate).format("DD-MM-YYYY")}</td>
                            <td>${moment(ob.expiredDate).format("DD-MM-YYYY")}</td>
                    </tr>
            
                 `;
                        }

                        imInd++;
                    });
                }
                ind++;


            });
        }
        data.imeiExpiredHTML = imeiExpiredHTML;
        return data;
    }
})
;

