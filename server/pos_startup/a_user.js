import {Accounts} from "meteor/accounts-base";


Meteor.startup(function () {
    if (Meteor.users.find().count() <= 0) {
        let superId = Accounts.createUser({
            username: 'super',
            email: 'super@navi.com',
            password: 'superh2e@123',
            approved: true
        });
    }

});
