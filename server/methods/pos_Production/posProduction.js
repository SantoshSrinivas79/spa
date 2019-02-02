import {Pos_Production} from '../../../imports/collection/posProduction';
import {Pos_ProductionReact} from '../../../imports/collection/posProduction';
import {Pos_Product, Pos_ProductReact} from '../../../imports/collection/posProduct';

import {SpaceChar} from "../../../both/config.js/space"
import {Pos_Customer} from "../../../imports/collection/posCustomer";
import {Pos_TransferInventory} from "../../../imports/collection/posTransferInventory";
import {Sch_Class} from "../../../imports/collection/schClass";

Meteor.methods({
    queryPosProduction({q, filter,rolesArea, options = {limit: 10, skip: 0}}) {
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
            let posProductions = Pos_Production.aggregate([

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
                        productConvertDoc: 1,
                    }
                }

            ]);
            if (posProductions.length > 0) {
                data.content = posProductions;
                let posProductionTotal = Pos_Production.find(selector).count();
                data.countPosProduction = posProductionTotal;
            }
            return data;
        }
    },
    queryPosProductionById(id) {
        let data = Pos_Production.findOne({_id: id});

        return data;
    },
    insertPosProduction(data) {
        let id = Pos_Production.insert(data);

        if (id) {
            data.id = id;
            data.transactionType = "Production";
            Meteor.call("addPosAverageInventory", data, (err, result) => {
                if (err) {
                    console.log(err.message);
                }
            })

            productionReact(id);
        }


        return id;
    },
    updatePosProduction(data) {
        let dataBeforeUpdate = Pos_Production.findOne({_id: data._id});
        let isUpdated = Pos_Production.update({_id: data._id},
            {
                $set: data
            });

        if (isUpdated) {
            Meteor.defer(function () {
                dataBeforeUpdate.transactionType = "Remove Production";
                dataBeforeUpdate.id = dataBeforeUpdate._id;
                Meteor.call("reducePosAverageInventory", dataBeforeUpdate, (err1, result1) => {
                    if (!err1) {
                        data.transactionType = "Production";
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
            productionReact(dataBeforeUpdate._id);
        }
        return isUpdated;
    },
    removePosProduction(id) {
        let data = Pos_Production.findOne({_id: id});
        let isRemoved = Pos_Production.remove({_id: id});
        if (isRemoved) {
            data.transactionType = "Remove Production";
            data.id = id;

            Meteor.call("reducePosAverageInventory", data, (err, reuslt) => {
                if (err) {
                    console.log(err.message);
                }
            })


            productionReact(id);
        }
        return isRemoved;
    },
    updatePosProductionById(id) {
        let isUpdated = Pos_Production.update({_id: id}, {$set: {status: true}});
        if (isUpdated) {
            productionReact(id);
        }
        return isUpdated;
    },
    queryPosProductionBoard({q, filter,rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countPosProduction: 0,
            };
            let selector = {};
            selector.status = false;
            selector.rolesArea = rolesArea;

            if (!!q) {
                let reg = new RegExp(q);
                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {
                    selector.$or = [{name: {$regex: reg, $options: 'mi'}},
                        {
                            dateName: {
                                $regex: reg,
                                $options: 'mi'
                            }
                        }, {
                            "locationDoc.name": {
                                $regex: reg,
                                $options: 'mi'
                            }
                        }, {description: {$regex: reg, $options: 'mi'}}];
                }
            }
            let posProductions = Pos_Production.aggregate([

                {
                    $sort: {
                        createdAt: -1
                    }
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
                    $match: selector
                },
                {
                    $limit: options.limit
                },
                {
                    $skip: options.skip
                }
            ]);
            if (posProductions.length > 0) {
                data.content = posProductions;
                let posProductionTotal = Pos_Production.find(selector).count();
                data.countPosProduction = posProductionTotal;
            }
            return data;
        }
    }

});

let productionReact = function (id) {
    let doc = Pos_ProductionReact.findOne();
    if (doc) {
        Pos_ProductionReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Pos_ProductionReact.insert({
            id: id
        });
    }
}