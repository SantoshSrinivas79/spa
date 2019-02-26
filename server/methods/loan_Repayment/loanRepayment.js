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
import {Pos_Vendor} from "../../../imports/collection/posVendor";

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
                    let clientList = Pos_Customer.find({
                            name: {
                                $regex: reg,
                                $options: 'mi'
                            }
                        }, {_id: true},
                        {
                            $limit: options.limit
                        },
                        {
                            $skip: options.skip
                        }).fetch().map((obj) => {
                        return obj._id;
                    });
                    let disbursementList = Loan_Disbursement.find({
                            loanAcc: {
                                $regex: reg,
                                $options: 'mi'
                            }
                        }, {_id: true},
                        {
                            $limit: options.limit
                        },
                        {
                            $skip: options.skip
                        }).fetch().map((obj) => {
                        return obj._id;
                    });

                    selector.$or = [{name: {$regex: reg, $options: 'mi'}}, {
                        code: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }, {clientId: {$in: clientList}}, {disbursementId: {$in: disbursementList}}, {
                        description: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }];
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
                },
                {
                    $lookup: {
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
        data.voucher = data && data.voucher.length > 9 ? parseInt((data && data.voucher || "0000000000000").substr(9, 13)) : parseInt(data && data.voucher || "0");
        data.voucher = pad(data.voucher, 6);
        return data;
    },
    insertLoanRepayment(data) {
        data.repaymentDateName = moment(data.repaymentDate).format("DD/MM/YYYY");
        data.voucher = data.rolesArea + "-" + moment(data.repaymentDate).format("YYYY") + pad(data.voucher, 6);

        let isInserted = Loan_Repayment.insert(data);
        if (isInserted) {
            repaymentReact(isInserted);
            if (data.type === "Fee") {
                makeRepaymentFee(data);
            } else {
                makeRepayment(data.disbursementId, data, isInserted);
            }

            Loan_Disbursement.update({_id: data.disbursementId}, {$inc: {paymentNumber: 1}});

        }
        return isInserted;
    },
    removeLoanRepayment(id) {
        let loanDoc = Loan_Repayment.findOne({_id: id});
        let isRemoved = Loan_Repayment.remove({_id: id});
        if (isRemoved) {
            repaymentReact(id);
            if (loanDoc.type === "Fee") {
                removeRepaymentFee(loanDoc);
            } else {
                removeRepayment(loanDoc);
            }
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
    getPrepayToPaid(disbursementId, date) {
        let selector = {};
        selector.loanId = disbursementId;
        selector.date = {$gt: moment(date).endOf("day").toDate()};
        selector.isPaid = false;

        let haveRepayLessThanDoc = Loan_RepaymentSchedule.find({
            loanId: disbursementId,
            isPaid: false,
            date: {$lte: moment(date).endOf("day").toDate()}
        }).fetch();
        if (haveRepayLessThanDoc.length > 0) {
            return [];
        }

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
    getFeeNeedToPaid(disbursementId) {
        let selector = {};
        selector._id = disbursementId;
        selector.feeAmount = {$gt: 0};

        let repayFee = Loan_Disbursement.aggregate([
            {$match: selector},
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
            }, {
                $lookup: {
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
            }
        ]);
        if (repayFee && repayFee.length > 0) {
            return repayFee[0];
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


let makeRepayment = function (disbursementId, doc, repaymentId) {
    let repaymentScheduleList = Loan_RepaymentSchedule.find({loanId: disbursementId, isPaid: false}).fetch();
    let amountPaid = doc.paid;
    if (repaymentScheduleList.length > 0) {
        repaymentScheduleList.forEach((obj) => {
            if (amountPaid > 0) {
                let repaymentScheduleDoc = obj;
                let paid = obj.paid || [];
                let paidDoc = {};
                paidDoc.repaymentDate = moment(doc.repaymentDate).startOf("day").add(12, "hour").toDate();
                paidDoc.repaymentId = repaymentId;

                paidDoc.interestPaid = amountPaid >= obj.interestUnpaid ? obj.interestUnpaid : amountPaid;
                amountPaid = amountPaid - paidDoc.interestPaid;

                repaymentScheduleDoc.balanceUnpaid = repaymentScheduleDoc.balanceUnpaid - paidDoc.interestPaid;
                repaymentScheduleDoc.interestUnpaid = repaymentScheduleDoc.interestUnpaid - paidDoc.interestPaid;

                paidDoc.principlePaid = amountPaid >= obj.principleUnpaid ? obj.principleUnpaid : amountPaid;
                amountPaid = amountPaid - paidDoc.principlePaid;

                repaymentScheduleDoc.balanceUnpaid = repaymentScheduleDoc.balanceUnpaid - paidDoc.principlePaid;
                repaymentScheduleDoc.principleUnpaid = repaymentScheduleDoc.principleUnpaid - paidDoc.principlePaid;

                paid.push(paidDoc);
                repaymentScheduleDoc.isPaid = !(math.round(repaymentScheduleDoc.balanceUnpaid, 2) > 0);
                repaymentScheduleDoc.paid = paid;

                Loan_RepaymentSchedule.update({_id: obj._id}, {$set: repaymentScheduleDoc});
                Loan_Repayment.update({_id: repaymentId}, {
                    $inc: {
                        principlePaid: paidDoc.principlePaid,
                        interestPaid: paidDoc.interestPaid
                    }
                });
            } else {
                return false;
            }
        })
    }
}

let removeRepayment = function (repaymentDoc) {
    let repaymentScheduleList = Loan_RepaymentSchedule.find({
        "paid.repaymentId": repaymentDoc._id,
        loanId: repaymentDoc.disbursementId
    }).fetch();
    if (repaymentScheduleList.length > 0) {
        repaymentScheduleList.forEach((obj) => {
            let newRepaymentScheduleDoc = obj;
            let newPaid = [];
            if (obj.paid.length > 0) {
                obj.paid.forEach((ob) => {
                    if (ob.repaymentId === repaymentDoc._id) {
                        newRepaymentScheduleDoc.balanceUnpaid = newRepaymentScheduleDoc.balanceUnpaid + ob.principlePaid + ob.interestPaid;
                        newRepaymentScheduleDoc.principleUnpaid = newRepaymentScheduleDoc.principleUnpaid + ob.principlePaid;
                        newRepaymentScheduleDoc.interestUnpaid = newRepaymentScheduleDoc.interestUnpaid + ob.interestPaid;
                    } else {
                        newPaid.push(ob);
                    }
                })

                newRepaymentScheduleDoc.isPaid = !(math.round(newRepaymentScheduleDoc.balanceUnpaid, 2) > 0);

                newRepaymentScheduleDoc.paid = newPaid;
                Loan_RepaymentSchedule.update({_id: obj._id}, {$set: newRepaymentScheduleDoc});
            }
        })
    }
}


let makeRepaymentFee = function (repaymentFeeDoc) {
    return Loan_Disbursement.update({_id: repaymentFeeDoc.disbursementId}, {$inc: {paidFeeAmount: repaymentFeeDoc.paid}});
}
let removeRepaymentFee = function (repaymentFeeDoc) {
    return Loan_Disbursement.update({_id: repaymentFeeDoc.disbursementId}, {$inc: {paidFeeAmount: -repaymentFeeDoc.paid}});
}


function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}
