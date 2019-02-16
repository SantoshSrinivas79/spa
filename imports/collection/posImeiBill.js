export const Pos_ImeiBill = new Mongo.Collection('pos_imeiBill');

Pos_ImeiBill.schema = new SimpleSchema({
    name: {
        type: String,
        label: "Name",
    },
    billId:{
        type:String,
        label:"Bill Id"
    },
    itemId:{
        type:String,
        label:"Item Id"
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

Pos_ImeiBill.attachSchema(Pos_ImeiBill.schema);

export const Pos_ImeiBillReact = new Mongo.Collection('pos_imeiBillReact');
Pos_ImeiBillReact.schema = new SimpleSchema({
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

Pos_ImeiBillReact.attachSchema(Pos_ImeiBillReact.schema);