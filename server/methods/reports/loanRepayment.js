import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Loan_Repayment} from '../../../imports/collection/loanRepayment';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {formatCurrencyLast} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"
import moment from "moment";
import {Pos_SaleOrder} from "../../../imports/collection/posSaleOrder";
import {Acc_Exchange} from "../../../imports/collection/accExchange";

Meteor.methods({
    loanRepaymentReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;
        }
        if (params.paymentType !== "") {
            parameter.type = params.paymentType;

        }

        let data = {};
        parameter.repaymentDate = {
            $lte: moment(params.date[1]).endOf("day").toDate(),
            $gte: moment(params.date[0]).startOf("day").toDate()
        };

        let companyDoc = WB_waterBillingSetup.findOne({});


        let exchange = Acc_Exchange.findOne({_id: params.exchangeId});

        //Range Date
        let repaymentList = Loan_Repayment.aggregate([

            {
                $match: parameter
            },
            {
                $sort: {
                    repaymentDate: 1
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
            },
            {
                $lookup:
                    {
                        from: "loan_disbursement",
                        localField: "disbursementId",
                        foreignField: "_id",
                        as: "disbursementDoc"
                    }
            },
            {
                $unwind: {
                    path: "$disbursementDoc",
                    preserveNullAndEmptyArrays: true
                }
            },


            {
                $lookup:
                    {
                        from: "loan_product",
                        localField: "disbursementDoc.productId",
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
                        localField: "disbursementDoc.coId",
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
        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " To " + moment(params.date[1]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let repaymentHTML = "";

        let totalPrincipleUSD = 0;
        let totalInterestUSD = 0;
        let totalFeeUSD = 0;
        let totalPenaltyUSD = 0;
        let totalUSD = 0;


        let totalPrincipleTHB = 0;
        let totalInterestTHB = 0;
        let totalFeeTHB = 0;
        let totalPenaltyTHB = 0;
        let totalTHB = 0;


        let totalPrincipleKHR = 0;
        let totalInterestKHR = 0;
        let totalFeeKHR = 0;
        let totalPenaltyKHR = 0;
        let totalKHR = 0;

        let totalPrinciple = 0;
        let totalInterest = 0;
        let totalFee = 0;
        let totalPenalty = 0;
        let total = 0;

        if (repaymentList.length > 0) {
            let i = 1;
            repaymentList.forEach((obj) => {
                repaymentHTML += `
                    <tr>
                            <td style="text-align: center !important;">${i}</td>
                            <td style="text-align: left !important;">${obj.voucher}</td>
                            <td style="text-align: left !important;">${obj.disbursementDoc.loanAcc}</td>
                            <td style="text-align: left !important;">${obj.clientDoc.name}</td>
                            <td style="text-align: left !important;">${obj.productDoc.name}</td>
                            <td style="text-align: left !important;">${obj.currencyId}</td>
                            <td style="text-align: left !important;">${obj.productDoc.rateType}</td>
                            <td style="text-align: left !important;">${obj.disbursementDoc.disbursementDateName}</td>
                            <td style="text-align: left !important;">${moment(obj.disbursementDoc.maturityDate).format("DD/MM/YYYY")}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.disbursementDoc.loanAmount, obj.disbursementDoc.currencyId)}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.disbursementDoc.projectInterest, obj.disbursementDoc.currencyId)}</td>
                            <td style="text-align: left !important;">${obj.repaymentDateName}</td>
                            <td style="text-align: left !important;">${obj.type}</td>
                            <td style="text-align: left !important;">${obj.clientDoc.address}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.principlePaid, obj.disbursementDoc.currencyId)}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.interestPaid, obj.disbursementDoc.currencyId)}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.type === "Fee" ? obj.paid : 0, obj.disbursementDoc.currencyId)}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.penaltyPaid + obj.interestReminderChargePaid, obj.disbursementDoc.currencyId)}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.totalPaid, obj.disbursementDoc.currencyId)}</td>
                    </tr>
            
            `;
                i++;


                if (obj.currencyId === "USD") {
                    totalPrincipleUSD += numeral(formatCurrencyLast(obj.principlePaid, obj.disbursementDoc.currencyId)).value();
                    totalInterestUSD += numeral(formatCurrencyLast(obj.interestPaid, obj.disbursementDoc.currencyId)).value();
                    totalFeeUSD += numeral(formatCurrencyLast(obj.type === "Fee" ? obj.paid : 0, obj.disbursementDoc.currencyId)).value();
                    totalPenaltyUSD += numeral(formatCurrencyLast(obj.penaltyPaid + obj.interestReminderChargePaid, obj.disbursementDoc.currencyId)).value();
                    totalUSD += numeral(formatCurrencyLast(obj.totalPaid, obj.disbursementDoc.currencyId)).value();
                } else if (obj.currencyId === "KHR") {
                    totalPrincipleKHR += numeral(formatCurrencyLast(obj.principlePaid, obj.disbursementDoc.currencyId)).value();
                    totalInterestKHR += numeral(formatCurrencyLast(obj.interestPaid, obj.disbursementDoc.currencyId)).value();
                    totalFeeKHR += numeral(formatCurrencyLast(obj.type === "Fee" ? obj.paid : 0, obj.disbursementDoc.currencyId)).value();
                    totalPenaltyKHR += numeral(formatCurrencyLast(obj.penaltyPaid + obj.interestReminderChargePaid, obj.disbursementDoc.currencyId)).value();
                    totalKHR += numeral(formatCurrencyLast(obj.totalPaid, obj.disbursementDoc.currencyId)).value();
                } else if (obj.currencyId === "THB") {
                    totalPrincipleTHB += numeral(formatCurrencyLast(obj.principlePaid, obj.disbursementDoc.currencyId)).value();
                    totalInterestTHB += numeral(formatCurrencyLast(obj.interestPaid, obj.disbursementDoc.currencyId)).value();
                    totalFeeTHB += numeral(formatCurrencyLast(obj.type === "Fee" ? obj.paid : 0, obj.disbursementDoc.currencyId)).value();
                    totalPenaltyTHB += numeral(formatCurrencyLast(obj.penaltyPaid + obj.interestReminderChargePaid, obj.disbursementDoc.currencyId)).value();
                    totalTHB += numeral(formatCurrencyLast(obj.totalPaid, obj.disbursementDoc.currencyId)).value();
                }
            })
        }


        totalPrinciple = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalPrincipleUSD, params.exchangeId,exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalPrincipleTHB, params.exchangeId,exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalPrincipleKHR, params.exchangeId,exchange);
        totalInterest = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalInterestUSD, params.exchangeId,exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalInterestTHB, params.exchangeId,exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalInterestKHR, params.exchangeId,exchange);
        totalFee = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalFeeUSD, params.exchangeId,exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalFeeTHB, params.exchangeId,exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalFeeKHR, params.exchangeId,exchange);
        totalPenalty = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalPenaltyUSD, params.exchangeId,exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalPenaltyTHB, params.exchangeId,exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalPenaltyKHR, params.exchangeId,exchange);
        total = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalUSD, params.exchangeId,exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalTHB, params.exchangeId,exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalKHR, params.exchangeId,exchange);


        repaymentHTML += `
                <tr>
                    <td colspan="14">${translate['grandTotalUSD']}</td>
                    <td>${formatCurrency(totalPrincipleUSD, "USD")}</td>
                    <td>${formatCurrency(totalInterestUSD, "USD")}</td>
                    <td>${formatCurrency(totalFeeUSD, "USD")}</td>
                    <td>${formatCurrency(totalPenaltyUSD, "USD")}</td>
                    <td>${formatCurrency(totalUSD, "USD")}</td>
                  
                </tr> 
                <tr>
                    <td colspan="14">${translate['grandTotalKHR']}</td>
                    <td>${formatCurrency(totalPrincipleKHR, "KHR")}</td>
                    <td>${formatCurrency(totalInterestKHR, "KHR")}</td>
                    <td>${formatCurrency(totalFeeKHR, "KHR")}</td>
                    <td>${formatCurrency(totalPenaltyKHR, "KHR")}</td>
                    <td>${formatCurrency(totalKHR, "KHR")}</td>
                  
                </tr> <tr>
                    <td colspan="14">${translate['grandTotalTHB']}</td>
                    <td>${formatCurrency(totalPrincipleTHB, "THB")}</td>
                    <td>${formatCurrency(totalInterestTHB, "THB")}</td>
                    <td>${formatCurrency(totalFeeTHB, "THB")}</td>
                    <td>${formatCurrency(totalPenaltyTHB, "THB")}</td>
                    <td>${formatCurrency(totalTHB, "THB")}</td>
                  
                </tr> 
                <tr>
                    <td colspan="14">${translate['grandTotal']}</td>
                    <td>${formatCurrency(totalPrinciple, companyDoc.baseCurrency)}</td>
                    <td>${formatCurrency(totalInterest, companyDoc.baseCurrency)}</td>
                    <td>${formatCurrency(totalFee, companyDoc.baseCurrency)}</td>
                    <td>${formatCurrency(totalPenalty, companyDoc.baseCurrency)}</td>
                    <td>${formatCurrency(totalPrinciple + totalInterest + totalFee + totalPenalty, companyDoc.baseCurrency)}</td>
                  
                </tr>
        `;
        data.repaymentHTML = repaymentHTML;
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
