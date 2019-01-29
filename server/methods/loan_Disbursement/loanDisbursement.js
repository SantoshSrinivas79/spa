import {Loan_Disbursement} from '../../../imports/collection/loanDisbursement';
import {Loan_DisbursementReact} from '../../../imports/collection/loanDisbursement';
import {Loan_Product} from "../../../imports/collection/loanProduct";


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


        let isInserted = Loan_Disbursement.insert(data);
        if (isInserted) {
            disbursementReact(isInserted);
        }
        return isInserted;
    },
    updateLoanDisbursement(data) {
        let id = data._id;
        data.dobName = moment(data.dob).format("DD/MM/YYYY");
        data.startDateName = moment(data.startDate).format("DD/MM/YYYY");

        let isUpdated = Loan_Disbursement.update({_id: data._id},
            {
                $set: data
            });
        if (isUpdated) {
            disbursementReact(id);
        }
        return isUpdated;
    },
    removeLoanDisbursement(id) {
        let isRemoved = Loan_Disbursement.remove({_id: id});

        if (isRemoved) {
            disbursementReact(id);
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

let generateSchedulePayment = function (disbursementDoc) {

}