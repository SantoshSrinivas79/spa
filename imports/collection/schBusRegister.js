export const Sch_BusRegister = new Mongo.Collection('sch_busRegister');

Sch_BusRegister.schema = new SimpleSchema({
    studentId: {
        type: String,
        label: "Student"
    },
    busId: {
        type: String,
        label: "Bus",
    },
    busStopId: {
        type: String,
        label: "Bus Stop",
    },
    promotionId: {
        type: String
    },
    busRegisterDate: {
        type: Date
    },

    busRegisterDateName: {
        type: String,
        optional: true
    },
    paidUntilDate: {
        type: Date,
        optional: true
    },
    price: {
        type: Number,
        decimal: true,

    },
    busStopType: {
        type: String
    },
    status: {
        type: String,
        label: "Status",
        optional: true,
        defaultValue: "Active"
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
    }
});

Sch_BusRegister.attachSchema(Sch_BusRegister.schema);