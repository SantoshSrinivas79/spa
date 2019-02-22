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
            dataTranscript.ind = subDoc.ind;
            dataTranscript.credit = subDoc.credit || 0;


        } else if (params.semester === 2) {
            let subDoc = curiculmnDoc.culumnSemester2.find((obj) => {
                return obj.subjectId === params.subjectId;
            })
            dataTranscript.ind = subDoc.ind;
            dataTranscript.credit = subDoc.credit || 0;

        }

        let tranDoc = Sch_Transcript.findOne({studentId: data.studentId, majorId: data.majorId});
        if (tranDoc) {
            if (params.semester === 1) {
                let tran = Sch_Transcript.findOne({
                    studentId: data.studentId,
                    majorId: data.majorId,
                    registerId: data.registerId,
                    "culumnSemester1.subjectId": params.subjectId,
                    "culumnSemester1.sem": params.semester,
                    "culumnSemester1.year": params.year
                });

                if (tran) {
                    Sch_Transcript.update(
                        {
                            studentId: data.studentId,
                            majorId: data.majorId,
                            registerId: data.registerId,
                            "culumnSemester1.subjectId": params.subjectId,
                            "culumnSemester1.sem": params.semester,
                            "culumnSemester1.year": params.year
                        },
                        {
                            $set:
                                {
                                    "culumnSemester1.$.score": data.score,
                                    "culumnSemester1.$.grade": data.grade,
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
                    "culumnSemester2.subjectId": params.subjectId,
                    "culumnSemester2.sem": params.semester,
                    "culumnSemester2.year": params.year
                });

                if (tran) {
                    Sch_Transcript.update(
                        {
                            studentId: data.studentId,
                            majorId: data.majorId,
                            registerId: data.registerId,
                            "culumnSemester2.subjectId": params.subjectId,
                            "culumnSemester2.sem": params.semester,
                            "culumnSemester2.year": params.year
                        },
                        {
                            $set:
                                {
                                    "culumnSemester2.$.score": data.score,
                                    "culumnSemester2.$.grade": data.grade,
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

