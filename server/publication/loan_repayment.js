import {Meteor} from 'meteor/meteor';
import {publishComposite} from 'meteor/reywood:publish-composite';
import {Loan_RepaymentReact} from "../../imports/collection/loanRepayment";

Meteor.publish('Loan_RepaymentReact', function () {
    if (this.userId) {
        return Loan_RepaymentReact.find({});
    }
    return this.ready();

});
