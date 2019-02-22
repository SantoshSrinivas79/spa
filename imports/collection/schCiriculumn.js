export const Sch_Ciriculumn = new Mongo.Collection('sch_ciriculumn');

Sch_Ciriculumn.schema = new SimpleSchema({
    name: {
        type: String,
        label: "Name"
    },
    majorId: {
        type: String,
    },
    desc: {
        type: String,
        optional: true
    },
    status: {
        type: Boolean,
        defaultValue: false
    },
    requiredCredit: {
        type: Number
    },
    culumnSemester1: {
        type: [Object]
    },
    "culumnSemester1.$.year": {
        type: Number
    },
    "culumnSemester1.$.subjectId": {
        type: String
    },
    "culumnSemester1.$.credit": {
        type: Number
    },
    "culumnSemester1.$.ind": {
        type: Number
    },
    "culumnSemester1.$.sem": {
        type: Number
    },
    culumnSemester2: {
        type: [Object]
    },
    "culumnSemester2.$.year": {
        type: Number
    },
    "culumnSemester2.$.subjectId": {
        type: String
    },
    "culumnSemester2.$.credit": {
        type: Number
    },
    "culumnSemester2.$.ind": {
        type: Number
    },
    "culumnSemester2.$.sem": {
        type: Number
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

Sch_Ciriculumn.attachSchema(Sch_Ciriculumn.schema);

export const Sch_CiriculumnReact = new Mongo.Collection('sch_ciriculumnReact');
Sch_CiriculumnReact.schema = new SimpleSchema({
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

Sch_CiriculumnReact.attachSchema(Sch_CiriculumnReact.schema);