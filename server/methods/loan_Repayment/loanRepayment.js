import {Loan_Repayment} from '../../../imports/collection/loanRepayment';
import {Loan_RepaymentReact} from '../../../imports/collection/loanRepayment';
import {Loan_Product} from "../../../imports/collection/loanProduct";
import {Loan_Config} from "../../../imports/collection/loanConfig";
import {roundCurrency} from "../../../imports/api/methods/roundCurrency";
import math from "mathjs";
import {Loan_PenaltyClosing} from "../../../imports/collection/loanPenaltyClosing";
import {Loan_RepaymentSchedule} from "../../../imports/collection/loanRepaymentSchedule";
import moment from "moment";
import {Pos_Customer} from "../../../imports/collection/posCustomer";

Meteor.methods({
    queryLoanRepayment({q, filter, rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countLoanRepayment: 0,
            };
            let selector = {};
            selector.rolesArea = rolesArea;

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
            let loanRepayments = Loan_Repayment.aggregate([

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
            if (loanRepayments.length > 0) {
                data.content = loanRepayments;
                let loanRepaymentTotal = Loan_Repayment.find(selector).count();
                data.countLoanRepayment = loanRepaymentTotal;
            }
            return data;
        }
    },
    queryLoanRepaymentById(id) {
        let data = Loan_Repayment.findOne({_id: id});
        return data;
    },
    insertLoanRepayment(data) {
        data.dobName = moment(data.dob).format("DD/MM/YYYY");
        data.startDateName = moment(data.startDate).format("DD/MM/YYYY");

        let productDoc = Loan_Product.findOne({_id: data.productId});
        let configDoc = Loan_Config.findOne({});
        let projectInterest = calculateProjectInterest(data, productDoc, configDoc);

        data.loanAcc = generateRepaymentId(data);

        data.projectInterest = projectInterest;

        if (productDoc.rateType === "Monthly") {
            data.maturityDate = moment(data.startPaidDate).startOf("day").add(12, "hours").add(data.installment - 1, "month").toDate();
        }

        let isInserted = Loan_Repayment.insert(data);
        if (isInserted) {
            repaymentReact(isInserted);
            generateSchedulePayment(data, productDoc, configDoc, isInserted);
            Pos_Customer.update({_id: data.clientId}, {$inc: {loanCycle: 1}});

        }
        return isInserted;
    },
    updateLoanRepayment(data) {
        let id = data._id;
        data.dobName = moment(data.dob).format("DD/MM/YYYY");
        data.startDateName = moment(data.startDate).format("DD/MM/YYYY");

        let productDoc = Loan_Product.findOne({_id: data.productId});
        let configDoc = Loan_Config.findOne({});
        let projectInterest = calculateProjectInterest(data, productDoc, configDoc);
        data.projectInterest = projectInterest;

        if (productDoc.rateType === "Monthly") {
            data.maturityDate = moment(data.startPaidDate).startOf("day").add(12, "hours").add(data.installment - 1, "month").toDate();
        }

        let isUpdated = Loan_Repayment.update({_id: data._id},
            {
                $set: data
            });
        if (isUpdated) {
            repaymentReact(id);
            removeRepaymentSchedule(data._id);
            generateSchedulePayment(data, productDoc, configDoc, id);
        }
        return isUpdated;
    },
    removeLoanRepayment(id) {
        let loanDoc = Loan_Repayment.findOne({_id: id});
        let isRemoved = Loan_Repayment.remove({_id: id});

        if (isRemoved) {
            repaymentReact(id);
            removeRepaymentSchedule(id);
            Pos_Customer.update({_id: loanDoc.clientId}, {$inc: {loanCycle: -1}});

        }
        return isRemoved;
    }
});


let repaymentReact = function (id) {
    let doc = Loan_RepaymentReact.findOne();
    if (doc) {
        Loan_RepaymentReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Loan_RepaymentReact.insert({
            id: id
        });
    }
}

let generateSchedulePayment = function (repaymentDoc, productDoc, configDoc, id) {
    if (configDoc.methodType === "Straight Line") {
        let amount = (repaymentDoc.loanAmount + repaymentDoc.projectInterest) / repaymentDoc.installment;
        let principle = repaymentDoc.loanAmount / repaymentDoc.installment;
        let penaltyClosingDoc = Loan_PenaltyClosing.findOne({_id: productDoc.penaltyClosingId});
        let installmentAllowClosing = math.round(repaymentDoc.installment * (penaltyClosingDoc.installmentTermLessThan / 100), 0);
        let paidDate = repaymentDoc.startPaidDate;
        let numDay = moment(repaymentDoc.startPaidDate).diff(repaymentDoc.repaymentDate, 'days');

        for (let i = 1; i <= repaymentDoc.installment; i++) {
            let repaymentScheduleDoc = {};

            if (i === 1) {
                repaymentScheduleDoc.installment = i;
                repaymentScheduleDoc.date = moment(paidDate).startOf("day").add(12, "hours").toDate();
                repaymentScheduleDoc.dateName = moment(paidDate).startOf("day").add(12, "hours").format("DD/MM/YYYY");
                repaymentScheduleDoc.amount = (repaymentDoc.loanAmount + repaymentDoc.projectInterest) - (math.round(amount, 0) * (repaymentDoc.installment - 1));
                repaymentScheduleDoc.principle = repaymentDoc.loanAmount - (roundCurrency(principle, repaymentDoc.currencyId, repaymentDoc.rolesArea) * (repaymentDoc.installment - 1));
                repaymentScheduleDoc.interest = roundCurrency(repaymentScheduleDoc.amount - repaymentScheduleDoc.principle, repaymentDoc.currencyId, repaymentDoc.rolesArea);
                repaymentScheduleDoc.isPaid = false;
                repaymentScheduleDoc.isAllowClosing = i > installmentAllowClosing;

                repaymentScheduleDoc.loanId = id;
                repaymentScheduleDoc.clientId = repaymentDoc.clientId;
                repaymentScheduleDoc.productId = repaymentDoc.productId;
                repaymentScheduleDoc.currencyId = repaymentDoc.currencyId;
                repaymentScheduleDoc.rolesArea = repaymentDoc.rolesArea;
                repaymentScheduleDoc.balanceUnpaid = repaymentScheduleDoc.amount;
                repaymentScheduleDoc.dayRange = numDay;


            } else {
                repaymentScheduleDoc.installment = i;
                repaymentScheduleDoc.date = moment(paidDate).startOf("day").add(12, "hours").toDate();
                repaymentScheduleDoc.dateName = moment(paidDate).startOf("day").add(12, "hours").format("DD/MM/YYYY");
                repaymentScheduleDoc.amount = math.round(amount, 0);
                repaymentScheduleDoc.principle = roundCurrency(principle, repaymentDoc.currencyId, repaymentDoc.rolesArea);
                repaymentScheduleDoc.interest = repaymentScheduleDoc.amount - repaymentScheduleDoc.principle;
                repaymentScheduleDoc.isPaid = false;
                repaymentScheduleDoc.isAllowClosing = i > installmentAllowClosing;


                repaymentScheduleDoc.loanId = id;
                repaymentScheduleDoc.clientId = repaymentDoc.clientId;
                repaymentScheduleDoc.productId = repaymentDoc.productId;
                repaymentScheduleDoc.currencyId = repaymentDoc.currencyId;
                repaymentScheduleDoc.rolesArea = repaymentDoc.rolesArea;

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
let calculateProjectInterest = function (repaymentDoc, productDoc, configDoc) {
    let projectInterest = 0;

    if (configDoc.methodType === "Straight Line") {
        projectInterest = repaymentDoc.loanAmount * (productDoc.rate / 100) * repaymentDoc.installment;
    }


    return projectInterest;
}

let removeRepaymentSchedule = function (loanId) {
    return Loan_RepaymentSchedule.remove({loanId: loanId});
}

let generateRepaymentId = function (data) {
    let disDoc = Loan_Repayment.findOne({repaymentDate: {$gte: moment(data.repaymentDate).startOf("year").toDate()}}, {sort: {createdAt: -1}});
    let newId;
    if (disDoc) {
        let oldId = parseInt(disDoc.loanAcc.substr(4, 8)) + 1;
        newId = data.rolesArea + oldId;
    } else {
        newId = data.rolesArea + moment(data.repaymentDate).format("YYYY") + "0001";

    }
    return newId + "";
}