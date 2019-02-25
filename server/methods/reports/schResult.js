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
import {Sch_Subject} from "../../../imports/collection/schSubject";
import {Sch_ExamDate} from "../../../imports/collection/schExamDate";

Meteor.methods({
    schResultReport(params, translate) {
        let registerParameter = {};

        if (params.area != "") {
            registerParameter.rolesArea = params.area;

        }

        registerParameter.generation = params.generation;


        if (params.programId != "") {
            registerParameter.programId = params.programId;
        }
        if (params.majorId != "") {
            registerParameter.majorId = params.majorId;
        }


        if (params.promotionId != "") {
            registerParameter.promotionId = params.promotionId;
        }


        let yearParam = {};

        if (params.year !== "") {
            yearParam['transcriptList.year'] = params.year;
        }
        if (params.semester != "") {
            yearParam['transcriptList.sem'] = params.semester;
        }
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});

        let sortBy = {};
        if (params.sortRank === true) {
            sortBy.totalScore = -1;

        } else {
            sortBy["_id.studentDoc.personal.name"] = 1;

        }

        let resultHTML = "";

        let resultList = Sch_Register.aggregate([
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
                    registerDate: 1,
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
                $match: yearParam
            },
            {
                $group: {
                    _id: {
                        studentDoc: "$studentDoc",
                        rawTranscriptList: "$rawTranscriptList"
                    },
                    programDoc: {$last: "$programDoc"},
                    majorDoc: {$last: "$majorDoc"},
                    registerDate: {$last: "$registerDate"},
                    data: {
                        $push: '$$ROOT'
                    },
                    totalScore: {$sum: {$cond: [{$gte: ["$transcriptList.score", 0]}, "$transcriptList.score", 0]}}
                }
            }, {
                $sort: sortBy
            }


        ]);

        let i = 1;
        let j = 1;
        let subjectList = Sch_Subject.find({}).fetch();
        if (resultList && resultList.length > 0) {
            resultHTML += `<thead><tr>
                   
                    <th style="text-align: center !important;vertical-align: middle !important; width: 60px !important;" class="row-header" rowspan="3">ល.រ</th>
                    <th style="text-align: center !important;vertical-align: middle !important;" class="row-header" rowspan="3">គោត្តនាម និងនាម</th>
                    <th style="text-align: center !important;vertical-align: middle !important;" class="row-header" rowspan="3">ភេទ</th>
            `;

            let subjectNum = 0;
            resultList[0]._id.rawTranscriptList.forEach((ob) => {
                if (ob.year === params.year && (ob.sem === params.semester || params.semester === "")) {
                    subjectNum++;
                }
            })

            resultHTML += `
                        <th style="text-align: center !important;" class="row-header" colspan="${subjectNum}">ក្រេឌីត</th>
                        <th style="text-align: center !important;vertical-align: middle !important;" class="row-header" rowspan="3">មធ្យមភាគ</th>
                        <th style="text-align: center !important;vertical-align: middle !important;" class="row-header" rowspan="3">លទ្ធផល</th>
                    </tr>`;


            resultList.forEach((obj) => {
                if (j === 1) {
                    data.programName = obj.programDoc.name;
                    data.majorName = obj.majorDoc.name;
                    data.yearStudy = moment(obj.registerDate).add(params.year - 1, "year").format("YYYY") + " - " + moment(obj.registerDate).add(params.year, "year").format("YYYY");


                    let sortTranscript = obj._id.rawTranscriptList.sort(compareASD);
                    resultHTML += `<tr>`;
                    sortTranscript.forEach((ob) => {
                        if (ob.year === params.year && (ob.sem === params.semester || params.semester === "")) {
                            let subjectDoc = subjectList.find((sub) => sub._id === ob.subjectId);
                            resultHTML += `
                        <th style="text-align: right !important;" class="rotate" height="270px !important;"><div style="text-orientation: mixed;writing-mode: vertical-rl; transform: rotate(180deg)"><span>${subjectDoc.name || ""}</span></div></th>
                `;
                        }
                    })

                    resultHTML += `</tr><tr>`;
                    let k = 1;
                    sortTranscript.forEach((ob) => {
                        if (ob.year === params.year && (ob.sem === params.semester || params.semester === "")) {
                            resultHTML += `
                        <th style="text-align: center !important;"><div><span>${k}</span></div></th>
                         `;
                            k++;
                        }
                    })

                    j++;
                }

            })
            resultHTML += `</tr></thead><tbody>`;
            resultList.forEach((obj) => {
                let numSubject = 0;
                let totalScore = 0;
                resultHTML += `
                        <tr>
                           <td style="text-align: center !important;">${i}</td>
                           <td style="text-align: left !important;">${obj._id.studentDoc.personal.name}</td>
                           <td style="text-align: left !important;">${obj._id.studentDoc.personal.gender === "Male" ? "ប្រុស" : "ស្រី"}</td>


                    `;
                let sortTranscript = obj._id.rawTranscriptList.sort(compareASD);
                sortTranscript.forEach((ob) => {
                        if (ob.year === params.year && (ob.sem === params.semester || params.semester === "")) {

                            let passFailSubject = ob.score >= (companyDoc.passIfGreaterThan || 50);

                            if (passFailSubject) {

                                resultHTML += `
                                <td style="text-align: center !important;">${ob.score === -1 ? "AB" : numeral(ob.score).format("0,00.00")}</td>
                            `;
                            } else {

                                resultHTML += `
                                <td style="text-align: center !important;" class="colorRed">${ob.score === -1 ? "AB" : numeral(ob.score).format("0,00.00")}</td>
                            `;
                            }

                            numSubject += 1;
                            totalScore += ob.score === -1 ? 0 : ob.score;
                        }
                    }
                )

                let passFail = (totalScore / numSubject) >= (companyDoc.passIfGreaterThan || 50);
                resultHTML += `
                   `;
                if (passFail) {

                    resultHTML += `  
                    <td style="text-align: center">${numeral(totalScore / numSubject).format("0,00.00")}</td>  
                    <td style="text-align: center">${passFail ? "ជាប់" : "ធ្លាក់"}</td>
                </tr>`;
                } else {
                    resultHTML += `    
                     <td style="text-align: center;color: red"  class="colorRed">${numeral(totalScore / numSubject).format("0,00.00")}</td>
                    <td style="text-align: center; color: red"  class="colorRed">${passFail ? "ជាប់" : "ធ្លាក់"}</td>
                </tr>`;
                }
                i++;
            })
        }
        resultHTML += `</tbody>`;

        let examSelector = {};
        examSelector.programId = params.programId;
        examSelector.majorId = params.majorId;
        examSelector.generation = params.generation;
        examSelector.year = params.year;
        if (params.semester !== "") {
            examSelector.semester = params.semester;
        }
        let examDateDoc = Sch_ExamDate.find(examSelector).fetch();
        if (examDateDoc.length > 0) {
            if (examDateDoc.length === 1) {
                data.examDate = moment(examDateDoc[0].examDate[0]).format("DD/MM/YYYY") + " ដល់ថ្ងៃ " + moment(examDateDoc[0].examDate[1]).format("DD/MM/YYYY");
            } else {
                data.examDate = moment(examDateDoc[0].examDate[0]).format("DD/MM/YYYY") + " ដល់ថ្ងៃ " + moment(examDateDoc[0].examDate[1]).format("DD/MM/YYYY");
                data.examDate += " និង " + moment(examDateDoc[1].examDate[0]).format("DD/MM/YYYY") + " ដល់ថ្ងៃ " + moment(examDateDoc[1].examDate[1]).format("DD/MM/YYYY");

            }
        }
        data.resultHTML = resultHTML;
        return data;
    }
})
;

let compareASD = function (a, b) {
    if (a.year < b.year) {
        return -1;
    } else if (a.year === b.year && a.sem < b.sem) {
        return -1;
    } else if (a.year === b.year && a.sem === b.sem && a.ind < b.ind) {
        return -1;
    } else if (a.year === b.year && a.sem === b.sem && a.ind > b.ind) {
        return 1;
    } else if (a.year === b.year && a.sem > b.sem) {
        return 1;
    }
    else if (a.year > b.year) {
        return 1;
    } else {
        return 0;
    }
}

