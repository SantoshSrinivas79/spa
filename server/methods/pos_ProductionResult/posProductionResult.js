import {Pos_ProductionResult} from '../../../imports/collection/posProductionResult';
import {Pos_ProductionResultReact} from '../../../imports/collection/posProductionResult';
import {Pos_Product} from '../../../imports/collection/posProduct';
import {SpaceChar} from "../../../both/config.js/space"
import {Pos_ProductionReact} from "../../../imports/collection/posProduction";

Meteor.methods({
    queryPosProductionResult({q, filter,rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countPosProduction: 0,
            };
            let selector = {};
            selector.rolesArea = rolesArea;

            if (!!q) {
                let reg = new RegExp(q);
                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {

                    selector.$or = [{name: {$regex: reg, $options: 'mi'}}, {
                        description: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }];
                }
            }
            let posProductions = Pos_ProductionResult.aggregate([

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
                        from: "pos_location",
                        localField: "locationId",
                        foreignField: "_id",
                        as: "locationDoc"
                    }
                },
                {
                    $unwind: {path: "$locationDoc", preserveNullAndEmptyArrays: true}
                },
                {
                    $lookup: {
                        from: "pos_production",
                        localField: "productionId",
                        foreignField: "_id",
                        as: "productionDoc"
                    }
                },
                {
                    $unwind: {path: "$productionDoc", preserveNullAndEmptyArrays: true}
                },
                {
                    $unwind: {path: "$convert", preserveNullAndEmptyArrays: true}
                }, {
                    $lookup: {
                        from: "pos_product",
                        localField: "convert.productId",
                        foreignField: "_id",
                        as: "productConvertDoc"
                    }
                }, {
                    $unwind: {path: "$productConvertDoc", preserveNullAndEmptyArrays: true}
                },
                {
                    $group: {
                        _id: {
                            id: "$_id"
                        },
                        qty: {$last: "$qty"},
                        name: {$last: "$name"},
                        status: {$last: "$status"},
                        dateName: {$last: "$dateName"},
                        description: {$last: "$description"},
                        locationDoc: {$last: "$locationDoc"},
                        productionDoc: {$last: "$productionDoc"},
                        productConvertDoc: {$push: "$$ROOT"}
                    }
                },
                {
                    $project: {
                        _id: "$_id.id",
                        qty: 1,
                        name: 1,
                        dateName: 1,
                        status: 1,
                        description: 1,
                        locationDoc: 1,
                        productionDoc: 1,
                        productConvertDoc: 1,
                    }
                }

            ]);
            if (posProductions.length > 0) {
                data.content = posProductions;
                let posProductionResultTotal = Pos_ProductionResult.find(selector).count();
                data.countPosProductionResult = posProductionResultTotal;
            }
            return data;
        }
    },

    removePosProductionResult(id) {
        let data = Pos_ProductionResult.findOne({_id: id});
        let isRemoved = Pos_ProductionResult.remove({_id: id});
        if (isRemoved) {
            data.transactionType = "Remove Production Result";
            data.id = id;

            Meteor.call("reducePosAverageInventory", data, (err, reuslt) => {
                if (err) {
                    console.log(err.message);
                }
            })
            productionResultReact(id);
        }
        return isRemoved;
    },

    insertPosProductionResult(data) {
        let id = Pos_ProductionResult.insert(data);
        if (id) {
            data.id = id;
            data.transactionType = "Production Result";
            Meteor.call("addPosAverageInventory", data, (err, result) => {
                if (err) {
                    console.log(err.message);
                }
            })
            Meteor.call("updatePosProductionById", data.productionId);

            productionResultReact(id);
        }


        return id;
    }

});

let productionResultReact = function (id) {
    let doc = Pos_ProductionResultReact.findOne();
    if (doc) {
        Pos_ProductionResultReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Pos_ProductionResultReact.insert({
            id: id
        });
    }
}