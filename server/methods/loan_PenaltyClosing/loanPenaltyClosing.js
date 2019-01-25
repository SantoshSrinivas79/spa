import {Loan_PenaltyClosing} from '../../../imports/collection/loanPenaltyClosing';
import {Loan_PenaltyClosingReact} from '../../../imports/collection/loanPenaltyClosing';


Meteor.methods({
    queryLoanPenaltyClosing({q, filter, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countLoanPenaltyClosing: 0,
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
            let loanPenaltyClosings = Loan_PenaltyClosing.aggregate([

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
            if (loanPenaltyClosings.length > 0) {
                data.content = loanPenaltyClosings;
                let loanPenaltyClosingTotal = Loan_PenaltyClosing.find(selector).count();
                data.countLoanPenalty = loanPenaltyClosingTotal;
            }
            return data;
        }
    },
    queryLoanPenaltyClosingById(id) {
        let data = Loan_PenaltyClosing.findOne({_id: id});
        return data;
    },
    insertLoanPenaltyClosing(data) {
        data.dobName = moment(data.dob).format("DD/MM/YYYY");
        data.startDateName = moment(data.startDate).format("DD/MM/YYYY");
        let isInserted = Loan_PenaltyClosing.insert(data);

        if (isInserted) {
            creditOfficerReact(isInserted);
        }
        return isInserted;
    },
    updateLoanPenaltyClosing(data) {
        let id = data._id;
        data.dobName = moment(data.dob).format("DD/MM/YYYY");
        data.startDateName = moment(data.startDate).format("DD/MM/YYYY");

        let isUpdated = Loan_PenaltyClosing.update({_id: data._id},
            {
                $set: data
            });
        if (isUpdated) {
            creditOfficerReact(id);
        }
        return isUpdated;
    },
    removeLoanPenaltyClosing(id) {
        let isRemoved = Loan_PenaltyClosing.remove({_id: id});

        if (isRemoved) {
            creditOfficerReact(id);
        }
        return isRemoved;
    }
});


let creditOfficerReact = function (id) {
    let doc = Loan_PenaltyClosingReact.findOne();
    if (doc) {
        Loan_PenaltyClosingReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Loan_PenaltyClosingReact.insert({
            id: id
        });
    }
}