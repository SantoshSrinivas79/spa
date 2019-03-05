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
import {Loan_RepaymentSchedule} from "../../../imports/collection/loanRepaymentSchedule";
import {Loan_Disbursement} from "../../../imports/collection/loanDisbursement";

Meteor.methods({
    loanOutstandingReport(params, translate) {
        let selectorDisbursement = {};


        if (params.area != "") {
            selectorDisbursement.rolesArea = params.area;
        }

        if (params.creditOfficerId != "") {
            selectorDisbursement.coId = params.creditOfficerId;
        }

        let data = {};
        selectorDisbursement.$or = [
            {status: "Active"},
            {status: {$ne: "Write Off"}},
            {
                payOffDate: {
                    $gt: moment(params.date).endOf("day").toDate(),
                }
            }, {
                writeOffDate: {
                    $gt: moment(params.date).endOf("day").toDate(),
                }
            }
        ];

        selectorDisbursement.disbursementDate = {$lte: moment(params.date).endOf("day").toDate()};

        let companyDoc = WB_waterBillingSetup.findOne({});


        let exchange = Acc_Exchange.findOne({_id: params.exchangeId});
        //Range Date
        let loanOutstandingList = Loan_Disbursement.aggregate([

            {
                $match: selectorDisbursement
            },
            {
                $lookup:
                    {
                        from: "loan_repayment",
                        localField: "_id",
                        foreignField: "disbursementId",
                        as: "repaymentDoc"
                    }
            },
            {
                $unwind: {
                    path: "$repaymentDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        _id: "$_id"
                    },
                    clientId: {$last: "$clientId"},
                    currencyId: {$last: "$currencyId"},
                    productId: {$last: "$productId"},
                    disbursementDateName: {$last: "$disbursementDateName"},
                    coId: {$last: "$coId"},
                    loanAcc: {$last: "$loanAcc"},
                    loanAmount: {$last: "$loanAmount"},
                    repaymentIdList: {$push: {$cond: [{$lte: ["$repaymentDoc.repaymentDate", moment(params.date).endOf("day").toDate()]}, "$repaymentDoc._id", null]}},
                    totalPrinciple: {$sum: {$cond: [{$lte: ["$repaymentDoc.repaymentDate", moment(params.date).endOf("day").toDate()]}, "$repaymentDoc.principlePaid", 0]}},
                    totalInterest: {$sum: {$cond: [{$lte: ["$repaymentDoc.repaymentDate", moment(params.date).endOf("day").toDate()]}, "$repaymentDoc.interestPaid", 0]}},
                    totalPenalty: {$sum: {$cond: [{$lte: ["$repaymentDoc.repaymentDate", moment(params.date).endOf("day").toDate()]}, "$repaymentDoc.penaltyPaid", 0]}},
                    totalFee: {$sum: {$cond: [{$lte: ["$repaymentDoc.repaymentDate", moment(params.date).endOf("day").toDate()]}, {$cond: [{$eq: ["$repaymentDoc.type", "Fee"]}, "$repaymentDoc.paid", 0]}, 0]}},
                }
            },

            {
                $lookup:
                    {
                        from: "loan_repaymentSchedule",
                        localField: "_id._id",
                        foreignField: "loanId",
                        as: "repaymentScheduleDoc"
                    }
            },
            {
                $unwind: {
                    path: "$repaymentScheduleDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$repaymentScheduleDoc.paid",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        _id: "$_id._id"
                    },
                    clientId: {$last: "$clientId"},
                    currencyId: {$last: "$currencyId"},
                    productId: {$last: "$productId"},
                    disbursementDateName: {$last: "$disbursementDateName"},
                    coId: {$last: "$coId"},
                    loanAcc: {$last: "$loanAcc"},
                    loanAmount: {$last: "$loanAmount"},
                    totalPrinciple: {$last: "$totalPrinciple"},
                    totalInterest: {$last: "$totalInterest"},
                    totalPenalty: {$last: "$totalPenalty"},
                    totalFee: {$last: "$totalFee"},
                    prepayPrinciple: {$sum: {$cond: [{$and: [{$gt: ["$repaymentScheduleDoc.date", moment(params.date).endOf("day").toDate()]}, {$in: ["$repaymentScheduleDoc.paid.repaymentId", "$repaymentIdList"]}, {$ne: ["$repaymentIdList", null]}]}, "$repaymentScheduleDoc.paid.principlePaid", 0]}},
                    prepayInterest: {$sum: {$cond: [{$and: [{$gt: ["$repaymentScheduleDoc.date", moment(params.date).endOf("day").toDate()]}, {$in: ["$repaymentScheduleDoc.paid.repaymentId", "$repaymentIdList"]}, {$ne: ["$repaymentIdList", null]}]}, "$repaymentScheduleDoc.paid.interestPaid", 0]}},
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


        data.dateHeader = moment(params.date).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let loanOutstandingHTML = "";

        let totalPrincipleUSD = 0;
        let totalPrinciplePaidUSD = 0;
        let totalInterestPaidUSD = 0;
        let totalFeePaidUSD = 0;
        let totalPenaltyPaidUSD = 0;
        let totalUSD = 0;

        let totalPrincipleTHB = 0;
        let totalPrinciplePaidTHB = 0;
        let totalInterestPaidTHB = 0;
        let totalFeePaidTHB = 0;
        let totalPenaltyPaidTHB = 0;
        let totalTHB = 0;

        let totalPrincipleKHR = 0;

        let totalPrinciplePaidKHR = 0;
        let totalInterestPaidKHR = 0;
        let totalFeePaidKHR = 0;
        let totalPenaltyPaidKHR = 0;
        let totalKHR = 0;

        let totalPrinciple = 0;
        let totalPrinciplePaid = 0;
        let totalInterestPaid = 0;
        let totalFeePaid = 0;
        let totalPenaltyPaid = 0;
        let total = 0;

        if (loanOutstandingList.length > 0) {
            let i = 1;
            loanOutstandingList.forEach((obj) => {
                loanOutstandingHTML += `
                    <tr>
                            <td style="text-align: center !important;">${i}</td>
                            <td style="text-align: left !important;">${obj.loanAcc}</td>
                            <td style="text-align: left !important;">${obj.clientDoc.name}</td>
                            <td style="text-align: left !important;">${obj.currencyId}</td>
                            <td style="text-align: left !important;">${obj.productDoc.rateType}</td>
                            <td style="text-align: left !important;">${obj.disbursementDateName}</td>
                            <td style="text-align: left !important;">${obj.productDoc.rate || ""} %</td>
                            <td style="text-align: left !important;">${obj.clientDoc.phoneNumber || ""}</td>
                            <td style="text-align: left !important;">${obj.clientDoc.address || ""}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.loanAmount, obj.currencyId)}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.totalPrinciple - obj.prepayPrinciple, obj.currencyId)}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.totalInterest - obj.prepayInterest, obj.currencyId)}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.totalFee, obj.currencyId)}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.totalPenalty, obj.currencyId)}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.loanAmount - obj.totalPrinciple + obj.prepayPrinciple, obj.currencyId)}</td>
                            
                    </tr>
            
            `;
                i++;


                if (obj.currencyId === "USD") {
                    totalPrincipleUSD += numeral(formatCurrencyLast(obj.loanAmount, obj.currencyId)).value();
                    totalPrinciplePaidUSD += numeral(formatCurrencyLast(obj.totalPrinciple - obj.prepayPrinciple, obj.currencyId)).value();
                    totalInterestPaidUSD += numeral(formatCurrencyLast(obj.totalInterest - obj.prepayInterest, obj.currencyId)).value();
                    totalFeePaidUSD += numeral(formatCurrencyLast(obj.totalFee, obj.currencyId)).value();
                    totalPenaltyPaidUSD += numeral(formatCurrencyLast(obj.totalPenalty, obj.currencyId)).value();
                    totalUSD += numeral(formatCurrencyLast(obj.loanAmount - obj.totalPrinciple + obj.prepayPrinciple, obj.currencyId)).value();
                } else if (obj.currencyId === "KHR") {
                    totalPrincipleKHR += numeral(formatCurrencyLast(obj.loanAmount, obj.currencyId)).value();

                    totalPrinciplePaidKHR += numeral(formatCurrencyLast(obj.totalPrinciple - obj.prepayPrinciple, obj.currencyId)).value();
                    totalInterestPaidKHR += numeral(formatCurrencyLast(obj.totalInterest - obj.prepayInterest, obj.currencyId)).value();
                    totalFeePaidKHR += numeral(formatCurrencyLast(obj.totalFee, obj.currencyId)).value();
                    totalPenaltyPaidKHR += numeral(formatCurrencyLast(obj.totalPenalty, obj.currencyId)).value();
                    totalKHR += numeral(formatCurrencyLast(obj.loanAmount - obj.totalPrinciple + obj.prepayPrinciple, obj.currencyId)).value();
                } else if (obj.currencyId === "THB") {
                    totalPrincipleTHB += numeral(formatCurrencyLast(obj.loanAmount, obj.currencyId)).value();

                    totalPrinciplePaidTHB += numeral(formatCurrencyLast(obj.totalPrinciple - obj.prepayPrinciple, obj.currencyId)).value();
                    totalInterestPaidTHB += numeral(formatCurrencyLast(obj.totalInterest - -obj.prepayInterest, obj.currencyId)).value();
                    totalFeePaidTHB += numeral(formatCurrencyLast(obj.totalFee, obj.currencyId)).value();
                    totalPenaltyPaidTHB += numeral(formatCurrencyLast(obj.totalPenalty, obj.currencyId)).value();
                    totalTHB += numeral(formatCurrencyLast(obj.loanAmount - obj.totalPrinciple + obj.prepayPrinciple, obj.currencyId)).value();
                }
            })
        }


        totalPrinciple = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalPrincipleUSD, params.exchangeId, exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalPrincipleTHB, params.exchangeId, exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalPrincipleKHR, params.exchangeId, exchange);
        totalPrinciplePaid = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalPrinciplePaidUSD, params.exchangeId, exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalPrinciplePaidTHB, params.exchangeId, exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalPrinciplePaidKHR, params.exchangeId, exchange);
        totalInterestPaid = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalInterestPaidUSD, params.exchangeId, exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalInterestPaidTHB, params.exchangeId, exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalInterestPaidKHR, params.exchangeId, exchange);
        totalFeePaid = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalFeePaidUSD, params.exchangeId, exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalFeePaidTHB, params.exchangeId, exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalFeePaidKHR, params.exchangeId, exchange);
        totalPenaltyPaid = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalPenaltyPaidUSD, params.exchangeId, exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalPenaltyPaidTHB, params.exchangeId, exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalPenaltyPaidKHR, params.exchangeId, exchange);
        total = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalUSD, params.exchangeId, exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalTHB, params.exchangeId, exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalKHR, params.exchangeId, exchange);


        loanOutstandingHTML += `
                <tr>
                    <td colspan="9">${translate['grandTotalUSD']}</td>
                    <td>${formatCurrency(totalPrincipleUSD, "USD")}</td>
                    <td>${formatCurrency(totalPrinciplePaidUSD, "USD")}</td>
                    <td>${formatCurrency(totalInterestPaidUSD, "USD")}</td>
                    <td>${formatCurrency(totalFeePaidUSD, "USD")}</td>
                    <td>${formatCurrency(totalPenaltyPaidUSD, "USD")}</td>
                    <td>${formatCurrency(totalUSD, "USD")}</td>
                  
                </tr> 
                <tr>
                    <td colspan="9">${translate['grandTotalKHR']}</td>
                    <td>${formatCurrency(totalPrincipleKHR, "KHR")}</td>
                    <td>${formatCurrency(totalPrinciplePaidKHR, "KHR")}</td>
                    <td>${formatCurrency(totalInterestPaidKHR, "KHR")}</td>
                    <td>${formatCurrency(totalFeePaidKHR, "KHR")}</td>
                    <td>${formatCurrency(totalPenaltyPaidKHR, "KHR")}</td>
                    <td>${formatCurrency(totalKHR, "KHR")}</td>
                  
                </tr> <tr>
                    <td colspan="9">${translate['grandTotalTHB']}</td>
                    <td>${formatCurrency(totalPrincipleTHB, "THB")}</td>
                    <td>${formatCurrency(totalPrinciplePaidTHB, "THB")}</td>
                    <td>${formatCurrency(totalInterestPaidTHB, "THB")}</td>
                    <td>${formatCurrency(totalFeePaidTHB, "THB")}</td>
                    <td>${formatCurrency(totalPenaltyPaidTHB, "THB")}</td>
                    <td>${formatCurrency(totalTHB, "THB")}</td>
                  
                </tr> 
                <tr>
                    <th colspan="9">${translate['grandTotal']}</th>
                    <th>${formatCurrency(totalPrinciple, companyDoc.baseCurrency)}</th>
                    <th>${formatCurrency(totalPrinciplePaid, companyDoc.baseCurrency)}</th>
                    <th>${formatCurrency(totalInterestPaid, companyDoc.baseCurrency)}</th>
                    <th>${formatCurrency(totalFeePaid, companyDoc.baseCurrency)}</th>
                    <th>${formatCurrency(totalPenaltyPaid, companyDoc.baseCurrency)}</th>
                    <th>${formatCurrency(total, companyDoc.baseCurrency)}</th>
                  
                </tr>
        `;
        data.loanOutstandingHTML = loanOutstandingHTML;
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
