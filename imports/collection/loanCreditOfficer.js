export const Loan_CreditOfficer = new Mongo.Collection('loan_creditOfficer');

Loan_CreditOfficer.schema = new SimpleSchema({
    dob: {
        type: Date,
        label: "Date of Birth",
    },
    dobName: {
        type: String,
        label: "Date of Birth",
    },
    startDate: {
        type: Date,
        label: "Start Date",
    },
    startDateName: {
        type: String,
        label: "Start Date",
    },

    status: {
        type: Boolean,
        defaultValue: false,
    },
    name: {
        type: String,
        label: "Name",
    },
    phoneNumber: {
        type: String,
        label: "Phone Number",
    },
    address: {
        type: String,
        label: "Address",
        optional: true
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

Loan_CreditOfficer.attachSchema(Loan_CreditOfficer.schema);

export const Loan_CreditOfficerReact = new Mongo.Collection('loan_creditOfficerReact');
Loan_CreditOfficerReact.schema = new SimpleSchema({
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

Loan_CreditOfficerReact.attachSchema(Loan_CreditOfficerReact.schema);