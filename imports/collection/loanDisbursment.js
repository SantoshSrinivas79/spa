export const Loan_Disbursement = new Mongo.Collection('loan_disbursement');

Loan_Disbursement.schema = new SimpleSchema({
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
    loanAmount: {
        type: Number,
        decimal: true,
        label: "Amount",
    },
    projectInterest: {
        type: Number,
        decimal: true,
        label: "Interest",
    },
    disbursementDate: {
        type: Date,
        label: "Disbursement Date",
    },
    disbursementDateName: {
        type: String,
        label: "Disbursement Date",
    },
    coId: {
        type: String,
        label: "Credit Officer",
    },
    status: {
        type: String,
        defaultValue: "Active",
    },
    description: {
        type: String,
        label: "Description",
        optional: true
    },
    paymentNumber: {
        type: Number,
        label: "Payment Number",
        optional: true,
        defaultValue: 0
    },
    feeAmount: {
        type: Number,
        decimal: true,
        label: "Fee Amount",
        optional: true,
        defaultValue: 0
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

Loan_Disbursement.attachSchema(Loan_Disbursement.schema);

export const Loan_DisbursementReact = new Mongo.Collection('loan_disbursementReact');
Loan_DisbursementReact.schema = new SimpleSchema({
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

Loan_DisbursementReact.attachSchema(Loan_DisbursementReact.schema);