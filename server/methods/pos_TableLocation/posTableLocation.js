import {Pos_TableLocation} from '../../../imports/collection/posTableLocation';
import {Pos_TableLocationReact} from '../../../imports/collection/posTableLocation';

import {SpaceChar} from "../../../both/config.js/space"
import {Pos_BillReact} from "../../../imports/collection/posBill";

Meteor.methods({
    queryPosTableLocation({q, filter,rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countPosTableLocation: 0,
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
            let posTableLocations = Pos_TableLocation.aggregate([

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
                }
            ]);
            if (posTableLocations.length > 0) {
                data.content = posTableLocations;
                let posTableLocationTotal = Pos_TableLocation.find(selector).count();
                data.countPosTableLocation = posTableLocationTotal;
            }
            return data;
        }
    },
    queryPosTableLocationById(id) {
        let data = Pos_TableLocation.findOne({_id: id});
        return data;
    },
    insertPosTableLocation(data) {
        let isInserted = Pos_TableLocation.insert(data);
        if (isInserted) {
            categoryReact(isInserted);
        }
        return isInserted;
    },
    updatePosTableLocation(data) {
        let id=data._id;
        let isUpdated = Pos_TableLocation.update({_id: data._id},
            {
                $set: data
            });

        if (isUpdated) {
            categoryReact(id);
        }
        return isUpdated;
    },
    removePosTableLocation(id) {
        let isRemoved = Pos_TableLocation.remove({_id: id});
        if (isRemoved) {
            categoryReact(id);
        }
        return isRemoved;
    }
});

let categoryReact = function (id) {
    let doc = Pos_TableLocationReact.findOne();
    if (doc) {
        Pos_TableLocationReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Pos_TableLocationReact.insert({
            id: id
        });
    }
}