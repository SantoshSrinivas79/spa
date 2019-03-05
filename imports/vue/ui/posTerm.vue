<template>
    <div class="pos_term">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddPosTerm = true,resetForm()">
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
                        v-loading="newLoading"
                        :data="posTermData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="name"
                            :label="langConfig['name']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="khName"
                            :label="langConfig['khName']">
                    </el-table-column>
                    <el-table-column
                            prop="dueMethod"
                            :label="langConfig['dueMethod']">
                    </el-table-column>
                    <el-table-column
                            :prop="langConfig['isDiscount']"
                            label="Apply discount if paid early"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.isDiscount === true ? 'danger' : 'success'"
                                    close-transition>{{scope.row.isDiscount}}
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
                                           @click="removePosTerm(scope.$index,scope.row,posTermData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findPosTermById(scope),dialogUpdatePosTerm= true"
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
                :visible.sync="dialogAddPosTerm"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posTermForm" :rules="rules" ref="posTermFormAdd" label-width="120px"
                     class="posTermForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posTermForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="posTermForm.khName"></el-input>
                </el-form-item>

                <hr>
                <el-radio-group v-model="posTermForm.dueMethod">
                    <el-radio label="Due in fixed number of days">{{langConfig['dueInFixNumber']}}</el-radio>
                    <el-row>
                        <el-col :span="18">
                            <el-form-item prop="days">
                                <el-input v-model.number="posTermForm.days" :disabled="fixDayMethod">
                                    <template slot="append">{{langConfig['days']}}</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>


                    <el-radio :label="langConfig['dayByCertainDay']">Due by certain day of the month</el-radio>
                    <el-row>
                        <el-col :span="18">
                            <el-form-item prop="daysOfMonth">
                                <el-input v-model="posTermForm.daysOfMonth" :disabled="certainDayMethod">
                                    <template slot="append">{{langConfig['daysOfMonth']}}</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="18">
                            <el-form-item label="" prop="daysOfDueDate">
                                <label for="">{{langConfig['dueTheNextMonth']}}</label>
                                <el-input v-model="posTermForm.daysOfDueDate" :disabled="certainDayMethod">
                                    <template slot="append">{{langConfig['daysOfDueDate']}}</template>

                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-radio-group>


                <el-form-item :label="langConfig['applyDiscount']" prop="isDiscount">
                    <el-switch
                            v-model="posTermForm.isDiscount"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                    >
                    </el-switch>
                </el-form-item>

                <el-form-item label="" v-if="posTermForm.isDiscount">
                    <el-row>
                        <el-col :span="16">
                            <el-input v-model="posTermForm.value">
                                <template slot="append">% {{langConfig['ifPaidWithin']}}</template>
                            </el-input>
                        </el-col>
                        <el-col :span="8">
                            <el-input v-model="posTermForm.daysForDiscount">
                                <template slot="append">{{langConfig['days']}}</template>
                            </el-input>

                        </el-col>
                    </el-row>
                </el-form-item>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddPosTerm = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="savePosTerm($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdatePosTerm"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posTermForm" :rules="rules" ref="posTermFormUpdate" label-width="120px"
                     class="posTermForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posTermForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="posTermForm.khName"></el-input>
                </el-form-item>

                <hr>
                <el-radio-group v-model="posTermForm.dueMethod">
                    <el-radio label="Due in fixed number of days">{{langConfig['dueInFixNumber']}}</el-radio>
                    <el-row>
                        <el-col :span="18">
                            <el-form-item prop="days">
                                <el-input v-model.number="posTermForm.days" :disabled="fixDayMethod">
                                    <template slot="append">{{langConfig['days']}}</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>


                    <el-radio :label="langConfig['dayByCertainDay']">Due by certain day of the month</el-radio>
                    <el-row>
                        <el-col :span="18">
                            <el-form-item prop="daysOfMonth">
                                <el-input v-model="posTermForm.daysOfMonth" :disabled="certainDayMethod">
                                    <template slot="append">{{langConfig['daysOfMonth']}}</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="18">
                            <el-form-item label="" prop="daysOfDueDate">
                                <label for="">{{langConfig['dueTheNextMonth']}}</label>
                                <el-input v-model="posTermForm.daysOfDueDate" :disabled="certainDayMethod">
                                    <template slot="append">{{langConfig['daysOfDueDate']}}</template>

                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-radio-group>


                <el-form-item :label="langConfig['applyDiscount']" prop="isDiscount">
                    <el-switch
                            v-model="posTermForm.isDiscount"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                    >
                    </el-switch>
                </el-form-item>

                <el-form-item label="" v-if="posTermForm.isDiscount">
                    <el-row>
                        <el-col :span="16">
                            <el-input v-model="posTermForm.value">
                                <template slot="append">% {{langConfig['ifPaidWithin']}}</template>
                            </el-input>
                        </el-col>
                        <el-col :span="8">
                            <el-input v-model="posTermForm.daysForDiscount">
                                <template slot="append">{{langConfig['days']}}</template>
                            </el-input>

                        </el-col>
                    </el-row>
                </el-form-item>

                <input type="hidden" v-model="posTermForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdatePosTerm = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updatePosTerm">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Pos_TermReact} from "../../collection/posTerm";

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
                Pos_TermReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                newLoading: true,
                posTermData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosTerm: false,
                dialogUpdatePosTerm: false,

                fixDayMethod: true,
                certainDayMethod: true,

                posTermForm: {
                    name: "",
                    khName: "",
                    dueMethod: "",
                    days: "",
                    daysOfMonth: "",
                    daysOfDueDate: "",
                    isDiscount: false,
                    value: "",
                    daysForDiscount: "",
                    _id: ""
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    dueMethod: [{required: true, message: 'Please Choose Method', trigger: 'blur'}],
                },
                // Options
                dueMethodDataOption: [
                    {label: "Due in fixed number of days", value: "Due in fixed number of days"},
                    {label: "Due by certain day of the month", value: "Due by certain day of the month"}
                ],
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
            },
            "posTermForm.dueMethod"(val) {
                if (val === "Due in fixed number of days") {
                    this.fixDayMethod = false;
                    this.certainDayMethod = true;

                    this.posTermForm.daysOfMonth = "";
                    this.posTermForm.daysOfDueDate = "";
                } else if (val === "Due by certain day of the month") {
                    this.fixDayMethod = true;
                    this.certainDayMethod = false;

                    this.posTermForm.days = "";

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
                this.newLoading = true;
                Meteor.call('queryPosTerm', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posTermData = result.content;
                        this.count = result.countPosTerm;
                    }
                    this.isSearching = false;
                    this.newLoading = false;
                });
            }, 300),
            parentPosTermOption() {
                let selector = {};
                Meteor.call('queryParentPosTermOption', selector, this.posTermForm._id, (err, result) => {
                    this.subTermDataOption = result;
                })
            },
            savePosTerm(event) {
                event.preventDefault();

                let vm = this;
                if (vm.posTermForm.dueMethod == "" || vm.posTermForm.dueMethod == undefined) {
                    vm.$message({
                        duration: 1000,
                        message: "Due Method Can't Empty!",
                        type: 'error'
                    });
                    return false;
                }
                this.$refs["posTermFormAdd"].validate((valid) => {
                    if (valid) {
                        vm.posTermForm.rolesArea = Session.get('area');
                        Meteor.call("insertPosTerm", vm.posTermForm, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddPosTerm = false;
                                vm.$refs["posTermFormAdd"].resetFields();
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
            updatePosTerm() {
                let vm = this;
                this.$refs["posTermFormUpdate"].validate((valid) => {
                    if (valid) {
                        vm.posTermForm.rolesArea = Session.get('area');
                        Meteor.call("updatePosTerm", vm.posTermForm, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdatePosTerm = false;
                                vm.$refs["posTermFormUpdate"].resetFields();
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
            removePosTerm(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removePosTerm", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `
                        លុប ${row.code} : ${row.name} បានជោគជ័យ`,
                                type: 'success'
                            });

                            vm.parentPosTermOption();
                        } else {
                            vm.$message({
                                type: 'error',
                                message: 'Delete Fialed'
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
            findPosTermById(doc) {
                let vm = this;
                vm.posTermForm = {};

                Meteor.call("queryPosTermById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.posTermForm._id = result._id;
                        if (result.subTermOf == undefined || result.subTermOf == "") {
                            result.subTermOf = "";
                        }
                        vm.posTermForm = result;
                        this.parentPosTermOption();
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
                this.posTermForm._id = "";
                this.parentPosTermOption();
                if (this.$refs["posTermFormAdd"]) {
                    this.$refs["posTermFormAdd"].resetFields();
                }

                if (this.$refs["posTermFormUpdate"]) {
                    this.$refs["posTermFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.parentPosTermOption();
            this.queryData();
            Meteor.subscribe('Pos_TermReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['term'];
                return data;
            }
        }
    }
</script>