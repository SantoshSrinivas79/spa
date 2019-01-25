import {Meteor} from 'meteor/meteor';
import {publishComposite} from 'meteor/reywood:publish-composite';
import {Loan_CreditOfficerReact} from "../../imports/collection/loanCreditOfficer";

Meteor.publish('Loan_CreditOfficerReact', function () {
    if (this.userId) {
        return Loan_CreditOfficerReact.find({});
    }
    return this.ready();

});
