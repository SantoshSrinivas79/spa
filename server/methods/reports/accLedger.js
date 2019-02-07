import {Meteor} from 'meteor/meteor';
import {Acc_Journal} from '../../../imports/collection/accJournal';
import {Acc_ChartAccount} from '../../../imports/collection/accChartAccount';
import {Acc_Exchange} from '../../../imports/collection/accExchange';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Acc_ChartAccountBalance} from '../../../imports/collection/accChartAccountBalance';
import {Acc_ClosingEntry} from '../../../imports/collection/accClosingEntry';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"
import {Pos_Product} from "../../../imports/collection/posProduct";

Meteor.methods({
    ledgerReport(params) {
        let parameter = {};
        let parameterUnRange = {};
        let selectorClosingEntry = {};
        let selectorChartAccountBalance = {};
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});

        if (params.area != "") {
            parameter.rolesArea = params.area;
            parameterUnRange.rolesArea = params.area;
            selectorClosingEntry.rolesArea = params.area;
            selectorChartAccountBalance.rolesArea = params.area;
        }

        data.currencyHeader = companyDoc.baseCurrency;
        let baseCurrency = companyDoc.baseCurrency;

        if (params.currency != "") {
            parameter.currencyId = params.currency;
            parameterUnRange.currencyId = params.currency;
            selectorChartAccountBalance.currencyId = params.currency;

            data.currencyHeader = params.currency;
            baseCurrency = params.currency;
        }
        if (params.date != undefined) {
            parameter.journalDate = {
                $lte: moment(params.date[1]).endOf("day").toDate(),
                $gte: moment(params.date[0]).startOf("day").toDate()
            };

            selectorClosingEntry.closeDate = {$lt: moment(params.date[0]).startOf("day").toDate()}
        }


        let exchange = Acc_Exchange.findOne({_id: params.exchangeId});


        let coefficientDrCr = exchangeCoefficient({
            exchange,
            fieldToCalculate: '$transaction.drcr',
            baseCurrency: baseCurrency
        });
        let coefficientValue = exchangeCoefficient({
            exchange,
            fieldToCalculate: '$value',
            baseCurrency: baseCurrency
        });


        let selectorChartAccount = {};
        selectorChartAccount["accountDoc.accountTypeId"] = {$in: params.checkedAccountType};
        if (params.account != "") {
            selectorChartAccount["accountDoc._id"] = params.account;
        }
        //Range Date
        let journalList = Acc_Journal.aggregate([

            {
                $match: parameter
            },
            {
                $project: {
                    _id: 1,
                    currencyId: 1,
                    journalDate: 1,
                    total: 1,
                    voucherId: 1,
                    memo: 1,
                    transaction: 1,
                    copyTransaction: "$transaction"
                }

            },
            {
                $unwind: {
                    path: "$transaction",
                    preserveNullAndEmptyArrays: true
                }
            },
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
            {
                $match: selectorChartAccount
            }
            ,
            {
                $project: {
                    id: "$_id",
                    currencyId: "$currencyId",
                    journalDate: "$journalDate",
                    total: "$total",
                    voucherId: "$voucherId",
                    memo: "$memo",
                    transaction: "$transaction",
                    copyTransaction: "$copyTransaction",
                    accountDoc: "$accountDoc",
                    drcr: {
                        $cond: {
                            if: {$eq: ['$currencyId', 'USD']},
                            then: coefficientDrCr.USD,
                            else: {$cond: [{$eq: ['$currencyId', 'KHR']}, coefficientDrCr.KHR, coefficientDrCr.THB]}
                        }
                    }
                }
            }, {
                $project: {
                    id: 1,
                    currencyId: 1,
                    journalDate: 1,
                    total: 1,
                    voucherId: 1,
                    memo: 1,
                    transaction: 1,
                    copyTransaction: 1,
                    accountDoc: 1,
                    drcr: {$cond: [{$in: ["$accountDoc.accountTypeId", ["30", "32", "34", "36", "40", "41", "50", "51"]]}, {$multiply: ["$drcr", -1]}, "$drcr"]}
                }
            },
            {$sort: {"accountDoc.code": -1}},
            {
                $group: {
                    _id: {
                        accountDoc: "$accountDoc"
                    },
                    data: {$addToSet: "$$ROOT"},
                    total: {$sum: "$drcr"},
                }
            }
        ])


        //Closing Entry Date

        let closingEntry = Acc_ClosingEntry.findOne(selectorClosingEntry, {sort: {closeDate: -1}});
        let chartAccountBalance = [];
        if (closingEntry) {
            selectorChartAccountBalance.month = closingEntry.month;
            selectorChartAccountBalance.year = closingEntry.year;

            chartAccountBalance = Acc_ChartAccountBalance.aggregate([
                {$match: selectorChartAccountBalance},
                {
                    $lookup:
                        {
                            from: "acc_chartAccount",
                            localField: "chartAccountId",
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
                    $project: {
                        chartAccountId: 1,
                        value: {
                            $cond: {
                                if: {$eq: ['$currencyId', 'USD']},
                                then: coefficientValue.USD,
                                else: {$cond: [{$eq: ['$currencyId', 'KHR']}, coefficientValue.KHR, coefficientValue.THB]}
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            chartAccountId: "$chartAccountId"
                        },
                        value: {$sum: "$value"}
                    }
                },
                {
                    $project: {
                        _id: 0,
                        chartAccountId: "$_id.chartAccountId",
                        value: {$cond: [{$in: ["$accountDoc.accountTypeId", ["30", "32", "34", "36", "40", "41", "50", "51"]]}, {$multiply: ["$value", -1]}, "$value"]}
                    }
                }

            ]);

        }

        //UnRange Date
        let selectorUnRange = {};
        if (closingEntry) {
            if (params.date != undefined) {
                parameterUnRange.journalDate = {
                    $gte: moment(closingEntry.closeDate).add(1, "day").startOf("day").toDate(),
                    $lt: moment(params.date[0]).startOf("day").toDate()
                };
            }
        } else {
            if (params.date != undefined) {
                parameterUnRange.journalDate = {
                    $lt: moment(params.date[0]).startOf("day").toDate()
                };
            }
        }

        let journalListUnRange = Acc_Journal.aggregate([
            {
                $match: parameterUnRange
            },
            {
                $project: {
                    _id: 1,
                    currencyId: 1,
                    journalDate: 1,
                    total: 1,
                    voucherId: 1,
                    memo: 1,
                    transaction: 1,
                    copyTransaction: "$transaction"
                }

            },
            {
                $unwind: {
                    path: "$transaction",
                    preserveNullAndEmptyArrays: true
                }
            },
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
            {
                $match: selectorChartAccount
            }
            ,
            {
                $project: {
                    id: "$_id",
                    currencyId: "$currencyId",
                    journalDate: "$journalDate",
                    total: "$total",
                    voucherId: "$voucherId",
                    memo: "$memo",
                    transaction: "$transaction",
                    copyTransaction: "$copyTransaction",
                    accountDoc: "$accountDoc",
                    drcr: {
                        $cond: {
                            if: {$eq: ['$currencyId', 'USD']},
                            then: coefficientDrCr.USD,
                            else: {$cond: [{$eq: ['$currencyId', 'KHR']}, coefficientDrCr.KHR, coefficientDrCr.THB]}
                        }
                    }
                }
            }, {
                $project: {
                    id: 1,
                    currencyId: 1,
                    journalDate: 1,
                    total: 1,
                    voucherId: 1,
                    memo: 1,
                    transaction: 1,
                    copyTransaction: 1,
                    accountDoc: 1,
                    drcr: {$cond: [{$in: ["$accountDoc.accountTypeId", ["30", "32", "34", "36", "40", "41", "50", "51"]]}, {$multiply: ["$drcr", -1]}, "$drcr"]}
                }
            },
            {$sort: {"accountDoc.code": -1}},
            {
                $group: {
                    _id: {
                        accountDoc: "$accountDoc"
                    },
                    data: {$addToSet: "$$ROOT"},
                    total: {$sum: "$drcr"},
                }
            }
        ])


        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");
        let ledgerHTML = "";

        let chartAccountParentList = Acc_ChartAccount.aggregate([

            {
                $graphLookup: {
                    from: "acc_chartAccount",
                    startWith: "$_id",
                    connectFromField: "_id",
                    connectToField: "subAccountOf",
                    maxDepth: 3,
                    depthField: "numConnections",
                    as: "childList"
                }
            }, {
                $sort: {code: 1}
            }
        ])
        let newParams = {};
        if (params.checkedAccountType.length > 0) {
            if (params.account != "") {
                newParams._id = params.account;
            } else {
                let chartAccountList = Acc_ChartAccount.find({accountTypeId: {$in: params.checkedAccountType}}).map((obj) => obj._id);
                newParams._id = {$in: chartAccountList};
            }
        }

        let chartAccountList = Acc_ChartAccount.aggregate([
            {
                $graphLookup: {
                    from: "acc_chartAccount",
                    startWith: "$subAccountOf",
                    connectFromField: "subAccountOf",
                    connectToField: "_id",
                    maxDepth: 3,
                    depthField: "numConnections",
                    as: "parentDoc"
                }
            }, {
                $sort: {code: 1}
            }
        ]);

        let rawChartAccountList = Acc_ChartAccount.aggregate([
            {
                $match: newParams
            },
            {
                $graphLookup: {
                    from: "acc_chartAccount",
                    startWith: "$subAccountOf",
                    connectFromField: "subAccountOf",
                    connectToField: "_id",
                    maxDepth: 3,
                    depthField: "numConnections",
                    as: "parentDoc"
                }
            }, {
                $sort: {code: 1}
            }
        ]);

        rawChartAccountList.forEach(function (chartAccDoc) {
            ledgerHTML += `<th colspan="6"​  style="text-align: left !important;">${SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</th>
                         
            `;
            let findJournalDocByChartAccountId = function (element) {
                if (element._id.accountDoc._id == chartAccDoc._id) {
                    return element;
                }
            }
            let journalDoc = journalList.find(findJournalDocByChartAccountId);
            let j = 1;
            let balance = 0;
            let totalParent = 0;
            let totalAccount = 0;
            let beginingBal = 0;
            let beginingBalClose = chartAccountBalance.find((o) => o.chartAccountId == chartAccDoc._id);
            let beginingBalUnRank = journalListUnRange.find((o) => o._id.accountDoc._id == chartAccDoc._id);

            if (beginingBalClose) {
                beginingBal += beginingBalClose.value;
                totalAccount += beginingBalClose.value;
                totalParent += beginingBalClose.value;

            }
            if (beginingBalUnRank) {
                beginingBal += beginingBalUnRank.total;
                totalAccount += beginingBalUnRank.total;
                totalParent += beginingBalUnRank.total;
            }

            if (journalDoc) {
                totalAccount += journalDoc.total;
                ledgerHTML += `
                        <th>${formatCurrency(totalAccount, data.currencyHeader)}</th>
                    </tr>
                `;
                ledgerHTML += `
                        <td colspan="6" style="text-align: left !important;">${SpaceChar.space(chartAccDoc.level * 7)} Begining Balance</td>
                        <td><u>${formatCurrency(beginingBal, data.currencyHeader)}</u></td>
                    </tr>
                `;
                balance += beginingBal;

                let newJournalDocData = journalDoc.data.sort(compareASD);
                newJournalDocData.forEach(function (subObj) {
                    balance += subObj.drcr;

                    let splitData = "split";
                    if (subObj.copyTransaction && subObj.copyTransaction.length < 3) {

                        subObj.copyTransaction.forEach(function (objTransaction) {
                            if (objTransaction.account != chartAccDoc._id) {

                                let findChartAccountById = function (element) {
                                    if (element._id == objTransaction.account) {
                                        return element;
                                    }
                                }
                                let chartAccountDoc = chartAccountList.find(findChartAccountById);
                                splitData = chartAccountDoc.code + " : " + chartAccountDoc.name;
                            }
                        })
                    }
                    ledgerHTML += `<tr>
                            <td style="text-align: left !important;">${j}</td>
                            <td style="text-align: center !important;"">${moment(subObj.journalDate).format("DD/MM/YYYY")}</td>
                            <td  style="text-align: center !important;">${subObj.voucherId}</td>
                            <td  style="text-align: left !important;">${subObj.memo}</td>
                            <td style="text-align: left !important;">${splitData}</td>
                            <td>${formatCurrency(subObj.drcr, data.currencyHeader)}</td>
                            <td>${formatCurrency(balance, data.currencyHeader)}</td>
                            </tr>
                    `;
                    j++;

                })
            } else {
                let childListDoc = chartAccountParentList.find((o) => o._id == chartAccDoc._id);

                if (childListDoc && childListDoc.childList.length > 0) {
                    let childListDocElement = childListDoc.childList.map(function (obj) {
                        return obj._id;
                    })

                    //Rank
                    let findJournalDocByParentId = function (element) {
                        if (childListDocElement.indexOf(element._id.accountDoc._id) > -1) {
                            totalParent += element.total;
                        }
                    }

                    journalList.find(findJournalDocByParentId);
                    //Un Rank
                    let findJournalDocUnRankByParentId = function (element) {
                        if (childListDocElement.indexOf(element._id.accountDoc._id) > -1) {
                            totalParent += element.total;
                            beginingBal += element.total;
                        }
                    }
                    journalListUnRange.find(findJournalDocUnRankByParentId);

                    //Closing Entry

                    let findJournalDocClosingEntryByParentId = function (element) {
                        if (childListDocElement.indexOf(element.chartAccountId) > -1) {
                            totalParent += element.value;
                            beginingBal += element.value;
                        }
                    }
                    chartAccountBalance.find(findJournalDocClosingEntryByParentId);

                }
                ledgerHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader)}</th>
                    </tr>
                `
                ledgerHTML += `
                        <td colspan="6"​ style="text-align: left !important;">${SpaceChar.space(chartAccDoc.level * 7)}Begining Balance</td>
                        <td><u>${formatCurrency(beginingBal, data.currencyHeader)}</u></td>
                    </tr>
                `;
            }

        })


        /*journalList.forEach(function (obj) {
            ledgerHTML += `<tr>
                                <th colspan="6"​  style="text-align: left !important;">${obj._id.accountDoc.code} : ${obj._id.accountDoc.name}</th>
                                <th></th>
                    </tr>`;
            let j = 1;
            let balance = 0;
            obj.data.forEach(function (subObj) {
                balance += subObj.drcr;

                let splitData = "split";
                if (subObj.copyTransaction && subObj.copyTransaction.length < 3) {

                    subObj.copyTransaction.forEach(function (objTransaction) {
                        if (objTransaction.account != obj._id.accountDoc._id) {

                            let findChartAccountById = function (element) {
                                if (element._id == objTransaction.account) {
                                    return element;
                                }
                            }
                            let chartAccountDoc = chartAccountList.find(findChartAccountById);
                            splitData = chartAccountDoc.code + " : " + chartAccountDoc.name;
                        }
                    })
                }


                ledgerHTML += `<tr>
                            <td style="text-align: left !important;">${j}</td>
                            <td style="text-align: center !important;"">${moment(subObj.journalDate).format("DD/MM/YYYY")}</td>
                            <td  style="text-align: center !important;">${subObj.voucherId}</td>
                            <td  style="text-align: left !important;">${subObj.memo}</td>
                            <td style="text-align: left !important;">${splitData}</td>
                            <td>${formatCurrency(subObj.drcr,data.currencyHeader)}</td>
                            <td>${formatCurrency(balance,data.currencyHeader)}</td>
                            </tr>
                    `;
                j++;
            })

            ledgerHTML += `<tr>
                <th colspan="5"​ style="text-align: left !important;">Total For ${obj._id.accountDoc.code} : ${obj._id.accountDoc.name}</th>
                <th>${formatCurrency(obj.total,data.currencyHeader)}</th>
                <th></th>
            </tr>`


        })*/

        data.ledgerHTML = ledgerHTML;

        return data;
    }
});


let compareASD = function (a, b) {
    if (a.journalDate.getTime() < b.journalDate.getTime()) {
        return -1;
    } else if (a.journalDate.getTime() > b.journalDate.getTime()) {
        return 1;
    } else {
        return 0;
    }
}



