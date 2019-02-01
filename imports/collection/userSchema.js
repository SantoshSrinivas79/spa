import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {TAPi18n} from 'meteor/tap:i18n';
import {Manage_Module} from "./manageModule";

// Lib

export const UserSchema = new SimpleSchema({
    profile: {
        type: Object,
        label: 'Profile'
    },
    'profile.approved': {
        type: Boolean,
        label: 'Approved'
    },
    'profile.status': {
        type: String,
        optional: true,
        autoform: {
            type: 'select',
            options() {
                return [
                    {label: 'Enable', value: 'enable'},
                    {label: 'Disable', value: 'disable'}
                ]
            }
        }
    },
    'profile.modules': {
        type: [String],
        label: 'Module',
        autoform: {
            type: 'select-checkbox-inline',
            /* options() {
                 return [
                     {label: "Water Billing", value: "Water Billing"},
                     {label: "Accounting", value: "Accounting"},
                     {label: "POS", value: "POS"}
                 ]
             }*/
        }
    },
    username: {
        type: String,
        label: 'Username',
        unique: true,
        min: 3
    },
    email: {
        type: String,
        label: 'Email',
        unique: true,
        regEx: SimpleSchema.RegEx.Email
    },
    password: {
        type: String,
        label: 'Password',
        min: 6,
    },
    confirmPassword: {
        type: String,
        label: 'Comfirm Password',
        min: 6,
        custom: function () {
            if (this.value !== this.field('password').value) {
                return "passwordMismatch";
            }
        },

    },
    roles: {
        type: [String],
        label: 'Roles',
        autoform: {
            // multiple: true,
            type: 'select-checkbox-inline',
            options() {
                let list = [
                    {label: 'Admin', value: 'admin'},
                    {label: 'Control User', value: 'controlUser'},
                    {label: 'Setting', value: 'setting'},
                    {label: 'Data', value: 'data'},
                    {label: 'Report', value: 'report'},
                    {label: 'Remove', value: 'remove'},
                    {label: 'Update', value: 'update'}


                ]
                let manageModule = Manage_Module.findOne({});
                manageModule.module.forEach((obj) => {
                    if (obj === "POS") {
                        list.push({label: 'Report Customer', value: 'reportCustomer'});
                        list.push({label: 'Report Vendor', value: 'reportVendor'});
                        list.push({label: 'Purchase', value: 'purchase'});
                        list.push({label: 'Sale', value: 'sale'});

                    } else if (obj === "Accounting") {

                    } else if (obj === "Loan") {

                    } else if (obj === "School") {
                        list.push({label: 'Teacher', value: 'teacher'});
                        list.push({label: 'Student', value: 'student'});
                        list.push({label: 'Class Board', value: 'board'});
                        list.push({label: 'Register', value: 'register'});
                        list.push({label: 'Payment', value: 'payment'});

                    }
                })

                return list;
            }
        }
    },
    rolesBranch: {
        type: String,
        label: 'Roles Branch',
        autoform: {
            type: 'select2',
        }
    },
    rolesArea: {
        type: [String],
        label: 'Roles Area',
        autoform: {
            type: 'select-checkbox-inline',
        }
    },
    areaId: {
        type: String,
        optional: true
    }
});

export const UserSchemaReact = new Mongo.Collection('UserSchemaReact');
UserSchemaReact.schema = new SimpleSchema({
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

UserSchemaReact.attachSchema(UserSchemaReact.schema);