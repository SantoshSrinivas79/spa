export const Loan_Penalty = new Mongo.Collection('loan_penalty');

Loan_Penalty.schema = new SimpleSchema({

    name: {
        type: String,
        label: "Name",
    },
    type: {
        type: String,
        label: "Type",
        optional: true
    },
    amountUSD: {
        type: Number,
        label: "Amount",
    },
    amountKHR: {
        type: Number,
        label: "Amount",
    },
    amountTHB: {
        type: Number,
        label: "Amount",
    },
    graceDay: {
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

Loan_Penalty.attachSchema(Loan_Penalty.schema);

export const Loan_PenaltyReact = new Mongo.Collection('loan_penaltyReact');
Loan_PenaltyReact.schema = new SimpleSchema({
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

Loan_PenaltyReact.attachSchema(Loan_PenaltyReact.schema);