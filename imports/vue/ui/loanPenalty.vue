<template>
    <div class="loan_penalty">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddLoanPenalty = true,resetForm()">
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
                        :data="loanPenaltyData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="name"
                            :label="langConfig['name']">
                    </el-table-column>
                    <el-table-column
                            prop="type"
                            :label="langConfig['type']">
                    </el-table-column>
                    <el-table-column
                            prop="amountUSD"
                            :label="langConfig['amountUSD']">
                    </el-table-column>
                    <el-table-column
                            prop="amountKHR"
                            :label="langConfig['amountKHR']">
                    </el-table-column>
                    <el-table-column
                            prop="amountTHB"
                            :label="langConfig['amountTHB']">
                    </el-table-column>
                    <el-table-column
                            prop="graceDay"
                            :label="langConfig['graceDay']">
                    </el-table-column>

                    <el-table-column
                            :label="langConfig['action']"
                            width="120"

                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeLoanPenalty(scope.$index,scope.row,loanPenaltyData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findLoanPenaltyById(scope),dialogUpdateLoanPenalty= true"
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
                :visible.sync="dialogAddLoanPenalty"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanPenaltyForm" :rules="rules" ref="loanPenaltyFormAdd" label-width="120px"
                     class="loanPenaltyForm">

                <el-row>
                    <el-form-item :label="langConfig['name']" prop="name">
                        <el-input v-model="loanPenaltyForm.name"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['type']" prop="type">
                        <el-radio-group v-model="loanPenaltyForm.type">
                            <el-radio v-for="mt in typeOption" :label="mt.value" :key="mt.value" border>
                                {{mt.label}}
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item :label="langConfig['amountUSD']" prop="amountUSD">
                        <el-input v-model.number="loanPenaltyForm.amountUSD" type="number"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['amountKHR']" prop="amountKHR">
                        <el-input v-model.number="loanPenaltyForm.amountKHR" type="number"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['amountTHB']" prop="amountTHB">
                        <el-input v-model.number="loanPenaltyForm.amountTHB" type="number"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['graceDay']" prop="graceDay">
                        <el-input v-model.number="loanPenaltyForm.graceDay" type="number"></el-input>
                    </el-form-item>


                </el-row>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddLoanPenalty = false, cancel()"
                    >{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="saveLoanPenalty($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateLoanPenalty"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanPenaltyForm" :rules="rules" ref="loanPenaltyFormUpdate" label-width="120px"
                     class="loanPenaltyForm">
                <el-row>
                    <el-form-item :label="langConfig['name']" prop="name">
                        <el-input v-model="loanPenaltyForm.name"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['type']" prop="type">
                        <el-radio-group v-model="loanPenaltyForm.type">
                            <el-radio v-for="mt in typeOption" :label="mt.value" :key="mt.value" border>
                                {{mt.label}}
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item :label="langConfig['amountUSD']" prop="amountUSD">
                        <el-input v-model.number="loanPenaltyForm.amountUSD" type="number"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['amountKHR']" prop="amountKHR">
                        <el-input v-model.number="loanPenaltyForm.amountKHR" type="number"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['amountTHB']" prop="amountTHB">
                        <el-input v-model.number="loanPenaltyForm.amountTHB" type="number"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['graceDay']" prop="graceDay">
                        <el-input v-model.number="loanPenaltyForm.graceDay" type="number"></el-input>
                    </el-form-item>

                    <input type="hidden" v-model="loanPenaltyForm._id"/>
                </el-row>


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateLoanPenalty = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updateLoanPenalty">{{langConfig['save']}} <i>(Ctrl +
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
    import {Loan_PenaltyReact} from "../../collection/loanPenalty";

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
                Loan_PenaltyReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                langSession: null,
                loanPenaltyData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddLoanPenalty: false,
                dialogUpdateLoanPenalty: false,

                loanPenaltyForm: {
                    name: "",
                    type: "",
                    amountUSD: "",
                    amountKHR: "",
                    amountTHB: "",
                    graceDay: "",
                    _id: ""
                },
                rules: {
                    type: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Type',
                        trigger: 'change'
                    }],
                    amount: [{
                        required: true,
                        message: 'Please input Amount',
                        trigger: 'blur'
                    }],
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    graceDay: [{required: true, message: 'Please input Phone number', trigger: 'blur'}],
                },
                typeOption: [
                    {label: "Amount", value: "A"},
                    {label: "Percent", value: "P"}
                ],
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
                Meteor.call('queryLoanPenalty', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.loanPenaltyData = result.content;
                        this.count = result.countLoanPenalty;
                    }
                    this.isSearching = false;
                });
            }, 300),
            saveLoanPenalty(event) {
                event.preventDefault();
                let vm = this;
                this.$refs["loanPenaltyFormAdd"].validate((valid) => {
                    if (valid) {
                        let loanPenaltyDoc = {
                            name: vm.loanPenaltyForm.name,
                            type: vm.loanPenaltyForm.type,
                            amountUSD: vm.loanPenaltyForm.amountUSD,
                            amountKHR: vm.loanPenaltyForm.amountKHR,
                            amountTHB: vm.loanPenaltyForm.amountTHB,
                            graceDay: vm.loanPenaltyForm.graceDay,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertLoanPenalty", loanPenaltyDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['saveSuccess'],
                                    type: 'success'
                                });
                                vm.dialogAddLoanPenalty = false;
                                vm.$refs["loanPenaltyFormAdd"].resetFields();
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
            updateLoanPenalty() {
                let vm = this;
                this.$refs["loanPenaltyFormUpdate"].validate((valid) => {
                    if (valid) {
                        let loanPenaltyDoc = {
                            _id: vm.loanPenaltyForm._id,
                            name: vm.loanPenaltyForm.name,
                            type: vm.loanPenaltyForm.type,
                            amountUSD: vm.loanPenaltyForm.amountUSD,
                            amountKHR: vm.loanPenaltyForm.amountKHR,
                            amountTHB: vm.loanPenaltyForm.amountTHB,
                            graceDay: vm.loanPenaltyForm.graceDay,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateLoanPenalty", loanPenaltyDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['updateSuccess'],
                                    type: 'success'
                                });
                                vm.dialogUpdateLoanPenalty = false;

                                vm.$refs["loanPenaltyFormUpdate"].resetFields();
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
            removeLoanPenalty(index, row, rows) {
                let vm = this;
                this.$confirm(this.langConfig['message'], this.langConfig['warning'], {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeLoanPenalty", row._id, (err, result) => {
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
            findLoanPenaltyById(doc) {
                let vm = this;
                vm.loanPenaltyForm = {};

                Meteor.call("queryLoanPenaltyById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.loanPenaltyForm._id = result._id;
                        vm.loanPenaltyForm = result;
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
                this.loanPenaltyForm._id = "";
                if (this.$refs["loanPenaltyFormAdd"]) {
                    this.$refs["loanPenaltyFormAdd"].resetFields();
                }

                if (this.$refs["loanPenaltyFormUpdate"]) {
                    this.$refs["loanPenaltyFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            Meteor.subscribe('Loan_PenaltyReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['penalty'];
                return data;
            }
        }
    }
</script>