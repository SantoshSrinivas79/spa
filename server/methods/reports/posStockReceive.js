import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_Invoice} from '../../../imports/collection/posInvoice';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient, formatNumber} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posStockReceiveReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        if (params.locationId != "") {
            parameter.locationId = params.locationId;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});


        parameter.invoiceDate = {
            $lte: moment(params.date[1]).endOf("day").toDate(),
            $gte: moment(params.date[0]).startOf("day").toDate()
        };
        parameter.transactionType = "Invoice Sale Order";

        let stockReceiveList;
        let stockReceiveHTML = "";
        let totalQty = 0;
        //Range Date
        if (params.groupBy == "Customer") {
            stockReceiveList = Pos_Invoice.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        invoiceDate: 1
                    }
                },
                {
                    $group: {
                        _id: {
                            customerId: "$customerId"
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"},
                        discountValue: {$sum: "$discountValue"},
                        netTotal: {$sum: "$netTotal"},
                    }
                },
                {
                    $lookup:
                        {
                            from: "pos_customer",
                            localField: "_id.customerId",
                            foreignField: "_id",
                            as: "customerDoc"
                        }
                },
                {
                    $unwind: {
                        path: "$customerDoc",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"},
                        netTotal: {$sum: "$netTotal"},
                        discountValue: {$sum: "$discountValue"},
                    }
                }
            ]);
            if (stockReceiveList.length > 0) {
                stockReceiveList[0].data.forEach((obj) => {
                    stockReceiveHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj.customerDoc.name}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
            `;

                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;
                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                            bal += o.amount;
                            totalQty += o.qty;
                            balProfit += (o.amount - o.totalCost);
                            stockReceiveHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                               
                                <td>${o.qty}</td>
                                <td>${o.unitName || ""}</td>


                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.amount - o.totalCost, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(balProfit, companyDoc.baseCurrency)}</td>        
                           </tr>
                    `;
                            ind++;
                        })
                    })
                })
                stockReceiveHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(stockReceiveList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "None") {
            stockReceiveList = Pos_Invoice.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        invoiceDate: 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"},
                        discountValue: {$sum: "$discountValue"},
                        netTotal: {$sum: "$netTotal"},
                    }
                },
                {
                    $group: {
                        _id: null,
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"},
                        netTotal: {$sum: "$netTotal"},
                        discountValue: {$sum: "$discountValue"},
                    }
                }
            ])

            if (stockReceiveList.length > 0) {
                let bal = 0;
                let ind = 1;
                let balProfit = 0;

                stockReceiveList[0].data.forEach((obj) => {
                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                            bal += o.amount;
                            totalQty += o.qty;

                            balProfit += (o.amount - o.totalCost);

                            stockReceiveHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                        
                                                                <td>${o.qty}</td>
                                <td>${o.unitName || ""}</td>


                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td> 
                                <td>${formatCurrency(o.amount - o.totalCost, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(balProfit, companyDoc.baseCurrency)}</td>        
                           
                           
                           </tr>
                    `;
                            ind++;
                        })
                    })
                })
                stockReceiveHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(stockReceiveList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }

        }
        else if (params.groupBy == "Transaction Type") {
            stockReceiveList = Pos_Invoice.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        invoiceDate: 1
                    }
                },
                {
                    $group: {
                        _id: {
                            transactionType: "$transactionType"
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"},
                        discountValue: {$sum: "$discountValue"},
                        netTotal: {$sum: "$netTotal"},
                    }
                },
                {
                    $group: {
                        _id: null,
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"},
                        netTotal: {$sum: "$netTotal"},
                        discountValue: {$sum: "$discountValue"},
                    }
                }
            ])

            if (stockReceiveList.length > 0) {
                stockReceiveList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    stockReceiveHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.transactionType}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;
                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                            bal += o.amount;
                            totalQty += o.qty;

                            balProfit += (o.amount - o.totalCost);

                            stockReceiveHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                                
                                                                <td>${o.qty}</td>

                                <td>${o.unitName || ""}</td>

                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                            <td>${formatCurrency(o.amount - o.totalCost, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(balProfit, companyDoc.baseCurrency)}</td>        
                           
                           </tr>
                    `;
                            ind++;
                        })
                    })
                })
                stockReceiveHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(stockReceiveList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Item") {
            stockReceiveList = Pos_Invoice.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        invoiceDate: 1
                    }
                },
                {
                    $unwind: {
                        path: "$item",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $sort: {
                        "item.itemId": 1
                    }
                },
                {
                    $group: {
                        _id: {
                            itemId: "$item.itemId",
                            itemName: "$item.itemName",
                            unitName: "$item.unitName"
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$item.amount"}
                    }
                },
                {
                    $group: {
                        _id: null,
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"}
                    }
                }
            ])

            if (stockReceiveList.length > 0) {
                stockReceiveList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    stockReceiveHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.itemName}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {
                        bal += ob.item.amount;
                        balProfit += (ob.item.amount - ob.item.totalCost);
                        totalQty += ob.item.qty;

                        stockReceiveHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.item.itemName}</td>
                                <td style="text-align: left !important;">${ob.item.desc || ""}</td>
                             
                                                                <td>${ob.item.qty}</td>
                                <td>${obj._id.unitName || ""}</td>

                                <td>${formatCurrency(ob.item.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(ob.item.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(ob.item.amount - ob.item.totalCost, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(balProfit, companyDoc.baseCurrency)}</td>        
                           
                           </tr>
                    `;
                        ind++;
                    })
                })
                stockReceiveHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(stockReceiveList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Day") {
            stockReceiveList = Pos_Invoice.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        invoiceDate: 1
                    }
                },

                {
                    $group: {
                        _id: {
                            day: {$dayOfMonth: "$invoiceDate"},
                            month: {$month: "$invoiceDate"},
                            year: {$year: "$invoiceDate"}
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"}
                    }
                },
                {$sort: {"_id.year": 1, "_id.month": 1, "_id.day": 1}},
                {
                    $group: {
                        _id: null,
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"}
                    }
                }
            ])

            if (stockReceiveList.length > 0) {
                stockReceiveList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    stockReceiveHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.day}/${obj._id.month}/${obj._id.year}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                            bal += o.amount;
                            balProfit += (o.amount - o.totalCost);
                            totalQty += o.qty;

                            stockReceiveHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                           
                                                                <td>${o.qty}</td>
                                <td>${o.unitName || ""}</td>

                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.amount - o.totalCost, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(balProfit, companyDoc.baseCurrency)}</td>        
                           
                           </tr>
                            `;
                            ind++;
                        })
                    })
                })
                stockReceiveHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(stockReceiveList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Week") {
            stockReceiveList = Pos_Invoice.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        invoiceDate: 1
                    }
                },

                {
                    $group: {
                        _id: {
                            week: {$week: "$invoiceDate"},
                            month: {$month: "$invoiceDate"},
                            year: {$year: "$invoiceDate"}
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"}
                    }
                },
                {$sort: {"_id.year": 1, "_id.month": 1, "_id.week": 1}},
                {
                    $group: {
                        _id: null,
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"}
                    }
                }
            ])

            if (stockReceiveList.length > 0) {
                stockReceiveList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    stockReceiveHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.month}/${obj._id.year} -សប្តាហ៍ ${obj._id.week}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                            bal += o.amount;
                            balProfit += (o.amount - o.totalCost);
                            totalQty += o.qty;

                            stockReceiveHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                          
                                                                <td>${o.qty}</td>
                                <td>${o.unitName || ""}</td>

                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                           <td>${formatCurrency(o.amount - o.totalCost, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(balProfit, companyDoc.baseCurrency)}</td>        
                           
                          
                                
                           </tr>
                            `;
                            ind++;
                        })
                    })
                })
                stockReceiveHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(stockReceiveList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Month") {
            stockReceiveList = Pos_Invoice.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        invoiceDate: 1
                    }
                },

                {
                    $group: {
                        _id: {
                            month: {$month: "$invoiceDate"},
                            year: {$year: "$invoiceDate"}
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"}
                    }
                },
                {$sort: {"_id.year": 1, "_id.month": 1}},
                {
                    $group: {
                        _id: null,
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"}
                    }
                }
            ])

            if (stockReceiveList.length > 0) {
                stockReceiveList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    stockReceiveHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.month}/${obj._id.year}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                            bal += o.amount;
                            balProfit += (o.amount - o.totalCost);
                            totalQty += o.qty;

                            stockReceiveHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                            
                                                                <td>${o.qty}</td>
                                <td>${o.unitName || ""}</td>

                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                           <td>${formatCurrency(o.amount - o.totalCost, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(balProfit, companyDoc.baseCurrency)}</td>        
                           
                           </tr>
                            `;
                            ind++;
                        })
                    })
                })
                stockReceiveHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(stockReceiveList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Quarter") {
            stockReceiveList = Pos_Invoice.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        invoiceDate: 1
                    }
                },

                {
                    $group: {
                        _id: {
                            quarter: {
                                $cond: [{$lte: [{$month: "$invoiceDate"}, 3]},
                                    1,
                                    {
                                        $cond: [{$lte: [{$month: "$invoiceDate"}, 6]},
                                            2,
                                            {
                                                $cond: [{$lte: [{$month: "$invoiceDate"}, 9]},
                                                    3,
                                                    4]
                                            }]
                                    }]
                            },
                            year: {$year: "$invoiceDate"}
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"}
                    }
                },
                {$sort: {"_id.year": 1, "_id.quarter": 1}},
                {
                    $group: {
                        _id: null,
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"}
                    }
                }
            ])

            if (stockReceiveList.length > 0) {
                stockReceiveList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    stockReceiveHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.year}- ត្រីមាស ${obj._id.quarter}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                            bal += o.amount;
                            balProfit += (o.amount - o.totalCost);
                            totalQty += o.qty;

                            stockReceiveHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                             
                                                                <td>${o.qty}</td>
                                <td>${o.unitName || ""}</td>

                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                           <td>${formatCurrency(o.amount - o.totalCost, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(balProfit, companyDoc.baseCurrency)}</td>        
                           
                           </tr>
                            `;
                            ind++;
                        })
                    })
                })
                stockReceiveHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(stockReceiveList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Year") {
            stockReceiveList = Pos_Invoice.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        invoiceDate: 1
                    }
                },

                {
                    $group: {
                        _id: {
                            year: {$year: "$invoiceDate"}
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"}
                    }
                },
                {$sort: {"_id.year": 1, "_id.quarter": 1}},
                {
                    $group: {
                        _id: null,
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$total"}
                    }
                }
            ])

            if (stockReceiveList.length > 0) {
                stockReceiveList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    stockReceiveHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.year}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                            bal += o.amount;
                            totalQty += o.qty;

                            balProfit += (o.amount - o.totalCost);
                            stockReceiveHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                         
                                                                <td>${o.qty}</td>
                                <td>${o.unitName || ""}</td>

                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                           <td>${formatCurrency(o.amount - o.totalCost, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(balProfit, companyDoc.baseCurrency)}</td>        
                           
                           </tr>
                            `;
                            ind++;
                        })
                    })
                })
                stockReceiveHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(stockReceiveList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }

        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;

        data.stockReceiveHTML = stockReceiveHTML;
        return data;
    }
})
;


function getVoucherSubString(invoiceNo) {
    let newInvoice = invoiceNo.length > 9 ? parseInt((invoiceNo || "0000000000000").substr(9, 13)) : parseInt(invoiceNo || "0");
    return pad(newInvoice, 6);
}

function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}
