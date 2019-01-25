import {Meteor} from 'meteor/meteor';
import {publishComposite} from 'meteor/reywood:publish-composite';
import {Loan_PenaltyReact} from "../../imports/collection/loanPenalty";

Meteor.publish('Loan_PenaltyReact', function () {
    if (this.userId) {
        return Loan_PenaltyReact.find({});
    }
    return this.ready();

});
