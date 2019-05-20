export const Pos_Table = new Mongo.Collection('pos_table');

Pos_Table.schema = new SimpleSchema({
    code: {
        type: String,
        label: "Code",
        unique: true,
        max: 7
    },
    name: {
        type: String,
        label: "Name",
        unique: true,
        index: true
    },
    khName: {
        type: String,
        label: "Khmer Name",
        optional: true
    },
    tableLocationId: {
        type: String
    },
    description: {
        type: String,
        label: "Description",
        optional: true
    },
    status: {
        type: Boolean,
        defaultValue: false,
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
    },
    rolesArea: {
        type: String,
        label: "Role Area",
        index: true
    }
});

Pos_Table.attachSchema(Pos_Table.schema);

export const Pos_TableReact = new Mongo.Collection('pos_tableReact');
Pos_TableReact.schema = new SimpleSchema({
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

Pos_TableReact.attachSchema(Pos_TableReact.schema);