<template>
    <div class="pos_payBill">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer"
                           @click="popupPayBillAdd(),dialogAddPayBill= true,resetForm()"
                        >
                            <i class="fa fa-plus"></i> {{langConfig['payBill']}}
                        </a>
                    </h4>
                </el-col>
                <el-col :span="16" style="text-align: right; margin-right: 10px">
                    <br>
                    <el-row type="flex" justify="center">
                        <el-col :span="8"></el-col>
                        <el-col :span="8"></el-col>
                        <el-col :span="8">
                            <el-input
                                    :placeholder="langConfig['searchHere']"
                                    suffix-icon="el-icon-search"
                                    v-model="searchData"
                            >
                            </el-input>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
            <hr>
            <br>
            <slot v-if="loading">
                <div class="row">
                    <div class="col-md-12" style="padding: 30px; margin-top: 70px">
                    </div>
                </div>
            </slot>
            <slot v-else>
                <el-table
                        :data="posPayBillDataDisplay"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="payBillDateName"
                            :label="langConfig['paidDate']"
                            sortable
                            width="180">
                    </el-table-column>

                    <el-table-column
                            prop="vendorDoc.name"
                            :label="langConfig['vendor']">
                    </el-table-column>

                    <el-table-column
                            prop="totalAmount"
                            :label="langConfig['amount']">
                    </el-table-column>

                    <el-table-column
                            prop="totalDiscount"
                            :label="langConfig['discount']">
                    </el-table-column>
                    <el-table-column
                            prop="totalPaid"
                            :label="langConfig['totalPaid']">
                    </el-table-column>
                    <el-table-column
                            prop="note"
                            :label="langConfig['note']">
                    </el-table-column>
                    <el-table-column
                            prop="billId"
                            :label="langConfig['status']"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.billId === undefined ? 'primary' : 'success'"
                                    close-transition>{{scope.row.billId===undefined ? "Pay Bill" : "Bill"}}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removePayBill(scope.$index,scope.row,posPayBillDataDisplay)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click=""
                                           disabled></el-button>
                            </el-button-group>
                        </template>
                    </el-table-column>

                </el-table>
                <!--Pagination-->
                <br>
                <el-row type="flex" class="row-bg" justify="center">
                    <el-col :span="24" style="text-align: center;">
                        <div class="block">
                            <el-pagination @size-change="handleSizeChange" background @current-change="handleCurrentChange"
                                           :current-page.sync="currentPage" :page-sizes="[10,20, 50, 100,200]"
                                           :page-size="currentSize"
                                           layout="total, sizes, prev, pager, next, jumper" :total="count">
                            </el-pagination>
                        </div>
                    </el-col>
                </el-row>
                <br>
            </slot>
            <!--End Pagination-->
        </div>


        <!--Form Modal-->
        <el-dialog
                :title="langConfig['add']"
                :visible.sync="dialogAddPayBill"
                :fullscreen="fullScreen"

        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posPayBillForm" :rules="rules" ref="posPayBillFormAdd" label-width="120px"
                     :label-position="labelPosition"
                     class="posPayBillForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="posPayBillForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="5">
                                    <el-input :placeholder="langConfig['searchByBill']" v-model="searchByBill"
                                              @keyup.native.enter="searchBill()">
                                        <template slot="prepend">{{langConfig['bill']}}:</template>
                                        <el-button slot="append" suffix-icon="el-icon-search"
                                                   @click.native="searchBill()"></el-button>
                                    </el-input>
                                </th>
                                <th colspan="2">
                                    <el-date-picker
                                            v-model="searchByDate"
                                            type="daterange"
                                            align="right"
                                            placeholder="Pick a range"
                                            :picker-options="pickerDateOptions"
                                    >
                                    </el-date-picker>
                                </th>
                                <th style="text-align: right; vertical-align: middle;" colspan="2">
                                    <el-checkbox v-model="isOverDue"
                                                 :label="langConfig['overdueStatusOnly']"></el-checkbox>
                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr>
                                <th>{{langConfig['no']}}</th>

                                <th>{{langConfig['billNo']}}</th>
                                <th>{{langConfig['dueDate']}}</th>
                                <th style="vertical-align: middle; min-width: 120px !important;">
                                    <el-checkbox v-model="posPayBillForm.isAllTerm"></el-checkbox>
                                    {{langConfig['applyTerm']}}
                                </th>
                                <th>{{langConfig['amount']}}</th>
                                <th>{{langConfig['discount']}}</th>
                                <th>{{langConfig['netAmount']}}</th>
                                <th style="color: #e91e63 !important;">{{langConfig['paid']}}</th>
                                <th style="vertical-align: middle;">
                                    <el-checkbox v-model="posPayBillForm.isPaidAll"></el-checkbox>
                                </th>
                            </tr>
                            </thead>
                            <draggable v-model="posPayBillData" :element="'tbody'">
                                <tr v-for="(posPayBillDoc,index ) in this.posPayBillData" :key="index">
                                    <template v-if="posPayBillDoc.isShow">
                                        <td style="vertical-align: middle">
                                            {{index +1}}
                                        </td>
                                        <td style="vertical-align: middle">
                                            #{{posPayBillDoc.billNo |
                                            subStringVoucher}}({{posPayBillDoc.billDate |
                                            momentFormat}})
                                        </td>
                                        <td style="vertical-align: middle">
                                            <el-badge :value=posPayBillDoc.dayOverDue :max="99" class="item">
                                                {{posPayBillDoc.dueDate |
                                                momentFormat}}
                                            </el-badge>
                                        </td>
                                        <td style="vertical-align: middle">
                                            <el-switch
                                                    v-model="posPayBillDoc.isApplyTerm"
                                                    active-color="#13ce66"
                                                    inactive-color="#ff4949"
                                                    @change="updatePayBillDetail(posPayBillDoc, index)"
                                            >
                                            </el-switch>
                                        </td>
                                        <td>
                                            <el-input placeholder="Amount" disabled=""
                                                      v-model.number=posPayBillDoc.amount
                                            ></el-input>
                                            <input type="hidden" v-model="posPayBillDoc.rawAmount"/>

                                        </td>

                                        <td>
                                            <el-input placeholder="Discount" disabled
                                                      v-model.number="posPayBillDoc.discount"></el-input>
                                        </td>
                                        <td>
                                            <el-input placeholder="Net Amount"
                                                      v-model.number=posPayBillDoc.netAmount
                                                      disabled>
                                                <template slot="append">{{currencySymbol}}</template>
                                            </el-input>
                                        </td>
                                        <td>
                                            <el-input placeholder="Paid" v-model.number="posPayBillDoc.paid"
                                                      type='number'
                                                      @keyup.native="updatePayBillDetailPaid(posPayBillDoc, index)"
                                                      @change="updatePayBillDetailPaid(posPayBillDoc, index)"
                                            >
                                                <template slot="append">{{currencySymbol}}</template>
                                            </el-input>
                                        </td>
                                        <td style="vertical-align: middle">
                                            <el-checkbox v-model="posPayBillDoc.isPaid"
                                                         @change="updatePayBillDetail(posPayBillDoc, index)"></el-checkbox>
                                        </td>
                                    </template>
                                </tr>
                            </draggable>
                            <thead>
                            <tr>
                                <th colspan="6" style="text-align: right;vertical-align: middle">
                                    {{langConfig['totalNetAmount']}}:
                                </th>
                                <th colspan="3">
                                    <el-input :placeholder="langConfig['totalNetAmount']"
                                              v-model.number="posPayBillForm.totalNetAmount"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="6" style="text-align: right;vertical-align: middle">
                                    {{langConfig['totalDiscount']}}:
                                </th>
                                <th colspan="3">
                                    <el-input :placeholder="langConfig['totalDiscount']"
                                              v-model.number="posPayBillForm.totalDiscount"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="6" style="text-align: right;vertical-align: middle">
                                    {{langConfig['balanceUnpaid']}}:
                                </th>
                                <th colspan="3">
                                    <el-input :placeholder="langConfig['balanceUnpaid']"
                                              v-model.number="posPayBillForm.balanceUnPaid"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            </thead>
                        </table>
                    </el-col>
                    <el-col :span="6">
                        <div class="w3-code">
                            <div class="ui segments plan">
                                <div class="ui top attached segment teal inverted plan-title">
                                    <span class="plan-ribbon red">{{posPayBillForm.totalDiscount}}{{currencySymbol}}</span>
                                    <span class="ui header">{{langConfig['amountPaid']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">
                                        {{posPayBillForm.totalPaid}}{{currencySymbol}}
                                    </div>
                                </div>
                            </div>

                            <el-form-item :label="langConfig['location']" prop="locationId">

                                <el-select style="display: block !important"
                                           filterable clearable
                                           v-model="posPayBillForm.locationId"
                                           :placeholder="langConfig['chooseLocation']">
                                    <el-option
                                            v-for="item in locationOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                            :disabled="item.disabled">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item :label="langConfig['vendor']" prop="vendorId">
                                <el-select style="display: block !important;"
                                           filterable clearable
                                           v-model="posPayBillForm.vendorId" remote
                                           :remote-method="vendorOpt"
                                           :loading="loading"
                                           :disabled="disabledVendor"

                                           :placeholder="langConfig['vendor']">
                                    <el-option
                                            v-for="item in vendorOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                            :disabled="item.disabled">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item :label="langConfig['paidDate']" prop="payBillDate">
                                <el-date-picker
                                        v-model="posPayBillForm.payBillDate"
                                        type="date"
                                        style="width: 100%;"
                                        placeholder="Pick a day"
                                        :picker-options="options"
                                        :disabled="disabledDate"
                                >
                                </el-date-picker>
                            </el-form-item>
                            <el-row>
                                <el-col :span="12">
                                    <el-form-item :label="langConfig['address']" prop="address">
                                        <el-input type="textarea" v-model="posPayBillForm.address"></el-input>
                                    </el-form-item>
                                </el-col>

                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['note']" prop="note">
                                        <el-input type="textarea" v-model="posPayBillForm.note" :rows="3"></el-input>
                                    </el-form-item>
                                </el-col>

                            </el-row>
                        </div>
                        <!--</el-card>-->
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer fix-dialog-footer"
            >
                <hr style="margin-top: 0px !important;">
                <el-row>
                    <el-col :span="12" style="text-align: left !important;">
                        <el-button type="danger"
                                   @click.native="dialogAddPayBill= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                        <el-button type="success" @click="savePayBill(false,$event)"><i
                                class="el-icon-circle-check"> </i>&nbsp; {{langConfig['saveAndNew']}} <i>(Ctrl + Alt + Enter)</i></el-button>

                        <el-button type="primary" @click.native="savePayBill(true,$event)"><i
                                class="el-icon-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>

                    </el-col>
                </el-row>
            </span>
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
    import {Pos_PayBillReact} from "../../collection/posPayBill";

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
            },
            newRe() {
                let vm = this;
                Pos_PayBillReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        components: {
            draggable
        },
        data() {
            return {
                posPayBillData: [],
                posPayBillDataDisplay: [],
                multipleSelection: [],
                posPayBillId: "",
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPayBill: false,
                dialogUpdatePayBill: false,
                dialogShowPayBill: false,
                typeDiscount: "",
                fullScreen: true,

                searchByDate: "",
                searchByBill: "",
                isOverDue: false,
                posPayBillForm: {
                    totalPaid: 0,
                    amount: 0,
                    payBillDate: moment().toDate(),
                    dueDate: moment().add(1, "month").toDate(),

                    note: "",

                    totalDiscount: 0,
                    totalNetAmount: 0,
                    balanceUnPaid: 0,
                    address: "",

                    isApplyTerm: true,
                    isPaidAll: false,
                    isAllTerm: false,
                    vendorId: "",
                    locationId: ""

                },
                rules: {
                    payBillDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input PayBillDate',
                        trigger: 'blur'
                    }],
                    vendorId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose vendor',
                        trigger: 'change'
                    }],
                    locationId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Location',
                        trigger: 'change'
                    }],

                    // note: [{required: true, type: 'string', message: 'Please input Memo', trigger: 'blur'}],
                },

                // Options
                itemOption: [],
                vendorOption: [],
                termOption: [],

                dialog: true,
                currencySymbol: "",
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
                posPayBillDetail: {},
                locationOption: [],

                disabledVendor: true,
                pickerDateOptions: {
                    shortcuts: [{
                        text: 'Last week',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: 'Last month',
                        onClick(picker) {
                            const end = moment().add(-1, "month").endOf("month").toDate();
                            const start = moment().add(-1, "month").startOf("month").toDate();
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: 'Last 3 months',
                        onClick(picker) {
                            const end = moment().add(-1, "month").endOf("month").toDate();
                            const start = moment().add(-4, "month").startOf("month").toDate();
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: 'This month',
                        onClick(picker) {
                            const end = moment().endOf("month").toDate();
                            const start = moment().startOf("month").toDate();
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: 'Today',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },
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
            }
        },
        watch: {
            currentSize(val) {
                this.isSearching = true;
                let skip = (this.currentPage - 1) * val;
                this.queryData(this.searchData, skip, val + skip);
            },
            currentPage(val) {
                this.isSearching = true;
                let skip = (val - 1) * this.currentSize;
                this.queryData(this.searchData, skip, this.currentSize + skip);
            },
            searchData(val) {
                this.isSearching = true;
                let skip = (this.currentPage - 1) * this.currentSize;
                this.queryData(val, skip, this.currentSize + skip);
            },
            "posPayBillForm.payBillDate"(val) {
                /*let vm = this;
                if (vm.dialogUpdatePayBill == false) {
                    vm.posPayBillForm.posPayBillDate = val;
                }
                if (vm.closeDate && vm.closeDate != "" && vm.closeDate != undefined) {
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
                }*/

                let vm = this;
                if (this.dialogAddPayBill == true) {
                    let ind = 0;
                    vm.posPayBillForm.payBillDate = val;
                    vm.posPayBillData.map((obj) => {
                        obj.dayOverDue = moment(val).startOf("days").diff(moment(obj.dueDate).startOf("days").toDate(), "days") < 0 ? 0 : moment(val).startOf("days").diff(moment(obj.dueDate).startOf("days").toDate(), "days");
                        vm.updatePayBillDetail(obj, ind);
                        ind++;
                    })
                    vm.searchBill();
                }
            },
            /*dialogAddPayBill(val) {
                if (val) {
                    this._inputMaskPayBill();
                }
            },*/
            dialogUpdatePayBill(val) {
                if (val) {
                    this._inputMaskPayBill();
                }
            },
            "posPayBillForm.vendorId"(val) {
                let vm = this;
                if (val) {
                    Meteor.call("queryPosVendorById", val, (err, result) => {
                        if (result) {
                            vm.posPayBillForm.address = result.address;
                            vm.posPayBillForm.termId = result.termId;
                        }
                    })

                    Meteor.call("queryPosBillByVendorId", val, vm.posPayBillForm.payBillDate, vm.posPayBillForm.locationId, (err, result) => {
                        if (result) {
                            vm.posPayBillData = result;
                        }
                        vm.getTotal();
                    })
                } else {
                    Meteor.call("queryPosBillByVendorId", "", vm.posPayBillForm.payBillDate, vm.posPayBillForm.locationId, (err, result) => {
                            if (result) {
                                vm.posPayBillData = result;
                                vm.posPayBillForm.address = "";
                                vm.posPayBillForm.termId = "";

                            }
                            vm.getTotal();
                        }
                    )
                }
            },
            "posPayBillForm.isAllTerm"(val) {
                let vm = this;

                let ind = 0;
                vm.posPayBillData.map((obj) => {
                    if (obj.isShow) {
                        obj.isApplyTerm = val;
                        if (obj.isPaid == false) {
                            obj.isApplyTerm = false;
                        }
                        vm.updatePayBillDetail(obj, ind);
                    }
                    ind++;
                })
            },
            "posPayBillForm.isPaidAll"(val) {
                let vm = this;
                let ind = 0;
                if (val == false) {
                    vm.posPayBillForm.isAllTerm = false;
                }
                this.posPayBillData.map((obj) => {
                    if (obj.isShow) {
                        obj.isPaid = val;
                        if (obj.isPaid == false) {
                            obj.isApplyTerm = false;
                        }
                        vm.updatePayBillDetail(obj, ind);
                    }
                    ind++;
                })
            },
            searchByDate(val) {
                this.searchDate(val);
            },
            isOverDue(val) {
                let vm = this;
                vm.overDueStatus(val);
            },
            "posPayBillForm.locationId"(val) {
                if (val) {
                    this.disabledVendor = false;
                    this.posPayBillForm.vendorId = "";
                } else {
                    this.disabledVendor = true;

                }
            }
        },
        methods: {
            handleSizeChange(val) {
                this.currentSize = val;
            },
            handleCurrentChange(val) {
                this.currentPage = val;
            },
            _inputMaskPayBill() {
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
            queryData: _.debounce(function (val, skip, limit) {
                Meteor.call('queryPayBill', {
                    q: val,
                    filter: this.filter,
                    rolesArea:Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posPayBillDataDisplay = result.content;
                        this.count = result.countPayBill;
                    }
                    this.isSearching = false;
                });
            }, 300),
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
            vendorOpt(query) {
                if (!!query) {
                    this.loading = true;
                    setTimeout(() => {
                        let lists = [];
                        this.loading = false;
                        Meteor.call('queryPosVendorOptionUnPaid', query,Session.get("area"), (err, result) => {
                            if (!err) {
                                this.vendorOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryPosVendorOptionUnPaid', "",Session.get("area"), (err, result) => {
                        if (!err) {
                            this.vendorOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            locationOpt() {
                Meteor.call('queryLocationOption', (err, result) => {
                    this.locationOption = result;
                })
            },
            termOpt() {
                let selector = {};
                Meteor.call('queryPosTermOption', selector, (err, result) => {
                    this.termOption = result;
                })
            },

            savePayBill(isCloseDialog, event) {
                event.preventDefault();
                let vm = this;
                this.$refs["posPayBillFormAdd"].validate((valid) => {
                    if (valid) {
                        let posPayBillDoc = {
                            totalPaid: vm.$_numeral(vm.posPayBillForm.totalPaid).value(),
                            totalNetAmount: vm.$_numeral(vm.posPayBillForm.totalNetAmount).value(),
                            totalDiscount: vm.$_numeral(vm.posPayBillForm.totalDiscount).value(),

                            balanceUnPaid: vm.$_numeral(vm.posPayBillForm.totalNetAmount).value() - vm.$_numeral(vm.posPayBillForm.totalPaid).value(),
                            totalAmount: vm.$_numeral(vm.posPayBillForm.totalNetAmount).value() + vm.$_numeral(vm.posPayBillForm.totalDiscount).value(),

                            payBillDate: moment(vm.posPayBillForm.payBillDate).toDate(),
                            payBillDateName: moment(vm.posPayBillForm.payBillDate).format("DD/MM/YYYY"),
                            note: vm.posPayBillForm.note,
                            address: vm.posPayBillForm.address,

                            rolesArea: Session.get('area'),
                            vendorId: vm.posPayBillForm.vendorId,
                            locationId: vm.posPayBillForm.locationId,
                        };
                        posPayBillDoc.bill = vm.posPayBillData;
                        Meteor.call("insertPosPayBill", posPayBillDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });

                                if (isCloseDialog) {
                                    this.dialogAddPayBill = false;
                                }

                                vm.posPayBillData.forEach((obj) => {
                                    if (obj.isPaid == true) {
                                        Meteor.call("updateBillByPayBill", obj, posPayBillDoc.payBillDate, (err, re) => {
                                            if (err) {
                                                console.log(err.message);
                                            }
                                        })
                                    }
                                })

                                vm.resetForm();
                            }
                        })
                    }
                })


            },

            removePayBill(index, row, rows) {
                let vm = this;

                let companyDoc = WB_waterBillingSetup.findOne({});
                if (companyDoc.integratedPosAccount) {
                    Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                        if (re !== undefined) {
                            vm.closeDate = re.closeDate;
                        } else {
                            vm.closeDate = "";
                        }

                        if (vm.closeDate && vm.closeDate.getTime() >= row.payBillDate.getTime()) {
                            vm.$message({
                                duration: 1000,
                                message: "Already Closing Entry In Account!!",
                                type: 'error'
                            });
                            return false;
                        }

                        if (row.canRemove == true) {
                            vm.$confirm(vm.langConfig['messageWarning'], vm.langConfig['warning'], {
                                confirmButtonText: 'OK',
                                cancelButtonText: 'Cancel',
                                type: 'warning'
                            }).then(() => {
                                Meteor.call("removePosPayBill", row._id, (err, result) => {
                                    if (!err) {
                                        rows.splice(index, 1);
                                        vm.$message({
                                            message: ` ${row.payBillDateName} ` + vm.langConfig['removeSuccess'],
                                            type: 'success'
                                        });

                                    } else {
                                        vm.$message({
                                            type: 'error',
                                            message: vm.langConfig['removeFail']
                                        });
                                    }

                                })
                            }).catch(() => {
                                vm.$message({
                                    type: 'info',
                                    message: 'Delete canceled'
                                });
                            });
                        } else {
                            vm.$message({
                                type: 'error',
                                message: vm.langConfig['message']
                            });
                        }


                    })
                } else {

                    if (row.canRemove == true) {
                        vm.$confirm(vm.langConfig['messageWarning'], vm.langConfig['warning'], {
                            confirmButtonText: 'OK',
                            cancelButtonText: 'Cancel',
                            type: 'warning'
                        }).then(() => {
                            Meteor.call("removePosPayBill", row._id, (err, result) => {
                                if (!err) {
                                    rows.splice(index, 1);
                                    vm.$message({
                                        message: ` ${row.payBillDateName} ` + vm.langConfig['removeSuccess'],
                                        type: 'success'
                                    });

                                } else {
                                    vm.$message({
                                        type: 'error',
                                        message: vm.langConfig['removeFail']
                                    });
                                }

                            })
                        }).catch(() => {
                            vm.$message({
                                type: 'info',
                                message: 'Delete canceled'
                            });
                        });
                    } else {
                        vm.$message({
                            type: 'error',
                            message: vm.langConfig['message']
                        });
                    }

                }

            },
            popupPayBillAdd() {
                this.resetForm();
                this.itemOpt();
                let vm = this;
                $(".el-dialog__title").text(this.langConfig['add']);

                this.vendorOpt();
                this.termOpt();

                Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                    if (re !== undefined) {
                        vm.closeDate = re.closeDate;
                    } else {
                        vm.closeDate = "";
                    }
                })
            },
            updatePayBillDetail(row, index) {
                let vm = this;
                if (row.isPaid == false) {
                    row.paid = 0;
                    row.isApplyTerm = false;
                }
                if (row.isApplyTerm) {
                    Meteor.call("queryPosTermById", row.termId, (err, data) => {
                        if (data && data.isDiscount && vm.$_numeral(row.paid).value() == vm.$_numeral(row.netAmount).value()) {
                            if (row.isPaid) {
                                row.discount = 0;
                                if (moment(vm.posPayBillForm.payBillDate).diff(row.billDate, "days") <= data.daysForDiscount) {
                                    row.discount = formatCurrency(vm.$_numeral(row.amount).value() * data.value / 100);
                                }
                                row.paid = vm.$_numeral(row.amount).value() - vm.$_numeral(row.discount).value();
                                row.netAmount = formatCurrency(vm.$_numeral(row.amount).value() - vm.$_numeral(row.discount).value());
                            } else {
                                row.discount = 0;
                                if (moment(vm.posPayBillForm.payBillDate).diff(row.billDate, "days") <= data.daysForDiscount) {
                                    row.discount = formatCurrency(vm.$_numeral(row.amount).value() * data.value / 100);
                                    row.netAmount = formatCurrency(vm.$_numeral(row.amount).value() - vm.$_numeral(row.discount).value());

                                }
                                row.paid = 0;
                            }
                        } else {
                            if (row.isPaid) {
                                row.discount = 0;
                                row.paid = vm.$_numeral(row.amount).value();
                                row.netAmount = formatCurrency(row.amount);
                            } else {
                                row.discount = 0;
                                row.paid = 0;
                                row.netAmount = formatCurrency(row.amount);
                            }
                        }
                        this.posPayBillData[index] = row;
                        vm.getTotal();
                    })

                } else {
                    if (row.isPaid) {
                        row.discount = 0;
                        row.paid = vm.$_numeral(row.amount).value();
                        row.netAmount = formatCurrency(row.amount);
                    } else {
                        row.discount = 0;
                        row.netAmount = formatCurrency(row.amount);
                        row.paid = 0;
                    }
                    this.posPayBillData[index] = row;
                    vm.getTotal();
                }
            },
            updatePayBillDetailPaid(row, index) {
                if (row.netAmount != row.paid) {
                    if (row.paid > 0) {
                        row.isPaid = true;
                    } else {
                        row.isPaid = false;
                    }
                    row.discount = 0;
                    row.netAmount = formatCurrency(row.amount);
                    this.posPayBillData[index] = row;
                } else {
                    if (row.paid > 0) {
                        row.isPaid = true;
                    } else {
                        row.isPaid = false;
                    }
                    this.posPayBillData[index] = row;
                    this.updatePayBillDetail(row, index);
                }
                this.getTotal();
            },
            cancel() {
                this.resetForm();
                this.$message({
                    type: 'info',
                    message: 'Canceled'
                });
            },
            resetForm() {
                this.posPayBillData = [];
                this.posPayBillForm.isPaidAll = false;
                this.posPayBillForm.isApplyTerm = false;
                if (this.$refs["posPayBillFormAdd"]) {
                    this.$refs["posPayBillFormAdd"].resetFields();
                    this.getTotal();

                    this.refForm = "";

                }
            },
            getTotal() {
                let vm = this;
                let totalNetAmount = 0;
                let totalDiscount = 0;
                let totalPaid = 0;
                vm.posPayBillData.forEach(function (obj) {
                    if (obj.isShow) {
                        totalNetAmount += parseFloat(vm.$_numeral(obj.netAmount).value() || 0);
                        totalDiscount += parseFloat(vm.$_numeral(obj.discount).value() || 0);
                        totalPaid += parseFloat(vm.$_numeral(obj.paid).value() || 0);
                    }
                });
                let companyDoc = WB_waterBillingSetup.findOne({});
                this.currencySymbol = getCurrencySymbolById(companyDoc.baseCurrency);
                vm.posPayBillForm.totalNetAmount = formatCurrencyLast(totalNetAmount, companyDoc.baseCurrency);
                vm.posPayBillForm.totalDiscount = formatCurrencyLast(totalDiscount, companyDoc.baseCurrency);
                vm.posPayBillForm.totalPaid = formatCurrencyLast(totalPaid, companyDoc.baseCurrency);
                vm.posPayBillForm.balanceUnPaid = formatCurrencyLast(totalNetAmount - totalPaid, companyDoc.baseCurrency);
            },
            searchBill() {
                let vm = this;
                let canFind = 0;
                let ind = 0;
                vm.posPayBillData.forEach((obj) => {
                    if ((obj.billNo == vm.searchByBill || vm.searchByBill == "") && ((moment(obj.billDate).toDate().getTime() > moment(vm.searchByDate[0]).startOf("days").toDate().getTime() && moment(obj.billDate).toDate().getTime() < moment(vm.searchByDate[1]).endOf("days").toDate().getTime()) || vm.searchByDate[0] == null)) {
                        obj.isShow = true;
                        canFind++;
                    } else {
                        obj.isShow = false;
                        obj.isPaid = false;
                        obj.isApplyTerm = false;
                    }
                    vm.updatePayBillDetail(obj, ind);
                    ind++;
                });
                if (canFind == 0) {
                    this.$message({
                        type: 'error',
                        message: 'Not Found'
                    });
                } else {

                    this.$message({
                        type: 'success',
                        message: 'Have ' + canFind + " Bills"
                    });
                }
                vm.getTotal();
                if (vm.isOverDue) {
                    vm.overDueStatus(vm.isOverDue);
                }

            },
            searchDate(val) {
                let vm = this;
                let canFind = 0;
                let ind = 0;
                vm.posPayBillData.forEach((obj) => {
                    if ((obj.billNo == vm.searchByBill || vm.searchByBill == "") && (moment(obj.billDate).toDate().getTime() > moment(val[0]).startOf("days").toDate().getTime() && moment(obj.billDate).toDate().getTime() < moment(val[1]).endOf("days").toDate().getTime()) || val[0] == null) {
                        obj.isShow = true;
                        canFind++;
                    } else {
                        obj.isShow = false;
                        obj.isPaid = false;
                        obj.isApplyTerm = false;
                    }
                    vm.updatePayBillDetail(obj, ind);
                    ind++;
                });
                if (canFind == 0) {
                    this.$message({
                        type: 'error',
                        message: 'Not Found'
                    });
                } else {

                    this.$message({
                        type: 'success',
                        message: 'Have ' + canFind + " Bills"
                    });
                }
                vm.getTotal();
                if (vm.isOverDue) {
                    vm.overDueStatus(vm.isOverDue);
                }
            },
            overDueStatus(val) {
                let vm = this;
                if (val) {
                    vm.posPayBillData.map((obj) => {
                        if (obj.isShow == true && obj.dayOverDue <= 0) {
                            obj.isShow = false;
                        }
                        return obj;
                    })
                } else {
                    vm.searchBill();
                }
            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            this.getTotal();
            this.locationOpt();
            Meteor.subscribe('Pos_PayBillReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['payBill'];
                return data;
            }
        }
    }


</script>

<style>
    .item {
        /*margin-top: 10px;*/
        margin-right: 10px;
    }

    .el-badge__content.is-fixed {
        margin-right: -5px;
    }
</style>


