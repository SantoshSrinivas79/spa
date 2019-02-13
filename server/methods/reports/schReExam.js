import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Pos_ReceivePayment} from '../../../imports/collection/posReceivePayment';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"
import {Sch_Transcript} from "../../../imports/collection/schTranscript";
import {Sch_Register} from "../../../imports/collection/schRegister";

Meteor.methods({
    schReExamReport(params, translate) {
        let registerParameter = {};

        if (params.area != "") {
            registerParameter.rolesArea = params.area;

        }

        //registerParameter.generation = params.generation;


        if (params.programId != "") {
            registerParameter.programId = params.programId;
        }
        if (params.majorId != "") {
            registerParameter.majorId = params.majorId;
        }


        if (params.promotionId != "") {
            registerParameter.promotionId = params.promotionId;
        }


        let faildParam = {};
        faildParam["transcriptList.grade"] = "F";

        if (params.year !== "") {
            faildParam.year = params.year;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});


        let reExamHTML = "";

        let reExamList = Sch_Register.aggregate([
            {$match: registerParameter},
            {
                $lookup: {
                    from: 'sch_program',
                    localField: 'programId',
                    foreignField: '_id',
                    as: 'programDoc'
                }
            }
            ,
            {
                $unwind: {
                    path: "$programDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'sch_major',
                    localField: 'majorId',
                    foreignField: '_id',
                    as: 'majorDoc'
                }
            }
            ,
            {
                $unwind: {
                    path: "$majorDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'sch_student',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentDoc'
                }
            }
            ,
            {
                $unwind: {
                    path: "$studentDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'sch_promotion',
                    localField: 'promotionId',
                    foreignField: '_id',
                    as: 'promotionDoc'
                }
            }
            ,
            {
                $unwind: {
                    path: "$promotionDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'sch_transcript',
                    localField: '_id',
                    foreignField: 'registerId',
                    as: 'transcriptDoc'
                }
            }
            ,
            {
                $unwind: {
                    path: "$transcriptDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    programDoc: 1,
                    majorDoc: 1,
                    studentDoc: 1,
                    promotionDoc: 1,
                    rawTranscriptList: {$concatArrays: ["$transcriptDoc.culumnSemester1", "$transcriptDoc.culumnSemester2"]},
                    transcriptList: {$concatArrays: ["$transcriptDoc.culumnSemester1", "$transcriptDoc.culumnSemester2"]},

                }
            },
            {
                $unwind: {
                    path: "$transcriptList",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: faildParam
            },
            {
                $lookup: {
                    from: 'sch_subject',
                    localField: 'transcriptList.subjectId',
                    foreignField: '_id',
                    as: 'subjectDoc'
                }
            }
            ,
            {
                $unwind: {
                    path: "$subjectDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        studentDoc: "$studentDoc",
                        rawTranscriptList: "$rawTranscriptList"
                    },
                    data: {
                        $push: '$$ROOT'
                    }
                }
            }

        ]);


        let i = 1;
        console.log(reExamList);
        if (reExamList && reExamList.length > 0) {
            reExamHTML += `<th>`;
            reExamList[0]._id.rawTranscriptList.forEach((headData) => {
                reExamHTML += `
                    
                        <td>${headData.subjectId}</td>
                `;
            })
            reExamHTML += `</th>`;

            reExamList.forEach((obj) => {
                if (obj.data && obj.data.length > 0) {
                    obj.data.forEach((ob) => {
                        /*reExamHTML += `
                        <tr>
                            <td style="text-align: center !important;">${i}</td>
                            <td style="text-align: left !important;">${obj.studentDoc.personal.name}</td>
                            <td style="text-align: center !important;">${obj.programDoc.name}</td>
                            <td style="text-align: center !important;">${obj.majorDoc.name}</td>
                            <td style="text-align: center !important;">${obj.levelDoc.name}</td>
                            <td style="text-align: left !important;">${obj.note || ""}</td>
                            <td>${formatCurrency(netPrice)}</td>

                        </tr>
                    `;*/
                    })
                }
            })
        }

        console.log(reExamHTML);

        data.reExamHTML = reExamHTML;
        return data;
    }
})
;