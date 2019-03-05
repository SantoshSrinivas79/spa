<template>
    <div class="loan_disbursement">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddLoanDisbursement = true,resetForm()">
                            <i class="fa fa-plus"></i> {{langConfig['title']}}
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
                        <!--<loader></loader>-->
                    </div>
                </div>
            </slot>
            <slot v-else>
                <el-table
                        :data="loanDisbursementData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="loanAcc"
                            :label="langConfig['loanAcc']">
                    </el-table-column>
                    <el-table-column
                            prop="clientDoc.name"
                            :label="langConfig['client']">
                    </el-table-column>
                    <el-table-column
                            prop="disbursementDateName"
                            :label="langConfig['disbursementDate']">
                    </el-table-column>
                    <el-table-column
                            prop="loanAmount"
                            :label="langConfig['loanAmount']">
                    </el-table-column>
                    <el-table-column
                            prop="currencyId"
                            :label="langConfig['currency']">
                    </el-table-column>
                    <el-table-column
                            prop="productDoc.name"
                            :label="langConfig['product']">
                    </el-table-column>
                    <el-table-column
                            prop="paymentNumber"
                            :label="langConfig['paymentNumber']">
                    </el-table-column>

                    <el-table-column
                            :label="langConfig['action']"
                            width="120"

                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeLoanDisbursement(scope.$index,scope.row,loanDisbursementData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findLoanDisbursementById(scope),popUpUpdate(scope.row)"
                                           :disabled="disabledUpdate"></el-button>
                            </el-button-group>

                        </template>
                    </el-table-column>

                </el-table>
                <!--Pagination-->
                <br>
                <el-row type="flex" class="row-bg" justify="center">
                    <el-col :span="24" style="text-align: center;">
                        <div class="block">
                            <el-pagination @size-change="handleSizeChange" background
                                           @current-change="handleCurrentChange"
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
                :visible.sync="dialogAddLoanDisbursement"
                width="80%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanDisbursementForm" :rules="rules" ref="loanDisbursementFormAdd" label-width="120px"
                     class="loanDisbursementForm">

                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['disbursementDate']" prop="disbursementDate">
                            <el-date-picker
                                    v-model="loanDisbursementForm.disbursementDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>

                        <el-form-item :label="langConfig['client']" prop="clientId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanDisbursementForm.clientId" remote :remote-method="customerOpt"
                                       :placeholder="langConfig['client']">
                                <el-option
                                        v-for="item in clientOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['product']" prop="productId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanDisbursementForm.productId" remote :remote-method="productOpt"
                                       :placeholder="langConfig['product']">
                                <el-option
                                        v-for="item in productOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['creditOfficer']" prop="coId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanDisbursementForm.coId" remote :remote-method="creditOfficerOpt"
                                       :placeholder="langConfig['creditOfficer']">
                                <el-option
                                        v-for="item in creditOfficerOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['feeAmount']" prop="feeAmount">
                            <el-input v-model.number="loanDisbursementForm.feeAmount" type='number'></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['loanAmount']" prop="loanAmount">
                            <el-input v-model.number="loanDisbursementForm.loanAmount" type='number'></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['currency']" prop="currencyId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanDisbursementForm.currencyId"
                                       :placeholder="langConfig['currency']">
                                <el-option
                                        v-for="item in currencyOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['term']" prop="term">
                            <el-input v-model.number="loanDisbursementForm.term" type='number'>
                                <template slot="append">{{langConfig[time]}}</template>
                            </el-input>
                        </el-form-item>

                        <el-form-item :label="langConfig['repaidFrequency']" prop="repaidFrequency">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanDisbursementForm.repaidFrequency"
                                       :placeholder="langConfig['repaidFrequency']">
                                <el-option
                                        v-for="item in repaidFrequencyOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['startPaidDate']" prop="startPaidDate">
                            <el-date-picker
                                    v-model="loanDisbursementForm.startPaidDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['description']" prop="description">
                            <el-input type="textarea" v-model="loanDisbursementForm.description"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddLoanDisbursement = false, cancel()"
                    >{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="saveLoanDisbursement($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateLoanDisbursement"
                width="80%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanDisbursementForm" :rules="rules" ref="loanDisbursementFormUpdate" label-width="120px"
                     class="loanDisbursementForm">
                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['disbursementDate']" prop="disbursementDate">
                            <el-date-picker
                                    v-model="loanDisbursementForm.disbursementDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['client']" prop="clientId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanDisbursementForm.clientId" remote :remote-method="customerOpt"
                                       :placeholder="langConfig['client']">
                                <el-option
                                        v-for="item in clientOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['product']" prop="productId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanDisbursementForm.productId" remote :remote-method="productOpt"
                                       :placeholder="langConfig['product']">
                                <el-option
                                        v-for="item in productOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="langConfig['creditOfficer']" prop="coId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanDisbursementForm.coId" remote :remote-method="creditOfficerOpt"
                                       :placeholder="langConfig['creditOfficer']">
                                <el-option
                                        v-for="item in creditOfficerOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="langConfig['feeAmount']" prop="feeAmount">
                            <el-input v-model.number="loanDisbursementForm.feeAmount" type='number'></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['loanAmount']" prop="loanAmount">
                            <el-input v-model.number="loanDisbursementForm.loanAmount" type='number'></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['currency']" prop="currencyId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanDisbursementForm.currencyId"
                                       :placeholder="langConfig['currency']">
                                <el-option
                                        v-for="item in currencyOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['term']" prop="term">
                            <el-input v-model.number="loanDisbursementForm.term" type='number'>
                                <template slot="append">{{langConfig[time]}}</template>
                            </el-input>
                        </el-form-item>

                        <el-form-item :label="langConfig['repaidFrequency']" prop="repaidFrequency">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanDisbursementForm.repaidFrequency"
                                       :placeholder="langConfig['repaidFrequency']">
                                <el-option
                                        v-for="item in repaidFrequencyOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['startPaidDate']" prop="startPaidDate">
                            <el-date-picker
                                    v-model="loanDisbursementForm.startPaidDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['description']" prop="description">
                            <el-input type="textarea" v-model="loanDisbursementForm.description"></el-input>
                        </el-form-item>
                    </el-col>


                    <input type="hidden" v-model="loanDisbursementForm._id"/>
                </el-row>


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateLoanDisbursement = false ,cancel()">{{langConfig['cancel']}}
                        <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updateLoanDisbursement">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-loan'
    import {Loan_DisbursementReact} from "../../collection/loanDisbursement";

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
                Loan_DisbursementReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                langSession: null,
                loanDisbursementData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddLoanDisbursement: false,
                dialogUpdateLoanDisbursement: false,

                loanDisbursementForm: {
                    clientId: "",
                    productId: "",
                    currencyId: "",
                    loanAmount: 0,
                    projectInterest: "",
                    disbursementDate: "",
                    coId: "",
                    status: "Active",
                    description: "",
                    feeAmount: 0,
                    startPaidDate: "",
                    term: 0,
                    repaidFrequency: 1,
                    _id: ""
                },
                rules: {
                    clientId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Client',
                        trigger: 'change'
                    }],
                    productId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Product',
                        trigger: 'change'
                    }],
                    currencyId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Currency',
                        trigger: 'change'
                    }],
                    coId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose credit officer',
                        trigger: 'change'
                    }],
                    repaidFrequency: [{
                        required: true,
                        type: 'number',
                        message: 'Please choose Repaid Frequency',
                        trigger: 'change'
                    }],
                    productType: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Product Type',
                        trigger: 'change'
                    }],
                    loanAmount: [{
                        required: true,
                        message: 'Please input Amount',
                        trigger: 'blur'
                    }],
                    feeAmount: [{
                        required: true,
                        message: 'Please input Fee Amount',
                        trigger: 'blur'
                    }],
                    term: [{
                        required: true,
                        message: 'Please input term',
                        trigger: 'blur'
                    }],
                    disbursementDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input Disbursement Date',
                        trigger: 'blur'
                    }],
                    startPaidDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input Start Paid Date',
                        trigger: 'blur'
                    }],
                },
                clientOption: [],
                repaidFrequencyOption: [
                    {value: 1, label: 1}
                ],
                currencyOption: [
                    {label: "USD", value: "USD"},
                    {label: "KHR", value: "KHR"},
                    {label: "THB", value: "THB"},
                ],
                productTypeOption: [

                    {label: "Daily", value: "Daily"},
                    {label: "Weekly", value: "Weekly"},
                    {label: "BiWeekly", value: "BiWeekly"},
                    {label: "Monthly", value: "Monthly"},
                    {label: "Yearly", value: "Yearly"},
                ],
                productOption: [],
                creditOfficerOption: [],
                skip: 0,
                time: ""
            }
        },
        watch: {
            currentSize(val) {
                this.isSearching = true;
                this.skip = (this.currentPage - 1) * val;
                this.queryData(this.searchData, this.skip, val + this.skip);
            },
            currentPage(val) {
                this.isSearching = true;
                this.skip = (val - 1) * this.currentSize;
                this.queryData(this.searchData, this.skip, this.currentSize + this.skip);
            },
            searchData(val) {
                this.isSearching = true;
                this.skip = (this.currentPage - 1) * this.currentSize;
                this.queryData(val, this.skip, this.currentSize + this.skip);
            },
            "loanDisbursementForm.term"(val) {
                if (val && val > 1) {
                    this.repaidFrequencyOption = [];
                    for (let i = 1; i < val / 2; i++) {
                        if (val % i === 0) {
                            this.repaidFrequencyOption.push({
                                label: i, value: i
                            })
                        }
                    }
                } else {
                    this.repaidFrequencyOption = [
                        {value: 1, label: 1}
                    ];
                }
            },
            "loanDisbursementForm.productId"(val) {
                if (val) {
                    let values = this.productOption.map(function (o) {
                        return o.value;
                    })
                    let index = values.indexOf(val);
                    this.time = this.productOption[index].label.split(":")[1].trim();
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
            queryData: _.debounce(function (val, skip, limit) {
                Meteor.call('queryLoanDisbursement', {
                    q: val,
                    filter: this.filter,
                    rolesArea: Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.loanDisbursementData = result.content;
                        this.count = result.countLoanDisbursement;
                    }
                    this.isSearching = false;
                });
            }, 300),

            customerOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        Meteor.call('queryPosCustomerOption', query, Session.get("area"), (err, result) => {
                            if (!err) {
                                this.clientOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryPosCustomerOption', "", Session.get("area"), (err, result) => {
                        if (!err) {
                            this.clientOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            creditOfficerOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        Meteor.call('queryLoanCreditOfficerOption', query, Session.get("area"), (err, result) => {
                            if (!err) {
                                this.creditOfficerOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryLoanCreditOfficerOption', "", Session.get("area"), (err, result) => {
                        if (!err) {
                            this.creditOfficerOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            productOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        Meteor.call('queryLoanProductOption', query, (err, result) => {
                            if (!err) {
                                this.productOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryLoanProductOption', "", (err, result) => {
                        if (!err) {
                            this.productOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            saveLoanDisbursement(event) {
                event.preventDefault();
                let vm = this;
                this.$refs["loanDisbursementFormAdd"].validate((valid) => {
                    if (valid) {
                        let loanDisbursementDoc = {
                            clientId: vm.loanDisbursementForm.clientId,
                            productId: vm.loanDisbursementForm.productId,
                            currencyId: vm.loanDisbursementForm.currencyId,
                            loanAmount: vm.loanDisbursementForm.loanAmount,
                            disbursementDate: vm.loanDisbursementForm.disbursementDate,
                            disbursementDateName: moment(vm.loanDisbursementForm.disbursementDate).format("DD/MM/YYYY"),
                            coId: vm.loanDisbursementForm.coId,
                            term: vm.loanDisbursementForm.term,
                            repaidFrequency: vm.loanDisbursementForm.repaidFrequency,
                            description: vm.loanDisbursementForm.description,
                            feeAmount: vm.loanDisbursementForm.feeAmount,
                            startPaidDate: vm.loanDisbursementForm.startPaidDate,
                            rolesArea: Session.get('area')

                        };

                        Meteor.call("insertLoanDisbursement", loanDisbursementDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['saveSuccess'],
                                    type: 'success'
                                });
                                vm.dialogAddLoanDisbursement = false;
                                vm.resetForm();

                            } else {
                                vm.$message({
                                    duration: 1000,
                                    message: err.message,
                                    type: 'error'
                                });
                            }
                        })
                    }
                })

            },
            updateLoanDisbursement() {
                let vm = this;
                this.$refs["loanDisbursementFormUpdate"].validate((valid) => {
                    if (valid) {
                        let loanDisbursementDoc = {
                            _id: vm.loanDisbursementForm._id,
                            clientId: vm.loanDisbursementForm.clientId,
                            productId: vm.loanDisbursementForm.productId,
                            currencyId: vm.loanDisbursementForm.currencyId,
                            loanAmount: vm.loanDisbursementForm.loanAmount,
                            disbursementDate: vm.loanDisbursementForm.disbursementDate,
                            disbursementDateName: moment(vm.loanDisbursementForm.disbursementDate).format("DD/MM/YYYY"),
                            coId: vm.loanDisbursementForm.coId,
                            term: vm.loanDisbursementForm.term,
                            repaidFrequency: vm.loanDisbursementForm.repaidFrequency,
                            description: vm.loanDisbursementForm.description,
                            feeAmount: vm.loanDisbursementForm.feeAmount,
                            startPaidDate: vm.loanDisbursementForm.startPaidDate,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateLoanDisbursement", loanDisbursementDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['updateSuccess'],
                                    type: 'success'
                                });
                                vm.dialogUpdateLoanDisbursement = false;

                                vm.resetForm();

                            } else {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['updateFail'],
                                    type: 'error'
                                });
                            }

                        })
                    }
                })

            },
            removeLoanDisbursement(index, row, rows) {
                if (row.paymentNumber > 0) {
                    this.$message({
                        type: 'error',
                        message: "can't remove, already have repayment !"
                    });
                    return false;
                }

                let vm = this;
                this.$confirm(this.langConfig['message'], this.langConfig['warning'], {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeLoanDisbursement", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: this.langConfig['removeSuccess'],
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
                    this.$message({
                        type: 'info',
                        message: this.langConfig['cancel']
                    });
                });
            },
            findLoanDisbursementById(doc) {
                let vm = this;
                vm.loanDisbursementForm = {};

                Meteor.call("queryLoanDisbursementById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.loanDisbursementForm._id = result._id;
                        vm.loanDisbursementForm = result;
                    }
                })
            },
            popUpUpdate(row) {
                if (row.paymentNumber > 0) {
                    this.$message({
                        type: 'error',
                        message: "can't update, already have repayment !"
                    });
                    return false;
                }
                this.dialogUpdateLoanDisbursement = true;

            },
            cancel() {
                this.$message({
                    type: 'info',
                    message: this.langConfig['cancel']
                });
            },
            resetForm() {
                this.loanDisbursementForm._id = "";
                if (this.$refs["loanDisbursementFormAdd"]) {
                    this.$refs["loanDisbursementFormAdd"].resetFields();
                }

                if (this.$refs["loanDisbursementFormUpdate"]) {
                    this.$refs["loanDisbursementFormUpdate"].resetFields();
                }
                this.time = "";

            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            this.customerOpt();
            this.productOpt();
            this.creditOfficerOpt();
            Meteor.subscribe('Loan_DisbursementReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['disbursement'];
                return data;
            }
        }
    }
</script>