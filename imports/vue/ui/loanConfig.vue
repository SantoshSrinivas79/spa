<template>
    <div class="loan_config">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer">
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
                        :data="loanConfigData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="methodType"
                            :label="langConfig['methodType']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="description"
                            :label="langConfig['description']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" disabled class="cursor-pointer" icon="el-icon-delete"
                                           size="small"
                                           @click="removeLoanConfig(scope.$index,scope.row,loanConfigData)"
                                ></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findLoanConfigById(scope),dialogUpdateLoanConfig= true"
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
                :visible.sync="dialogAddLoanConfig"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanConfigForm" :rules="rules" ref="loanConfigFormAdd" label-width="120px"
                     class="loanConfigForm">

                <el-form-item :label="langConfig['methodType']" prop="methodType">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="loanConfigForm.methodType"
                               placeholder="Sub Config Of">
                        <el-option
                                v-for="item in methodTypeOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item :label="langConfig['description']" prop="description">
                    <el-input type="textarea" v-model="loanConfigForm.description"></el-input>
                </el-form-item>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddLoanConfig = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="saveLoanConfig($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateLoanConfig"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanConfigForm" :rules="rules" ref="loanConfigFormUpdate" label-width="120px"
                     class="loanConfigForm">
                <el-form-item :label="langConfig['methodType']" prop="methodType">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="loanConfigForm.methodType"
                               placeholder="method  config">
                        <el-option
                                v-for="item in methodTypeOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['description']" prop="description">
                    <el-input type="textarea" v-model="loanConfigForm.description"></el-input>
                </el-form-item>

                <input type="hidden" v-model="loanConfigForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateLoanConfig = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updateLoanConfig">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>


        <el-dialog :visible.sync="dialogVisible" width="30%">
            <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-loan'
    import {Loan_ConfigReact} from "../../collection/loanConfig";


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
                Loan_ConfigReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            },

        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                dialogImageUrl: "",
                dialogVisible: false,
                loanConfigData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddLoanConfig: false,
                dialogUpdateLoanConfig: false,

                loanConfigForm: {
                    methodType: "",
                    description: "",
                    _id: ""
                },
                rules: {
                    methodType: [{required: true, message: 'Please input name', trigger: 'change'}],
                },
                // Options
                methodTypeOption: [
                    {label: "Straight Line", value: "Straight Line"},
                    {label: "Declining Balance", value: "Declining Balance"},
                ],
                skip: 0,
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
                Meteor.call('queryLoanConfig', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.loanConfigData = result.content;
                        this.count = result.countLoanConfig;
                    }
                    this.isSearching = false;
                });
            }, 300),
            saveLoanConfig(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["loanConfigFormAdd"].validate((valid) => {
                        if (valid) {

                            let loanConfigDoc = {
                                methodType: vm.loanConfigForm.methodType,
                                description: vm.loanConfigForm.description
                            };
                            Meteor.call("insertLoanConfig", loanConfigDoc, (err, result) => {
                                if (!err) {
                                    vm.$message({
                                        duration: 1000,
                                        message: `Save Successfully!`,
                                        type: 'success'
                                    });
                                    vm.dialogAddLoanConfig = false;
                                    vm.$refs["loanConfigFormAdd"].resetFields();


                                } else {
                                    vm.$message({
                                        duration: 1000,
                                        message: err.message,
                                        type: 'error'
                                    });
                                }
                            })

                        }
                    }
                )

            },
            updateLoanConfig() {
                let vm = this;
                this.$refs["loanConfigFormUpdate"].validate((valid) => {
                    if (valid) {

                        let loanConfigDoc = {
                            _id: vm.loanConfigForm._id,
                            methodType: vm.loanConfigForm.methodType,
                            description: vm.loanConfigForm.description,
                        };

                        Meteor.call("updateLoanConfig", loanConfigDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdateLoanConfig = false;
                                vm.$refs["loanConfigFormUpdate"].resetFields();
                            } else {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Failed
                        !`,
                                    type: 'error'
                                });
                            }
                        })
                    }

                })

            },
            removeLoanConfig(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeLoanConfig", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `
                        លុប ${row.methodType} បានជោគជ័យ`,
                                type: 'success'
                            });

                        } else {
                            vm.$message({
                                type: 'error',
                                message: 'Delete Failed'
                            });
                        }

                    })

                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: 'Delete canceled'
                    });
                });


            },
            findLoanConfigById(doc) {
                let vm = this;
                vm.loanConfigForm = {};

                Meteor.call("queryLoanConfigById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.loanConfigForm._id = result._id;
                        vm.loanConfigForm = result;
                    }
                })
            },
            cancel() {
                this.$message({
                    type: 'info',
                    message: 'Canceled'
                });
            },
            resetForm() {
                this.imgUrlUpdate = "";
                this.thumbImgCroppa = null;

                this.loanConfigForm._id = "";
                if (this.$refs["loanConfigFormAdd"]) {
                    this.$refs["loanConfigFormAdd"].resetFields();
                }

                if (this.$refs["loanConfigFormUpdate"]) {
                    this.$refs["loanConfigFormUpdate"].resetFields();
                }

            },


        },
        created() {
            this.isSearching = true;
            this.queryData();
            Meteor.subscribe('Loan_ConfigReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['config'];
                return data;
            }
        }
    }
</script>
