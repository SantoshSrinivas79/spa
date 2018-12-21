import {Meteor} from 'meteor/meteor';
import {Acc_Journal} from '../../../imports/collection/accJournal';
import {Acc_ChartAccount} from '../../../imports/collection/accChartAccount';
import {Acc_Exchange} from '../../../imports/collection/accExchange';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Acc_ChartAccountBalance} from '../../../imports/collection/accChartAccountBalance';
import {Acc_ClosingEntry} from '../../../imports/collection/accClosingEntry';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {Acc_AccountType} from "../../../imports/collection/accAccountType";

import {formatCurrency} from "../../../imports/api/methods/roundCurrency";
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency";
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency";
import {roundCurrency} from "../../../imports/api/methods/roundCurrency";

Meteor.methods({
    balanceSheetReport(params) {
        let parameter = {};
        let selectorClosingEntry = {};
        let selectorChartAccountBalance = {};
        let selectorNetIncome = {};

        let data = {};
        let companyDoc = WB_waterBillingSetup.findOne({});

        let baseCurrency = companyDoc.baseCurrency;
        if (params.area != "") {
            parameter.rolesArea = params.area;
            selectorClosingEntry.rolesArea = params.area;
            selectorChartAccountBalance.rolesArea = params.area;
            selectorNetIncome.rolesArea = params.area;
        }

        data.currencyHeader = companyDoc.baseCurrency;

        if (params.currency != "") {
            parameter.currencyId = params.currency;
            selectorChartAccountBalance.currencyId = params.currency;
            selectorNetIncome.currencyId = params.currency;
            baseCurrency = params.currency;
            data.currencyHeader = params.currency;

        }


        //Closing Entry Date
        if (params.date) {
            selectorClosingEntry.closeDate = {$lt: moment(params.date).startOf("day").toDate()};
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
        selectorChartAccount["accountDoc.accountTypeId"] = {$in: ["10", "11", "12", "13", "15", "16", "20", "29", "30", "32", "34", "36", "40", "41"]};


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
                    $match: selectorChartAccount
                },

                {
                    $project: {
                        chartAccountId: 1,
                        accountDoc: 1,
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
                            chartAccountId: "$chartAccountId",
                            accountDoc: "$accountDoc"
                        },
                        value: {$sum: "$value"}
                    }
                },
                {
                    $project: {
                        _id: 0,
                        chartAccountId: "$_id.chartAccountId",
                        value: {$cond: [{$in: ["$_id.accountDoc.accountTypeId", ["30", "32", "34", "36", "40", "41", "50", "51"]]}, {$multiply: ["$value", -1]}, "$value"]}
                    }
                }

            ]);

            if (params.date != undefined) {

                selectorNetIncome.journalDate = {
                    $lte: moment(params.date).endOf("day").toDate(),
                    $gte: moment(params.date).startOf("year").toDate()
                };

                parameter.journalDate = {
                    $lte: moment(params.date).endOf("day").toDate(),
                    $gte: moment(closingEntry.closeDate).startOf("day").add(1, "day").toDate()
                };
            }

        } else {
            if (params.date != undefined) {

                selectorNetIncome.journalDate = {
                    $lte: moment(params.date).endOf("day").toDate(),
                    $gte: moment(params.date).startOf("year").toDate()
                };

                parameter.journalDate = {
                    $lte: moment(params.date).endOf("day").toDate()
                };
            }

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

        data.dateHeader = moment(params.date).format("DD/MM/YYYY");
        let balanceSheetHTML = "";
        let selectorBalanceSheetChartAccount = {};
        selectorBalanceSheetChartAccount.accountTypeId = {$in: ["10", "11", "12", "13", "15", "16", "20", "29", "30", "32", "34", "36", "40", "41"]};

        let chartAccountParentList = Acc_ChartAccount.aggregate([
            {
                $match: selectorBalanceSheetChartAccount
            },
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


        let chartAccountList = Acc_ChartAccount.aggregate([
            {
                $match: selectorBalanceSheetChartAccount
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

        let totalBankAccount = 0;
        let totalAR = 0;
        let totalOtherCurrentAsset = 0;
        let totalFixedAsset = 0;
        let totalOtherAsset = 0;
        let totalAccountsPayable = 0;
        let totalCreditCards = 0;
        let totalOtherCurrentLiabilities = 0;
        let totalLongTermLiabilities = 0;

        let totalEquity = 0;
        let AccountTypeList = Acc_AccountType.find({_id: {$in: ["10", "11", "12", "13", "15", "16", "20", "29", "30", "32", "34", "36", "40", "41"]}});
        AccountTypeList.forEach(function (obj) {
            if (obj._id == "10") {
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">ASSETS （ទ្រព្យសកម្ម）</th>
                        <td></td>
                    </tr>
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(6)}Current Assets (ទ្រព្យសកម្មរយៈពេលខ្លី)</th>
                        <td></td>
                    </tr>`;

                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(12)}Bank Accounts (គណនីធនាគារ)</th>
                        <td></td>
                    </tr>
                `;


                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });


                accountList.forEach(function (chartAccDoc) {

                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;
                    let beginingBalClose = chartAccountBalance.find((o) => o.chartAccountId == chartAccDoc._id);

                    if (beginingBalClose) {
                        totalAccount += beginingBalClose.value;
                        totalParent += beginingBalClose.value;
                        totalBankAccount += beginingBalClose.value;

                    }


                    if (journalDoc) {
                        totalAccount += journalDoc.total;
                        totalBankAccount += journalDoc.total;
                        if (totalAccount>0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(18) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>`;


                            balanceSheetHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
                        }

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

                            //Closing Entry

                            let findJournalDocClosingEntryByParentId = function (element) {
                                if (childListDocElement.indexOf(element.chartAccountId) > -1) {
                                    totalParent += element.value;
                                }
                            }
                            chartAccountBalance.find(findJournalDocClosingEntryByParentId);

                        }
                        if (totalParent > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(18) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>`;

                            if (chartAccDoc.level == 0) {
                                balanceSheetHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                            } else {
                                balanceSheetHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                            }
                        }
                    }

                })
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(12)}<u>Total Bank Accounts (សរុបគណនីធនាគារ)</u></th>
                        <th>${formatCurrency(totalBankAccount, data.currencyHeader)}</th>
                    </tr>
                `;
            }
            else if (obj._id == "11") {
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(12)}Account Receivable (ទឹកប្រាក់ត្រូវទទួល)</th>
                        <td></td>
                    </tr>
                `;

                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });
                accountList.forEach(function (chartAccDoc) {


                        let findJournalDocByChartAccountId = function (element) {
                            if (element._id.accountDoc._id == chartAccDoc._id) {
                                return element;
                            }
                        }
                        let journalDoc = journalList.find(findJournalDocByChartAccountId);
                        let totalParent = 0;
                        let totalAccount = 0;
                        let beginingBalClose = chartAccountBalance.find((o) => o.chartAccountId == chartAccDoc._id);

                        if (beginingBalClose) {
                            totalAccount += beginingBalClose.value;
                            totalParent += beginingBalClose.value;
                            totalAR += beginingBalClose.value;

                        }


                        if (journalDoc) {
                            totalAccount += journalDoc.total;
                            totalAR += journalDoc.total;
                            if (totalAccount > 0) {
                                balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(18) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;

                                balanceSheetHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
                            }
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
                                //Closing Entry

                                let findJournalDocClosingEntryByParentId = function (element) {
                                    if (childListDocElement.indexOf(element.chartAccountId) > -1) {
                                        totalParent += element.value;
                                    }
                                }
                                chartAccountBalance.find(findJournalDocClosingEntryByParentId);

                            }
                            if (totalParent > 0) {
                                balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(18) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;
                                if (chartAccDoc.level == 0) {
                                    balanceSheetHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                                } else {
                                    balanceSheetHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                                }
                            }
                        }

                    }
                )
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(12)}<u>Total Account Receivable (សរុបទឹកប្រាក់ត្រូវទទួល)</u></th>
                        <th>${formatCurrency(totalAR, data.currencyHeader)}</th>
                    </tr>
                `;
            } else if (obj._id == "15") {
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(12)}Other Current Assets (ទ្រព្យសកម្មរយៈពេលខ្លីផ្សេងៗ)</th>
                        <td></td>
                    </tr>
                `;


                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });
                accountList.forEach(function (chartAccDoc) {


                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;
                    let beginingBalClose = chartAccountBalance.find((o) => o.chartAccountId == chartAccDoc._id);

                    if (beginingBalClose) {
                        totalAccount += beginingBalClose.value;
                        totalParent += beginingBalClose.value;
                        totalOtherCurrentAsset += beginingBalClose.value;

                    }

                    if (journalDoc) {
                        totalAccount += journalDoc.total;
                        totalOtherCurrentAsset += journalDoc.total;
                        if (totalAccount > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(18) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;

                            balanceSheetHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
                        }
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

                            //Closing Entry

                            let findJournalDocClosingEntryByParentId = function (element) {
                                if (childListDocElement.indexOf(element.chartAccountId) > -1) {
                                    totalParent += element.value;
                                }
                            }
                            chartAccountBalance.find(findJournalDocClosingEntryByParentId);

                        }

                        if (totalParent > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(18) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;
                            if (chartAccDoc.level == 0) {
                                balanceSheetHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                            } else {
                                balanceSheetHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                            }
                        }
                    }

                })
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(12)}<u>Total Other Current Assets (សរុបទ្រព្យសកម្មរយៈពេលខ្លីផ្សេងៗ)</u></th>
                        <th>${formatCurrency(totalOtherCurrentAsset, data.currencyHeader)}</th>
                    </tr>
                `;


                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(6)}<u>Total Current Assets (សរុបទ្រព្យសកម្មរយៈពេលខ្លី)</u></th>
                        <th>${formatCurrency(totalBankAccount + totalAR + totalOtherCurrentAsset, data.currencyHeader)}</th>
                    </tr>
                `;
            }
            else if (obj._id == "20") {

                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(6)}<u>Fixed Assets (ទ្រព្យសកម្មរយៈពេលវែង)</u></th>
                        <td></td>
                    </tr>
                `;


                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });
                accountList.forEach(function (chartAccDoc) {


                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;
                    let beginingBalClose = chartAccountBalance.find((o) => o.chartAccountId == chartAccDoc._id);

                    if (beginingBalClose) {
                        totalAccount += beginingBalClose.value;
                        totalParent += beginingBalClose.value;
                        totalFixedAsset += beginingBalClose.value;

                    }

                    if (journalDoc) {
                        totalAccount += journalDoc.total;
                        totalFixedAsset += journalDoc.total;
                        if (totalAccount > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(12) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;

                            balanceSheetHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
                        }
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

                            //Closing Entry

                            let findJournalDocClosingEntryByParentId = function (element) {
                                if (childListDocElement.indexOf(element.chartAccountId) > -1) {
                                    totalParent += element.value;
                                }
                            }
                            chartAccountBalance.find(findJournalDocClosingEntryByParentId);

                        }

                        if (totalParent > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(12) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;
                            if (chartAccDoc.level == 0) {
                                balanceSheetHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                            } else {
                                balanceSheetHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                            }
                        }
                    }

                })
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(6)}<u>Total Fixed Assets (សរុបទ្រព្យសកម្មរយៈពេលវែង)</u></th>
                        <th>${formatCurrency(totalFixedAsset, data.currencyHeader)}</th>
                    </tr>
                `;
            } else if (obj._id == "29") {

                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(6)}Other Assets (ទ្រព្យសកម្មផ្សេងៗ)</th>
                        <td></td>
                    </tr>
                `;


                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });
                accountList.forEach(function (chartAccDoc) {


                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;
                    let beginingBalClose = chartAccountBalance.find((o) => o.chartAccountId == chartAccDoc._id);
                    if (beginingBalClose) {
                        totalAccount += beginingBalClose.value;
                        totalParent += beginingBalClose.value;
                        totalOtherAsset += beginingBalClose.value;

                    }


                    if (journalDoc) {
                        totalAccount += journalDoc.total;
                        totalOtherAsset += journalDoc.total;
                        if (totalAccount > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(12) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;

                            balanceSheetHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
                        }
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

                            //Closing Entry

                            let findJournalDocClosingEntryByParentId = function (element) {
                                if (childListDocElement.indexOf(element.chartAccountId) > -1) {
                                    totalParent += element.value;
                                }
                            }
                            chartAccountBalance.find(findJournalDocClosingEntryByParentId);

                        }

                        if (totalParent > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(12) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;
                            if (chartAccDoc.level == 0) {
                                balanceSheetHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                            } else {
                                balanceSheetHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                            }
                        }
                    }

                })
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(6)}<u>Total Other Assets​ (សរុបទ្រព្យសកម្មផ្សេងៗ)</u></th>
                        <th>${formatCurrency(totalOtherAsset, data.currencyHeader)}</th>
                    </tr>
                `;

                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">TOTAL ASSETS (សរុបទ្រព្យសកម្ម)</th>
                        <th>${formatCurrency(totalBankAccount + totalAR + totalOtherCurrentAsset + totalFixedAsset + totalOtherAsset, data.currencyHeader)}</th>
                    </tr>
                `;
            } else if (obj._id == "30") {
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">LIABILITIES AND EQUITY (បំណុល និង ទ្រព្យម្ចាស់)</th>
                        <td></td>
                    </tr>
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(6)}Liabilities (បំណុល)</th>
                        <td></td>
                    </tr>`;

                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(12)}Current Liabilities (បំណុលរយៈពេលខ្លី)</th>
                        <td></td>
                    </tr>
                `;

                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(18)}Accounts Payable (ទឹកប្រាក់ត្រូវសងគេ)</th>
                        <td></td>
                    </tr>
                `;


                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });
                accountList.forEach(function (chartAccDoc) {


                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;
                    let beginingBalClose = chartAccountBalance.find((o) => o.chartAccountId == chartAccDoc._id);

                    if (beginingBalClose) {
                        totalAccount += beginingBalClose.value;
                        totalParent += beginingBalClose.value;
                        totalAccountsPayable += beginingBalClose.value;

                    }


                    if (journalDoc) {
                        totalAccount += journalDoc.total;
                        totalAccountsPayable += journalDoc.total;
                        if (totalAccount > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(24) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;

                            balanceSheetHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
                        }
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
                            //Closing Entry

                            let findJournalDocClosingEntryByParentId = function (element) {
                                if (childListDocElement.indexOf(element.chartAccountId) > -1) {
                                    totalParent += element.value;
                                }
                            }
                            chartAccountBalance.find(findJournalDocClosingEntryByParentId);

                        }

                        if (totalParent > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(24) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;
                            if (chartAccDoc.level == 0) {
                                balanceSheetHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                            } else {
                                balanceSheetHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                            }
                        }
                    }

                })
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(18)}<u>Total Accounts Payable (សរុបទឹកប្រាក់ត្រូវសងគេ)</u></th>
                        <th>${formatCurrency(totalAccountsPayable, data.currencyHeader)}</th>
                    </tr>
                `;
            } else if (obj._id == "32") {


                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(18)}Credit Cards (ជំពាក់ធនាគារ)</th>
                        <td></td>
                    </tr>
                `;


                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });
                accountList.forEach(function (chartAccDoc) {


                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;
                    let beginingBalClose = chartAccountBalance.find((o) => o.chartAccountId == chartAccDoc._id);

                    if (beginingBalClose) {
                        totalAccount += beginingBalClose.value;
                        totalParent += beginingBalClose.value;
                        totalCreditCards += beginingBalClose.value;

                    }

                    if (journalDoc) {
                        totalAccount += journalDoc.total;
                        totalCreditCards += journalDoc.total;
                        if (totalAccount > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(24) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;

                            balanceSheetHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
                        }
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

                            //Closing Entry

                            let findJournalDocClosingEntryByParentId = function (element) {
                                if (childListDocElement.indexOf(element.chartAccountId) > -1) {
                                    totalParent += element.value;
                                }
                            }
                            chartAccountBalance.find(findJournalDocClosingEntryByParentId);

                        }

                        if (totalParent > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(24) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;
                            if (chartAccDoc.level == 0) {
                                balanceSheetHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                            } else {
                                balanceSheetHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                            }
                        }
                    }

                })
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(18)}<u>Total Credit Cards (សរុបជំពាក់ធនាគារ)</u></th>
                        <th>${formatCurrency(totalCreditCards, data.currencyHeader)}</th>
                    </tr>
                `;
            } else if (obj._id == "34") {

                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(18)}Other Current Liabilities (បំណុលរយៈពេលខ្លីផ្សេងៗ)</th>
                        <td></td>
                    </tr>
                `;


                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });
                accountList.forEach(function (chartAccDoc) {


                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;
                    let beginingBalClose = chartAccountBalance.find((o) => o.chartAccountId == chartAccDoc._id);
                    if (beginingBalClose) {
                        totalAccount += beginingBalClose.value;
                        totalParent += beginingBalClose.value;
                        totalOtherCurrentLiabilities += beginingBalClose.value;

                    }

                    if (journalDoc) {
                        totalAccount += journalDoc.total;
                        totalOtherCurrentLiabilities += journalDoc.total;
                        if (totalAccount > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(24) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;

                            balanceSheetHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
                        }
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
                                    totalOtherCurrentLiabilities += element.total;
                                }
                            }

                            journalList.find(findJournalDocByParentId);

                            //Closing Entry

                            let findJournalDocClosingEntryByParentId = function (element) {
                                if (childListDocElement.indexOf(element.chartAccountId) > -1) {
                                    totalParent += element.value;
                                    totalOtherCurrentLiabilities += element.value;
                                }
                            }
                            chartAccountBalance.find(findJournalDocClosingEntryByParentId);

                        }

                        if (totalParent > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(24) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;
                            if (chartAccDoc.level == 0) {
                                balanceSheetHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                            } else {
                                balanceSheetHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                            }
                        }
                    }


                })
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(18)}<u>Total Other Current Liabilities​ (សរុបបំណុលរយៈពេលខ្លីផ្សេងៗ)</u></th>
                        <th>${formatCurrency(totalOtherCurrentLiabilities, data.currencyHeader)}</th>
                    </tr>
                `;


                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(12)}<u>Total Current Liabilities (សរុបបំណុលរយៈពេលខ្លី)</u></th>
                        <th>${formatCurrency(totalAccountsPayable + totalCreditCards + totalOtherCurrentLiabilities, data.currencyHeader)}</th>
                    </tr>
                `;
            } else if (obj._id == "36") {

                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(12)}Long Term Liabilities​ (បំណុលរយៈពេលវែង)</th>
                        <td></td>
                    </tr>
                `;


                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });
                accountList.forEach(function (chartAccDoc) {


                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;
                    let beginingBalClose = chartAccountBalance.find((o) => o.chartAccountId == chartAccDoc._id);

                    if (beginingBalClose) {
                        totalAccount += beginingBalClose.value;
                        totalParent += beginingBalClose.value;
                        totalLongTermLiabilities += beginingBalClose.value;

                    }

                    if (journalDoc) {
                        totalAccount += journalDoc.total;
                        totalLongTermLiabilities += journalDoc.total;
                        if (totalAccount > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(18) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;

                            balanceSheetHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
                        }
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
                            //Closing Entry

                            let findJournalDocClosingEntryByParentId = function (element) {
                                if (childListDocElement.indexOf(element.chartAccountId) > -1) {
                                    totalParent += element.value;
                                }
                            }
                            chartAccountBalance.find(findJournalDocClosingEntryByParentId);

                        }

                        if (totalParent > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(18) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;
                            if (chartAccDoc.level == 0) {
                                balanceSheetHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                            } else {
                                balanceSheetHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                            }
                        }
                    }

                })
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(12)}<u>Total Long Term Liabilities (សរុបបំណុលរយៈពេលវែង)</u></th>
                        <th>${formatCurrency(totalLongTermLiabilities, data.currencyHeader)}</th>
                    </tr>
                `;

                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(6)}<u>Total Liabilities (សរុបបំណុល)</u></th>
                        <th>${formatCurrency(totalAccountsPayable + totalCreditCards + totalOtherCurrentLiabilities + totalLongTermLiabilities, data.currencyHeader)}</th>
                    </tr>
                `;
            } else if (obj._id == "40") {

                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(6)}Equity (ទ្រព្យម្ចាស់)</th>
                        <td></td>
                    </tr>
                `;


                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });
                accountList.forEach(function (chartAccDoc) {


                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;
                    let beginingBalClose = chartAccountBalance.find((o) => o.chartAccountId == chartAccDoc._id);

                    if (beginingBalClose) {
                        totalAccount += beginingBalClose.value;
                        totalParent += beginingBalClose.value;
                        totalEquity += beginingBalClose.value;

                    }

                    if (journalDoc) {
                        totalAccount += journalDoc.total;
                        totalEquity += journalDoc.total;
                        if (totalAccount > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(12) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;

                            balanceSheetHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
                        }
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

                            //Closing Entry

                            let findJournalDocClosingEntryByParentId = function (element) {
                                if (childListDocElement.indexOf(element.chartAccountId) > -1) {
                                    totalParent += element.value;
                                }
                            }
                            chartAccountBalance.find(findJournalDocClosingEntryByParentId);

                        }
                        if (totalParent > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(12) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;
                            if (chartAccDoc.level == 0) {
                                balanceSheetHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                            } else {
                                balanceSheetHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                            }
                        }
                    }

                })


            } else if (obj._id == "41") {

                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });
                accountList.forEach(function (chartAccDoc) {


                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;
                    let beginingBalClose = chartAccountBalance.find((o) => o.chartAccountId == chartAccDoc._id);

                    if (beginingBalClose) {
                        totalAccount += beginingBalClose.value;
                        totalParent += beginingBalClose.value;
                        totalEquity += beginingBalClose.value;

                    }

                    if (journalDoc) {


                        totalAccount += journalDoc.total;
                        totalEquity += journalDoc.total;
                        if (totalAccount > 0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(12) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;

                            balanceSheetHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
                        }
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

                            //Closing Entry

                            let findJournalDocClosingEntryByParentId = function (element) {
                                if (childListDocElement.indexOf(element.chartAccountId) > -1) {
                                    totalParent += element.value;
                                }
                            }
                            chartAccountBalance.find(findJournalDocClosingEntryByParentId);

                        }

                        if (totalParent >0) {
                            balanceSheetHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(12) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>
                         
            `;
                            if (chartAccDoc.level == 0) {
                                balanceSheetHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                            } else {
                                balanceSheetHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                            }
                        }
                    }

                })

                selectorNetIncome["accountDoc.accountTypeId"] = {$in: ["50", "51", "60", "61", "70"]};
                let netIncome = Acc_Journal.aggregate([
                    {
                        $unwind: "$transaction"
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
                        $match: selectorNetIncome
                    },

                    {
                        $project: {
                            drcr: {
                                $cond: {
                                    if: {$eq: ['$currencyId', 'USD']},
                                    then: coefficientDrCr.USD,
                                    else: {$cond: [{$eq: ['$currencyId', 'KHR']}, coefficientDrCr.KHR, coefficientDrCr.THB]}
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            balance: {
                                $sum: "$drcr"
                            }
                        }
                    }

                ]);

                if (netIncome[0] && -netIncome[0].balance > 0) {
                    balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(12)}Net Income (ចំណេញសុទ្ធ)</th>
                        <th>${formatCurrency(netIncome[0] && -netIncome[0].balance || 0, data.currencyHeader)}</th>
                    </tr>
                `;
                }

                totalEquity -= netIncome[0] && netIncome[0].balance || 0;
                balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">${SpaceChar.space(6)}<u>Total Equity (សរុបទ្រព្យម្ចាស់)</u></th>
                        <th>${formatCurrency(totalEquity, data.currencyHeader)}</th>
                    </tr>
                `;
            }

        });

        balanceSheetHTML += `
                    <tr>
                        <th style="text-align: left !important;">TOTAL LIABILITIES AND EQUITY (សរុប បំណុល និងទ្រព្យម្ចាស់)</th>
                        <th>${formatCurrency(totalAccountsPayable + totalCreditCards + totalOtherCurrentLiabilities + totalLongTermLiabilities + totalEquity, data.currencyHeader)}</th>
                    </tr>
                `;
        data.balanceSheetHTML = balanceSheetHTML;
        return data;
    }
})
;




