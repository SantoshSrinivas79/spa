import {Meteor} from 'meteor/meteor';
import {publishComposite} from 'meteor/reywood:publish-composite';
import {Loan_PenaltyClosingReact} from "../../imports/collection/loanPenaltyClosing";

Meteor.publish('Loan_PenaltyClosingReact', function () {
    if (this.userId) {
        return Loan_PenaltyClosingReact.find({});
    }
    return this.ready();

});
