import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Loan_Disbursement} from '../../../imports/collection/loanDisbursement';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"
import moment from "moment";
import {Pos_SaleOrder} from "../../../imports/collection/posSaleOrder";
import {Acc_Exchange} from "../../../imports/collection/accExchange";

Meteor.methods({
    loanDisbursementReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;
        }
        if (params.creditOfficerId) {
            parameter.coId = params.creditOfficerId;

        }

        let data = {};
        parameter.disbursementDate = {
            $lte: moment(params.date[1]).endOf("day").toDate(),
            $gte: moment(params.date[0]).startOf("day").toDate()
        };

        let companyDoc = WB_waterBillingSetup.findOne({});

        //Range Date
        let disbursementList = Loan_Disbursement.aggregate([

            {
                $match: parameter
            },
            {
                $sort: {
                    disbursementDate: 1
                }
            },
            {
                $lookup:
                    {
                        from: "pos_customer",
                        localField: "clientId",
                        foreignField: "_id",
                        as: "clientDoc"
                    }
            },
            {
                $unwind: {
                    path: "$clientDoc",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup:
                    {
                        from: "loan_product",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productDoc"
                    }
            },
            {
                $unwind: {
                    path: "$productDoc",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup:
                    {
                        from: "loan_creditOfficer",
                        localField: "coId",
                        foreignField: "_id",
                        as: "creditOfficerDoc"
                    }
            },
            {
                $unwind: {
                    path: "$creditOfficerDoc",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);


        let exchange = Acc_Exchange.findOne({_id: params.exchangeId});

        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " To " + moment(params.date[1]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let disbursementHTML = "";

        let totalAmountUSD = 0;
        let totalFeeUSD = 0;
        let totalInterestUSD = 0;


        let totalAmountTHB = 0;
        let totalFeeTHB = 0;
        let totalInterestTHB = 0;


        let totalAmountKHR = 0;
        let totalFeeKHR = 0;
        let totalInterestKHR = 0;

        if (disbursementList.length > 0) {
            let i = 1;
            disbursementList.forEach((obj) => {
                disbursementHTML += `
                    <tr>
                            <td style="text-align: center !important;">${i}</td>
                            <td style="text-align: left !important;">${obj.loanAcc}</td>
                            <td style="text-align: left !important;">${obj.clientDoc.name}</td>
                            <td style="text-align: left !important;">${obj.creditOfficerDoc.name}</td>
                            <td style="text-align: left !important;">${obj.productDoc.name}</td>
                            <td style="text-align: left !important;">${obj.currencyId}</td>
                            <td style="text-align: left !important;">${obj.productDoc.rateType}</td>
                            <td style="text-align: left !important;">${obj.disbursementDateName}</td>
                            <td style="text-align: left !important;">${moment(obj.maturityDate).format("DD/MM/YYYY")}</td>
                            <td style="text-align: left !important;">${obj.term}</td>
                            <td style="text-align: left !important;">${obj.productDoc.rate} %</td>
                            <td style="text-align: left !important;">${obj.clientDoc.loanCycle}</td>
                            <td style="text-align: left !important;">${obj.clientDoc.address}</td>

                            <td>${formatCurrency(obj.loanAmount, obj.currencyId)}</td>
                            <td>${formatCurrency(obj.projectInterest, obj.currencyId)}</td>
                            <td>${formatCurrency(obj.feeAmount, obj.currencyId)}</td>
                            <td>${formatCurrency((obj.feeAmount + obj.projectInterest + obj.loanAmount), obj.currencyId)}</td>
                    </tr>
            
            `;
                i++;


                if (obj.currencyId === "USD") {

                    totalAmountUSD += obj.loanAmount;
                    totalFeeUSD += obj.feeAmount;
                    totalInterestUSD += obj.projectInterest;
                } else if (obj.currencyId === "KHR") {
                    totalAmountKHR += obj.loanAmount;
                    totalFeeKHR += obj.feeAmount;
                    totalInterestKHR += obj.projectInterest;
                } else if (obj.currencyId === "THB") {
                    totalAmountTHB += obj.loanAmount;
                    totalFeeTHB += obj.feeAmount;
                    totalInterestTHB += obj.projectInterest;
                }
            })
        }


        let grandTotalAmount = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalAmountUSD, params.exchangeId, exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalAmountTHB, params.exchangeId, exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalAmountKHR, params.exchangeId, exchange);
        let grandTotalFee = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalFeeUSD, params.exchangeId, exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalFeeTHB, params.exchangeId, exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalFeeKHR, params.exchangeId, exchange);
        let grandTotalInterest = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalInterestUSD, params.exchangeId, exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalInterestTHB, params.exchangeId, exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalInterestKHR, params.exchangeId, exchange);


        disbursementHTML += `
                <tr>
                    <td colspan="13">${translate['grandTotalUSD']}</td>
                    <td>${formatCurrency(totalAmountUSD, "USD")}</td>
                    <td>${formatCurrency(totalInterestUSD, "USD")}</td>
                    <td>${formatCurrency(totalFeeUSD, "USD")}</td>
                    <td>${formatCurrency(totalAmountUSD + totalFeeUSD + totalInterestUSD, "USD")}</td>
                  
                </tr> 
                <tr>
                    <td colspan="13">${translate['grandTotalKHR']}</td>
                    <td>${formatCurrency(totalAmountKHR, "KHR")}</td>
                    <td>${formatCurrency(totalInterestKHR, "KHR")}</td>
                    <td>${formatCurrency(totalFeeKHR, "KHR")}</td>
                    <td>${formatCurrency(totalAmountKHR + totalFeeKHR + totalInterestKHR, "KHR")}</td>
                  
                </tr> 
                <tr>
                    <td colspan="13">${translate['grandTotalTHB']}</td>
                    <td>${formatCurrency(totalAmountTHB, "THB")}</td>
                    <td>${formatCurrency(totalInterestTHB, "THB")}</td>
                    <td>${formatCurrency(totalFeeTHB, "THB")}</td>
                    <td>${formatCurrency(totalAmountTHB + totalFeeTHB + totalInterestTHB, "THB")}</td>
                  
                </tr> 
                <tr>
                    <td colspan="13">${translate['grandTotal']}</td>
                    <td>${formatCurrency(grandTotalAmount, companyDoc.baseCurrency)}</td>
                    <td>${formatCurrency(grandTotalInterest, companyDoc.baseCurrency)}</td>
                    <td>${formatCurrency(grandTotalFee, companyDoc.baseCurrency)}</td>
                    <td>${formatCurrency(grandTotalAmount + grandTotalInterest + grandTotalFee, companyDoc.baseCurrency)}</td>
                  
                </tr>
        `;
        data.disbursementHTML = disbursementHTML;
        return data;
    }
});

let switchDay = function (val) {
    let day = moment(val).format("ddd");
    let str;
    switch (day) {
        case "Mon":
            str = 'ច័ន្ទ';
            break;
        case "Tue":
            str = 'អង្គារ៍';
            break;

        case "Wed":
            str = 'ពុធ';
            break;
        case "Thu":
            str = 'ព្រហស្បត្តិ៍';
            break;
        case "Fri":
            str = 'សុក្រ';
            break;
        case "Sat":
            str = 'សៅរ៍';
            break;
        case "Sun":
            str = 'អាទិត្យ';
            break;
        default:
            str = "";
            break;
    }
    return str;
}
