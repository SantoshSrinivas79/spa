<template>
    <div class="sch_payment">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer"
                           @click="popupSchPaymentAdd(),dialogAddSchPayment= true,resetForm()"
                        >
                            <i class="fa fa-plus"></i> {{langConfig['payment']}}
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
                        :data="schPaymentDataDisplay"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="paymentDateName"
                            :label="langConfig['receiveDate']"
                            sortable
                            width="180">
                    </el-table-column>

                    <el-table-column
                            prop="studentDoc.personal.name"
                            :label="langConfig['student']">
                    </el-table-column>

                    <el-table-column
                            prop="paymentNo"
                            :label="langConfig['paymentNo']">
                    </el-table-column>
                    <el-table-column
                            prop="totalNetAmount"
                            :label="langConfig['amount']">
                    </el-table-column>
                    <el-table-column
                            prop="waived"
                            :label="langConfig['waived']">
                    </el-table-column>
                    <el-table-column
                            prop="penalty"
                            :label="langConfig['penalty']">
                    </el-table-column>
                    <el-table-column
                            prop="fee"
                            :label="langConfig['fee']">
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
                            prop="paymentId"
                            :label="langConfig['status']"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.paymentId != undefined ? 'success' : scope.row.saleOrderId != undefined ? 'warning' : 'primary'"
                                    close-transition>{{scope.row.paymentId!=undefined ? "Payment" :
                                scope.row.saleOrderId!=undefined ? "Sale Order" : "Receive Payment"}}
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
                                           @click="removeSchPayment(scope.$index,scope.row,schPaymentDataDisplay)"
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
                :visible.sync="dialogAddSchPayment"
                :fullscreen="fullScreen"

        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schPaymentForm" :rules="rules" ref="schPaymentFormAdd" label-width="120px"
                     :label-position="labelPosition"
                     class="schPaymentForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="schPaymentForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="2">

                                </th>
                                <th style="text-align: right; vertical-align: middle;" colspan="4">
                                    <el-checkbox v-model="isOverDue"
                                                 :label="langConfig['overdueStatusOnly']"></el-checkbox>
                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr>
                                <th>{{langConfig['no']}}</th>

                                <th>{{langConfig['dueDate']}}</th>
                                <th>{{langConfig['netAmount']}}</th>
                                <th>{{langConfig['waived']}}</th>
                                <th style="color: #e91e63 !important;">{{langConfig['paid']}}</th>
                                <th style="vertical-align: middle;">
                                    <el-checkbox v-model="schPaymentForm.isPaidAll"></el-checkbox>
                                </th>
                            </tr>
                            </thead>
                            <!--<draggable v-model="schPaymentData" :element="'tbody'">-->
                            <tr v-for="(schPaymentDoc,index ) in this.schPaymentData" :key="index">
                                <template v-if="schPaymentDoc.isShow">

                                    <td style="vertical-align: middle">
                                        {{index +1}}
                                    </td>
                                    <td style="vertical-align: middle">
                                        <el-badge :value=schPaymentDoc.dayOverDue :max="99" class="item">
                                            {{schPaymentDoc.receivePaymentScheduleDate |
                                            momentFormat}}
                                        </el-badge>
                                    </td>
                                    <td>
                                        <el-input placeholder="Net Amount"
                                                  v-model.number=schPaymentDoc.netAmount
                                                  disabled>
                                            <template slot="append">{{currencySymbol}}</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input placeholder="Waived" type='number'
                                                  v-model.number=schPaymentDoc.waived
                                                  @keyup.native="updateSchPaymentDetail(schPaymentDoc, index)"
                                                  @change="updateSchPaymentDetail(schPaymentDoc, index)"
                                        >
                                            <template slot="append">
                                                <el-dropdown trigger="click" :hide-on-click="false">
                                                    <span class="el-dropdown-link">
                                                        {{langConfig['desc']}} <span v-if="schPaymentDoc.desc===''">
                                                                <i class="el-icon-caret-bottom el-icon--right"></i>
                                                            </span>
                                                            <span v-else>
                                                                <i class="el-icon-circle-check el-icon--right"
                                                                   style="color: blue"></i>

                                                            </span>
                                                    </span>
                                                    <el-dropdown-menu slot="dropdown">
                                                        <el-dropdown-item class="clearfix">
                                                            <el-input :placeholder="langConfig['desc']" type="textarea"
                                                                      v-model.number=schPaymentDoc.desc
                                                                      @keyup.native="updateSchPaymentDetailPaid(schPaymentDoc, index)"></el-input>
                                                        </el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </el-dropdown>
                                            </template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input placeholder="Paid" v-model.number="schPaymentDoc.paid"
                                                  type='number'
                                                  @keyup.native="updateSchPaymentDetailPaid(schPaymentDoc, index)"
                                                  @change="updateSchPaymentDetailPaid(schPaymentDoc, index)"
                                        >
                                            <template slot="append">{{currencySymbol}}</template>

                                        </el-input>
                                    </td>
                                    <td style="vertical-align: middle">
                                        <el-checkbox v-model="schPaymentDoc.isPaid"
                                                     @change="updateSchPaymentDetail(schPaymentDoc, index)"></el-checkbox>
                                    </td>
                                </template>
                            </tr>

                            <!--</draggable>-->
                            <thead>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['totalNetAmount']}}:
                                </th>
                                <th colspan="3">
                                    <el-input :placeholder="langConfig['totalNetAmount']"
                                              v-model.number="schPaymentForm.totalNetAmount"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['balanceUnpaid']}}:
                                </th>
                                <th colspan="3">
                                    <el-input :placeholder="langConfig['balanceUnpaid']"
                                              v-model.number="schPaymentForm.balanceUnPaid"
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
                                    <span class="plan-ribbon red">{{schPaymentForm.totalDiscount}}{{currencySymbol}}</span>
                                    <span class="ui header">{{langConfig['amountReceive']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">
                                        {{schPaymentForm.totalPaid}}{{currencySymbol}}
                                    </div>
                                </div>
                            </div>
                            <el-form-item :label="langConfig['class']" prop="classId">
                                <el-select style="display: block !important"
                                           filterable clearable
                                           v-model="schPaymentForm.classId"
                                           :placeholder="langConfig['chooseClass']">
                                    <el-option
                                            v-for="item in classOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                            :disabled="item.disabled">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item :label="langConfig['student']" prop="studentId">

                                <el-select style="display: block !important"
                                           filterable clearable
                                           v-model="schPaymentForm.studentId"
                                           :disabled="disabledStudent"
                                           :placeholder="langConfig['student']">
                                    <el-option
                                            v-for="item in studentOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                            :disabled="item.disabled">
                                    </el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item :label="langConfig['receiveDate']" prop="paymentDate">
                                <el-date-picker
                                        v-model="schPaymentForm.paymentDate"
                                        type="date"
                                        style="width: 100%;"
                                        placeholder="Pick a day"
                                        :picker-options="options"
                                        :disabled="disabledDate"
                                >
                                </el-date-picker>
                            </el-form-item>
                            <el-form-item :label="langConfig['penalty']" prop="penalty">

                                <el-input :placeholder="langConfig['penalty']"
                                          v-model.number="schPaymentForm.penalty"
                                          type='number'
                                >
                                    <template slot="append">{{currencySymbol}}</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item :label="langConfig['fee']" prop="fee">

                                <el-input :placeholder="langConfig['fee']"
                                          v-model.number="schPaymentForm.fee"
                                          type='number'
                                >
                                    <template slot="append">{{currencySymbol}}</template>
                                </el-input>
                            </el-form-item>

                            <el-form-item :label="langConfig['paymentNo']" prop="paymentNo">
                                <el-input v-model="schPaymentForm.paymentNo" prefix-icon="el-icon-edit"></el-input>
                            </el-form-item>
                            <el-form-item :label="langConfig['note']" prop="note">
                                <el-input type="textarea" v-model="schPaymentForm.note" :rows="3"></el-input>
                            </el-form-item>
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
                                   @click.native="dialogAddSchPayment= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                        <el-button type="info" @click="saveSchPayment(true,$event,true)"><i
                                class="el-icon-circle-check"> </i>&nbsp; {{langConfig['saveAndPrint']}}</el-button>
                        <el-button type="success" @click="saveSchPayment(false,$event)"><i
                                class="el-icon-circle-check"> </i>&nbsp; {{langConfig['saveAndNew']}} <i>(Ctrl + Alt + Enter)</i></el-button>

                        <el-button type="primary" @click.native="saveSchPayment(true,$event)"><i
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
    import {GeneralFunction} from "../../../imports/api/methods/generalFunction";
    import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency";
    import {WB_waterBillingSetup} from "../../collection/waterBillingSetup";
    // require('cleave.js/dist/addons/cleave-phone.ac');
    // require('cleave.js/dist/addons/cleave-phone.{country}');

    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_PaymentReact} from "../../collection/schPayment";

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
                Sch_PaymentReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        components: {
            draggable
        },
        data() {
            return {
                schPaymentData: [],
                schPaymentDataDisplay: [],
                multipleSelection: [],
                schPaymentId: "",
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchPayment: false,
                dialogUpdateSchPayment: false,
                dialogShowSchPayment: false,
                typeDiscount: "",
                fullScreen: true,

                isOverDue: false,
                schPaymentForm: {
                    totalPaid: 0,
                    amount: 0,
                    paymentDate: moment().toDate(),
                    dueDate: moment().add(1, "month").toDate(),

                    note: "",

                    fee: 0,
                    totalNetAmount: 0,
                    balanceUnPaid: 0,
                    address: "",

                    isPaidAll: false,
                    studentId: "",
                    classId: "",
                    penalty: 0,
                    paymentNo: ""

                },
                rules: {
                    paymentDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input SchPaymentDate',
                        trigger: 'blur'
                    }],
                    paymentNo: [{required: true, type: 'string', message: 'Please input Payment No', trigger: 'blur'}],

                    studentId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Student',
                        trigger: 'change'
                    }]
                    ,
                    classId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Class',
                        trigger: 'change'
                    }]
                    // note: [{required: true, type: 'string', message: 'Please input Memo', trigger: 'blur'}],
                },

                // Options
                itemOption: [],
                studentOption: [],
                termOption: [],

                dialog: true,
                notifications: false,
                sound: true,
                widgets: false,
                labelPosition: "right",
                options: {
                    disabledDate(time) {
                        return false;
                    }
                },
                disabledDate: false,
                closeDate: "",
                type: "",
                schPaymentDetail: {},

                classOption: [],
                disabledStudent: true,
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
            /*dialogAddSchPayment(val) {
                if (val) {
                    this._inputMaskSchPayment();
                }
            },*/
            dialogUpdateSchPayment(val) {
                if (val) {
                    this._inputMaskSchPayment();
                }
            },
            "schPaymentForm.studentId"(val) {
                let vm = this;
                if (val) {
                    Meteor.call("querySchPaymentScheduleByStudentId", val, vm.schPaymentForm.classId, (err, result) => {
                        if (result) {
                            vm.schPaymentData = result;
                        }
                        vm.getTotal();
                    })
                } else {
                    Meteor.call("querySchPaymentScheduleByStudentId", "", vm.schPaymentForm.classId, (err, result) => {
                        if (result) {
                            vm.schPaymentData = result;

                        }
                        vm.getTotal();
                    })
                }
            },
            "schPaymentForm.isPaidAll"(val) {
                let vm = this;
                let ind = 0;
                if (val === false) {
                    vm.schPaymentForm.isAllTerm = false;
                }
                this.schPaymentData.map((obj) => {
                    if (obj.isShow) {
                        obj.isPaid = val;
                        vm.updateSchPaymentDetail(obj, ind);
                    }
                    ind++;
                })
            },
            isOverDue(val) {
                let vm = this;
                vm.overDueStatus(val);
            },
            "schPaymentForm.classId"(val) {
                if (val) {
                    this.disabledStudent = false;
                    this.schPaymentForm.studentId = "";
                    this.studentOpt(val);
                } else {
                    this.disabledStudent = true;

                }
            },
            "schPaymentForm.paymentDate"(val) {
                if (val) {
                    this.getPaymentNoByRoleAndDate(val);
                    let vm = this;
                    if (this.dialogAddSchPayment === true) {
                        let ind = 0;
                        vm.schPaymentForm.paymentDate = val;
                        vm.schPaymentData.map((obj) => {
                            obj.dayOverDue = moment(val).startOf("days").diff(moment(obj.receivePaymentScheduleDate).startOf("days").toDate(), "days") < 0 ? 0 : moment(val).startOf("days").diff(moment(obj.receivePaymentScheduleDate).startOf("days").toDate(), "days");
                            vm.updateSchPaymentDetailPaid(obj, ind);
                            ind++;
                        });
                    }
                }
            },
            "schPaymentForm.penalty"(val) {
                this.schPaymentForm.penalty = val || 0;
                this.getTotal();

            },
            "schPaymentForm.fee"(val) {
                this.schPaymentForm.fee = val || 0;
                this.getTotal();

            }
        },
        methods: {
            handleSizeChange(val) {
                this.currentSize = val;
            },
            handleCurrentChange(val) {
                this.currentPage = val;
            },
            _inputMaskSchPayment() {
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
                Meteor.call('querySchPayment', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schPaymentDataDisplay = result.content;
                        this.count = result.countSchPayment;
                    }
                    this.isSearching = false;
                });
            }, 300),
            classOpt() {
                Meteor.call('queryClassOptionActive', {}, (err, result) => {
                    this.classOption = result;
                })
            },
            studentOpt(classId) {
                Meteor.call("queryStudentOptionByClass", classId, (err, result) => {
                    if (result) {
                        this.studentOption = result;
                    }
                })
            },
            saveSchPayment(isCloseDialog, event, isPrint) {
                event.preventDefault();
                let vm = this;
                this.$refs["schPaymentFormAdd"].validate((valid) => {
                    if (valid) {
                        let schPaymentDoc = {
                            totalPaid: vm.$_numeral(vm.schPaymentForm.totalPaid).value(),
                            totalNetAmount: vm.$_numeral(vm.schPaymentForm.totalNetAmount).value(),
                            totalWaived: vm.$_numeral(vm.schPaymentForm.totalWaived).value(),

                            balanceUnPaid: vm.$_numeral(vm.schPaymentForm.totalNetAmount).value() - vm.$_numeral(vm.schPaymentForm.totalPaid).value() - vm.$_numeral(vm.schPaymentForm.totalWaived).value() + vm.schPaymentForm.penalty + vm.schPaymentForm.fee,

                            paymentDate: moment(vm.schPaymentForm.paymentDate).toDate(),
                            paymentDateName: moment(vm.schPaymentForm.paymentDate).format("DD/MM/YYYY"),
                            note: vm.schPaymentForm.note,
                            paymentNo: vm.schPaymentForm.paymentNo,
                            penalty: vm.schPaymentForm.penalty,
                            fee: vm.schPaymentForm.fee,

                            rolesArea: Session.get('area'),
                            studentId: vm.schPaymentForm.studentId,
                            classId: vm.schPaymentForm.classId,
                        };
                        schPaymentDoc.schedule = vm.schPaymentData;
                        Meteor.call("insertSchPayment", schPaymentDoc, (err, result) => {
                            if (!err) {


                                if (isCloseDialog) {
                                    this.dialogAddSchPayment = false;
                                } else {
                                    vm.getPaymentNoByRoleAndDate(this.schPaymentForm.paymentDate);
                                }

                                vm.schPaymentData.forEach((obj) => {
                                    if (obj.isPaid === true) {
                                        Meteor.call("updatePaymentScheduleByPayment", obj, schPaymentDoc.paymentDate, (err, re) => {
                                            if (err) {
                                                console.log(err.message);
                                            }
                                        })
                                    }
                                });

                                if (isPrint) {
                                    FlowRouter.go('/sch-data/schPayment/print?pmt=' + result);
                                } else {
                                    vm.$message({
                                        duration: 1000,
                                        message: `Save Successfully!`,
                                        type: 'success'
                                    });
                                }

                                vm.resetForm();
                            }
                        })
                    }
                })


            },

            removeSchPayment(index, row, rows) {
                let vm = this;
                if (row.canRemove === true) {
                    vm.$confirm(this.langConfig['messageWarning'], this.langConfig['warning'], {
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancel',
                        type: 'warning'
                    }).then(() => {
                        Meteor.call("removeSchPayment", row._id, (err, result) => {
                            if (!err) {
                                rows.splice(index, 1);
                                vm.$message({
                                    message: ` ${row.paymentDateName} ` + this.langConfig['removeSuccess'],
                                    type: 'success'
                                });

                            } else {
                                vm.$message({
                                    type: 'error',
                                    message: this.langConfig['removeFail']
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
                        message: this.langConfig['message']
                    });
                }
            },
            popupSchPaymentAdd() {
                this.resetForm();
                this.classOpt();
                let vm = this;
                $(".el-dialog__title").text(this.langConfig['add']);

                this.studentOpt();
                this.getPaymentNoByRoleAndDate(this.schPaymentForm.paymentDate);
            },
            updateSchPaymentDetail(row, index) {
                let vm = this;
                if (row.isPaid === false) {
                    row.paid = 0;
                    row.isApplyTerm = false;
                }
                if (row.isPaid) {
                    row.paid = vm.$_numeral(row.netAmount).value() - (row.waived || 0);
                    row.netAmount = formatCurrency(row.netAmount);
                }
                else {
                    row.netAmount = formatCurrency(row.netAmount);
                    row.paid = 0;
                }
                this.schPaymentData[index] = row;
                vm.getTotal();
            },
            updateSchPaymentDetailPaid(row, index) {
                if (row.netAmount !== row.paid) {
                    if (row.paid > 0) {
                        row.isPaid = true;
                    } else {
                        row.isPaid = false;
                    }
                    row.netAmount = row.netAmount;
                    this.schPaymentData[index] = row;
                } else {
                    if (row.paid > 0) {
                        row.isPaid = true;
                    } else {
                        row.isPaid = false;
                    }
                    this.schPaymentData[index] = row;
                    this.updateSchPaymentDetail(row, index);
                }
                this.getTotal();
            }
            ,
            cancel() {
                this.resetForm();
                this.$message({
                    type: 'info',
                    message: 'Canceled'
                });
            }
            ,
            resetForm() {
                this.schPaymentData = [];
                this.schPaymentForm.isPaidAll = false;
                this.schPaymentForm.isApplyTerm = false;
                if (this.$refs["schPaymentFormAdd"]) {
                    this.$refs["schPaymentFormAdd"].resetFields();
                    this.getTotal();

                    this.refForm = "";

                }
            }
            ,
            getTotal() {
                let vm = this;
                let totalNetAmount = 0;
                let totalPaid = 0;
                let totalWaived = 0;
                vm.schPaymentData.forEach(function (obj) {
                    if (obj.isShow) {
                        totalNetAmount += parseFloat(vm.$_numeral(obj.netAmount).value() || 0);
                        totalPaid += parseFloat(vm.$_numeral(obj.paid).value() || 0);
                        totalWaived += parseFloat(vm.$_numeral(obj.waived).value() || 0);
                    }
                });
                let companyDoc = WB_waterBillingSetup.findOne({rolesArea: Session.get("area")});
                this.currencySymbol = getCurrencySymbolById(companyDoc.baseCurrency);
                vm.schPaymentForm.totalNetAmount = formatCurrency(totalNetAmount, companyDoc.baseCurrency);
                vm.schPaymentForm.totalWaived = formatCurrency(totalWaived, companyDoc.baseCurrency);
                vm.schPaymentForm.totalPaid = formatCurrency(totalPaid + vm.schPaymentForm.penalty + vm.schPaymentForm.fee, companyDoc.baseCurrency);
                vm.schPaymentForm.balanceUnPaid = formatCurrency(totalNetAmount - totalPaid - totalWaived, companyDoc.baseCurrency);
            }
            ,
            overDueStatus(val) {
                let vm = this;
                if (val) {
                    vm.schPaymentData.map((obj) => {
                        if (obj.isShow === true && (obj.receivePaymentScheduleDate.getTime() > vm.schPaymentForm.paymentDate.getTime())) {
                            obj.isShow = false;
                        }
                        return obj;
                    })
                } else {
                    vm.schPaymentData.map((obj) => {
                        obj.isShow = true;
                        return obj;
                    })
                }
            },
            getPaymentNoByRoleAndDate(date) {
                let vm = this;
                Meteor.call("sch_getPaymentNoByRoleAndDate", Session.get("area"), date, (err, result) => {
                    if (!err) {
                        vm.schPaymentForm.paymentNo = result;
                    }
                })
            },
        },
        created() {
            this.isSearching = true;
            this.queryData();
            this.getTotal();
            this.classOpt();
            Meteor.subscribe('Sch_PaymentReact');

        }
        ,
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['payment'];
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




