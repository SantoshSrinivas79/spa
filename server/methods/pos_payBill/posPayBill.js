import {Pos_PayBill} from '../../../imports/collection/posPayBill';
import {Pos_PayBillReact} from '../../../imports/collection/posPayBill';
import {Pos_Bill} from '../../../imports/collection/posBill';
import {WB_waterBillingSetup} from "../../../imports/collection/waterBillingSetup";
import {formatCurrency, formatCurrencyLast} from "../../../imports/api/methods/roundCurrency";
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency";
import numeral from "numeral";
import {Pos_Vendor} from "../../../imports/collection/posVendor";
import {Acc_Journal} from "../../../imports/collection/accJournal";
import {Acc_ChartAccount} from "../../../imports/collection/accChartAccount";
import {Pos_Customer} from "../../../imports/collection/posCustomer";
import {Pos_LocationReact} from "../../../imports/collection/posLocation";

Meteor.methods({
    queryPayBill({q, filter, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countPosPayBill: 0,
            };

            let companyDoc = WB_waterBillingSetup.findOne({});

            let selector = {};
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
                    selector.$or = [{billNo: {$regex: reg, $options: 'mi'}}, {
                        code: {
                            $regex: reg,
                            $options: 'mi'
                        }
                    }, {vendorId: {$in: vendorList}}];
                }
            }
            let posPayBills = Pos_PayBill.aggregate([

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
                }
                , {
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
                obj.totalAmount = formatCurrency(obj.totalAmount, companyDoc.baseCurrency) + getCurrencySymbolById(companyDoc.baseCurrency);
                obj.totalDiscount = formatCurrency(obj.totalDiscount, companyDoc.baseCurrency) + getCurrencySymbolById(companyDoc.baseCurrency);
                obj.totalPaid = formatCurrency(obj.totalPaid, companyDoc.baseCurrency) + getCurrencySymbolById(companyDoc.baseCurrency);
                return obj;
            });
            if (posPayBills.length > 0) {
                data.content = posPayBills;
                let posPayBillTotal = Pos_PayBill.find(selector).count();
                data.countPayBill = posPayBillTotal;
            }
            return data;
        }
    },
    queryPosPayBillById(id) {
        let data = Pos_PayBill.findOne({_id: id});
        data.bill.forEach((obj) => {
            obj.amount = formatCurrency(obj.amount);
            obj.discount = formatCurrency(obj.discount);
            obj.netAmount = formatCurrency(obj.netAmount);
            obj.paid = formatCurrency(obj.paid);
            return obj;
        })
        return data;
    },
    insertPosPayBill(data) {

        data.bill.forEach((obj) => {
            obj.amount = numeral(obj.amount).value();
            obj.discount = numeral(obj.discount).value();
            obj.netAmount = numeral(obj.netAmount).value();
            obj.paid = numeral(obj.paid).value();

            return obj;
        })
        let id = Pos_PayBill.insert(data);

        if (id && data.totalPaid > 0) {
            //Integrated To Account===============================================================================================
            Meteor.defer(function () {
                let companyDoc = WB_waterBillingSetup.findOne({});
                if (companyDoc.integratedPosAccount === true) {
                    let cashAcc = Acc_ChartAccount.findOne({mapToAccount: "005"});
                    let apAcc = Acc_ChartAccount.findOne({mapToAccount: "008"});
                    let venDoc = Pos_Vendor.findOne({_id: data.vendorId});

                    let journalDoc = {};
                    journalDoc.journalDate = data.payBillDate;
                    journalDoc.journalDateName = moment(data.payBillDate).format("DD/MM/YYYY");
                    journalDoc.currencyId = companyDoc.baseCurrency;
                    journalDoc.memo = "បង់ប្រាក់ទៅឲ្យ​ " + venDoc.name;
                    journalDoc.rolesArea = data.rolesArea;
                    journalDoc.closingEntryId = id;
                    journalDoc.status = "Pay Bill";
                    journalDoc.refId = id;
                    journalDoc.total = numeral(formatCurrencyLast(data.totalPaid, companyDoc.baseCurrency)).value();

                    let transaction = [];
                    if (data.totalPaid > 0) {
                        transaction.push({
                            account: apAcc._id,
                            dr: data.totalPaid,
                            cr: 0,
                            drcr: data.totalPaid
                        });
                    }

                    if (data.totalPaid > 0) {
                        transaction.push({
                            account: cashAcc._id,
                            dr: 0,
                            cr: data.totalPaid,
                            drcr: -data.totalPaid
                        });
                    }

                    journalDoc.transaction = transaction;
                    Meteor.call("insertJournal", journalDoc);

                }
            })
        }

        if (id) {
            payBillReact(id);
        }
        return id;
    },
    removePosPayBill(id) {
        let payBillDoc = Pos_PayBill.findOne({_id: id});
        let isRemove = Pos_PayBill.remove({_id: id});
        if (isRemove) {
            if (payBillDoc) {
                payBillDoc.bill.forEach((data) => {
                    let billDoc = Pos_Bill.findOne({_id: data._id});
                    let newStatus = billDoc.status;

                    if (billDoc.paid - (data.paid + data.discount) > 0) {
                        newStatus = "Partial";
                    } else {
                        newStatus = "Active";
                    }

                    Pos_Bill.direct.update({_id: data._id}, {
                        $set: {status: newStatus, closeDate: ""},
                        $inc: {
                            paid: -(data.paid + data.discount),
                            paymentNumber: -1
                        }
                    }, true);

                    Pos_PayBill.direct.update({
                            "bill._id": data._id,
                            createdAt: {$gt: payBillDoc.createdAt}
                        },
                        {

                            $inc: {
                                "bill.$.amount": (data.paid + data.discount),
                                "bill.$.netAmount": (data.paid + data.discount),
                                totalAmount: (data.paid + data.discount),
                                totalNetAmount: (data.paid + data.discount),
                                balanceUnPaid: (data.paid + data.discount)
                            }
                        }, {multi: true}, true);
                })
            }
        }

        //Integrated To Account===============================================================================================
        if (isRemove) {
            let companyDoc = WB_waterBillingSetup.findOne({});
            if (companyDoc.integratedPosAccount === true) {
                Acc_Journal.remove({refId: id, status: "Pay Bill"});
            }
            payBillReact(id);
        }
        return isRemove;

    },
    queryPosBillByVendorId(vendorId, paidDate, locationId) {
        return Pos_Bill.find({
            vendorId: vendorId,
            locationId: locationId,
            status: {$in: ["Active", "Partial"]}
        }).fetch().map((obj) => {
            if (obj) {
                return {
                    _id: obj._id,
                    billNo: obj.billNo,
                    termId: obj.termId,
                    amount: formatCurrency(obj.netTotal - obj.paid),
                    rawAmount: obj.total,
                    isApplyTerm: false,
                    discount: 0,
                    billDate: obj.billDate,
                    dueDate: obj.dueDate,
                    netAmount: formatCurrency(obj.netTotal - obj.paid),
                    paid: 0,
                    isShow: true,
                    isPaid: false,
                    dayOverDue: moment(paidDate).startOf("days").diff(moment(obj.dueDate).startOf("days").toDate(), "days") < 0 ? 0 : moment(paidDate).startOf("day").diff(moment(obj.dueDate).startOf("days").toDate(), "days")
                }
            }
            return [];
        });
    },
    queryPosBillEndingByVendorId(vendorId, paidDate, locationId) {
        return Pos_Bill.find({
            vendorId: vendorId,
            locationId: locationId,
            status: {$in: ["Active", "Partial"]}
        }).fetch().map((obj) => {
            if (obj) {
                return {
                    _id: obj._id,
                    billNo: obj.billNo,
                    termId: obj.termId,
                    amount: obj.netTotal - obj.paid,
                    rawAmount: obj.total,
                    isApplyTerm: false,
                    discount: 0,
                    billDate: obj.billDate,
                    dueDate: obj.dueDate,
                    netAmount: obj.netTotal - obj.paid,
                    paid: obj.paid,
                    isShow: true,
                    isPaid: false,
                    dayOverDue: moment(paidDate).startOf("days").diff(moment(obj.dueDate).startOf("days").toDate(), "days") < 0 ? 0 : moment(paidDate).startOf("day").diff(moment(obj.dueDate).startOf("days").toDate(), "days")
                }
            }
            return [];
        });
    },
    /*queryPosBillByVendorIdSubmit(vendorId, paidDate) {
        return Pos_Bill.find({vendorId: vendorId, status: {$in: ["Active", "Partial"]}}).fetch().map((obj) => {
            return {
                _id: obj._id,
                billNo: obj.billNo,
                termId: obj.termId,
                amount: obj.netTotal,
                rawAmount: obj.total,
                isApplyTerm: false,
                discount: obj.discount,
                billDate: obj.billDate,
                dueDate: obj.dueDate,
                netAmount: obj.netTotal,
                paid: obj.paid,
                isShow: obj.isShow,
                isPaid: obj.isPaid,
                dayOverDue: moment(paidDate).startOf("days").diff(moment(obj.dueDate).startOf("days").toDate(), "days") < 0 ? 0 : moment(paidDate).startOf("day").diff(moment(obj.dueDate).startOf("days").toDate(), "days")
            }
        });
    },*/
    updateBillByPayBill(data, date) {
        let billDoc = Pos_Bill.findOne({_id: data._id});
        let newStatus = billDoc.status;

        data.paid = numeral(data.paid).value();
        data.discount = numeral(data.discount).value();

        let upd = {};
        if (numeral(formatCurrency(billDoc.paid + data.paid + data.discount)).value() >= billDoc.netTotal) {
            newStatus = "Complete";
            upd.closeDate = date;
        } else {
            newStatus = "Partial";
        }

        upd.status = newStatus;
        return Pos_Bill.direct.update({_id: data._id}, {
            $set: upd,
            $inc: {
                paid: data.paid + data.discount,
                paymentNumber: 1
            }
        }, true);
    }

});


let payBillReact = function (id) {
    let doc = Pos_PayBillReact.findOne();
    if (doc) {
        Pos_PayBillReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Pos_PayBillReact.insert({
            id: id
        });
    }
}