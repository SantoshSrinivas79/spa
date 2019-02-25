import {Sch_InputScore} from '../../../imports/collection/schInputScore';
import {Sch_Register, Sch_RegisterReact} from '../../../imports/collection/schRegister';
import {Sch_ClassTable} from '../../../imports/collection/schClassTable';

import {SpaceChar} from "../../../both/config.js/space"
import {Sch_Class} from "../../../imports/collection/schClass";
import {Sch_Transcript} from "../../../imports/collection/schTranscript";
import {Sch_Level} from "../../../imports/collection/schLevel";
import {Sch_PromotionReact} from "../../../imports/collection/schPromotion";
import {Sch_Major} from "../../../imports/collection/schMajor";
import {Sch_Ciriculumn} from "../../../imports/collection/schCiriculumn";
import {Sch_ExamDate} from "../../../imports/collection/schExamDate";

Meteor.methods({
    querySchInputScore({q, params, filter, options = {limit: 200, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countSchRegister: 0,
            };
            let selector = {};
            selector.programId = params.programId;
            selector.majorId = params.majorId;
            selector.subjectId = params.subjectId;
            selector.generation = params.generation;
            selector.year = params.year;
            selector.semester = params.semester;
            selector.rolesArea = params.rolesArea;

            let examDateDoc = Sch_ExamDate.findOne({
                programId: params.programId,
                majorId: params.majorId,
                generation: params.generation,
                year: params.year,
                semester: params.semester,
                rolesArea: params.rolesArea
            });
            if (examDateDoc) {
                Sch_ExamDate.update({_id: examDateDoc._id}, {$set: {examDate: params.examDate}});
            } else {
                Sch_ExamDate.insert({
                    programId: params.programId,
                    majorId: params.majorId,
                    generation: params.generation,
                    year: params.year,
                    semester: params.semester,
                    examDate: params.examDate,
                    rolesArea: params.rolesArea
                });
            }

            let shcInputScore = Sch_InputScore.aggregate([
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
                        $sort: {
                            "studentDoc.personal.name": 1
                        }
                    },
                    {
                        $limit: options.limit
                    },
                    {
                        $skip: options.skip
                    }
                ],
                {
                    allowDiskUse: true
                });
            if (shcInputScore.length > 0) {
                data.content = shcInputScore;
                let shcInputScoreTotal = Sch_InputScore.aggregate([
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
                    },
                    {
                        $match: selector
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
                data.countSchInputScore = shcInputScoreTotal[0].total;
            }
            return data;
        }
    },
    generateInsertSchInputScore(params) {
        let selector = {};
        selector.programId = params.programId;
        selector.majorId = params.majorId;
        selector.generation = params.generation;
        selector.rolesArea = params.rolesArea;
        let selectorInputScore = {};
        selectorInputScore.programId = params.programId;
        selectorInputScore.majorId = params.majorId;
        selectorInputScore.generation = params.generation;
        selectorInputScore.year = params.year;
        selectorInputScore.semester = params.semester;
        selectorInputScore.subjectId = params.subjectId;
        let studentAlreadyGenerateList = Sch_InputScore.find(selectorInputScore).fetch().map((obj) => obj.studentId);

        selector.studentId = {$nin: studentAlreadyGenerateList};
        let list = [];
        Sch_Register.find(selector,
            {
                studentId: 1,
                majorId: 1,
                programId: 1,
                generation: 1,
                rolesArea: 1
            }).fetch().map((obj) => {


            list.push({
                _id: obj.studentId + obj.programId + params.subjectId + params.year + params.semester,
                programId: obj.programId,
                majorId: obj.majorId,
                year: params.year,
                semester: params.semester,
                generation: obj.generation,
                subjectId: params.subjectId,
                studentId: obj.studentId,
                score: "",
                grade: "Un Range",
                gradePoint: "Un Range",
                registerId: obj._id,
                rolesArea: obj.rolesArea,
            })

        });
        if (list.length > 0) {
            let doc = Sch_InputScore.rawCollection().insert(list);
            return doc;
        } else {
            return true;
        }
    },
    inputSchScore(data, params, curiculmnDoc) {
        //Meteor.defer(function () {
        let dataTranscript = {};
        dataTranscript.year = params.year;
        dataTranscript.subjectId = params.subjectId;
        dataTranscript.score = data.score;
        dataTranscript.grade = data.grade;
        dataTranscript.gradePoint = data.gradePoint;
        dataTranscript.sem = params.semester;

        if (params.semester === 1) {
            let subDoc = curiculmnDoc.culumnSemester1.find((obj) => {
                return obj.subjectId === params.subjectId;
            })
            dataTranscript.ind = subDoc.ind || 1;
            dataTranscript.credit = subDoc.credit || 1;


        } else if (params.semester === 2) {
            let subDoc = curiculmnDoc.culumnSemester2.find((obj) => {
                return obj.subjectId === params.subjectId;
            })
            dataTranscript.ind = subDoc.ind || 1;
            dataTranscript.credit = subDoc.credit || 1;

        }

        let tranDoc = Sch_Transcript.findOne({studentId: data.studentId, majorId: data.majorId});
        if (tranDoc) {
            if (params.semester === 1) {
                let tran = Sch_Transcript.findOne({
                    studentId: data.studentId,
                    majorId: data.majorId,
                    registerId: data.registerId,
                    culumnSemester1: {
                        $elemMatch: {
                            subjectId: params.subjectId,
                            sem: params.semester,
                            year: params.year
                        }
                    }
                });

                if (tran) {
                    Sch_Transcript.update(
                        {
                            studentId: data.studentId,
                            majorId: data.majorId,
                            registerId: data.registerId,
                            culumnSemester1: {
                                $elemMatch: {
                                    subjectId: params.subjectId,
                                    sem: params.semester,
                                    year: params.year
                                }
                            }
                        },
                        {
                            $set:
                                {
                                    "culumnSemester1.$.score": data.score,
                                    "culumnSemester1.$.grade": data.grade,
                                    "culumnSemester1.$.ind": dataTranscript.ind,
                                    "culumnSemester1.$.credit": dataTranscript.credit,
                                    "culumnSemester1.$.gradePoint": data.gradePoint
                                }
                        });

                } else {
                    Sch_Transcript.update(
                        {studentId: data.studentId, majorId: data.majorId, registerId: data.registerId},
                        {
                            $addToSet:
                                {
                                    culumnSemester1: dataTranscript
                                }
                        });
                }

            } else if (params.semester === 2) {
                let tran = Sch_Transcript.findOne({
                    studentId: data.studentId,
                    majorId: data.majorId,
                    registerId: data.registerId,
                    culumnSemester2: {
                        $elemMatch: {
                            subjectId: params.subjectId,
                            sem: params.semester,
                            year: params.year
                        }
                    }
                });

                if (tran) {
                    Sch_Transcript.update(
                        {
                            studentId: data.studentId,
                            majorId: data.majorId,
                            registerId: data.registerId,
                            culumnSemester2: {
                                $elemMatch: {
                                    subjectId: params.subjectId,
                                    sem: params.semester,
                                    year: params.year
                                }
                            }
                        },
                        {
                            $set:
                                {
                                    "culumnSemester2.$.score": data.score,
                                    "culumnSemester2.$.grade": data.grade,
                                    "culumnSemester2.$.ind": dataTranscript.ind,
                                    "culumnSemester2.$.credit": dataTranscript.credit,
                                    "culumnSemester2.$.gradePoint": data.gradePoint
                                }
                        });

                } else {
                    Sch_Transcript.update(
                        {studentId: data.studentId, majorId: data.majorId, registerId: data.registerId},
                        {
                            $addToSet:
                                {
                                    culumnSemester2: dataTranscript
                                }
                        });
                }

            }
        } else {

            let culumnSemester1 = [];
            let culumnSemester2 = [];

            if (params.semester === 1) {
                culumnSemester1.push(dataTranscript);
            } else if (params.semester === 2) {
                culumnSemester2.push(dataTranscript);
            }

            Sch_Transcript.insert({
                studentId: data.studentId,
                majorId: data.majorId,
                registerId: data.registerId,
                curiculumnId: curiculmnDoc._id || "",
                state: [],
                culumnSemester1: culumnSemester1,
                culumnSemester2: culumnSemester2,
                rolesArea: data.rolesArea
            })
        }

        return Sch_InputScore.update({_id: data._id}, {
            $set: {
                score: data.score,
                grade: data.grade,
                gradePoint: data.gradePoint
            }
        });
        //});
    },

    getTranscript(data) {
        return Sch_Transcript.findOne({studentId: data.studentId, majorId: data.majorId});
    },
    getCuriculmnByMajor(majorId) {
        return Sch_Ciriculumn.findOne({majorId: majorId, status: true});
    }

});

