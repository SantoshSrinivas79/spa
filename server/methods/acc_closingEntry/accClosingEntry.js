import {Acc_ClosingEntry} from '../../../imports/collection/accClosingEntry';
import {Acc_ClosingEntryReact} from '../../../imports/collection/accClosingEntry';
import {Acc_Journal} from '../../../imports/collection/accJournal';
import {Acc_Exchange} from '../../../imports/collection/accExchange';
import {Acc_ChartAccountBalance} from '../../../imports/collection/accChartAccountBalance';

import {moment} from 'meteor/momentjs:moment';
import {SpaceChar} from "../../../both/config.js/space"
import {Acc_ChartAccountReact} from "../../../imports/collection/accChartAccount";

Meteor.methods({
    queryClosingEntry({q, filter, rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countClosingEntry: 0,
            };
            let selector = {};
            if (!!q) {
                let reg = new RegExp(q);
                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {
                    selector.$or = [{month: {$regex: reg, $options: 'mi'}}, {
                        closeDateName: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }, {year: {$regex: reg, $options: 'mi'}}];
                }
            }
            selector.rolesArea = rolesArea;
            let closingEntry = Acc_ClosingEntry.find(selector, {sort: {closeDate: -1}}, {skip: options.skip}, {limit: options.limit}).fetch();
            if (closingEntry.length > 0) {
                data.content = closingEntry;
                let closingEntryTotal = Acc_ClosingEntry.find(selector).count();
                data.countClosingEntry = closingEntryTotal;
            }
            return data;
        }
    },
    queryClosingEntryById(id) {
        return Acc_ClosingEntry.findOne({_id: id});
    },
    queryClosingEntryByMonthYear(month, year, rolesArea) {
        return Acc_ClosingEntry.findOne({month: month, year: year, rolesArea: rolesArea});
    },
    queryLastClosingEntry(rolesArea) {
        return Acc_ClosingEntry.findOne({rolesArea: rolesArea}, {sort: {closeDate: -1}});
    },
    insertClosingEntry(data) {
        let isInsert = Acc_ClosingEntry.insert(data);
        if (isInsert) {
            closingEntryReact(isInsert);
        }
        return isInsert;
    },
    updateClosingEntry(data) {
        let id = data._id;
        let isUpdated = Acc_ClosingEntry.update({_id: data._id},
            {
                $set: data
            });

        if (isUpdated) {
            closingEntryReact(id);

        }
        return isUpdated;
    },
    removeClosingEntry(id) {
        let isRemoved = Acc_ClosingEntry.remove({_id: id});
        if (isRemoved) {
            closingEntryReact(id);
        }
        return isRemoved;
    },

    insertChartAccountBalance: function (selector, rolesArea, selectorLastBalance, lastDate, dateSelect, closingEntryId, selectorChartAccount) {


        let data = [];
        let dataRaw = [];
        let dataLast;

        let result = Acc_Journal.aggregate([
            {$match: selector},
            {$unwind: "$transaction"},

            {
                $lookup:
                    {
                        from: "acc_chartAccount",
                        localField: "transaction.account",
                        foreignField: "_id",
                        as: "accountDoc"
                    }
            },
            {
                $unwind: {
                    path: "$accountDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {$match: selectorChartAccount},
            {
                $group: {
                    _id: {
                        account: "$accountDoc._id",
                        code: "$accountDoc.code",
                        currencyId: "$currencyId"
                    },
                    result: {$sum: "$transaction.drcr"}
                }
            },
            {$sort: {"_id.code": 1}}
        ]);
        let curMonth = moment(dateSelect).format("MM");
        result.forEach(function (obj) {
            data.push({
                chartAccountId: obj._id.account,
                value: obj.result,
                closeDate: dateSelect,
                currencyId: obj._id.currencyId,
                rolesArea: rolesArea
            })
        });
        if (lastDate !== null) {
            if (curMonth == "12") {
                dataLast = Acc_ChartAccountBalance.aggregate([
                    {
                        $match: selectorLastBalance

                    },
                    {
                        $lookup:
                            {
                                from: "acc_chartAccount",
                                localField: "chartAccountId",
                                foreignField: "_id",
                                as: "accountDoc"
                            }
                    }, {
                        $match: {
                            "accountDoc.accountTypeId": {
                                $gte: "01",
                                $lte: "49"
                            }
                        }
                    }

                ]);
            } else {
                dataLast = Acc_ChartAccountBalance.find(selectorLastBalance).fetch();
            }
            if (dataLast != null) {
                dataLast.forEach(function (lastBal) {
                    data.push({
                        chartAccountId: lastBal.chartAccountId,
                        value: lastBal.value,
                        closeDate: dateSelect,
                        currencyId: lastBal.currencyId,
                        rolesArea: lastBal.rolesArea
                    })
                })
            }
        }
        data.reduce(function (key, val) {
            if (!key[val.chartAccountId + val.currencyId]) {
                key[val.chartAccountId + val.currencyId] = {
                    chartAccountId: val.chartAccountId,
                    value: val.value,
                    closeDate: val.closeDate,
                    currencyId: val.currencyId,
                    rolesArea: val.rolesArea
                };
                dataRaw.push(key[val.chartAccountId + val.currencyId]);
            } else {
                key[val.chartAccountId + val.currencyId].value += val.value;
            }
            return key;
        }, {});

        dataRaw.forEach(function (ob) {
            Acc_ChartAccountBalance.insert({
                chartAccountId: ob.chartAccountId,
                value: ob.value,
                closeDate: moment(ob.closeDate).toDate(),
                currencyId: ob.currencyId,
                rolesArea: ob.rolesArea,
                closingEntryId: closingEntryId,
                year: moment(ob.closeDate).format("YYYY"),
                month: moment(ob.closeDate).format("MM")
            })
        });
        return "Success";
    },
    removeChartAccountBalance: function (id, rolesArea) {
        let data = Acc_ClosingEntry.findOne({_id: id});
        Acc_ChartAccountBalance.remove({closingEntryId: id}, function (error) {
            if (!error) {
                if (moment(data.closeDate).format("MM") == 12) {
                    Acc_Journal.remove({closingEntryId: id});
                }
            }
        });
    },
    insertCurrencyClosing(selector, rolesArea, closingEntryId) {
        let result = Acc_Journal.aggregate([
            {$unwind: "$transaction"},

            {
                $lookup:
                    {
                        from: "acc_chartAccount",
                        localField: "transaction.account",
                        foreignField: "_id",
                        as: "accountDoc"
                    }
            },
            {
                $unwind: {
                    path: "$accountDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {$match: selector},
            {
                $group: {
                    _id: {
                        account: "$accountDoc._id",
                        code: "$accountDoc.code",
                        currencyId: "$currencyId"
                    },
                    result: {$sum: "$transaction.drcr"}
                }
            },
            {$sort: {"_id.code": 1}}
        ]);


    },
    getJournalByCurrencyClosingId(closingEntryId) {
        return Acc_Journal.find({closingEntryId: closingEntryId}).fetch();
    }

});


let closingEntryReact = function (id) {
    let doc = Acc_ClosingEntryReact.findOne();
    if (doc) {
        Acc_ClosingEntryReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Acc_ClosingEntryReact.insert({
            id: id
        });
    }
}