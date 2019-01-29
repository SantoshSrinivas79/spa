import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_Bill} from '../../../imports/collection/posBill';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posPurchaseByProductDetailReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        if (params.locationId != "") {
            parameter.locationId = params.locationId;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});


        parameter.billDate = {
            $lte: moment(params.date[1]).endOf("day").toDate(),
            $gte: moment(params.date[0]).startOf("day").toDate()
        };

        let purchaseList;
        let purchaseHTML = "";

        //Range Date
        if (params.groupBy == "Vendor") {
            purchaseList = Pos_Bill.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        billDate: 1
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
                            vendorId: "$vendorId"
                        },
                        data: {$push: "$$ROOT"},
                        total: {$sum: "$item.amount"}
                    }
                },
                {
                    $lookup:
                        {
                            from: "pos_vendor",
                            localField: "_id.vendorId",
                            foreignField: "_id",
                            as: "vendorDoc"
                        }
                },
                {
                    $unwind: {
                        path: "$vendorDoc",
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
            if (purchaseList.length > 0) {
                purchaseList[0].data.forEach((obj) => {
                    purchaseHTML += `
                    <tr>
                    
                            <td style="text-align: left !important;" colspan="9">${obj.vendorDoc.name}</td>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
            `;

                    let bal = 0;
                    let ind = 1;
                    obj.data.forEach((ob) => {
                        bal += ob.item.amount;
                        purchaseHTML += `
                           <tr>
                                                                                               <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.billDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.billNo)}</td>
                                <td style="text-align: left !important;">${obj.vendorDoc.name}</td>
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
                purchaseHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(purchaseList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "None") {
            purchaseList = Pos_Bill.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        billDate: 1
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
                            from: "pos_vendor",
                            localField: "vendorId",
                            foreignField: "_id",
                            as: "vendorDoc"
                        }
                },
                {
                    $unwind: {
                        path: "$vendorDoc",
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

            if (purchaseList.length > 0) {
                let bal = 0;
                let ind = 1;
                purchaseList[0].data.forEach((obj) => {
                    obj.data.forEach((ob) => {
                        bal += ob.item.amount;
                        purchaseHTML += `
                           <tr>
                                                                                               <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.billDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.billNo)}</td>
                                <td style="text-align: left !important;">${ob.vendorDoc.name}</td>
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
                purchaseHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(purchaseList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
            </tr>
`

            }

        }
        else if (params.groupBy == "Transaction Type") {
            purchaseList = Pos_Bill.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        billDate: 1
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
                            from: "pos_vendor",
                            localField: "vendorId",
                            foreignField: "_id",
                            as: "vendorDoc"
                        }
                },
                {
                    $unwind: {
                        path: "$vendorDoc",
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

            if (purchaseList.length > 0) {
                purchaseList[0].data.forEach((obj) => {
                    let bal = 0;
                    purchaseHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.transactionType}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;
                    let ind = 1;
                    obj.data.forEach((ob) => {
                        bal += ob.item.amount;
                        purchaseHTML += `
                           <tr>
                                                                                               <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.billDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.billNo)}</td>
                                <td style="text-align: left !important;">${ob.vendorDoc.name}</td>
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
                purchaseHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(purchaseList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Item") {
            purchaseList = Pos_Bill.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        billDate: 1
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
                            from: "pos_vendor",
                            localField: "vendorId",
                            foreignField: "_id",
                            as: "vendorDoc"
                        }
                },
                {
                    $unwind: {
                        path: "$vendorDoc",
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

            if (purchaseList.length > 0) {
                purchaseList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    purchaseHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.itemName && obj._id.itemName.split(":")[1] || ""}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {
                        bal += ob.item.amount;
                        purchaseHTML += `
                           <tr>
                                                                                               <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.billDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.billNo)}</td>
                                <td style="text-align: left !important;">${ob.vendorDoc.name}</td>
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
                purchaseHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(purchaseList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Day") {
            purchaseList = Pos_Bill.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        billDate: 1
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
                            from: "pos_vendor",
                            localField: "vendorId",
                            foreignField: "_id",
                            as: "vendorDoc"
                        }
                },
                {
                    $unwind: {
                        path: "$vendorDoc",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $group: {
                        _id: {
                            day: {$dayOfMonth: "$billDate"},
                            month: {$month: "$billDate"},
                            year: {$year: "$billDate"}
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

            if (purchaseList.length > 0) {
                purchaseList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    purchaseHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.day}/${obj._id.month}/${obj._id.year}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        purchaseHTML += `
                           <tr>
                                                                                               <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.billDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.billNo)}</td>
                                <td style="text-align: left !important;">${ob.vendorDoc.name}</td>
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
                purchaseHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(purchaseList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Week") {
            purchaseList = Pos_Bill.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        billDate: 1
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
                            from: "pos_vendor",
                            localField: "vendorId",
                            foreignField: "_id",
                            as: "vendorDoc"
                        }
                },
                {
                    $unwind: {
                        path: "$vendorDoc",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: {
                            week: {$week: "$billDate"},
                            month: {$month: "$billDate"},
                            year: {$year: "$billDate"}
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

            if (purchaseList.length > 0) {
                purchaseList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    purchaseHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.month}/${obj._id.year} -សប្តាហ៍ ${obj._id.week}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        purchaseHTML += `
                           <tr>
                                                                                               <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.billDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.billNo)}</td>
                                <td style="text-align: left !important;">${ob.vendorDoc.name}</td>
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
                purchaseHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(purchaseList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Month") {
            purchaseList = Pos_Bill.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        billDate: 1
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
                            from: "pos_vendor",
                            localField: "vendorId",
                            foreignField: "_id",
                            as: "vendorDoc"
                        }
                },
                {
                    $unwind: {
                        path: "$vendorDoc",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: {
                            month: {$month: "$billDate"},
                            year: {$year: "$billDate"}
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

            if (purchaseList.length > 0) {
                purchaseList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    purchaseHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.month}/${obj._id.year}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        purchaseHTML += `
                           <tr>
                                                                                               <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.billDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.billNo)}</td>
                                <td style="text-align: left !important;">${ob.vendorDoc.name}</td>
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
                purchaseHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(purchaseList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Quarter") {
            purchaseList = Pos_Bill.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        billDate: 1
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
                            from: "pos_vendor",
                            localField: "vendorId",
                            foreignField: "_id",
                            as: "vendorDoc"
                        }
                },
                {
                    $unwind: {
                        path: "$vendorDoc",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: {
                            quarter: {
                                $cond: [{$lte: [{$month: "$billDate"}, 3]},
                                    1,
                                    {
                                        $cond: [{$lte: [{$month: "$billDate"}, 6]},
                                            2,
                                            {
                                                $cond: [{$lte: [{$month: "$billDate"}, 9]},
                                                    3,
                                                    4]
                                            }]
                                    }]
                            },
                            year: {$year: "$billDate"}
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

            if (purchaseList.length > 0) {
                purchaseList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    purchaseHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.year}- ត្រីមាស ${obj._id.quarter}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        purchaseHTML += `
                           <tr>
                                                                                               <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.billDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.billNo)}</td>
                                <td style="text-align: left !important;">${ob.vendorDoc.name}</td>
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
                purchaseHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(purchaseList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Year") {
            purchaseList = Pos_Bill.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        billDate: 1
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
                            from: "pos_vendor",
                            localField: "vendorId",
                            foreignField: "_id",
                            as: "vendorDoc"
                        }
                },
                {
                    $unwind: {
                        path: "$vendorDoc",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: {
                            year: {$year: "$billDate"}
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

            if (purchaseList.length > 0) {
                purchaseList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    purchaseHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="9">${obj._id.year}</th>
                            <th>${formatCurrency(obj.total, companyDoc.baseCurrency)}</th>
                            <td></td>
                    </tr>
            
                    `;

                    obj.data.forEach((ob) => {

                        bal += ob.item.amount;
                        purchaseHTML += `
                           <tr>
                                                                                               <td style="text-align: center !important;">${ind}</td>
                                <td>${moment(ob.billDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.billNo)}</td>
                                <td style="text-align: left !important;">${ob.vendorDoc.name}</td>
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
                purchaseHTML += `
            <tr>
                <th colspan="9">${translate['grandTotal']}</th>
                 <th>${formatCurrency(purchaseList[0].total, companyDoc.baseCurrency)}</th>
                 <td></td>
            </tr>
`

            }
        }

        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY") + " - " + moment(params.date[1]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;

        data.purchaseHTML = purchaseHTML;
        return data;
    }
})
;

function getVoucherSubString(billNo) {
    let newBill = billNo.length > 9 ? parseInt((billNo || "0000000000000").substr(9, 13)) : parseInt(billNo || "0");
    return pad(newBill, 6);
}

function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}