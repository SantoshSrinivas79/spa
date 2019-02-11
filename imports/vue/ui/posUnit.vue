<template>
    <div class="pos_unit">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddPosUnit = true,resetForm()">
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
                        :data="posUnitData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="code"
                            :label="langConfig['code']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="name"
                            :label="langConfig['name']"
                            sortable>
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
                                           @click="removePosUnit(scope.$index,scope.row,posUnitData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findPosUnitById(scope),dialogUpdatePosUnit= true"
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
                :visible.sync="dialogAddPosUnit"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posUnitForm" :rules="rules" ref="posUnitFormAdd" label-width="120px"
                     class="posUnitForm">
                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posUnitForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="posUnitForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['note']" prop="note">
                    <el-input type="textarea" v-model="posUnitForm.note"></el-input>
                </el-form-item>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddPosUnit = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="savePosUnit($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdatePosUnit"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posUnitForm" :rules="rules" ref="posUnitFormUpdate" label-width="120px"
                     class="posUnitForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posUnitForm.name"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="posUnitForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['note']" prop="note">
                    <el-input type="textarea" v-model="posUnitForm.note"></el-input>
                </el-form-item>

                <input type="hidden" v-model="posUnitForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdatePosUnit = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updatePosUnit">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Pos_UnitReact} from "../../collection/posUnit";

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
                Pos_UnitReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                posUnitData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosUnit: false,
                dialogUpdatePosUnit: false,

                posUnitForm: {
                    name: "",
                    code: "",
                    note: "",
                    _id: ""
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    code: [{required: true, message: 'Please input code', trigger: 'blur'}],
                },
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
                Meteor.call('queryPosUnit', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posUnitData = result.content;
                        this.count = result.countPosUnit;
                    }
                    this.isSearching = false;
                });
            }, 300),

            savePosUnit(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["posUnitFormAdd"].validate((valid) => {
                    if (valid) {
                        let posUnitDoc = {
                            code: vm.posUnitForm.code,
                            name: vm.posUnitForm.name,
                            note: vm.posUnitForm.note,
                            rolesArea: Session.get('area')
                        };
                        Meteor.call("insertPosUnit", posUnitDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddPosUnit = false;

                                vm.$refs["posUnitFormAdd"].resetFields();
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
            updatePosUnit() {
                let vm = this;
                this.$refs["posUnitFormUpdate"].validate((valid) => {
                    if (valid) {
                        let posUnitDoc = {
                            _id: vm.posUnitForm._id,
                            code: vm.posUnitForm.code,
                            name: vm.posUnitForm.name,
                            note: vm.posUnitForm.note,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updatePosUnit", posUnitDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdatePosUnit = false;

                                vm.$refs["posUnitFormUpdate"].resetFields();
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
            removePosUnit(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removePosUnit", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `
                        លុប ${row.code} : ${row.name} បានជោគជ័យ`,
                                type: 'success'
                            });


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
            findPosUnitById(doc) {
                let vm = this;
                vm.posUnitForm = {};

                Meteor.call("queryPosUnitById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.posUnitForm._id = result._id;
                        vm.posUnitForm = result;
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
                this.posUnitForm._id = "";
                if (this.$refs["posUnitFormAdd"]) {
                    this.$refs["posUnitFormAdd"].resetFields();
                }

                if (this.$refs["posUnitFormUpdate"]) {
                    this.$refs["posUnitFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            Meteor.subscribe('Pos_UnitReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['unit'];
                return data;
            }
        }
    }
</script>