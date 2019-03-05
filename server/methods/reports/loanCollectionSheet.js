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

Meteor.methods({
    loanCollectionSheetReport(params, translate) {
        let selectorRepaymentSchedule = {};


        if (params.area != "") {
            selectorRepaymentSchedule.rolesArea = params.area;
        }

        let data = {};
        selectorRepaymentSchedule.isPaid = false;
        selectorRepaymentSchedule.date = {$lte: moment(params.date).endOf("day").toDate()};

        let companyDoc = WB_waterBillingSetup.findOne({});


        let exchange = Acc_Exchange.findOne({_id: params.exchangeId});
        //Range Date
        let loanCollectionSheetList = Loan_RepaymentSchedule.aggregate([

            {
                $match: selectorRepaymentSchedule
            },
            {
                $sort: {
                    installment: 1
                }
            },
            {
                $group: {
                    _id: {
                        loanId: '$loanId',
                        clientId: "$clientId"
                    },
                    firstScheduleDate: {$first: "$date"},
                    principleUnpaid: {$sum: "$principleUnpaid"},
                    interestUnpaid: {$sum: "$interestUnpaid"},
                    balanceUnpaid: {$sum: "$balanceUnpaid"},
                }
            },

            {
                $lookup:
                    {
                        from: "loan_disbursement",
                        localField: "_id.loanId",
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
                $match: {
                    "disbursementDoc.status": {$ne: "Write Off"}
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
            },
            {
                $lookup:
                    {
                        from: "loan_penalty",
                        localField: "productDoc.penaltyId",
                        foreignField: "_id",
                        as: "penaltyDoc"
                    }
            },
            {
                $unwind: {
                    path: "$penaltyDoc",
                    preserveNullAndEmptyArrays: true
                }
            },


            {
                $lookup:
                    {
                        from: "pos_customer",
                        localField: "_id.clientId",
                        foreignField: "_id",
                        as: "clientDoc"
                    }
            },
            {
                $unwind: {
                    path: "$clientDoc",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);


        data.dateHeader = moment(params.date).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;
        let loanCollectionSheetHTML = "";

        let totalPrincipleUnpaidUSD = 0;
        let totalInterestUnpaidUSD = 0;
        let totalPenaltyUnpaidUSD = 0;
        let totalUSD = 0;

        let totalPrincipleUnpaidTHB = 0;
        let totalInterestUnpaidTHB = 0;
        let totalPenaltyUnpaidTHB = 0;
        let totalTHB = 0;


        let totalPrincipleUnpaidKHR = 0;
        let totalInterestUnpaidKHR = 0;
        let totalPenaltyUnpaidKHR = 0;
        let totalKHR = 0;

        let totalPrincipleUnpaid = 0;
        let totalInterestUnpaid = 0;
        let totalPenaltyUnpaid = 0;
        let total = 0;

        if (loanCollectionSheetList.length > 0) {
            let i = 1;
            loanCollectionSheetList.forEach((obj) => {

                let dayLate = moment(params.date).startOf("days").add(12, "hours").diff(obj.firstScheduleDate, "days");
                dayLate = dayLate > 0 ? dayLate : 0;
                let penalty = 0;
                if (obj && obj.penaltyDoc && dayLate > obj.penaltyDoc.graceDay) {
                    let penaltyPerday;
                    if (obj.disbursementDoc.currencyId === "USD") {
                        penaltyPerday = obj.penaltyDoc.amountUSD;
                    } else if (obj.disbursementDoc.currencyId === "KHR") {
                        penaltyPerday = obj.penaltyDoc.amountKHR;
                    } else if (obj.disbursementDoc.currencyId === "THB") {
                        penaltyPerday = obj.penaltyDoc.amountTHB;
                    }

                    if (obj.penaltyDoc.type === "A") {
                        penalty = numeral(formatCurrencyLast((dayLate - obj.penaltyDoc.graceDay) * penaltyPerday, obj.disbursementDoc.currencyId)).value();
                    } else if (obj.penaltyDoc.type === "P") {
                        penalty = numeral(formatCurrencyLast((dayLate - obj.penaltyDoc.graceDay) * (penaltyPerday * obj.principleUnpaid / 100), obj.disbursementDoc.currencyId)).value();
                    }
                } else {
                    penalty = 0;
                }

                loanCollectionSheetHTML += `
                    <tr>
                            <td style="text-align: center !important;">${i}</td>
                            <td style="text-align: left !important;">${obj.disbursementDoc.loanAcc}</td>
                            <td style="text-align: left !important;">${obj.clientDoc.name}</td>
                            <td style="text-align: left !important;">${dayLate}</td>
                            <td style="text-align: left !important;">${obj.disbursementDoc.currencyId}</td>
                            <td style="text-align: left !important;">${obj.clientDoc.phoneNumber || ""}</td>
                            <td style="text-align: left !important;">${obj.clientDoc.address || ""}</td>
                         
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.principleUnpaid, obj.disbursementDoc.currencyId)}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.interestUnpaid, obj.disbursementDoc.currencyId)}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(penalty, obj.disbursementDoc.currencyId)}</td>
                            <td style="text-align: left !important;">${formatCurrencyLast(obj.balanceUnpaid + penalty, obj.disbursementDoc.currencyId)}</td>
                            
                    </tr>
            
            `;
                i++;


                if (obj.disbursementDoc.currencyId === "USD") {
                    totalPrincipleUnpaidUSD += numeral(formatCurrencyLast(obj.principleUnpaid, obj.disbursementDoc.currencyId)).value();
                    totalInterestUnpaidUSD += numeral(formatCurrencyLast(obj.interestUnpaid, obj.disbursementDoc.currencyId)).value();
                    totalPenaltyUnpaidUSD += numeral(formatCurrencyLast(penalty, obj.disbursementDoc.currencyId)).value();
                    totalUSD += numeral(formatCurrencyLast(obj.balanceUnpaid + penalty, obj.disbursementDoc.currencyId)).value();
                } else if (obj.disbursementDoc.currencyId === "KHR") {

                    totalPrincipleUnpaidKHR += numeral(formatCurrencyLast(obj.principleUnpaid, obj.disbursementDoc.currencyId)).value();
                    totalInterestUnpaidKHR += numeral(formatCurrencyLast(obj.interestUnpaid, obj.disbursementDoc.currencyId)).value();
                    totalPenaltyUnpaidKHR += numeral(formatCurrencyLast(penalty, obj.disbursementDoc.currencyId)).value();
                    totalKHR += numeral(formatCurrencyLast(obj.balanceUnpaid + penalty, obj.disbursementDoc.currencyId)).value();
                } else if (obj.disbursementDoc.currencyId === "THB") {

                    totalPrincipleUnpaidTHB += numeral(formatCurrencyLast(obj.principleUnpaid, obj.disbursementDoc.currencyId)).value();
                    totalInterestUnpaidTHB += numeral(formatCurrencyLast(obj.interestUnpaid, obj.disbursementDoc.currencyId)).value();
                    totalPenaltyUnpaidTHB += numeral(formatCurrencyLast(penalty, obj.disbursementDoc.currencyId)).value();
                    totalTHB += numeral(formatCurrencyLast(obj.balanceUnpaid + penalty, obj.disbursementDoc.currencyId)).value();
                }
            })
        }


        totalPrincipleUnpaid = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalPrincipleUnpaidUSD, params.exchangeId, exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalPrincipleUnpaidTHB, params.exchangeId, exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalPrincipleUnpaidKHR, params.exchangeId, exchange);
        totalInterestUnpaid = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalInterestUnpaidUSD, params.exchangeId, exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalInterestUnpaidTHB, params.exchangeId, exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalInterestUnpaidKHR, params.exchangeId, exchange);
        totalPenaltyUnpaid = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalPenaltyUnpaidUSD, params.exchangeId, exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalPenaltyUnpaidTHB, params.exchangeId, exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalPenaltyUnpaidKHR, params.exchangeId, exchange);
        total = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalUSD, params.exchangeId, exchange) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalTHB, params.exchangeId, exchange) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalKHR, params.exchangeId, exchange);


        loanCollectionSheetHTML += `
                <tr>
                    <td colspan="7">${translate['grandTotalUSD']}</td>
                    <td>${formatCurrency(totalPrincipleUnpaidUSD, "USD")}</td>
                    <td>${formatCurrency(totalInterestUnpaidUSD, "USD")}</td>
                    <td>${formatCurrency(totalPenaltyUnpaidUSD, "USD")}</td>
                    <td>${formatCurrency(totalUSD, "USD")}</td>
                  
                </tr> 
                <tr>
                    <td colspan="7">${translate['grandTotalKHR']}</td>
                    <td>${formatCurrency(totalPrincipleUnpaidKHR, "KHR")}</td>
                    <td>${formatCurrency(totalInterestUnpaidKHR, "KHR")}</td>
                    <td>${formatCurrency(totalPenaltyUnpaidKHR, "KHR")}</td>
                    <td>${formatCurrency(totalKHR, "KHR")}</td>
                  
                </tr> <tr>
                    <td colspan="7">${translate['grandTotalTHB']}</td>
                    <td>${formatCurrency(totalPrincipleUnpaidTHB, "THB")}</td>
                    <td>${formatCurrency(totalInterestUnpaidTHB, "THB")}</td>
                    <td>${formatCurrency(totalPenaltyUnpaidTHB, "THB")}</td>
                    <td>${formatCurrency(totalTHB, "THB")}</td>
                  
                </tr> 
                <tr>
                    <th colspan="7">${translate['grandTotal']}</th>
                    <th>${formatCurrency(totalPrincipleUnpaid, companyDoc.baseCurrency)}</th>
                    <th>${formatCurrency(totalInterestUnpaid, companyDoc.baseCurrency)}</th>
                    <th>${formatCurrency(totalPenaltyUnpaid, companyDoc.baseCurrency)}</th>
                    <th>${formatCurrency(total, companyDoc.baseCurrency)}</th>
                  
                </tr>
        `;
        data.loanCollectionSheetHTML = loanCollectionSheetHTML;
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
