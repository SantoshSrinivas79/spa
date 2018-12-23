import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_ProductionResult} from '../../../imports/collection/posProductionResult';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient, formatNumber} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posProductionResultReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        if (params.locationId != "") {
            parameter.locationId = params.locationId;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});


        parameter.date = {
            $gte: moment(params.date[0]).startOf("day").toDate(),
            $lte: moment(params.date[1]).endOf("day").toDate()
        };

        let productionResultList;
        let productionResultHTML = "";
        let total = 0;
        //Range Date

        productionResultList = Pos_ProductionResult.aggregate([

            {
                $match: parameter
            },
            {
                $sort: {
                    date: 1
                }
            },
            {
                $lookup: {
                    from: "pos_location",
                    localField: "locationId",
                    foreignField: "_id",
                    as: "locationDoc"
                }
            },
            {
                $unwind: {path: "$locationDoc", preserveNullAndEmptyArrays: true}
            },
            {
                $lookup: {
                    from: "pos_production",
                    localField: "productionId",
                    foreignField: "_id",
                    as: "productionDoc"
                }
            },
            {
                $unwind: {path: "$productionDoc", preserveNullAndEmptyArrays: true}
            },
            {
                $unwind: {path: "$convert", preserveNullAndEmptyArrays: true}
            }, {
                $lookup: {
                    from: "pos_product",
                    localField: "convert.productId",
                    foreignField: "_id",
                    as: "productConvertDoc"
                }
            }, {
                $unwind: {path: "$productConvertDoc", preserveNullAndEmptyArrays: true}
            },
            {
                $group: {
                    _id: null,
                    data: {$push: "$$ROOT"},
                }
            }
        ])

        if (productionResultList.length > 0) {
            let ind = 1;
            productionResultList[0].data.forEach((obj) => {
                productionResultHTML += `
                        <tr>
                              <td style="text-align: center !important;vertical-align: inherit">${ind}</td>
                                 <td  style="vertical-align: inherit;text-align: left !important;">${obj.productionDoc.name} (${obj.productionDoc.dateName})</td>
                                 <td  style="vertical-align: inherit;text-align: left !important;">${obj.dateName}</td>
                                 <td style="text-align: left !important;">${obj.productConvertDoc.name}</td>
                                 <td style="text-align: left">${formatNumber(obj.convert.qty)}</td>
                                 <td style="vertical-align: inherit">${obj.description || ""}</td>
                        </tr>
                `;


                ind++;

            })
        }


        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");

        data.productionResultHTML = productionResultHTML;
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
