import {Loan_Config} from '../../../imports/collection/loanConfig';
import {Loan_ConfigReact} from '../../../imports/collection/loanConfig';
import moment from "moment";


Meteor.methods({
    queryLoanConfig({q, filter, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countLoanConfig: 0,
            };
            let selector = {};
            if (!!q) {
                let reg = new RegExp(q);
                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {
                    selector.$or = [{methodType: {$regex: reg, $options: 'mi'}}, {
                        description: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }];
                }
            }
            let loanConfigs = Loan_Config.aggregate([

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
                    $project: {
                        _id: 1,
                        methodType: 1,
                        description: 1,

                    }
                }
            ]);
            if (loanConfigs.length > 0) {
                data.content = loanConfigs;
                let loanConfigTotal = Loan_Config.find(selector).count();
                data.countLoanConfig = loanConfigTotal;
            }
            return data;
        }
    },
    queryLoanConfigById(id) {
        let data = Loan_Config.findOne({_id: id});
        return data;
    },
    insertLoanConfig(data) {

        let isInserted = Loan_Config.insert(data);
        if (isInserted) {
            configReact(isInserted);
        }
        return isInserted;
    },
    updateLoanConfig(data) {
        let id = data._id;
        let isUpdated = Loan_Config.update({_id: data._id},
            {
                $set: data
            });

        if (isUpdated) {
            configReact(id);
        }
        return isUpdated;
    },
    removeLoanConfig(id) {
        let isRemoved = Loan_Config.remove({_id: id});
        configReact(id);
        return isRemoved;
    }
});

let configReact = function (id) {
    let doc = Loan_ConfigReact.findOne();
    if (doc) {
        Loan_ConfigReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Loan_ConfigReact.insert({
            id: id
        });
    }
}