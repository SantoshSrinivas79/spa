<template>
    <div class="sch_busPayment">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer"
                           @click="popupSchBusPaymentAdd(),dialogAddSchBusPayment= true,resetForm()"
                        >
                            <i class="fa fa-plus"></i> {{langConfig['busPayment']}}
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
                        v-loading="newLoading"
                        :data="schBusPaymentDataDisplay"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="busPaymentDateName"
                            :label="langConfig['receiveDate']"
                            sortable
                            width="180">
                    </el-table-column>

                    <el-table-column
                            prop="studentDoc.personal.name"
                            :label="langConfig['student']">
                    </el-table-column>

                    <el-table-column
                            prop="busPaymentNo"
                            :label="langConfig['busPaymentNo']">
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
                            prop="penalty"
                            :label="langConfig['penalty']">
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
                            :label="langConfig['action']"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeSchBusPayment(scope.$index,scope.row,schBusPaymentDataDisplay)"
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
                :visible.sync="dialogAddSchBusPayment"
                :fullscreen="fullScreen"

        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schBusPaymentForm" :rules="rules" ref="schBusPaymentFormAdd" label-width="120px"
                     :label-position="labelPosition"
                     class="schBusPaymentForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="schBusPaymentForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="3" style="vertical-align: inherit !important;">

                                </th>
                                <th style="text-align: right; vertical-align: inherit !important;" colspan="3">
                                    <el-checkbox v-model="isOverDue"
                                                 :label="langConfig['overdueStatusOnly']"></el-checkbox>
                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr>
                                <th>{{langConfig['no']}}</th>

                                <th>{{langConfig['dueDate']}}</th>
                                <th>{{langConfig['amount']}}</th>
                                <th>{{langConfig['waived']}}</th>
                                <th style="color: #e91e63 !important;">{{langConfig['paid']}}</th>
                                <th style="vertical-align: middle;">
                                    <el-checkbox v-model="schBusPaymentForm.isPaidAll"></el-checkbox>
                                </th>
                            </tr>
                            </thead>
                            <!--<draggable v-model="schBusPaymentData" :element="'tbody'">-->
                            <tr v-for="(schBusPaymentDoc,index ) in this.schBusPaymentData" :key="index">


                                <td style="vertical-align: middle">
                                    {{index +1}}
                                </td>
                                <td style="vertical-align: middle">
                                    <el-badge :value=schBusPaymentDoc.dayOverDue :max="99" class="item">
                                        {{schBusPaymentDoc.dueDate |
                                        momentFormat}}
                                    </el-badge>
                                </td>
                                <td>
                                    <el-input placeholder="Amount" disabled
                                              v-model.number=schBusPaymentDoc.amount
                                    ></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Waived" type='number'
                                              v-model.number=schBusPaymentDoc.waived
                                              @keyup.native="updateSchBusPaymentDetail(schBusPaymentDoc, index)"
                                              @change="updateSchBusPaymentDetail(schBusPaymentDoc, index)"
                                    >
                                        <template slot="append">
                                            <el-dropdown trigger="click" :hide-on-click="false">
                                                    <span class="el-dropdown-link">
                                                        {{langConfig['desc']}} <span v-if="schBusPaymentDoc.desc===''">
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
                                                                  v-model.number=schBusPaymentDoc.desc
                                                                  @keyup.native="updateSchBusPaymentDetailPaid(schBusPaymentDoc, index)"></el-input>
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input placeholder="paid" disabled
                                              v-model.number=schBusPaymentDoc.paid
                                    ></el-input>

                                </td>
                                <td style="vertical-align: middle">
                                    <el-checkbox v-model="schBusPaymentDoc.isPaid"
                                                 @change="updateSchBusPaymentDetail(schBusPaymentDoc, index)"></el-checkbox>
                                </td>
                            </tr>

                            <!--</draggable>-->
                            <thead>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['totalAmount']}}:
                                </th>
                                <th colspan="3">
                                    <el-input :placeholder="langConfig['totalAmount']"
                                              v-model.number="schBusPaymentForm.totalAmount"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['balanceUnpaid']}}:
                                </th>
                                <th colspan="2">
                                    <el-input :placeholder="langConfig['balanceUnpaid']"
                                              v-model.number="schBusPaymentForm.balanceUnPaid"
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
                                    <span class="plan-ribbon red">{{schBusPaymentForm.totalWaived}}{{currencySymbol}}</span>
                                    <span class="ui header">{{langConfig['amountReceive']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">
                                        {{schBusPaymentForm.totalPaid}}{{currencySymbol}}
                                    </div>
                                </div>
                            </div>

                            <el-form-item :label="langConfig['student']" prop="busRegisterId">
                                <el-select style="display: block !important;"
                                           filterable
                                           v-model="schBusPaymentForm.busRegisterId" remote
                                           remote :remote-method="busRegisterOpt"
                                           :placeholder="langConfig['chooseItem']">
                                    <el-option
                                            v-for="item in busRegisterList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                            :disabled="item.disabled">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item :label="langConfig['dueDate']" prop="dueDate">
                                <el-date-picker
                                        v-model="schBusPaymentForm.dueDate"
                                        type="date"
                                        style="width: 100%;"
                                        placeholder="Pick a day"
                                        :picker-options="options"
                                        :disabled="disabledDate"
                                >
                                </el-date-picker>
                            </el-form-item>
                            <el-form-item :label="langConfig['receiveDate']" prop="busPaymentDate">
                                <el-date-picker
                                        v-model="schBusPaymentForm.busPaymentDate"
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
                                          v-model.number="schBusPaymentForm.penalty"
                                          type='number'
                                >
                                    <template slot="append">{{currencySymbol}}</template>
                                </el-input>
                            </el-form-item>

                            <el-form-item :label="langConfig['busPaymentNo']" prop="busPaymentNo">
                                <el-input v-model="schBusPaymentForm.busPaymentNo"
                                          prefix-icon="el-icon-edit"></el-input>
                            </el-form-item>
                            <el-form-item :label="langConfig['status']" prop="status">
                                <el-switch
                                        v-model="schBusPaymentForm.status"
                                        active-color="#13ce66"
                                        inactive-color="#ff4949"
                                >
                                </el-switch>
                            </el-form-item>

                            <el-form-item :label="langConfig['note']" prop="note">
                                <el-input type="textarea" v-model="schBusPaymentForm.note" :rows="3"></el-input>
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
                                   @click.native="dialogAddSchBusPayment= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                        <el-button type="info" @click="saveSchBusPayment(true,$event,true)"><i
                                class="el-icon-circle-check"> </i>&nbsp; {{langConfig['saveAndPrint']}}</el-button>
                        <el-button type="success" @click="saveSchBusPayment(false,$event)"><i
                                class="el-icon-circle-check"> </i>&nbsp; {{langConfig['saveAndNew']}} <i>(Ctrl + Alt + Enter)</i></el-button>

                        <el-button type="primary" @click.native="saveSchBusPayment(true,$event)"><i
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
    import {Sch_BusPaymentReact} from "../../collection/schBusPayment";

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
                Sch_BusPaymentReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        components: {
            draggable
        },
        data() {
            return {
                newLoading: true,
                schBusPaymentData: [],
                schBusPaymentDataDisplay: [],
                multipleSelection: [],
                schBusPaymentId: "",
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchBusPayment: false,
                dialogUpdateSchBusPayment: false,
                dialogShowSchBusPayment: false,
                typeDiscount: "",
                fullScreen: true,
                currencySymbol: "",
                isOverDue: false,
                schBusPaymentForm: {
                    totalPaid: 0,
                    amount: 0,
                    busPaymentDate: moment().toDate(),
                    dueDate: moment().toDate(),

                    note: "",

                    totalAmount: 0,
                    balanceUnPaid: 0,
                    address: "",
                    studentId: "",
                    busRegisterId: "",
                    penalty: 0,
                    status: false,
                    busPaymentNo: "",
                    isPaidAll: false

                },
                rules: {
                    busPaymentDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input SchBusPaymentDate',
                        trigger: 'blur'
                    }],
                    dueDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input Due Date',
                        trigger: 'blur'
                    }],
                    busPaymentNo: [{
                        required: true,
                        type: 'string',
                        message: 'Please input BusPayment No',
                        trigger: 'blur'
                    }],

                    busRegisterId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Student',
                        trigger: 'change'
                    }]
                    // note: [{required: true, type: 'string', message: 'Please input Memo', trigger: 'blur'}],
                },

                // Options
                itemOption: [],
                busRegisterList: [],
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
                schBusPaymentDetail: {},

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
            /*dialogAddSchBusPayment(val) {
                if (val) {
                    this._inputMaskSchBusPayment();
                }
            },*/
            dialogUpdateSchBusPayment(val) {
                if (val) {
                    this._inputMaskSchBusPayment();
                }
            },
            "schBusPaymentForm.busRegisterId"(val) {
                let vm = this;
                if (val && vm.schBusPaymentForm.busPaymentDate) {
                    Meteor.call("querySchBusPaymentScheduleByRegisterId", val, vm.schBusPaymentForm.busPaymentDate, (err, result) => {
                        vm.schBusPaymentData = [];
                        if (result) {
                            vm.schBusPaymentData = result.list;
                            vm.schBusPaymentForm.studentId = result.studentId;
                            vm.schBusPaymentForm.dueDate = result.dueDate;
                        }
                        vm.getTotal();
                    })
                }
            },
            "schBusPaymentForm.dueDate"(val) {
                let vm = this;
                if (val && vm.schBusPaymentForm.busPaymentDate && vm.schBusPaymentForm.busRegisterId) {
                    Meteor.call("querySchBusPaymentScheduleByRegisterId", vm.schBusPaymentForm.busRegisterId, vm.schBusPaymentForm.busPaymentDate, val, (err, result) => {
                        vm.schBusPaymentData = [];
                        if (result) {
                            vm.schBusPaymentData = result.list;
                            vm.schBusPaymentForm.studentId = result.studentId;
                        }
                        vm.getTotal();
                    })
                }
            },
            "schBusPaymentForm.busPaymentDate"(val) {
                let vm = this;
                if (val && vm.schBusPaymentForm.busRegisterId) {
                    this.getBusPaymentNoByRoleAndDate(val);
                    let vm = this;
                    if (this.dialogAddSchBusPayment === true) {
                        Meteor.call("querySchBusPaymentScheduleByRegisterId", vm.schBusPaymentForm.busRegisterId, val, (err, result) => {
                            vm.schBusPaymentData = [];
                            if (result) {
                                console.log(result.list);
                                vm.schBusPaymentData = result.list;
                                vm.schBusPaymentForm.studentId = result.studentId;
                            }
                            vm.getTotal();
                        })
                    }
                }
            },
            "schBusPaymentForm.penalty"(val) {
                this.schBusPaymentForm.penalty = val || 0;
                this.getTotal();

            }
        }
        ,
        methods: {
            handleSizeChange(val) {
                this.currentSize = val;
            }
            ,
            handleCurrentChange(val) {
                this.currentPage = val;
            }
            ,
            _inputMaskSchBusPayment() {
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
            }
            ,
            queryData: _.debounce(function (val, skip, limit) {
                this.newLoading = true;
                Meteor.call('querySchBusPayment', {
                    q: val,
                    filter: this.filter,
                    rolesArea:Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schBusPaymentDataDisplay = result.content;
                        this.count = result.countSchBusPayment;
                    }
                    this.isSearching = false;
                    this.newLoading = false;
                });
            }, 300),
            busRegisterOpt(query) {
                let vm = this;
                if (!!query) {
                    //vm.loading = true;
                    setTimeout(() => {
                        //vm.loading = false;
                        Meteor.call('querySchBusRegisterOption', query, (err, result) => {
                            if (!err) {
                                vm.busRegisterList = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('querySchBusRegisterOption', "", (err, result) => {
                        if (!err) {
                            vm.busRegisterList = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            }
            ,
            saveSchBusPayment(isCloseDialog, event, isPrint) {
                event.preventDefault();
                let vm = this;
                this.$refs["schBusPaymentFormAdd"].validate((valid) => {
                    if (valid) {
                        let schBusPaymentDoc = {
                            totalPaid: vm.$_numeral(vm.schBusPaymentForm.totalPaid).value(),
                            totalAmount: vm.$_numeral(vm.schBusPaymentForm.totalAmount).value(),
                            totalWaived: vm.$_numeral(vm.schBusPaymentForm.totalWaived).value(),

                            balanceUnPaid: vm.$_numeral(vm.schBusPaymentForm.totalAmount).value() - vm.$_numeral(vm.schBusPaymentForm.totalPaid).value() - vm.$_numeral(vm.schBusPaymentForm.totalWaived).value(),

                            busPaymentDate: moment(vm.schBusPaymentForm.busPaymentDate).toDate(),
                            dueDate: moment(vm.schBusPaymentForm.dueDate).toDate(),
                            busPaymentDateName: moment(vm.schBusPaymentForm.busPaymentDate).format("DD/MM/YYYY"),
                            note: vm.schBusPaymentForm.note,
                            busPaymentNo: vm.schBusPaymentForm.busPaymentNo,
                            penalty: vm.schBusPaymentForm.penalty,
                            status: vm.schBusPaymentForm.status,

                            rolesArea: Session.get('area'),
                            studentId: vm.schBusPaymentForm.studentId,
                            busRegisterId: vm.schBusPaymentForm.busRegisterId,
                        };
                        schBusPaymentDoc.schedule = vm.schBusPaymentData;
                        Meteor.call("insertSchBusPayment", schBusPaymentDoc, (err, result) => {
                            if (!err) {
                                if (isCloseDialog) {
                                    this.dialogAddSchBusPayment = false;
                                } else {
                                    vm.schBusPaymentForm.status = false;
                                }

                                vm.schBusPaymentData.forEach((obj) => {
                                    if (obj.isPaid === true) {
                                        Meteor.call("updateBusRegisterByBusPayment", obj, schBusPaymentDoc.busPaymentDate, vm.schBusPaymentForm.busRegisterId, (err, re) => {
                                            if (err) {
                                                console.log(err.message);
                                            }
                                        })
                                    }
                                });

                                if (isPrint) {
                                    FlowRouter.go('/sch-data/schBusPayment/print?pmt=' + result);
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


            }
            ,

            removeSchBusPayment(index, row, rows) {
                let vm = this;
                if (row.canRemove === true) {
                    vm.$confirm(this.langConfig['messageWarning'], this.langConfig['warning'], {
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancel',
                        type: 'warning'
                    }).then(() => {
                        Meteor.call("removeSchBusPayment", row._id, (err, result) => {
                            if (!err) {
                                rows.splice(index, 1);
                                vm.$message({
                                    message: ` ${row.busPaymentDateName} ` + this.langConfig['removeSuccess'],
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
            }
            ,
            popupSchBusPaymentAdd() {
                this.resetForm();
                this.busRegisterOpt();
                let vm = this;
                vm.schBusPaymentForm.status = false;
                $(".el-dialog__title").text(this.langConfig['add']);
                this.getBusPaymentNoByRoleAndDate(this.schBusPaymentForm.busPaymentDate);
            }
            ,
            updateSchBusPaymentDetail(row, index) {
                let vm = this;
                if (row.isPaid === false) {
                    row.paid = 0;
                }
                if (row.isPaid) {
                    row.paid = vm.$_numeral(row.amount).value() - (row.waived || 0);
                }
                else {
                    row.paid = 0;
                }
                this.schBusPaymentData[index] = row;
                vm.getTotal();

            }
            ,
            updateSchBusPaymentDetailPaid(row, index) {
                if (row.amount !== row.paid) {
                    if (row.paid > 0) {
                        row.isPaid = true;
                    } else {
                        row.isPaid = false;
                    }
                    this.schBusPaymentData[index] = row;
                } else {
                    if (row.paid > 0) {
                        row.isPaid = true;
                    } else {
                        row.isPaid = false;
                    }
                    this.schBusPaymentData[index] = row;
                    this.updateSchBusPaymentDetail(row, index);
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
                this.schBusPaymentData = [];
                this.schBusPaymentForm.isPaidAll = false;
                if (this.$refs["schBusPaymentFormAdd"]) {
                    this.$refs["schBusPaymentFormAdd"].resetFields();
                    this.getTotal();

                    this.refForm = "";

                }
            }
            ,
            getTotal() {
                let vm = this;
                let totalAmount = 0;
                let totalPaid = 0;
                let totalWaived = 0;
                vm.schBusPaymentData.forEach(function (obj) {
                    totalAmount += parseFloat(vm.$_numeral(obj.amount).value() || 0);
                    totalPaid += parseFloat(vm.$_numeral(obj.paid).value() || 0);
                    totalWaived += parseFloat(vm.$_numeral(obj.waived).value() || 0);
                });
                let companyDoc = WB_waterBillingSetup.findOne({});
                this.currencySymbol = getCurrencySymbolById(companyDoc.baseCurrency);
                vm.schBusPaymentForm.totalAmount = formatCurrency(totalAmount, companyDoc.baseCurrency);
                vm.schBusPaymentForm.totalWaived = formatCurrency(totalWaived, companyDoc.baseCurrency);
                vm.schBusPaymentForm.totalPaid = formatCurrency(totalPaid + vm.schBusPaymentForm.penalty, companyDoc.baseCurrency);
                vm.schBusPaymentForm.balanceUnPaid = formatCurrency(totalAmount - totalPaid - totalWaived, companyDoc.baseCurrency);
            }
            ,
            getBusPaymentNoByRoleAndDate(date) {
                let vm = this;
                Meteor.call("sch_getBusPaymentNoByRoleAndDate", Session.get("area"), date, (err, result) => {
                    if (!err) {
                        vm.schBusPaymentForm.busPaymentNo = result;
                    }
                })
            }
        }
        ,
        created() {
            this.isSearching = true;
            this.queryData();
            this.getTotal();
            Meteor.subscribe('Sch_BusPaymentReact');

        }
        ,
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['busPayment'];
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




