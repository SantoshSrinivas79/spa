export const Loan_Config = new Mongo.Collection('loan_config');

Loan_Config.schema = new SimpleSchema({

    methodType: {
        type: String,
        label: "Method Type",
    },
    description: {
        type: String,
        label: "Description",
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

Loan_Config.attachSchema(Loan_Config.schema);

export const Loan_ConfigReact = new Mongo.Collection('loan_configReact');
Loan_ConfigReact.schema = new SimpleSchema({
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

Loan_ConfigReact.attachSchema(Loan_ConfigReact.schema);