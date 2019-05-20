<template>
    <div class="pos_table">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddPosTable = true,resetForm()">
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
                        :data="posTableData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="code"
                            :label="langConfig['code']"
                            width="120"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="name"
                            :label="langConfig['name']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="tableLocationDoc.name"
                            :label="langConfig['tableLocation']">
                    </el-table-column>
                    <el-table-column
                            prop="description"
                            :label="langConfig['memo']">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removePosTable(scope.$index,scope.row,posTableData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findPosTableById(scope),dialogUpdatePosTable= true"
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
                :visible.sync="dialogAddPosTable"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posTableForm" :rules="rules" ref="posTableFormAdd" label-width="120px"
                     class="posTableForm">
                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posTableForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['tableLocation']" prop="tableLocationId">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="posTableForm.tableLocationId"
                               placeholder="Table Location">
                        <el-option
                                v-for="item in tableLocationDataOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="posTableForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['memo']" prop="description">
                    <el-input type="textarea" v-model="posTableForm.description"></el-input>
                </el-form-item>
                <!--<input type="file" id="my-file"/>-->


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddPosTable = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="savePosTable($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdatePosTable"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posTableForm" :rules="rules" ref="posTableFormUpdate" label-width="120px"
                     class="posTableForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posTableForm.name"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['tableLocation']" prop="tableLocationId">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="posTableForm.tableLocationId"
                               placeholder="Sub Table Of">
                        <el-option
                                v-for="item in tableLocationDataOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="posTableForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['memo']" prop="description">
                    <el-input type="textarea" v-model="posTableForm.description"></el-input>
                </el-form-item>

                <input type="hidden" v-model="posTableForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdatePosTable = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updatePosTable">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
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
    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Pos_TableReact} from "../../collection/posTable";
    import {Images} from "../../collection/fileImages";
    import {Manage_Module} from "../../collection/manageModule";


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
                Pos_TableReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }

        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                newLoading: true,
                dialogImageUrl: "",
                dialogVisible: false,
                posTableData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosTable: false,
                dialogUpdatePosTable: false,

                posTableForm: {
                    name: "",
                    code: "",
                    tableLocationId: "",
                    description: "",
                    _id: ""
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    code: [{required: true, message: 'Please input code', trigger: 'blur'}],
                },
                // Options
                tableLocationDataOption: [],
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
                this.newLoading = true;
                Meteor.call('queryPosTable', {
                    q: val,
                    filter: this.filter,
                    rolesArea: Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posTableData = result.content;
                        this.count = result.countPosTable;
                    }
                    this.isSearching = false;
                    this.newLoading = false;
                });
            }, 300),
            tableLocationOption() {
                let selector = {};
                selector.rolesArea = Session.get("area");
                Meteor.call('queryPosTableLocationOption', selector, (err, result) => {
                    this.tableLocationDataOption = result;
                })
            },
            savePosTable(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["posTableFormAdd"].validate((valid) => {
                        if (valid) {

                            let posTableDoc = {
                                code: vm.posTableForm.code,
                                name: vm.posTableForm.name,
                                tableLocationId: vm.posTableForm.tableLocationId,
                                description: vm.posTableForm.description,
                                rolesArea: Session.get('area')
                            };
                            Meteor.call("insertPosTable", posTableDoc, (err, result) => {
                                if (!err) {
                                    vm.$message({
                                        duration: 1000,
                                        message: `Save Successfully!`,
                                        type: 'success'
                                    });
                                    vm.dialogAddPosTable = false;
                                    vm.tableLocationOption();
                                    vm.$refs["posTableFormAdd"].resetFields();

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
            updatePosTable() {
                let vm = this;
                this.$refs["posTableFormUpdate"].validate((valid) => {
                    if (valid) {


                        let posTableDoc = {
                            _id: vm.posTableForm._id,
                            code: vm.posTableForm.code,
                            name: vm.posTableForm.name,
                            tableLocationId: vm.posTableForm.tableLocationId,
                            description: vm.posTableForm.description,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updatePosTable", posTableDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdatePosTable = false;
                                vm.tableLocationOption();
                                vm.$refs["posTableFormUpdate"].resetFields();
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
            removePosTable(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removePosTable", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `
                        លុប ${row.code} : ${row.name} បានជោគជ័យ`,
                                type: 'success'
                            });

                            vm.tableLocationOption();
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
            findPosTableById(doc) {
                let vm = this;
                vm.posTableForm = {};

                Meteor.call("queryPosTableById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.posTableForm._id = result._id;
                        vm.posTableForm = result;
                        this.tableLocationOption();
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
                this.thumbImgCroppa = null;

                this.posTableForm._id = "";
                this.tableLocationOption();
                if (this.$refs["posTableFormAdd"]) {
                    this.$refs["posTableFormAdd"].resetFields();
                }

                if (this.$refs["posTableFormUpdate"]) {
                    this.$refs["posTableFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.tableLocationOption();
            this.queryData();
            Meteor.subscribe('Pos_TableReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['table'];
                return data;
            }
        }
    }
</script>
