import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Loan_Repayment} from '../../../imports/collection/loanRepayment';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"
import moment from "moment";
import {Pos_SaleOrder} from "../../../imports/collection/posSaleOrder";

Meteor.methods({
    loanRepaymentReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;
        }
        if (params.creditOfficerId) {
            parameter.coId = params.creditOfficerId;

        }

        let data = {};
        parameter.repaymentDate = {
            $lte: moment(params.date[1]).endOf("day").toDate(),
            $gte: moment(params.date[0]).startOf("day").toDate()
        };

        let companyDoc = WB_waterBillingSetup.findOne({});

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

        let totalAmountUSD = 0;
        let totalFeeUSD = 0;
        let totalInterestUSD = 0;


        let totalAmountTHB = 0;
        let totalFeeTHB = 0;
        let totalInterestTHB = 0;


        let totalAmountKHR = 0;
        let totalFeeKHR = 0;
        let totalInterestKHR = 0;

        if (repaymentList.length > 0) {
            let i = 1;
            repaymentList.forEach((obj) => {
                repaymentHTML += `
                    <tr>
                            <td style="text-align: center !important;">${i}</td>
                            <td style="text-align: left !important;">${obj.loanAcc}</td>
                            <td style="text-align: left !important;">${obj.clientDoc.name}</td>
                            <td style="text-align: left !important;">${obj.creditOfficerDoc.name}</td>
                            <td style="text-align: left !important;">${obj.productDoc.name}</td>
                            <td style="text-align: left !important;">${obj.currencyId}</td>
                            <td style="text-align: left !important;">${obj.productDoc.rateType}</td>
                            <td style="text-align: left !important;">${obj.repaymentDateName}</td>
                            <td style="text-align: left !important;">${moment(obj.maturityDate).format("DD/MM/YYYY")}</td>
                            <td style="text-align: left !important;">${obj.installment}</td>
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


        let grandTotalAmount = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalAmountUSD, params.exchangeId) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalAmountTHB, params.exchangeId) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalAmountKHR, params.exchangeId);
        let grandTotalFee = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalFeeUSD, params.exchangeId) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalFeeTHB, params.exchangeId) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalFeeKHR, params.exchangeId);
        let grandTotalInterest = Meteor.call("exchange", "USD", companyDoc.baseCurrency, totalInterestUSD, params.exchangeId) + Meteor.call("exchange", "THB", companyDoc.baseCurrency, totalInterestTHB, params.exchangeId) + Meteor.call("exchange", "KHR", companyDoc.baseCurrency, totalInterestKHR, params.exchangeId);


        repaymentHTML += `
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
                    <td>${formatCurrency(totalFeeTHB, companyDoc.baseCurrency)}</td>
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
