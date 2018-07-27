import {Sch_Register} from '../../../imports/collection/schRegister';
import {Sch_ClassTable} from '../../../imports/collection/schClassTable';

import {SpaceChar} from "../../../both/config.js/space"
import {Sch_Class} from "../../../imports/collection/schClass";
import {Sch_Transcript} from "../../../imports/collection/schTranscript";
import {Sch_PaymentSchedule} from "../../../imports/collection/schPaymentSchedule";
import {formatCurrency} from "../../../imports/api/methods/roundCurrency";

Meteor.methods({
    schGeneratePaymentSchedule(classDoc, levelDoc, classTableDoc) {
        if (classTableDoc && classTableDoc.studentList && classTableDoc.studentList.length > 0) {
            classTableDoc.studentList.map((obj) => {
                if (obj.isGenerated === undefined || obj.isGenerated === false) {
                    Meteor.call("schGeneratePaymentScheduleAStudent", classDoc, levelDoc, obj);

                    obj.isGenerated = true;
                    return obj;
                }
            });
            Sch_ClassTable.update({_id: classTableDoc._id}, {$set: {studentList: classTableDoc.studentList}});
        }
    },
    schGeneratePaymentScheduleAStudent(classDoc, levelDoc, doc) {
        let order = 1;
        let pricePerUnit = levelDoc.price / levelDoc.term;
        let scheduleDoc = {};
        scheduleDoc.studentId = doc.studentId;
        scheduleDoc.classId = classDoc._id;
        scheduleDoc.levelId = levelDoc._id;
        scheduleDoc.isPaid = false;
        scheduleDoc.discount = 0;
        scheduleDoc.paid = 0;


        for (let i = 1; i <= levelDoc.term; i = i + doc.term) {
            scheduleDoc.order = order;
            scheduleDoc.amount = formatCurrency(pricePerUnit);
            scheduleDoc.rawAmount = formatCurrency(pricePerUnit);
            scheduleDoc.netAmount = formatCurrency(pricePerUnit);
            scheduleDoc.balanceUnPaid = formatCurrency(pricePerUnit);
            scheduleDoc.rolesArea = classDoc.rolesArea;
            scheduleDoc.receivePaymentScheduleDate = doc.startClassDate;
            scheduleDoc.receivePaymentScheduleDateName = moment(doc.startClassDate).format("DD/MM/YYYY");
            let reDoc = Sch_PaymentSchedule.insert(scheduleDoc);
            doc.startClassDate = moment(doc.startClassDate).add(doc.term, "months").toDate();
            order++;
        }
    },
    querySchPaymentScheduleByStudentId(studentId, classId) {
        let studentDoc = Sch_ClassTable.aggregate([
            {$match: {classId: classId}},
            {
                $unwind: {
                    path: "$studentList",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {"studentList.studentId": studentId}
            }
        ]);
        let d = Sch_PaymentSchedule.find({
            studentId: studentId,
            classId: classId,
            isPaid: false,
        }, {$sort: {order: 1}}).fetch();
        d.map((obj) => {
            obj.isShow = true;
            obj.isApplyTerm = false;
            obj.promotionId = studentDoc && studentDoc[0].studentList.promotionId || "";

            return obj;
        });
        return d;
    },
    removePaymentScheduleByClassAndStudent(classId, studentId) {
        return Sch_PaymentSchedule.remove({classId: classId, studentId: studentId});
    }

});