export const Sch_InputScore = new Mongo.Collection('sch_inputScore');

Sch_InputScore.schema = new SimpleSchema({
    registerId: {
        type: String,
    },
    programId: {
        type: String,
    },
    majorId: {
        type: String,
    },
    year: {
        type: Number,
    },
    semester: {
        type: Number,
    },
    generation: {
        type: Number,
    },
    subjectId: {
        type: String,
    },
    studentId: {
        type: String,
    },
    score: {
        type: Number,
        decimal: true
    },
    grade: {
        type: String,
    },
    gradePoint: {
        type: Number,
        decimal: true
    },
    rolesArea: {
        type: String,
        label: "Role Area"
    },
    createdAt: {
        type: Date,
        optional: true,

        autoValue() {
            if (this.isInsert) {
                return moment().toDate();
            }
        },
        index: true
    },
    updatedAt: {
        type: Date,
        optional: true,

        autoValue() {
            if (this.isUpdate) {
                return moment().toDate();
            }
        }
    },
    createdUser: {
        type: String,
        optional: true,

        autoValue() {
            if (this.isInsert) {
                return Meteor.userId();
            }
        }
    },
    updatedUser: {
        type: String,
        optional: true,

        autoValue() {
            if (this.isUpdate) {
                return Meteor.userId();
            }
        }
    }
});

Sch_InputScore.attachSchema(Sch_InputScore.schema);

export const Sch_InputScoreReact = new Mongo.Collection('sch_inputScoreReact');
Sch_InputScoreReact.schema = new SimpleSchema({
    createdAt: {
        type: Date,
        optional: true,

        autoValue() {
            if (this.isInsert) {
                return moment().toDate();
            }
        }
    },
    updatedAt: {
        type: Date,
        optional: true,

        autoValue() {
            if (this.isUpdate) {
                return moment().toDate();
            }
        }
    },
    createdUser: {
        type: String,
        optional: true,

        autoValue() {
            if (this.isInsert) {
                return Meteor.userId();
            }
        }
    },
    updatedUser: {
        type: String,
        optional: true,

        autoValue() {
            if (this.isUpdate) {
                return Meteor.userId();
            }
        }
    },
    id: {
        type: String
    }
});

Sch_InputScoreReact.attachSchema(Sch_InputScoreReact.schema);