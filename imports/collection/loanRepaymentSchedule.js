export const Loan_RepaymentSchedule = new Mongo.Collection('loan_repaymentSchedule');

Loan_RepaymentSchedule.schema = new SimpleSchema({
    loanId: {
        type: String,
        label: "Client",
    },
    clientId: {
        type: String,
        label: "Client",
    },
    productId: {
        type: String,
        label: "Product",
    },
    currencyId: {
        type: String,
        label: "Currency",
    },
    installment: {
        type: Number
    },
    amount: {
        type: Number,
        decimal: true
    },
    principle: {
        type: Number,
        decimal: true
    },
    interest: {
        type: Number,
        decimal: true
    },
    date: {
        type: Date,
        label: "RepaymentSchedule Date",
    },
    dateName: {
        type: String,
        label: "RepaymentSchedule Date",
    },
    dayRange: {
        type: Number
    },
    isPaid: {
        type: Boolean,
        defaultValue: false
    },
    isAllowClosing: {
        type: Boolean,
        defaultValue: false
    },
    balanceUnpaid: {
        type: Number,
        decimal: true
    },
    principleUnpaid: {
        type: Number,
        decimal: true
    },
    interestUnpaid: {
        type: Number,
        decimal: true
    },
    paid: {
        type: [Object],
        optional: true,
        blackbox: true
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

Loan_RepaymentSchedule.attachSchema(Loan_RepaymentSchedule.schema);

export const Loan_RepaymentScheduleReact = new Mongo.Collection('loan_repaymentScheduleReact');
Loan_RepaymentScheduleReact.schema = new SimpleSchema({
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

Loan_RepaymentScheduleReact.attachSchema(Loan_RepaymentScheduleReact.schema);