<template>
    <div class="pos_SaleCoffee">
        <body class="custom-login-background-coffee">

        <div class="card card-stats" style="background-color: black !important; color:white !important;">
            <!--<div class="card-header card-header-icon" data-background-color="white">
                <img style="width: 100px;height: 100px;vertical-align: baseline !important;"
                     src="/mih.png"
                     alt="">
            </div>-->
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <p>Login As : {{username}}</p>
                    <p>Today : {{todaySt}}</p>
                    <p>Time : {{timeSt}}</p>
                </el-col>
                <el-col :span="16" style="text-align: right; margin-right: 10px">
                    <br>
                    <el-row type="flex" justify="center">
                        <el-col :span="2"></el-col>
                        <el-col :span="9" style="font-family: 'Khmer OS Freehand';text-align: left !important;"><h2>
                            {{langConfig['selectCategory']}}</h2>
                        </el-col>
                        <el-col :span="12">
                            <!--<el-input
                                    :placeholder="langConfig['searchHere']"
                                    suffix-icon="el-icon-search"
                                    v-model="searchData"
                            >
                            </el-input>-->
                            <el-button type="success" @click="dialogPayMoney=true"><i
                                    class="fa fa-print"></i>&nbsp; {{langConfig['pay']}} <i>( + )</i>
                            </el-button>

                            <el-button type="primary" @click.native="savePosSaleCoffee(true,$event,false)"><i
                                    class="el-icon-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i>
                            </el-button>

                            <el-button type="warning"
                                       @click.native="resetForm()"><i
                                    class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['reset']}} <i>(ESC)</i>
                            </el-button>

                        </el-col>
                        <el-col :span="1">
                            <el-button type="danger" round
                                       @click="goToInvoice">
                                <i class="fa fa-close"></i>
                            </el-button>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
            <hr style="margin-top: 0px !important;margin-bottom: 5px !important;">
            <el-row style="padding-right: 50px !important;">
                <el-col v-if="isCategoryData" :span="1" v-for="(o, index) in categoryData" :key="o._id"
                        :offset="index > 0 ? index%6===0 ? 2 : 3 : 1">
                    <el-card style="width: 180px !important;" :body-style="{ padding: '0px' }"
                    >
                        <img :src="o.imagePath" class="image-category" @click="queryProductByCategoryId(o._id)">
                        <div style="padding: 14px;" @click="queryProductByCategoryId(o._id)">
                            <span>{{o.name}}</span>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <hr style="margin-top: 5px !important;margin-bottom: 5px !important;">
            <slot v-if="loading">
                <div class="row">
                    <div class="col-md-12" style="padding: 30px; margin-top: 70px">
                        <!--<loader></loader>-->
                    </div>
                </div>
            </slot>
            <slot v-else>
                <el-form :model="posSaleCoffeeForm" :rules="rules" :ref="refForm" label-width="120px"
                         :label-position="labelPosition"
                         class="posSaleCoffeeForm"
                         style="background-color: black !important;min-height:100% !important;">
                    <el-row :gutter="20">
                        <el-col :span="16" class="posSaleCoffeeForm"
                                style=" padding-bottom: 40px !important;padding-left: 0px !important;margin-top: 15px !important; background-color: black !important;">
                            <div style="height: 560px !important;overflow-y: scroll !important;">
                                <el-row style="padding-right: 90px !important;">
                                    <el-col :span="1" v-for="(productDoc, index) in productData" :key="productDoc._id"
                                            :offset="index > 0 ? index%5===0 ? 2: 4 : 2"
                                            style="margin-bottom: 20px !important;">
                                        <el-card style="width: 130px !important;z-index: 0"
                                                 :body-style="{ padding: '0px' }"
                                        >
                                            <img :src="productDoc.imagePath" class="image">
                                            <el-button type="primary" size="mini" class="plan-ribbon-btn1"
                                                       @click="handleClickBtn(productDoc,'S',index)"
                                                       circle>S
                                            </el-button>
                                            <b style="padding-top: 50px"></b>
                                            <el-button type="success" size="mini"
                                                       @click="handleClickBtn(productDoc,'L',index)"
                                                       class="plan-ribbon-btn2" circle>L
                                            </el-button>
                                            <div style="padding: 4px;">

                                                <div style="height: 46px !important; text-align: center !important;">
                                                    {{productDoc.name}}
                                                </div>


                                                <hr style="margin-top: 5px !important;margin-bottom: 5px !important;">
                                                <span class="label"
                                                      style="background-color: #409EFF">{{productDoc.smallQty}}</span>
                                                <span class="label"
                                                      style="background-color: #5daf34">{{productDoc.largeQty}}</span>

                                                <span class="label"
                                                      style="background-color: gray;float: right !important;">{{productDoc.type || ""}}</span>


                                                <el-input-number controls-position="right"
                                                                 style="width: 100% !important;"
                                                                 v-model=productDoc.qty
                                                                 @change="handleChange(productDoc,$event)"
                                                                 @keyup="handleChange(productDoc,$event)"
                                                                 :min="0"
                                                                 :disabled=productDoc.disableInputQty
                                                                 :max="999">
                                                </el-input-number>
                                            </div>


                                        </el-card>


                                    </el-col>
                                </el-row>
                            </div>

                        </el-col>
                        <el-col :span="8" style="background-color: black !important;">
                            <div class="w3-code-coffee">
                                <div class="ui segments plan">
                                    <div class="ui top attached segment teal inverted plan-title">
                                        <span class="plan-ribbon red">{{posSaleCoffeeForm.discountValue}}{{currencySymbol}}</span>
                                        <span class="ui header">{{langConfig['balanceDue']}}</span>

                                    </div>
                                    <div class="ui  attached segment feature">
                                        <div class="amount">
                                            {{posSaleCoffeeForm.balanceUnPaid}}{{currencySymbol}}
                                        </div>
                                    </div>
                                </div>
                                <el-row>
                                    <el-col :span="12">
                                        <el-form-item
                                                prop="tableId">

                                            <el-select style="display: block !important"
                                                       filterable clearable
                                                       v-model="posSaleCoffeeForm.tableId"
                                                       :placeholder="langConfig['tableNumber']">
                                                <el-option
                                                        v-for="item in tableOption"
                                                        :key="item.value"
                                                        :label="item.label"
                                                        :value="item.value"
                                                        :disabled="item.disabled">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="1">&nbsp;</el-col>
                                    <el-col :span="11">
                                        <el-form-item prop="note">
                                            <el-input type="textarea" v-model="posSaleCoffeeForm.note"
                                                      :placeholder="langConfig['note']"
                                                      :rows="1"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>


                                <el-table
                                        :data="posSaleCoffeeData"
                                        height="350"
                                        style="width: 100%">
                                    <el-table-column
                                            type="index"
                                            :label="langConfig['no']"
                                            width="50"
                                    >

                                    </el-table-column>
                                    <el-table-column
                                            prop="itemName"
                                            :label="langConfig['name']">
                                        <template slot-scope="scope">
                                            <span>{{scope.row.itemName}} ({{scope.row.type}})</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                            prop="qty"
                                            :label="langConfig['qty']"
                                    >
                                        <template slot-scope="scope">
                                            <el-input-number controls-position="right"
                                                             placeholder="Please input Qty"
                                                             size="mini"
                                                             v-model.number=scope.row.qty type='number'
                                                             @keyup="updatePosSaleCoffeeDetail(scope.row, scope.$index,$event)"
                                                             @change="updatePosSaleCoffeeDetail(scope.row, scope.$index,$event)">
                                            </el-input-number>
                                        </template>
                                    </el-table-column>

                                    <el-table-column
                                            prop="amount"
                                            :label="langConfig['amount']">
                                    </el-table-column>
                                </el-table>
                            </div>

                        </el-col>
                    </el-row>
                </el-form>
                <br>
            </slot>
            <!--End Pagination-->
        </div>
        </body>

        <el-dialog
                :title="langConfig['pay']"
                :visible.sync="dialogPayMoney"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posSaleCoffeeForm" :rules="rules" ref="posSaleCoffeeFormPayment" label-width="120px"
                     class="posSaleCoffeeForm">
                <div class="ui segments plan">
                    <div class="ui top attached segment teal inverted plan-title">
                        <span class="plan-ribbon red">{{posSaleCoffeeForm.discountValue}}{{currencySymbol}}</span>
                        <span class="ui header">{{langConfig['balanceDue']}}</span>

                    </div>
                    <div class="ui  attached segment feature">
                        <div class="amount">
                            {{posSaleCoffeeForm.balanceUnPaid}}{{currencySymbol}}
                        </div>
                    </div>
                </div>


                <el-form-item :label="langConfig['discount']">
                    <el-row>
                        <el-col :span="14">
                            <el-radio-group v-model="posSaleCoffeeForm.discountType">
                                <el-radio-button v-for="mt in discountTypeOption" :label="mt.value"
                                                 :key="mt.value"
                                >
                                    {{langConfig[mt.label]}}
                                </el-radio-button>

                            </el-radio-group>
                        </el-col>
                        <el-col :span="10">
                            <el-input :label="langConfig['discount']" placeholder="Amount Discount" prop="discount"
                                      v-model.number="posSaleCoffeeForm.discount" type='number'>
                                <template slot="append">{{typeDiscount}}</template>
                            </el-input>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item :label="langConfig['netTotal']">

                    <el-input :placeholder="langConfig['netTotal']"
                              v-model.number="posSaleCoffeeForm.netTotal"
                              disabled>
                        <template slot="append">{{currencySymbol}}</template>
                    </el-input>
                </el-form-item>
                <el-form-item :label="langConfig['paidDollar']">

                    <el-input placeholder="USD"
                              v-model.number="posSaleCoffeeForm.paidUSD"
                              type='number'
                              @change.native="getTotal()" @focus.native="clearZero($event)"
                              @keyup.native="getTotal()"

                    >
                        <el-button slot="append" @click="clickUSD(posSaleCoffeeForm.remainUSD)">
                            {{posSaleCoffeeForm.remainUSD}} $
                        </el-button>
                    </el-input>
                </el-form-item>

                <el-form-item :label="langConfig['paidRiel']">


                    <el-input placeholder="KHR" @change="getTotal()"
                              @keyup.native="getTotal()"
                              v-model.number="posSaleCoffeeForm.paidKHR" type='number'
                    >
                        <el-button slot="append" @click="clickKHR(posSaleCoffeeForm.remainKHR)">
                            {{posSaleCoffeeForm.remainKHR}} ៛
                        </el-button>
                    </el-input>
                </el-form-item>
                <el-form-item :label="langConfig['paidBaht']">

                    <el-input placeholder="THB"
                              v-model.number="posSaleCoffeeForm.paidTHB"
                              type='number'
                              @change="getTotal()"
                              @keyup.native="getTotal()"
                    >
                        <el-button slot="append" @click="clickTHB(posSaleCoffeeForm.remainTHB)">
                            {{posSaleCoffeeForm.remainTHB}} B
                        </el-button>
                    </el-input>
                </el-form-item>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button type="primary" @click="savePosSaleCoffee(true,$event,true)">{{langConfig['pay']}} <i>(Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>


    </div>
</template>

<!--<script src="cleave-phone.{country}.js"></script>-->
<script>
    import draggable from 'vuedraggable';
    import {formatCurrency} from "../../../imports/api/methods/roundCurrency";
    import {formatCurrencyLast} from "../../../imports/api/methods/roundCurrency";
    import {GeneralFunction} from "../../../imports/api/methods/generalFunction";
    import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency";
    import {WB_waterBillingSetup} from "../../collection/waterBillingSetup";
    // require('cleave.js/dist/addons/cleave-phone.ac');
    // require('cleave.js/dist/addons/cleave-phone.{country}');
    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Pos_InvoiceReact} from "../../collection/posInvoice";

    export default {
        meteor: {
            langSession() {
                return Session.get('lang') || "en";
            },
            disabledRemove() {
                return Session.get("canRemove");
            },
            disabledUpdate() {
                return Session.get("canUpdate");
            }
        },
        components: {
            draggable
        },
        data() {
            return {
                keyCode: [],
                refForm: 'posSaleCoffeeFormAdd',
                multipleSelection: [],
                posInvoiceId: "",
                loading: false,
                searchData: '',
                isSearching: false,
                typeDiscount: "",
                categoryData: [],
                productData: [],
                productDataAll: [],
                currencySymbol: "",
                posSaleCoffeeData: [],
                dialogPayMoney: false,

                posSaleCoffeeForm: {
                    itemId: "",
                    itemName: "",
                    price: 0,
                    qty: 0,
                    amount: 0,
                    total: 0,
                    netTotal: 0,
                    balanceUnPaid: 0,
                    paid: 0,
                    invoiceDate: moment().toDate(),
                    dueDate: moment().add(1, "month").toDate(),
                    invoiceNo: "",

                    note: "",

                    discountType: "Amount",
                    discount: 0,
                    discountValue: 0,
                    termId: "",
                    address: "",
                    customerId: "",

                    isRetail: true,
                    paidUSD: 0,
                    paidKHR: 0,
                    paidTHB: 0,

                    remainUSD: 0,
                    remainKHR: 0,
                    remainTHB: 0,
                    unit1: 1,
                    unit2: 1,
                    totalUnit: 1,
                    desc: "",
                    tableId: "",
                    rawQty: 0,
                    isReceiveAll: false,
                    balanceNotCut: 0,
                    balanceNotCutFull: 0,
                    code: ""

                },
                rules: {
                    tableId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Table',
                        trigger: 'change'
                    }],
                },

                // Options
                itemOption: [],
                customerOption: [],
                termOption: [],

                dialog: true,
                notifications: false,
                sound: true,
                widgets: false,
                labelPosition: "top",
                options: {
                    disabledDate(time) {
                        return false;
                    }
                },
                disabledDate: false,
                closeDate: "",
                type: "",
                posSaleCoffeeDetail: {},
                discountTypeOption: [
                    {label: "amountDiscount", value: "Amount"},
                    {label: "percent", value: "Percent"}
                ],
                tableOption: [],
                disabledItem: true,
                timeStamp: [],
                takeBarcode: '',
                skip: 0,
                waterBillingSetup: {},
                username: Meteor.user().username,
                todaySt: "",
                timeSt: "",
                isCategoryData: false,
                qty: 0
            }
        },
        mounted() {
            this.$jQuery('body').off();
            let vm = this;
            vm.options = {
                disabledDate(time) {
                    let min = moment(vm.closeDate).add(1, "days").toDate().getTime();
                    return time.getTime() < min;
                }
            };


            let elem = this.$jQuery('.pos_SaleCoffee');
            let checkEvent = $._data($('body').get(0), 'events');
            if (checkEvent.keyup.length <= 1) {
                this.$nextTick(() => {
                    this.$jQuery('body').on('keydown', elem, this.inputHandler);
                })
            }
            this.time();
        },
        watch: {
            "posSaleCoffeeForm.invoiceDate"(val) {
                let vm = this;
                if (vm.dialogUpdatePosSaleCoffee === false) {
                    vm.posSaleCoffeeForm.posSaleCoffeeDate = val;
                }
                if (vm.closeDate && vm.closeDate !== "" && vm.closeDate !== undefined) {
                    vm.options = {
                        disabledDate(time) {
                            let min = moment(vm.closeDate).add(1, "days").toDate().getTime();
                            return time.getTime() < min;
                        }
                    }
                } else {
                    vm.options = {
                        disabledDate(time) {
                            return false;
                        }
                    }
                }
                if (this.$refs["posSaleCoffeeFormAdd"]) {
                    this.getVoucherByRoleAndDate(val);
                }
            },
            dialogUpdatePosSaleCoffee(val) {
                if (val) {
                    this._inputMaskPosSaleCoffee();
                }
            },
            "posSaleCoffeeForm.discount"(val) {
                if (val || val === 0) {
                    this.posSaleCoffeeForm.discount = val;
                    // this.posSaleCoffeeForm.discount = this.$_numeral(val).format("0,00");
                    this.getTotal();

                }
            },
            "posSaleCoffeeForm.discountType"(val) {
                if (val) {
                    this.posSaleCoffeeForm.discountType = val;
                    this.getTotal();
                }
            },
            "posSaleCoffeeForm.tableId"(val) {
                this.findInvoiceActiveByTableId(val);
            }
        },
        methods: {
            clickTHB(val) {
                this.posSaleCoffeeForm.paidTHB = this.$_numeral(val).value();
                this.getTotal();
            },
            clickUSD(val) {
                this.posSaleCoffeeForm.paidUSD = this.$_numeral(val).value();
                this.getTotal();
            },
            clickKHR(val) {
                this.posSaleCoffeeForm.paidKHR = this.$_numeral(val).value();
                this.getTotal();
            },
            goToInvoice() {
                FlowRouter.go("/pos-sale/posInvoice");
            },
            time() {
                let self = this;
                this.todaySt = moment().format("DD/MM/YYYY");
                this.timeSt = moment().format("hh:mm:ss");
                setTimeout(self.time, 1000);
            },
            _inputMaskPosSaleCoffee() {
                /*setTimeout(() => {
                    if ($(".el-inputAmount").length) {
                        new this.$_Cleave('.el-inputAmount', {
                            numeral: true,
                            numeralThousandsGroupStyle: 'thousand'
                        });
                    }

                    if ($(".el-inputDR").length) {
                        new this.$_Cleave('.el-inputDR', {
                            numeral: true,
                            numeralThousandsGroupStyle: 'thousand'
                        });
                    }

                    if ($(".el-inputCR").length) {
                        new this.$_Cleave('.el-inputCR', {
                            numeral: true,
                            numeralThousandsGroupStyle: 'thousand'
                        });
                    }


                }, 200)*/
            },
            inputHandler(e) {
                let vm = this;
                if (e.data.init(0).selector === ".pos_SaleCoffee") {
                    if (vm.dialogPayMoney === false) {
                        if (e.keyCode === 13 && e.ctrlKey) {
                            e.preventDefault();
                            vm.savePosSaleCoffee(false, e, false);
                        } else if (e.keyCode === 27 && !e.ctrlKey && !e.altKey) {
                            e.preventDefault();
                            vm.resetForm();
                        } else if (e.keyCode === 107 && !e.ctrlKey && !e.altKey) {
                            e.preventDefault();
                            vm.dialogPayMoney = true;
                        }
                    } else {
                        if (e.keyCode === 13) {
                            e.preventDefault();
                            vm.savePosSaleCoffee(false, e, true);
                        }
                    }
                }

            },
            /* barcodeScanSaleCoffee(e) {
                 if (this.dialogAddPosSaleCoffee === true || this.dialogUpdatePosSaleCoffee === true) {
                     let scannerSensitivity = 100;
                     if (e.keyCode !== 13 && !isNaN(e.key)) {
                         this.takeBarcode += e.key;
                     }
                     this.timeStamp.push(Date.now());
                     if (this.timeStamp.length > 1) {
                         if (this.timeStamp[1] - this.timeStamp[0] >= scannerSensitivity) {
                             this.takeBarcode = '';
                             this.timeStamp = [];
                         } else {
                             if (e.keyCode === 13) {
                                 this.posSaleCoffeeForm.code = this.takeBarcode;
                                 this.addToPosSaleCoffeeData(null);
                                 this.timeStamp = [];
                                 this.takeBarcode = ''
                             }
                         }
                     }
                 }
             },*/
            itemOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        Meteor.call('queryItemOption', query, (err, result) => {
                            if (!err) {
                                this.itemOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryItemOption', "", (err, result) => {
                        if (!err) {
                            this.itemOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            queryCategory() {
                let selector = {
                        q: "",
                        filter: "",
                        options: {
                            skip: 0, limit: 100
                        }
                    }
                ;
                Meteor.call('queryPosCategory', selector, (err, result) => {
                    this.categoryData = result.content;
                    this.isCategoryData = result.content.length > 0 ? true : false;
                })
            },
            queryProduct() {
                Meteor.call('queryPosProductAll', (err, result) => {
                    this.productDataAll = result;
                })
            },
            queryProductByCategoryId(categoryId) {
                let findProduct = function (element) {
                    if (element.categoryId === categoryId) {
                        return element;
                    }
                }
                let pro = this.productDataAll.filter(findProduct);
                this.productData = pro;
            },
            tableOpt() {
                Meteor.call('queryTableOption', (err, result) => {
                    this.tableOption = result;
                })
            },
            customerOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        let lists = [];
                        Meteor.call('queryPosCustomerOption', query, (err, result) => {
                            if (!err) {
                                this.customerOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryPosCustomerOption', "", (err, result) => {
                        if (!err) {
                            this.customerOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            termOpt() {
                let selector = {};
                Meteor.call('queryPosTermOption', selector, (err, result) => {
                    this.termOption = result;
                })
            },
            /*checkValidatedNumber() {
                let charCode = (val.which) ? val.which : val.keyCode;
                if ($(val.currentTarget).val().indexOf('.') != -1) {
                    if (charCode == 46) {
                        return false;
                    }
                }
                return !(charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57));

            },*/
            savePosSaleCoffee(isCloseDialog, event, isPrint) {
                event.preventDefault();
                let vm = this;
                this.$refs["posSaleCoffeeFormAdd"].validate((valid) => {
                    if (valid) {
                        let posSaleCoffeeDoc = {
                            total: vm.$_numeral(vm.posSaleCoffeeForm.total).value(),
                            netTotal: vm.$_numeral(vm.posSaleCoffeeForm.netTotal).value(),
                            balanceUnPaid: vm.$_numeral(vm.posSaleCoffeeForm.balanceUnPaid).value(),
                            paid: vm.$_numeral(vm.posSaleCoffeeForm.netTotal).value() - vm.$_numeral(vm.posSaleCoffeeForm.balanceUnPaid).value(),

                            paidUSD: vm.$_numeral(vm.posSaleCoffeeForm.paidUSD).value(),
                            paidKHR: vm.$_numeral(vm.posSaleCoffeeForm.paidKHR).value(),
                            paidTHB: vm.$_numeral(vm.posSaleCoffeeForm.paidTHB).value(),

                            remainUSD: vm.$_numeral(vm.posSaleCoffeeForm.remainUSD).value(),
                            remainKHR: vm.$_numeral(vm.posSaleCoffeeForm.remainKHR).value(),
                            remainTHB: vm.$_numeral(vm.posSaleCoffeeForm.remainTHB).value(),

                            invoiceDate: moment(vm.posSaleCoffeeForm.invoiceDate).toDate(),
                            invoiceDateName: moment(vm.posSaleCoffeeForm.invoiceDate).format("DD/MM/YYYY"),
                            dueDate: moment(vm.posSaleCoffeeForm.dueDate).toDate(),
                            invoiceNo: vm.posSaleCoffeeForm.invoiceNo,

                            note: vm.posSaleCoffeeForm.note,

                            discountType: vm.posSaleCoffeeForm.discountType,


                            discount: vm.$_numeral(vm.posSaleCoffeeForm.discount).value(),
                            discountValue: vm.$_numeral(vm.posSaleCoffeeForm.discountValue).value(),
                            termId: "001",
                            address: vm.posSaleCoffeeForm.address,

                            rolesArea: Session.get('area'),
                            paymentNumber: 1,
                            customerId: "001",
                            tableId: vm.posSaleCoffeeForm.tableId,
                            locationId: "001",
                            status: vm.$_numeral(vm.posSaleCoffeeForm.balanceUnPaid).value() === 0 ? "Complete" : vm.$_numeral(vm.posSaleCoffeeForm.balanceUnPaid).value() < vm.$_numeral(vm.posSaleCoffeeForm.netTotal).value() ? "Partial" : "Active"
                        };
                        posSaleCoffeeDoc.item = vm.posSaleCoffeeData;
                        if (vm.posInvoiceId === "") {
                            Meteor.call("insertPosInvoice", posSaleCoffeeDoc, (err, result) => {
                                if (!err) {
                                    if (isPrint) {
                                        FlowRouter.go('/pos-data/posInvoiceSmall/print?inv=' + result);
                                    } else {
                                        vm.$message({
                                            duration: 1000,
                                            message: this.langConfig['saveSuccess'],
                                            type: 'success'
                                        });
                                    }

                                    vm.getVoucherByRoleAndDate(moment().toDate());
                                    vm.queryProduct();
                                    vm.queryProductByCategoryId();

                                    Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);

                                    vm.resetForm();
                                    vm.dialogPayMoney = false;
                                } else {
                                    vm.$notify.error({
                                        duration: 5000,
                                        title: 'Error',
                                        message: err.error
                                    });
                                    /*vm.$message({
                                        type: 'error',
                                        message: err.error
                                    });*/
                                }
                            })
                        } else {
                            Meteor.call("updatePosInvoice", posSaleCoffeeDoc, vm.posInvoiceId, (err, result) => {
                                if (!err) {
                                    if (isPrint) {
                                        FlowRouter.go('/pos-data/posInvoiceSmall/print?inv=' + vm.posInvoiceId);
                                    } else {
                                        vm.$message({
                                            duration: 1000,
                                            message: this.langConfig['saveSuccess'],
                                            type: 'success'
                                        });
                                    }
                                    vm.getVoucherByRoleAndDate(moment().toDate());
                                    vm.queryProduct();
                                    vm.queryProductByCategoryId();

                                    Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);
                                    vm.resetForm();
                                    vm.dialogPayMoney = false;
                                } else {
                                    vm.$notify.error({
                                        duration: 5000,
                                        title: 'Error',
                                        message: err.error
                                    });
                                }
                            })
                        }

                    }
                })


            },

            getVoucherByRoleAndDate(date) {
                let vm = this;
                Meteor.call("pos_getInvoiceNoByRoleAndDate", Session.get("area"), date, (err, result) => {
                    if (!err) {
                        vm.posSaleCoffeeForm.invoiceNo = result;
                    }
                })
            },


            addToPosSaleCoffeeData(val, data) {
                let vm = this;
                let isFound = vm.posSaleCoffeeData.find(function (element) {
                    return element.itemId === data._id && element.type === data.type;
                });
                let indProduct = vm.productData.findIndex(k => k._id === data._id);
                let indProductAll = vm.productDataAll.findIndex(k => k._id === data._id);
                if (data.type === "S") {
                    if (indProduct !== -1) {
                        vm.productData[indProduct].smallQty = val;
                        vm.productData[indProduct].qty = val;
                    }
                    vm.productDataAll[indProductAll].smallQty = val;
                    vm.productDataAll[indProductAll].qty = val;
                    vm.productDataAll[indProductAll].type = "S";
                    vm.productDataAll[indProductAll].disableInputQty = false;

                } else if (data.type === "L") {
                    if (indProduct !== -1) {
                        vm.productData[indProduct].largeQty = val;
                        vm.productData[indProduct].qty = val;
                    }
                    vm.productDataAll[indProductAll].largeQty = val;
                    vm.productDataAll[indProductAll].qty = val;
                    vm.productDataAll[indProductAll].type = "L";
                    vm.productDataAll[indProductAll].disableInputQty = false;

                }

                if (isFound !== undefined) {
                    this.$message({
                        type: 'warning',
                        message: 'កែប្រែចំនួន!'
                    });

                    let ind = vm.posSaleCoffeeData.findIndex(k => k.itemId === data._id && k.type === data.type);
                    isFound.qty = val;
                    isFound.totalUnit = val;
                    isFound.amount = val * isFound.price;

                    vm.posSaleCoffeeData[ind] = isFound;
                    if (val === 0) {
                        vm.posSaleCoffeeData.splice(ind, 1);
                    }

                } else {
                    vm.posSaleCoffeeData.push({
                        itemId: data._id,
                        itemName: data.name,
                        code: data.code,
                        unit1: 1,
                        unit2: 1,
                        totalUnit: val,
                        unitId: data.unitId,
                        unitName: data.unitName,
                        price: data.type === "S" ? vm.$_numeral(data.rePrice).value() : vm.$_numeral(data.whPrice).value(),
                        qty: val,
                        amount: data.type === "S" ? formatCurrency(data.rePrice * val) : formatCurrency(data.whPrice * val),
                        isRetail: true,
                        desc: "",
                        rawQty: 0,
                        type: data.type
                    });
                    vm.$message({
                        duration: 1000,
                        message: `បន្ថែម ` + data.code + " : " + data.name + " បានជោគជ័យ !",
                        type: 'success'
                    });
                }


                this.getTotal();


            }
            ,
            updatePosSaleCoffeeDetail(row, index, val) {
                let vm = this;
                row.totalUnit = this.$_math.round(row.unit1 * row.unit2 * val, 2);
                row.amount = formatCurrency(row.price * row.totalUnit);
                row.qty = formatCurrency(val);

                let indProduct = vm.productData.findIndex(k => k._id === row.itemId);
                let indProductAll = vm.productDataAll.findIndex(k => k._id === row.itemId);
                if (row.type === "S") {
                    if (indProduct !== -1) {
                        vm.productData[indProduct].smallQty = val;
                        vm.productData[indProduct].type = "S";
                    }
                    vm.productDataAll[indProductAll].smallQty = val;
                    vm.productDataAll[indProductAll].type = "S";


                } else if (row.type === "L") {
                    if (indProduct !== -1) {
                        vm.productData[indProduct].largeQty = val;
                        vm.productData[indProduct].type = "L";
                    }
                    vm.productDataAll[indProductAll].largeQty = val;
                    vm.productDataAll[indProductAll].type = "L";
                }
                if (indProduct !== -1) {
                    vm.productData[indProduct].qty = val;
                }
                vm.productDataAll[indProductAll].qty = val;

                vm.productDataAll[indProductAll].disableInputQty = row.type !== "" ? false : true;
                if (indProduct !== -1) {
                    vm.productData[indProduct].disableInputQty = row.type !== "" ? false : true;
                }

                this.posSaleCoffeeData[index] = row;
                if (val === 0) {
                    this.posSaleCoffeeData.splice(index, 1);
                }
                this.getTotal();
            }
            ,
            clearZero(event) {
                /*debugger;
                $(event.currentTarget).select();
                console.log(event);*/
            }
            ,
            cancel() {
                this.resetForm();
                this.$message({
                    type: 'info',
                    message: this.langConfig['cancel']
                });
            }
            ,
            resetForm() {
                this.posSaleCoffeeData = [];
                this.posSaleCoffeeForm.discountValue = 0;
                this.posSaleCoffeeForm.code = "";
                this.posSaleCoffeeForm.paidUSD = 0;
                this.posSaleCoffeeForm.paidKHR = 0;
                this.posSaleCoffeeForm.paidTHB = 0;
                this.posSaleCoffeeForm.discount = 0;
                this.posSaleCoffeeForm.customerId = "";
                this.posSaleCoffeeForm.tableId = "";
                this.posSaleCoffeeForm.balanceNotCut = 0;

                this.posInvoiceId = "";
                if (this.$refs["posSaleCoffeeFormAdd"]) {
                    this.$refs["posSaleCoffeeFormAdd"].resetFields();
                }
                this.queryProduct();
                this.queryProductByCategoryId("");
                this.getTotal();

            }
            ,
            getTotal() {
                let vm = this;
                let total = 0;
                vm.posSaleCoffeeData.forEach(function (obj) {
                    total += parseFloat(vm.$_numeral(obj.amount).value());

                });
                if (total >= vm.$_numeral(vm.posSaleCoffeeForm.balanceNotCutFull).value()) {
                    vm.posSaleCoffeeForm.balanceNotCut = vm.posSaleCoffeeForm.balanceNotCutFull;
                } else {
                    vm.posSaleCoffeeForm.balanceNotCut = formatCurrency(total);
                }
                let companyDoc = WB_waterBillingSetup.findOne({rolesArea: Session.get("area")});
                vm.posSaleCoffeeForm.total = formatCurrencyLast(total, companyDoc.baseCurrency);

                if (vm.posSaleCoffeeForm.discountType === "Amount") {
                    vm.posSaleCoffeeForm.netTotal = formatCurrencyLast(total - vm.posSaleCoffeeForm.discount, companyDoc.baseCurrency);
                    vm.posSaleCoffeeForm.balanceUnPaid = formatCurrencyLast(total - vm.posSaleCoffeeForm.discount - vm.$_numeral(vm.posSaleCoffeeForm.balanceNotCut).value() - GeneralFunction.exchange("USD", companyDoc.baseCurrency, vm.posSaleCoffeeForm.paidUSD, Session.get("area")) - GeneralFunction.exchange("KHR", companyDoc.baseCurrency, vm.posSaleCoffeeForm.paidKHR, Session.get("area")) - GeneralFunction.exchange("THB", companyDoc.baseCurrency, vm.posSaleCoffeeForm.paidTHB, Session.get("area")), companyDoc.baseCurrency);

                    vm.posSaleCoffeeForm.remainUSD = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "USD", vm.$_numeral(vm.posSaleCoffeeForm.balanceUnPaid).value(), Session.get("area")), "USD");
                    vm.posSaleCoffeeForm.remainKHR = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "KHR", vm.$_numeral(vm.posSaleCoffeeForm.balanceUnPaid).value(), Session.get("area")), "KHR");
                    vm.posSaleCoffeeForm.remainTHB = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "THB", vm.$_numeral(vm.posSaleCoffeeForm.balanceUnPaid).value(), Session.get("area")), "THB");
                    vm.posSaleCoffeeForm.discountValue = formatCurrencyLast(vm.posSaleCoffeeForm.discount, companyDoc.baseCurrency);

                    vm.posSaleCoffeeForm.balanceUnPaid = vm.$_numeral(vm.posSaleCoffeeForm.balanceUnPaid).value() <= 0 ? 0 : vm.posSaleCoffeeForm.balanceUnPaid;
                    this.typeDiscount = getCurrencySymbolById(companyDoc.baseCurrency);
                } else {
                    vm.posSaleCoffeeForm.netTotal = formatCurrencyLast(total - (total * vm.posSaleCoffeeForm.discount / 100), companyDoc.baseCurrency);
                    vm.posSaleCoffeeForm.balanceUnPaid = formatCurrencyLast(total - (total * vm.posSaleCoffeeForm.discount / 100) - GeneralFunction.exchange("USD", companyDoc.baseCurrency, vm.posSaleCoffeeForm.paidUSD, Session.get("area")) - GeneralFunction.exchange("KHR", companyDoc.baseCurrency, vm.posSaleCoffeeForm.paidKHR, Session.get("area")) - GeneralFunction.exchange("THB", companyDoc.baseCurrency, vm.posSaleCoffeeForm.paidTHB, Session.get("area")), companyDoc.baseCurrency);

                    vm.posSaleCoffeeForm.remainUSD = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "USD", vm.$_numeral(vm.posSaleCoffeeForm.balanceUnPaid).value(), Session.get("area")), "USD");
                    vm.posSaleCoffeeForm.remainKHR = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "KHR", vm.$_numeral(vm.posSaleCoffeeForm.balanceUnPaid).value(), Session.get("area")), "KHR");
                    vm.posSaleCoffeeForm.remainTHB = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "THB", vm.$_numeral(vm.posSaleCoffeeForm.balanceUnPaid).value(), Session.get("area")), "THB");
                    vm.posSaleCoffeeForm.discountValue = formatCurrencyLast((total * vm.posSaleCoffeeForm.discount / 100), companyDoc.baseCurrency);

                    vm.posSaleCoffeeForm.balanceUnPaid = vm.$_numeral(vm.posSaleCoffeeForm.balanceUnPaid).value() <= 0 ? 0 : vm.posSaleCoffeeForm.balanceUnPaid;
                    this.typeDiscount = "%";
                }
            },
            printSaleCoffee(data) {
                if (data.transactionType === "SaleCoffee Sale Order") {
                    FlowRouter.go('/pos-data/posSaleCoffeeReceiveItem/print?inv=' + data._id);
                } else {
                    FlowRouter.go('/pos-data/posSaleCoffee/print?inv=' + data._id);
                }

            },
            handleChange(data, e) {
                this.addToPosSaleCoffeeData(e, data);
            },
            handleClickBtn(data, btn, index) {
                data.type = btn;
                data.disableInputQty = data.type !== "" ? false : true;

                if (data.type === "S") {
                    data.qty = data.smallQty === 0 ? 1 : data.smallQty;
                } else if (data.type === "L") {
                    data.qty = data.largeQty === 0 ? 1 : data.largeQty;
                }
                this.addToPosSaleCoffeeData(data.qty, data);
                this.productData[index] = data;
            },
            findInvoiceActiveByTableId(tableId) {
                let vm = this;
                Meteor.call("queryInvoiceActiveByTableId", tableId, (err, result) => {
                    if (result) {
                        vm.posSaleCoffeeData = [];
                        vm.posSaleCoffeeForm.discountValue = 0;
                        vm.posSaleCoffeeForm.paidUSD = 0;
                        vm.posSaleCoffeeForm.paidKHR = 0;
                        vm.posSaleCoffeeForm.paidTHB = 0;
                        vm.posSaleCoffeeForm.discount = 0;
                        vm.posSaleCoffeeForm.balanceNotCut = 0;
                        vm.posInvoiceId = result._id;
                        result.item.forEach((obj) => {
                            if (obj) {
                                let data = vm.productDataAll.find(function (element) {
                                    return element._id === obj.itemId;
                                });
                                data.type = obj.type;
                                if (data) {
                                    vm.addToPosSaleCoffeeData(obj.qty, data);
                                }
                            }
                        })
                    }
                    else if (tableId === "") {
                        this.posSaleCoffeeData = [];
                        this.posSaleCoffeeForm.discountValue = 0;
                        this.posSaleCoffeeForm.code = "";
                        this.posSaleCoffeeForm.paidUSD = 0;
                        this.posSaleCoffeeForm.paidKHR = 0;
                        this.posSaleCoffeeForm.paidTHB = 0;
                        this.posSaleCoffeeForm.discount = 0;
                        this.posSaleCoffeeForm.balanceNotCut = 0;
                        this.posInvoiceId = "";
                        this.queryProduct();
                        this.queryProductByCategoryId("");
                        this.getTotal();
                    }
                })
            }
        },
        created() {
            this.isSearching = true;
            this.getTotal();
            this.queryCategory();
            this.queryProduct();
            this.tableOpt();
            Meteor.subscribe('Pos_InvoiceReact');
            this.getVoucherByRoleAndDate(moment().toDate());

            Meteor.call('getWaterBillingSetup', Session.get('area'), (err, result) => {
                if (result) {
                    this.waterBillingSetup = result;
                    this.currencySymbol = getCurrencySymbolById(result.baseCurrency);
                }
            })


        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['saleCoffee'];
                return data;
            }
        }
    }


</script>

<style>
    .card {
        display: inline-block;
        position: relative;
        width: 100%;
        margin: 0px 0 !important;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, .14);
        border-radius: 6px;
        color: rgba(0, 0, 0, .87);
        background: #fff;
    }

    .w3-code-coffee {
        width: auto;
        background-color: black !important;
        padding: 8px 12px;
        border-left: 4px solid #4CAF50;
        word-wrap: break-word;
    }

    .image {
        width: 130px !important;
        height: 100px !important;
        display: block;
    }

    .image-category {
        width: 180px !important;
        height: 100px !important;
        display: block;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }

    .clearfix:after {
        clear: both
    }

    .plan-ribbon-btn1 {
        font-size: 15px;
        color: #fff;
        text-align: center;
        position: absolute;
        transform: translate(-50%, -240%);
        -ms-transform: translate(-50%, -240%);
        float: left !important;
        z-index: 1;
    }

    .plan-ribbon-btn2 {
        font-size: 15px;
        color: #fff;
        text-align: center;
        position: absolute;
        margin-top: 40px !important;
        transform: translate(-50%, -240%);
        -ms-transform: translate(-50%, -240%);
        float: left !important;
        z-index: 1;
    }

    .el-table--scrollable-y .el-table__body-wrapper {
        overflow-y: auto;
    }

    .el-table__body-wrapper {
        overflow: hidden;
        position: relative;
    }

</style>




