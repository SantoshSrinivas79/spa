import {Pos_Bill} from '../../../imports/collection/posBill';
import {Pos_BillReact} from '../../../imports/collection/posBill';
import {Pos_PayBill} from '../../../imports/collection/posPayBill';
import {Pos_Vendor} from '../../../imports/collection/posVendor';
import {Pos_Unit} from '../../../imports/collection/posUnit';

import {SpaceChar} from "../../../both/config.js/space"
import {formatCurrency, getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency";
import {WB_waterBillingSetup} from "../../../imports/collection/waterBillingSetup";
import numeral from "numeral";
import {Pos_ImeiBill} from "../../../imports/collection/posImeiBill";
import {Pos_ImeiInvoice} from "../../../imports/collection/posImeiInvoice";

Meteor.methods({
    queryPosBill({q, filter, rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countPosBill: 0,
            };
            let companyDoc = WB_waterBillingSetup.findOne({});

            let selector = {};
            selector.rolesArea = rolesArea;


            if (!!q) {
                let reg = new RegExp(q);

                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {
                    let vendorList = Pos_Vendor.find({
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
                    selector.$or = [{name: {$regex: reg, $options: 'mi'}}, {
                        code: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }, {vendorId: {$in: vendorList}}];
                }
            }
            let posBills = Pos_Bill.aggregate([
                {
                    $match: selector
                }
                ,
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
                }
            ]).map((obj) => {
                obj.total = formatCurrency(obj.total, companyDoc.baseCurrency) + getCurrencySymbolById(companyDoc.baseCurrency);
                return obj;
            });
            if (posBills.length > 0) {
                data.content = posBills;
                let posBillTotal = Pos_Bill.find(selector).count();
                data.countPosBill = posBillTotal;
            }
            return data;
        }
    },
    queryPosBillById(id) {
        let data = Pos_Bill.findOne({_id: id});
        data.billNo = data && data.billNo.length > 9 ? parseInt((data && data.billNo || "0000000000000").substr(9, 13)) : parseInt(data && data.billNo || "0");
        data.billNo = pad(data.billNo, 6);
        data.item.forEach((obj) => {
            obj.amount = formatCurrency(obj.amount);
            return obj;
        });

        return data;
    },
    queryPosImeiBillByImei(val, itemId) {
        return Pos_ImeiBill.findOne({name: val, itemId: itemId});
    },
    queryPosBillByIdShow(id) {
        let data = Pos_Bill.findOne({_id: id});
        data.billNo = data && data.billNo.length > 9 ? parseInt((data && data.billNo || "0000000000000").substr(9, 13)) : parseInt(data && data.billNo || "0");
        data.billNo = pad(data.billNo, 6);

        let companyDoc = WB_waterBillingSetup.findOne({});

        data.total = formatCurrency(data.total, companyDoc.baseCurrency) + getCurrencySymbolById(companyDoc.baseCurrency);
        data.item.map(function (obj) {
            obj.cost = formatCurrency(obj.cost, companyDoc.baseCurrency) + getCurrencySymbolById(companyDoc.baseCurrency);
            obj.amount = formatCurrency(obj.amount, companyDoc.baseCurrency) + getCurrencySymbolById(companyDoc.baseCurrency);

            return obj;
        });
        return data;
    },
    insertPosBill(data) {
        data.transactionType = (data.netTotal - data.paid) > 0 ? "Bill" : "Purchase Receipt";
        data.billNo = data.rolesArea + "-" + moment(data.billDate).format("YYYY") + pad(data.billNo, 6);
        data.item.forEach((obj) => {
            obj.amount = numeral(obj.amount).value();
            obj.cost = numeral(obj.cost || 0).value();
            obj.desc = (obj.desc || "").toString();

            return obj;
        });
        let id = Pos_Bill.insert(data);
        Pos_Vendor.direct.update({_id: data.vendorId}, {$inc: {billNumber: 1}});
        if (data.paid > 0) {
            let posPayBillDoc = {
                totalPaid: data.paid,
                totalNetAmount: data.netTotal,
                totalDiscount: data.discountValue,

                balanceUnPaid: data.netTotal - data.paid,
                totalAmount: data.total,

                payBillDate: moment(data.payBillDate).toDate(),
                payBillDateName: moment(data.payBillDate).format("DD/MM/YYYY"),
                note: data.note,
                address: data.address,

                rolesArea: data.rolesArea,
                vendorId: data.vendorId,
                billId: id,
                billNo: data.billNo,
                canRemove: false,
                locationId: data.locationId,
                closeDate: data.balanceUnPaid <= 0.001 ? moment(data.billDate).toDate() : "",
                transactionType: (data.netTotal - data.paid) > 0 ? "Bill" : "Sale Receipt"
            };

            Meteor.call("queryPosBillEndingByVendorId", data.vendorId, data.billDate, true, (err, result) => {
                posPayBillDoc.bill = result;
                result.forEach((obj) => {
                    if (obj._id != id) {
                        posPayBillDoc.balanceUnPaid += numeral(obj.amount).value();
                    }
                })
                Pos_PayBill.direct.insert(posPayBillDoc);
            })

        }

        if (id) {
            data.id = id;
            data.transactionType = "Bill";
            Meteor.call("addPosAverageInventory", data, (err, result) => {
                if (err) {
                    console.log(err.message);
                }
            })

            billReact(id);

            addImeiBill(data.imei, id);
        }


        return id;
    },

    updatePosBill(data, _id) {
        data.transactionType = (data.netTotal - data.paid) > 0 ? "Bill" : "Purchase Receipt";
        data.billNo = data.rolesArea + "-" + moment(data.billDate).format("YYYY") + pad(data.billNo, 6);

        let dataBeforeUpdate = Pos_Bill.findOne({_id: _id});
        data.item.forEach((obj) => {
            obj.amount = numeral(obj.amount).value();
            obj.cost = numeral(obj.cost || 0).value();
            obj.desc = (obj.desc || "").toString();

            return obj;
        });

        removeImeiByBillId(_id);
        addImeiBill(data.imei, _id);

        let isUpdated = Pos_Bill.update({_id: _id},
            {
                $set: data
            });

        if (isUpdated) {
            Pos_PayBill.direct.remove({billId: _id});
            if (data.paid > 0) {
                let posPayBillDoc = {
                        totalPaid: data.paid,
                        totalNetAmount: data.netTotal,
                        totalDiscount: data.discountValue,

                        balanceUnPaid: data.netTotal - data.paid,
                        totalAmount: data.total,

                        payBillDate: moment(data.billDate).toDate(),
                        payBillDateName: moment(data.billDate).format("DD/MM/YYYY"),
                        note: data.note,
                        address: data.address,

                        rolesArea: data.rolesArea,
                        vendorId: data.vendorId,
                        billId: _id,
                        billNo: data.billNo,

                        canRemove: false,
                        locationId: data.locationId,

                        closeDate: data.balanceUnPaid <= 0 ? moment(data.billDate).toDate() : "",
                        transactionType: (data.netTotal - data.paid) > 0 ? "Bill" : "Sale Receipt"

                    }
                ;
                Meteor.call("queryPosBillEndingByVendorId", data.vendorId, data.billDate, true, (err, result) => {
                    posPayBillDoc.bill = result;
                    result.forEach((obj) => {
                        if (obj._id != _id) {
                            posPayBillDoc.balanceUnPaid += numeral(obj.amount).value();
                        }
                    })
                    Pos_PayBill.direct.insert(posPayBillDoc);
                })


            }
            Meteor.defer(function () {
                dataBeforeUpdate.transactionType = "Remove Bill";
                Meteor.call("reducePosAverageInventory", dataBeforeUpdate, (err1, result1) => {
                    if (!err1) {
                        data.transactionType = "Bill";
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

            billReact(_id);
        }


        return isUpdated;
    },
    removePosBill(id, data) {

        let isRemoved = Pos_Bill.remove({_id: id});

        if (isRemoved) {
            Pos_PayBill.direct.remove({billId: id});
            Pos_Vendor.direct.update({_id: data.vendorId}, {$inc: {billNumber: -1}});

            data.transactionType = "Remove Bill";
            Meteor.call("reducePosAverageInventory", data, (err, reuslt) => {
                if (err) {
                    console.log(err.message);
                }
            })
            billReact(id);
            removeImeiByBillId(id);
        }
        return isRemoved;
    },
    pos_getBillNoByRoleAndDate(rolesAreas, date) {
        let startDate = moment(date).startOf("year").toDate();
        let endDate = moment(date).endOf("year").toDate();
        let data = Pos_Bill.findOne({
            rolesArea: rolesAreas,
            billDate: {$gte: startDate, $lte: endDate}
        }, {sort: {billNo: -1}});
        let billNo = data && data.billNo.length > 9 ? parseInt((data && data.billNo || "0000000000000").substr(9, 13)) + 1 : parseInt(data && data.billNo || "0") + 1;
        return billNo + "";
    }
});


function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}


let billReact = function (id) {
    let doc = Pos_BillReact.findOne();
    if (doc) {
        Pos_BillReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Pos_BillReact.insert({
            id: id
        });
    }
}


let addImeiBill = function (imeiList, billId) {
    if (imeiList && imeiList.length > 0) {
        imeiList.forEach((obj) => {
            let data = {};
            data.name = obj.name;
            data.billId = billId;
            data.itemId = obj.itemId;
            Pos_ImeiBill.insert(data);
            Pos_ImeiInvoice.remove({name: obj.name});
        })
    }
};
let removeImeiByBillId = function (billId) {
    return Pos_ImeiBill.remove({billId: billId});
};
