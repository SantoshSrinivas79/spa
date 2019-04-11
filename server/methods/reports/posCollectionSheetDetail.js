import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';
import {Pos_Invoice} from '../../../imports/collection/posInvoice';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posCollectionSheetDetailReport(params, transalate) {
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


        parameter.dueDate = {
            $lte: moment(params.date).endOf("day").toDate(),
        };

        parameter.$or = [
            {
                closeDate: {
                    $exists: false
                }
            },
            {
                status: {$ne: "Complete"}
            },
            {
                closeDate: {
                    $gt: moment(params.date).endOf("day").toDate()
                }
            }
        ];


        let collectionSheetList = Pos_Invoice.aggregate([
            {
                $match: parameter
            },
            {
                $sort: {
                    invoiceDate: 1,
                    createdAt: 1
                }
            },
            {
                $project: {
                    customerId: 1,
                    total: 1,
                    discountValue: 1,
                    paid: 1,
                    invoiceNo: 1,
                    netTotal: 1,
                    invoiceDate: 1,
                    dueDate: 1
                }
            },
            {
                $group: {
                    _id: {
                        customerId: "$customerId"

                    },
                    invoiceTotal: {$sum: "$total"},
                    invoiceDiscount: {$sum: "$discountValue"},
                    invoicePaid: {$sum: "$paid"},
                    lastInvoiceNo: {$last: "$invoiceNo"},
                    lastInvoiceDate: {$last: "$invoiceDate"},
                    lastDueDate: {$last: "$dueDate"},
                    data: {$addToSet: "$$ROOT"}
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
                    data: {$addToSet: "$$ROOT"},
                    total: {$sum: "$invoiceTotal"}
                }
            }
        ])


        data.dateHeader = moment(params.date).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let collectionSheetHTML = "";
        let grandUnpaid = 0;
        let ind = 1;
        if (collectionSheetList.length > 0) {
            collectionSheetList[0].data.forEach((obj) => {

                collectionSheetHTML += `
                    <tr>
                            <td style="text-align: left !important;">${ind}</td>
                            <td style="text-align: left !important;">${obj.customerDoc.name}</td>
                            <td style="text-align: left !important;">${obj.customerDoc.phoneNumber || ""}</td>
                            <td colspan="2"></td>
                            <td>${formatCurrency(obj.invoiceTotal - obj.invoiceDiscount - obj.invoicePaid, companyDoc.baseCurrency)}</td>
                    </tr>
            
                 `
                ind++;

                obj.data.forEach((ob) => {
                    if (ob.total - ob.discountValue - ob.paid > 0) {
                        ob.invoiceNo = obj && ob.invoiceNo.length > 9 ? parseInt((ob && ob.invoiceNo || "0000000000000").substr(9, 13)) : parseInt(ob && ob.invoiceNo || "0");
                        ob.invoiceNo = pad(ob.invoiceNo, 6);
                        collectionSheetHTML += `
                        <tr>
                            <td colspan="3" style="text-align: center !important;">${moment(ob.invoiceDate).format("DD/MM/YYYY")}-(#${ob.invoiceNo})</td>
                            <td>${moment(ob.dueDate).format("DD/MM/YYYY")}</td>
                            <td>${moment.duration(moment(params.date).diff(moment(ob.dueDate).startOf("days").toDate())).asDays()}</td>
                            <td style="text-align: left !important;">${formatCurrency(ob.total - ob.discountValue - ob.paid, companyDoc.baseCurrency)}</td>
                        </tr>
                    
                    `


                        grandUnpaid += ob.total - ob.discountValue - ob.paid;
                    }
                })

            })

            collectionSheetHTML += `
            <tr>
                <th colspan="5">${transalate['grandTotal']}</th>
                <td>${formatCurrency(grandUnpaid, companyDoc.baseCurrency)}</td>
            </tr>
`
        }
        data.collectionSheetHTML = collectionSheetHTML;
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