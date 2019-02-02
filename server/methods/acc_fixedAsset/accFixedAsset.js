import {Acc_FixedAsset} from "../../../imports/collection/accFixedAsset";
import {Acc_FixedAssetReact} from "../../../imports/collection/accFixedAsset";
import {WB_waterBillingSetup} from "../../../imports/collection/waterBillingSetup";
import numeral from "numeral";
import math from "mathjs";
import {formatCurrency} from "../../../imports/api/methods/roundCurrency";
import {Acc_ExchangeReact} from "../../../imports/collection/accExchange";

Meteor.methods({
    queryAccFixedAsset({q, filter, rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countAccFixedAsset: 0,
            };
            let selector = {};
            selector.rolesArea = rolesArea;

            if (!!q) {
                let reg = new RegExp(q);
                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {
                    selector.$or = [{"accountDoc.name": {$regex: reg, $options: 'mi'}}, {
                        code: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }, {
                        description: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }, {life: {$regex: reg, $options: 'mi'}},
                        {value: {$regex: reg, $options: 'mi'}}];
                }
            }
            let shcFixedAssets = Acc_FixedAsset.aggregate([
                {
                    $lookup: {
                        from: "acc_chartAccount",
                        localField: "account",
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
            if (shcFixedAssets.length > 0) {
                let shcFixedAssetTotal = Acc_FixedAsset.find(selector).count();
                data.countAccFixedAsset = shcFixedAssetTotal;
                data.shcFixedAssets = shcFixedAssets;
            }
            return data;
        }
    },

    queryAccFixedAssetById(id) {
        let data = Acc_FixedAsset.findOne({_id: id});
        return data;
    },
    insertAccFixedAsset(data) {

        let transaction = generateScheduleFixedAsset(data);
        data.transaction = transaction;
        let doc = Acc_FixedAsset.insert(data);
        if (doc) {
            fixedAssetReact(doc);
        }

        return doc;
    },
    updateAccFixedAsset(data) {
        let transaction = generateScheduleFixedAsset(data);
        data.transaction = transaction;
        let id = data._id;
        let doc = Acc_FixedAsset.update({_id: data._id},
            {
                $set: data
            });

        if (doc) {
            fixedAssetReact(id);
        }
        return doc;
    },
    removeAccFixedAsset(id) {
        let isRemoved = Acc_FixedAsset.remove({_id: id});
        if (isRemoved) {
            fixedAssetReact(id);
        }
        return isRemoved;
    }
});


function generateScheduleFixedAsset(doc) {
    let transaction = [];
    let curMonth = moment(doc.buyDate).format("MM");

    let companyDoc = WB_waterBillingSetup.findOne();
    if (companyDoc.depreciationType === "001") {
        let depPerYear = (doc.value - doc.estSalvage) / doc.life;

        if (curMonth != "12") {
            for (let i = 1; i <= doc.life + 1; i++) {
                if (i == 1 || i == doc.life + 1) {
                    let maxMonth = i == 1 ? 12 - parseInt(curMonth) : parseInt(curMonth);
                    transaction.push({
                        year: i,
                        perMonth: numeral(formatCurrency((depPerYear / 12), doc.currencyId)).value(),
                        perYear: numeral(formatCurrency((depPerYear / 12) * maxMonth, doc.currencyId)).value(),
                        month: 0,
                        maxMonth: maxMonth,
                        status: false
                    })
                } else {
                    transaction.push({
                        year: i,
                        perMonth: numeral(formatCurrency((depPerYear / 12), doc.currencyId)).value(),
                        perYear: numeral(formatCurrency(depPerYear, doc.currencyId)).value(),
                        month: 0,
                        maxMonth: 12,
                        status: false
                    })
                }
            }
        } else {
            for (let i = 1; i <= doc.life; i++) {
                transaction.push({
                    year: i,
                    perMonth: numeral(formatCurrency((depPerYear / 12), doc.currencyId)).value(),
                    perYear: numeral(formatCurrency(depPerYear, doc.currencyId)).value(),
                    month: 0,
                    maxMonth: 12,
                    status: false
                })
            }
        }
    } else if (companyDoc.depreciationType === "002") {
        let percentage = math.round(((100 / doc.life) * 2), 2);
        let amount = doc.value;
        for (let i = 1; i <= doc.life; i++) {
            let depPerYear = 0;
            let maxMonth = 12;
            if (i === 1 || i === doc.life && curMonth !== 12) {
                maxMonth = i === 1 ? 12 - parseInt(curMonth) : parseInt(curMonth);
            }

            if (i === doc.life) {
                depPerYear = numeral(formatCurrency(amount - doc.estSalvage, doc.currencyId)).value();
            } else {
                depPerYear = numeral(formatCurrency(((amount - doc.estSalvage) * (percentage / 100)), doc.currencyId)).value();

            }

            transaction.push({
                year: i,
                perMonth: numeral(formatCurrency(depPerYear / maxMonth, doc.currencyId)).value(),
                perYear: numeral(formatCurrency(depPerYear, doc.currencyId)).value(),
                month: 0,
                maxMonth: maxMonth,
                status: false
            })
            amount -= depPerYear;

        }
    } else if (companyDoc.depreciationType === "003") {
        let numYear = 0;
        for (let i = 1; i <= doc.life; i++) {
            numYear += i;
        }

        let depreAmount = numeral(formatCurrency((doc.value - doc.estSalvage), companyDoc.baseCurrency)).value();
        let y = 1;
        for (let i = doc.life; i > 0; i--) {
            let maxMonth = 12;
            if (i === 1 || i === doc.life && curMonth !== 12) {
                maxMonth = i == doc.life ? 12 - parseInt(curMonth) : parseInt(curMonth);
            }
            let depPerYear = numeral(formatCurrency((i / numYear) * depreAmount, doc.currencyId)).value();
            transaction.push({
                year: y,
                perMonth: numeral(formatCurrency((depPerYear / maxMonth), doc.currencyId)).value(),
                perYear: numeral(formatCurrency(depPerYear, doc.currencyId)).value(),
                month: 0,
                maxMonth: maxMonth,
                status: false
            })
            y++;
        }
    }

    return transaction;
}

let fixedAssetReact = function (id) {
    let doc = Acc_FixedAssetReact.findOne();
    if (doc) {
        Acc_FixedAssetReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Acc_FixedAssetReact.insert({
            id: id
        });
    }
}