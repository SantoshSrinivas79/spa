import {Sch_Register} from '../../../imports/collection/schRegister';
import {Sch_RegisterReact} from '../../../imports/collection/schRegister';
import {Sch_ClassTable} from '../../../imports/collection/schClassTable';

import {SpaceChar} from "../../../both/config.js/space"
import {Sch_Class} from "../../../imports/collection/schClass";
import {Sch_Transcript} from "../../../imports/collection/schTranscript";
import {Sch_Level} from "../../../imports/collection/schLevel";
import {Sch_PromotionReact} from "../../../imports/collection/schPromotion";

Meteor.methods({
    querySchInputScore({q, params, filter, options = {limit: 100, skip: 0}}) {
        if (Meteor.userId()) {
            let data = {
                content: [],
                countSchRegister: 0,
            };
            let selector = {};
            selector.programId = params.programId;
            selector.majorId = params.majorId;
            selector.generation = params.generation;


            let shcRegisters = Sch_Register.aggregate([
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
                },
                {
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
            ]);
            if (shcRegisters.length > 0) {
                data.content = shcRegisters;
                let shcRegisterTotal = Sch_Register.aggregate([
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
                data.countSchInputScore = shcRegisterTotal[0].total;
            }
            return data;
        }
    }
});

