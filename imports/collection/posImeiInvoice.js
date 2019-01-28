export const Pos_ImeiInvoice = new Mongo.Collection('pos_imeiInvoice');

Pos_ImeiInvoice.schema = new SimpleSchema({
    name: {
        type: String,
        label: "Name",
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
    },
    imageId: {
        type: String,
        optional: true
    },
    imagePath: {
        type: String,
        optional: true
    }
});

Pos_ImeiInvoice.attachSchema(Pos_ImeiInvoice.schema);

export const Pos_ImeiInvoiceReact = new Mongo.Collection('pos_imeiInvoiceReact');
Pos_ImeiInvoiceReact.schema = new SimpleSchema({
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

Pos_ImeiInvoiceReact.attachSchema(Pos_ImeiInvoiceReact.schema);