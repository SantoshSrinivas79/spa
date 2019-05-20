import {Meteor} from 'meteor/meteor';
import {Pos_Product} from "../../imports/collection/posProduct";
import {Pos_Category} from "../../imports/collection/posCategory";

Meteor.methods({
    api_fetchProduct({name, color}) {
        //let user = Meteor.users.findOne({_id: userId});
        console.log("Call  Api");
        return Pos_Product.find().fetch();
    },
    api_fetchCategory() {
        console.log("Call  Api");
        return Pos_Category.find().fetch();
    }
});

