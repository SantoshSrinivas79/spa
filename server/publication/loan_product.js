import {Meteor} from 'meteor/meteor';
import {publishComposite} from 'meteor/reywood:publish-composite';
import {Loan_ProductReact} from "../../imports/collection/loanProduct";

Meteor.publish('Loan_ProductReact', function () {
    if (this.userId) {
        return Loan_ProductReact.find({});
    }
    return this.ready();

});
