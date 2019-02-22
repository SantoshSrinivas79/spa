import {Meteor} from 'meteor/meteor';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Sch_Transcript} from '../../../imports/collection/schTranscript';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"
import {Sch_Level} from "../../../imports/collection/schLevel";
import {Sch_Subject} from "../../../imports/collection/schSubject";
import {Sch_Major} from "../../../imports/collection/schMajor";
import {Sch_Faculty} from "../../../imports/collection/schFaculty";

Meteor.methods({
    schTranscriptReport(studentId, majorId, translate) {
        let data = {};

        let companyDoc = WB_waterBillingSetup.findOne({});

        //Range Date
        let transcriptList = Sch_Transcript.aggregate([
            {$match: {studentId: studentId, majorId: majorId}},
            {
                $lookup: {
                    from: 'sch_student',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentDoc'
                }
            }, {
                $unwind: {
                    path: "$studentDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'sch_register',
                    localField: 'registerId',
                    foreignField: '_id',
                    as: 'registerDoc'
                }
            }, {
                $unwind: {
                    path: "$registerDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    newArr: {$concatArrays: ["$culumnSemester1", "$culumnSemester2"]},
                    studentDoc: 1,
                    registerDoc: 1
                }
            },
            {
                $unwind: {
                    path: "$newArr",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $group: {
                    _id: {
                        year: "$newArr.year",
                        ind: "$newArr.ind"
                    },
                    data: {$push: "$newArr"},
                    studentDoc: {$last: "$studentDoc"},
                    registerDoc: {$last: "$registerDoc"}
                }
            },
            {
                $sort: {
                    "_id.ind": -1
                }
            },
            {
                $group: {
                    _id: {
                        year: "$_id.year"
                    },
                    data: {$addToSet: "$$ROOT"},
                    studentDoc: {$last: "$studentDoc"},
                    registerDoc: {$last: "$registerDoc"}
                }
            },
            {
                $sort: {
                    "_id.year": 1
                }
            }

        ]);
        let transcriptDoc = transcriptList[0];
        let finalGPA = 0;
        let countFinalGPA = 0;
        let credit = 0;
        let stateEx = Sch_Transcript.findOne({studentId: studentId, majorId: majorId});
        let printTranscriptHtml = "";
        let subjectList = Sch_Subject.find().fetch();
        let yearTo = 0;
        yearTo = parseInt(moment(transcriptDoc && transcriptDoc.registerDoc && transcriptDoc.registerDoc.registerDate || "").format("YYYY"));
        if (transcriptList.length > 0) {
            /*let newArr = transcriptList[0].culumnSemester1.concat(transcriptList[0].culumnSemester2 || []);
            newArr.sort(orderByProperty("ind", "sem"));*/
            // console.log(transcriptList);
            transcriptList.forEach((o) => {
                let countY = 0;
                let countFirstGPA = 0;
                let gpa1 = 0;
                let gpa2 = 0;
                let lengSem1 = 0;
                let lengSem2 = 0;
                o.data.forEach((obj) => {
                    if (obj) {
                        if (obj.data[0].grade !== "Un Range") {
                            obj.data.forEach((ob) => {
                                if (ob.grade !== "Un Range") {
                                    if (ob.sem === 1) {
                                        gpa1 += ob.gradePoint;
                                        lengSem1++;
                                        credit += ob.credit;
                                    } else if (ob.sem === 2) {
                                        gpa2 += ob.gradePoint;
                                        lengSem2++;
                                        credit += ob.credit;
                                    }
                                }
                            });
                        }
                    }
                });
                gpa1 = numeral(gpa1 / lengSem1).format("0,00.00");
                gpa2 = numeral(gpa2 / lengSem2).format("0,00.00");
                if (numeral(gpa1).value() > 0) {
                    finalGPA += numeral(gpa1).value();
                    countFinalGPA++;
                }
                if (numeral(gpa2).value() > 0) {
                    finalGPA += numeral(gpa2).value();
                    countFinalGPA++;
                }


                let rowSpanYear = lengSem1 >= lengSem2 ? lengSem1 : lengSem2;
                o.data.forEach((obj) => {
                        if (obj) {
                            if (obj.data[0].grade !== "Un Range") {
                                let lengthSeme = obj.data.length;

                                obj.data.forEach((ob) => {
                                    let subjectDoc = subjectList.find((elem) => {
                                        return elem._id === ob.subjectId;
                                    });
                                    ob.gradePoint = numeral(ob.gradePoint).format("0,00.00");
                                    if (countY === 0) {
                                        yearTo++;
                                        if (ob.sem === 1) {
                                            printTranscriptHtml += `
                                                <tr>
                                                    <td rowspan="${rowSpanYear}" style="vertical-align: inherit !important; text-align: center !important;">${obj._id.year}<sup>${getNumber(obj._id.year)}</sup> </td>
                                                    <td class="tran-forth" style="border-bottom: 0px !important;">${subjectDoc.name}</td>
                                                    <td class="tran-first" style="border-bottom: 0px !important;">${ob.credit || ""}</td>
                                                    <td class="tran-first" style="border-bottom: 0px !important;">${ob.grade || ""}</td>
                                                    <td class="tran-first" style="border-bottom: 0px !important;">${ob.gradePoint || ""}</td>
                                                    <td rowspan="${rowSpanYear}" class="tran-second" style="vertical-align: inherit !important; text-align: center !important;">${ob.grade !== "Un Range" ? gpa1 || "" : ""}</td>
                                                `;

                                            if (lengthSeme !== 2) {
                                                printTranscriptHtml += `
                                                    <td class="tran-first" style="border-bottom: 0px !important;"></td>
                                                    <td class="tran-first" style="border-bottom: 0px !important;"></td>
                                                    <td class="tran-first" style="border-bottom: 0px !important;"></td>
                                                    <td class="tran-first" style="border-bottom: 0px !important;"></td>
                                                    <td class="tran-first" style="border-bottom: 0px !important;"></td>
                                                </tr>
                                                `;
                                            }
                                            countY++;
                                        } else if (ob.sem === 2) {
                                            if (lengthSeme !== 2) {
                                                printTranscriptHtml += `
                                                    <td rowspan="${rowSpanYear}" class="tran-second">${obj._id.year}<sup>${getNumber(obj._id.year)}</sup></td>
                                                    <td class="tran-first" style="border-bottom: 0px !important;"></td>
                                                    <td class="tran-first" style="border-bottom: 0px !important;"></td>
                                                    <td class="tran-first" style="border-bottom: 0px !important;"></td>
                                                    <td  class="tran-first" style="border-bottom: 0px !important;"></td>
                                                    <td rowspan="${rowSpanYear}" class="tran-second"></td>
                                                </tr>
                                                `;
                                                countY++;
                                            }
                                            printTranscriptHtml += `
                                                    <td  class="tran-forth" style="border-bottom: 0px !important;">${ob.grade !== "Un Range" ? subjectDoc.name : ""}</td>
                                                    <td  class="tran-first" style="border-bottom: 0px !important;">${ob.grade !== "Un Range" ? ob.credit || "" : ""}</td>
                                                    <td class="tran-first" style="border-bottom: 0px !important;">${ob.grade !== "Un Range" ? ob.grade || "" : ""}</td>
                                                    <td class="tran-first" style="border-bottom: 0px !important;">${ob.grade !== "Un Range" ? ob.gradePoint || "" : ""}</td>
                                                     <td rowspan="${rowSpanYear}" class="tran-second">${ob.grade !== "Un Range" ? gpa2 : ""}</td>

                                                    </tr>
                                            `;
                                        }
                                    } else {
                                        if (ob.sem === 1) {
                                            printTranscriptHtml += `
                                           <tr>
                                                <td class="tran-forth"  style="border-bottom: 0px !important; border-top: 0px !important;">${subjectDoc.name}</td>
                                                <td class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;">${ob.credit || ""}</td>
                                                <td  class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;">${ob.grade || ""}</td>
                                                <td  class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;">${ob.gradePoint || ""}</td>
                                       
                                            `;

                                            if (lengthSeme !== 2) {
                                                printTranscriptHtml += `
                                                    <td  class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;"></td>
                                                    <td  class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;"></td>
                                                    <td  class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;"></td>
                                                    <td  class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;"></td>
                                                </tr>
                                                `;
                                            }
                                        } else {
                                            if (lengthSeme !== 2) {
                                                printTranscriptHtml += `
                                                <tr>
                                                    <td  class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;"></td>
                                                    <td  class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;"></td>
                                                    <td  class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;"></td>
                                                    <td  class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;"></td>
                                                `;
                                            }
                                            if (countFirstGPA === 0) {
                                                printTranscriptHtml += `
                                            <td  class="tran-forth" style="border-bottom: 0px !important;">${ob.grade !== "Un Range" ? subjectDoc.name : ""}</td>
                                            <td class="tran-first" style="border-bottom: 0px !important; ">${ob.grade !== "Un Range" ? ob.credit || "" : ""}</td>
                                            <td class="tran-first" style="border-bottom: 0px !important; ">${ob.grade !== "Un Range" ? ob.grade || "" : ""}</td>
                                            <td class="tran-first" style="border-bottom: 0px !important; ">${ob.grade !== "Un Range" ? ob.gradePoint || "" : ""}</td>
                                            <td rowspan="${rowSpanYear}" class="tran-second">${ob.grade !== "Un Range" ? gpa2 : ""}</td>

                                        </tr>
                                        `;
                                                countFirstGPA++;

                                            } else {
                                                printTranscriptHtml += `
                                            <td class="tran-forth" style="border-bottom: 0px !important; border-top: 0px !important;">${ob.grade !== "Un Range" ? subjectDoc.name : ""}</td>
                                            <td class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;">${ob.grade !== "Un Range" ? ob.credit || "" : ""}</td>
                                            <td class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;">${ob.grade !== "Un Range" ? ob.grade || "" : ""}</td>
                                            <td class="tran-third" style="border-bottom: 0px !important; border-top: 0px !important;">${ob.grade !== "Un Range" ? ob.gradePoint || "" : ""}</td>
                                        </tr>
                                        `;
                                            }
                                        }
                                    }
                                })
                            }
                        }

                    }
                );
            })
            ;

            if (stateEx.isCompleted == true) {
                if (stateEx.state.length > 0) {
                    let gpaState = 0;
                    stateEx.state.forEach((obj) => {
                        gpaState += obj.gradePoint;
                    });
                    gpaState = numeral(gpaState / stateEx.state.length).format("0,00.00");
                    finalGPA += numeral(gpaState).value();
                    countFinalGPA++;
                    finalGPA = numeral(finalGPA / countFinalGPA).format("0,00.00");

                    printTranscriptHtml += `
                        <tr>
                            <th colspan="2" rowspan="${stateEx.state.length + 1}" style="vertical-align: inherit">
                                    Gross (Total) GPA   <br>
                                    Credits Gained &nbsp;&nbsp;&nbsp;<br>
                                    Credits Required &nbsp;<br>
                            </th>
                            <th colspan="4" style="vertical-align: inherit"  rowspan="${stateEx.state.length + 1}">${finalGPA}<br>${credit} credits <br>${stateEx.requiredCredit}  credits</th>
                            <th colspan="4" style="text-align: center !important;">State Exam</th>
                            <th rowspan="${stateEx.state.length + 1}" style="text-align: center !important; vertical-align: inherit !important;">${gpaState}</th>
                        </tr>
                `;
                    stateEx.state.forEach((obj) => {

                        let subjectDoc = subjectList.find((elem) => {
                            return elem._id === obj.subjectId;
                        });
                        printTranscriptHtml += `
                        <tr>
                            <td>${subjectDoc.name}</td>
                            <td></td>
                            <td class="tran-first">${obj.grade}</td>
                            <td class="tran-first">${obj.gradePoint}</td>
                        </tr>
                       
                `;
                    });
                } else {
                    finalGPA = numeral(finalGPA / countFinalGPA).format("0,00.00");
                    printTranscriptHtml += `
                        <tr>
                            <th colspan="2" style="vertical-align: inherit" >
                                    Gross (Total) GPA   ${finalGPA}<br>
                                    Credits Gained &nbsp;&nbsp;&nbsp;  ${credit} credits <br>
                                    Credits Required &nbsp;${stateEx.requiredCredit}  credits
                            </th>
                            <th colspan="9" style="vertical-align: inherit"  rowspan="${stateEx.state.length + 1}">${finalGPA}<br>${credit} credits <br>${stateEx.requiredCredit}  credits</th>

                         </tr>
                `;
                }
            } else {
                printTranscriptHtml += `
                <tr style="border-bottom: 0px !important;border-left: 0px !important;border-right: 0px !important;">
                    <td colspan="11" style="border-bottom: 0px !important;border-left: 0px !important;border-right: 0px !important;"></td>
                </tr>
            `;
            }


            let majorDoc = Sch_Major.findOne({_id: majorId});
            let facultyDoc = Sch_Faculty.findOne({_id: majorDoc.facultyId});
            transcriptDoc.yearFrom = moment(transcriptDoc && transcriptDoc.registerDoc && transcriptDoc.registerDoc.registerDate || "").format("YYYY");
            transcriptDoc.yearTo = yearTo + "";
            data.transcriptDoc = transcriptDoc;
            data.majorDoc = majorDoc;
            data.facultyDoc = facultyDoc;

        }

        data.printTranscriptHtml = printTranscriptHtml;
        return data;
    }
})
;

function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}


function orderByProperty(prop) {
    let args = Array.prototype.slice.call(arguments, 1);
    return function (a, b) {
        let equality = a[prop] - b[prop];
        if (equality === 0 && arguments.length > 1) {
            return orderByProperty.apply(null, args)(a, b);
        }
        return equality;
    };
}

function getNumber(val) {
    let str = "";
    if (val === 1 || val === "1") {
        str = "st"
    } else if (val === 2 || val === "2") {
        str = "nd"
    } else if (val === 3 || val === "3") {
        str = "rd"
    } else if (val === 4 || val === "4") {
        str = "th"
    }
    return str;
}

