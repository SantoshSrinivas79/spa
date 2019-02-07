import {Acc_ChartAccount} from '../../../imports/collection/accChartAccount';
import {Acc_ChartAccountReact} from '../../../imports/collection/accChartAccount';
import {Acc_AccountType} from '../../../imports/collection/accAccountType';

import {SpaceChar} from "../../../both/config.js/space"
import {Pos_Vendor} from "../../../imports/collection/posVendor";

Meteor.methods({
    queryChartAccount({q, filter, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countChartAccount: 0,
            };
            let selector = {};
            if (!!q) {
                let reg = new RegExp(q);
                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {

                    let accountTypeList = Acc_AccountType.find({
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
                    }, {description: {$regex: reg, $options: 'mi'}}, {accountTypeId: {$in: accountTypeList}}];
                }
            }
            let chartAccounts = Acc_ChartAccount.aggregate([
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
                        from: "acc_accountType",
                        localField: "accountTypeId",
                        foreignField: "_id",
                        as: "accountTypeDoc"
                    }
                },
                {
                    $unwind: {path: "$accountTypeDoc", preserveNullAndEmptyArrays: true}
                },
                {
                    $lookup: {
                        from: "acc_chartAccount",
                        localField: "subAccountOf",
                        foreignField: "_id",
                        as: "subAccountOfDoc"
                    }
                },
                {
                    $unwind: {path: "$subAccountOfDoc", preserveNullAndEmptyArrays: true}
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        code: 1,
                        subAccountOf: 1,
                        accountTypeId: 1,
                        accountTypeName: "$accountTypeDoc.name",
                        level: 1,
                        description: 1,
                        isPaidTax: 1,
                        isPayment: 1,
                        mapToAccount: 1,
                        mapFixedAsset: 1,
                        subAccountOfName: {$concat: ["$subAccountOfDoc.code", " : ", "$subAccountOfDoc.name"]}
                    }
                }
            ]);
            if (chartAccounts.length > 0) {
                data.content = chartAccounts;
                let chartAccountTotal = Acc_ChartAccount.find(selector).count();
                data.countChartAccount = chartAccountTotal;
            }
            return data;
        }
    },
    queryChartAccountById(id) {
        let data = Acc_ChartAccount.findOne({_id: id});
        return data;
    },
    insertChartAccount(data) {
        let parentDoc = Acc_ChartAccount.findOne({_id: data.subAccountOf});
        if (parentDoc) {
            data.level = parentDoc.level + 1;
        }
        let isInsert = Acc_ChartAccount.insert(data);
        if (isInsert) {
            chartAccountReact(isInsert);
        }
        return isInsert;
    },
    updateChartAccount(data) {
        let parentDoc = Acc_ChartAccount.findOne({_id: data.subAccountOf});
        data.level = 0;
        if (parentDoc) {
            data.level = parentDoc.level + 1;
        }
        let id = data._id;
        let isUpdated = Acc_ChartAccount.update({_id: data._id},
            {
                $set: data
            });
        if (isUpdated) {
            chartAccountReact(id);
        }
        return isUpdated;
    },
    updateMapFixedAsset(mapFixedAssetDoc) {
        let obj = {};
        obj.mapFixedAsset = mapFixedAssetDoc;
        let id = mapFixedAssetDoc._id;
        let isUpdated = Acc_ChartAccount.update({_id: mapFixedAssetDoc.fixedAssetId},
            {
                $set: obj
            });
        if (isUpdated) {
            chartAccountReact(id);

        }
        return isUpdated;
    },
    removeChartAccount(id) {
        let isRemoved = Acc_ChartAccount.remove({_id: id});
        if (isRemoved) {
            chartAccountReact(id);
        }
        return isRemoved;
    }
});

let chartAccountReact = function (id) {
    let doc = Acc_ChartAccountReact.findOne();
    if (doc) {
        Acc_ChartAccountReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Acc_ChartAccountReact.insert({
            id: id
        });
    }
}