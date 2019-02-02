import {Sch_Activity} from '../../../imports/collection/schActivity';
import {Sch_ActivityReact} from '../../../imports/collection/schActivity';

import {SpaceChar} from "../../../both/config.js/space"
import {Pos_VendorReact} from "../../../imports/collection/posVendor";

Meteor.methods({
    querySchActivity({q, filter,rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countSchActivity: 0,
            };
            let selector = {};
            selector.rolesArea = rolesArea;

            if (!!q) {
                let reg = new RegExp(q);
                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {
                    selector.$or = [{name: {$regex: reg, $options: 'mi'}}, {
                        khName: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }, {desc: {$regex: reg, $options: 'mi'}}];
                }
            }
            let shcActivitys = Sch_Activity.aggregate([
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
            if (shcActivitys.length > 0) {
                data.content = shcActivitys;
                let shcActivityTotal = Sch_Activity.find(selector).count();
                data.countSchActivity = shcActivityTotal;
            }
            return data;
        }
    },
    querySchActivityById(id) {
        let data = Sch_Activity.findOne({_id: id});
        return data;
    },
    insertSchActivity(data) {
        let doc = Sch_Activity.insert(data);
        if (doc) {
            activityReact(doc);
        }
        return doc;
    },
    updateSchActivity(data) {
        let id = data._id;
        let doc = Sch_Activity.update({_id: data._id},
            {
                $set: data
            });
        if (doc) {
            activityReact(id);
        }
        return doc;
    },
    removeSchActivity(id) {
        let isRemoved = Sch_Activity.remove({_id: id});
        if (isRemoved) {
            activityReact(id);
        }
        return isRemoved;
    }
});


let activityReact = function (id) {
    let doc = Sch_ActivityReact.findOne();
    if (doc) {
        Sch_ActivityReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Sch_ActivityReact.insert({
            id: id
        });
    }
}