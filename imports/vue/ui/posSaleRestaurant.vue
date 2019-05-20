<template>
    <div class="pos_SaleRestaurant">
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
                            {{langConfig['tableNumber']}} : {{tableName}}</h2>
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

                            <el-button type="primary" @click.native="savePosSaleRestaurant(true,$event,false)"><i
                                    class="el-icon-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i>
                            </el-button>

                            <el-button type="warning"
                                       @click.native="resetForm()"><i
                                    class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['reset']}} <i>(ESC)</i>
                            </el-button>

                        </el-col>
                        <el-col :span="1">
                            <el-button type="danger" round
                                       @click="goToTableBoard">
                                <i class="fa fa-close"></i>
                            </el-button>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
            <hr style="margin-top: 0px !important;margin-bottom: 5px !important;">
            <!-- <el-row style="padding-right: 50px !important;">
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
             <hr style="margin-top: 5px !important;margin-bottom: 5px !important;">-->
            <slot v-if="loading">
                <div class="row">
                    <div class="col-md-12" style="padding: 30px; margin-top: 70px">
                        <!--<loader></loader>-->
                    </div>
                </div>
            </slot>
            <slot v-else>
                <el-form :model="posSaleRestaurantForm"  :ref="refForm" label-width="120px"
                         :label-position="labelPosition"
                         class="posSaleRestaurantForm"
                         style="background-color: black !important;min-height:100% !important;">
                    <el-row :gutter="20">
                        <el-col :span="4">
                            <div class="w3-code-restaurantCategory">

                                <h3 style="text-align: center !important;">{{langConfig['selectCategory']}}</h3>
                                <hr>
                                <ul class="sidebar-menu tree animated-padding animated fadeInLeft" data-widget="tree">
                                    <li v-for="(o, index) in categoryData">
                                        <a href="#" @click="queryProductByCategoryId(o._id)" class="title-head"
                                           style="color: white !important;">{{o.name}}</a>
                                    </li>
                                </ul>
                            </div>
                        </el-col>
                        <el-col :span="12" class="posSaleRestaurantForm"
                                style=" padding-bottom: 20px !important;padding-left: 0px !important;padding-right: 0px !important;margin-top: 15px !important; background-color: black !important;">
                            <div style="height: 760px !important;overflow-y: scroll !important;">
                                <el-row style="padding-right: 90px !important;">
                                    <el-col :span="1" v-for="(productDoc, index) in productData" :key="productDoc._id"
                                            :offset="index > 0 ? index%5===0 ? 1: 4 : 1"
                                            style="margin-bottom: 20px !important; padding-right: 40px !important;">
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
                            <div class="w3-code-restaurant">
                                <div class="ui segments plan">
                                    <div class="ui top attached segment teal inverted plan-title">
                                        <span class="plan-ribbon red">{{posSaleRestaurantForm.discountValue}}{{currencySymbol}}</span>
                                        <span class="ui header">{{langConfig['balanceDue']}}</span>

                                    </div>
                                    <div class="ui  attached segment feature">
                                        <div class="amount">
                                            {{posSaleRestaurantForm.balanceUnPaid}}{{currencySymbol}}
                                        </div>
                                    </div>
                                </div>
                                <el-row>
                                    <el-col :span="24">
                                        <el-form-item prop="note">
                                            <el-input type="textarea" v-model="posSaleRestaurantForm.note"
                                                      :placeholder="langConfig['note']"
                                                      :rows="2"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>


                                <el-table
                                        :data="posSaleRestaurantData"
                                        height="500"
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
                                                             @keyup="updatePosSaleRestaurantDetail(scope.row, scope.$index,$event)"
                                                             @change="updatePosSaleRestaurantDetail(scope.row, scope.$index,$event)">
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
            <el-form :model="posSaleRestaurantForm"  ref="posSaleRestaurantFormPayment"
                     label-width="120px"
                     class="posSaleRestaurantForm">
                <div class="ui segments plan">
                    <div class="ui top attached segment teal inverted plan-title">
                        <span class="plan-ribbon red">{{posSaleRestaurantForm.discountValue}}{{currencySymbol}}</span>
                        <span class="ui header">{{langConfig['balanceDue']}}</span>

                    </div>
                    <div class="ui  attached segment feature">
                        <div class="amount">
                            {{posSaleRestaurantForm.balanceUnPaid}}{{currencySymbol}}
                        </div>
                    </div>
                </div>


                <el-form-item :label="langConfig['discount']">
                    <el-row>
                        <el-col :span="14">
                            <el-radio-group v-model="posSaleRestaurantForm.discountType">
                                <el-radio-button v-for="mt in discountTypeOption" :label="mt.value"
                                                 :key="mt.value"
                                >
                                    {{langConfig[mt.label]}}
                                </el-radio-button>

                            </el-radio-group>
                        </el-col>
                        <el-col :span="10">
                            <el-input :label="langConfig['discount']" placeholder="Amount Discount" prop="discount"
                                      v-model.number="posSaleRestaurantForm.discount" type='number'>
                                <template slot="append">{{typeDiscount}}</template>
                            </el-input>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item :label="langConfig['netTotal']">

                    <el-input :placeholder="langConfig['netTotal']"
                              v-model.number="posSaleRestaurantForm.netTotal"
                              disabled>
                        <template slot="append">{{currencySymbol}}</template>
                    </el-input>
                </el-form-item>
                <el-form-item :label="langConfig['paidDollar']">

                    <el-input placeholder="USD"
                              v-model.number="posSaleRestaurantForm.paidUSD"
                              type='number'
                              @change.native="getTotal()" @focus.native="clearZero($event)"
                              @keyup.native="getTotal()"

                    >
                        <el-button slot="append" @click="clickUSD(posSaleRestaurantForm.remainUSD)">
                            {{posSaleRestaurantForm.remainUSD}} $
                        </el-button>
                    </el-input>
                </el-form-item>

                <el-form-item :label="langConfig['paidRiel']">


                    <el-input placeholder="KHR" @change="getTotal()"
                              @keyup.native="getTotal()"
                              v-model.number="posSaleRestaurantForm.paidKHR" type='number'
                    >
                        <el-button slot="append" @click="clickKHR(posSaleRestaurantForm.remainKHR)">
                            {{posSaleRestaurantForm.remainKHR}} ៛
                        </el-button>
                    </el-input>
                </el-form-item>
                <el-form-item :label="langConfig['paidBaht']">

                    <el-input placeholder="THB"
                              v-model.number="posSaleRestaurantForm.paidTHB"
                              type='number'
                              @change="getTotal()"
                              @keyup.native="getTotal()"
                    >
                        <el-button slot="append" @click="clickTHB(posSaleRestaurantForm.remainTHB)">
                            {{posSaleRestaurantForm.remainTHB}} B
                        </el-button>
                    </el-input>
                </el-form-item>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button type="primary" @click="savePosSaleRestaurant(true,$event,true)">{{langConfig['pay']}} <i>(Enter)</i>
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
                refForm: 'posSaleRestaurantFormAdd',
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
                posSaleRestaurantData: [],
                dialogPayMoney: false,

                posSaleRestaurantForm: {
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
                    locationId: "",
                    rawQty: 0,
                    isReceiveAll: false,
                    balanceNotCut: 0,
                    balanceNotCutFull: 0,
                    code: ""

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
                posSaleRestaurantDetail: {},
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
                qty: 0,
                tableName: ""
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


            let elem = this.$jQuery('.pos_SaleRestaurant');
            let checkEvent = $._data($('body').get(0), 'events');
            if (checkEvent.keyup.length <= 1) {
                this.$nextTick(() => {
                    this.$jQuery('body').on('keydown', elem, this.inputHandler);
                })
            }
            this.time();
        },
        watch: {
            "posSaleRestaurantForm.invoiceDate"(val) {
                let vm = this;
                if (vm.dialogUpdatePosSaleRestaurant === false) {
                    vm.posSaleRestaurantForm.posSaleRestaurantDate = val;
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
                if (this.$refs["posSaleRestaurantFormAdd"]) {
                    this.getVoucherByRoleAndDate(val);
                }
            },
            dialogUpdatePosSaleRestaurant(val) {
                if (val) {
                    this._inputMaskPosSaleRestaurant();
                }
            },
            "posSaleRestaurantForm.discount"(val) {
                if (val || val === 0) {
                    this.posSaleRestaurantForm.discount = val;
                    // this.posSaleRestaurantForm.discount = this.$_numeral(val).format("0,00");
                    this.getTotal();

                }
            },
            "posSaleRestaurantForm.discountType"(val) {
                if (val) {
                    this.posSaleRestaurantForm.discountType = val;
                    this.getTotal();
                }
            },
            "posSaleRestaurantForm.tableId"(val) {
                this.findInvoiceActiveByTableId(val);
            }
        },
        methods: {
            clickTHB(val) {
                this.posSaleRestaurantForm.paidTHB = this.$_numeral(val).value();
                this.getTotal();
            },
            clickUSD(val) {
                this.posSaleRestaurantForm.paidUSD = this.$_numeral(val).value();
                this.getTotal();
            },
            clickKHR(val) {
                this.posSaleRestaurantForm.paidKHR = this.$_numeral(val).value();
                this.getTotal();
            },
            goToTableBoard() {
                FlowRouter.go("/pos-sale/posTableBoard");
            },
            time() {
                let self = this;
                this.todaySt = moment().format("DD/MM/YYYY");
                this.timeSt = moment().format("hh:mm:ss");
                setTimeout(self.time, 1000);
            },
            _inputMaskPosSaleRestaurant() {
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
                if (e.data.init(0).selector === ".pos_SaleRestaurant") {
                    if (vm.dialogPayMoney === false) {
                        if (e.keyCode === 13 && e.ctrlKey) {
                            e.preventDefault();
                            vm.savePosSaleRestaurant(false, e, false);
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
                            vm.savePosSaleRestaurant(false, e, true);
                        }
                    }
                }

            },
            /* barcodeScanSaleRestaurant(e) {
                 if (this.dialogAddPosSaleRestaurant === true || this.dialogUpdatePosSaleRestaurant === true) {
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
                                 this.posSaleRestaurantForm.code = this.takeBarcode;
                                 this.addToPosSaleRestaurantData(null);
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
                Meteor.call('queryTableOption',Session.get("area"), (err, result) => {
                    this.tableOption = result;
                })
            },
            customerOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        let lists = [];
                        Meteor.call('queryPosCustomerOption', query,Session.get("area"), (err, result) => {
                            if (!err) {
                                this.customerOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryPosCustomerOption', "",Session.get("area"), (err, result) => {
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
            savePosSaleRestaurant(isCloseDialog, event, isPrint) {
                event.preventDefault();
                let vm = this;
                this.$refs["posSaleRestaurantFormAdd"].validate((valid) => {
                    if (valid) {
                        let posSaleRestaurantDoc = {
                            total: vm.$_numeral(vm.posSaleRestaurantForm.total).value(),
                            netTotal: vm.$_numeral(vm.posSaleRestaurantForm.netTotal).value(),
                            balanceUnPaid: vm.$_numeral(vm.posSaleRestaurantForm.balanceUnPaid).value(),
                            paid: vm.$_numeral(vm.posSaleRestaurantForm.netTotal).value() - vm.$_numeral(vm.posSaleRestaurantForm.balanceUnPaid).value(),

                            paidUSD: vm.$_numeral(vm.posSaleRestaurantForm.paidUSD).value(),
                            paidKHR: vm.$_numeral(vm.posSaleRestaurantForm.paidKHR).value(),
                            paidTHB: vm.$_numeral(vm.posSaleRestaurantForm.paidTHB).value(),

                            remainUSD: vm.$_numeral(vm.posSaleRestaurantForm.remainUSD).value(),
                            remainKHR: vm.$_numeral(vm.posSaleRestaurantForm.remainKHR).value(),
                            remainTHB: vm.$_numeral(vm.posSaleRestaurantForm.remainTHB).value(),

                            invoiceDate: moment(vm.posSaleRestaurantForm.invoiceDate).toDate(),
                            invoiceDateName: moment(vm.posSaleRestaurantForm.invoiceDate).format("DD/MM/YYYY"),
                            dueDate: moment(vm.posSaleRestaurantForm.dueDate).toDate(),
                            invoiceNo: vm.posSaleRestaurantForm.invoiceNo,

                            note: vm.posSaleRestaurantForm.note,

                            discountType: vm.posSaleRestaurantForm.discountType,


                            discount: vm.$_numeral(vm.posSaleRestaurantForm.discount).value(),
                            discountValue: vm.$_numeral(vm.posSaleRestaurantForm.discountValue).value(),
                            termId: "001",
                            address: vm.posSaleRestaurantForm.address,

                            rolesArea: Session.get('area'),
                            paymentNumber: 1,
                            customerId: "001",
                            tableId: vm.posSaleRestaurantForm.tableId,
                            locationId: "001",
                            status: vm.$_numeral(vm.posSaleRestaurantForm.balanceUnPaid).value() === 0 ? "Complete" : vm.$_numeral(vm.posSaleRestaurantForm.balanceUnPaid).value() < vm.$_numeral(vm.posSaleRestaurantForm.netTotal).value() ? "Partial" : "Active"
                        };
                        posSaleRestaurantDoc.item = vm.posSaleRestaurantData;
                        if (vm.posSaleRestaurantData.length === 0) {
                            return false;
                        }
                        if (vm.posInvoiceId === "") {
                            Meteor.call("insertPosInvoice", posSaleRestaurantDoc, (err, result) => {
                                if (!err) {
                                    if (isPrint) {
                                        FlowRouter.go('/pos-data/posInvoiceSmallRestaurant/print?inv=' + result);
                                    } else {
                                        vm.$message({
                                            duration: 1000,
                                            message: this.langConfig['saveSuccess'],
                                            type: 'success'
                                        });
                                        Meteor.call("updatePosTableStatus", vm.posSaleRestaurantForm.tableId, true);
                                        FlowRouter.go("/pos-sale/posTableBoard");

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
                            Meteor.call("updatePosInvoice", posSaleRestaurantDoc, vm.posInvoiceId, (err, result) => {
                                if (!err) {
                                    if (isPrint) {
                                        FlowRouter.go('/pos-data/posInvoiceSmallRestaurant/print?inv=' + vm.posInvoiceId);
                                    } else {
                                        vm.$message({
                                            duration: 1000,
                                            message: this.langConfig['saveSuccess'],
                                            type: 'success'
                                        });
                                        Meteor.call("updatePosTableStatus", vm.posSaleRestaurantForm.tableId, true);
                                        FlowRouter.go("/pos-sale/posTableBoard");
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
                        vm.posSaleRestaurantForm.invoiceNo = result;
                    }
                })
            },


            addToPosSaleRestaurantData(val, data) {
                let vm = this;
                let isFound = vm.posSaleRestaurantData.find(function (element) {
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

                    let ind = vm.posSaleRestaurantData.findIndex(k => k.itemId === data._id && k.type === data.type);
                    isFound.qty = val;
                    isFound.totalUnit = val;
                    isFound.amount = val * isFound.price;

                    vm.posSaleRestaurantData[ind] = isFound;
                    if (val === 0) {
                        vm.posSaleRestaurantData.splice(ind, 1);
                    }

                } else {
                    vm.posSaleRestaurantData.push({
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
            updatePosSaleRestaurantDetail(row, index, val) {
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

                this.posSaleRestaurantData[index] = row;
                if (val === 0) {
                    this.posSaleRestaurantData.splice(index, 1);
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
                this.posSaleRestaurantData = [];
                this.posSaleRestaurantForm.discountValue = 0;
                this.posSaleRestaurantForm.code = "";
                this.posSaleRestaurantForm.paidUSD = 0;
                this.posSaleRestaurantForm.paidKHR = 0;
                this.posSaleRestaurantForm.paidTHB = 0;
                this.posSaleRestaurantForm.discount = 0;
                this.posSaleRestaurantForm.customerId = "";
                this.posSaleRestaurantForm.tableId = "";
                this.posSaleRestaurantForm.balanceNotCut = 0;

                this.posInvoiceId = "";
                if (this.$refs["posSaleRestaurantFormAdd"]) {
                    this.$refs["posSaleRestaurantFormAdd"].resetFields();
                }
                this.queryProduct();
                this.queryProductByCategoryId("");
                this.getTotal();

            }
            ,
            getTotal() {
                let vm = this;
                let total = 0;
                vm.posSaleRestaurantData.forEach(function (obj) {
                    total += parseFloat(vm.$_numeral(obj.amount).value());

                });
                if (total >= vm.$_numeral(vm.posSaleRestaurantForm.balanceNotCutFull).value()) {
                    vm.posSaleRestaurantForm.balanceNotCut = vm.posSaleRestaurantForm.balanceNotCutFull;
                } else {
                    vm.posSaleRestaurantForm.balanceNotCut = formatCurrency(total);
                }
                let companyDoc = WB_waterBillingSetup.findOne({});
                vm.posSaleRestaurantForm.total = formatCurrencyLast(total, companyDoc.baseCurrency);

                if (vm.posSaleRestaurantForm.discountType === "Amount") {
                    vm.posSaleRestaurantForm.netTotal = formatCurrencyLast(total - vm.posSaleRestaurantForm.discount, companyDoc.baseCurrency);
                    vm.posSaleRestaurantForm.balanceUnPaid = formatCurrencyLast(total - vm.posSaleRestaurantForm.discount - vm.$_numeral(vm.posSaleRestaurantForm.balanceNotCut).value() - GeneralFunction.exchange("USD", companyDoc.baseCurrency, vm.posSaleRestaurantForm.paidUSD, Session.get("area")) - GeneralFunction.exchange("KHR", companyDoc.baseCurrency, vm.posSaleRestaurantForm.paidKHR, Session.get("area")) - GeneralFunction.exchange("THB", companyDoc.baseCurrency, vm.posSaleRestaurantForm.paidTHB, Session.get("area")), companyDoc.baseCurrency);

                    vm.posSaleRestaurantForm.remainUSD = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "USD", vm.$_numeral(vm.posSaleRestaurantForm.balanceUnPaid).value(), Session.get("area")), "USD");
                    vm.posSaleRestaurantForm.remainKHR = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "KHR", vm.$_numeral(vm.posSaleRestaurantForm.balanceUnPaid).value(), Session.get("area")), "KHR");
                    vm.posSaleRestaurantForm.remainTHB = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "THB", vm.$_numeral(vm.posSaleRestaurantForm.balanceUnPaid).value(), Session.get("area")), "THB");
                    vm.posSaleRestaurantForm.discountValue = formatCurrencyLast(vm.posSaleRestaurantForm.discount, companyDoc.baseCurrency);

                    vm.posSaleRestaurantForm.balanceUnPaid = vm.$_numeral(vm.posSaleRestaurantForm.balanceUnPaid).value() <= 0 ? 0 : vm.posSaleRestaurantForm.balanceUnPaid;
                    this.typeDiscount = getCurrencySymbolById(companyDoc.baseCurrency);
                } else {
                    vm.posSaleRestaurantForm.netTotal = formatCurrencyLast(total - (total * vm.posSaleRestaurantForm.discount / 100), companyDoc.baseCurrency);
                    vm.posSaleRestaurantForm.balanceUnPaid = formatCurrencyLast(total - (total * vm.posSaleRestaurantForm.discount / 100) - GeneralFunction.exchange("USD", companyDoc.baseCurrency, vm.posSaleRestaurantForm.paidUSD, Session.get("area")) - GeneralFunction.exchange("KHR", companyDoc.baseCurrency, vm.posSaleRestaurantForm.paidKHR, Session.get("area")) - GeneralFunction.exchange("THB", companyDoc.baseCurrency, vm.posSaleRestaurantForm.paidTHB, Session.get("area")), companyDoc.baseCurrency);

                    vm.posSaleRestaurantForm.remainUSD = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "USD", vm.$_numeral(vm.posSaleRestaurantForm.balanceUnPaid).value(), Session.get("area")), "USD");
                    vm.posSaleRestaurantForm.remainKHR = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "KHR", vm.$_numeral(vm.posSaleRestaurantForm.balanceUnPaid).value(), Session.get("area")), "KHR");
                    vm.posSaleRestaurantForm.remainTHB = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "THB", vm.$_numeral(vm.posSaleRestaurantForm.balanceUnPaid).value(), Session.get("area")), "THB");
                    vm.posSaleRestaurantForm.discountValue = formatCurrencyLast((total * vm.posSaleRestaurantForm.discount / 100), companyDoc.baseCurrency);

                    vm.posSaleRestaurantForm.balanceUnPaid = vm.$_numeral(vm.posSaleRestaurantForm.balanceUnPaid).value() <= 0 ? 0 : vm.posSaleRestaurantForm.balanceUnPaid;
                    this.typeDiscount = "%";
                }
            },
            printSaleRestaurant(data) {
                if (data.transactionType === "SaleRestaurant Sale Order") {
                    FlowRouter.go('/pos-data/posSaleRestaurantReceiveItem/print?inv=' + data._id);
                } else {
                    FlowRouter.go('/pos-data/posSaleRestaurant/print?inv=' + data._id);
                }

            },
            handleChange(data, e) {
                this.addToPosSaleRestaurantData(e, data);
            },
            handleClickBtn(data, btn, index) {
                data.type = btn;
                data.disableInputQty = data.type !== "" ? false : true;

                if (data.type === "S") {
                    data.qty = data.smallQty === 0 ? 1 : data.smallQty;
                } else if (data.type === "L") {
                    data.qty = data.largeQty === 0 ? 1 : data.largeQty;
                }
                this.addToPosSaleRestaurantData(data.qty, data);
                this.productData[index] = data;
            },
            findInvoiceActiveByTableId(tableId) {
                let vm = this;
                Meteor.call("queryInvoiceActiveByTableId", tableId, (err, result) => {
                    if (result) {
                        vm.posSaleRestaurantData = [];
                        vm.posSaleRestaurantForm.discountValue = 0;
                        vm.posSaleRestaurantForm.paidUSD = 0;
                        vm.posSaleRestaurantForm.paidKHR = 0;
                        vm.posSaleRestaurantForm.paidTHB = 0;
                        vm.posSaleRestaurantForm.discount = 0;
                        vm.posSaleRestaurantForm.balanceNotCut = 0;
                        vm.posInvoiceId = result._id;
                        result.item.forEach((obj) => {
                            if (obj) {
                                let data = vm.productDataAll.find(function (element) {
                                    return element._id === obj.itemId;
                                });
                                data.type = obj.type;
                                if (data) {
                                    vm.addToPosSaleRestaurantData(obj.qty, data);
                                }
                            }
                        })
                    }
                    else if (tableId === "") {
                        this.posSaleRestaurantData = [];
                        this.posSaleRestaurantForm.discountValue = 0;
                        this.posSaleRestaurantForm.code = "";
                        this.posSaleRestaurantForm.paidUSD = 0;
                        this.posSaleRestaurantForm.paidKHR = 0;
                        this.posSaleRestaurantForm.paidTHB = 0;
                        this.posSaleRestaurantForm.discount = 0;
                        this.posSaleRestaurantForm.balanceNotCut = 0;
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
            this.posSaleRestaurantForm.tableId = FlowRouter.query.get('tableId');
            Meteor.call("queryPosTableById", this.posSaleRestaurantForm.tableId, (err, result) => {
                if (result) {
                    this.tableName = result.name;
                }
            });

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

    .w3-code-restaurant {
        width: auto;
        background-color: black !important;
        padding: 8px 12px;
        border-left: 4px solid #4CAF50;
        word-wrap: break-word;
    }

    .w3-code-restaurantCategory {
        width: auto;
        background-color: black !important;
        padding: 8px 12px;
        border-right: 4px solid #4CAF50;
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




