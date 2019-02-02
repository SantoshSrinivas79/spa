import {Sch_BusRegister} from '../../../imports/collection/schBusRegister';
import {Sch_BusRegisterReact} from '../../../imports/collection/schBusRegister';
import {Sch_Bus} from '../../../imports/collection/schBus';
import {Sch_BusStop, Sch_BusStopReact} from '../../../imports/collection/schBusStop';

import {SpaceChar} from "../../../both/config.js/space"
import {Sch_Student} from "../../../imports/collection/schStudent";

Meteor.methods({
    querySchBusRegister({q, filter, rolesArea, options = {limit: 10, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countSchBusRegister: 0,
            };
            let selector = {};
            selector.rolesArea = rolesArea;

            //selector.status = "Active";
            if (!!q) {
                let reg = new RegExp(q);
                if (!!filter) {
                    selector[filter] = {$regex: reg, $options: 'mi'}
                } else {
                    let studentList = Sch_Student.find({
                            "personal.name": {$regex: reg, $options: 'mi'}
                        }, {_id: true},
                        {
                            $limit: options.limit
                        },
                        {
                            $skip: options.skip
                        }).fetch().map((obj) => {
                        return obj._id;
                    });
                    let busList = Sch_Bus.find({
                            name: {$regex: reg, $options: 'mi'}
                        }, {_id: true},
                        {
                            $limit: options.limit
                        },
                        {
                            $skip: options.skip
                        }).fetch().map((obj) => {
                        return obj._id;
                    });
                    let busStopList = Sch_BusStop.find({
                            name: {$regex: reg, $options: 'mi'}
                        }, {_id: true},
                        {
                            $limit: options.limit
                        },
                        {
                            $skip: options.skip
                        }).fetch().map((obj) => {
                        return obj._id;
                    });

                    selector.$or = [
                        {studentId: {$in: studentList}},
                        {
                            busId: {
                                $in: busList
                            }
                        }, {
                            busStopId: {$in: busStopList}
                        },
                        {
                            "busStopType": {
                                $regex: reg,
                                $options: 'mi'
                            }
                        },
                        {
                            "price": {
                                $regex: reg,
                                $options: 'mi'
                            }
                        }
                    ];
                }
            }
            let schBusRegisters = Sch_BusRegister.aggregate([
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
                }, {
                    $lookup: {
                        from: "sch_bus",
                        localField: "busId",
                        foreignField: "_id",
                        as: "busDoc"

                    }
                },

                {
                    $unwind: {
                        path: "$busDoc",
                        preserveNullAndEmptyArrays: true
                    }
                }, {
                    $lookup: {
                        from: "sch_busStop",
                        localField: "busStopId",
                        foreignField: "_id",
                        as: "busStopDoc"

                    }
                },

                {
                    $unwind: {
                        path: "$busStopDoc",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]);
            if (schBusRegisters.length > 0) {
                data.content = schBusRegisters;
                let busReg = Sch_BusRegister.aggregate([
                    {
                        $match: selector
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
                    }, {
                        $lookup: {
                            from: "sch_bus",
                            localField: "busId",
                            foreignField: "_id",
                            as: "busDoc"

                        }
                    },

                    {
                        $unwind: {
                            path: "$busDoc",
                            preserveNullAndEmptyArrays: true
                        }
                    }, {
                        $lookup: {
                            from: "sch_busStop",
                            localField: "busStopId",
                            foreignField: "_id",
                            as: "busStopDoc"

                        }
                    },

                    {
                        $unwind: {
                            path: "$busStopDoc",
                            preserveNullAndEmptyArrays: true
                        }
                    },

                    {
                        $sort: {
                            createdAt: -1
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: {$sum: 1}
                        }
                    }
                ]);
                let schBusRegisterTotal = busReg[0].total;
                data.countSchBusRegister = schBusRegisterTotal;
            }
            return data;
        }
    },
    querySchBusRegisterById(id) {
        let data = Sch_BusRegister.findOne({_id: id});
        return data;
    },
    insertSchBusRegister(data) {
        let doc = Sch_BusRegister.insert(data);
        if (doc) {
            busRegisterReact(doc);
        }
        return doc;
    },
    updateSchBusRegister(data) {
        let id = data._id;
        let doc = Sch_BusRegister.update({_id: data._id},
            {
                $set: data
            });
        if (doc) {
            busRegisterReact(id);
        }
        return doc;
    },
    removeSchBusRegister(id) {
        let isRemoved = Sch_BusRegister.remove({_id: id});
        if (isRemoved) {
            busRegisterReact(id);
        }
        return isRemoved;
    }
});


let busRegisterReact = function (id) {
    let doc = Sch_BusRegisterReact.findOne();
    if (doc) {
        Sch_BusRegisterReact.update({_id: doc._id}, {
            $set: {
                id: id
            }
        });
    } else {
        Sch_BusRegisterReact.insert({
            id: id
        });
    }
}
