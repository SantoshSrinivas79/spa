import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Loan_RepaymentSchedule} from '../../../imports/collection/loanRepaymentSchedule';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"
import moment from "moment";
import {Loan_Product} from "../../../imports/collection/loanProduct";
import {Pos_Customer} from "../../../imports/collection/posCustomer";
import {Loan_Disbursement} from "../../../imports/collection/loanDisbursement";
import {Loan_CreditOfficer} from "../../../imports/collection/loanCreditOfficer";

Meteor.methods({
    loanRepaymentScheduleReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;
        }

        let data = {};
        parameter.loanId = params.disbursementId;

        let companyDoc = WB_waterBillingSetup.findOne({});

        //Range Date
        let repaymentScheduleList = Loan_RepaymentSchedule.find(parameter).fetch();
        data.currencyHeader = companyDoc.baseCurrency;
        let repaymentHTML = "";
        let productId = "";
        let clientId = "";
        if (repaymentScheduleList.length > 0) {
            repaymentScheduleList.forEach((obj) => {
                if(obj.isAllowClosing===false){
                    repaymentHTML += `
                    <tr>
                            <td style="text-align: center !important;"><u>${obj.installment}</u></td>
                            <td style="text-align: left !important;">${switchDay(obj.date)}   ${obj.dateName}</td>
                            <td style="text-align: left !important;">${obj.dayRange}</td>
                            <td>${formatCurrency(obj.principle, obj.currencyId)}</td>
                            <td>${formatCurrency(obj.interest, obj.currencyId)}</td>
                            <td>${formatCurrency(obj.amount, obj.currencyId)}</td>
                    </tr>
            
            `;

                }else {

                    repaymentHTML += `
                    <tr>
                            <td style="text-align: center !important;">${obj.installment}</td>
                            <td style="text-align: left !important;">${switchDay(obj.date)}   ${obj.dateName}</td>
                            <td style="text-align: left !important;">${obj.dayRange}</td>
                            <td>${formatCurrency(obj.principle, obj.currencyId)}</td>
                            <td>${formatCurrency(obj.interest, obj.currencyId)}</td>
                            <td>${formatCurrency(obj.amount, obj.currencyId)}</td>
                    </tr>
            
            `;
                }

                productId = obj.productId;
                clientId = obj.clientId;
            })
        }

        let productDoc = Loan_Product.findOne({_id: productId});
        let clientDoc = Pos_Customer.findOne({_id: clientId});
        let disbursementDoc = Loan_Disbursement.findOne({_id: params.disbursementId});
        let creditOfficerDoc = Loan_CreditOfficer.findOne({_id: disbursementDoc.coId});

        data.repaymentScheduleHtml = repaymentHTML;
        data.productDoc = productDoc;
        data.clientDoc = clientDoc;
        data.disbursementDoc = disbursementDoc;
        data.creditOfficerDoc = creditOfficerDoc;
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
