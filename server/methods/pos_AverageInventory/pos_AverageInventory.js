import {Pos_Bill} from '../../../imports/collection/posBill';
import {Pos_Invoice} from '../../../imports/collection/posInvoice';
import {Pos_TransferInventory} from '../../../imports/collection/posTransferInventory';
import {Pos_PayBill} from '../../../imports/collection/posPayBill';
import {Pos_Vendor} from '../../../imports/collection/posVendor';
import {Pos_Customer} from '../../../imports/collection/posCustomer';
import {Pos_AverageInventory} from '../../../imports/collection/posAverageInventory';

import {SpaceChar} from "../../../both/config.js/space"
import {formatCurrency, formatCurrencyLast, getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency";
import {WB_waterBillingSetup} from "../../../imports/collection/waterBillingSetup";
import {Pos_Product} from "../../../imports/collection/posProduct";
import {Pos_Location} from "../../../imports/collection/posLocation";
import {Acc_Journal} from "../../../imports/collection/accJournal";
import {Acc_ChartAccount} from "../../../imports/collection/accChartAccount";
import numeral from "numeral";

Meteor.methods({
    addPosAverageInventory(data) {

        if (data.transactionType === "Bill") {
            data.item.forEach((doc) => {
                let obj = {};
                let onHandInventory = Pos_AverageInventory.findOne({
                    itemId: doc.itemId,
                    locationId: data.locationId,
                    rolesArea: data.rolesArea
                }, {sort: {createdAt: -1}});
                let vendorDoc = Pos_Vendor.findOne({_id: data.vendorId});
                obj = {
                    cusVendId: data.vendorId,
                    cusVendName: vendorDoc && vendorDoc.name || "",
                    transactionId: data.id,
                    locationId: data.locationId,
                    averageInventoryDate: data.billDate,
                    averageInventoryDateName: data.billDateName,
                    itemId: doc.itemId,
                    qty: doc.qty,
                    price: doc.cost,
                    amount: doc.amount,
                    amountEnding: (onHandInventory && onHandInventory.amountEnding || 0) + doc.amount,
                    qtyEnding: (onHandInventory && onHandInventory.qtyEnding || 0) + doc.qty,
                    averageCost: (onHandInventory && onHandInventory.qtyEnding || 0) + doc.qty == 0 ? 0 : ((onHandInventory && onHandInventory.amountEnding || 0) + doc.amount) / ((onHandInventory && onHandInventory.qtyEnding || 0) + doc.qty),
                    transactionType: "Bill",
                    rolesArea: data.rolesArea
                };

                Pos_AverageInventory.insert(obj);

            })


            //Integrated To Account===============================================================================================
            let companyDoc = WB_waterBillingSetup.findOne({});
            if (companyDoc.integratedPosAccount === true) {

                if (data.total > 0) {
                    let cashAcc = Acc_ChartAccount.findOne({mapToAccount: "005"});
                    let apAcc = Acc_ChartAccount.findOne({mapToAccount: "008"});
                    let purchaseDiscountAcc = Acc_ChartAccount.findOne({mapToAccount: "012"});
                    let inventoryAcc = Acc_ChartAccount.findOne({mapToAccount: "007"});


                    let venDoc = Pos_Vendor.findOne({_id: data.vendorId});

                    let journalDoc = {};
                    journalDoc.journalDate = data.billDate;
                    journalDoc.journalDateName = moment(data.billDate).format("DD/MM/YYYY");
                    journalDoc.currencyId = companyDoc.baseCurrency;
                    journalDoc.memo = "ទិញទំនិញពី " + venDoc.name;
                    journalDoc.rolesArea = data.rolesArea;
                    journalDoc.closingEntryId = data.id;
                    journalDoc.status = "Bill";
                    journalDoc.refId = data.id;
                    journalDoc.total = numeral(formatCurrencyLast(data.total, companyDoc.baseCurrency)).value();

                    let transaction = [];


                    if (data.total > 0) {
                        transaction.push({
                            account: inventoryAcc._id,
                            dr: data.total,
                            cr: 0,
                            drcr: data.total
                        });
                    }
                    if (data.paid > 0) {
                        transaction.push({
                            account: cashAcc._id,
                            dr: 0,
                            cr: data.paid,
                            drcr: -data.paid
                        });
                    }
                    if (data.discountValue > 0) {
                        transaction.push({
                            account: purchaseDiscountAcc._id,
                            dr: 0,
                            cr: data.discountValue,
                            drcr: -data.discountValue
                        });
                    }

                    transaction.push({
                        account: apAcc._id,
                        dr: 0,
                        cr: data.netTotal - data.paid,
                        drcr: -(data.netTotal - data.paid)
                    });


                    journalDoc.transaction = transaction;
                    Meteor.call("insertJournal", journalDoc);

                }
            }


        } else if (data.transactionType === "Invoice") {

            let avgCost = 0;
            data.item.forEach((doc) => {
                let obj = {};
                let onHandInventory = Pos_AverageInventory.findOne({
                    itemId: doc.itemId,
                    locationId: data.locationId,
                    rolesArea: data.rolesArea
                }, {sort: {createdAt: -1}});

                let customerDoc = Pos_Customer.findOne({_id: data.customerId});

                obj = {
                    cusVendId: data.customerId,
                    cusVendName: customerDoc && customerDoc.name || "",

                    transactionId: data.id,
                    locationId: data.locationId,
                    averageInventoryDate: data.invoiceDate,
                    averageInventoryDateName: data.invoiceDateName,
                    itemId: doc.itemId,
                    qty: doc.qty,
                    price: doc.price,
                    amount: doc.amount,
                    amountEnding: (onHandInventory && onHandInventory.amountEnding || 0) - ((onHandInventory && onHandInventory.averageCost || 0) * doc.qty),
                    qtyEnding: (onHandInventory && onHandInventory.qtyEnding || 0) - doc.qty,
                    averageCost: onHandInventory && onHandInventory.averageCost || 0,
                    transactionType: "Invoice",
                    rolesArea: data.rolesArea,
                    profit: doc.amount - ((onHandInventory && onHandInventory.averageCost || 0) * doc.qty)
                };

                avgCost += obj.averageCost;

                let isInsrt = Pos_AverageInventory.insert(obj);
                if (isInsrt) {
                    Pos_Invoice.direct.update({
                        _id: data.id,
                        "item.itemId": doc.itemId
                    }, {
                        $set: {
                            "item.$.cost": onHandInventory && onHandInventory.averageCost || 0,
                            "item.$.totalCost": (onHandInventory && onHandInventory.averageCost || 0) * doc.qty
                        }
                    });
                }
            })


            //Integrated To Account===============================================================================================
            let companyDoc = WB_waterBillingSetup.findOne({});
            if (companyDoc.integratedPosAccount === true) {
                let cashAcc = Acc_ChartAccount.findOne({mapToAccount: "005"});
                let arrAcc = Acc_ChartAccount.findOne({mapToAccount: "006"});
                let saleDiscountAcc = Acc_ChartAccount.findOne({mapToAccount: "011"});
                let saleIncomeAcc = Acc_ChartAccount.findOne({mapToAccount: "009"});
                let cogsAcc = Acc_ChartAccount.findOne({mapToAccount: "010"});
                let inventoryAcc = Acc_ChartAccount.findOne({mapToAccount: "007"});


                let cusDoc = Pos_Customer.findOne({_id: data.customerId});

                let journalDoc = {};
                journalDoc.journalDate = data.invoiceDate;
                journalDoc.journalDateName = moment(data.invoiceDate).format("DD/MM/YYYY");
                journalDoc.currencyId = companyDoc.baseCurrency;
                journalDoc.memo = cusDoc.name + " ទិញទំនិញ";
                journalDoc.rolesArea = data.rolesArea;
                journalDoc.closingEntryId = data.id;
                journalDoc.status = "Invoice";
                journalDoc.refId = data.id;
                journalDoc.total = numeral(formatCurrencyLast(data.total + avgCost, companyDoc.baseCurrency)).value();

                avgCost = formatCurrencyLast(avgCost, companyDoc.baseCurrency);
                let transaction = [];
                if (data.paid > 0) {
                    transaction.push({
                        account: cashAcc._id,
                        dr: data.paid,
                        cr: 0,
                        drcr: data.paid
                    });
                }

                if (data.netTotal - data.paid > 0) {
                    transaction.push({
                        account: arrAcc._id,
                        dr: data.netTotal - data.paid,
                        cr: 0,
                        drcr: data.netTotal - data.paid
                    });
                }
                if (data.discountValue > 0) {
                    transaction.push({
                        account: saleDiscountAcc._id,
                        dr: data.discountValue,
                        cr: 0,
                        drcr: data.discountValue
                    });
                }

                transaction.push({
                    account: saleIncomeAcc._id,
                    dr: 0,
                    cr: data.total,
                    drcr: -data.total
                });

                if (avgCost > 0) {
                    transaction.push({
                        account: cogsAcc._id,
                        dr: avgCost,
                        cr: 0,
                        drcr: avgCost
                    });


                    transaction.push({
                        account: inventoryAcc._id,
                        dr: 0,
                        cr: avgCost,
                        drcr: -avgCost
                    });
                }

                journalDoc.transaction = transaction;
                Meteor.call("insertJournal", journalDoc);

            }


        } else if (data.transactionType === "Transfer Inventory") {
            data.item.forEach((doc) => {
                //Reduce From Location
                let obj = {};
                let onHandInventory = Pos_AverageInventory.findOne({
                    itemId: doc.itemId,
                    locationId: data.locationFromId,
                    rolesArea: data.rolesArea
                }, {sort: {createdAt: -1}});

                let locationToDoc = Pos_Location.findOne({_id: data.locationToId});
                doc.amount = numeral(doc.amount).value();
                obj = {
                    cusVendId: data.locationToId,
                    cusVendName: locationToDoc && locationToDoc.name || "",

                    transactionId: data.id,
                    locationId: data.locationFromId,
                    averageInventoryDate: data.transferInventoryDate,
                    averageInventoryDateName: data.transferInventoryDateName,
                    itemId: doc.itemId,
                    qty: doc.qty,
                    price: onHandInventory.averageCost || 0,
                    amount: (onHandInventory.averageCost || 0) * doc.qty,
                    amountEnding: (onHandInventory && onHandInventory.amountEnding || 0) - ((onHandInventory && onHandInventory.averageCost || 0) * doc.qty),
                    qtyEnding: (onHandInventory && onHandInventory.qtyEnding || 0) - doc.qty,
                    averageCost: onHandInventory && onHandInventory.averageCost || 0,
                    transactionType: "Transfer From",
                    rolesArea: data.rolesArea,
                    profit: 0
                };

                let isInsrt = Pos_AverageInventory.insert(obj);
                if (isInsrt) {
                    Pos_TransferInventory.direct.update({
                        _id: data.id,
                        "item.itemId": doc.itemId,
                        locationFromId: data.locationFromId,
                        locationToIdId: data.locationToIdId,
                    }, {
                        $set: {
                            "item.$.cost": onHandInventory && onHandInventory.averageCost || 0,
                            "item.$.amount": (onHandInventory && onHandInventory.averageCost || 0) * doc.qty
                        }
                    });
                }

                //Add To Location
                let objTo = {};
                let onHandInventoryTo = Pos_AverageInventory.findOne({
                    itemId: doc.itemId,
                    locationId: data.locationToId,
                    rolesArea: data.rolesArea
                }, {sort: {createdAt: -1}});

                let locationFromDoc = Pos_Location.findOne({_id: data.locationFromId});

                objTo = {
                    cusVendId: data.locationFromId,
                    cusVendName: locationFromDoc && locationFromDoc.name || "",

                    transactionId: data.id,
                    locationId: data.locationToId,
                    averageInventoryDate: data.transferInventoryDate,
                    averageInventoryDateName: data.transferInventoryDateName,
                    itemId: doc.itemId,
                    qty: doc.qty,
                    price: onHandInventory && onHandInventory.averageCost || 0,
                    amount: (onHandInventory && onHandInventory.averageCost || 0) * doc.qty,
                    amountEnding: (onHandInventoryTo && onHandInventoryTo.amountEnding || 0) + ((onHandInventory.averageCost || 0) * doc.qty),
                    qtyEnding: (onHandInventoryTo && onHandInventoryTo.qtyEnding || 0) + doc.qty,
                    averageCost: (onHandInventoryTo && onHandInventoryTo.qtyEnding || 0) + doc.qty === 0 ? 0 : ((onHandInventoryTo && onHandInventoryTo.amountEnding || 0) + ((onHandInventory && onHandInventory.averageCost || 0) * doc.qty)) / ((onHandInventoryTo && onHandInventoryTo.qtyEnding || 0) + doc.qty),
                    transactionType: "Transfer To",
                    rolesArea: data.rolesArea
                };

                let isInsrtTo = Pos_AverageInventory.insert(objTo);

            })
        } else if (data.transactionType === "Convert Inventory") {
            let locationDoc = Pos_Location.findOne({_id: data.locationId});
            let obj = {};
            let onHandInventory = Pos_AverageInventory.findOne({
                itemId: data.productId,
                locationId: data.locationId,
                rolesArea: data.rolesArea
            }, {sort: {createdAt: -1}});

            obj = {
                cusVendId: data.locationId,
                cusVendName: locationDoc && locationDoc.name || "",

                transactionId: data.id,
                locationId: data.locationId,
                averageInventoryDate: data.date,
                averageInventoryDateName: data.dateName,
                itemId: data.productId,
                qty: data.qty,
                price: onHandInventory && onHandInventory.averageCost || 0,
                amount: (onHandInventory && onHandInventory.averageCost || 0) * data.qty,
                amountEnding: (onHandInventory && onHandInventory.amountEnding || 0) - ((onHandInventory && onHandInventory.averageCost || 0) * data.qty),
                qtyEnding: (onHandInventory && onHandInventory.qtyEnding || 0) - data.qty,
                averageCost: onHandInventory && onHandInventory.averageCost || 0,
                transactionType: "Convert Inventory From",
                rolesArea: data.rolesArea,
                profit: 0
            };

            let isInsrt = Pos_AverageInventory.insert(obj);

            if (data && data.convert.length > 0) {
                data.convert.forEach((doc) => {
                    //Add To Location
                    let objTo = {};
                    let onHandInventoryTo = Pos_AverageInventory.findOne({
                        itemId: doc.productId,
                        locationId: data.locationId,
                        rolesArea: data.rolesArea
                    }, {sort: {createdAt: -1}});

                    objTo = {
                        cusVendId: data.locationId,
                        cusVendName: locationDoc && locationDoc.name || "",

                        transactionId: data.id,
                        locationId: data.locationId,
                        averageInventoryDate: data.date,
                        averageInventoryDateName: data.dateName,
                        itemId: doc.productId,
                        qty: doc.qty,
                        price: onHandInventory && onHandInventory.averageCost || 0,
                        amount: (onHandInventory && onHandInventory.averageCost || 0) * doc.qty,
                        amountEnding: (onHandInventoryTo && onHandInventoryTo.amountEnding || 0) + ((onHandInventory && onHandInventory.averageCost || 0) * doc.qty),
                        qtyEnding: (onHandInventoryTo && onHandInventoryTo.qtyEnding || 0) + doc.qty,
                        averageCost: (onHandInventoryTo && onHandInventoryTo.qtyEnding || 0) + doc.qty === 0 ? 0 : ((onHandInventoryTo && onHandInventoryTo.amountEnding || 0) + ((onHandInventory.averageCost || 0) * doc.qty)) / ((onHandInventoryTo && onHandInventoryTo.qtyEnding || 0) + doc.qty),
                        transactionType: "Convert Inventory To",
                        rolesArea: data.rolesArea
                    };

                    let isInsrtTo = Pos_AverageInventory.insert(objTo);

                })
            }
        }


    },
    reducePosAverageInventory(data) {
        if (data.transactionType === "Remove Bill") {
            data.item.forEach((doc) => {
                let obj = {};
                let onHandInventory = Pos_AverageInventory.findOne({
                    itemId: doc.itemId,
                    locationId: data.locationId,
                    rolesArea: data.rolesArea
                }, {sort: {createdAt: -1}});
                let vendorDoc = Pos_Vendor.findOne({_id: onHandInventory.cusVendId});

                obj = {
                    cusVendId: onHandInventory.cusVendId,
                    cusVendName: vendorDoc && vendorDoc.name || "",
                    transactionId: onHandInventory._id,
                    locationId: onHandInventory.locationId,
                    averageInventoryDate: onHandInventory.averageInventoryDate,
                    averageInventoryDateName: onHandInventory.averageInventoryDateName,
                    itemId: doc.itemId,
                    qty: onHandInventory.qty,
                    price: onHandInventory.price,
                    amount: onHandInventory.amount,
                    amountEnding: (onHandInventory && onHandInventory.amountEnding || 0) - doc.amount,
                    qtyEnding: (onHandInventory && onHandInventory.qtyEnding || 0) - doc.qty,
                    averageCost: (onHandInventory && onHandInventory.qtyEnding || 0) - doc.qty === 0 ? 0 : ((onHandInventory && onHandInventory.amountEnding || 0) - doc.amount) / ((onHandInventory && onHandInventory.qtyEnding || 0) - doc.qty),
                    transactionType: "Remove Bill",
                    rolesArea: data.rolesArea
                };

                Pos_AverageInventory.insert(obj);
            })


            //Integrated To Account===============================================================================================
            let companyDoc = WB_waterBillingSetup.findOne({});
            if (companyDoc.integratedPosAccount === true) {
                Acc_Journal.remove({refId: data._id, status: "Bill"});
            }

        } else if (data.transactionType === "Remove Invoice") {
            data.item.forEach((doc) => {
                let obj = {};
                let onHandInventory = Pos_AverageInventory.findOne({
                    itemId: doc.itemId,
                    locationId: data.locationId,
                    rolesArea: data.rolesArea
                }, {sort: {createdAt: -1}});
                let customerDoc = Pos_Customer.findOne({_id: onHandInventory.cusVendId});
                obj = {
                    cusVendId: onHandInventory.cusVendId,
                    cusVendName: customerDoc && customerDoc.name || "",

                    transactionId: onHandInventory._id,
                    locationId: onHandInventory.locationId,
                    averageInventoryDate: onHandInventory.averageInventoryDate,
                    averageInventoryDateName: onHandInventory.averageInventoryDateName,
                    itemId: doc.itemId,
                    qty: onHandInventory.qty,
                    price: onHandInventory.price,
                    amount: onHandInventory.amount,
                    amountEnding: (onHandInventory && onHandInventory.amountEnding || 0) + doc.totalCost,
                    qtyEnding: (onHandInventory && onHandInventory.qtyEnding || 0) + doc.qty,
                    averageCost: (onHandInventory && onHandInventory.qtyEnding || 0) + doc.qty === 0 ? 0 : ((onHandInventory && onHandInventory.amountEnding || 0) + doc.totalCost) / ((onHandInventory && onHandInventory.qtyEnding || 0) + doc.qty),
                    transactionType: "Remove Invoice",
                    rolesArea: data.rolesArea
                };

                Pos_AverageInventory.insert(obj);
            })

            //Integrated To Account===============================================================================================
            let companyDoc = WB_waterBillingSetup.findOne({});
            if (companyDoc.integratedPosAccount === true) {
                Acc_Journal.remove({refId: data._id, status: "Invoice"});
            }

        } else if (data.transactionType === "Remove Transfer Inventory") {
            data.item.forEach((doc) => {
                //Reduce From Location
                let objTo = {};
                let onHandInventoryTo = Pos_AverageInventory.findOne({
                    itemId: doc.itemId,
                    locationId: data.locationToId,
                    rolesArea: data.rolesArea
                }, {sort: {createdAt: -1}});

                let locationFromDoc = Pos_Location.findOne({_id: data.locationFromId});
                doc.amount = numeral(doc.amount).value();

                objTo = {
                    cusVendId: data.locationFromId,
                    cusVendName: locationFromDoc && locationFromDoc.name || "",

                    transactionId: onHandInventoryTo._id,
                    locationId: data.locationToId,
                    averageInventoryDate: data.transferInventoryDate,
                    averageInventoryDateName: data.transferInventoryDateName,
                    itemId: doc.itemId,
                    qty: doc.qty,
                    price: doc.cost,
                    amount: doc.amount,
                    amountEnding: (onHandInventoryTo && onHandInventoryTo.amountEnding || 0) - (doc.cost * doc.qty),
                    qtyEnding: (onHandInventoryTo && onHandInventoryTo.qtyEnding || 0) - doc.qty,
                    averageCost: (onHandInventoryTo && onHandInventoryTo.qtyEnding || 0) - doc.qty === 0 ? 0 : ((onHandInventoryTo && onHandInventoryTo.amountEnding || 0) - doc.amount) / ((onHandInventoryTo && onHandInventoryTo.qtyEnding || 0) - doc.qty),
                    transactionType: "Remove Transfer To",
                    rolesArea: data.rolesArea
                };

                let isInsrtTo = Pos_AverageInventory.insert(objTo);

                //Add To Location
                let obj = {};
                let onHandInventory = Pos_AverageInventory.findOne({
                    itemId: doc.itemId,
                    locationId: data.locationFromId,
                    rolesArea: data.rolesArea
                }, {sort: {createdAt: -1}});

                let locationToDoc = Pos_Location.findOne({_id: data.locationToId});

                obj = {
                    cusVendId: data.locationToId,
                    cusVendName: locationToDoc && locationToDoc.name || "",

                    transactionId: onHandInventory._id,
                    locationId: data.locationFromId,
                    averageInventoryDate: data.transferInventoryDate,
                    averageInventoryDateName: data.transferInventoryDateName,
                    itemId: doc.itemId,
                    qty: doc.qty,
                    price: doc.cost,
                    amount: doc.amount,
                    amountEnding: (onHandInventory && onHandInventory.amountEnding || 0) + (doc.cost * doc.qty),
                    qtyEnding: (onHandInventory && onHandInventory.qtyEnding || 0) + doc.qty,
                    averageCost: (onHandInventory && onHandInventory.qtyEnding || 0) + doc.qty == 0 ? 0 : ((onHandInventory && onHandInventory.amountEnding || 0) + doc.amount) / ((onHandInventory && onHandInventory.qtyEnding || 0) + doc.qty),
                    transactionType: "Remove Transfer From",
                    rolesArea: data.rolesArea
                };

                let isInsrt = Pos_AverageInventory.insert(obj);


            })
        } else if (data.transactionType === "Remove Convert Inventory") {
            let locationDoc = Pos_Location.findOne({_id: data.locationId});
            let obj = {};
            let onHandInventory = Pos_AverageInventory.findOne({
                itemId: data.productId,
                locationId: data.locationId,
                rolesArea: data.rolesArea
            }, {sort: {createdAt: -1}});

            obj = {
                cusVendId: data.locationId,
                cusVendName: locationDoc && locationDoc.name || "",

                transactionId: data.id,
                locationId: data.locationId,
                averageInventoryDate: data.date,
                averageInventoryDateName: data.dateName,
                itemId: data.productId,
                qty: data.qty,
                price: onHandInventory.averageCost || 0,
                amount: (onHandInventory.averageCost || 0) * data.qty,
                amountEnding: (onHandInventory && onHandInventory.amountEnding || 0) + ((onHandInventory && onHandInventory.averageCost || 0) * data.qty),
                qtyEnding: (onHandInventory && onHandInventory.qtyEnding || 0) + data.qty,
                averageCost: onHandInventory && onHandInventory.averageCost || 0,
                transactionType: "Remove Convert Inventory From",
                rolesArea: data.rolesArea,
                profit: 0
            };

            let isInsrt = Pos_AverageInventory.insert(obj);

            if (data && data.convert.length > 0) {
                data.convert.forEach((doc) => {
                    //Add To Location
                    let objTo = {};
                    let onHandInventoryTo = Pos_AverageInventory.findOne({
                        itemId: doc.productId,
                        locationId: data.locationId,
                        rolesArea: data.rolesArea
                    }, {sort: {createdAt: -1}});

                    objTo = {
                        cusVendId: data.locationId,
                        cusVendName: locationDoc && locationDoc.name || "",

                        transactionId: data.id,
                        locationId: data.locationId,
                        averageInventoryDate: data.date,
                        averageInventoryDateName: data.dateName,
                        itemId: doc.productId,
                        qty: doc.qty,
                        price: onHandInventory.averageCost || 0,
                        amount: (onHandInventory.averageCost || 0) * doc.qty,
                        amountEnding: (onHandInventoryTo && onHandInventoryTo.amountEnding || 0) - ((onHandInventory.averageCost || 0) * doc.qty),
                        qtyEnding: (onHandInventoryTo && onHandInventoryTo.qtyEnding || 0) - doc.qty,
                        averageCost: (onHandInventoryTo && onHandInventoryTo.qtyEnding || 0) - doc.qty === 0 ? 0 : ((onHandInventoryTo && onHandInventoryTo.amountEnding || 0) - ((onHandInventory.averageCost || 0) * doc.qty)) / ((onHandInventoryTo && onHandInventoryTo.qtyEnding || 0) - doc.qty),
                        transactionType: "Remove Convert Inventory To",
                        rolesArea: data.rolesArea
                    };

                    let isInsrtTo = Pos_AverageInventory.insert(objTo);

                })
            }
        }
    },
    queryPosAverageCostById(id, rolesArea, locationId) {
        let data = Pos_AverageInventory.findOne({
            itemId: id,
            rolesArea: rolesArea,
            locationId: locationId,
        }, {sort: {createdAt: -1}});
        if (data) {
            let productDoc = Pos_Product.findOne({_id: id}, {name: 1, code: 1})
            data.name = productDoc && productDoc.name || "";
            data.code = productDoc && productDoc.code || "";
            data.itemId = productDoc && productDoc._id || "";
        }
        return data && data.qtyEnding > 0 ? data : false;
    },

    checkStockBalance(data, isUpdate, dataBeforeUpdate) {
        if (data.item.length > 0) {
            let i = 0;
            data.item.forEach((doc) => {
                let onHandInventory = Pos_AverageInventory.findOne({
                    itemId: doc.itemId,
                    locationId: data.locationId,
                    rolesArea: data.rolesArea
                }, {sort: {createdAt: -1}});
                if (isUpdate === true) {
                    let oldDoc = dataBeforeUpdate.item.find(function (element) {
                        return element.itemId === doc.itemId;
                    });
                    if (onHandInventory === undefined || onHandInventory && onHandInventory.qtyEnding < doc.qty - oldDoc.qty) {
                        i++;
                    }
                } else {
                    if (onHandInventory === undefined || onHandInventory && onHandInventory.qtyEnding < doc.qty) {
                        i++;
                    }
                }
            });
            return i;
        }
    },
    fixStock() {
        let billList = Pos_Bill.find().fetch();
        billList.forEach((data) => {
            data.id = data._id;
            data.transactionType = "Bill";
            Meteor.call("addPosAverageInventory", data, (err, result) => {
                if (err) {
                    console.log(err.message);
                }
            })
        });
        console.log("Finish Bill");


        let transferList = Pos_TransferInventory.find().fetch();

        transferList.forEach((data) => {
            data.id = data._id;
            data.transactionType = "Transfer Inventory";
            Meteor.call("addPosAverageInventory", data, (err, result) => {
                if (err) {
                    console.log(err.message);
                }
            })
        });
        console.log("Finish Transfer");


        let invoiceList = Pos_Invoice.find().fetch();
        invoiceList.forEach((data) => {
            data.id = data._id;
            data.transactionType = "Invoice";


            Meteor.call("addPosAverageInventory", data, (err, result) => {
                if (err) {
                    console.log(err.message);

                }
            })
        });
        console.log("Finish Invoice");
    }
});


function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}