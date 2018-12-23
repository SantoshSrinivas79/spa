import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_Production} from '../../../imports/collection/posProduction';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient, formatNumber} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posProductionReport(params, translate) {
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


        if (params.statusId === "In Progress") {
            parameter.status = false;
        } else if (params.statusId === "Done") {
            parameter.status = true;

        }
        let productionList;
        let productionHTML = "";
        let total = 0;
        //Range Date

        productionList = Pos_Production.aggregate([

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

        if (productionList.length > 0) {
            let ind = 1;
            productionList[0].data.forEach((obj) => {
                productionHTML += `
                        <tr>
                              <td style="text-align: center !important;vertical-align: inherit">${ind}</td>
                                 <td  style="vertical-align: inherit;text-align: left !important;">${obj.name}</td>
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

        data.productionHTML = productionHTML;
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
