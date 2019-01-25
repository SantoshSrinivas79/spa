import {Loan_Product} from '../../../imports/collection/loanProduct';
import {Loan_ProductReact} from '../../../imports/collection/loanProduct';


Meteor.methods({
    queryLoanProduct({q, filter, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countLoanProduct: 0,
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
            let loanProducts = Loan_Product.aggregate([

                {
                    $match: selector
                },

                {
                    $lookup: {
                        from: "loan_penalty",
                        localField: "penaltyId",
                        foreignField: "_id",
                        as: "penaltyDoc"
                    }
                },
                {
                    $unwind: {
                        path: "$penaltyDoc",
                        preserveNullAndEmptyArrays: true
                    }
                },{
                    $lookup: {
                        from: "loan_penaltyClosing",
                        localField: "penaltyClosingId",
                        foreignField: "_id",
                        as: "penaltyClosingDoc"
                    }
                },
                {
                    $unwind: {
                        path: "$penaltyClosingDoc",
                        preserveNullAndEmptyArrays: true
                    }
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
            if (loanProducts.length > 0) {
                data.content = loanProducts;
                let loanProductTotal = Loan_Product.find(selector).count();
                data.countLoanProduct = loanProductTotal;
            }
            return data;
        }
    },
    queryLoanProductById(id) {
        let data = Loan_Product.findOne({_id: id});
        return data;
    },
    insertLoanProduct(data) {
        data.productDateName = moment(data.productDate).format("DD/MM/YYYY");
        let isInserted = Loan_Product.insert(data);

        if (isInserted) {
            productReact(isInserted);
        }
        return isInserted;
    },
    updateLoanProduct(data) {
        let id = data._id;
        data.productDateName = moment(data.productDate).format("DD/MM/YYYY");


        let isUpdated = Loan_Product.update({_id: data._id},
            {
                $set: data
            });
        if (isUpdated) {
            productReact(id);
        }
        return isUpdated;
    },
    removeLoanProduct(id) {
        let isRemoved = Loan_Product.remove({_id: id});

        if (isRemoved) {
            productReact(id);
        }
        return isRemoved;
    }
});


let productReact = function (id) {
    let doc = Loan_ProductReact.findOne();
    if (doc) {
        Loan_ProductReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Loan_ProductReact.insert({
            id: id
        });
    }
}