import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_SaleOrder} from '../../../imports/collection/posSaleOrder';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient, formatNumber} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    posStockDebtReport(params, translate) {
        let parameter = {};

        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        if (params.locationId != "") {
            parameter.locationId = params.locationId;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});


        parameter.saleOrderDate = {
            $lte: moment(params.date).endOf("day").toDate()
        };

        /*parameter.$or = [
            {status: {$ne: "Complete"}},
            {updatedAt: {$gte: moment(params.date).endOf("day").toDate()}}
        ];*/

        parameter.receiveStatus = {$ne: "Complete"};

        let saleOrderList;
        let saleOrderHTML = "";
        let total = 0;
        let totalQty = 0;

        //Range Date
        if (params.groupBy == "Customer") {
            saleOrderList = Pos_SaleOrder.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        saleOrderDate: 1
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

            if (saleOrderList.length > 0) {
                saleOrderList[0].data.forEach((obj) => {
                    let saleOrderTemp = "";

                    let bal = 0;
                    let ind = 1;
                    let balQty = 0;

                    obj.data.forEach((ob) => {

                        ob.item.forEach((o) => {
                            let remainQty = o.qty - (o.receive || 0);
                            totalQty += remainQty;
                            balQty += remainQty;
                            if (remainQty > 0) {
                                bal += o.price * remainQty;
                                saleOrderTemp += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.saleOrderDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.saleOrderNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                               
                                <td>${remainQty}</td>
                                <td>${o.unitName || ""}</td>


                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.price * remainQty, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                                 
                           </tr>
                    `;
                                ind++;
                            }
                        })
                    })

                    total += bal;
                    saleOrderHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="6">${obj.customerDoc.name}</th>
                          <th>${formatNumber(balQty)}</th>
                            <th colspan="2"></th>
                            <th>${formatCurrency(bal, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
            `;

                    saleOrderHTML += saleOrderTemp;
                })


                saleOrderHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                 <th>${formatNumber(totalQty)}</th>
                            <th colspan="2"></th>
                 <th>${formatCurrency(total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "None") {
            saleOrderList = Pos_SaleOrder.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        saleOrderDate: 1
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

            if (saleOrderList.length > 0) {
                let bal = 0;
                let ind = 1;


                saleOrderList[0].data.forEach((obj) => {

                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                                let remainQty = o.qty - (o.receive || 0);
                                totalQty += remainQty;

                                if (remainQty > 0) {

                                    bal += o.price * remainQty;

                                    saleOrderHTML += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.saleOrderDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.saleOrderNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                        
                                                                <td>${remainQty}</td>
                                <td>${o.unitName || ""}</td>


                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.price * remainQty, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td> 
                             
                           
                           
                           </tr>
                    `;
                                    ind++;
                                }
                            }
                        )
                    })
                })

                total = bal;
                saleOrderHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                 <th>${formatNumber(totalQty)}</th>
                            <th colspan="2"></th>
                 <th>${formatCurrency(total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }

        }
        else if (params.groupBy == "Transaction Type") {
            saleOrderList = Pos_SaleOrder.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        saleOrderDate: 1
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

            if (saleOrderList.length > 0) {
                saleOrderList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let balQty = 0;

                    let saleOrderTemp = "";


                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                            let remainQty = o.qty - (o.receive || 0);
                            totalQty += remainQty;
                            balQty += remainQty;

                            if (remainQty > 0) {

                                bal += o.price * remainQty;

                                saleOrderTemp += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.saleOrderDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.saleOrderNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                                
                                                                <td>${remainQty}</td>

                                <td>${o.unitName || ""}</td>

                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.price * remainQty, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                        
                           
                           </tr>
                    `;
                                ind++;
                            }
                        })
                    })

                    saleOrderHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="6">${obj._id.transactionType}</th>
                            <th>${formatNumber(balQty)}</th>
                            <th colspan="2"></th>
                            <th>${formatCurrency(bal, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    saleOrderHTML += saleOrderTemp;
                    total += bal;
                })
                saleOrderHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                 <th>${formatNumber(totalQty)}</th>
                            <th colspan="2"></th>
                 <th>${formatCurrency(total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Item") {
            saleOrderList = Pos_SaleOrder.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        saleOrderDate: 1
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

            if (saleOrderList.length > 0) {
                saleOrderList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let saleOrderTemp = "";
                    let balQty = 0;


                    obj.data.forEach((ob) => {
                            let remainQty = ob.item.qty - (ob.item.receive || 0);
                            totalQty += remainQty;
                        balQty += remainQty;

                            if (remainQty > 0) {

                                bal += ob.item.price * remainQty;

                                saleOrderTemp += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.saleOrderDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.saleOrderNo)}</td>
                                <td style="text-align: left !important;">${ob.item.itemName}</td>
                                <td style="text-align: left !important;">${ob.item.desc || ""}</td>
                             
                                                                <td>${remainQty}</td>
                                <td>${obj._id.unitName || ""}</td>

                                <td>${formatCurrency(ob.item.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(ob.item.price * remainQty, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                       
                           
                           </tr>
                    `;
                                ind++;
                            }
                        }
                    )

                    saleOrderHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="6">${obj._id.itemName}</th>
                            <th>${formatNumber(balQty)}</th>
                            <th colspan="2"></th>
                            <th>${formatCurrency(bal, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    saleOrderHTML += saleOrderTemp;
                    total += bal;
                })
                saleOrderHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                 <th>${formatNumber(totalQty)}</th>
                            <th colspan="2"></th>
                 <th>${formatCurrency(total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Day") {
            saleOrderList = Pos_SaleOrder.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        saleOrderDate: 1
                    }
                },

                {
                    $group: {
                        _id: {
                            day: {$dayOfMonth: "$saleOrderDate"},
                            month: {$month: "$saleOrderDate"},
                            year: {$year: "$saleOrderDate"}
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

            if (saleOrderList.length > 0) {
                saleOrderList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let saleOrderTemp = "";
                    let balQty = 0;


                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                                let remainQty = o.qty - (o.receive || 0);
                                totalQty += remainQty;
                            balQty += remainQty;

                                if (remainQty > 0) {

                                    bal += o.price * remainQty;


                                    saleOrderTemp += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.saleOrderDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.saleOrderNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                           
                                                                <td>${remainQty}</td>
                                <td>${o.unitName || ""}</td>

                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.price * remainQty, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                 
                           
                           </tr>
                            `;
                                    ind++;
                                }
                            }
                        )
                    })

                    saleOrderHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="6">${obj._id.day}/${obj._id.month}/${obj._id.year}</th>
                            <th>${formatNumber(balQty)}</th>
                            <th colspan="2"></th>
                            <th>${formatCurrency(bal, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;
                    saleOrderHTML += saleOrderTemp;
                    total += bal;

                })
                saleOrderHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                 <th>${formatNumber(totalQty)}</th>
                            <th colspan="2"></th>
                 <th>${formatCurrency(total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Week") {
            saleOrderList = Pos_SaleOrder.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        saleOrderDate: 1
                    }
                },

                {
                    $group: {
                        _id: {
                            week: {$week: "$saleOrderDate"},
                            month: {$month: "$saleOrderDate"},
                            year: {$year: "$saleOrderDate"}
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

            if (saleOrderList.length > 0) {
                saleOrderList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;

                    let saleOrderTemp = "";
                    let balQty = 0;


                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                            let remainQty = o.qty - (o.receive || 0);
                            totalQty += remainQty;
                            balQty += remainQty;

                            if (remainQty > 0) {

                                bal += o.price * remainQty;
                                saleOrderTemp += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.saleOrderDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.saleOrderNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                          
                                                                <td>${remainQty}</td>
                                <td>${o.unitName || ""}</td>

                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.price * remainQty, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                 
                           
                          
                                
                           </tr>
                            `;
                                ind++;
                            }
                        })
                    })

                    saleOrderHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="6">${obj._id.month}/${obj._id.year} -សប្តាហ៍ ${obj._id.week}</th>
                            <th>${formatNumber(balQty)}</th>
                            <th colspan="2"></th>
                            <th>${formatCurrency(bal, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;
                    saleOrderHTML += saleOrderTemp;
                    total += bal;

                })
                saleOrderHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                 <th>${formatNumber(totalQty)}</th>
                            <th colspan="2"></th>
                 <th>${formatCurrency(total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Month") {
            saleOrderList = Pos_SaleOrder.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        saleOrderDate: 1
                    }
                },

                {
                    $group: {
                        _id: {
                            month: {$month: "$saleOrderDate"},
                            year: {$year: "$saleOrderDate"}
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

            if (saleOrderList.length > 0) {
                saleOrderList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;
                    let saleOrderTemp = "";
                    let balQty = 0;


                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                                let remainQty = o.qty - (o.receive || 0);
                                totalQty += remainQty;
                            balQty += remainQty;

                                if (remainQty > 0) {

                                    bal += o.price * remainQty;

                                    saleOrderTemp += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.saleOrderDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.saleOrderNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                            
                                                                <td>${remainQty}</td>
                                <td>${o.unitName || ""}</td>

                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.price * remainQty, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
          
                           
                           </tr>
                            `;
                                    ind++;
                                }
                            }
                        )
                    })

                    saleOrderHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="6">${obj._id.month}/${obj._id.year}</th>
                            <th>${formatNumber(balQty)}</th>
                            <th colspan="2"></th>
                            <th>${formatCurrency(bal, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;
                    saleOrderHTML += saleOrderTemp;
                    total += bal;

                })
                saleOrderHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                 <th>${formatNumber(totalQty)}</th>
                            <th colspan="2"></th>
                 <th>${formatCurrency(total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Quarter") {
            saleOrderList = Pos_SaleOrder.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        saleOrderDate: 1
                    }
                },

                {
                    $group: {
                        _id: {
                            quarter: {
                                $cond: [{$lte: [{$month: "$saleOrderDate"}, 3]},
                                    1,
                                    {
                                        $cond: [{$lte: [{$month: "$saleOrderDate"}, 6]},
                                            2,
                                            {
                                                $cond: [{$lte: [{$month: "$saleOrderDate"}, 9]},
                                                    3,
                                                    4]
                                            }]
                                    }]
                            },
                            year: {$year: "$saleOrderDate"}
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

            if (saleOrderList.length > 0) {
                saleOrderList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;

                    let saleOrderTemp = "";
                    let balQty = 0;


                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                            let remainQty = o.qty - (o.receive || 0);
                            totalQty += remainQty;
                            balQty += remainQty;

                            if (remainQty > 0) {

                                bal += o.price * remainQty;

                                saleOrderTemp += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.saleOrderDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.saleOrderNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                             
                                                                <td>${remainQty}</td>
                                <td>${o.unitName || ""}</td>

                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.price * remainQty, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                     
                           
                           </tr>
                            `;
                                ind++;
                            }
                        })
                    })
                    saleOrderHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="6">${obj._id.year}- ត្រីមាស ${obj._id.quarter}</th>
                            <th>${formatNumber(balQty)}</th>
                            <th colspan="2"></th>
                            <th>${formatCurrency(bal, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;
                    saleOrderHTML += saleOrderTemp;
                    total += bal;

                })
                saleOrderHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                 <th>${formatNumber(totalQty)}</th>
                            <th colspan="2"></th>
                 <th>${formatCurrency(total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }
        else if (params.groupBy == "Year") {
            saleOrderList = Pos_SaleOrder.aggregate([

                {
                    $match: parameter
                },
                {
                    $sort: {
                        saleOrderDate: 1
                    }
                },

                {
                    $group: {
                        _id: {
                            year: {$year: "$saleOrderDate"}
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

            if (saleOrderList.length > 0) {
                saleOrderList[0].data.forEach((obj) => {
                    let bal = 0;
                    let ind = 1;

                    let saleOrderTemp = "";
                    let balQty = 0;


                    obj.data.forEach((ob) => {
                        ob.item.forEach((o) => {
                            let remainQty = o.qty - (o.receive || 0);
                            totalQty += remainQty;
                            balQty += remainQty;

                            if (remainQty > 0) {

                                bal += o.price * remainQty;
                                saleOrderTemp += `
                           <tr>
                                                       <td style="text-align: center !important;">${ind}</td>

                                <td>${moment(ob.saleOrderDate).format("DD/MM/YYYY")}</td>
                                <td>${ob.transactionType || ""}</td>
                                <td>${getVoucherSubString(ob.saleOrderNo)}</td>
                                <td style="text-align: left !important;">${o.itemName}</td>
                                <td style="text-align: left !important;">${o.desc || ""}</td>
                         
                                                                <td>${remainQty}</td>
                                <td>${o.unitName || ""}</td>

                                <td>${formatCurrency(o.price, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(o.price * remainQty, companyDoc.baseCurrency)}</td>
                                <td>${formatCurrency(bal, companyDoc.baseCurrency)}</td>
                   
                           
                           </tr>
                            `;
                                ind++;
                            }
                        })
                    })

                    saleOrderHTML += `
                    <tr>
                            <th style="text-align: left !important;" colspan="6">${obj._id.year}</th>
                            <th>${formatNumber(balQty)}</th>
                            <th colspan="2"></th>
                            <th>${formatCurrency(bal, companyDoc.baseCurrency)}</th>
                            <td colspan="3"></td>
                    </tr>
            
                    `;

                    saleOrderHTML += saleOrderTemp;
                    total += bal;
                })
                saleOrderHTML += `
            <tr>
                <th colspan="6">${translate['grandTotal']}</th>
                 <th>${formatNumber(totalQty)}</th>
                            <th colspan="2"></th>
                 <th>${formatCurrency(total, companyDoc.baseCurrency)}</th>
                 <td colspan="3"></td>
            </tr>
`

            }
        }

        data.dateHeader = moment(params.date[0]).format("DD/MM/YYYY");
        data.currencyHeader = companyDoc.baseCurrency;

        data.saleOrderHTML = saleOrderHTML;
        return data;
    }
})
;


function getVoucherSubString(saleOrderNo) {
    let newSaleOrder = saleOrderNo.length > 9 ? parseInt((saleOrderNo || "0000000000000").substr(9, 13)) : parseInt(saleOrderNo || "0");
    return pad(newSaleOrder, 6);
}

function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}
