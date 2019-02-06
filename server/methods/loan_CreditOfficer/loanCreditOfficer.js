import {Loan_CreditOfficer} from '../../../imports/collection/loanCreditOfficer';
import {Loan_CreditOfficerReact} from '../../../imports/collection/loanCreditOfficer';


Meteor.methods({
    queryLoanCreditOfficer({q, filter, rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countLoanCreditOfficer: 0,
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
                    }, {phoneNumber: {$regex: reg, $options: 'mi'}}];
                }
            }
            let loanCreditOfficers = Loan_CreditOfficer.aggregate([

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
            if (loanCreditOfficers.length > 0) {
                data.content = loanCreditOfficers;
                let loanCreditOfficerTotal = Loan_CreditOfficer.find(selector).count();
                data.countLoanCreditOfficer = loanCreditOfficerTotal;
            }
            return data;
        }
    },
    queryLoanCreditOfficerById(id) {
        let data = Loan_CreditOfficer.findOne({_id: id});
        return data;
    },
    insertLoanCreditOfficer(data) {
        data.dobName = moment(data.dob).format("DD/MM/YYYY");
        data.startDateName = moment(data.startDate).format("DD/MM/YYYY");
        let isInserted = Loan_CreditOfficer.insert(data);

        if (isInserted) {
            creditOfficerReact(isInserted);
        }
        return isInserted;
    },
    updateLoanCreditOfficer(data) {
        let id = data._id;
        data.dobName = moment(data.dob).format("DD/MM/YYYY");
        data.startDateName = moment(data.startDate).format("DD/MM/YYYY");

        let isUpdated = Loan_CreditOfficer.update({_id: data._id},
            {
                $set: data
            });
        if (isUpdated) {
            creditOfficerReact(id);
        }
        return isUpdated;
    },
    removeLoanCreditOfficer(id) {
        let isRemoved = Loan_CreditOfficer.remove({_id: id});

        if (isRemoved) {
            creditOfficerReact(id);
        }
        return isRemoved;
    }
});


let creditOfficerReact = function (id) {
    let doc = Loan_CreditOfficerReact.findOne();
    if (doc) {
        Loan_CreditOfficerReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Loan_CreditOfficerReact.insert({
            id: id
        });
    }
}