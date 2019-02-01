import {Loan_Disbursement} from '../../../imports/collection/loanDisbursement';
import {Loan_DisbursementReact} from '../../../imports/collection/loanDisbursement';
import {Loan_Product} from "../../../imports/collection/loanProduct";
import {Loan_Config} from "../../../imports/collection/loanConfig";
import {roundCurrency} from "../../../imports/api/methods/roundCurrency";
import math from "mathjs";
import {Loan_PenaltyClosing} from "../../../imports/collection/loanPenaltyClosing";
import {Loan_RepaymentSchedule} from "../../../imports/collection/loanRepaymentSchedule";
import moment from "moment";
import {Pos_Customer} from "../../../imports/collection/posCustomer";

Meteor.methods({
    queryLoanDisbursement({q, filter, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countLoanDisbursement: 0,
            };
            let selector = {};
            if (!!q) {
                let reg = new RegExp(q);
                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {
                    selector.$or = [{name: {$regex: reg, $options: 'mi'}}, {
                        code: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }, {description: {$regex: reg, $options: 'mi'}}];
                }
            }
            let loanDisbursements = Loan_Disbursement.aggregate([

                {
                    $match: selector
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $limit: options.limit
                },
                {
                    $skip: options.skip
                },
                {
                    $lookup: {
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
                },
                {
                    $lookup: {
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
                }


            ]);
            if (loanDisbursements.length > 0) {
                data.content = loanDisbursements;
                let loanDisbursementTotal = Loan_Disbursement.find(selector).count();
                data.countLoanDisbursement = loanDisbursementTotal;
            }
            return data;
        }
    },
    queryLoanDisbursementById(id) {
        let data = Loan_Disbursement.findOne({_id: id});
        return data;
    },
    insertLoanDisbursement(data) {
        data.dobName = moment(data.dob).format("DD/MM/YYYY");
        data.startDateName = moment(data.startDate).format("DD/MM/YYYY");

        let productDoc = Loan_Product.findOne({_id: data.productId});
        let configDoc = Loan_Config.findOne({});
        let projectInterest = calculateProjectInterest(data, productDoc, configDoc);

        data.loanAcc = generateDisbursementId(data);

        data.projectInterest = projectInterest;

        if (productDoc.rateType === "Monthly") {
            data.maturityDate = moment(data.startPaidDate).startOf("day").add(12, "hours").add(data.installment-1, "month").toDate();
        }

        let isInserted = Loan_Disbursement.insert(data);
        if (isInserted) {
            disbursementReact(isInserted);
            generateSchedulePayment(data, productDoc, configDoc, isInserted);
            Pos_Customer.update({_id: data.clientId}, {$inc: {loanCycle: 1}});

        }
        return isInserted;
    },
    updateLoanDisbursement(data) {
        let id = data._id;
        data.dobName = moment(data.dob).format("DD/MM/YYYY");
        data.startDateName = moment(data.startDate).format("DD/MM/YYYY");

        let productDoc = Loan_Product.findOne({_id: data.productId});
        let configDoc = Loan_Config.findOne({});
        let projectInterest = calculateProjectInterest(data, productDoc, configDoc);
        data.projectInterest = projectInterest;

        if (productDoc.rateType === "Monthly") {
            data.maturityDate = moment(data.startPaidDate).startOf("day").add(12, "hours").add(data.installment-1, "month").toDate();
        }

        let isUpdated = Loan_Disbursement.update({_id: data._id},
            {
                $set: data
            });
        if (isUpdated) {
            disbursementReact(id);
            removeRepaymentSchedule(data._id);
            generateSchedulePayment(data, productDoc, configDoc, id);
        }
        return isUpdated;
    },
    removeLoanDisbursement(id) {
        let loanDoc = Loan_Disbursement.findOne({_id: id});
        let isRemoved = Loan_Disbursement.remove({_id: id});

        if (isRemoved) {
            disbursementReact(id);
            removeRepaymentSchedule(id);
            Pos_Customer.update({_id: loanDoc.clientId}, {$inc: {loanCycle: -1}});

        }
        return isRemoved;
    }
});


let disbursementReact = function (id) {
    let doc = Loan_DisbursementReact.findOne();
    if (doc) {
        Loan_DisbursementReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Loan_DisbursementReact.insert({
            id: id
        });
    }
}

let generateSchedulePayment = function (disbursementDoc, productDoc, configDoc, id) {
    if (configDoc.methodType === "Straight Line") {
        let amount = (disbursementDoc.loanAmount + disbursementDoc.projectInterest) / disbursementDoc.installment;
        let principle = disbursementDoc.loanAmount / disbursementDoc.installment;
        let penaltyClosingDoc = Loan_PenaltyClosing.findOne({_id: productDoc.penaltyClosingId});
        let installmentAllowClosing = math.round(disbursementDoc.installment * (penaltyClosingDoc.installmentTermLessThan / 100), 0);
        let paidDate = disbursementDoc.startPaidDate;
        let numDay = moment(disbursementDoc.startPaidDate).diff(disbursementDoc.disbursementDate, 'days');

        for (let i = 1; i <= disbursementDoc.installment; i++) {
            let repaymentScheduleDoc = {};

            if (i === 1) {
                repaymentScheduleDoc.installment = i;
                repaymentScheduleDoc.date = moment(paidDate).startOf("day").add(12, "hours").toDate();
                repaymentScheduleDoc.dateName = moment(paidDate).startOf("day").add(12, "hours").format("DD/MM/YYYY");
                repaymentScheduleDoc.amount = (disbursementDoc.loanAmount + disbursementDoc.projectInterest) - (math.round(amount, 0) * (disbursementDoc.installment - 1));
                repaymentScheduleDoc.principle = disbursementDoc.loanAmount - (roundCurrency(principle, disbursementDoc.currencyId, disbursementDoc.rolesArea) * (disbursementDoc.installment - 1));
                repaymentScheduleDoc.interest = roundCurrency(repaymentScheduleDoc.amount - repaymentScheduleDoc.principle, disbursementDoc.currencyId, disbursementDoc.rolesArea);
                repaymentScheduleDoc.isPaid = false;
                repaymentScheduleDoc.isAllowClosing = i > installmentAllowClosing;

                repaymentScheduleDoc.loanId = id;
                repaymentScheduleDoc.clientId = disbursementDoc.clientId;
                repaymentScheduleDoc.productId = disbursementDoc.productId;
                repaymentScheduleDoc.currencyId = disbursementDoc.currencyId;
                repaymentScheduleDoc.rolesArea = disbursementDoc.rolesArea;
                repaymentScheduleDoc.balanceUnpaid = repaymentScheduleDoc.amount;
                repaymentScheduleDoc.dayRange = numDay;


            } else {
                repaymentScheduleDoc.installment = i;
                repaymentScheduleDoc.date = moment(paidDate).startOf("day").add(12, "hours").toDate();
                repaymentScheduleDoc.dateName = moment(paidDate).startOf("day").add(12, "hours").format("DD/MM/YYYY");
                repaymentScheduleDoc.amount = math.round(amount, 0);
                repaymentScheduleDoc.principle = roundCurrency(principle, disbursementDoc.currencyId, disbursementDoc.rolesArea);
                repaymentScheduleDoc.interest = repaymentScheduleDoc.amount - repaymentScheduleDoc.principle;
                repaymentScheduleDoc.isPaid = false;
                repaymentScheduleDoc.isAllowClosing = i > installmentAllowClosing;


                repaymentScheduleDoc.loanId = id;
                repaymentScheduleDoc.clientId = disbursementDoc.clientId;
                repaymentScheduleDoc.productId = disbursementDoc.productId;
                repaymentScheduleDoc.currencyId = disbursementDoc.currencyId;
                repaymentScheduleDoc.rolesArea = disbursementDoc.rolesArea;

                repaymentScheduleDoc.balanceUnpaid = repaymentScheduleDoc.amount;
                repaymentScheduleDoc.dayRange = numDay;


            }
            if (productDoc.rateType === "Monthly") {
                numDay = moment(moment(paidDate).add(1, "month").toDate()).diff(paidDate, 'days');
                paidDate = moment(paidDate).add(1, "month").toDate();
            }

            Loan_RepaymentSchedule.insert(repaymentScheduleDoc);
        }

    }


}
let calculateProjectInterest = function (disbursementDoc, productDoc, configDoc) {
    let projectInterest = 0;

    if (configDoc.methodType === "Straight Line") {
        projectInterest = disbursementDoc.loanAmount * (productDoc.rate / 100) * disbursementDoc.installment;
    }


    return projectInterest;
}

let removeRepaymentSchedule = function (loanId) {
    return Loan_RepaymentSchedule.remove({loanId: loanId});
}

let generateDisbursementId = function (data) {
    let disDoc = Loan_Disbursement.findOne({disbursementDate: {$gte: moment(data.disbursementDate).startOf("year").toDate()}}, {sort: {createdAt: -1}});
    let newId;
    if (disDoc) {
        let oldId = parseInt(disDoc.loanAcc.substr(4, 8)) + 1;
        newId = data.rolesArea + oldId;
    } else {
        newId = data.rolesArea + moment(data.disbursementDate).format("YYYY") + "0001";

    }
    return newId + "";
}