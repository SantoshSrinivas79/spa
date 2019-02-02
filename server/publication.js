import {Meteor} from 'meteor/meteor';
import {publishComposite} from 'meteor/reywood:publish-composite';
import {WB_waterBillingSetup} from "../imports/collection/waterBillingSetup"
import {Acc_Exchange} from "../imports/collection/accExchange"
import {Pos_Invoice} from "../imports/collection/posInvoice"
import {Pos_AverageInventory} from "../imports/collection/posAverageInventory"
import {Pos_Location} from "../imports/collection/posLocation"
import {Pos_Product} from "../imports/collection/posProduct"
import {LoginSetup} from "../imports/collection/loginSetup";
import {Manage_Module} from "../imports/collection/manageModule";
//Water Billing setup
Meteor.publish('wb_waterBillingSetup', function () {
    if (this.userId) {
        return WB_waterBillingSetup.find({});
    }
    return this.ready();

});

//Login Setup
Meteor.publish('loginSetup', function () {
    return LoginSetup.find({});

});
//Login Setup
Meteor.publish('manageModule', function () {
    return Manage_Module.find({});

});
//Exchange
Meteor.publish('Acc_ExchangeActive', function (rolesArea) {
    if (this.userId) {
        return Acc_Exchange.find({status: true});
    }
    return this.ready();

});


//POS Inventory Non Stock
Meteor.publish("pos_inventoryNonStock", function (userId, rolesArea, tranNumber) {
    let user = Meteor.users.findOne({_id: userId || this.userId});
    let mainLocation = Pos_Location.findOne({rolesArea: rolesArea, isMainLocation: true});
    let self = this;
    if (user) {
        if (mainLocation) {
            let inv = Pos_AverageInventory.aggregate([
                    {
                        $match: {
                            averageInventoryDate: {$lte: moment().endOf("days").toDate()},
                            rolesArea: rolesArea,
                            locationId: mainLocation._id
                        }
                    },
                    {
                        $sort: {
                            createdAt: 1
                        }
                    },
                    {
                        $group: {
                            _id: {
                                itemId: "$itemId",
                                locationId: "$locationId",
                            },
                            qtyEnding: {$last: "$qtyEnding"},
                            id: {$last: "$_id"}
                        }
                    },
                    {
                        $lookup: {
                            from: "pos_product",
                            localField: "_id.itemId",
                            foreignField: "_id",
                            as: "productDoc"
                        }
                    },
                    {$unwind: {path: '$productDoc', preserveNullAndEmptyArrays: true}}
                    ,

                    {
                        $project: {
                            itemId: "$_id.itemId",
                            locationId: "$_id.locationId",
                            minimumStock: "$productDoc.minimumStock",
                            qtyEnding: "$qtyEnding",
                            isMinimumStock: {$cond: [{$gt: ["$qtyEnding", "$productDoc.minimumStock"]}, true, false]},
                            id: "$id"

                        }
                    },
                    {
                        $match: {isMinimumStock: false}
                    },
                    {
                        $group: {
                            _id: null,
                            idList: {$push: "$id"}
                        }
                    }

                ]
            );

            self.added('counts', mainLocation._id, {
                count: (inv[0] && inv[0].idList && inv[0].idList.length) || 0
            });
            // return Pos_AverageInventory.find({_id: {$in: inv[0].idList || []}});
        }

    }

    return this.ready();
});
