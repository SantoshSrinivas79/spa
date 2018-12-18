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
    schTeacherSalaryReport(params, translate) {
        let parameter = {};
        let newParam = {};
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
                },
                {

                    startDate: {
                        $lte: moment(params.date).endOf("day").toDate()
                    }
                }
            ]

            newParam.$or = [
                /*{
                    "position.startDate": {$exists: false}
                },*/
                {

                    "position.startDate": {
                        $lte: moment(params.date).endOf("day").toDate()
                    }
                }
            ]


        }

        let teacherSalaryHTML = "";

        let teacherSalaryList = Sch_Teacher.aggregate([
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
                    positionId: {$last: "$position.positionId"}
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
                    personal: 1,
                    order: {
                        $cond: [
                            {$ifNull: ["$positionDoc", false]}, "$positionDoc.order", 10000
                        ]
                    }
                }
            },
            {$sort: {"order": 1}},

        ]);

        let i = 1;
        if (teacherSalaryList && teacherSalaryList.length > 0) {
            teacherSalaryList.forEach((obj) => {
                if (obj) {
                    teacherSalaryHTML += `
                        <tr>
                            <td style="text-align: center !important;">${i}</td>
                            <td style="text-align: left !important;">${obj.personal.idNumber || ""}</td>
                            <td style="text-align: left !important;">${obj.personal.name || ""}</td>
                            <td style="text-align: center !important;">${obj.personal.gender === "Male" ? "ប្រុស" : "ស្រី"}</td>
                            <td style="text-align: center !important;">${obj.personal.dobName || ""}</td>
                            <td style="text-align: center !important;">${obj.personal.idCode || ""}</td>
                            <td style="text-align: center !important;">${obj.personal.bankAccount || ""}</td>
                            <td style="text-align: left !important;">${obj.personal.bankName || ""}</td>
                            <td style="text-align: center !important;"></td>
                        </tr>
                    `;
                    i++;
                }
            });
        }


        data.teacherSalaryHTML = teacherSalaryHTML;
        return data;
    }
})
;

