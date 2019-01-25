import {Meteor} from 'meteor/meteor';
import {publishComposite} from 'meteor/reywood:publish-composite';
import {Loan_ConfigReact} from "../../imports/collection/loanConfig";

Meteor.publish('Loan_ConfigReact', function () {
    if (this.userId) {
        return Loan_ConfigReact.find({});
    }
    return this.ready();

});
