import {Sch_BusPayment} from '../../../imports/collection/schBusPayment';
import {Sch_BusPaymentReact} from '../../../imports/collection/schBusPayment';
import {WB_waterBillingSetup} from "../../../imports/collection/waterBillingSetup";
import {formatCurrency} from "../../../imports/api/methods/roundCurrency";
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency";

import numeral from "numeral";
import {Sch_BusRegister} from "../../../imports/collection/schBusRegister";
import {Sch_Student} from "../../../imports/collection/schStudent";
import {Sch_BusReact} from "../../../imports/collection/schBus";

Meteor.methods({
    querySchBusPayment({q, filter,rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countSchBusPayment: 0,
            };

            let companyDoc = WB_waterBillingSetup.findOne({});

            let selector = {};
            selector.rolesArea = rolesArea;

            if (!!q) {
                let reg = new RegExp(q);
                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {
                    let sutdentList = Sch_Student.find({
                            "personal.name": {
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
                    selector.$or = [{studentId: {$in: sutdentList}}];
                }
            }
            let schBusPayments = Sch_BusPayment.aggregate([
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
                        from: "sch_student",
                        localField: "studentId",
                        foreignField: "_id",
                        as: "studentDoc"
                    }
                },
                {
                    $unwind: {
                        path: "$studentDoc",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]).map((obj) => {
                obj.totalNetAmount = formatCurrency(obj.totalNetAmount, companyDoc.baseCurrency) + getCurrencySymbolById(companyDoc.baseCurrency);
                obj.totalPaid = formatCurrency(obj.totalPaid, companyDoc.baseCurrency) + getCurrencySymbolById(companyDoc.baseCurrency);
                return obj;
            });
            if (schBusPayments.length > 0) {
                data.content = schBusPayments;
                let schBusPaymentTotal = Sch_BusPayment.aggregate([
                    {
                        $match: selector
                    },
                    {$group: {_id: null, total: {$sum: 1}}},
                ]);
                data.countSchBusPayment = schBusPaymentTotal[0].total;
            }
            return data;
        }
    },
    querySchBusPaymentById(id) {
        let data = Sch_BusPayment.findOne({_id: id});
        return data;
    },
    insertSchBusPayment(data) {
        let list = [];
        data.schedule.forEach((obj) => {
            if (obj.isPaid === true) {
                obj.amount = numeral(obj.amount).value();
                obj.paid = numeral(obj.paid).value();
                obj.waived = numeral(obj.waived).value();
                list.push(obj)
            }
        });
        data.schedule = list;
        if (data.status === false) {
            Sch_BusRegister.direct.update({_id: data.busRegisterId}, {$set: {dueDate: data.dueDate}});
        } else {
            Sch_BusRegister.direct.update({_id: data.busRegisterId}, {$set: {dueDate: data.dueDate, status: "Close"}});
        }
        let isInserted = Sch_BusPayment.insert(data);

        if (isInserted) {
            busPaymentReact(isInserted);
        }
        return isInserted;
    },
    updateSchBusPayment(data, _id) {
        let list = [];
        data.schedule.forEach((obj) => {
            if (obj.isPaid === true) {
                obj.amount = numeral(obj.amount).value();
                obj.paid = numeral(obj.paid).value();
                obj.waived = numeral(obj.waived).value();
                list.push(obj)
            }
        });

        let isUpdated = Sch_BusPayment.update({_id: _id},
            {
                $set: data
            });
        if (isUpdated) {
            busPaymentReact(_id);
        }
        return isUpdated;
    },
    removeSchBusPayment(id) {
        let busPaymentDoc = Sch_BusPayment.findOne({_id: id});
        let busRegisterDoc = Sch_BusRegister.findOne({_id: busPaymentDoc.busRegisterId});
        if (busPaymentDoc) {
            Sch_BusRegister.direct.update({_id: busPaymentDoc.busRegisterId}, {
                $set: {dueDate: moment(busRegisterDoc.dueDate).add(-busPaymentDoc.schedule.length || 0, "month").toDate()},
                $inc: {
                    busPaymentNumber: -busPaymentDoc.schedule.length || 0
                }
            }, true);
            let isRemoved = Sch_BusPayment.remove({_id: id});
            if (isRemoved) {
                busPaymentReact(id);
            }
            return isRemoved;
        }

    },
    updateBusRegisterByBusPayment(data, date, busRegisterId) {
        let busRegisterDoc = Sch_BusRegister.findOne({_id: busRegisterId});
        return Sch_BusRegister.direct.update({_id: busRegisterId}, {
            $set: {dueDate: moment(busRegisterDoc.dueDate).add(1, "month").toDate()},
            $inc: {
                busPaymentNumber: 1
            }
        }, true);

    },

    sch_getBusPaymentNoByRoleAndDate(rolesAreas, date) {
        let startDate = moment(date).startOf("year").toDate();
        let endDate = moment(date).endOf("year").toDate();
        let data = Sch_BusPayment.findOne({
            rolesArea: rolesAreas,
            busPaymentDate: {$gte: startDate, $lte: endDate}
        }, {sort: {busPaymentNo: -1}});

        let busPaymentNo = data && data.busPaymentNo.length > 9 ? parseInt((data && data.busPaymentNo || "0000000000000").substr(9, 13)) + 1 : parseInt(data && data.busPaymentNo || "0") + 1;
        return busPaymentNo + "";
    },
    querySchBusPaymentScheduleByRegisterId(busRegisterId, receiveDate, lDate) {
        let data = Sch_BusRegister.findOne({_id: busRegisterId});
        let list = [];
        if (lDate) {
            data.dueDate = lDate;
        } else {
            lDate = data.dueDate;
        }
        while (lDate.getTime() <= receiveDate.getTime()) {
            list.push({
                amount: formatCurrency(data.price),
                paid: 0,
                isPaid: false,
                desc: "",
                waived: 0,
                dueDate: lDate,
                dayOverDue: moment(receiveDate).startOf("days").diff(moment(lDate).startOf("days").toDate(), "days") < 0 ? 0 : moment(receiveDate).startOf("days").diff(moment(lDate).startOf("days").toDate(), "days")
            });
            lDate = moment(lDate).add(1, "months").toDate();
        }
        data.list = list;
        return data;
    }

});


let busPaymentReact = function (id) {
    let doc = Sch_BusPaymentReact.findOne();
    if (doc) {
        Sch_BusPaymentReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Sch_BusPaymentReact.insert({
            id: id
        });
    }
}