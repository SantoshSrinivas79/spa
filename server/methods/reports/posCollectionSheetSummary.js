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
    posCollectionSheetSummaryReport(params, translate) {
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
                    paid: 1
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
                    total: {$sum: "$invoiceTotal"}
                }
            }
        ]);


        data.dateHeader = moment(params.date).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let collectionSheetHTML = "";
        let grandUnpaid = 0;
        let ind = 1;
        if (collectionSheetList.length > 0) {
            collectionSheetList[0].data.forEach((obj) => {
                if (obj.invoiceTotal - obj.invoiceDiscount - obj.invoicePaid > 0) {
                    collectionSheetHTML += `
                    <tr>
                            <td style="text-align: left !important;">${ind}</td>
                            <td style="text-align: left !important;">${obj.customerDoc.name}</td>
                            <td style="text-align: left !important;">${obj.customerDoc.phoneNumber || ""}</td>
                            <td>${formatCurrency((obj.invoiceTotal - obj.invoiceDiscount - obj.invoicePaid), companyDoc.baseCurrency)}</td>
                    </tr>
            
                 `
                    grandUnpaid += (obj.invoiceTotal - obj.invoiceDiscount - obj.invoicePaid);
                    ind++;
                }
            })

            collectionSheetHTML += `
            <tr>
                <th colspan="3">${translate['grandTotal']}</th>
                <td>${formatCurrency(grandUnpaid, companyDoc.baseCurrency)}</td>
            </tr>
`
        }
        data.collectionSheetHTML = collectionSheetHTML;
        return data;
    }
})
;

