import {Pos_Vendor} from '../../../imports/collection/posVendor';
import {Pos_VendorReact} from '../../../imports/collection/posVendor';

import {SpaceChar} from "../../../both/config.js/space"
import {Pos_UnitReact} from "../../../imports/collection/posUnit";

Meteor.methods({
    queryPosVendor({q, filter,rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countPosVendor: 0,
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
            let posVendors = Pos_Vendor.aggregate([
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
            if (posVendors.length > 0) {
                data.content = posVendors;
                let posVendorTotal = Pos_Vendor.find(selector).count();
                data.countPosVendor = posVendorTotal;
            }
            return data;
        }
    },
    queryPosVendorById(id) {
        let data = Pos_Vendor.findOne({_id: id});
        return data;
    },
    insertPosVendor(data) {
        let isInserted = Pos_Vendor.insert(data);
        if (isInserted) {
            vendorReact(isInserted);
        }
        return isInserted;
    },
    updatePosVendor(data) {
        let id = data._id;
        let isUpdated = Pos_Vendor.update({_id: data._id},
            {
                $set: data
            });
        if (isUpdated) {
            vendorReact(id);
        }
        return isUpdated;
    },
    removePosVendor(id) {
        let isRemoved = Pos_Vendor.remove({_id: id});
        if (isRemoved) {
            vendorReact(id);
        }
        return isRemoved;
    }
});


let vendorReact = function (id) {
    let doc = Pos_VendorReact.findOne();
    if (doc) {
        Pos_VendorReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Pos_VendorReact.insert({
            id: id
        });
    }
}