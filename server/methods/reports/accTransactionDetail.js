import {Meteor} from 'meteor/meteor';
import {Acc_Journal} from '../../../imports/collection/accJournal';
import {Acc_ChartAccount} from '../../../imports/collection/accChartAccount';
import {Acc_Exchange} from '../../../imports/collection/accExchange';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import numeral from 'numeral';
import {SpaceChar} from "../../../both/config.js/space"
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    transactionDetailReport(params) {
        let parameter = {};
        let data = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;
        }

        let companyDoc = WB_waterBillingSetup.findOne({});
        data.currencyHeader = companyDoc.baseCurrency;
        let baseCurrency = companyDoc.baseCurrency;

        if (params.currency != "") {
            parameter.currencyId = params.currency;
            data.currencyHeader = params.currency;
            baseCurrency = params.currency;

        }

        if (params.date != undefined) {
            parameter.journalDate = {
                $lte: moment(params.date[1]).endOf("day").toDate(),
                $gte: moment(params.date[0]).startOf("day").toDate()
            };
        }

        let exchange = Acc_Exchange.findOne({_id: params.exchangeId});

        let coefficientDrCr = exchangeCoefficient({
            exchange,
            fieldToCalculate: '$transaction.drcr',
            baseCurrency: baseCurrency
        });
        let coefficientDr = exchangeCoefficient({
            exchange,
            fieldToCalculate: '$transaction.dr',
            baseCurrency: baseCurrency
        });
        let coefficientCr = exchangeCoefficient({
            exchange,
            fieldToCalculate: '$transaction.cr',
            baseCurrency: baseCurrency
        });

        let selectorChartAccount = {};
        selectorChartAccount["accountDoc.accountTypeId"] = {$in: params.checkedAccountType};
        if (params.account != "") {
            selectorChartAccount["accountDoc._id"] = params.account;
        }

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
                         
            `
            let findJournalDocByChartAccountId = function (element) {
                if (element._id.accountDoc._id == chartAccDoc._id) {
                    return element;
                }
            }
            let journalDoc = journalList.find(findJournalDocByChartAccountId);
            let j = 1;
            let balance = 0;
            if (journalDoc) {
                ledgerHTML += `
                        <th>${formatCurrency(journalDoc.total, data.currencyHeader)}</th>
                    </tr>
                `;

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

                let totalParent = 0;
                if (childListDoc && childListDoc.childList.length > 0) {
                    let childListDocElement = childListDoc.childList.map(function (obj) {
                        return obj._id;
                    })
                    let findJournalDocByParentId = function (element) {
                        if (childListDocElement.indexOf(element._id.accountDoc._id) > -1) {
                            totalParent += element.total;
                        }
                    }
                    journalList.find(findJournalDocByParentId);
                }
                ledgerHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader)}</th>
                    </tr>
                `
            }

        })


        /*journalList.forEach(function (obj) {
            ledgerHTML += `<tr>
                                <th colspan="7"​  style="text-align: left !important;">${obj._id.accountDoc.code} : ${obj._id.accountDoc.name}</th>
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

