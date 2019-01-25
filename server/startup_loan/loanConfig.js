import {Loan_Config} from '../../imports/collection/loanConfig';


Meteor.startup(function () {
    if (Loan_Config.find().count() == 0) {
        const rawConfig= Loan_Config.rawCollection();
        let us = Meteor.users.findOne({username: "super"});

        rawConfig.insert({
            _id:"001",
            methodType: "Straight Line",
            createdUser: us._id
        });
    }

});
