<template>
    <div class="loan_penaltyClosing">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddLoanPenaltyClosing = true,resetForm()">
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
                        :data="loanPenaltyClosingData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="name"
                            :label="langConfig['name']">
                    </el-table-column>
                    <el-table-column
                            prop="installmentTermLessThan"
                            :label="langConfig['installmentTermLessThan']">
                    </el-table-column>
                    <el-table-column
                            prop="interestReminderCharge"
                            :label="langConfig['interestReminderCharge']">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"

                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeLoanPenaltyClosing(scope.$index,scope.row,loanPenaltyClosingData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findLoanPenaltyClosingById(scope),dialogUpdateLoanPenaltyClosing= true"
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
                            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
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
                :visible.sync="dialogAddLoanPenaltyClosing"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanPenaltyClosingForm" :rules="rules" ref="loanPenaltyClosingFormAdd" label-width="120px"
                     class="loanPenaltyClosingForm">

                <el-row>
                    <el-form-item :label="langConfig['name']" prop="name">
                        <el-input v-model="loanPenaltyClosingForm.name"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['installmentTermLessThan']" prop="installmentTermLessThan">
                        <el-input v-model="loanPenaltyClosingForm.installmentTermLessThan"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['interestReminderCharge']" prop="interestReminderCharge">
                        <el-input v-model="loanPenaltyClosingForm.interestReminderCharge"></el-input>
                    </el-form-item>


                </el-row>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddLoanPenaltyClosing = false, cancel()"
                    >{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="saveLoanPenaltyClosing($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateLoanPenaltyClosing"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanPenaltyClosingForm" :rules="rules" ref="loanPenaltyClosingFormUpdate"
                     label-width="120px"
                     class="loanPenaltyClosingForm">
                <el-row>
                    <el-form-item :label="langConfig['name']" prop="name">
                        <el-input v-model="loanPenaltyClosingForm.name"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['installmentTermLessThan']" prop="installmentTermLessThan">
                        <el-input v-model="loanPenaltyClosingForm.installmentTermLessThan"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['interestReminderCharge']" prop="interestReminderCharge">
                        <el-input v-model="loanPenaltyClosingForm.interestReminderCharge"></el-input>
                    </el-form-item>

                    <input type="hidden" v-model="loanPenaltyClosingForm._id"/>
                </el-row>


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateLoanPenaltyClosing = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updateLoanPenaltyClosing">{{langConfig['save']}} <i>(Ctrl +
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
    import {Loan_PenaltyClosingReact} from "../../collection/loanPenaltyClosing";

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
                Loan_PenaltyClosingReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                langSession: null,
                loanPenaltyClosingData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddLoanPenaltyClosing: false,
                dialogUpdateLoanPenaltyClosing: false,

                loanPenaltyClosingForm: {
                    name: "",
                    installmentTermLessThan: "",
                    interestReminderCharge: "",
                    _id: ""
                },
                rules: {

                    installmentTermLessThan: [{
                        required: true,
                        message: 'Please input installment term that less than',
                        trigger: 'blur'
                    }],
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    interestReminderCharge: [{
                        required: true,
                        message: 'Please input interest reminder charge',
                        trigger: 'blur'
                    }],
                },

                termDataOption: [],
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
                Meteor.call('queryLoanPenaltyClosing', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.loanPenaltyClosingData = result.content;
                        this.count = result.countLoanPenaltyClosing
                    }
                    this.isSearching = false;
                });
            }, 300),
            saveLoanPenaltyClosing(event) {
                event.preventDefault();
                let vm = this;
                this.$refs["loanPenaltyClosingFormAdd"].validate((valid) => {
                    if (valid) {
                        let loanPenaltyClosingDoc = {
                            name: vm.loanPenaltyClosingForm.name,
                            installmentTermLessThan: vm.loanPenaltyClosingForm.installmentTermLessThan,
                            interestReminderCharge: vm.loanPenaltyClosingForm.interestReminderCharge,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertLoanPenaltyClosing", loanPenaltyClosingDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['saveSuccess'],
                                    type: 'success'
                                });
                                vm.dialogAddLoanPenaltyClosing = false;
                                vm.$refs["loanPenaltyClosingFormAdd"].resetFields();
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
            updateLoanPenaltyClosing() {
                let vm = this;
                this.$refs["loanPenaltyClosingFormUpdate"].validate((valid) => {
                    if (valid) {
                        let loanPenaltyClosingDoc = {
                            _id: vm.loanPenaltyClosingForm._id,
                            name: vm.loanPenaltyClosingForm.name,
                            installmentTermLessThan: vm.loanPenaltyClosingForm.installmentTermLessThan,
                            interestReminderCharge: vm.loanPenaltyClosingForm.interestReminderCharge,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateLoanPenaltyClosing", loanPenaltyClosingDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['updateSuccess'],
                                    type: 'success'
                                });
                                vm.dialogUpdateLoanPenaltyClosing = false;

                                vm.$refs["loanPenaltyClosingFormUpdate"].resetFields();
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
            removeLoanPenaltyClosing(index, row, rows) {
                let vm = this;
                this.$confirm(this.langConfig['message'], this.langConfig['warning'], {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeLoanPenaltyClosing", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `${row.name}` + this.langConfig['removeSuccess'],
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
            findLoanPenaltyClosingById(doc) {
                let vm = this;
                vm.loanPenaltyClosingForm = {};

                Meteor.call("queryLoanPenaltyClosingById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.loanPenaltyClosingForm._id = result._id;
                        vm.loanPenaltyClosingForm = result;
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
                this.loanPenaltyClosingForm._id = "";
                if (this.$refs["loanPenaltyFormAdd"]) {
                    this.$refs["loanPenaltyClosingFormAdd"].resetFields();
                }

                if (this.$refs["loanPenaltyFormUpdate"]) {
                    this.$refs["loanPenaltyClosingFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            Meteor.subscribe('Loan_PenaltyClosingReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['penaltyClosing'];
                return data;
            }
        }
    }
</script>