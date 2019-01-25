export const Loan_PenaltyClosing = new Mongo.Collection('loan_penaltyClosing');

Loan_PenaltyClosing.schema = new SimpleSchema({

    name: {
        type: String,
        label: "Name",
    },
    installmentTermLessThan: {
        type: Number,
        label: "Installment Term Less Than",
        optional: true
    },
    interestReminderCharge: {
        type: Number,
        label: "Interest Reminder Charge %",
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

Loan_PenaltyClosing.attachSchema(Loan_PenaltyClosing.schema);

export const Loan_PenaltyClosingReact = new Mongo.Collection('loan_penaltyClosingReact');
Loan_PenaltyClosingReact.schema = new SimpleSchema({
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

Loan_PenaltyClosingReact.attachSchema(Loan_PenaltyClosingReact.schema);