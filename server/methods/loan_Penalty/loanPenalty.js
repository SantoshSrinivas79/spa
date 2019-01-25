import {Loan_Penalty} from '../../../imports/collection/loanPenalty';
import {Loan_PenaltyReact} from '../../../imports/collection/loanPenalty';


Meteor.methods({
    queryLoanPenalty({q, filter, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countLoanPenalty: 0,
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
            let loanPenaltys = Loan_Penalty.aggregate([

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
            if (loanPenaltys.length > 0) {
                data.content = loanPenaltys;
                let loanPenaltyTotal = Loan_Penalty.find(selector).count();
                data.countLoanPenalty = loanPenaltyTotal;
            }
            return data;
        }
    },
    queryLoanPenaltyById(id) {
        let data = Loan_Penalty.findOne({_id: id});
        return data;
    },
    insertLoanPenalty(data) {
        data.dobName = moment(data.dob).format("DD/MM/YYYY");
        data.startDateName = moment(data.startDate).format("DD/MM/YYYY");
        let isInserted = Loan_Penalty.insert(data);

        if (isInserted) {
            creditOfficerReact(isInserted);
        }
        return isInserted;
    },
    updateLoanPenalty(data) {
        let id = data._id;
        data.dobName = moment(data.dob).format("DD/MM/YYYY");
        data.startDateName = moment(data.startDate).format("DD/MM/YYYY");

        let isUpdated = Loan_Penalty.update({_id: data._id},
            {
                $set: data
            });
        if (isUpdated) {
            creditOfficerReact(id);
        }
        return isUpdated;
    },
    removeLoanPenalty(id) {
        let isRemoved = Loan_Penalty.remove({_id: id});

        if (isRemoved) {
            creditOfficerReact(id);
        }
        return isRemoved;
    }
});


let creditOfficerReact = function (id) {
    let doc = Loan_PenaltyReact.findOne();
    if (doc) {
        Loan_PenaltyReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Loan_PenaltyReact.insert({
            id: id
        });
    }
}