import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Sch_Teacher} from '../../../imports/collection/schTeacher';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"

Meteor.methods({
    schTeacherByLevelReport(params, translate) {
        let parameter = {};
        let newParam = {};
        let newLevelSalary = {};
        if (params.area != "") {
            parameter.rolesArea = params.area;

        }
        if (params.teacherId != "") {
            parameter._id = params.teacherId;
        }

        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});

        if (params.date !== null && params.date !== "" && params.date !== undefined) {
            parameter.$or = [
                {
                    stopDate: {$exists: false}
                }, {

                    stopDate: {
                        $gt: moment(params.date).startOf("day").toDate()
                    }
                }
            ]

            parameter.$or = [
                {
                    startDate: {$exists: false}
                }, {

                    startDate: {
                        $lte: moment(params.date).endOf("day").toDate()
                    }
                }
            ]

            newParam.$or = [
                /*{
                    "position.startDate": {$exists: false}
                }, */
                {

                    "position.startDate": {
                        $lte: moment(params.date).endOf("day").toDate()
                    }
                }
            ]

            newLevelSalary.$or = [
                /*{
                    "levelSalary.date": {$exists: false}
                }, */
                {

                    "levelSalary.date": {
                        $lte: moment(params.date).endOf("day").toDate()
                    }
                }
            ]


        }

        let teacherByLevelHTML = "";

        let teacherByLevelList = Sch_Teacher.aggregate([
            {$match: parameter},
            {
                $unwind: {
                    path: "$position",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: newParam
            },
            {$sort: {"position.startDate": 1}},
            {
                $group: {
                    _id: "$_id",
                    personal: {$last: "$personal"},
                    levelSalary: {$last: "$levelSalary"},
                    positionId: {$last: "$position.positionId"},
                    startWorkDate: {$last: "$startWorkDate"}
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
                $unwind: {
                    path: "$levelSalary",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: newLevelSalary
            },
            {$sort: {"levelSalary.date": 1}},
            {
                $group: {
                    _id: "$_id",
                    personal: {$last: "$personal"},
                    levelSalary: {$last: "$levelSalary"},
                    positionDoc: {$last: "$positionDoc"},
                    startWorkDate: {$last: "$startWorkDate"},
                }
            },
            {
                $project: {
                    personal: 1,
                    levelSalary: 1,
                    positionDoc: 1,
                    startWorkDate: 1,
                    order: {
                        $cond: [
                            {$ifNull: ["$positionDoc", false]}, "$positionDoc.order", 10000
                        ]
                    }
                }
            },
            {$sort: {"order": 1}},
            {
                $group: {
                    _id: "$levelSalary.type",
                    data: {$push: "$$ROOT"}
                }
            },
            {$sort: {"_id": 1}},

        ]);

        let i = 1;
        if (teacherByLevelList && teacherByLevelList.length > 0) {
            teacherByLevelList.forEach((objMain) => {
                teacherByLevelHTML += `
                        <tr>
                            <td colspan="10" style="text-align: left !important;">ក្របខណ្ឌ "${objMain._id || ""}"</td>
                        </tr>
                    `;
                objMain.data.forEach(function (obj) {
                    if (obj) {
                        teacherByLevelHTML += `
                        <tr>
                            <td style="text-align: center !important;">${i}</td>
                            <td style="text-align: left !important;">${obj.personal.idNumber || ""}</td>
                            <td style="text-align: left !important;">${obj.personal.name || ""}</td>
                            <td style="text-align: center !important;">${obj.personal.gender === "Male" ? "ប្រុស" : "ស្រី"}</td>
                            <td style="text-align: center !important;">${obj.personal.dobName || ""}</td>
                            <td style="text-align: center !important;">${obj.personal.major || ""}</td>
                            <td style="text-align: center !important;">${obj.positionDoc && obj.positionDoc.name || ""}</td>
                            <td style="text-align: center !important;">${obj.startWorkDate ? moment(obj.startWorkDate).format("DD/MM/YYYY") : ""}</td>
                            <td style="text-align: center !important;">${obj.levelSalary && obj.levelSalary.level || ""}</td>
                            <td style="text-align: center !important;"></td>
                        </tr>
                    `;
                        i++;
                    }
                })

            });
        }


        data.year = moment(params.date || moment().toDate()).format("YYYY");
        data.quarter = Math.ceil(parseInt(moment(params.date || moment().toDate()).format("MM")) * 4 / 12);

        data.teacherByLevelHTML = teacherByLevelHTML;
        return data;
    }
})
;

