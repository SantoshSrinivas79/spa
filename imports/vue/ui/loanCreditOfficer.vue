<template>
    <div class="loan_creditOfficer">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddLoanCreditOfficer = true,resetForm()">
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
                        :data="loanCreditOfficerData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="name"
                            :label="langConfig['name']">
                    </el-table-column>
                    <el-table-column
                            prop="address"
                            :label="langConfig['address']">
                    </el-table-column>
                    <el-table-column
                            prop="phoneNumber"
                            :label="langConfig['phoneNumber']">
                    </el-table-column>
                    <el-table-column
                            prop="startDateName"
                            :label="langConfig['startDate']">
                    </el-table-column>
                    <el-table-column
                            prop="dobName"
                            :label="langConfig['dob']">
                    </el-table-column>
                    <el-table-column
                            prop="status"
                            :label="langConfig['status']"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.status === true ? 'primary' : 'danger' "
                                    close-transition>{{scope.row.status}}
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
                                           @click="removeLoanCreditOfficer(scope.$index,scope.row,loanCreditOfficerData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findLoanCreditOfficerById(scope),dialogUpdateLoanCreditOfficer= true"
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
                :visible.sync="dialogAddLoanCreditOfficer"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanCreditOfficerForm" :rules="rules" ref="loanCreditOfficerFormAdd" label-width="120px"
                     class="loanCreditOfficerForm">

                <el-row>
                    <el-form-item :label="langConfig['name']" prop="name">
                        <el-input v-model="loanCreditOfficerForm.name"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['dob']" prop="dob">
                        <el-date-picker
                                v-model="loanCreditOfficerForm.dob"
                                type="date"
                                style="width: 100%;"
                                placeholder="Pick a day"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item :label="langConfig['address']" prop="address">
                        <el-input v-model="loanCreditOfficerForm.address"></el-input>
                    </el-form-item>

                    <el-form-item :label="langConfig['startDate']" prop="startDate">
                        <el-date-picker
                                v-model="loanCreditOfficerForm.startDate"
                                type="date"
                                style="width: 100%;"
                                placeholder="Pick a day"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                        <el-input v-model="loanCreditOfficerForm.phoneNumber"></el-input>
                    </el-form-item>

                    <el-form-item :label="langConfig['status']" prop="status">
                        <el-switch
                                v-model="loanCreditOfficerForm.status"
                                active-color="#13ce66"
                                inactive-color="#ff4949"
                        >
                        </el-switch>
                    </el-form-item>

                </el-row>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddLoanCreditOfficer = false, cancel()"
                    >{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="saveLoanCreditOfficer($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateLoanCreditOfficer"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanCreditOfficerForm" :rules="rules" ref="loanCreditOfficerFormUpdate" label-width="120px"
                     class="loanCreditOfficerForm">
                <el-row>
                    <el-form-item :label="langConfig['name']" prop="name">
                        <el-input v-model="loanCreditOfficerForm.name"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['dob']" prop="dob">
                        <el-date-picker
                                v-model="loanCreditOfficerForm.dob"
                                type="date"
                                style="width: 100%;"
                                placeholder="Pick a day"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item :label="langConfig['address']" prop="address">
                        <el-input v-model="loanCreditOfficerForm.address"></el-input>
                    </el-form-item>

                    <el-form-item :label="langConfig['startDate']" prop="startDate">
                        <el-date-picker
                                v-model="loanCreditOfficerForm.startDate"
                                type="date"
                                style="width: 100%;"
                                placeholder="Pick a day"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                        <el-input v-model="loanCreditOfficerForm.phoneNumber"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['status']" prop="status">
                        <el-switch
                                v-model="loanCreditOfficerForm.status"
                                active-color="#13ce66"
                                inactive-color="#ff4949"
                        >
                        </el-switch>
                    </el-form-item>

                    <input type="hidden" v-model="loanCreditOfficerForm._id"/>
                </el-row>


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateLoanCreditOfficer = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updateLoanCreditOfficer">{{langConfig['save']}} <i>(Ctrl +
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
    import {Loan_CreditOfficerReact} from "../../collection/loanCreditOfficer";

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
                Loan_CreditOfficerReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                langSession: null,
                loanCreditOfficerData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddLoanCreditOfficer: false,
                dialogUpdateLoanCreditOfficer: false,

                loanCreditOfficerForm: {
                    name: "",
                    address: "",
                    dob: "",
                    startDate: "",
                    phoneNumber: "",
                    status: false,
                    _id: ""
                },
                rules: {
                    dob: [{
                        type: 'date',
                        required: true,
                        message: 'Please input Date of birth',
                        trigger: 'blur'
                    }],
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    phoneNumber: [{required: true, message: 'Please input Phone number', trigger: 'blur'}],
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
                Meteor.call('queryLoanCreditOfficer', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.loanCreditOfficerData = result.content;
                        this.count = result.countLoanCreditOfficer;
                    }
                    this.isSearching = false;
                });
            }, 300),
            saveLoanCreditOfficer(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["loanCreditOfficerFormAdd"].validate((valid) => {
                    if (valid) {
                        let loanCreditOfficerDoc = {
                            name: vm.loanCreditOfficerForm.name,
                            address: vm.loanCreditOfficerForm.address,
                            dob: vm.loanCreditOfficerForm.dob,
                            startDate: vm.loanCreditOfficerForm.startDate,
                            status: vm.loanCreditOfficerForm.status,
                            phoneNumber: vm.loanCreditOfficerForm.phoneNumber,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertLoanCreditOfficer", loanCreditOfficerDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['saveSuccess'],
                                    type: 'success'
                                });
                                vm.dialogAddLoanCreditOfficer = false;

                                vm.$refs["loanCreditOfficerFormAdd"].resetFields();
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
            updateLoanCreditOfficer() {
                let vm = this;
                this.$refs["loanCreditOfficerFormUpdate"].validate((valid) => {
                    if (valid) {
                        let loanCreditOfficerDoc = {
                            _id: vm.loanCreditOfficerForm._id,
                            name: vm.loanCreditOfficerForm.name,
                            address: vm.loanCreditOfficerForm.address,
                            dob: vm.loanCreditOfficerForm.dob,
                            startDate: vm.loanCreditOfficerForm.startDate,
                            status: vm.loanCreditOfficerForm.status,
                            phoneNumber: vm.loanCreditOfficerForm.phoneNumber,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateLoanCreditOfficer", loanCreditOfficerDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['updateSuccess'],
                                    type: 'success'
                                });
                                vm.dialogUpdateLoanCreditOfficer = false;

                                vm.$refs["loanCreditOfficerFormUpdate"].resetFields();
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
            removeLoanCreditOfficer(index, row, rows) {
                let vm = this;
                this.$confirm(this.langConfig['message'], this.langConfig['warning'], {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeLoanCreditOfficer", row._id, (err, result) => {
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
            findLoanCreditOfficerById(doc) {
                let vm = this;
                vm.loanCreditOfficerForm = {};

                Meteor.call("queryLoanCreditOfficerById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.loanCreditOfficerForm._id = result._id;
                        vm.loanCreditOfficerForm = result;
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
                this.loanCreditOfficerForm._id = "";
                if (this.$refs["loanCreditOfficerFormAdd"]) {
                    this.$refs["loanCreditOfficerFormAdd"].resetFields();
                }

                if (this.$refs["loanCreditOfficerFormUpdate"]) {
                    this.$refs["loanCreditOfficerFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            Meteor.subscribe('Loan_CreditOfficerReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['creditOfficer'];
                return data;
            }
        }
    }
</script>