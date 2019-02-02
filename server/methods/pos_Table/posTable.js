import {Pos_Table} from '../../../imports/collection/posTable';
import {Images} from '../../../imports/collection/fileImages';
import {Pos_TableReact} from '../../../imports/collection/posTable';

import {SpaceChar} from "../../../both/config.js/space"
import {Pos_BillReact} from "../../../imports/collection/posBill";
import {Pos_Customer} from "../../../imports/collection/posCustomer";
import {Pos_TableLocation} from "../../../imports/collection/posTableLocation";

Meteor.methods({
    queryPosTable({q, filter,rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countPosTable: 0,
            };
            let selector = {};
            selector.rolesArea = rolesArea;

            if (!!q) {
                let reg = new RegExp(q);
                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {
                    let tableLocationList = Pos_TableLocation.find({
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

                    selector.$or = [{name: {$regex: reg, $options: 'mi'}}, {
                        code: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }, {
                        tableLocationId: q
                    }, {description: {$regex: reg, $options: 'mi'}}, {tableLocationId: {$in: tableLocationList}}];
                }
            }
            let posTables = Pos_Table.aggregate([

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
                        from: "pos_tableLocation",
                        localField: "tableLocationId",
                        foreignField: "_id",
                        as: "tableLocationDoc"
                    }
                },
                {
                    $unwind: {path: "$tableLocationDoc", preserveNullAndEmptyArrays: true}
                }
            ]);
            if (posTables.length > 0) {
                data.content = posTables;
                let posTableTotal = Pos_Table.find(selector).count();
                data.countPosTable = posTableTotal;
            }
            return data;
        }
    },
    queryPosTableById(id) {
        let data = Pos_Table.findOne({_id: id});
        return data;
    },
    insertPosTable(data) {
        let isInserted = Pos_Table.insert(data);
        if (isInserted) {
            categoryReact(isInserted);
        }
        return isInserted;
    },
    updatePosTable(data) {

        let id = data._id;
        let isUpdated = Pos_Table.update({_id: data._id},
            {
                $set: data
            });

        if (isUpdated) {
            categoryReact(id);
        }
        return isUpdated;
    },
    updatePosTableStatus(id, status) {

        let isUpdated = Pos_Table.update({_id: id},
            {
                $set: {status: status}
            });

        if (isUpdated) {
            categoryReact(id);
        }
        return isUpdated;
    },
    removePosTable(id) {
        let isRemoved = Pos_Table.remove({_id: id});
        if (isRemoved) {
            categoryReact(id);
        }
        return isRemoved;
    }
});

let categoryReact = function (id) {
    let doc = Pos_TableReact.findOne();
    if (doc) {
        Pos_TableReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Pos_TableReact.insert({
            id: id
        });
    }
}