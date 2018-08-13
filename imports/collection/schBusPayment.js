export const Sch_BusPayment = new Mongo.Collection('sch_busPayment');

Sch_BusPayment.schema = new SimpleSchema({
    busRegisterId: {
        type: String,
        label: "Bus Register"
    },
    studentId: {
        type: String,
        label: "Student"
    },
    schedule: {
        type: [Object],
        optional: true,
        blackbox: true
    },
    'schedule.$.dueDate': {
        type: Date
    },
    'schedule.$.amount': {
        type: Number,
        decimal: true
    },
    'schedule.$.paid': {
        type: Number,
        decimal: true
    },
    'schedule.$.waived': {
        type: Number,
        decimal: true
    },
    'schedule.$.desc': {
        type: String,
        optional: true
    },
    busPaymentDate: {
        type: Date,
        label: 'Receive BusPayment Date'
    },
    busPaymentDateName: {
        type: String,
        optional: true
    },
    totalAmount: {
        type: Number,
        label: "Total Amount",
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    totalPaid: {
        type: Number,
        label: "Paid",
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    totalWaived: {
        type: Number,
        label: "Discount",
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    rolesArea: {
        type: String,
        optional: true
    },
    canRemove: {
        type: Boolean,
        defaultValue: true,
        optional: true
    },
    note: {
        type: String,
        optional: true
    },
    busPaymentNo: {
        type: String,
        optional: true
    },
    penalty: {
        type: Number,
        decimal: true
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
Sch_BusPayment.attachSchema(Sch_BusPayment.schema);