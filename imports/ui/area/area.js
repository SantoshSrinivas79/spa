import './area.html';

let indexTmpl = Template.waterBilling_area;
//import schema
import {areaSchema} from '../../collection/area';

indexTmpl.onCreated(function () {
    this.rolesBranch = new ReactiveVar([]);
    this.rolesArea = new ReactiveVar([]);
    this.districtId = new ReactiveVar();
    this.fetchGeoReady = new ReactiveVar(false);
    this.provinceId = new ReactiveVar();
    this.showErr = new ReactiveVar(false);
    this.autorun(() => {
        Meteor.call('fetchRolesBranch', Meteor.userId(), (err, result) => {
            if (result) {
                this.rolesBranch.set(result);
            }
        });
    });
    this.autorun(() => {
        let provinceId = Session.get('rolesArea::provinceId');
        let userId = Meteor.userId();
        if (provinceId && userId) {
            Meteor.call('fetchRolesArea', Meteor.userId(), provinceId, (err, result) => {
                if (result) {
                    this.rolesArea.set(result);
                    this.fetchGeoReady.set(true);
                }
            });
        }
    });
});

indexTmpl.onRendered(function () {
});
indexTmpl.helpers({
    fetchGeoDataReady() {
        let instance = Template.instance();
        return instance.fetchGeoReady.get();
    },
    rolesBranchOptions() {
        let filter = x => x.value !== '';
        let instance = Template.instance();
        return instance && instance.rolesBranch.get().filter(filter) || [];
        ;
    },
    rolesAreaOptions() {
        let filter = x => x.value !== '';
        let instance = Template.instance();
        return instance && instance.rolesArea.get().filter(filter) || [];
    },
    moduleOptions() {
        let list = [];
        let user = Meteor.user();
        let modules = user && user.profile && user.profile.modules.map(o => ({label: iconModule(o), value: o})) || [];
        return [...list, ...modules];
    },
    schema() {
        return areaSchema;
    },
    noArea() {
        return !Session.get('area') && !Session.get('rolesArea::provinceId');
    },
    selectCurrentProvince() {
        let instance = Template.instance();
        return this.value === Session.get('rolesArea::provinceId');
    },
    selectCurrentDistrict() {
        let instance = Template.instance();
        return this.value === (instance.districtId.get() || Session.get('area'));
    },
    currentModule() {
        return this.value === Session.get('module');
    },
    showErr() {
        let instance = Template.instance();
        return instance.showErr.get();
    }
});
indexTmpl.events({
    'click .select-province'(event, instance) {
        Session.set('rolesArea::provinceId', this.value);
        instance.showErr.set(false);
    },
    'click .logout'(event, instance) {
        Meteor.logout(function (err) {
            if (!err) {
                Session.set('area', undefined);
                Session.set('areaName', undefined);
                Session.set('rolesArea::provinceId', undefined);
                Session.set('module', undefined);
                FlowRouter.go('/');
            }
        });
    },
    'click .select-district'(event, instance) {
        instance.districtId.set(this.value);
        instance.showErr.set(false);
    },
    'click .select-module'(event, instance) {
        if (Meteor.userId()) {
            let district = instance.districtId.get() || Session.get('area');
            if (!district) {
                instance.showErr.set(true);
            }
            if (!Session.get('area') || Session.get('area') !== district) {
                Session.set('area', instance.districtId.get());
            }
            Session.set('module', this.value);
            if (FlowRouter.current().path === "/wb-setting/area") {
                FlowRouter.go('/');
            }
        } else {
            instance.showErr.set(true);
        }
    }
});
AutoForm.hooks({
    area: {
        onSubmit(doc) {
            this.event.preventDefault();
            if (doc.area != '') {
                Session.set('area', doc.rolesArea);
            }
            //
            // if (doc.module != '') {
            //     Session.set('module', doc.module);
            // }
            if (FlowRouter.current().path == "/wb-setting/area") {
                FlowRouter.go('/');
            }
            return false;
        }
    }
})


function iconModule(o) {
    let icon = '';
    switch (o) {
        case 'Loan':
            icon = "<i class='material-icons'>monetization_on</i><br> LOAN";
            break;
        case 'Accounting':
            icon = "<i class='material-icons'>account_balance</i> <br>Acc";
            break;
        case 'POS':
            icon = "<i class='material-icons'>shopping_cart</i> <br>POS";
            break;
        case 'School':
            icon = "<i class='material-icons'>school</i> <br>School";
            break;
    }
    return icon;
}