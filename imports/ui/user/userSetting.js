import './userSetting.html';
import {FlowRouter} from 'meteor/kadira:flow-router'
import {Template} from 'meteor/templating'
// import collection
import {UserSchema} from '../../collection/userSchema';
import moment from "moment";

let index = Template.wb_userSetting,
    // userSettingOptions = Template.wb_userSettingOptions,
    addTmpl = Template.wb_userAdd,
    editTmpl = Template.wb_userSettingEdit;

/*index.helpers({
    selector() {
        return {username: {$ne: 'super'}}
    },
    dataTable() {
        return UserSettingTabular
    }
});*/
import wbUserSetting from '/imports/vue/ui/userSetting';

index.onRendered(function () {
    new Vue({
        render: h => h(wbUserSetting)
    }).$mount('wb_userSetting');
});

index.onDestroyed(function () {
    $('.wb_userSetting').remove();
});


/*index.events({
    'dblclick tbody > tr'(event, instance) {
        let dataTalbe = $(event.currentTarget).closest('table').DataTable();
        let rowData = dataTalbe.row(event.currentTarget).data();
        FlowRouter.go(`/wb-setting/user-setting/${rowData._id}/edit`);
    },
    'click .edit'(e, t) {
        let doc = this;
        FlowRouter.go(`/wb-setting/user-setting/${doc._id}/edit`);
    },
    'click .remove'(event, instance) {
        var self = this;
        alertify.confirm(
            "Remove User",
            "Are you sure to delete [" + self.username + "]?",
            function () {
                if (Meteor.userId() == self._id) {
                    Materialize.toast("You can not remove your own account while logging in", 3000, 'red rounded')
                } else {
                    Meteor.call('wb.removeUser', {userId: self._id}, function (error, result) {
                        if (error) {
                            // alertify.error(error.message);
                            Materialize.toast(error.message, 3000, 'red rounded');
                        } else {
                            // alertify.success("Success");
                            Materialize.toast('Successful', 3000, 'lime accent-4 rounded');
                        }
                    })
                }
            },
            null
        );
    }
});*/

/*userSettingOptions.onRendered(function () {
    $('.dropdown-button').dropdown()
});*/
addTmpl.onCreated(function () {
    this.geoProvinces = new ReactiveVar([]);
    this.geoArea = new ReactiveVar([]);
    this.provinceId = new ReactiveVar();
    this.moduleOpt = new ReactiveVar([]);

    let moduleListRaw = [{label: "School", value: "School"},
        {label: "Accounting", value: "Accounting"},
        {label: "POS", value: "POS"}];
    let moduleList = [];
    Meteor.call("queryManageModule", (err, result) => {
        if (result) {
            moduleListRaw.forEach((obj) => {
                if (result.module.indexOf(obj.value) > -1) {
                    moduleList.push(obj);
                }
            })
            this.moduleOpt.set(moduleList);
        }
    });


    Meteor.call('fetchProvinces', (err, result) => {
        if (result) {
            this.geoProvinces.set(result);
        }
    });
    this.autorun(() => {
        let provinceId = this.provinceId.get();
        if (provinceId) {
            Meteor.call('fetchDistricts', provinceId, (err, result) => {
                if (result) {
                    this.geoArea.set(result);
                }
            });
        }
    });
});
addTmpl.onRendered(function () {
    // $('[name="rolesArea"]').select2();
    // $('[name="rolesBranch"]').select2();
});
addTmpl.helpers({
    schema() {
        return UserSchema
    },
    area() {
        return Session.get('area');
    },
    geoProvinces() {
        let instance = Template.instance();
        return instance && instance.geoProvinces.get() || [];
    },
    geoArea() {
        let filter = x => x.value !== '';
        let instance = Template.instance();
        return instance && instance.geoArea.get().filter(filter);
    },
    moduleOption() {
        let instance = Template.instance();
        return instance && instance.moduleOpt.get() || [];
    }
});
addTmpl.events({
    'change [name="rolesBranch"]'(event, instance) {
        let currentValue = event.currentTarget.value;
        if (currentValue !== '') {
            instance.provinceId.set(currentValue);
        }
    }
});
editTmpl.onCreated(function () {
    this.subUserReady = new ReactiveVar(false);
    this.userData = new ReactiveVar([]);
    this.geoProvinces = new ReactiveVar([]);
    this.geoArea = new ReactiveVar([]);
    this.provinceId = new ReactiveVar();
    this.requestMethodReady = new ReactiveVar(false);

    this.moduleOpt = new ReactiveVar([]);

    let moduleListRaw = [{label: "School", value: "School"}];
    let moduleList = [];
    Meteor.call("queryManageModule", (err, result) => {
        if (result) {
            moduleListRaw.forEach((obj) => {
                if (result.module.indexOf(obj.value) > -1) {
                    moduleList.push(obj);
                }
            });
            this.moduleOpt.set(moduleList);
        }
    });


    Meteor.call('fetchProvinces', (err, result) => {
        if (result) {
            this.geoProvinces.set(result);
        }
    });
    this.autorun(() => {
        let paramUid = FlowRouter.getParam('userId');
        if (paramUid) {
            Meteor.call('_getUser', {_id: paramUid}, (err, result) => {
                if (result) {
                    this.userData.set(result);
                    this.subUserReady.set(true);
                    if (result.rolesBranch) {
                        this.provinceId.set(result.rolesBranch);
                    }
                    this.requestMethodReady.set(true);
                }
            });
        }
    });
    this.autorun(() => {
        let provinceId = this.provinceId.get();
        if (provinceId) {
            Meteor.call('fetchDistricts', provinceId, (err, result) => {
                if (result) {
                    this.geoArea.set(result);
                }
            });
        }

    });
});
editTmpl.onRendered(function () {
    this.autorun(() => {
        if (this.requestMethodReady.get()) {
            Meteor.setTimeout(function () {
                $('[name="rolesBranch"]').select2();
            }, 500);
        }
    });
});
editTmpl.helpers({
    subscriptionsReady() {
        let instance = Template.instance();
        return instance.subUserReady.get()
    },
    schema() {
        return UserSchema
    },
    data() {
        let instance = Template.instance();
        let user = instance.userData.get();
        return user
    },
    area() {
        return Session.get('area');
    },
    geoProvinces() {
        let instance = Template.instance();
        return instance && instance.geoProvinces.get() || [];
    },
    geoArea() {
        let filter = x => x.value !== '';
        let instance = Template.instance();
        return instance && instance.geoArea.get().filter(filter) || []

    },
    moduleOption() {
        let instance = Template.instance();
        return instance && instance.moduleOpt.get() || [];
    }
});

editTmpl.events({
    'change [name="rolesBranch"]'(event, instance) {
        let currentValue = event.currentTarget.value;
        if (currentValue !== '') {
            instance.provinceId.set(currentValue);
        }
    }
});
AutoForm.hooks({
    wb_userEdit: {
        onSuccess(formType, result) {
            FlowRouter.query.unset();
            Meteor.call("userSchemaReact", moment().toDate().getTime());
            FlowRouter.go('wb.userSetting');
        },
        onError(formType, err) {
            FlowRouter.query.unset();
        }
    },
    wb_userAdd: {
        onSuccess(formType, result) {
            Meteor.call("userSchemaReact", moment().toDate().getTime());
            Meteor.setTimeout(function () {
                FlowRouter.query.unset();
            }, 500);
        },
        onError(formType, err) {
            Meteor.setTimeout(function () {
                FlowRouter.query.unset();
                Materialize.toast(err.message, 3000, 'red rounded');
            }, 500);
        }
    }
});