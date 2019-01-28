import {Pos_Invoice} from '../../../imports/collection/posInvoice';
import {Pos_InvoiceReact} from '../../../imports/collection/posInvoice';
import {Pos_Customer, Pos_CustomerReact} from '../../../imports/collection/posCustomer';

import {SpaceChar} from "../../../both/config.js/space"
import {Pos_ReceivePayment} from "../../../imports/collection/posReceivePayment";
import {Acc_Journal} from "../../../imports/collection/accJournal";
import {Acc_ChartAccount} from "../../../imports/collection/accChartAccount";
import {formatCurrency} from "../../../imports/api/methods/roundCurrency";
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency";

import {WB_waterBillingSetup} from "../../../imports/collection/waterBillingSetup";
import {Pos_Bill} from "../../../imports/collection/posBill";
import {Pos_SaleOrder} from "../../../imports/collection/posSaleOrder";
import numeral from 'numeral';
import {Pos_Vendor} from "../../../imports/collection/posVendor";
import {Pos_ImeiBill} from "../../../imports/collection/posImeiBill";
import {Pos_ImeiInvoice} from "../../../imports/collection/posImeiInvoice";

Meteor.methods({
    queryPosInvoice({q, filter, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countPosInvoice: 0,
            };


            let companyDoc = WB_waterBillingSetup.findOne({});

            let selector = {};
            if (!!q) {
                let reg = new RegExp(q);
                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {
                    let customerList = Pos_Customer.find({
                            name: {
                                $regex: reg,
                                $options: 'mi'
                            }
                        }, {_id: true},
                        {
                            $limit: options.limit
                        },
                        {
                            $skip: options.skip
                        }).fetch().map((obj) => {
                        return obj._id;
                    });

                    selector.$or = [{invoiceNo: {$regex: reg, $options: 'mi'}}, {
                        code: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }, {
                        invoiceDateName: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }, {
                        total: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }, {
                        status: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }, {customerId: {$in: customerList}}];
                }
            }
            let posInvoices = Pos_Invoice.aggregate([
                {
                    $match: selector
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $limit: options.limit
                },
                {
                    $skip: options.skip
                },
                {
                    $lookup: {
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
                }
            ]).map((obj) => {
                obj.total = formatCurrency(obj.total, companyDoc.baseCurrency) + getCurrencySymbolById(companyDoc.baseCurrency);
                return obj;
            });
            if (posInvoices.length > 0) {
                data.content = posInvoices;
                let posInvoiceTotal = Pos_Invoice.find(selector).count();
                data.countPosInvoice = posInvoiceTotal;
            }
            return data;
        }
    },
    queryPosInvoiceById(id) {
        let data = Pos_Invoice.findOne({_id: id});
        data.invoiceNo = data && data.invoiceNo.length > 9 ? parseInt((data && data.invoiceNo || "0000000000000").substr(9, 13)) : parseInt(data && data.invoiceNo || "0");
        data.invoiceNo = pad(data.invoiceNo, 6);
        data.item.forEach((obj) => {
            obj.amount = formatCurrency(obj.amount);
            return obj;
        })
        return data;
    },
    queryPosInvoiceByIdShow(id) {
        let data = Pos_Invoice.findOne({_id: id});
        data.invoiceNo = data && data.invoiceNo.length > 9 ? parseInt((data && data.invoiceNo || "0000000000000").substr(9, 13)) : parseInt(data && data.invoiceNo || "0");
        data.invoiceNo = pad(data.invoiceNo, 6);

        let companyDoc = WB_waterBillingSetup.findOne({});
        data.total = formatCurrency(data.total, companyDoc.baseCurrency) + getCurrencySymbolById(companyDoc.baseCurrency);
        data.item.map(function (obj) {
            obj.price = formatCurrency(obj.price, companyDoc.baseCurrency) + getCurrencySymbolById(companyDoc.baseCurrency);
            obj.amount = formatCurrency(obj.amount, companyDoc.baseCurrency) + getCurrencySymbolById(companyDoc.baseCurrency);
            return obj;
        });
        return data;
    },
    insertPosInvoice(data, isReceiveItem) {
        let checkBalance = Meteor.call("checkStockBalance", data);
        if (checkBalance > 0) {
            throw new Meteor.Error(checkBalance + " items is not enough stock");
        }

        data.transactionType = (data.netTotal - data.paid) > 0 ? "Invoice" : "Sale Receipt";


        data.transactionType = isReceiveItem === true ? "Invoice Sale Order" : data.transactionType;
        data.invoiceNo = data.rolesArea + "-" + moment(data.invoiceDate).format("YYYY") + pad(data.invoiceNo, 6);

        if (data.transactionType === "Sale Receipt" && data.tableId) {
            Meteor.call("updatePosTableStatus", data.tableId, false);
        }

        data.item.forEach((obj) => {
            obj.amount = numeral(obj.amount).value();
            obj.price = numeral(obj.price).value();
            obj.cost = numeral(obj.cost || 0).value();
            obj.totalCost = numeral(obj.totalCost).value();
            obj.desc = (obj.desc || "").toString();
            return obj;
        });

        let id = Pos_Invoice.insert(data);
        if (id) {
            Pos_Customer.direct.update({_id: data.customerId}, {$inc: {invoiceNumber: 1}});
            if (data.paid > 0) {

                let posReceivePaymentDoc = {
                    totalPaid: data.paid,
                    totalNetAmount: data.netTotal,
                    totalDiscount: data.discountValue,

                    balanceUnPaid: data.balanceUnPaid,
                    totalAmount: data.total,

                    receivePaymentDate: moment(data.invoiceDate).toDate(),
                    receivePaymentDateName: moment(data.invoiceDate).format("DD/MM/YYYY"),
                    note: data.note,
                    address: data.address,

                    rolesArea: data.rolesArea,
                    customerId: data.customerId,
                    invoiceId: id,
                    invoiceNo: data.invoiceNo,
                    canRemove: false,
                    locationId: data.locationId,
                    closeDate: data.balanceUnPaid === 0 ? moment(data.invoiceDate).toDate() : "",
                    transactionType: isReceiveItem == true ? "Invoice Sale Order" : (data.netTotal - data.paid) > 0 ? "Invoice" : "Sale Receipt"
                };

                Meteor.call("queryPosInvoiceEndingByCustomerId", data.customerId, data.invoiceDate, true, (err, result) => {
                    posReceivePaymentDoc.invoice = result;
                    result.forEach((obj) => {
                        if (obj._id != id) {
                            posReceivePaymentDoc.balanceUnPaid += numeral(obj.amount).value();
                        }
                    });
                    Pos_ReceivePayment.direct.insert(posReceivePaymentDoc);
                })
            }

            invoiceReact(id);
            addImeiInvoice(data.imei, id);

        }

        if (id) {
            Meteor.defer(function () {
                data.id = id;
                data.transactionType = "Invoice";
                data.isReceiveItem = isReceiveItem;
                Meteor.call("addPosAverageInventory", data, (err, result) => {
                        if (err) {
                            console.log(err.message);
                        }
                    }
                )
            })

            if (isReceiveItem === true) {
                let balanceNotCut = data.balanceNotCut;
                data.item.forEach((obj) => {
                    if (obj.isReceive === true) {
                        Pos_SaleOrder.direct.update({
                                _id: obj.saleOrderId,
                                "item.itemId": obj.itemId
                            }, {
                                $set: {"item.$.isReceive": obj.qty >= obj.rawQty ? true : false},
                                $inc: {
                                    "item.$.receive": obj.qty
                                }
                            }
                        );

                        Pos_SaleOrder.direct.update({_id: obj.saleOrderId}, {
                            $inc: {
                                cutOnPaid: balanceNotCut >= obj.amount ? obj.amount : balanceNotCut,
                                receiveNumber: 1
                            }
                        });
                        balanceNotCut -= balanceNotCut >= obj.amount ? obj.amount : balanceNotCut;
                        balanceNotCut = balanceNotCut >= 0 ? balanceNotCut : 0;
                        let countNotReceive = Pos_SaleOrder.find({
                            "item.isReceive": false,
                            _id: obj.saleOrderId
                        }).count();
                        if (countNotReceive === 0) {
                            Pos_SaleOrder.direct.update({_id: obj.saleOrderId}, {$set: {receiveStatus: "Complete"}});
                        } else {
                            Pos_SaleOrder.direct.update({_id: obj.saleOrderId}, {$set: {receiveStatus: "Partial"}});
                        }

                    }
                })
            }
        }

        return id;
    },
    updatePosInvoice(data, _id) {
        let dataBeforeUpdate = Pos_Invoice.findOne({_id: _id});
        let checkBalance = Meteor.call("checkStockBalance", data, true, dataBeforeUpdate);
        if (checkBalance > 0) {
            throw new Meteor.Error(checkBalance + " items is not enough stock");
        }

        data.transactionType = (data.netTotal - data.paid) > 0 ? "Invoice" : "Sale Receipt";

        data.invoiceNo = data.rolesArea + "-" + moment(data.invoiceDate).format("YYYY") + pad(data.invoiceNo, 6);


        if (data.transactionType === "Sale Receipt" && data.tableId) {
            Meteor.call("updatePosTableStatus", data.tableId, false);
        }
        data.item.forEach((obj) => {
            obj.amount = numeral(obj.amount).value();
            obj.price = numeral(obj.price).value();
            obj.cost = numeral(obj.cost || 0).value();
            obj.totalCost = numeral(obj.totalCost).value();
            obj.desc = (obj.desc || "").toString();
            return obj;
        });
        removeImeiByInvoiceId(_id);
        addImeiInvoice(data.imei, _id);

        let isUpdated = Pos_Invoice.update({_id: _id},
            {
                $set: data
            });

        if (isUpdated) {

            Pos_ReceivePayment.direct.remove({invoiceId: _id});
            if (data.paid > 0) {
                let posReceivePaymentDoc = {
                        totalPaid: data.paid,
                        totalNetAmount: data.netTotal,
                        totalDiscount: data.discountValue,

                        balanceUnPaid: data.netTotal - data.paid,
                        totalAmount: data.total,

                        receivePaymentDate: moment(data.invoiceDate).toDate(),
                        receivePaymentDateName: moment(data.invoiceDate).format("DD/MM/YYYY"),
                        note: data.note,
                        address: data.address,

                        rolesArea: data.rolesArea,
                        customerId: data.customerId,
                        invoiceId: _id,
                        invoiceNo: data.invoiceNo,
                        canRemove: false,
                        locationId: data.locationId,
                        closeDate: data.netTotal - data.paid === 0 ? moment(data.invoiceDate).toDate() : "",
                        transactionType: (data.netTotal - data.paid) > 0 ? "Invoice" : "Sale Receipt"

                    }
                ;

                /*posReceivePaymentDoc.invoice = [
                    {
                        _id: _id,
                        invoiceNo: data.invoiceNo,
                        dueDate: data.dueDate,
                        isApplyTerm: false,
                        isPaid: true,
                        amount: data.total,
                        discount: 0,
                        netAmount: data.total,
                        paid: data.paid
                    }
                ];
                */
                Meteor.call("queryPosInvoiceEndingByCustomerId", data.customerId, data.invoiceDate, true, (err, result) => {
                    posReceivePaymentDoc.invoice = result;
                    result.forEach((obj) => {
                        if (obj._id != _id) {
                            posReceivePaymentDoc.balanceUnPaid += numeral(obj.amount).value();
                        }
                    });
                    Pos_ReceivePayment.direct.insert(posReceivePaymentDoc);
                })
            }

            invoiceReact(_id);
        }

        if (isUpdated) {
            Meteor.defer(function () {
                dataBeforeUpdate.transactionType = "Remove Invoice";
                Meteor.call("reducePosAverageInventory", dataBeforeUpdate, (err1, result1) => {
                    if (!err1) {
                        data.transactionType = "Invoice";
                        data.id = _id;
                        Meteor.call("addPosAverageInventory", data, (err2, result2) => {
                            if (err2) {
                                console.log(err2.message);
                            }
                        })
                    } else {
                        console.log(err1.message);
                    }

                })
            });
        }
        return isUpdated;
    },
    removePosInvoice(id, data) {
        Pos_ReceivePayment.direct.remove({invoiceId: id});
        Pos_Customer.direct.update({_id: data.customerId}, {$inc: {invoiceNumber: -1}});
        let isRemoved = Pos_Invoice.remove({_id: id});

        if (isRemoved) {

            if (data.transactionType == "Invoice Sale Order") {
                let balanceNotCut = data.balanceNotCut;
                data.item.forEach((obj) => {
                    if (obj.isReceive == true) {
                        Pos_SaleOrder.direct.update({
                            _id: obj.saleOrderId,
                            "item.itemId": obj.itemId
                        }, {
                            $set: {
                                "item.$.isReceive": false,

                            },
                            $inc: {
                                "item.$.receive": -obj.qty
                            }
                        });

                        Pos_SaleOrder.direct.update({_id: obj.saleOrderId}, {
                            $inc: {
                                cutOnPaid: balanceNotCut >= obj.amount ? -obj.amount : -balanceNotCut,
                                receiveNumber: -1
                            }
                        });
                        balanceNotCut -= balanceNotCut >= obj.amount ? obj.amount : balanceNotCut;
                        balanceNotCut = balanceNotCut >= 0 ? balanceNotCut : 0;
                        let countNotReceive = Pos_SaleOrder.find({
                            "item.isReceive": false,
                            _id: obj.saleOrderId
                        }).count();
                        if (countNotReceive == 0) {
                            Pos_SaleOrder.direct.update({_id: obj.saleOrderId}, {$set: {receiveStatus: "Complete"}});
                        } else {
                            Pos_SaleOrder.direct.update({_id: obj.saleOrderId}, {$set: {receiveStatus: "Partial"}});
                        }

                    }
                })
            }

            data.transactionType = "Remove Invoice";
            Meteor.call("reducePosAverageInventory", data, (err, reuslt) => {
                if (err) {
                    console.log(err.message);
                }
            })

            invoiceReact(id);
            removeImeiByInvoiceId(id);


        }
        return isRemoved;
    },
    pos_getInvoiceNoByRoleAndDate(rolesAreas, date) {
        let startDate = moment(date).startOf("year").toDate();
        let endDate = moment(date).endOf("year").toDate();
        let data = Pos_Invoice.findOne({
            rolesArea: rolesAreas,
            invoiceDate: {$gte: startDate, $lte: endDate}
        }, {sort: {invoiceNo: -1}});

        let invoiceNo = data && data.invoiceNo.length > 9 ? parseInt((data && data.invoiceNo || "0000000000000").substr(9, 13)) + 1 : parseInt(data && data.invoiceNo || "0") + 1;
        return invoiceNo + "";
    },

    queryPosImeiInvoiceByImei(val) {
        return Pos_ImeiInvoice.findOne({name: val});
    },
    queryPosSaleOrderByCustomerId(customerId) {
        let data = Pos_SaleOrder.find({customerId: customerId, receiveStatus: {$ne: "Complete"}}).fetch();
        let dataObj = {};
        let dataArr = [];
        let balanceNotCut = 0;
        data.forEach((obj) => {
            if (obj) {
                dataObj = obj;
                obj.item.forEach((ob) => {
                    if (ob.isReceive == false || ob.isReceive == undefined) {
                        ob.amount = 0;
                        ob.saleOrderId = obj._id;
                        ob.rawQty = ob.qty - (ob.receive || 0);
                        ob.qty = 0;
                        dataArr.push(ob);
                    }
                })
                balanceNotCut += obj.paid - (obj.cutOnPaid || 0) <= 0 ? 0 : obj.paid - (obj.cutOnPaid || 0);
            }
        })
        dataObj.item = dataArr;
        dataObj.balanceNotCut = formatCurrency(balanceNotCut);
        return dataObj;
    }
});

function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}


let invoiceReact = function (id) {
    let doc = Pos_InvoiceReact.findOne();
    if (doc) {
        Pos_InvoiceReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Pos_InvoiceReact.insert({
            id: id
        });
    }
}


let addImeiInvoice = function (imeiList, invoiceId) {
    imeiList.forEach((obj) => {
        let data = {};
        data.name = obj.name;
        data.invoiceId = invoiceId;
        Pos_ImeiInvoice.insert(data);
    })
};
let removeImeiByInvoiceId = function (invoiceId) {
    return Pos_ImeiInvoice.remove({invoiceId: invoiceId});
};
