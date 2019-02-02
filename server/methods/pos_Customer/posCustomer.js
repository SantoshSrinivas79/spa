import {Pos_Customer} from '../../../imports/collection/posCustomer';
import {Pos_CustomerReact} from '../../../imports/collection/posCustomer';

import {SpaceChar} from "../../../both/config.js/space"
import {Pos_ConvertInventoryReact} from "../../../imports/collection/posConvertInventory";

Meteor.methods({
    queryPosCustomer({q, filter, rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countPosCustomer: 0,
            };
            let selector = {};
            selector.$or = [{rolesArea: rolesArea}, {_id: "001"}];


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
            let posCustomers = Pos_Customer.aggregate([

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
                        from: "pos_term",
                        localField: "termId",
                        foreignField: "_id",
                        as: "termDoc"
                    }
                },
                {
                    $unwind: {path: "$termDoc", preserveNullAndEmptyArrays: true}
                }
            ]);
            if (posCustomers.length > 0) {
                data.content = posCustomers;
                let posCustomerTotal = Pos_Customer.find(selector).count();
                data.countPosCustomer = posCustomerTotal;
            }
            return data;
        }
    },
    queryPosCustomerById(id) {
        let data = Pos_Customer.findOne({_id: id});
        return data;
    },
    insertPosCustomer(data) {
        let isInserted = Pos_Customer.insert(data);

        if (isInserted) {
            customerReact(isInserted);
        }
        return isInserted;
    },
    updatePosCustomer(data) {
        let id = data._id;
        let isUpdated = Pos_Customer.update({_id: data._id},
            {
                $set: data
            });
        if (isUpdated) {
            customerReact(id);
        }
        return isUpdated;
    },
    removePosCustomer(id) {
        let isRemoved = Pos_Customer.remove({_id: id});

        if (isRemoved) {
            customerReact(id);
        }
        return isRemoved;
    }
});


let customerReact = function (id) {
    let doc = Pos_CustomerReact.findOne();
    if (doc) {
        Pos_CustomerReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Pos_CustomerReact.insert({
            id: id
        });
    }
}