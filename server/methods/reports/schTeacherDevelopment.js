import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Sch_Teacher} from '../../../imports/collection/schTeacher';
import {Sch_TeacherActivity} from '../../../imports/collection/schTeacherActivity';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    schTeacherDevelopmentReport(params, translate) {
        let parameter = {};
        let newParam = {};
        if (params.area != "") {
            parameter.rolesArea = params.area;

        }


        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});

        if (params.date !== null && params.date !== "" && params.date !== undefined) {

            parameter.$or = [
                {
                    startDate: {$exists: false}
                },
                {

                    startDate: {
                        $lte: moment(params.date[1]).endOf("day").toDate(),
                        $gte: moment(params.date[0]).startOf("day").toDate()
                    }
                }
            ]

            newParam.$or = [
                {
                    "position.startDate": {$exists: false}
                },
                {

                    "position.startDate": {
                        $lte: moment(params.date[0]).endOf("day").toDate()
                    }
                }
            ]


        }

        let teacherDevelopmentHTML = "";

        let teacherDevelopmentList = Sch_TeacherActivity.aggregate([
            {$match: parameter},

            {
                $unwind: {
                    path: "$teacher",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: 'sch_teacher',
                    localField: 'teacher.teacherId',
                    foreignField: '_id',
                    as: 'teacherDoc'
                }
            },
            {
                $unwind: {
                    path: "$teacherDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$teacherDoc.position",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: newParam
            },
            {$sort: {"position.startDate": 1}},
            {
                $group: {
                    _id: {
                        teacherActivityId: "$_id",
                        teacherId: "$teacherDoc._id",
                        activityId: "$activityId"
                    },
                    teacherDoc: {$last: "$teacherDoc"},
                    positionId: {$last: "$teacherDoc.position.positionId"},

                    startDate: {$last: "$startDateName"},
                    start: {$last: "$startDate"},
                    end: {$last: "$endDate"},
                    endDate: {$last: "$endDateName"},
                    place: {$last: "$place"},
                    topic: {$last: "$topic"},
                }
            }, {
                $lookup: {
                    from: 'sch_position',
                    localField: 'positionId',
                    foreignField: '_id',
                    as: 'positionDoc'
                }
            },
            {
                $unwind: {
                    path: "$positionDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    order: {
                        $cond: [
                            {$ifNull: ["$positionDoc", false]}, "$positionDoc.order", 10000
                        ]
                    },
                    teacherDoc: 1,
                    positionDoc: 1,
                    startDate: 1,
                    start: 1,
                    end: 1,
                    endDate: 1,
                    place: 1,
                    topic: 1,
                }
            },
            {$sort: {"start": 1, "order": 1}},
            {
                $group: {
                    _id: {
                        teacherActivityId: "$_id.teacherActivityId",
                        activityId: "$_id.activityId",
                    },
                    data: {$push: "$$ROOT"},
                    startDate: {$last: "$startDate"},
                    start: {$last: "$start"},
                    end: {$last: "$end"},
                    endDate: {$last: "$endDate"},
                    place: {$last: "$place"},
                    topic: {$last: "$topic"},
                }
            },
            {
                $group: {
                    _id: {
                        activityId: "$_id.activityId",
                    },
                    data: {$push: "$$ROOT"}
                }
            },

            {
                $lookup: {
                    from: 'sch_activity',
                    localField: '_id.activityId',
                    foreignField: '_id',
                    as: 'activityDoc'
                }
            },
            {
                $unwind: {
                    path: "$activityDoc",
                    preserveNullAndEmptyArrays: true
                }
            }


        ]);

        let i = 1;
        if (teacherDevelopmentList && teacherDevelopmentList.length > 0) {
            teacherDevelopmentList.forEach((objMain) => {
                if (objMain) {
                    teacherDevelopmentHTML += `
                        <tr>
                            <td colspan="7" style="text-align: left !important;">${objMain.activityDoc.name}</td>
                        </tr>
                    `;

                    objMain.data.forEach((obj) => {

                        let numTeacher = obj.data.length;
                        let inc = 0;
                        obj.data.forEach((ob) => {

                            if (inc === 0) {
                                teacherDevelopmentHTML += `
                     <tr>
                            <td style="text-align: center !important; vertical-align: middle !important;" rowspan="${numTeacher}">${i}</td>
                            <td style="text-align: left !important; vertical-align: middle !important;" rowspan="${numTeacher}">${obj.startDate || ""} - ${obj.endDate || ""}</td>
                            <td style="text-align: left !important;">${ob.teacherDoc && ob.teacherDoc.personal && ob.teacherDoc.personal.name || ""}</td>
                            <td style="text-align: center !important;">${ob.positionDoc && ob.positionDoc.name || ""}</td>
                            <td style="text-align: center !important; vertical-align: middle !important;" rowspan="${numTeacher}">${obj.topic || ""}</td>
                            <td style="text-align: center !important; vertical-align: middle !important;" rowspan="${numTeacher}">${moment(obj.end).diff(obj.start, "days")} ថ្ងៃ</td>
                            <td style="text-align: center !important; vertical-align: middle !important;" rowspan="${numTeacher}">${obj.place || ""}</td>
                    </tr>
                    `;
                            } else {

                                teacherDevelopmentHTML += `
                     <tr>
                            <td style="text-align: left !important;">${ob.teacherDoc && ob.teacherDoc.personal && ob.teacherDoc.personal.name || ""}</td>
                            <td style="text-align: center !important;">${ob.positionDoc && ob.positionDoc.name || ""}</td>
                    </tr>
                    `;
                            }

                            inc++;

                        })

                        i++;


                    })


                }
            });
        }

        data.year = moment(params.date[0] || moment().toDate()).format("YYYY");
        data.quarter = Math.ceil(parseInt(moment(params.date[0] || moment().toDate()).format("MM")) * 4 / 12);
        data.teacherDevelopmentHTML = teacherDevelopmentHTML;
        return data;
    }
})
;

