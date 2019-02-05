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
import {Pos_Invoice} from "../../../imports/collection/posInvoice";
import {Loan_Disbursement} from "../../../imports/collection/loanDisbursement";

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
        data.repaymentDateName = moment(data.repaymentDate).format("DD/MM/YYYY");
        let isInserted = Loan_Repayment.insert(data);
        if (isInserted) {
            repaymentReact(isInserted);
            Loan_Disbursement.update({_id: data.disbursementId}, {$inc: {paymentNumber: 1}});

        }
        return isInserted;
    },
    removeLoanRepayment(id) {
        let loanDoc = Loan_Repayment.findOne({_id: id});
        let isRemoved = Loan_Repayment.remove({_id: id});
        if (isRemoved) {
            repaymentReact(id);
            Loan_Disbursement.update({_id: loanDoc.disbursementId}, {$inc: {paymentNumber: -1}});

        }
        return isRemoved;
    },
    getAmountNeedToPaid(disbursementId, date) {
        let selector = {};
        selector.loanId = disbursementId;
        selector.date = {$lte: moment(date).endOf("day").toDate()};
        selector.isPaid = false;

        let repay = Loan_RepaymentSchedule.aggregate([
            {$match: selector},
            {$sort: {installment: 1}},
            {
                $group: {
                    _id: {
                        loanId: "$loanId"
                    },
                    isAllowClosing: {$first: "$isAllowClosing"},
                    balanceUnpaid: {$sum: "$balanceUnpaid"},
                    principleUnpaid: {$sum: "$principleUnpaid"},
                    interestUnpaid: {$sum: "$interestUnpaid"},
                    clientId: {$first: "$clientId"},
                    productId: {$first: "$productId"},
                    currencyId: {$first: "$currencyId"},
                    date: {$first: "$date"},
                    installmentList: {$push: "$installment"}
                }
            }, {
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
            }, {
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
            }, {
                $lookup: {
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
        ]);

        if (repay && repay.length > 0) {
            return repay[0];
        } else {
            return {};
        }
    },
    loan_getVoucherNoByRoleAndDate(rolesAreas, date) {
        let startDate = moment(date).startOf("year").toDate();
        let endDate = moment(date).endOf("year").toDate();
        let data = Loan_Repayment.findOne({
            rolesArea: rolesAreas,
            repaymentDate: {$gte: startDate, $lte: endDate}
        }, {sort: {voucher: -1}});

        let voucher = data && data.voucher.length > 9 ? parseInt((data && data.voucher || "0000000000000").substr(9, 13)) + 1 : parseInt(data && data.voucher || "0") + 1;
        return voucher + "";
    },

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
