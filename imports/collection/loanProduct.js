export const Loan_Product = new Mongo.Collection('loan_product');

Loan_Product.schema = new SimpleSchema({
    currencyId: {
        type: String,
        label: "Currency",
    },
    rate: {
        type: Number,
        decimal: true,
        label: "Rate",
    },
    rateType: {
        type: "String",
        label: "Rate Type"
    },
    productDate: {
        type: Date,
        label: "Product Date",
    },
    productDateName: {
        type: String,
        label: "Product Date",
    },
    status: {
        type: Boolean,
        defaultValue: false,
    },
    name: {
        type: String,
        label: "Name",
    },
    penaltyId: {
        type: String,
        label: "Penalty",
    },
    penaltyClosingId: {
        type: String,
        label: "Penalty Closing",
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

Loan_Product.attachSchema(Loan_Product.schema);

export const Loan_ProductReact = new Mongo.Collection('loan_productReact');
Loan_ProductReact.schema = new SimpleSchema({
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

Loan_ProductReact.attachSchema(Loan_ProductReact.schema);