export const Pos_Invoice = new Mongo.Collection('pos_invoice');

Pos_Invoice.schema = new SimpleSchema({
    customerId: {
        type: String,
        index: true,
        label: "Customer"
    },

    locationId: {
        type: String,
        index: true,
        label: "Location"
    },
    address: {
        type: String,
        label: "Address",
        optional: true
    },
    termId: {
        type: String
    },
    invoiceDate: {
        type: Date,
        index: true
    },
    invoiceDateName: {
        type: String,
        optional: true
    },
    dueDate: {
        type: Date
    },
    invoiceNo: {
        type: String
    },
    note: {
        type: String,
        optional: true
    },
    paid: {
        type: Number,
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    paidUSD: {
        type: Number,
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    paidKHR: {
        type: Number,
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    paidTHB: {
        type: Number,
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    remainUSD: {
        type: Number,
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    remainKHR: {
        type: Number,
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    remainTHB: {
        type: Number,
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    total: {
        type: Number,
        decimal: true
    },
    netTotal: {
        type: Number,
        decimal: true
    },
    balanceNotCut: {
        type: Number,
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    balanceUnPaid: {
        type: Number,
        decimal: true,
        optional: true,
        defaultValue: 0
    },
    status: {
        type: String,
        index: true,
        defaultValue: "Active"
        //    Active
        //    Partial
        //    Complete
    },
    paymentNumber: {
        type: Number,
        optional: true,
        defaultValue: 0
    },
    imei: {
        type: [Object],
        optional: true,
        blackbox: true
    },
    rolesArea: {
        type: String,
        index: true,
        label: "Role Area"
    },
    item: {
        type: [Object],
        optional: true,
        blackbox: true
    },
    'item.$.itemId': {
        type: String
    },
    'item.$.itemName': {
        type: String
    },
    'item.$.unitId': {
        type: String
    },
    'item.$.unitName': {
        type: String
    },
    'item.$.price': {
        type: Number,
        decimal: true
    },
    'item.$.isRetail': {
        type: Boolean,
        defaultValue: true
    },
    'item.$.unit1': {
        type: Number,
        optional: true,
        decimal: true,
        defaultValue: 1

    },
    'item.$.unit2': {
        type: Number,
        optional: true,
        decimal: true,
        defaultValue: 1
    },
    'item.$.totalUnit': {
        type: Number,
        decimal: true,
        optional: true,
        defaultValue: 1
    },
    'item.$.qty': {
        type: Number
    },
    'item.$.amount': {
        type: Number,
        decimal: true
    },
    'item.$.cost': {
        type: Number,
        decimal: true,
        optional: true
    },
    'item.$.totalCost': {
        type: Number,
        decimal: true,
        optional: true
    },
    'item.$.desc': {
        type: String,
        optional: true
    },
    'item.$.saleOrderId': {
        type: String,
        optional: true
    },
    discountType: {
        type: String,
        defaultValue: "Amount"
    },
    discountValue: {
        type: Number,
        decimal: true,
        defaultValue: 0
    },
    discount: {
        type: Number,
        decimal: true,
        defaultValue: 0
    },
    transactionType: {
        type: String,
        optional: true
    },
    tableId: {
        type: String,
        optional: true
    },
    createdAt: {
        type: Date,
        optional: true,
        index: true,
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
    closeDate: {
        type: Date,
        optional: true
    }

});

Pos_Invoice.attachSchema(Pos_Invoice.schema);

export const Pos_InvoiceReact = new Mongo.Collection('pos_invoiceReact');
Pos_InvoiceReact.schema = new SimpleSchema({
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

Pos_InvoiceReact.attachSchema(Pos_InvoiceReact.schema);