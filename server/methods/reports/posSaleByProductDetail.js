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

Meteor.methods({
    posSaleByProductDetailReport(params, translate) {
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

        let salelList;
        let saleHTML = "";

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
                    $group: {
                        _id: {
                            customerId: "$customerId"
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$item.amount"}
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
                        total: {$sum: "$total"}
                    }
                }
            ]);
            if (salelList.length > 0) {
                salelList[0].data.forEach((obj) => {
                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj.customerDoc.name}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
            `;

                    let bal = 0;
                    let ind = 1;
                    obj.data.forEach((ob) => {
                        bal += ob.item.amount;
                        saleHTML += `
                           <tr>
                                <td style="text-align: center !important;">${ind}</td>
                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${obj.customerDoc.name}</td>
                                <td style="text-align: left !important;">${ob.item.desc || ""}</td>
                                
                                                                <td>${ob.item.qty}</td>
                                <td>${ob.item.unitName || ""}</td>


                                <td>${formatCurrency(ob.item.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(ob.item.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                           
                           </tr>
                    `;
                        ind++;
                    })
                })
                saleHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
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
                }, {
                    $unwind: {
                        path: "$item",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup:
                        {
                            from: "pos_customer",
                            localField: "customerId",
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
                let bal = 0;
                let ind = 1;
                salelList[0].data.forEach((obj) => {
                    obj.data.forEach((ob) => {
                        bal += ob.item.amount;
                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.customerDoc.name}</td>
                                <td style="text-align: left !important;">${ob.item.desc || ""}</td>
                              
                                                                <td>${ob.item.qty}</td>

                                <td>${ob.item.unitName || ""}</td>

                                <td>${formatCurrency(ob.item.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(ob.item.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                           
                           </tr>
                    `;
                        ind++;
                    })
                })
                saleHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
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
                    $lookup:
                        {
                            from: "pos_customer",
                            localField: "customerId",
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
                        _id: {
                            transactionType: "$transactionType"
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
                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.transactionType}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;
                    obj.data.forEach((ob) => {
                        bal += ob.item.amount;
                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.customerDoc.name}</td>
                                <td style="text-align: left !important;">${ob.item.desc || ""}</td>
                                
                                                                <td>${ob.item.qty}</td>
                                <td>${ob.item.unitName || ""}</td>


                                <td>${formatCurrency(ob.item.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(ob.item.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                           
                           </tr>
                    `;
                        ind++;

                    })
                })
                saleHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
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
                    $sort: {
                        "item.itemId": 1
                    }
                },
                {
                    $lookup:
                        {
                            from: "pos_customer",
                            localField: "customerId",
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
                        _id: {
                            itemId: "$item.itemId",
                            itemName: "$item.itemName"
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
                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.itemName}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {
                        bal += ob.item.amount;
                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.customerDoc.name}</td>
                                <td style="text-align: left !important;">${ob.item.desc || ""}</td>
                              
                                                                <td>${ob.item.qty}</td>
                                <td>${ob.item.unitName || ""}</td>

                                <td>${formatCurrency(ob.item.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(ob.item.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                           
                           </tr>
                    `;
                        ind++;
                    })
                })
                saleHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
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
                    $lookup:
                        {
                            from: "pos_customer",
                            localField: "customerId",
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
                        _id: {
                            day: {$dayOfMonth: "$invoiceDate"},
                            month: {$month: "$invoiceDate"},
                            year: {$year: "$invoiceDate"}
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$item.amount"}
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
                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.day}/${obj._id.month}/${obj._id.year}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.customerDoc.name}</td>
                                <td style="text-align: left !important;">${ob.item.desc || ""}</td>
                               
                                                                <td>${ob.item.qty}</td>
                                <td>${ob.item.unitName || ""}</td>

                                <td>${formatCurrency(ob.item.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(ob.item.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                          
                           </tr>
                            `;
                        ind++;
                    })

                })
                saleHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
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
                    $lookup:
                        {
                            from: "pos_customer",
                            localField: "customerId",
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
                        _id: {
                            week: {$week: "$invoiceDate"},
                            month: {$month: "$invoiceDate"},
                            year: {$year: "$invoiceDate"}
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$item.amount"}
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
                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.month}/${obj._id.year} -សប្តាហ៍ ${obj._id.week}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.customerDoc.name}</td>
                                <td style="text-align: left !important;">${ob.item.desc || ""}</td>
                                
                                                                <td>${ob.item.qty}</td>
                                <td>${ob.item.unitName || ""}</td>

                                <td>${formatCurrency(ob.item.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(ob.item.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                          
                           </tr>
                            `;
                        ind++;
                    })
                })
                saleHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
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
                    $lookup:
                        {
                            from: "pos_customer",
                            localField: "customerId",
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
                        _id: {
                            month: {$month: "$invoiceDate"},
                            year: {$year: "$invoiceDate"}
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$item.amount"}
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
                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.month}/${obj._id.year}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.customerDoc.name}</td>
                                <td style="text-align: left !important;">${ob.item.desc || ""}</td>
                                
                                                                <td>${ob.item.qty}</td>
                                <td>${ob.item.unitName || ""}</td>

                                <td>${formatCurrency(ob.item.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(ob.item.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                          
                           </tr>
                            `;
                        ind++;
                    })
                })
                saleHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
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
                    $lookup:
                        {
                            from: "pos_customer",
                            localField: "customerId",
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
                        total: {$sum: "$item.amount"}
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
                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.year}- ត្រីមាស ${obj._id.quarter}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.customerDoc.name}</td>
                                <td style="text-align: left !important;">${ob.item.desc || ""}</td>
                                
                                                                <td>${ob.item.qty}</td>
                                <td>${ob.item.unitName || ""}</td>

                                <td>${formatCurrency(ob.item.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(ob.item.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                          
                           </tr>
                            `;

                        ind++;
                    })
                })
                saleHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
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
                    $lookup:
                        {
                            from: "pos_customer",
                            localField: "customerId",
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
                        _id: {
                            year: {$year: "$invoiceDate"}
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$item.amount"}
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
                    saleHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.year}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        saleHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.invoiceDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.invoiceNo)}</td>
                                <td style="text-align: left !important;">${ob.customerDoc.name}</td>
                                <td style="text-align: left !important;">${ob.item.desc || ""}</td>
                                
                                                                <td>${ob.item.qty}</td>
                                <td>${ob.item.unitName || ""}</td>

                                <td>${formatCurrency(ob.item.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(ob.item.amount, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                          
                           </tr>
                            `;
                        ind++;


                    })
                })
                saleHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(salelList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
            </tr>
`

            }
        }

        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;

        data.saleHTML = saleHTML;
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