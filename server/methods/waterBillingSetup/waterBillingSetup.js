import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';

Meteor.methods({
    getWaterBillingSetup(area){
        return WB_waterBillingSetup.findOne({});
    }
})