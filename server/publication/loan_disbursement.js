import {Meteor} from 'meteor/meteor';
import {publishComposite} from 'meteor/reywood:publish-composite';
import {Loan_DisbursementReact} from "../../imports/collection/loanDisbursement";

Meteor.publish('Loan_DisbursementReact', function () {
    if (this.userId) {
        return Loan_DisbursementReact.find({});
    }
    return this.ready();

});
