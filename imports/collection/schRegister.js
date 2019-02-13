export const Sch_Register = new Mongo.Collection('sch_register');

Sch_Register.schema = new SimpleSchema({
    studentId: {
        type: String,
        label: "Student",
        index: true
    },
    levelId: {
        type: String,
        label: "Level",
        index: true
    },
    majorId: {
        type: String,
        label: "Major",
    },
    programId: {
        type: String
    },
    generation: {
        type: Number
    },
    promotionId: {
        type: String
    },
    classId: {
        type: String,
        optional: true
    },
    term: {
        type: Number
    },
    registerDate: {
        type: Date
    },
    startClassDate: {
        type: Date,
        optional: true
    },
    registerDateName: {
        type: String,
        optional: true
    },
    status: {
        type: String,
        label: "Status",
        optional: true,
        defaultValue: "Active"
        //Active
        //Graduated
        //Dropout
        //Suspend
        //Pass
        //Fail
    },
    note: {
        type: String,
        optional: true
    },
    rolesArea: {
        type: String,
        label: "Role Area",
        index: true
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

Sch_Register.attachSchema(Sch_Register.schema);

export const Sch_RegisterReact = new Mongo.Collection('sch_registerReact');
Sch_RegisterReact.schema = new SimpleSchema({
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

Sch_RegisterReact.attachSchema(Sch_RegisterReact.schema);