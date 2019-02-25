export const WB_waterBillingSetup = new Mongo.Collection('wb_waterBillingSetup');


WB_waterBillingSetup.schema = new SimpleSchema({
    enName: {
        type: String
    },
    khName: {
        type: String
    },
    ministryEnName: {
        type: String,
        optional: true
    },
    ministryKhName: {
        type: String,
        optional: true
    },
    enShortName: {
        type: String
    },
    khShortName: {
        type: String
    },
    waterBillingUsageShortName: {
        type: String
    },
    rolesArea: {
        type: String
    },
    director: {
        type: String,
        optional: true
    },
    passIfGreaterThan: {
        type: Number,
        optional: true,
        decimal: true
    },
    province: {
        type: String,
        optional: true
    },
    integratedPosAccount: {
        type: Boolean,
        optional: true,
        defaultValue: false,
        label: "Integrated Pos with Account"
    },
    depreciationType: {
        type: String,
        optional: true
    },
    password: {
        type: String,
        optional: true
    },
    depreciationPerTime: {
        type: Number,
        optional: true
    },
    invoiceExpiredAfter: {
        type: Number,
        autoValue() {
            if (this.isInsert) {
                return 7;
            }
        }
    },
    enableZeroWaterConsumption: {
        type: Boolean,
        autoValue() {
            if (this.isInsert) {
                return false;
            }
        }
    },

    makeIn: {
        type: String,
        optional: true,
    },
    baseCurrency: {
        type: String
    },
    roundType: {
        type: String
    },
    khrDigit: {
        type: Number,
        defaultValue: -2
    },
    usdDigit: {
        type: Number,
        defaultValue: 2
    },
    thbDigit: {
        type: Number,
        defaultValue: 0
    },
    cutValue: {
        type: Number,
        defaultValue: 480
    },
    address: {
        type: String,
        optional: true
    },
    khAddress: {
        type: String,
        optional: true
    },
    phoneNumber: {
        type: String,
        optional: true
    },
    email: {
        type: String,
        optional: true
    },
    website: {
        type: String,
        optional: true
    },
    validateStock: {
        type: Boolean,
        optional: true,
        defaultValue: false
    }
});

WB_waterBillingSetup.attachSchema(WB_waterBillingSetup.schema);

export const WB_waterBillingSetupReact = new Mongo.Collection('wb_waterBillingSetupReact');
WB_waterBillingSetupReact.schema = new SimpleSchema({
    createdAt: {
        type: Date,
        optional: true,

        autoValue() {
            if (this.isInsert) {
                return moment().toDate();
            }
        }
    },
    updatedAt: {
        type: Date,
        optional: true,

        autoValue() {
            if (this.isUpdate) {
                return moment().toDate();
            }
        }
    },
    createdUser: {
        type: String,
        optional: true,

        autoValue() {
            if (this.isInsert) {
                return Meteor.userId();
            }
        }
    },
    updatedUser: {
        type: String,
        optional: true,

        autoValue() {
            if (this.isUpdate) {
                return Meteor.userId();
            }
        }
    },
    id: {
        type: String
    }
});

WB_waterBillingSetupReact.attachSchema(WB_waterBillingSetupReact.schema);