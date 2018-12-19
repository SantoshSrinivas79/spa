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
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    profitLostReport(params) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});
        let baseCurrency = companyDoc.baseCurrency;
        data.currencyHeader = companyDoc.baseCurrency;

        if (params.currency != "") {
            parameter.currencyId = params.currency;
            baseCurrency = params.currency;
            data.currencyHeader = params.currency;

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
        selectorChartAccount["accountDoc.accountTypeId"] = {$in: ["50", "51", "60", "61", "70"]};


        parameter.journalDate = {
            $lte: moment(params.date[1]).endOf("day").toDate(),
            $gte: moment(params.date[0]).startOf("day").toDate()
        };


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

        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");
        let profitLostHTML = "";
        let selectorProfitLostChartAccount = {};
        selectorProfitLostChartAccount.accountTypeId = {$in: ["50", "51", "60", "61", "70"]};

        let chartAccountParentList = Acc_ChartAccount.aggregate([
            {
                $match: selectorProfitLostChartAccount
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
                $match: selectorProfitLostChartAccount
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

        let totalIncome = 0;
        let totalCOGS = 0;
        let totalExpense = 0
        let totalOtherExpense = 0

        let AccountTypeList = Acc_AccountType.find({_id: {$in: ["50", "51", "60", "61", "70"]}});

        profitLostHTML += `
                    <tr>
                        <th style="text-align: left !important;" colspan="2">INCOME (ចំណូល)</th>
                    </tr>
                    `;

        AccountTypeList.forEach(function (obj) {
            if (["50", "51"].indexOf(obj._id) > -1) {
                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });

                accountList.forEach(function (chartAccDoc) {

                    profitLostHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(12) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>`;
                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;


                    if (journalDoc) {
                        totalAccount += journalDoc.total;
                        totalIncome += journalDoc.total;
                        profitLostHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
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
                        }
                        if (chartAccDoc.level == 0) {
                            profitLostHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                        } else {
                            profitLostHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                        }
                    }

                })
            }
        })


        profitLostHTML += `
                    <tr>
                        <th style="text-align: left !important;">TOTAL INCOME (សរុបចំណូល)</th>
                        <th>${formatCurrency(totalIncome, data.currencyHeader)}</th>
                    </tr>
                `;


        profitLostHTML += `
                    <tr>
                        <th style="text-align: left !important;" colspan="2">COST OF GOODS SOLD (ចំណាយថ្លៃដើម)</th>
                    </tr>
                    `;
        AccountTypeList.forEach(function (obj) {
            if (["70"].indexOf(obj._id) > -1) {
                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });

                accountList.forEach(function (chartAccDoc) {

                    profitLostHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(12) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>`;
                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;


                    if (journalDoc) {
                        totalAccount += journalDoc.total;
                        totalCOGS += journalDoc.total;
                        profitLostHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
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
                        }
                        if (chartAccDoc.level == 0) {
                            profitLostHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                        } else {
                            profitLostHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                        }
                    }

                })
            }
        })
        profitLostHTML += `
                    <tr>
                        <th style="text-align: left !important;">TOTAL COST OF GOODS SOLD​ (សរុបចំណាយថ្លៃដើម)</th>
                        <th>${formatCurrency(totalCOGS, data.currencyHeader)}</th>
                    </tr>
                `;

        profitLostHTML += `
                    <tr>
                        <th style="text-align: left !important;">GROSS PROFIT (ចំណេញដុល)</th>
                        <th>${formatCurrency(totalIncome - totalCOGS, data.currencyHeader)}</th>
                    </tr>
                `;


        profitLostHTML += `
                    <tr>
                        <th style="text-align: left !important;" colspan="2">EXPENSE (ចំណាយ)</th>
                    </tr>
                    `;
        AccountTypeList.forEach(function (obj) {
            if (["60"].indexOf(obj._id) > -1) {
                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });

                accountList.forEach(function (chartAccDoc) {

                    profitLostHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(12) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>`;
                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;


                    if (journalDoc) {
                        totalAccount += journalDoc.total;
                        totalExpense += journalDoc.total;
                        profitLostHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
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
                        }
                        if (chartAccDoc.level == 0) {
                            profitLostHTML += `<th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                            </tr>
                        `
                        } else {
                            profitLostHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                        }
                    }

                })
            }
        })

        profitLostHTML += `
                    <tr>
                        <th style="text-align: left !important;">TOTAL EXPENSE (សរុបចំណាយ)</th>
                        <th>${formatCurrency(totalExpense, data.currencyHeader)}</th>
                    </tr>
                `;
        profitLostHTML += `
                    <tr>
                        <th style="text-align: left !important;">NET OPERATING INCOME (ចំណេញក្រោយដកចំណាយប្រតិបត្តការ)</th>
                        <th>${formatCurrency(totalIncome - totalCOGS - totalExpense, data.currencyHeader)}</th>
                    </tr>
                `;
        profitLostHTML += `
                    <tr>
                        <th style="text-align: left !important;" colspan="2">OTHER EXPENSE (ចំណាយផ្សេងៗ)</th>
                    </tr>
                `;


        AccountTypeList.forEach(function (obj) {
            if (["61"].indexOf(obj._id) > -1) {
                let accountList = chartAccountList.filter(function (newDoc) {
                    if (newDoc.accountTypeId == obj._id) {
                        return newDoc;
                    }
                });

                accountList.forEach(function (chartAccDoc) {

                    profitLostHTML += `
                                <td style="text-align: left !important;">${SpaceChar.space(12) + SpaceChar.space(chartAccDoc.level * 6) + chartAccDoc.code} : ${chartAccDoc.name}</td>`;
                    let findJournalDocByChartAccountId = function (element) {
                        if (element._id.accountDoc._id == chartAccDoc._id) {
                            return element;
                        }
                    }
                    let journalDoc = journalList.find(findJournalDocByChartAccountId);
                    let totalParent = 0;
                    let totalAccount = 0;


                    if (journalDoc) {
                        totalAccount += journalDoc.total;
                        totalOtherExpense += journalDoc.total;
                        profitLostHTML += `
                        <td>${formatCurrency(totalAccount, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `;
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
                        }
                        if (chartAccDoc.level == 0) {
                            profitLostHTML += `
                        <th>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</th>
                    </tr>
                `
                        } else {
                            profitLostHTML += `
                        <td>${formatCurrency(totalParent, data.currencyHeader) + SpaceChar.space(chartAccDoc.level * 15)}</td>
                    </tr>
                `
                        }
                    }

                })
            }
        })


        profitLostHTML += `
                    <tr>
                        <th style="text-align: left !important;">TOTAL OTHER EXPENSE (សរុបចំណាយផ្សេងៗ)</th>
                        <th>${formatCurrency(totalOtherExpense, data.currencyHeader)}</th>
                    </tr>
                `;
        profitLostHTML += `
                    <tr>
                        <th style="text-align: left !important;">NET INCOME (ចំណេញសុទ្ធ)</th>
                        <th>${formatCurrency(totalIncome - totalCOGS - totalExpense - totalOtherExpense, data.currencyHeader)}</th>
                    </tr>
                `;


        data.profitLostHTML = profitLostHTML;

        return data;
    }
})
;

