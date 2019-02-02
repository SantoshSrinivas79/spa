import {Pos_ConvertInventory} from '../../../imports/collection/posConvertInventory';
import {Pos_ConvertInventoryReact} from '../../../imports/collection/posConvertInventory';
import {Pos_Product} from '../../../imports/collection/posProduct';

import {SpaceChar} from "../../../both/config.js/space"
import {Pos_Customer} from "../../../imports/collection/posCustomer";
import {Pos_TransferInventory} from "../../../imports/collection/posTransferInventory";
import {Pos_CategoryReact} from "../../../imports/collection/posCategory";

Meteor.methods({
    queryPosConvertInventory({q, filter, rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countPosConvertInventory: 0,
            };
            let selector = {};
            selector.rolesArea = rolesArea;

            if (!!q) {
                let reg = new RegExp(q);
                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {

                    let productList = Pos_Product.find({
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
                    selector.$or = [{productId: {$in: productList}}, {description: {$regex: reg, $options: 'mi'}}];
                }
            }
            let posConvertInventorys = Pos_ConvertInventory.aggregate([

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
                        from: "pos_product",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productDoc"
                    }
                },
                {
                    $unwind: {path: "$productDoc", preserveNullAndEmptyArrays: true}
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
                        dateName: {$last: "$dateName"},
                        description: {$last: "$description"},
                        productDoc: {$last: "$productDoc"},
                        locationDoc: {$last: "$locationDoc"},
                        productConvertDoc: {$push: "$$ROOT"}
                    }
                },
                {
                    $project: {
                        _id: "$_id.id",
                        qty: 1,
                        dateName: 1,
                        description: 1,
                        productDoc: 1,
                        locationDoc: 1,
                        productConvertDoc: 1,
                    }
                }

            ]);
            if (posConvertInventorys.length > 0) {
                data.content = posConvertInventorys;
                let posConvertInventoryTotal = Pos_ConvertInventory.find(selector).count();
                data.countPosConvertInventory = posConvertInventoryTotal;
            }
            return data;
        }
    },
    queryPosConvertInventoryById(id) {
        let data = Pos_ConvertInventory.findOne({_id: id});

        return data;
    },
    insertPosConvertInventory(data) {
        let id = Pos_ConvertInventory.insert(data);

        if (id) {
            data.id = id;
            data.transactionType = "Convert Inventory";
            Meteor.call("addPosAverageInventory", data, (err, result) => {
                if (err) {
                    console.log(err.message);
                }
            })
            convertInventoryReact(id);
        }


        return id;
    },
    updatePosConvertInventory(data) {

        let dataBeforeUpdate = Pos_ConvertInventory.findOne({_id: data._id});
        let isUpdated = Pos_ConvertInventory.update({_id: data._id},
            {
                $set: data
            });

        if (isUpdated) {
            Meteor.defer(function () {
                dataBeforeUpdate.transactionType = "Remove Convert Inventory";
                dataBeforeUpdate.id = dataBeforeUpdate._id;
                Meteor.call("reducePosAverageInventory", dataBeforeUpdate, (err1, result1) => {
                    if (!err1) {
                        data.transactionType = "Convert Inventory";
                        data.id = dataBeforeUpdate._id;
                        Meteor.call("addPosAverageInventory", data, (err2, result2) => {
                            if (err2) {
                                console.log(err2.message);
                            }
                        })
                    } else {
                        console.log(err1.message);
                    }

                })
            });
            convertInventoryReact(dataBeforeUpdate._id);
        }
        return isUpdated;
    },
    removePosConvertInventory(id) {
        let data = Pos_ConvertInventory.findOne({_id: id});
        let isRemoved = Pos_ConvertInventory.remove({_id: id});
        if (isRemoved) {
            data.transactionType = "Remove Convert Inventory";
            data.id = id;

            Meteor.call("reducePosAverageInventory", data, (err, reuslt) => {
                if (err) {
                    console.log(err.message);
                }
            })
            convertInventoryReact(id);
        }
        return isRemoved;
    }
});


let convertInventoryReact = function (id) {
    let doc = Pos_ConvertInventoryReact.findOne();
    if (doc) {
        Pos_ConvertInventoryReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Pos_ConvertInventoryReact.insert({
            id: id
        });
    }
}