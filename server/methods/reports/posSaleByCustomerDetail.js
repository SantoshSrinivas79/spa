import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_Invoice} from '../../../imports/collection/posInvoice';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatNumber} from "../../../imports/api/methods/roundCurrency"
import {Pos_Product} from "../../../imports/collection/posProduct";

Meteor.methods({
    posSaleByCustomerDetailReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        if (params.locationId != "") {
            parameter.locationId = params.locationId;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});

        let newParams = {};
        if (params.categoryId !== "") {
            if (params.productId != "") {
                newParams["item.itemId"] = params.productId;
            } else {
                let productList = Pos_Product.find({categoryId: params.categoryId}).map((obj) => obj._id);
                newParams["item.itemId"] = {$in: productList};
            }
        }

        parameter.invoiceDate = {
            $lte: moment(params.date[1]).endOf("day").toDate(),
            $gte: moment(params.date[0]).startOf("day").toDate()
        };

        let salelList;
        let saleHTML = "";
        let totalQty = 0;

        //Range Date
        if (params.groupBy == "Customer") {
            salelList = Pos_Invoice.aggregate([

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
                    $match: newParams
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

            if (salelList.length > 0) {
                salelList[0].data.forEach((obj) => {
                    saleHTML += `
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
                        bal += ob.item.amount;
                        totalQty += ob.item.qty;
                        balProfit += (ob.item.amount - ob.item.totalCost);
                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.item.itemName && ob.item.itemName.split(":")[1] || ""}</td>
                                <td style="text-align: left !important;">${convertToString(ob.item.imei || [], ob.item.desc || "")}</td>
                               
                                <td>${formatNumber(ob.item.qty)}</td>
                                <td>${ob.item.unitName || ""}</td>


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
                saleHTML += `
            <tr>
                  <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "None") {
            salelList = Pos_Invoice.aggregate([

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
                    $match: newParams
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

            if (salelList.length > 0) {
                let bal = 0;
                let ind = 1;
                let balProfit = 0;

                salelList[0].data.forEach((obj) => {
                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        balProfit += (ob.item.amount - ob.item.totalCost);
                        totalQty += ob.item.qty;
                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.item.itemName && ob.item.itemName.split(":")[1] || ""}</td>
                                <td style="text-align: left !important;">${convertToString(ob.item.imei || [], ob.item.desc || "")}</td>
                        
                                                                <td>${formatNumber(ob.item.qty)}</td>
                                <td>${ob.item.unitName || ""}</td>


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
                saleHTML += `
            <tr>
                  <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }

        }
        else if (params.groupBy == "Transaction Type") {
            salelList = Pos_Invoice.aggregate([

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
                    $match: newParams
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

            if (salelList.length > 0) {
                salelList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.transactionType}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;
                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        balProfit += (ob.item.amount - ob.item.totalCost);
                        totalQty += ob.item.qty;

                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.item.itemName && ob.item.itemName.split(":")[1] || ""}</td>
                                <td style="text-align: left !important;">${convertToString(ob.item.imei || [], ob.item.desc || "")}</td>
                                
                                                                <td>${formatNumber(ob.item.qty)}</td>

                                <td>${ob.item.unitName || ""}</td>

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
                saleHTML += `
            <tr>
                  <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Item") {
            salelList = Pos_Invoice.aggregate([

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
                    $match: newParams
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

            if (salelList.length > 0) {
                salelList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.itemName && obj._id.itemName.split(":")[1] || ""}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {
                        bal += ob.item.amount;
                        balProfit += (ob.item.amount - ob.item.totalCost);
                        totalQty += ob.item.qty;

                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.item.itemName && ob.item.itemName.split(":")[1] || ""}</td>
                                <td style="text-align: left !important;">${convertToString(ob.item.imei || [], ob.item.desc || "")}</td>
                             
                                                                <td>${formatNumber(ob.item.qty)}</td>
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
                saleHTML += `
            <tr>
                  <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Day") {
            salelList = Pos_Invoice.aggregate([

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
                    $match: newParams
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

            if (salelList.length > 0) {
                salelList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.day}/${obj._id.month}/${obj._id.year}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        balProfit += (ob.item.amount - ob.item.totalCost);
                        totalQty += ob.item.qty;

                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.item.itemName && ob.item.itemName.split(":")[1] || ""}</td>
                                <td style="text-align: left !important;">${convertToString(ob.item.imei || [], ob.item.desc || "")}</td>
                           
                                                                <td>${formatNumber(ob.item.qty)}</td>
                                <td>${ob.item.unitName || ""}</td>

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
                saleHTML += `
            <tr>
                  <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Week") {
            salelList = Pos_Invoice.aggregate([

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
                    $match: newParams
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

            if (salelList.length > 0) {
                salelList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.month}/${obj._id.year} -សប្តាហ៍ ${obj._id.week}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        balProfit += (ob.item.amount - ob.item.totalCost);
                        totalQty += ob.item.qty;

                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.item.itemName && ob.item.itemName.split(":")[1] || ""}</td>
                                <td style="text-align: left !important;">${convertToString(ob.item.imei || [], ob.item.desc || "")}</td>
                          
                                                                <td>${formatNumber(ob.item.qty)}</td>
                                <td>${ob.item.unitName || ""}</td>

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
                saleHTML += `
            <tr>
                  <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Month") {
            salelList = Pos_Invoice.aggregate([

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
                    $match: newParams
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

            if (salelList.length > 0) {
                salelList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.month}/${obj._id.year}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        balProfit += (ob.item.amount - ob.item.totalCost);
                        totalQty += ob.item.qty;

                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.item.itemName && ob.item.itemName.split(":")[1] || ""}</td>
                                <td style="text-align: left !important;">${convertToString(ob.item.imei || [], ob.item.desc || "")}</td>
                            
                                                                <td>${formatNumber(ob.item.qty)}</td>
                                <td>${ob.item.unitName || ""}</td>

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
                saleHTML += `
            <tr>
                  <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Quarter") {
            salelList = Pos_Invoice.aggregate([

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
                    $match: newParams
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

            if (salelList.length > 0) {
                salelList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.year}- ត្រីមាស ${obj._id.quarter}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        balProfit += (ob.item.amount - ob.item.totalCost);
                        totalQty += ob.item.qty;

                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.item.itemName && ob.item.itemName.split(":")[1] || ""}</td>
                                <td style="text-align: left !important;">${convertToString(ob.item.imei || [], ob.item.desc || "")}</td>
                             
                                                                <td>${formatNumber(ob.item.qty)}</td>
                                <td>${ob.item.unitName || ""}</td>

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
                saleHTML += `
            <tr>
                  <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Year") {
            salelList = Pos_Invoice.aggregate([

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
                    $match: newParams
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

            if (salelList.length > 0) {
                salelList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balProfit = 0;

                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.year}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        balProfit += (ob.item.amount - ob.item.totalCost);
                        totalQty += ob.item.qty;

                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.item.itemName && ob.item.itemName.split(":")[1] || ""}</td>
                                <td style="text-align: left !important;">${convertToString(ob.item.imei || [], ob.item.desc || "")}</td>
                         
                                                                <td>${formatNumber(ob.item.qty)}</td>
                                <td>${ob.item.unitName || ""}</td>

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
                saleHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                <th>${formatNumber(totalQty)}</th>
                <th colspan="2"></th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }

        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;

        data.saleHTML = saleHTML;
        return data;
    }
});


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


let convertToString = function (arr, desc) {
    if (arr.length > 0) {
        let list = "";
        if (arr && arr.length > 0) {
            arr.forEach((o) => {
                list += `
            <p>${o.name}</p>
        `;
            })
        }
        return list;
    } else {
        return desc;
    }
}
