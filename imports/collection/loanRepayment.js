export const Loan_Repayment = new Mongo.Collection('loan_repayment');

Loan_Repayment.schema = new SimpleSchema({
    clientId: {
        type: String,
        label: "Client",
    },
    disbursementId: {
        type: String,
        label: "Client",
    },
    currencyId: {
        type: String,
        label: "Currency",
    },
    type: {
        type: String,
    },
    repaymentDate: {
        type: Date,
        label: "Repayment Date",
    },
    repaymentDateName: {
        type: String,
        label: "Repayment Date",
    },
    paid: {
        type: Number,
        decimal: true
    },
    penaltyPaid: {
        type: Number,
        decimal: true
    },
    principlePaid: {
        type: Number,
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    interestPaid: {
        type: Number,
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    penalty: {
        type: Number,
        decimal: true
    },
    interestReminderCharge: {
        type: Number,
        decimal: true,
        defaultValue: 0,
        optional: true
    },
    interestReminderChargePaid: {
        type: Number,
        decimal: true,
        defaultValue: 0,
        optional: true
    },
    totalPaid: {
        type: Number,
        decimal: true
    },
    voucher: {
        type: String,
    },
    note: {
        type: String,
        optional: true
    },
    dayLate: {
        type: Number
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
    }, rolesArea: {
        type: String,
        label: "Role Area",
        index: true
    }
});

Loan_Repayment.attachSchema(Loan_Repayment.schema);

export const Loan_RepaymentReact = new Mongo.Collection('loan_repaymentReact');
Loan_RepaymentReact.schema = new SimpleSchema({
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

Loan_RepaymentReact.attachSchema(Loan_RepaymentReact.schema);