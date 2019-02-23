export const Pos_Product = new Mongo.Collection('pos_product');

Pos_Product.schema = new SimpleSchema({
    code: {
        type: String,
        label: "Code",
        // unique: true,
    },
    name: {
        type: String,
        label: "Name",
        index: true
    },
    khName: {
        type: String,
        label: "Khmer Name",
        optional: true
    },
    categoryId: {
        type: String,
        label: "SubCategory Of",
        optional: true,
        defaultValue: ""
    },
    description: {
        type: String,
        label: "Description",
        optional: true
    },
    productType: {
        type: String,
        label: "Product Type"
    },
    qtyOnHand: {
        type: Number,
        decimal: true,
        defaultValue: 0,
        optional: true
    },
    whPrice: {
        type: Number,
        decimal: true,
        defaultValue: 0,
        optional: true
    },
    rePrice: {
        type: Number,
        decimal: true,
        defaultValue: 0,
        optional: true
    },
    cost: {
        type: Number,
        decimal: true,
        defaultValue: 0,
        optional: true
    },
    isTaxable: {
        type: Boolean,
        defaultValue: false,
        optional: true
    },
    photo: {
        type: String,
        optional: true
    },
    barcode: {
        type: String,
        optional: true
    },
    unitId: {
        type: String
    },
    minimumStock: {
        type: Number,
        optional: true,
        defaultValue: 0
    },
    createdAt: {
        type: Date,
        optional: true,

        autoValue() {
            if (this.isInsert) {
                return moment().toDate();
            }
        },
        index: true
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
    imageId: {
        type: String,
        optional: true
    },
    imagePath: {
        type: String,
        optional: true
    }
});

Pos_Product.attachSchema(Pos_Product.schema);

export const Pos_ProductReact = new Mongo.Collection('pos_productReact');
Pos_ProductReact.schema = new SimpleSchema({
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

Pos_ProductReact.attachSchema(Pos_ProductReact.schema);