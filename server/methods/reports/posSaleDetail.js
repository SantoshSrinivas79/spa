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
import {formatNumber} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posSaleDetailReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        if (params.locationId != "") {
            parameter.locationId = params.locationId;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});


        parameter.invoiceDate = {
            $lte: moment(params.date[1]).endOf("day").toDate(),
            $gte: moment(params.date[0]).startOf("day").toDate()
        };

        let salelList;
        let saleHTML = "";
        let totalQty = 0;

        salelList = Pos_Invoice.aggregate([

            {
                $match: parameter
            },
            {
                $sort: {
                    invoiceDate: 1
                }
            },
            {
                $lookup:
                    {
                        from: "pos_customer",
                        localField: "customerId",
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
                $group: {
                    _id: null,
                    data: {$push: "$$ROOT"},
                    total: {$sum: "$total"},
                    discountValue: {$sum: "$discountValue"},
                    netTotal: {$sum: "$netTotal"},
                }
            }
        ])

        if (salelList.length > 0) {
            let ind = 1;
            salelList[0].data.forEach((obj) => {
                obj.item.forEach((o) => {
                    totalQty += o.qty;
                    saleHTML += `
                           <tr>
                                <td style="text-align: center !important;">${moment(obj.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td style="text-align: left !important;">${obj.customerDoc.name}</td>
                                <td style="text-align: left !important;">${o.itemName && o.itemName.split(":")[1] || ""}</td>
                                <td>${convertToString(o.imei)}</td>
                                <td>${formatNumber(o.qty)}</td>
                           
                           </tr>
                    `;
                    ind++;
                })
            })
            saleHTML += `
            <tr>
                  <th colspan="4">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
            </tr>
`

        }


        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;

        data.saleHTML = saleHTML;
        return data;
    }
});


function getVoucherSubString(invoiceNo) {
    let newInvoice = invoiceNo.length > 9 ? parseInt((invoiceNo || "0000000000000").substr(9, 13)) : parseInt(invoiceNo || "0");
    return pad(newInvoice, 6);
}

function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}


let convertToString = function (arr) {
    let list = "";
    if (arr && arr.length > 0) {
        arr.forEach((o) => {
            list += `
            <p>${o.name}</p>
        `;
        })
    }

    return list;
}
