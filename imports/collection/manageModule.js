export const Manage_Module = new Mongo.Collection('manage_module');

Manage_Module.schema = new SimpleSchema({
    rolesBranch: {
        type: [String],
        label: 'Roles Branch'
    },
    rolesArea: {
        type: [String],
        label: 'Roles Area'
    },
    module: {
        type: [String],
        label: 'Module'
    },
    feature: {
        type: [String]
    },
    name: {
        type: String,
        label: "Name"
    },
    parentName: {
        type: String,
        label: "Name"
    },
    validateReceivePayment: {
        type: Boolean,
        defaultValue: false
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

Manage_Module.attachSchema(Manage_Module.schema);