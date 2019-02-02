<template>
    <div class="loan_repayment">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddLoanRepayment = true,resetForm()">
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
                        :data="loanRepaymentData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="clientDoc.name"
                            :label="langConfig['client']">
                    </el-table-column>
                    <el-table-column
                            prop="repaymentDateName"
                            :label="langConfig['repaymentDate']">
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
                                           @click="removeLoanRepayment(scope.$index,scope.row,loanRepaymentData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findLoanRepaymentById(scope),dialogUpdateLoanRepayment= true"
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
                :visible.sync="dialogAddLoanRepayment"
                width="80%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanRepaymentForm" :rules="rules" ref="loanRepaymentFormAdd" label-width="120px"
                     class="loanRepaymentForm">

                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['repaymentDate']" prop="repaymentDate">
                            <el-date-picker
                                    v-model="loanRepaymentForm.repaymentDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>

                        <el-form-item :label="langConfig['client']" prop="clientId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanRepaymentForm.clientId" :remote-method="customerOpt"
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
                                       v-model="loanRepaymentForm.productId" :remote-method="productOpt"
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
                                       v-model="loanRepaymentForm.coId" :remote-method="creditOfficerOpt"
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
                            <el-input v-model.number="loanRepaymentForm.feeAmount" type='number'></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['loanAmount']" prop="loanAmount">
                            <el-input v-model.number="loanRepaymentForm.loanAmount" type='number'></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['currency']" prop="currencyId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanRepaymentForm.currencyId"
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
                        <el-form-item :label="langConfig['installment']" prop="installment">
                            <el-input v-model.number="loanRepaymentForm.installment" type='number'></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['startPaidDate']" prop="startPaidDate">
                            <el-date-picker
                                    v-model="loanRepaymentForm.startPaidDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['description']" prop="description">
                            <el-input type="textarea" v-model="loanRepaymentForm.description"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddLoanRepayment = false, cancel()"
                    >{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="saveLoanRepayment($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateLoanRepayment"
                width="80%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanRepaymentForm" :rules="rules" ref="loanRepaymentFormUpdate" label-width="120px"
                     class="loanRepaymentForm">
                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['repaymentDate']" prop="repaymentDate">
                            <el-date-picker
                                    v-model="loanRepaymentForm.repaymentDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['client']" prop="clientId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanRepaymentForm.clientId" :remote-method="customerOpt"
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
                                       v-model="loanRepaymentForm.productId" :remote-method="productOpt"
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
                                       v-model="loanRepaymentForm.coId" :remote-method="creditOfficerOpt"
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
                            <el-input v-model.number="loanRepaymentForm.feeAmount" type='number'></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['loanAmount']" prop="loanAmount">
                            <el-input v-model.number="loanRepaymentForm.loanAmount" type='number'></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['currency']" prop="currencyId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="loanRepaymentForm.currencyId"
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
                        <el-form-item :label="langConfig['installment']" prop="installment">
                            <el-input v-model.number="loanRepaymentForm.installment" type='number'></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['startPaidDate']" prop="startPaidDate">
                            <el-date-picker
                                    v-model="loanRepaymentForm.startPaidDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['description']" prop="description">
                            <el-input type="textarea" v-model="loanRepaymentForm.description"></el-input>
                        </el-form-item>
                    </el-col>


                    <input type="hidden" v-model="loanRepaymentForm._id"/>
                </el-row>


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateLoanRepayment = false ,cancel()">{{langConfig['cancel']}}
                        <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updateLoanRepayment">{{langConfig['save']}} <i>(Ctrl +
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
    import {Loan_RepaymentReact} from "../../collection/loanRepayment";

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
                Loan_RepaymentReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                langSession: null,
                loanRepaymentData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddLoanRepayment: false,
                dialogUpdateLoanRepayment: false,

                loanRepaymentForm: {
                    clientId: "",
                    productId: "",
                    currencyId: "",
                    loanAmount: 0,
                    projectInterest: "",
                    repaymentDate: "",
                    coId: "",
                    status: "Active",
                    description: "",
                    feeAmount: 0,
                    startPaidDate: "",
                    installment: 0,
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
                    installment: [{
                        required: true,
                        message: 'Please input installment',
                        trigger: 'blur'
                    }],
                    repaymentDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input Repayment Date',
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
                currencyOption: [
                    {label: "USD", value: "USD"},
                    {label: "KHR", value: "KHR"},
                    {label: "THB", value: "THB"},
                ],
                productTypeOption: [
                    {label: "Weekly", value: "Weekly"},
                    {label: "Monthly", value: "Monthly"},
                    {label: "Yearly", value: "Yearly"},
                ],
                productOption: [],
                creditOfficerOption: [],
                skip: 0
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
                Meteor.call('queryLoanRepayment', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.loanRepaymentData = result.content;
                        this.count = result.countLoanRepayment;
                    }
                    this.isSearching = false;
                });
            }, 300),

            customerOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        Meteor.call('queryPosCustomerOption', query, (err, result) => {
                            if (!err) {
                                this.clientOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryPosCustomerOption', "", (err, result) => {
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
                        Meteor.call('queryLoanCreditOfficerOption', query, (err, result) => {
                            if (!err) {
                                this.creditOfficerOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryLoanCreditOfficerOption', "", (err, result) => {
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
            saveLoanRepayment(event) {
                event.preventDefault();
                let vm = this;
                this.$refs["loanRepaymentFormAdd"].validate((valid) => {
                    if (valid) {
                        let loanRepaymentDoc = {
                            clientId: vm.loanRepaymentForm.clientId,
                            productId: vm.loanRepaymentForm.productId,
                            currencyId: vm.loanRepaymentForm.currencyId,
                            loanAmount: vm.loanRepaymentForm.loanAmount,
                            repaymentDate: vm.loanRepaymentForm.repaymentDate,
                            repaymentDateName: moment(vm.loanRepaymentForm.repaymentDate).format("DD/MM/YYYY"),
                            coId: vm.loanRepaymentForm.coId,
                            installment: vm.loanRepaymentForm.installment,
                            description: vm.loanRepaymentForm.description,
                            feeAmount: vm.loanRepaymentForm.feeAmount,
                            startPaidDate: vm.loanRepaymentForm.startPaidDate,
                            rolesArea: Session.get('area')

                        };

                        Meteor.call("insertLoanRepayment", loanRepaymentDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['saveSuccess'],
                                    type: 'success'
                                });
                                vm.dialogAddLoanRepayment = false;
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
            updateLoanRepayment() {
                let vm = this;
                this.$refs["loanRepaymentFormUpdate"].validate((valid) => {
                    if (valid) {
                        let loanRepaymentDoc = {
                            _id: vm.loanRepaymentForm._id,
                            clientId: vm.loanRepaymentForm.clientId,
                            productId: vm.loanRepaymentForm.productId,
                            currencyId: vm.loanRepaymentForm.currencyId,
                            loanAmount: vm.loanRepaymentForm.loanAmount,
                            repaymentDate: vm.loanRepaymentForm.repaymentDate,
                            repaymentDateName: moment(vm.loanRepaymentForm.repaymentDate).format("DD/MM/YYYY"),
                            coId: vm.loanRepaymentForm.coId,
                            installment: vm.loanRepaymentForm.installment,
                            description: vm.loanRepaymentForm.description,
                            feeAmount: vm.loanRepaymentForm.feeAmount,
                            startPaidDate: vm.loanRepaymentForm.startPaidDate,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateLoanRepayment", loanRepaymentDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['updateSuccess'],
                                    type: 'success'
                                });
                                vm.dialogUpdateLoanRepayment = false;

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
            removeLoanRepayment(index, row, rows) {
                let vm = this;
                this.$confirm(this.langConfig['message'], this.langConfig['warning'], {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeLoanRepayment", row._id, (err, result) => {
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
            findLoanRepaymentById(doc) {
                let vm = this;
                vm.loanRepaymentForm = {};

                Meteor.call("queryLoanRepaymentById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.loanRepaymentForm._id = result._id;
                        vm.loanRepaymentForm = result;
                    }
                })
            },
            cancel() {
                this.$message({
                    type: 'info',
                    message: this.langConfig['cancel']
                });
            },
            resetForm() {
                this.loanRepaymentForm._id = "";
                if (this.$refs["loanRepaymentFormAdd"]) {
                    this.$refs["loanRepaymentFormAdd"].resetFields();
                }

                if (this.$refs["loanRepaymentFormUpdate"]) {
                    this.$refs["loanRepaymentFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            this.customerOpt();
            this.productOpt();
            this.creditOfficerOpt();
            Meteor.subscribe('Loan_RepaymentReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['repayment'];
                return data;
            }
        }
    }
</script>