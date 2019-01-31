export const Pos_Customer = new Mongo.Collection('pos_customer');

Pos_Customer.schema = new SimpleSchema({

    name: {
        type: String,
        index: true,

        label: "Name /Company"
    },
    khName: {
        type: String,
        label: "Khmer Name/Company",
        optional: true
    },
    address: {
        type: String,
        label: "Address",
        optional: true
    },
    dob: {
        type: Date,
        label: "Date Of Birth",
        optional: true
    },
    email: {
        type: String,
        optional: true
    },
    phoneNumber: {
        type: String,
        optional: true
    },
    nationId: {
        type: String,
        optional: true
    },
    termId: {
        type: String,
        optional: true
    },
    openingBalance: {
        type: Number,
        decimal: true,
        defaultValue: 0,
        optional: true
    },
    note: {
        type: String,
        optional: true
    },
    rolesArea: {
        type: String,
        label: "Role Area",
        index: true
    },
    createdAt: {
        type: Date,
        optional: true,
        index: true,

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
    invoiceNumber: {
        type: Number,
        defaultValue: 0,
        optional: true
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

Pos_Customer.attachSchema(Pos_Customer.schema);

export const Pos_CustomerReact = new Mongo.Collection('pos_customerReact');
Pos_CustomerReact.schema = new SimpleSchema({
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

Pos_CustomerReact.attachSchema(Pos_CustomerReact.schema);